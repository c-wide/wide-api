import fetch from 'node-fetch';
import semver from 'semver/preload';
import { ReleaseType } from 'semver';
import { stripIndents } from 'common-tags';

type ManifestFetchError = {
  status: 'error';
  error: Error;
};

type ManifestFetchSuccess = {
  status: 'success';
  statusCode: number;
  version: string;
};

type ManifestFetchResult = ManifestFetchSuccess | ManifestFetchError;

const GITHUB_USER = 'c-wide';
const REPO_NAME = 'wide-api';
const DEFAULT_BRANCH = 'main';
const RELEASE_URL = `https://github.com/${GITHUB_USER}/${REPO_NAME}/releases`;

const CURRENT_RESOURCE_NAME = GetCurrentResourceName();

export const messageTemplates = {
  outOfDate: (
    remoteVersion: string,
    localVersion: string,
    diffType: ReleaseType,
  ) => stripIndents`
      ^1===============================================================================^0
        Your version of [^3${REPO_NAME}^0] is currently ^1outdated^0
        The latest version is ^2${remoteVersion}^0, your version is ^1${localVersion}^0
        This is considered a ^3"${diffType.toUpperCase()}"^0 version change.
        You can find the latest version at ^2${RELEASE_URL}^0
      ^1===============================================================================^0
    `,
  prerelease: (remoteVersion: string, localVersion: string) => stripIndents`
      ^1===============================================================================^0
        You may be using a pre-release version of [^3${REPO_NAME}^0] as your version
        is higher than the latest stable GitHub release.
        Your version: ^1${localVersion}^0
        GitHub version: ^2${remoteVersion}^0
      ^1===============================================================================^0
    `,
  badResponseCode: (respCode: number) =>
    `^1There was an error while attempting to check for updates. Code: ${respCode}^0`,
  genericError: (e: Error) =>
    stripIndents`
        ^1===============================================================================^0
          An unexpected error occured in [^3${REPO_NAME}^0] while checking for updates.
          If you see this message consistently, please file a report with the given information.
          Error: ^1${e.message}^0
        ^1===============================================================================^0
      `,
};

function getVersionFromRawManifest(manifestContent: string): string {
  return manifestContent.match(/(?<=version.*)\d\.\d\.\d/gm)?.[0] ?? '0.0.0';
}

function getVersionFromMetadata(): string {
  return GetResourceMetadata(CURRENT_RESOURCE_NAME, 'version', 0);
}

async function fetchManifestVersionFromGitHub(): Promise<ManifestFetchResult> {
  try {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${DEFAULT_BRANCH}/fxmanifest.lua`,
    );

    const textConversion = await rawRes.text();

    return {
      status: 'success',
      version: getVersionFromRawManifest(textConversion),
      statusCode: rawRes.status,
    };
  } catch (error) {
    return { status: 'error', error };
  }
}

export async function compareResourceVersion() {
  const localVersion = getVersionFromMetadata();

  const ghResult = await fetchManifestVersionFromGitHub();

  if (ghResult.status === 'error') {
    console.log(messageTemplates.genericError(ghResult.error));
    return;
  }

  if (!ghResult.statusCode || !ghResult.version) {
    console.log(
      messageTemplates.genericError(
        new Error(
          'The version or response status code is undefined after error checks',
        ),
      ),
    );

    return;
  }

  if (ghResult.statusCode < 200 || ghResult.statusCode > 200) {
    console.log(messageTemplates.badResponseCode(ghResult.statusCode));
    return;
  }

  if (semver.lt(localVersion, ghResult.version)) {
    const verDiffType = semver.diff(localVersion, ghResult.version);
    if (!verDiffType) return;

    console.log(
      messageTemplates.outOfDate(ghResult.version, localVersion, verDiffType),
    );

    return;
  }

  if (semver.gt(localVersion, ghResult.version)) {
    console.log(messageTemplates.prerelease(ghResult.version, localVersion));
    return;
  }
}

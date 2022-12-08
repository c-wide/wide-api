const fs = require('fs');
const path = require('path');

const gitHubUser = 'c-wide';
const repoName = 'wide-api';
const releaseUrl = `https://github.com/${gitHubUser}/${repoName}/releases`;

const currentResourceName = GetCurrentResourceName();

// I hate that this file is necessary :(

// This isn't included in releases as its only purpose
// is to detect if the resource has been started without
// building the project.

on('onResourceStart', async (resourceName) => {
  if (resourceName !== currentResourceName) return;

  const currentResourcePath = GetResourcePath(currentResourceName);
  const buildPath = path.join(currentResourcePath, 'dist');

  try {
    await fs.promises.access(buildPath);
  } catch {
    console.log(`
    ^1==================================================^0
      [^3${repoName.toUpperCase()}^0] WAS UNABLE TO LOCATE BUILT FILES!

      This resource will have ^1NO^0 functionality without built files.
      
      This error is most likely caused by downloading the source code instead of the release.

      You can find the release version at ^2${releaseUrl}^0
    ^1==================================================^0
  `);
  }
});

import { registerResourcePath } from '~/registerResourcePath';
import { logger } from '~/logger';
import { ResponseStatus } from '~/response';

function checkPerms() {
  const resName = GetCurrentResourceName();
  const reqCmds = ['ensure', 'start', 'stop'];

  let missingCmds: Array<string> = [];
  reqCmds.forEach((cmd) => {
    if (!IsPrincipalAceAllowed(`resource.${resName}`, `command.${cmd}`)) {
      missingCmds = [...missingCmds, cmd];
    }
  });

  return missingCmds;
}

function generateResourceList() {
  const resourceList = new Map<string, boolean>();

  const resCount = GetNumResources();
  for (let i = 0; i < resCount; i++) {
    const resName = GetResourceByFindIndex(i);
    resourceList.set(resName, GetResourceState(resName) === 'started');
  }

  return resourceList;
}

export function createEnsureResourcePath() {
  let resourceList = generateResourceList();

  registerResourcePath<{ resourceName: string }>(
    'ensure-resource',
    ({ resourceName }) => {
      if (resourceName === undefined || resourceName.length < 1) {
        return {
          responseCode: 400,
          status: ResponseStatus.Fail,
          data: {
            resourceName: 'Resource name not provided.',
          },
        };
      }

      if (resourceName === GetCurrentResourceName()) {
        return {
          responseCode: 400,
          status: ResponseStatus.Fail,
          data: {
            resourceName: "Resources can't restart themselves.",
          },
        };
      }

      if (GetNumResources() !== resourceList.size) {
        resourceList = generateResourceList();
      }

      if (!resourceList.has(resourceName)) {
        return {
          responseCode: 400,
          status: ResponseStatus.Fail,
          data: {
            resourceName: `Resource '${resourceName}' does not exist.`,
          },
        };
      }

      const missingPerms = checkPerms();
      if (missingPerms.length > 0) {
        return {
          responseCode: 500,
          status: ResponseStatus.Fail,
          data: {
            missingPermissions: `Resource '${resourceName}' does not have permission to use the following command${
              missingPerms.length > 1 ? 's' : ''
            }: [${missingPerms.join(', ')}].`,
          },
        };
      }

      logger.info(`Attempting to restart the ${resourceName} resource.`);

      ExecuteCommand(`ensure ${resourceName}`);
    },
  );
}

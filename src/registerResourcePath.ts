import express from 'express';
import { logger } from '~/logger';
import {
  generateApiResponse,
  ResponseStatus,
  type ApiResponse,
} from '~/response';

export const dynamicRouteRouter = express.Router();

const resourcePathMap = new Map<
  string,
  Record<
    string,
    (
      data: Record<string, unknown>,
    ) => Promise<ApiResponse | void> | ApiResponse | void
  >
>();

function handlePathFuncResult(
  data: ApiResponse | void,
  res: express.Response,
  resourceName: string,
  path: string,
) {
  if (!data) {
    res.json(generateApiResponse(200, ResponseStatus.Success));
    return;
  }

  try {
    switch (data.status) {
      case ResponseStatus.Success:
        res
          .status(data.responseCode)
          .json(generateApiResponse(data.responseCode, data.status, data.data));

        break;
      case ResponseStatus.Fail:
        res
          .status(data.responseCode)
          .json(
            generateApiResponse(
              data.responseCode,
              data.status,
              data.data as Record<string, string>,
            ),
          );

        break;
      case ResponseStatus.Error:
        res
          .status(data.responseCode)
          .json(
            generateApiResponse(data.responseCode, data.status, data.message),
          );

        break;
    }
  } catch (err) {
    const response = generateApiResponse(
      500,
      ResponseStatus.Error,
      `Endpoint '${resourceName}/${path}' tried to send data that wasn't JSON compatible.`,
    );

    res.status(response.responseCode).send(response);

    logger.error(response.message);

    return;
  }
}

export function registerResourcePath<
  T extends Record<string, unknown> = Record<string, unknown>,
  U = unknown,
>(
  path: string,
  handler: (data: T) => Promise<ApiResponse<U> | void> | ApiResponse<U> | void,
) {
  const resourceName = GetInvokingResource() || GetCurrentResourceName();

  if (!resourcePathMap.has(resourceName)) {
    resourcePathMap.set(resourceName, { [path]: handler });
  } else {
    const resourcePaths = resourcePathMap.get(resourceName);
    if (!resourcePaths) return;

    if (resourcePaths[path]) {
      logger.info('Overwriting existing path...');
    }

    resourcePathMap.set(resourceName, { ...resourcePaths, [path]: handler });
  }

  dynamicRouteRouter.get(`/${resourceName}/${path}`, (req, res) => {
    if (
      !resourcePathMap.has(resourceName) ||
      !resourcePathMap.get(resourceName)?.[path]
    ) {
      const response = generateApiResponse(
        500,
        ResponseStatus.Error,
        `No callback registered for endpoint '${resourceName}/${path}'`,
      );

      res.status(response.responseCode).send(response);

      logger.error(response.message);

      return;
    }

    const pathFunc = resourcePathMap.get(resourceName)?.[path];
    if (!pathFunc) return;

    try {
      const result = pathFunc(req.query);

      if (result instanceof Promise) {
        return result.then((data) => {
          handlePathFuncResult(data, res, resourceName, path);
        });
      }

      handlePathFuncResult(result, res, resourceName, path);

      return;
    } catch (err) {
      const response = generateApiResponse(
        500,
        ResponseStatus.Error,
        `Callback is invalid for endpoint '${resourceName}/${path}', the target resource was most likely stopped.`,
      );

      res.status(response.responseCode).send(response);

      logger.error(response.message);

      return;
    }
  });

  logger.info(`Path '${path}' registered for resource '${resourceName}'.`);
}

global.exports('registerResourcePath', registerResourcePath);

on('onResourceStop', (resourceName: string) => {
  if (resourceName === GetCurrentResourceName()) return;

  if (resourcePathMap.has(resourceName)) {
    const pathData = resourcePathMap.get(resourceName);
    if (!pathData) return;

    const paths = Object.keys(pathData).map(
      (path) => `/${resourceName}/${path}`,
    );

    dynamicRouteRouter.stack = dynamicRouteRouter.stack.filter(
      (route) => !paths.includes(route.route?.path ?? ''),
    );

    resourcePathMap.delete(resourceName);

    logger.info(`Resource '${resourceName}' was stopped, removed all paths.`);
  }
});

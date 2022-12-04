import express from 'express';
import { logger } from '~/logger';
import { generateApiResponse, ResponseStatus } from '~/response';
import type { ApiResponse } from '~/response';

export const dynamicRouteRouter = express.Router();

const resourcePathMap = new Map<
  string,
  {
    [key: string]: (
      data: Record<string, unknown>,
    ) => Promise<ApiResponse | void> | ApiResponse | void;
  }
>();

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

  dynamicRouteRouter.get(`/${resourceName}/${path}`, async (req, res) => {
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

    let data: Awaited<ReturnType<typeof pathFunc>>;

    try {
      data = await pathFunc(req.query);
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

    if (!data) {
      res.json(generateApiResponse(200, ResponseStatus.Success));
      return;
    }

    try {
      switch (data.status) {
        case ResponseStatus.Success:
          res.json(
            generateApiResponse(data.responseCode, data.status, data.data),
          );

          break;
        case ResponseStatus.Fail:
          res.json(
            generateApiResponse(
              data.responseCode,
              data.status,
              data.data as Record<string, string>,
            ),
          );

          break;
        case ResponseStatus.Error:
          res.json(
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
  });

  logger.info(`Path '${path}' registered for resource '${resourceName}'.`);
}

global.exports('registerResourcePath', registerResourcePath);

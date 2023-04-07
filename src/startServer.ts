import express from 'express';
import cors from 'cors';
import { dynamicRouteRouter } from '~/registerResourcePath';
import { generateApiResponse, ResponseStatus } from '~/response';
import { logger } from '~/logger';
import { getConfig } from '~/config';
import { registerDefaultPaths } from '~/registerDefaultPaths';

const app = express();

export function startServer() {
  const { enableCors, accessKeys, port } = getConfig().server;

  if (enableCors) {
    app.use(cors());
    logger.info('CORS is enabled for all requests.');
  }

  if (accessKeys.length > 0) {
    app.use((req, res, next) => {
      if (!req.headers || !req.headers['x-api-key']) {
        const response = generateApiResponse(
          400,
          ResponseStatus.Error,
          'x-api-key header was not provided.',
        );

        res.status(response.responseCode).send(response);

        return;
      }

      if (!accessKeys.some(({ key }) => key === req.headers['x-api-key'])) {
        const response = generateApiResponse(
          401,
          ResponseStatus.Error,
          'Unauthorized user.',
        );

        res.status(response.responseCode).send(response);

        return;
      }

      next();
    });
  } else {
    logger.info(
      'No access keys provided. The server is running with unrestricted access.',
    );
  }

  app.use(dynamicRouteRouter);

  app.use((_, res) => {
    const response = generateApiResponse(
      404,
      ResponseStatus.Error,
      'Endpoint does not exist.',
    );

    res.status(response.responseCode).send(response);
  });

  app.listen(port, () => {
    logger.info(`API listening on http://127.0.0.1:${port}/`);
    registerDefaultPaths();
    emit(`${GetCurrentResourceName()}:serverStarted`);
  });
}

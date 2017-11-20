
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import nodeEnvConfiguration from 'node-env-configuration';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import setupFixtures from './lib/setupFixtures';
import configDefaults from '../config/defaults.json';

const config = nodeEnvConfiguration({
  defaults: configDefaults,
  prefix: 'api',
});

const app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
  exposedHeaders: config.corsHeaders,
}));

app.use(bodyParser.json({
  limit: config.bodyLimit,
}));

const jsonErrorHandler = (err, req, res, next) => {
  // console.error(err.stack)
  if (!err) return next();
  return res.json({
    error: {
      message: err.message,
    },
  });
};

const initApp = async () => {
  const db = await initializeDb({ config });
  await setupFixtures();
  app.use(middleware({ config, db }));
  app.use('/', api({ config, db }));
  app.use(jsonErrorHandler);
  return app;
};

const bindApp = async (appToBind) => {
  appToBind.server.listen(config.bind.port, config.bind.host, () => {
    console.log(`Started on port ${appToBind.server.address().port}`);
  });
};

export {
  app,
  initApp,
  bindApp,
  jsonErrorHandler,
};

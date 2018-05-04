const database = require('./database');
const setupFixtures = require('../scripts/setup-fixtures');
const ensureConfig = require('../scripts/ensure-config');
const { initialize: initializeEmails } = require('./lib/emails');
const app = require('./app');
const config = require('config');

const PORT = config.get('bind.port');
const HOST = config.get('bind.host');

module.exports = (async () => {
  ensureConfig();

  await initializeEmails();
  await database();
  await setupFixtures();

  app.listen(PORT, HOST, () => {
    console.log(`Started on port //${HOST}:${PORT}`);
  });

  return app;
})();

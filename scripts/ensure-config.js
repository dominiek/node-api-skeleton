const config = require('config');

function getChangeMeKeys(data, k = '') {
  const result = [];
  for (var i in data) {
    var rest = k.length ? '.' + i : i;

    if (typeof data[i] == 'object') {
      if (!Array.isArray(data[i])) {
        result.push(...getChangeMeKeys(data[i], k + rest));
      }
    } else if (data[i] === '[change me]') {
      result.push(k + rest);
    }
  }
  return result;
}

const ensureConfig = () => {
  const keys = getChangeMeKeys(config.util.toObject(config));

  if (keys.length) {
    console.error('The following configuration is required to be set before starting server in production environment');
    console.error('');
    console.error(keys);
    console.error('');
    console.error('Either updated config/prod.json or configure enviroments variables with valid values');
    console.error('');
    console.error('Shutting down');
    console.error('');
    process.exit(1);
  }
};

module.exports = ensureConfig;

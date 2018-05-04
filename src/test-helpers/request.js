const request = require('supertest'); //eslint-disable-line
const app = require('../app');
const qs = require('querystring');
const tokens = require('../lib/tokens');

module.exports = async function handleRequest(httpMethod, url, bodyOrQuery = {}, options = {}) {
  const headers = {};
  if (options.user) {
    headers.Authorization = `Bearer ${tokens.createUserToken(options.user)}`;
  }

  if (httpMethod === 'POST') {
    return request(app.callback())
      .post(url)
      .set(headers)
      .send({ ...bodyOrQuery });
  } else if (httpMethod === 'PATCH') {
    return request(app.callback())
      .patch(url)
      .set(headers)
      .send({ ...bodyOrQuery });
  } else if (httpMethod === 'DELETE') {
    return request(app.callback())
      .del(url)
      .set(headers)
      .send({ ...bodyOrQuery });
  } else if (httpMethod === 'GET') {
    return request(app.callback())
      .get(`${url}?${qs.stringify({ ...bodyOrQuery })}`)
      .set(headers);
  }

  if (httpMethod === 'PUT') {
    throw Error('Use PATCH instead of PUT the api support PATCH not PUT');
  }
  throw Error(`Method not support ${httpMethod} by handleRequest`);
};

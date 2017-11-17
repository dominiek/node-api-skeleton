
const request = require('supertest')
import { app } from '../../../src'
import api from '../index'

app.use('/', api({}));

describe('Test the root path', () => {

  test('It should have a valid index response', (done) => {
    request(app).get('/').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.body.protocolVersion).toBe(1);
      done();
    });
  });

});

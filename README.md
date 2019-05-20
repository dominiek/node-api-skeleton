
Note: This has been moved to https://github.com/dominiek/sharkbone

## Directory Structure

* `package.json` - Configure dependencies
* `config/defaults.json` - Default configuration, all values can be controlled via env vars
* `config/custom-environment-variables.json` - Overwrite configuration with defined environment variables
* `src/*/__tests__` - Unit tests
* `src/index.js` - Entrypoint for running and binding API
* `src/lib` - Library files like utils etc
* `src/v1` - Routes
* `src/middlewares` - Middleware libs
* `src/models` - Models for ORM (Mongoose)
* `src/app.js` - Entrypoint into API (does not bind, so can be used in unit tests)
* `src/index.js` - Launch script for the API)
* `emails/dist` - Prebuild emails templates (dont modify => modify emails/src and run `npm run emails`)
* `emails/src` - Emails templates

## Install Dependencies

```
npm install
```

## Testing & Linting

```
npm test
```

## Running in Development

Code reload using nodemon:

```
npm run dev
```

## Configuration

All values in `config/defaults.json` can be overwritten using environment variables by updating
custom-environnment-variables.json see
[node-config](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables)

* `API_BIND_HOST` - Host to bind to, defaults to `"0.0.0.0"`
* `API_BIND_PORT` - Port to bind to, defaults to `3005`
* `API_MONGO_URI` - MongoDB URI to connect to, defaults to `mongodb://localhost/skeleton_prod`
* `API_JWT_SECRET` - JWT secret for authentication, defaults to `[change me]`
* `API_ADMIN_EMAIL` - Default root admin user `admin@skeleton.ai`
* `API_ADMIN_PASSWORD` - Default root admin password `[change me]`
* `API_APP_NAME` - Default `Skeleton` to used in emails
* `API_APP_URL` - URL for app defaults to `http://localhost:3001`
* `API_APP_ADMIN_URL` - URL for admin app defaults to `http://localhost:3002`
* `API_POSTMARK_FROM` - Reply email address `no-reply@skeleton.ai`
* `API_POSTMARK_APIKEY` - APIKey for Postmark `[change me]`

## Building the Container

```
docker build -t node-api-skeleton .
```

## Todo

* [ ] Email template improvements
* [ ] Emails tests
* [ ] Admin API

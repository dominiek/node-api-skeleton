FROM alpine:3.6

ENV NODE_ENV production

# Update & install required packages
RUN apk add --update nodejs bash git yarn

# Install app dependencies
COPY package.json /api/package.json
RUN cd /api; yarn install

# Copy app source
COPY . /api

# Set work directory to /api
WORKDIR /api

# set your port
ENV PORT 8080

# expose the port to outside world
EXPOSE  8080

RUN yarn build

# start command as per package.json
CMD ["yarn", "start"]

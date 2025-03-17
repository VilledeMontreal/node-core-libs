# We need bookworm for running MongoDB memory server, but unfortunately this doesn't work on a MacBook Mx CPU!
FROM node:lts-bookworm

ENV NX_DAEMON=false

WORKDIR /mtl/app

COPY . /mtl/app

RUN npm ci --legacy-peer-deps

RUN npm run lint

# Note that for the moment, tests will fail for node-mongo lib on Mac Book Mx CPU, because there is no mongodb version to download.
RUN npm test

# Uncomment this line to only test the node-mongo lib
# RUN cd packages/node-mongo && npm t

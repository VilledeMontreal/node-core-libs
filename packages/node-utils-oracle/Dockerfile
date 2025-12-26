#==========================================
# Starts from our custom Node-Oracle image!
#==========================================
FROM acrvdm.azurecr.io/core/core-oracle-nodejs-img:8.0.0

LABEL maintainer="Ville De Montréal"
ARG ENV=unknown
ARG GIT_COMMIT=unknown

# GIT label of the packaged code
LABEL GIT_COMMIT=${GIT_COMMIT}

# Work dir
WORKDIR /mtl/app

USER root

# Copies the project files
COPY . /mtl/app

# The "npm link oracledb @types/oracledb" line is
# very important so the Oracle libraries installed in the
# base image are used!
# but this doesn't work any more with the latest vdmtl/core-oracle-nodejs-img
# and I had to disable the link command.
# ERROR: /mtl/app/node_modules/@types/oracledb -> /usr/local/lib/node_modules/@types/oracledb
# ERROR: npm ERR! Link target resolves to the same directory as link source: /usr/local/lib/node_modules/oracledb
# DISABLED: npm link oracledb @types/oracledb && \
# Apparently. this won't prevent the unit tests from running and since 
# we are building a library, we don't really need a solid Docker image.

RUN npm install --only=production --no-cache && \
  cp -a /mtl/app/node_modules /tmp/node_modules && \
  npm install --no-cache --no-optional && \
  npm run compile  && \
  rm -rf /mtl/app/node_modules && \
  mv /tmp/node_modules /mtl/app/node_modules


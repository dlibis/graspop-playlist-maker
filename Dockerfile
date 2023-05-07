# Client stage
FROM node:18-alpine AS client-builder

# Set the working directory to /app
WORKDIR /app

# Copy the client package.json and lock file
COPY client/package*.json client/yarn.lock ./client/

WORKDIR /app/client

# Install app dependencies for the client
RUN yarn install --production

# Copy the rest of the client application code
COPY client/ ./

# Build the Next.js application
RUN yarn build:prod


# Server stage
FROM node:18-alpine

#ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# Set the working directory to /app
WORKDIR /app

RUN mkdir /client && cd /client

# Copy production dependencies for the server
COPY --from=client-builder app/client .

#need to check why this doesnt work on the first attemp
RUN yarn build:prod

WORKDIR /app

# Copy the server package.json and lock file
COPY server/package*.json server/yarn.lock ./server/

# Install app dependencies for the server
WORKDIR /app/server

RUN yarn install --production

# Copy the rest of the server application code
COPY server/ ./

# Expose the server port
EXPOSE 5000

# Start the server
CMD [ "yarn","start:prod" ]
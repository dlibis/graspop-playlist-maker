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
FROM node:18-alpine as server-builder


WORKDIR /app

COPY --from=client-builder app/client/node_modules ./client/node_modules
# Copy the server package.json and lock file
COPY server/package*.json server/yarn.lock ./server/

# Install app dependencies for the server
WORKDIR /app/server

RUN yarn

# Copy the rest of the server application code
COPY server/ ./

RUN yarn build


FROM node:18-alpine

WORKDIR /app

# Copy production dependencies for the server
COPY --from=client-builder app/client ./client

COPY --from=server-builder app/server ./server

COPY --from=server-builder app/server/dist ./server/dist

# Expose the server port
EXPOSE 5000

WORKDIR /app/server

# Start the server
CMD [ "yarn","start:prod" ]
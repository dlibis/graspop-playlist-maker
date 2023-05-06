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
RUN yarn build


# Server stage
FROM node:18-alpine

#ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# Set the working directory to /app
WORKDIR /app

# Copy production dependencies for the server
COPY --from=client-builder /app/client/node_modules ./client/node_modules

# Copy built client files from the client stage
COPY --from=client-builder /app/client/.next ./client/.next

# Copy the server package.json and lock file
COPY server/package*.json server/yarn.lock ./server/

# Install app dependencies for the server
WORKDIR /app/server

RUN yarn install --production

# RUN yarn add nodemon

# RUN yarn add ts-node --dev

# Copy the rest of the server application code
COPY server/ ./

# WORKDIR /app/server/dist
# Expose the server port
EXPOSE 5000

# Start the server
CMD [ "yarn","start:prod" ]
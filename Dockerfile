# Client stage
FROM node:18-alpine AS client-builder

# Set the working directory to /app
WORKDIR /app

# Copy the client package.json and lock file
COPY client/package*.json client/yarn.lock ./client/

# Install app dependencies for the client
RUN cd client && yarn install --production

# Copy the rest of the client application code
COPY client/ ./client

# Build the Next.js application
RUN yarn build


# Server stage
FROM node:18-alpine

# Set the working directory to /app
WORKDIR /app

# Copy production dependencies for the server
COPY --from=client-builder /app/node_modules ./node_modules

# Copy built client files from the client stage
COPY --from=client-builder /app/.next ./.next

# Copy the server package.json and lock file
COPY server/package*.json server/yarn.lock ./

# Install app dependencies for the server
RUN yarn install --production

# Copy the rest of the server application code
COPY server/ .
# Expose the server port
EXPOSE 5000

# Start the server
CMD [ "yarn", "start" ]
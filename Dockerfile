# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including adapter-node
RUN npm ci && npm install -D @sveltejs/adapter-node

# Copy application files
COPY . .

# Update svelte config to use adapter-node
RUN echo "import adapter from '@sveltejs/adapter-node';" > svelte.config.js && \
    echo "import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';" >> svelte.config.js && \
    echo "" >> svelte.config.js && \
    echo "const config = {" >> svelte.config.js && \
    echo "  preprocess: vitePreprocess()," >> svelte.config.js && \
    echo "  kit: {" >> svelte.config.js && \
    echo "    adapter: adapter()," >> svelte.config.js && \
    echo "    csrf: {" >> svelte.config.js && \
    echo "      checkOrigin: false" >> svelte.config.js && \
    echo "    }" >> svelte.config.js && \
    echo "  }" >> svelte.config.js && \
    echo "};" >> svelte.config.js && \
    echo "" >> svelte.config.js && \
    echo "export default config;" >> svelte.config.js

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --production

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/build build/
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma node_modules/.prisma/

# Copy static files and other necessary files
COPY --chown=nodejs:nodejs static ./static
COPY --chown=nodejs:nodejs package.json ./

# Create directory for SQLite database
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "build"]
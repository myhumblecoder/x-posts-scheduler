FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies if package.json is present. This Dockerfile is a template — adjust as needed for your production startup.
COPY package*.json ./
RUN if [ -f package.json ]; then npm ci --only=production; fi

# Copy source
COPY . /app

# Expose default port used by the backend prototype
EXPOSE 3000

# Default command: adjust to the real server entrypoint in your project (example: backend/src/server.js)
CMD ["node", "backend/src/index.js"]

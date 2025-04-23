# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy necessary files from the build stage
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json* .
COPY --from=build /app/next.config.ts .
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next

# Install only production dependencies
RUN npm ci --production

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start Next.js
CMD ["npm", "start"]

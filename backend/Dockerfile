FROM node:18-alpine

# Install build dependencies for canvas and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Install PM2 globally
RUN npm install -g pm2

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create logs directory for PM2
RUN mkdir -p logs

# Expose backend port
EXPOSE 5000

# Use PM2 ecosystem file to manage the Node.js process
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

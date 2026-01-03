FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy source
COPY . .

# Build React app
RUN npm run build

# Install static file server
RUN npm install -g serve

EXPOSE 5173

# Serve build output
CMD ["serve", "-s", "dist", "-l", "5173"]
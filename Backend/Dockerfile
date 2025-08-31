# Start with a Node.js base image that includes build tools
FROM node:18-slim

# Install the system dependencies required by the 'canvas' package
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the port your app will run on
EXPOSE 10000

# The command to start the application
CMD ["node", "app.js"]
FROM node:22.11.0

# Clone the repository
RUN git clone https://github.com/rudhachu/testw.git /rudhra

# Set working directory
WORKDIR /rudhra

# Install a specific version of npm locally (inside the project directory)
RUN npm install -g npm@10.9.1
# Install dependencies
RUN npm install


# Expose the port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]

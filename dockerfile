# Single stage: for simple apps without a build process
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install

# Copy the source code directly
COPY . ./

# Set the CMD to your Lambda function handler
CMD ["handler.handler"]
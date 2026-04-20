FROM node:20-alpine

WORKDIR /app

COPY frontend-3d/package.json ./
RUN npm install

COPY frontend-3d ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


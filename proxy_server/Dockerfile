FROM node:12-alpine
WORKDIR /code

RUN apk add --no-cache git

COPY package.json .
RUN npm install --quiet

COPY . .
RUN npm run build

CMD ["npm", "run", "start"]

EXPOSE 80
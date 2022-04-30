FROM node:12-alpine
WORKDIR /code

RUN apk add --no-cache git

COPY package.json .
RUN npm install --quiet

COPY . .
RUN npm run build

# RUN mv -f ./src/config-prod.ts ./src/config.ts 
CMD ["npm", "run", "prod"]

EXPOSE 80
FROM alpine
WORKDIR /code

RUN apk add --update nodejs npm
RUN apk add --no-cache bash

RUN echo $'\
echo "Starting API..."\n\
npm run start:dev:reset \n'\

COPY package.json .
RUN npm install --quiet

COPY . .


EXPOSE 2053
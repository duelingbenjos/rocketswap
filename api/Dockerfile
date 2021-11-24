FROM alpine
WORKDIR /code

RUN apk add --update nodejs npm
RUN apk add --no-cache bash

RUN echo $'\
npm run dev \n'\
> entypoint.sh

COPY package.json .
RUN npm install --quiet

COPY . .

CMD ["sh", "entypoint.sh"]

EXPOSE 2053
FROM alpine
WORKDIR /code

RUN apk add --update nodejs npm
RUN apk add --no-cache bash

RUN echo $'\
if [ "$ROCKETSWAP_DB_FIRST_RUN" = "true" ] \n\
then\n\
    echo "Building Database..." \n\
fi \n\
echo "Starting API..."\n\
npm run dev \n'\
> entypoint.sh

COPY package.json .
RUN npm install --quiet

COPY . .

CMD ["sh", "entypoint.sh"]

EXPOSE 3002
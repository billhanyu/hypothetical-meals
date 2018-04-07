FROM node:8

ADD ./ ./

RUN rm -rf ./node_modules

RUN npm i

WORKDIR ./frontend

RUN rm -rf ./node_modules

RUN npm i

RUN npm run build

WORKDIR ../

RUN npm run build

RUN chmod +x ./wait-for-it.sh

CMD node ./build/server.js

EXPOSE 1717

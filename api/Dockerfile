FROM node:latest

ADD . /opt/api

WORKDIR /opt/api
RUN yarn install

EXPOSE 8080

CMD [ "yarn", "start" ]
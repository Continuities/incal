FROM node:latest

ADD . /opt/app

WORKDIR /opt/app
RUN yarn install

EXPOSE 3000

CMD [ "yarn", "start" ]
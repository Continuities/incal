FROM node:latest
COPY ./sleep/app /opt/app

WORKDIR /opt/app
RUN yarn install --production

EXPOSE 3000

CMD [ "yarn", "start" ]


authWeb
=

An oAuth2 server using directed graphs for the decentralisation of authority.

Dependencies
-
1. [Docker](https://www.docker.com/)
2. [docker-compose](https://docs.docker.com/compose/install/)
3. [NodeJS](https://nodejs.org/)
4. [yarn](https://yarnpkg.com/)

Deploy steps
-
> TBD: deploying with optional applications
1. Clone this repo
2. `yarn install`
3. Modify environment variables
    1. API variables in `./docker-compose.yml`
    2. Frontend config in `./app/.env`
    3. DKIM key in `./dkim/domain.key`
4. Set up DMARC, DKIM, and reverse DNS records for your domain
5. `yarn prod:start` will build and start the application

Development steps
-
1. Clone the repo
2. `yarn install`
3. `yarn start` to start application in development mode
4. Use `yarn start:app <appname>` if you want to work on an optional application

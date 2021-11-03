authWeb
=

An oAuth2 server using directed graphs for the decentralisation of authority.

Deploy steps
-
1. Clone this repo
2. `yarn install`
3. Modify environment variables
    1. API variables in `./docker-compose.yml`
    2. Frontend config in `./app/.env`
    3. DKIM key in `./dkim/domain.key`
4. Set up DMARC, DKIM, and reverse DNS records for your domain
5. `yarn prod:start` will build and start the application
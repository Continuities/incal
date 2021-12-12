/**
 * Main entry point for backend API
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import OAuthServer from 'express-oauth-server';
import AuthRouter from './router/auth.js';
import ApiRouter from './router/api.js';
import authModel from './oauth2-model.js';
import { authorise } from './service/sponsorship.js';
import { refreshUserMiddleware } from './service/user.js';

const port = parseInt(process.env.PORT);
if (!port || isNaN(port)) {
  throw 'No PORT specified'
}

if (!process.env.PUBLIC_PATH) {
  throw 'PUBLIC_PATH not set';
}

const app:any = express();

const oauth = new OAuthServer({ model: authModel });
app.use(cors());
app.use(express.json({ type: [ 'application/json' ] }));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'nyanyanyanyan' }));
app.use(refreshUserMiddleware);

app.use('/public', express.static(String(process.env.PUBLIC_PATH)));

app.use('/oauth', AuthRouter(oauth));

app.use('/', 
  (req, res, next) => { console.log(req.headers); next(); },
  oauth.authenticate({ scope: 'user_info:read' }),
  authorise,
  ApiRouter());

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;
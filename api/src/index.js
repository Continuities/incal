/**
 * Main entry point for backend API
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';
import session from 'express-session';
import OAuthServer from 'express-oauth-server';
import AuthRouter from './router/auth.js';
import authModel from './oauth2-model.js';

const port = parseInt(process.env.PORT);
if (!port || isNaN(port)) {
  throw 'No PORT specified'
}

const app = express();

const somethingAsync = async () => 'FOOOO';

const oauth = new OAuthServer({ model: authModel });

app.use(express.json({ type: [ 'application/json' ] }));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'nyanyanyanyan' }));
app.use('/oauth', AuthRouter(oauth));

app.get('/', oauth.authorize(), async (req, res) => {
  res.status(200).json({ msg: 'TODO' });
});

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;
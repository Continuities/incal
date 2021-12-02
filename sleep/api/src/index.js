
/**
 * Main entry point for backend API
 * @flow
 **/

import express from 'express';
import cors from 'cors';

const port = parseInt(process.env.PORT);
if (!port || isNaN(port)) {
  throw 'No PORT specified'
}

const app:any = express();

app.use(cors());
app.use(express.json({ type: [ 'application/json' ] }));
app.use(express.urlencoded({ extended: true }));

app.use('/', async (req, res) => res.send('Hello from sleep'));

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;


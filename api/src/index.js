/**
 * Main entry point for backend API
 * @author mtownsend
 * @since October 05, 2021
 * @flow
 **/

import express from 'express';


const port = parseInt(process.env.PORT);
if (!port || isNaN(port)) {
  throw 'No PORT specified'
}

const app = express();
app.use(express.urlencoded());
app.use(express.json({
  type: [ 'application/json' ]
}));

app.get('/', async (req, res) => {
  res.status(200).json({ msg: 'TODO' });
});

app.listen(port, () => console.log(`API started on port ${port}`));

export default app;
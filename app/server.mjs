/**
 * Basic static server for production builds
 * @author mtownsend
 * @since Oct 7, 2021
 **/

import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

app.use(express.static("dist"));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, () => console.log(`App hosted on port ${port}`));
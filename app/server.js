/**
 * Basic static server for production builds
 * @author mtownsend
 * @since Oct 7, 2021
 **/

import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("dist"));

app.listen(port, () => console.log(`App hosted on port ${port}`));
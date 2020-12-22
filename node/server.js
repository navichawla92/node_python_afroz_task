const express = require('express');
const bodyParser = require('body-parser');
const app  = express();
const dotenv = require('dotenv');
const v1Routes = require('./routers/v1/log')

dotenv.config();

const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/v1', v1Routes)
app.listen(port, () => {  console.log('We are live on ' + port);});

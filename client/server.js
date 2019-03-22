const express = require('express');
const compression = require('compression');
path = require('path');

const CONTEXT = '/';
const PORT = 4200;

const app = express();

app.use(compression());
app.use(CONTEXT, express.static(__dirname + '/dist'));
app.use('/', express.static(__dirname + '/dist'));

const renderIndex = (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist/index.html'));
};
app.get('/*', renderIndex);

app.listen(PORT, () =>
  console.log(`App running on localhost:${PORT}${CONTEXT}`)
);

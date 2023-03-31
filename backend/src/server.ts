import express from 'express';
import path from 'path';
import app from './app';

const port = process.env.PORT || 8080;

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}...`));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Anything that doesn't match above (the beginning slash ('/') in the string is important!)
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../../frontend/build/index.html`));
});

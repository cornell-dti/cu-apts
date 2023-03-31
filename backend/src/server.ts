import express from 'express';
import path from 'path';
import app from './app';

const port = process.env.PORT || 8080;

app.use(express.static('../../frontend/build'));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}...`));

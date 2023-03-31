import app from './app';

const port = process.env.PORT || 8080;

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}...`));

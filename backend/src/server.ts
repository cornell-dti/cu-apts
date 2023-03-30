import path from 'path';
import app from './app';

function setup() {
  const port = process.env.PORT || 8080;
  app.get('*', (_, response) =>
    response.sendFile(path.join(__dirname, '../../frontend/build/index.html'))
  );

  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`Listening on port ${port}...`));
}

setup();

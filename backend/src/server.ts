import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { db } from './firebase';
import { Section } from './firebase/types';

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.get('/', async (req, res) => {
  const snapshot = await db.collection('faqs').get();

  const faqs: Section[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const section: Section = {
      headerName: data.headerName,
      faqs: data.faqs,
    };
    faqs.push(section);
  });

  res.status(200).send(JSON.stringify(faqs));
});

// eslint-disable-next-line
app.listen(port, () => console.log(`Server running on port: ${port}`));

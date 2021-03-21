import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { db } from './firebase';
import { Section } from './firebase/types';

const app: Express = express();

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

export default app;

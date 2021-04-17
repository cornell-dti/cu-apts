import express, { Express } from 'express';
import cors from 'cors';
import axios from 'axios';
import CSVToJSON from 'csvtojson';
// import { db } from './firebase-config';
import { Review } from '../../common/types/db-types';

const FILE = './landlord_reviews.csv';
const app: Express = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

const makeReview = async (review: Review) => {
  axios
    .post('/new-review', review)
    // eslint-disable-next-line no-console
    .catch((err) => console.log(err));
};

CSVToJSON()
  .fromFile(FILE)
  .then(
    (json) => {
      const reviews = json as Review[];
      // eslint-disable-next-line no-console
      console.log('hi');
      reviews.map((review) => makeReview(review));
    },
    // eslint-disable-next-line no-console
    (error) => console.log(error)
  );

const port = process.env.PORT || 8080;

// eslint-disable-next-line
app.listen(port, () => console.log(`Server running on port: ${port}`));

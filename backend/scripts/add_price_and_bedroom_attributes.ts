import { Review } from '@common/types/db-types';
import { db } from '../src/firebase-config';

// This script will add the price and bedrooms attributes to all the reviews that do not have them

const reviewCollection = db.collection('reviews');

reviewCollection.get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    console.log('Review Before Changes: ', doc.data());
    // Version 1: Using Update?
    reviewCollection.doc(doc.id).update({
      price: 0,
      bedrooms: 0,
    });
    console.log('Updated review with id: ', doc.id, ' with price and bedrooms attributes');
    console.log('Review After Changes: ', doc.data());
  });
});

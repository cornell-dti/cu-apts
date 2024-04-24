import { db } from '../src/firebase-config';

/*
  This script will add the price and bedrooms attributes to all the reviews that do not have them
*/

const reviewCollection = db.collection('reviews');

reviewCollection.get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    console.log('Review Before Changes: ', doc.data());
    // Update the review with price and bedrooms attributes using update method
    reviewCollection.doc(doc.id).update({
      price: 0,
      bedrooms: 0,
    });
    console.log('Updated review with id: ', doc.id, ' with price and bedrooms attributes');
    console.log('Review After Changes: ', doc.data());
  });
});

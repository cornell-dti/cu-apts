import { db } from '../src/firebase-config';

const buildingCollection = db.collection('buildings');

const getUrlName = (address: string) => {
  const alphanumericAndHyphen = address
    .trim()
    .replace(/[^a-zA-Z0-9\s,]+/g, '')
    .replace(/[\s.,]+/g, '-');
  const lowercase = alphanumericAndHyphen.toLowerCase();
  return lowercase;
};

buildingCollection.get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    const urlName = getUrlName(doc.data().name);
    buildingCollection.doc(doc.id).update({ urlName });
  });
});

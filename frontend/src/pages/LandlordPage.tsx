import React, { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import Review from '../components/Review';

const reviews = [
  {
    name: 'user1',
    overallRating: 3,
    date: new Date(),
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor mauris a scelerisque rhoncus. Nam vitae lacus at neque faucibus porttitor. Phasellus mollis maximus neque, vehicula consectetur enim sagittis ac. Sed viverra risus nibh, non pulvinar mauris fermentum sed. Praesent pellentesque dapibus felis nec interdum. ',
  },
  {
    name: 'user2',
    overallRating: 2,
    date: new Date(),
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor mauris a scelerisque rhoncus. Nam vitae lacus at neque faucibus porttitor. Phasellus mollis maximus neque, vehicula consectetur enim sagittis ac. Sed viverra risus nibh, non pulvinar mauris fermentum sed. Praesent pellentesque dapibus felis nec interdum. ',
  },
  {
    name: 'user3',
    overallRating: 1,
    date: new Date(),
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam auctor mauris a scelerisque rhoncus. Nam vitae lacus at neque faucibus porttitor. Phasellus mollis maximus neque, vehicula consectetur enim sagittis ac. Sed viverra risus nibh, non pulvinar mauris fermentum sed. Praesent pellentesque dapibus felis nec interdum. ',
  },
];

const LandlordPage = (): ReactElement => {
  const { landlordId } = useParams<Record<string, string | undefined>>();

  return (
    <div>
      <h1>{`This is dummy text! My current landlordId is ${landlordId}`}</h1>
      {reviews.map((reviewData) => (
        <Review {...reviewData} />
      ))}
    </div>
  );
};

export default LandlordPage;

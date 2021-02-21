import React, { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

const LandlordPage = (): ReactElement => {
  const { landlordId } = useParams<Record<string, string | undefined>>();

  return (
    <div>
      <h1>{`This is dummy text! My current landlordId is ${landlordId}`}</h1>
    </div>
  );
};

export default LandlordPage;

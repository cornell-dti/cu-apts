// eslint-disable-next-line import/no-unresolved
import { Landlord } from '@common/types/db-types';
import { ReactElement } from 'react';

type Props = {
  landlordData: Landlord;
  landlordReview: string;
  landlordMessage: string;
};

const LandlordHighlight: React.FC<Props> = ({
  landlordData,
  landlordReview,
  landlordMessage,
}: Props): ReactElement => {
  const { name } = landlordData;
  // const {properties} = landlordData;

  return (
    <div>
      <h2>From Landlord {name}</h2>
      <p>{landlordMessage}</p>
      <h2>Recently Released / Vacant</h2>

      <h2>Top Loved Properties</h2>

      <div>
        <img src="backend/scripts/email/assets/review-icon.svg" alt="asdasa" />
        <div>
          <h2>Landlord Review</h2>
          <p>{landlordReview}</p>
        </div>
      </div>
    </div>
  );
};
export default LandlordHighlight;

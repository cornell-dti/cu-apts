import { Area, Advice, LandlordSpotlight } from './Types';
import Newsletter from './Newsletter';

const GenerateNewsletter: React.FC = () => {
  const area: Area = {
    name: 'Collegetown',
    description: ' ',
    imageURL: ' ',
    properties: [''],
    activities: [''],
  };

  const advice: Advice = {
    name: 'A Cornell Student',
    message: 'You should do this and this and this in the housing search process. good luck!',
  };

  const landlordSpotlight: LandlordSpotlight[] = [
    {
      landlord: {
        name: 'name',
        contact: '',
        avgRating: 4,
        photos: [''],
        reviews: [''],
        properties: [''],
        address: null,
      },
      message: 'string',
      recentProperties: [''],
      lovedProperties: [''],
      review: '',
    },
  ];

  return (
    <>
      <Newsletter
        headline="headline"
        firstName="firstname"
        introductionMessage="introduction message"
        areaSpotlight={area}
        advice={advice}
        landlordSpotlight={landlordSpotlight}
      />
    </>
  );
};

export default GenerateNewsletter;

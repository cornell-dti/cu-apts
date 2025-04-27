import {
  AreaProps,
  LandlordSpotlightProps,
  AdviceProps,
  ReelsProps,
  FeatureSpotlightProps,
  NeighborhoodCompProps,
  SubleaseProps,
} from './Types';
import Newsletter from './Newsletter';

const GenerateNewsletter: React.FC = () => {
  const area: AreaProps = {
    name: 'Collegetown',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. ',
    imageURL:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNAmA9xjYewE0MtHTisSyKVE2Ppi1cEEMOMx7R3gBR7zh4Nk3G',
    properties: [''],
    activities: [''],
  };

  const advice: AdviceProps = {
    name: 'A Cornell Student',
    message: 'You should do this and this and this in the housing search process. good luck!',
  };

  const landlordSpotlight: LandlordSpotlightProps[] = [
    {
      landlord: {
        name: 'Landlord Example',
        contact: '',
        avgRating: 4,
        photos: [''],
        reviews: [''],
        properties: [''],
        address: null,
      },
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, dapibus orci ut, vestibulum nisi. Suspendisse hendrerit viverra odio a gravida.',
      recentProperties: [''],
      lovedProperties: [''],
      review:
        '“Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem. Pellentesque nec porttitor ligula. Duis eget augue”',
    },
  ];

  const reelsSpotlight: ReelsProps = {
    gifUrl:
      'https://media4.giphy.com/media/J1AY5JoYBYC3D7e303/giphy.gif?cid=6c09b9525oznfivx3ml3dy173iceg42f9s808coer9bt6h8x&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, ',
  };

  const featureSpotlight: FeatureSpotlightProps = {
    imgUrl:
      'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTOJgeX2Q_YP7mHSFPphSHfTILVHFWBdmaYgEHJfPsTADW2nlMm',
    featureName: 'Feature Name',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, dapibus orci ut, vestibulum nisi. Suspendisse hendrerit viverra odio a gravida.',
  };

  const sublease: SubleaseProps = {
    imgUrl:
      'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTOJgeX2Q_YP7mHSFPphSHfTILVHFWBdmaYgEHJfPsTADW2nlMm',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, ',
    phoneNumber: '1234567890',
    email: 'dummyemail@gmail.com',
  };

  const neighborhoodComp: NeighborhoodCompProps = {
    name1: 'Neighborhood 1',
    name2: 'Neighborhood 2',
    description1:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. \n-Duis eget augue rhoncus\n-dapibus orci ut, vestibulu\n-Lorem ipsum dolor sit amet,\n-consectetur adipiscing elit.\n-Pellentesque nec porttitor ligula Duis eget',
    description2:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. \n-Duis eget augue rhoncus\n-dapibus orci ut, vestibulu\n-Lorem ipsum dolor sit amet,\n-consectetur adipiscing elit.\n-Pellentesque nec porttitor ligula Duis eget',
    image1:
      'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTOJgeX2Q_YP7mHSFPphSHfTILVHFWBdmaYgEHJfPsTADW2nlMm',
    image2:
      'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTOJgeX2Q_YP7mHSFPphSHfTILVHFWBdmaYgEHJfPsTADW2nlMm',
  };

  return (
    <>
      <Newsletter
        firstName="[Name]"
        introductionMessage="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, dapibus orci ut, vestibulum nisi. Suspendisse hendrerit viverra odio a gravida."
        areaSpotlight={area}
        advice={advice}
        landlordSpotlight={landlordSpotlight}
        reels={reelsSpotlight}
        newFeature={featureSpotlight}
        subleaseSpotlight={sublease}
        neighborhoodComparison={neighborhoodComp}
      />
    </>
  );
};

export default GenerateNewsletter;

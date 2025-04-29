/* eslint-disable react/prop-types */
import { ApartmentWithId } from '@common/types/db-types';
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

interface GenerateNewsletterProps {
  recentLandlordProperties: ApartmentWithId[];
  lovedProperties: ApartmentWithId[];
  recentAreaProperties: ApartmentWithId[];
}

const GenerateNewsletter: React.FC<GenerateNewsletterProps> = ({
  recentLandlordProperties,
  lovedProperties,
  recentAreaProperties,
}) => {
  const area: AreaProps = {
    name: 'Collegetown',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. ',
    imageURL:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNAmA9xjYewE0MtHTisSyKVE2Ppi1cEEMOMx7R3gBR7zh4Nk3G',
    properties: recentAreaProperties,
    activities: [
      {
        name: 'Elife Market',
        address: '111 Dryden Rd',
        imgUrl:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/29/8c/c2/photo3jpg.jpg?w=200&h=-1&s=1',
      },
      {
        name: 'Elife Market',
        address: '111 Dryden Rd',
        imgUrl:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/29/8c/c2/photo3jpg.jpg?w=200&h=-1&s=1',
      },
      {
        name: 'Elife Market',
        address: '111 Dryden Rd',
        imgUrl:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/29/8c/c2/photo3jpg.jpg?w=200&h=-1&s=1',
      },
    ],
  };

  const advice: AdviceProps = {
    name: 'A Cornell Student',
    message: 'You should do this and this and this in the housing search process. good luck!',
  };

  const landlordSpotlight: LandlordSpotlightProps[] = [
    {
      landlord: {
        name: '[Landlord Example]',
        contact: '',
        avgRating: 4,
        photos: [''],
        reviews: [''],
        properties: [''],
        address: null,
      },
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, dapibus orci ut, vestibulum nisi. Suspendisse hendrerit viverra odio a gravida.',
      recentProperties: recentLandlordProperties,
      lovedProperties,
      review:
        '“Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem. Pellentesque nec porttitor ligula. Duis eget augue”',
    },
  ];

  const reelsSpotlight: ReelsProps = {
    gifUrl: 'https://media.tenor.com/SYuz3k9aVkQAAAAM/iphone-phone.gif',
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

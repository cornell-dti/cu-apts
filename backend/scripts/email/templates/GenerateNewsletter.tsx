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

// Pre-fetched property data (simulated)
// In a real application, you would fetch this data before rendering
const propertyData: Record<string, ApartmentWithId> = {
  '12': {
    id: '12',
    name: '123 College Ave',
    address: '123 College Avenue, Ithaca, NY',
    photos: [
      'https://images.squarespace-cdn.com/content/v1/665f8368e87e4548121b2b1b/1739995859299-Q3ZMFXYTF9PB4FXHRKE1/Carey-Building-Apartments_ALT.jpg',
    ],
    landlordId: '',
    latitude: 2,
    numBaths: 3,
    numBeds: 3,
    longitude: 1,
    area: 'NORTH',
  },
  '14': {
    id: '14',
    name: '123 College Ave',
    address: '123 College Avenue, Ithaca, NY',
    photos: [
      'https://images.squarespace-cdn.com/content/v1/665f8368e87e4548121b2b1b/1739995859299-Q3ZMFXYTF9PB4FXHRKE1/Carey-Building-Apartments_ALT.jpg',
    ],
    landlordId: '',
    latitude: 2,
    numBaths: 3,
    numBeds: 3,
    longitude: 1,
    area: 'NORTH',
  },
  '18': {
    id: '18',
    name: '123 College Ave',
    address: '123 College Avenue, Ithaca, NY',
    photos: [
      'https://images.squarespace-cdn.com/content/v1/665f8368e87e4548121b2b1b/1739995859299-Q3ZMFXYTF9PB4FXHRKE1/Carey-Building-Apartments_ALT.jpg',
    ],
    landlordId: '',
    latitude: 2,
    numBaths: 3,
    numBeds: 3,
    longitude: 1,
    area: 'NORTH',
  },
  '16': {
    id: '16',
    name: '123 College Ave',
    address: '123 College Avenue, Ithaca, NY',
    photos: [
      'https://images.squarespace-cdn.com/content/v1/665f8368e87e4548121b2b1b/1739995859299-Q3ZMFXYTF9PB4FXHRKE1/Carey-Building-Apartments_ALT.jpg',
    ],
    landlordId: '',
    latitude: 2,
    numBaths: 3,
    numBeds: 3,
    longitude: 1,
    area: 'NORTH',
  },
  '13': {
    id: '13',
    name: '123 College Ave',
    address: '123 College Avenue, Ithaca, NY',
    photos: [
      'https://images.squarespace-cdn.com/content/v1/665f8368e87e4548121b2b1b/1739995859299-Q3ZMFXYTF9PB4FXHRKE1/Carey-Building-Apartments_ALT.jpg',
    ],
    landlordId: '',
    latitude: 2,
    numBaths: 3,
    numBeds: 3,
    longitude: 1,
    area: 'NORTH',
  },
  '24': {
    id: '24',
    name: '123 College Ave',
    address: '123 College Avenue, Ithaca, NY',
    photos: [
      'https://images.squarespace-cdn.com/content/v1/665f8368e87e4548121b2b1b/1739995859299-Q3ZMFXYTF9PB4FXHRKE1/Carey-Building-Apartments_ALT.jpg',
    ],
    landlordId: '',
    latitude: 2,
    numBaths: 3,
    numBeds: 3,
    longitude: 1,
    area: 'NORTH',
  },
};

// Helper function to get property data by IDs
const getPropertiesByIds = (ids: string[]): ApartmentWithId[] => ids.map((id) => propertyData[id]).filter(Boolean);

const GenerateNewsletter: React.FC = () => {
  const recentPropertyIds = ['12', '14', '18'];
  const lovedPropertyIds = ['16', '13', '24'];

  const area: AreaProps = {
    name: 'Collegetown',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. ',
    imageURL:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNAmA9xjYewE0MtHTisSyKVE2Ppi1cEEMOMx7R3gBR7zh4Nk3G',
    properties: getPropertiesByIds(recentPropertyIds),
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
      recentProperties: getPropertiesByIds(recentPropertyIds),
      lovedProperties: getPropertiesByIds(lovedPropertyIds),
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

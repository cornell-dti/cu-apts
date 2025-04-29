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

/**
 * GenerateNewsletter Component
 *
 * This component builds a customizable email newsletter, allowing personalization
 * of various sections like area spotlights, landlord features, advice from students, and more.
 * The component takes property data and renders a complete newsletter with optional sections
 * that can be included or excluded as needed.
 *
 * @component
 * @param {Object} props - Component properties
 * @param {ApartmentWithId[]} props.recentLandlordProperties - Latest properties from featured landlord
 * @param {ApartmentWithId[]} props.lovedProperties - Highly-rated or popular properties to showcase
 * @param {ApartmentWithId[]} props.recentAreaProperties - Recent listings in the featured area
 * @returns {ReactElement} Complete newsletter with all requested sections
 */
const GenerateNewsletter: React.FC<GenerateNewsletterProps> = ({
  recentLandlordProperties,
  lovedProperties,
  recentAreaProperties,
}) => {
  /**
   * The main message at the top of the newsletter.
   */
  const introductionMessage =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, dapibus orci ut, vestibulum nisi. Suspendisse hendrerit viverra odio a gravida.';

  /** The header image (containing header text) for the web version. */
  const headerUrl = 'https://i.postimg.cc/7Ps1ZM8d/header.png';

  /**
   * AreaProps Interface
   *
   * Defines the structure for featuring a specific area in the newsletter
   *
   * @typedef {Object} AreaProps
   * @property {string} name - The name of the featured area (e.g., "Collegetown")
   * @property {string} description - Text description of the area's features and benefits
   * @property {string} imageURL - URL to an image representing the area
   * @property {ApartmentWithId[]} properties - Array of properties in this area to showcase
   * @property {Object[]} activities - Array of activities or points of interest in the area
   * @property {string} activities[].name - Name of the activity or business
   * @property {string} activities[].address - Address of the activity or business
   * @property {string} activities[].imgUrl - Image URL for the activity or business
   */
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

  /**
   * AdviceProps Interface
   *
   * Defines the structure for student advice section
   *
   * @typedef {Object} AdviceProps
   * @property {string} name - Name or identifier of the person giving advice (e.g., "A Cornell Student")
   * @property {string} message - The advice message to display in the newsletter
   */
  const advice: AdviceProps = {
    name: 'A Cornell Student',
    message: 'You should do this and this and this in the housing search process. good luck!',
  };

  /**
   * LandlordSpotlightProps Interface
   *
   * Defines the structure for featuring landlords in the newsletter
   *
   * @typedef {Object} LandlordSpotlightProps
   * @property {Object} landlord - Information about the featured landlord
   * @property {string} landlord.name - Landlord's name
   * @property {string} landlord.contact - Contact information for the landlord
   * @property {number} landlord.avgRating - Average rating (out of 5)
   * @property {string[]} landlord.photos - Array of photo URLs
   * @property {string[]} landlord.reviews - Array of review texts
   * @property {string[]} landlord.properties - Array of property identifiers
   * @property {string|null} landlord.address - Landlord's address or office location
   * @property {string} message - Description or introduction to the landlord
   * @property {ApartmentWithId[]} recentProperties - Recent properties from this landlord
   * @property {ApartmentWithId[]} lovedProperties - Popular properties from this landlord
   * @property {string} review - Featured review quote about the landlord
   */
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

  /**
   * ReelsProps Interface
   *
   * Defines the structure for featuring video reels
   *
   * @typedef {Object} ReelsProps
   * @property {string} gifUrl - URL to a GIF or preview image for the featured reel
   * @property {string} description - Text description of the featured reel content
   */
  const reelsSpotlight: ReelsProps = {
    gifUrl: 'https://media.tenor.com/SYuz3k9aVkQAAAAM/iphone-phone.gif',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, ',
  };

  /**
   * FeatureSpotlightProps Interface
   *
   * Defines the structure for showcasing a new website feature
   *
   * @typedef {Object} FeatureSpotlightProps
   * @property {string} imgUrl - URL to an image representing the feature
   * @property {string} featureName - Name of the new feature
   * @property {string} description - Detailed description of the feature and its benefits
   */
  const featureSpotlight: FeatureSpotlightProps = {
    imgUrl:
      'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTOJgeX2Q_YP7mHSFPphSHfTILVHFWBdmaYgEHJfPsTADW2nlMm',
    featureName: 'Feature Name',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, dapibus orci ut, vestibulum nisi. Suspendisse hendrerit viverra odio a gravida.',
  };

  /**
   * SubleaseProps Interface
   *
   * Defines the structure for featuring sublease opportunities
   *
   * @typedef {Object} SubleaseProps
   * @property {string} imgUrl - URL to an image of the sublease property
   * @property {string} description - Description of the sublease opportunity
   * @property {string} phoneNumber - Contact phone number for the sublease
   * @property {string} email - Contact email for the sublease
   */
  const sublease: SubleaseProps = {
    imgUrl:
      'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTOJgeX2Q_YP7mHSFPphSHfTILVHFWBdmaYgEHJfPsTADW2nlMm',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula. Duis eget augue rhoncus, ',
    phoneNumber: '1234567890',
    email: 'dummyemail@gmail.com',
  };

  /**
   * NeighborhoodCompProps Interface
   *
   * Defines the structure for comparing two neighborhoods
   *
   * @typedef {Object} NeighborhoodCompProps
   * @property {string} name1 - Name of the first neighborhood
   * @property {string} name2 - Name of the second neighborhood
   * @property {string} description1 - Description of the first neighborhood (can include bullet points using \n- format)
   * @property {string} description2 - Description of the second neighborhood (can include bullet points using \n- format)
   * @property {string} image1 - Image URL for the first neighborhood
   * @property {string} image2 - Image URL for the second neighborhood
   */
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
        firstName=""
        headerUrl={headerUrl}
        introductionMessage={introductionMessage}
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

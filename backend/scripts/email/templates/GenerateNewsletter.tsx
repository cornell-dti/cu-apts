/* eslint-disable react/prop-types */
import { ApartmentWithId } from '@common/types/db-types';
import { NewsletterRequest } from './Types';
import Newsletter from './Newsletter';

interface GenerateNewsletterProps {
  nearbyProperties: ApartmentWithId[];
  budgetProperties: ApartmentWithId[];
  recentAreaProperties: ApartmentWithId[];
  lovedProperties: ApartmentWithId[];
  reviewedProperties: ApartmentWithId[];
  newsletterData?: NewsletterRequest;
}

const GenerateNewsletter: React.FC<GenerateNewsletterProps> = ({
  nearbyProperties,
  budgetProperties,
  recentAreaProperties,
  lovedProperties,
  reviewedProperties,
  newsletterData,
}) => {
  // Use data from newsletterData if provided, otherwise use defaults
  const introductionMessage =
    newsletterData?.introductionMessage ||
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nec porttitor ligula.';

  const headerUrl = newsletterData?.headerImageUrl || 'https://i.postimg.cc/7Ps1ZM8d/header.png';

  // Area spotlight
  const area = newsletterData?.sections?.areaSpotlight
    ? {
        name: newsletterData.sections.areaSpotlight.name,
        description: newsletterData.sections.areaSpotlight.description,
        imageURL: newsletterData.sections.areaSpotlight.imageURL,
        properties: recentAreaProperties,
        activities: newsletterData.sections.areaSpotlight.activities,
      }
    : undefined;

  // Advice section
  const advice = newsletterData?.sections?.advice
    ? {
        name: newsletterData.sections.advice.name,
        message: newsletterData.sections.advice.message,
        major: newsletterData.sections.advice.major,
        year: newsletterData.sections.advice.year,
        apartment: newsletterData.sections.advice.apartment,
      }
    : undefined;

  // Recent properties
  const recentPropertiesSpotlight = newsletterData?.sections?.recentlyReleased
    ? {
        nearbyProperties,
        budgetProperties,
      }
    : undefined;

  // Loved properties
  const lovedPropertiesSpotlight = newsletterData?.sections?.topLoved
    ? {
        topProperties: lovedProperties,
        reviewedProperties,
        propertyReview: newsletterData.sections.topLoved.propertyReview,
      }
    : undefined;

  // Reels
  const reelsSpotlight = newsletterData?.sections?.reels
    ? {
        gifUrl: newsletterData.sections.reels.gifUrl,
        description: newsletterData.sections.reels.description,
      }
    : undefined;

  // Feature spotlight
  const featureSpotlight = newsletterData?.sections?.newFeature
    ? {
        imgUrl: newsletterData.sections.newFeature.imgUrl,
        featureName: newsletterData.sections.newFeature.featureName,
        description: newsletterData.sections.newFeature.description,
      }
    : undefined;

  // Sublease
  const sublease = newsletterData?.sections?.sublease
    ? {
        imgUrl: newsletterData.sections.sublease.imgUrl,
        description: newsletterData.sections.sublease.description,
        phoneNumber: newsletterData.sections.sublease.phoneNumber,
        email: newsletterData.sections.sublease.email,
      }
    : undefined;

  // Neighborhood comparison
  const neighborhoodComp = newsletterData?.sections?.neighborhood
    ? {
        name1: newsletterData.sections.neighborhood.name1,
        name2: newsletterData.sections.neighborhood.name2,
        description1: newsletterData.sections.neighborhood.description1,
        description2: newsletterData.sections.neighborhood.description2,
        image1: newsletterData.sections.neighborhood.image1,
        image2: newsletterData.sections.neighborhood.image2,
      }
    : undefined;

  return (
    <Newsletter
      firstName=""
      headerUrl={headerUrl}
      introductionMessage={introductionMessage}
      areaSpotlight={area}
      advice={advice}
      recentPropertiesSpotlight={recentPropertiesSpotlight}
      lovedPropertiesSpotlight={lovedPropertiesSpotlight}
      reels={reelsSpotlight}
      newFeature={featureSpotlight}
      subleaseSpotlight={sublease}
      neighborhoodComparison={neighborhoodComp}
    />
  );
};

export default GenerateNewsletter;

// eslint-disable-next-line import/no-unresolved
import { ApartmentWithId } from '@common/types/db-types';

export interface NewsletterRequest {
  subject: string;
  introductionMessage: string;
  headerImageUrl?: string;
  testEmail?: string;
  sendToAll: boolean;
  sections: {
    recentlyReleased?: {
      nearbyPropertyIDs: string[];
      budgetPropertyIDs: string[];
    };
    topLoved?: {
      lovedPropertyIDs: string[];
      reviewedPropertyIDs: string[];
      propertyReview: string;
    };
    advice?: {
      name: string;
      message: string;
      major: string;
      year: string;
      apartment: string;
    };
    newFeature?: {
      imgUrl: string;
      featureName: string;
      description: string;
    };
    neighborhood?: {
      name1: string;
      name2: string;
      description1: string;
      description2: string;
      image1: string;
      image2: string;
    };
    areaSpotlight?: {
      name: string;
      description: string;
      imageURL: string;
      recentAreaPropertyIDs: string[];
      activities: Array<{
        name: string;
        address: string;
        imgUrl: string;
      }>;
    };
    sublease?: {
      imgUrl: string;
      description: string;
      phoneNumber?: string;
      email: string;
    };
    reels?: {
      gifUrl: string;
      description: string;
    };
  };
}

export interface Activity {
  name: string;
  address: string;
  imgUrl: string;
}
export interface AreaProps {
  name: string;
  description: string;
  imageURL: string;
  properties: ApartmentWithId[];
  activities: Activity[];
}
export interface RecentPropertiesProps {
  nearbyProperties: ApartmentWithId[];
  budgetProperties: ApartmentWithId[];
}
export interface LovedPropertiesProps {
  topProperties: ApartmentWithId[];
  reviewedProperties: ApartmentWithId[];
  propertyReview: string;
}

export interface AdviceProps {
  name: string;
  year?: string;
  major?: string;
  apartment?: string;
  message: string;
}
export interface ReelsProps {
  gifUrl: string;
  description: string;
}
export interface SubleaseProps {
  imgUrl: string;
  description: string;
  phoneNumber?: string;
  email: string;
}
export interface NeighborhoodCompProps {
  name1: string;
  name2: string;
  description1: string;
  description2: string;
  image1: string;
  image2: string;
}
export interface FeatureSpotlightProps {
  imgUrl: string;
  featureName: string;
  description: string;
}

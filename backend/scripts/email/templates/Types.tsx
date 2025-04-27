// eslint-disable-next-line import/no-unresolved
import { Landlord } from '@common/types/db-types';

export interface AreaProps {
  name: string;
  description: string;
  imageURL: string;
  properties: string[];
  activities: string[];
}
export interface LandlordSpotlightProps {
  landlord: Landlord;
  message: string;
  recentProperties: string[];
  lovedProperties: string[];
  review: string;
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

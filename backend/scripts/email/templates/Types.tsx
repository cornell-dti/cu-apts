// eslint-disable-next-line import/no-unresolved
import { Landlord } from '@common/types/db-types';

export interface Area {
  name: string;
  description: string;
  imageURL: string;
  properties: string[];
  activities: string[];
}
export interface LandlordSpotlight {
  landlord: Landlord;
  message: string;
  recentProperties: string[];
  lovedProperties: string[];
  review: string;
}
export interface Advice {
  name: string;
  year?: string;
  major?: string;
  apartment?: string;
  message: string;
}

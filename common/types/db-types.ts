export type DetailedRating = {
  readonly location: number;
  readonly safety: number;
  readonly value: number;
  readonly maintenance: number;
  readonly communication: number;
  readonly conditions: number;
};

export type Review = {
  readonly id: string;
  readonly aptId: string | null;
  readonly landlordId: string;
  readonly overallRating: number;
  readonly detailedRatings: DetailedRating;
  readonly reviewText: string;
  readonly date: Date;
};

export type Landlord = {
  readonly id: string;
  readonly name: string;
  readonly contact: string | null;
  readonly avgRating: number;
  readonly photos: readonly string[]; // can be empty
  readonly reviews: readonly string[]; // array of Review IDs in reviews collection
  readonly properties: readonly string[]; // array of Apartment IDs in apartments collection
};

export type Apartment = {
  readonly id: string;
  readonly name: string;
  readonly address: string; // may change to placeID for Google Maps integration
  readonly landlordId: string | null;
  readonly numBaths: number | null;
  readonly numBeds: number | null;
  readonly photos: readonly string[]; // can be empty
  readonly area: 'COLLEGETOWN' | 'WEST' | 'NORTH' | 'DOWNTOWN' | 'OTHER';
};

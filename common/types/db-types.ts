type Id = {
  readonly id: string;
};

type StringSet = Record<string, boolean>;

export type DetailedRating = {
  readonly location: number;
  readonly safety: number;
  readonly maintenance: number;
  readonly conditions: number;
};

type ReportEntry = {
  readonly date: Date;
  readonly userId: string;
  readonly reason: string;
};

export type Review = {
  readonly aptId: string | null;
  readonly likes?: number;
  readonly date: Date;
  readonly detailedRatings: DetailedRating;
  readonly landlordId: string;
  readonly bedrooms: number;
  readonly price: number;
  readonly overallRating: number;
  readonly photos: readonly string[];
  readonly reviewText: string;
  readonly status?: 'PENDING' | 'APPROVED' | 'DECLINED' | 'DELETED' | 'REPORTED';
  readonly userId?: string | null;
  readonly reports?: readonly ReportEntry[];
};

export type ReviewWithId = Review & Id;

export type ReviewInternal = Review & {};

export type Landlord = {
  readonly name: string;
  readonly contact: string | null;
  readonly avgRating: number;
  readonly profilePhoto?: string;
  readonly photos: readonly string[]; // can be empty
  readonly reviews: readonly string[]; // array of Review IDs in reviews collection
  readonly properties: readonly string[]; // array of Apartment IDs in apartments collection
  readonly address: string | null;
};

export type LandlordWithId = Landlord & Id;
export type LandlordWithLabel = LandlordWithId & { readonly label: 'LANDLORD' };

export type Apartment = {
  readonly name: string;
  readonly address: string; // may change to placeID for Google Maps integration
  readonly landlordId: string | null;
  readonly numBaths: number | null;
  readonly numBeds: number | null;
  readonly photos: readonly string[]; // can be empty
  readonly area: 'COLLEGETOWN' | 'WEST' | 'NORTH' | 'DOWNTOWN' | 'OTHER';
  readonly latitude: number;
  readonly longitude: number;
  readonly price: number;
  readonly distanceToCampus: number; // walking distance to ho plaza in minutes
};

export type LocationTravelTimes = {
  agQuadDriving: number;
  agQuadWalking: number;
  engQuadDriving: number;
  engQuadWalking: number;
  hoPlazaDriving: number;
  hoPlazaWalking: number;
};

export type ApartmentWithId = Apartment & Id;
export type ApartmentWithLabel = ApartmentWithId & { readonly label: 'APARTMENT' };

export type LandlordOrApartmentWithLabel = LandlordWithLabel | ApartmentWithLabel;

export type Likes = StringSet;

export type CantFindApartmentForm = {
  readonly date: Date;
  readonly name: string;
  readonly address: string;
  readonly photos: readonly string[];
  readonly userId?: string | null;
};

export type CantFindApartmentFormWithId = CantFindApartmentForm & Id;

export type QuestionForm = {
  readonly date: Date;
  readonly name: string;
  readonly email: string;
  readonly msg: string;
  readonly userId?: string | null;
};

export type QuestionFormWithId = QuestionForm & Id;

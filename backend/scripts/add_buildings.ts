import { Apartment, ApartmentWithId } from '@common/types/db-types';
import { db } from '../src/firebase-config';
import buildingData from '../src/data/buildings.json';

const buildingCollection = db.collection('buildings');

type BuildingData = {
  id: number;
  name: string;
  address: string;
  landlordId: string | null;
  numBaths: number;
  numBeds: number;
  photos: string;
  area: string;
};

const getAreaType = (areaName: string): 'COLLEGETOWN' | 'WEST' | 'NORTH' | 'DOWNTOWN' | 'OTHER' => {
  switch (areaName.toUpperCase()) {
    case 'COLLEGETOWN':
      return 'COLLEGETOWN';
    case 'WEST':
      return 'WEST';
    case 'NORTH':
      return 'NORTH';
    case 'DOWNTOWN':
      return 'DOWNTOWN';
    default:
      return 'OTHER';
  }
};

const formatBuilding = ({
  id,
  name,
  address,
  landlordId,
  numBaths,
  numBeds,
  photos,
  area,
}: BuildingData): ApartmentWithId => ({
  id: id.toString(),
  name,
  address,
  landlordId,
  numBaths: 0,
  numBeds: 0,
  photos: [],
  area: getAreaType(area),
});

const makeBuilding = async (apartmentWithId: ApartmentWithId) => {
  try {
    const { id, ...rest } = apartmentWithId;
    const doc = buildingCollection.doc(id);
    const building = rest as Apartment;
    doc.set({ building });
  } catch (err) {
    console.log(err);
  }
};

buildingData.map((building) => makeBuilding(formatBuilding(building)));

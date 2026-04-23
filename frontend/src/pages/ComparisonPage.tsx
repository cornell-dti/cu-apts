import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import { Container, Typography, IconButton, Button, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import AddIcon from '@material-ui/icons/Add';
import { useHistory, useLocation } from 'react-router-dom';
import { get } from '../utils/call';
import { ApartmentWithId, LocationTravelTimes } from '../../../common/types/db-types';
import { CardData } from '../App';
import { useTitle } from '../utils';
import { colors } from '../colors';
import HeartRating from '../components/utils/HeartRating';
import AmenityIcon from '../components/Comparison/AmenityIcon';
import AddApartmentModal from '../components/Comparison/AddApartmentModal';
import blackPinIcon from '../assets/ph_map-pin-fill.svg';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

type ComparisonApt = CardData & {
  travelTimes?: LocationTravelTimes;
};

const MAX_SLOTS = 4;

const amenityKeys = [
  'parking',
  'heat',
  'internet',
  'furnished',
  'laundry',
  'kitchen',
  'pets',
] as const;

const amenityLabels: Record<string, string> = {
  parking: 'Parking',
  heat: 'Heat',
  internet: 'Internet',
  furnished: 'Furnished',
  laundry: 'Laundry',
  kitchen: 'Kitchen',
  pets: 'Pets',
};

const useStyles = makeStyles(() => ({
  pageContainer: {
    marginTop: 34,
    marginBottom: 48,
  },
  title: {
    fontWeight: 600,
    fontSize: 26,
    lineHeight: '36px',
    color: colors.black,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: '28px',
    color: '#292929',
    marginTop: 8,
  },
  comparisonGrid: {
    display: 'flex',
    marginTop: 32,
    maxWidth: '100%',
  },
  labelColumn: {
    minWidth: 93,
    maxWidth: 93,
    width: 93,
    flexShrink: 0,
    marginRight: 20,
  },
  labelCell: {
    height: 58,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  labelText: {
    fontSize: 18,
    lineHeight: '28px',
    fontWeight: 400,
    color: colors.black,
    whiteSpace: 'nowrap',
  },
  locationLabelCell: {
    height: 512,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  columnsWrapper: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    flexWrap: 'nowrap' as const,
    overflowX: 'auto' as const,
    flex: 1,
    minWidth: 0,
    paddingBottom: 8,
  },
  // Filled apartment column
  aptColumn: {
    border: '1px solid #eaeaea',
    borderRadius: 12,
    width: 287,
    minWidth: 287,
    maxWidth: 287,
    flexShrink: 0,
    flexGrow: 0,
    position: 'relative' as const,
    paddingTop: 36,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
  },
  aptName: {
    fontSize: 26,
    lineHeight: '36px',
    fontWeight: 400,
    textAlign: 'center' as const,
    width: '100%',
    color: colors.black,
    padding: '0 32px',
  },
  aptAddress: {
    fontSize: 18,
    lineHeight: '28px',
    fontWeight: 400,
    textAlign: 'center' as const,
    width: '100%',
    color: colors.black,
    marginTop: 4,
  },
  aptPhoto: {
    width: '100%',
    height: 218,
    objectFit: 'cover' as const,
    borderRadius: 4,
    backgroundColor: '#eaeaea',
    marginTop: 20,
  },
  openPropertyButton: {
    backgroundColor: colors.red1,
    color: colors.white,
    borderRadius: 123,
    width: 'calc(100% - 24px)',
    margin: '0 12px',
    marginTop: 20,
    padding: '12px 16px',
    textTransform: 'none' as const,
    fontWeight: 500,
    fontSize: 16,
    letterSpacing: '-0.32px',
    '&:hover': {
      backgroundColor: colors.red7,
    },
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    marginTop: 32,
    marginBottom: 32,
  },
  ratingValue: {
    fontWeight: 700,
    fontSize: 46,
    color: colors.black,
    lineHeight: 'normal',
  },
  dataRow: {
    height: 58,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dataRowGray: {
    backgroundColor: '#f5f5f5',
  },
  dataRowWhite: {
    backgroundColor: colors.white,
  },
  dataText: {
    fontSize: 18,
    lineHeight: '28px',
    fontWeight: 400,
    color: colors.black,
  },
  locationCell: {
    width: '100%',
    padding: 16,
    backgroundColor: colors.white,
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#eaeaea',
    marginBottom: 16,
  },
  locationAddress: {
    fontWeight: 600,
    fontSize: 15.76,
    color: colors.black,
    lineHeight: 'normal',
    marginBottom: 10,
  },
  distanceLabel: {
    fontSize: 12.8,
    lineHeight: '22.4px',
    fontWeight: 400,
    color: colors.black,
    marginBottom: 4,
  },
  distanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  distanceName: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  pinIcon: {
    width: 19,
    height: 19,
  },
  distanceText: {
    fontSize: 12.8,
    lineHeight: '22.4px',
    fontWeight: 400,
    color: colors.black,
  },
  // Empty slot
  emptySlot: {
    border: '1px solid #eaeaea',
    borderRadius: 12,
    width: 287,
    minWidth: 287,
    maxWidth: 287,
    flexShrink: 0,
    flexGrow: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    minHeight: 300,
    transition: 'border-color 0.15s',
    '&:hover': {
      borderColor: colors.gray2,
    },
  },
  emptySlotIcon: {
    fontSize: 32,
    color: colors.gray2,
    marginBottom: 8,
  },
  emptySlotText: {
    fontSize: 16,
    color: colors.gray1,
    textAlign: 'center' as const,
    lineHeight: '24px',
    padding: '0 24px',
  },
}));

const WalkDistanceRow = ({
  location,
  walkMinutes,
  classes,
}: {
  location: string;
  walkMinutes: number;
  classes: ReturnType<typeof useStyles>;
}) => (
  <div className={classes.distanceRow}>
    <div className={classes.distanceName}>
      <img src={blackPinIcon} alt="pin" className={classes.pinIcon} />
      <Typography className={classes.distanceText}>{location}</Typography>
    </div>
    <Typography className={classes.distanceText}>{walkMinutes} min walk</Typography>
  </div>
);

const ComparisonPage = ({ user, setUser }: Props): ReactElement => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [slots, setSlots] = useState<(ComparisonApt | null)[]>(Array(MAX_SLOTS).fill(null));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlotIndex, setModalSlotIndex] = useState<number>(0);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useTitle('Compare Apartments');

  const parseAptIds = useCallback((): string[] => {
    const params = new URLSearchParams(location.search);
    const ids = params.get('ids');
    return ids ? ids.split(',').filter(Boolean) : [];
  }, [location.search]);

  // Load initial apartments from URL
  useEffect(() => {
    if (initialLoaded) return;
    const aptIds = parseAptIds();
    if (aptIds.length === 0) {
      setInitialLoaded(true);
      return;
    }

    get<ApartmentWithId[]>(`/api/apts/${aptIds.join(',')}`, {
      callback: (apts) => {
        const newSlots: (ComparisonApt | null)[] = Array(MAX_SLOTS).fill(null);
        apts.forEach((apt, i) => {
          if (i < MAX_SLOTS) {
            newSlots[i] = { buildingData: apt, numReviews: 0 };
          }
        });
        setSlots(newSlots);
        setInitialLoaded(true);

        // Fetch travel times for each loaded apartment
        apts.forEach((apt, i) => {
          if (i < MAX_SLOTS) {
            get<LocationTravelTimes>(`/api/travel-times-by-id/${apt.id}`, {
              callback: (times) => {
                setSlots((prev) =>
                  prev.map((s, idx) => (idx === i && s ? { ...s, travelTimes: times } : s))
                );
              },
            });
          }
        });
      },
      errorHandler: () => setInitialLoaded(true),
    });
  }, [parseAptIds, initialLoaded]);

  const updateUrl = (newSlots: (ComparisonApt | null)[]) => {
    const ids = newSlots
      .filter((s): s is ComparisonApt => s !== null)
      .map((s) => s.buildingData.id)
      .join(',');
    history.replace(`/compare${ids ? `?ids=${ids}` : ''}`);
  };

  const removeApartment = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    updateUrl(newSlots);
  };

  const openModal = (slotIndex: number) => {
    setModalSlotIndex(slotIndex);
    setModalOpen(true);
  };

  const handleAddApartment = (cardData: CardData) => {
    const newSlots = [...slots];
    const newApt: ComparisonApt = { ...cardData };
    newSlots[modalSlotIndex] = newApt;
    setSlots(newSlots);
    updateUrl(newSlots);

    // Fetch travel times
    get<LocationTravelTimes>(`/api/travel-times-by-id/${cardData.buildingData.id}`, {
      callback: (times) => {
        setSlots((prev) =>
          prev.map((s, i) => (i === modalSlotIndex && s ? { ...s, travelTimes: times } : s))
        );
      },
    });
  };

  const excludeIds = slots
    .filter((s): s is ComparisonApt => s !== null)
    .map((s) => s.buildingData.id);

  return (
    <Container maxWidth="lg" className={classes.pageContainer}>
      <Typography className={classes.title}>Compare Apartments Side-by-Side</Typography>
      <Typography className={classes.subtitle}>
        Analyze key details and amenities across multiple listings to find the apartment that checks
        every box
      </Typography>

      <div className={classes.comparisonGrid}>
        {/* Row labels column - only show if at least one apartment is loaded */}
        {slots.some((s) => s !== null) && (
          <div className={classes.labelColumn}>
            <div className={classes.labelCell}>
              <Typography className={classes.labelText}>Price</Typography>
            </div>
            <div className={classes.labelCell}>
              <Typography className={classes.labelText}>Room Size</Typography>
            </div>
            <div className={classes.labelCell}>
              <Typography className={classes.labelText}>Year Built</Typography>
            </div>
            <div className={classes.locationLabelCell}>
              <Typography className={classes.labelText}>Location</Typography>
            </div>
            {amenityKeys.map((key) => (
              <div key={key} className={classes.labelCell}>
                <Typography className={classes.labelText}>{amenityLabels[key]}</Typography>
              </div>
            ))}
          </div>
        )}

        {/* 4 column slots */}
        <div className={classes.columnsWrapper}>
          {slots.map((apt, slotIndex) =>
            apt ? (
              <FilledColumn
                key={apt.buildingData.id}
                apt={apt}
                classes={classes}
                onRemove={() => removeApartment(slotIndex)}
                onOpen={() => history.push(`/apartment/${apt.buildingData.id}`)}
              />
            ) : (
              <div
                key={`empty-${slotIndex}`}
                className={classes.emptySlot}
                onClick={() => openModal(slotIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openModal(slotIndex)}
              >
                <AddIcon className={classes.emptySlotIcon} />
                <Typography className={classes.emptySlotText}>Add Apartment to compare</Typography>
              </div>
            )
          )}
        </div>
      </div>

      <AddApartmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddApartment}
        excludeIds={excludeIds}
        user={user}
      />
    </Container>
  );
};

// Extracted filled column component to keep JSX manageable
const FilledColumn = ({
  apt,
  classes,
  onRemove,
  onOpen,
}: {
  apt: ComparisonApt;
  classes: ReturnType<typeof useStyles>;
  onRemove: () => void;
  onOpen: () => void;
}) => {
  const { buildingData, travelTimes, avgRating, avgPrice } = apt;

  return (
    <div className={classes.aptColumn}>
      <IconButton
        className={classes.closeButton}
        size="small"
        onClick={onRemove}
        aria-label="Remove apartment"
      >
        <CloseIcon />
      </IconButton>

      <Typography className={classes.aptName}>{buildingData.name}</Typography>
      <Typography className={classes.aptAddress}>{buildingData.address}</Typography>

      {buildingData.photos && buildingData.photos.length > 0 ? (
        <img src={buildingData.photos[0]} alt={buildingData.name} className={classes.aptPhoto} />
      ) : (
        <div className={classes.aptPhoto} />
      )}

      <Button
        className={classes.openPropertyButton}
        startIcon={<OpenInNewIcon style={{ fontSize: 15 }} />}
        onClick={onOpen}
      >
        Open Property
      </Button>

      <div className={classes.ratingRow}>
        <Typography className={classes.ratingValue}>
          {avgRating ? avgRating.toFixed(1) : 'N/A'}
        </Typography>
        <HeartRating value={avgRating || 0} precision={0.1} readOnly size="small" />
      </div>

      <div style={{ width: '100%' }}>
        {/* Price */}
        <div className={`${classes.dataRow} ${classes.dataRowGray}`}>
          <Typography className={classes.dataText}>
            {avgPrice
              ? `$${Math.round(avgPrice)}`
              : buildingData.price
              ? `$${buildingData.price}`
              : '—'}
          </Typography>
        </div>

        {/* Room Size - placeholder */}
        <div className={`${classes.dataRow} ${classes.dataRowWhite}`}>
          <AmenityIcon value={null} />
        </div>

        {/* Year Built - placeholder */}
        <div className={`${classes.dataRow} ${classes.dataRowGray}`}>
          <AmenityIcon value={null} />
        </div>

        {/* Location */}
        <div className={classes.locationCell}>
          <div className={classes.mapPlaceholder} />
          <Typography className={classes.locationAddress}>{buildingData.address}</Typography>
          <Typography className={classes.distanceLabel}>Distance from Campus</Typography>
          <WalkDistanceRow
            location="Engineering Quad"
            walkMinutes={Math.round(travelTimes?.engQuadWalking || 0)}
            classes={classes}
          />
          <WalkDistanceRow
            location="Ho Plaza"
            walkMinutes={Math.round(travelTimes?.hoPlazaWalking || 0)}
            classes={classes}
          />
          <WalkDistanceRow
            location="Ag Quad"
            walkMinutes={Math.round(travelTimes?.agQuadWalking || 0)}
            classes={classes}
          />
          <Typography className={classes.distanceLabel} style={{ marginTop: 10 }}>
            Distance to Transportation
          </Typography>
          <WalkDistanceRow location="College & Oak" walkMinutes={0} classes={classes} />
        </div>

        {/* Amenity rows - all placeholder */}
        {amenityKeys.map((key, i) => (
          <div
            key={key}
            className={`${classes.dataRow} ${
              i % 2 === 0 ? classes.dataRowGray : classes.dataRowWhite
            }`}
          >
            <AmenityIcon value={null} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonPage;

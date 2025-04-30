import { ApartmentWithId } from '@common/types/db-types';

/**
 * PropertyCard Component
 *
 * This component displays a concise card view of an apartment property, designed for use within
 * newsletter sections. It shows the property's image, name, address, and key details like
 * number of beds. The component uses a consistent styling approach with a default placeholder
 * image if no property photos are provided.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {ApartmentWithId} props.property - The apartment property data to display, including photos,
 *                                           name, address, and number of beds.
 * @returns {ReactElement} PropertyCard component.
 */
const PropertyCard = ({ property }: { property: ApartmentWithId }): React.ReactElement => (
  <>
    <img
      src={
        property.photos?.[1] ??
        'https://images.squarespace-cdn.com/content/v1/665f8368e87e4548121b2b1b/1739995859299-Q3ZMFXYTF9PB4FXHRKE1/Carey-Building-Apartments_ALT.jpg'
      }
      alt={property.name || 'Property'}
      style={{ borderRadius: '8px', width: '150px', height: '122px', overflow: 'hidden' }}
    />
    <h2
      style={{
        color: '#000',
        fontSize: '12px',
        fontWeight: '600',
      }}
    >
      {property.name || `Property at ${property.address}`}
    </h2>
    <p
      style={{
        color: '#5D5D5D',
        fontSize: '12px',
      }}
    >
      {property.address}
    </p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', textAlign: 'center', marginRight: '10px' }}
      >
        <img
          src="https://static-00.iconduck.com/assets.00/money-icon-1024x1024-f6dh1k6o.png"
          alt="$"
          style={{ width: '13px', height: '13px', marginRight: '4px' }}
        />
        <p style={{ fontWeight: '600', fontSize: '12px', margin: '0', color: '#000' }}>price</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/952/952772.png"
          alt="bed"
          style={{ width: '16px', height: '16px', marginRight: '4px' }}
        />
        <p style={{ fontWeight: '600', fontSize: '12px', margin: '0', color: '#000' }}>
          {property.numBeds} Bed
        </p>
      </div>
    </div>
  </>
);

export default PropertyCard;

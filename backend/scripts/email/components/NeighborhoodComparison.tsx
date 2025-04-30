import { Section } from '@react-email/components';

type Props = {
  name1: string;
  name2: string;
  description1: string;
  description2: string;
  image1: string;
  image2: string;
};

/**
 * NeighborhoodComparison Component
 *
 * This component compares two neighborhoods by displaying images, names, and descriptions side by side.
 * It is designed to give users a clear visual and textual comparison between the two areas. The component
 * is styled with a flexible layout for easy integration into newsletters or other similar sections.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.name1 - The name of the first neighborhood to compare.
 * @param {string} props.name2 - The name of the second neighborhood to compare.
 * @param {string} props.description1 - A description of the first neighborhood.
 * @param {string} props.description2 - A description of the second neighborhood.
 * @param {string} props.image1 - The URL of the image representing the first neighborhood.
 * @param {string} props.image2 - The URL of the image representing the second neighborhood.
 * @returns {ReactElement} NeighborhoodComparison component.
 */
const NeighborhoodComparison: React.FC<Props> = ({
  name1,
  name2,
  description1,
  description2,
  image1,
  image2,
}: Props) => (
  <Section
    style={{
      backgroundColor: '#F6F6F6',
      borderRadius: '8px',
      padding: '22px 20px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px',
    }}
  >
    <h1
      style={{
        color: '#B94630',
        fontSize: '22.5px',
        fontWeight: '700',
      }}
    >
      Neighborhood Comparison
    </h1>
    <table>
      <tr>
        <td style={{ width: '44%' }}>
          <div style={{ maxWidth: '230px', marginRight: '10px' }}>
            <img
              src={image1}
              alt=""
              style={{
                borderRadius: '8px',
                width: '100%',
                height: 'auto',
                overflow: 'hidden',
                marginBottom: '5px',
              }}
            />
            <p
              style={{
                color: '#5D5D5D',
                fontSize: '16px',
                lineHeight: '1.5',
                margin: '0',
              }}
            >
              {name1}
            </p>
            <p
              style={{
                color: '#5D5D5D',
                fontSize: '14.5px',
                lineHeight: '1.5',
                margin: '0',
              }}
            >
              {description1}
            </p>
          </div>
        </td>
        <td style={{ width: '44%', maxWidth: '230px' }}>
          <div style={{ maxWidth: '230px', marginLeft: '10px' }}>
            <img
              src={image2}
              alt=""
              style={{
                borderRadius: '8px',
                width: '100%',
                height: 'auto',
                overflow: 'hidden',
                marginBottom: '5px',
              }}
            />
            <p
              style={{
                color: '#5D5D5D',
                fontSize: '16px',
                lineHeight: '1.5',
                margin: '0',
              }}
            >
              {name2}
            </p>
            <p
              style={{
                color: '#5D5D5D',
                fontSize: '14.5px',
                lineHeight: '1.5',
                margin: '0',
              }}
            >
              {description2}
            </p>
          </div>
        </td>
      </tr>
    </table>
  </Section>
);

export default NeighborhoodComparison;

import { Section } from '@react-email/components';

type Props = {
  gifUrl: string;
  description: string;
};

/**
 * ReelsFeature Component
 *
 * This component showcases the "CU on Reels" feature, displaying a GIF representing the feature
 * and a brief description. It includes a call-to-action button linking to the Instagram page for
 * CU Apts, encouraging users to explore more content. The component is styled with a modern and
 * clean layout for easy integration into newsletters or email templates.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.gifUrl - The URL of the GIF to display in the feature.
 * @param {string} props.description - A brief description of the "CU on Reels" feature.
 * @returns {ReactElement} ReelsFeature component.
 */
const ReelsFeature: React.FC<Props> = ({ gifUrl, description }: Props) => (
  <Section
    style={{
      backgroundColor: '#F6F6F6',
      borderRadius: '8px',
      padding: '22px 20px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '20px',
      alignItems: 'center',
    }}
  >
    <table>
      <tr>
        <td width="40%">
          <img src={gifUrl} alt="" style={{ marginRight: '40px', maxWidth: '170px' }} />
        </td>
        <td>
          <h1
            style={{
              color: '#B94630',
              fontSize: '22.5px',
              fontWeight: '700',
              marginBottom: '15px',
            }}
          >
            CU on Reels!
          </h1>
          <p style={{ color: '#5D5D5D', fontSize: '14.976px', marginBottom: '15px' }}>
            {description}
          </p>
          <div style={{ backgroundColor: '#B94630', padding: '10px 12px', borderRadius: '8px' }}>
            <a
              href="https://www.instagram.com/cuapts/"
              style={{
                textDecoration: 'none',
              }}
            >
              View More
            </a>
          </div>
        </td>
      </tr>
    </table>
  </Section>
);

export default ReelsFeature;

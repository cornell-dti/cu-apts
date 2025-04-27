import { Section } from '@react-email/components';

type Props = {
  gifUrl: string;
  description: string;
};

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
          <img src={gifUrl} alt="" style={{ marginRight: '5px', maxWidth: '170px' }} />
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
          <a
            href="https://www.instagram.com/cuapts/"
            style={{
              backgroundColor: '#B94630',
              padding: '10px 12px',
              borderRadius: '8px',
              color: '#FFF6F6',
              textDecoration: 'none',
              marginTop: '15px',
            }}
          >
            View More
          </a>
        </td>
      </tr>
    </table>
  </Section>
);

export default ReelsFeature;

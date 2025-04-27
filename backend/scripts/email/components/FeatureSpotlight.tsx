import { Section } from '@react-email/components';

type Props = {
  imgUrl: string;
  featureName: string;
  description: string;
};

const FeatureSpotlight: React.FC<Props> = ({ imgUrl, featureName, description }: Props) => (
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
    <h1
      style={{
        color: '#B94630',

        fontSize: '22.5px',
        fontWeight: '700',
        margin: '15px 0',
      }}
    >
      New Feature on CU Apts
    </h1>
    <img
      src={imgUrl}
      alt=""
      style={{
        borderRadius: '8px',
        border: '1px solid #E6E6E6',
        width: '100%',
        marginBottom: '22px',
      }}
    />
    <h2
      style={{
        color: '#000',

        fontSize: '14.5px',
        fontWeight: '600',
        margin: '0 0 10px 0',
      }}
    >
      {featureName}
    </h2>
    <p style={{ color: '#5D5D5D', fontSize: '14.976px' }}>{description}</p>
  </Section>
);

export default FeatureSpotlight;

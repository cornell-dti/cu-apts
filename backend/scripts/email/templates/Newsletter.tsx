import { Html, Head, Body, Container, Text, Heading } from '@react-email/components';
import AreaSpotlight from '../components/AreaSpotlight';
import LandlordHighlight from '../components/LandlordHighlight';
import { Area, LandlordSpotlight, Advice } from './Types';

type NewsletterProps = {
  headline?: string;
  firstName: string;
  introductionMessage: string;
  landlordSpotlight?: LandlordSpotlight[];
  areaSpotlight?: Area;
  advice?: Advice;
};

const Newsletter: React.FC<NewsletterProps> = ({
  firstName,
  headline,
  introductionMessage,
  landlordSpotlight,
  areaSpotlight,
  advice,
}: NewsletterProps) => {
  const chatBubbleBase64 =
    'data:image/jpeg;base64,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';
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />

        {/* Add fallback font stack in case Google Fonts fail */}
        <style>
          {`
      * {
        font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
    `}
        </style>
      </Head>
      <Body
        style={{
          fontFamily: "'Work Sans', Verdana, Arial, sans-serif",
          margin: '0',
          padding: '0',
        }}
      >
        <Text>{headline}</Text>
        <Container
          style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            border: '1.5px solid #F6F6F6',
            borderRadius: '15px',
            backgroundColor: '#ffffff',
          }}
        >
          <Text
            style={{
              fontFamily: 'Work-Sans,  Verdana, Arial, sans-serif',
              fontSize: '14.5px',
              lineHeight: '1.5',
              textAlign: 'center',
            }}
          >
            <strong>Hi {firstName}!</strong> {introductionMessage}
          </Text>
          {landlordSpotlight &&
            landlordSpotlight.map((landlord) => (
              <LandlordHighlight
                landlordData={landlord.landlord}
                landlordMessage={landlord.message}
                landlordReview={landlord.review}
              />
            ))}
          {areaSpotlight && (
            <AreaSpotlight
              imageUrl={areaSpotlight.imageURL}
              name={areaSpotlight.name}
              description={areaSpotlight.description}
            />
          )}

          {advice && (
            <Container style={{ display: 'flex', flexDirection: 'row', alignContent: 'end' }}>
              <img src={chatBubbleBase64} alt="chatbubble" />
              <div>
                <Heading>Advice from Upperclassmen</Heading>
                <p>{advice.message}</p>
                <p>
                  {advice.name}, {advice.year}, {advice.major}, {advice.apartment}
                </p>
              </div>
            </Container>
          )}
        </Container>
      </Body>
    </Html>
  );
};
Newsletter.defaultProps = {
  headline: 'Welcome to CUApts',
  landlordSpotlight: undefined,
  areaSpotlight: undefined,
  advice: undefined,
};
export default Newsletter;

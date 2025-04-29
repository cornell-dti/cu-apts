import { Html, Head, Body, Container, Text } from '@react-email/components';
import {
  AreaProps,
  LandlordSpotlightProps,
  AdviceProps,
  ReelsProps,
  FeatureSpotlightProps,
  NeighborhoodCompProps,
  SubleaseProps,
} from './Types';
import AreaSpotlight from '../components/AreaSpotlight';
import LandlordHighlight from '../components/LandlordHighlight';
import NeighborhoodComparison from '../components/NeighborhoodComparison';
import SubleaseSpotlight from '../components/SubleaseSpotlight';
import FeatureSpotlight from '../components/FeatureSpotlight';
import ReelsFeature from '../components/ReelsFeature';

type NewsletterProps = {
  firstName: string;
  introductionMessage: string;
  landlordSpotlight?: LandlordSpotlightProps[];
  areaSpotlight?: AreaProps;
  advice?: AdviceProps;
  reels?: ReelsProps;
  newFeature?: FeatureSpotlightProps;
  neighborhoodComparison?: NeighborhoodCompProps;
  subleaseSpotlight?: SubleaseProps;
};

/**
 * Newsletter Component
 *
 * This component generates an email newsletter template for CUApts, featuring multiple optional sections
 * like landlord spotlights, area features, advice from upperclassmen, and new feature announcements.
 * The newsletter is responsive and maintains consistent styling using the Work Sans font family.
 * Each section is conditionally rendered based on the provided props.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.firstName - The recipient's first name for personalized greeting.
 * @param {string} props.introductionMessage - Opening message that appears after the greeting.
 * @param {LandlordSpotlightProps[]} [props.landlordSpotlight] - Array of landlord information to showcase (optional).
 * @param {AreaProps} [props.areaSpotlight] - Information about a featured housing area (optional).
 * @param {AdviceProps} [props.advice] - Upperclassmen advice section content (optional).
 * @param {ReelsProps} [props.reels] - Content for featuring video reels (optional).
 * @param {FeatureSpotlightProps} [props.newFeature] - Information about a new platform feature (optional).
 * @param {NeighborhoodCompProps} [props.neighborhoodComparison] - Data for comparing two neighborhoods (optional).
 * @param {SubleaseProps} [props.subleaseSpotlight] - Information about featured subleasing opportunities (optional).
 * @returns {ReactElement} Newsletter component.
 */
const Newsletter: React.FC<NewsletterProps> = ({
  firstName,
  introductionMessage,
  landlordSpotlight,
  areaSpotlight,
  advice,
  reels,
  newFeature,
  neighborhoodComparison,
  subleaseSpotlight,
}: NewsletterProps) => (
  <Html>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />

      <style>
        {`
      * {
        font-family: 'Work Sans', sans-serif;
      }
    `}
      </style>
    </Head>
    <Body
      style={{
        fontFamily: 'Work Sans, sans-serif',
        margin: '0',
        padding: '0',
        width: '100%',
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      {/* header */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <img
          src="https://i.postimg.cc/26VJr7yV/headline-background.png"
          alt=""
          style={{ width: '100%', height: 'auto', maxWidth: '700px', marginBottom: '20px' }}
        />
      </div>

      {/* main email body */}
      <Container
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          border: '1.5px solid #F6F6F6',
          borderRadius: '15px',
          backgroundColor: '#ffffff',
          marginBottom: '20px',
        }}
      >
        <Text
          style={{
            fontSize: '14.5px',
            lineHeight: '1.5',
            textAlign: 'center',
            marginBottom: '20px',
            color: '#5D5D5D',
            fontWeight: '400',
          }}
        >
          <strong style={{ fontWeight: '700' }}>Hi {firstName}!</strong> {introductionMessage}
        </Text>

        {/* landlord section */}
        {landlordSpotlight &&
          landlordSpotlight.map((landlord) => (
            <LandlordHighlight
              landlordData={landlord.landlord}
              landlordMessage={landlord.message}
              landlordReview={landlord.review}
              popularProperties={landlord.lovedProperties}
              recentProperties={landlord.recentProperties}
            />
          ))}

        {/* area section */}
        {areaSpotlight && (
          <AreaSpotlight
            imageUrl={areaSpotlight.imageURL}
            name={areaSpotlight.name}
            description={areaSpotlight.description}
            recentProperties={areaSpotlight.properties}
            activities={areaSpotlight.activities}
          />
        )}

        {/* New Feature Spotlight */}
        {newFeature && (
          <FeatureSpotlight
            imgUrl={newFeature.imgUrl}
            featureName={newFeature.featureName}
            description={newFeature.description}
          />
        )}

        {/* Neighborhood Comparison */}
        {neighborhoodComparison && (
          <NeighborhoodComparison
            name1={neighborhoodComparison.name1}
            name2={neighborhoodComparison.name2}
            description1={neighborhoodComparison.description1}
            description2={neighborhoodComparison.description2}
            image1={neighborhoodComparison.image1}
            image2={neighborhoodComparison.image2}
          />
        )}

        {/* Sublease Spotlight */}
        {subleaseSpotlight && (
          <SubleaseSpotlight
            imgUrl={subleaseSpotlight.imgUrl}
            email={subleaseSpotlight.email}
            description={subleaseSpotlight.description}
            phoneNumber={subleaseSpotlight.phoneNumber ?? undefined}
          />
        )}

        {/* Reels Feature */}
        {reels && <ReelsFeature gifUrl={reels.gifUrl} description={reels.description} />}

        {/* advice section */}
        {advice && (
          <table
            cellPadding="0"
            cellSpacing="0"
            style={{ width: '100%', padding: '10px 0px', marginBottom: '20px' }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    width: '20%',
                    verticalAlign: 'middle',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src="https://i.postimg.cc/m21M8DVG/chatbubble-ellipses-outline.png"
                    alt=""
                    style={{ width: '50%', height: 'auto' }}
                  />
                </td>
                <td style={{ width: '90%', verticalAlign: 'top' }}>
                  <h1
                    style={{
                      color: '#B94630',

                      fontSize: '22.5px',
                      fontWeight: '700',
                    }}
                  >
                    Advice from Upperclassmen
                  </h1>
                  <p style={{ color: '#5D5D5D', fontSize: '15px' }}>{advice.message}</p>
                  <p style={{ color: '#5D5D5D', fontSize: '15px', textAlign: 'end' }}>
                    {advice.name}, {advice.year}, {advice.major}, {advice.apartment}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Container>

      {/* footer */}
      <Container
        style={{
          background: '#A82A12',
          color: 'white',
          width: '100%',
          padding: '28.148px 53.271px 28.393px 53px',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '700px',
        }}
      >
        <table>
          <tbody>
            <tr>
              <td style={{ marginRight: '38px', alignContent: 'end' }}>
                <img
                  src="https://i.postimg.cc/d0shPtR3/Primary-Logo-with-Text.png"
                  alt="CU-Apts logo"
                  style={{
                    width: '105px',
                    height: 'auto',
                    marginRight: '30px',
                  }}
                />
              </td>
              <td style={{ fontSize: '12px', color: '#FFCFC7', lineHeight: '12.5px' }}>
                <p>
                  You&apos;re signed up to this email as [EMAIL HERE]. Manage email preferences.{' '}
                </p>
                <p>
                  Don&apos;t see your apartments? Submit{' '}
                  <a style={{ color: '#FFCFC7' }} href="https://www.cuapts.org/">
                    here!
                  </a>
                </p>
                <p>Submit subleases here!</p>
                <div style={{ display: 'flex' }}>
                  <a href="https://www.cuapts.org/">
                    <img
                      src="https://i.postimg.cc/kGGHMF52/globe-outline.jpg"
                      alt=""
                      style={{ width: '28px', height: '28px', marginRight: '15px' }}
                    />
                  </a>
                  <a href="https://www.instagram.com/cuapts/">
                    <img
                      src="https://i.postimg.cc/3WMzL0KW/logo-instagram.jpg"
                      alt=""
                      style={{ width: '28px', height: '28px' }}
                    />
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Container>
    </Body>
  </Html>
);

Newsletter.defaultProps = {
  // headline: 'Welcome to CUApts',
  landlordSpotlight: undefined,
  areaSpotlight: undefined,
  advice: undefined,
  reels: undefined,
  newFeature: undefined,
  neighborhoodComparison: undefined,
  subleaseSpotlight: undefined,
};
export default Newsletter;

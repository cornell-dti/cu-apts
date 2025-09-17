import { Html, Head, Body, Container, Text } from '@react-email/components';
import {
  AreaProps,
  AdviceProps,
  ReelsProps,
  FeatureSpotlightProps,
  NeighborhoodCompProps,
  SubleaseProps,
} from './Types';
import AreaSpotlight from '../components/AreaSpotlight';
import NeighborhoodComparison from '../components/NeighborhoodComparison';
import SubleaseSpotlight from '../components/SubleaseSpotlight';
import FeatureSpotlight from '../components/FeatureSpotlight';
import ReelsFeature from '../components/ReelsFeature';
import Header from '../components/Header';

type NewsletterProps = {
  firstName: string;
  introductionMessage: string;
  areaSpotlight?: AreaProps;
  advice?: AdviceProps;
  reels?: ReelsProps;
  newFeature?: FeatureSpotlightProps;
  neighborhoodComparison?: NeighborhoodCompProps;
  subleaseSpotlight?: SubleaseProps;
  headerUrl: string;
};

/**
 * Newsletter Component
 *
 * This component generates an email newsletter template for CUApts, featuring multiple optional sections
 * like area features, advice from upperclassmen, and new feature announcements.
 * The newsletter is responsive and maintains consistent styling using the Work Sans font family.
 * Each section is conditionally rendered based on the provided props.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.firstName - The recipient's first name for personalized greeting.
 * @param {string} props.introductionMessage - Opening message that appears after the greeting.
 * @param {AreaProps} [props.areaSpotlight] - Information about a featured housing area (optional).
 * @param {AdviceProps} [props.advice] - Upperclassmen advice section content (optional).
 * @param {ReelsProps} [props.reels] - Content for featuring video reels (optional).
 * @param {FeatureSpotlightProps} [props.newFeature] - Information about a new platform feature (optional).
 * @param {NeighborhoodCompProps} [props.neighborhoodComparison] - Data for comparing two neighborhoods (optional).
 * @param {SubleaseProps} [props.subleaseSpotlight] - Information about featured subleasing opportunities (optional).
 * @returns {ReactElement} Newsletter component.
 */
const Newsletter: React.FC<NewsletterProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  firstName,
  introductionMessage,
  areaSpotlight,
  advice,
  reels,
  newFeature,
  neighborhoodComparison,
  subleaseSpotlight,
  headerUrl,
}: NewsletterProps) => (
  <Html>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />

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
        backgroundColor: '#ffffffff',
        mixBlendMode: 'normal',
        isolation: 'isolate',
        colorScheme: 'light only',
      }}
    >
      <Header headerUrl={headerUrl} />

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
          mixBlendMode: 'normal',
          isolation: 'isolate',
          colorScheme: 'light only',
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
            mixBlendMode: 'normal',
            isolation: 'isolate',
            colorScheme: 'light only',
          }}
        >
          <strong
            style={{
              fontWeight: '700',
              color: '#5D5D5D',
              mixBlendMode: 'normal',
              isolation: 'isolate',
            }}
          >
            Hi!
          </strong>{' '}
          {introductionMessage}
        </Text>

        {/* area section */}
        {areaSpotlight && (
          <div
            style={{
              mixBlendMode: 'normal',
              isolation: 'isolate',
              colorScheme: 'light only',
            }}
          >
            <AreaSpotlight
              imageUrl={areaSpotlight.imageURL}
              name={areaSpotlight.name}
              description={areaSpotlight.description}
              recentProperties={areaSpotlight.properties}
              activities={areaSpotlight.activities}
            />
          </div>
        )}

        {/* New Feature Spotlight */}
        {newFeature && (
          <div
            style={{
              mixBlendMode: 'normal',
              isolation: 'isolate',
              colorScheme: 'light only',
            }}
          >
            <FeatureSpotlight
              imgUrl={newFeature.imgUrl}
              featureName={newFeature.featureName}
              description={newFeature.description}
            />
          </div>
        )}

        {/* Neighborhood Comparison */}
        {neighborhoodComparison && (
          <div
            style={{
              mixBlendMode: 'normal',
              isolation: 'isolate',
              colorScheme: 'light only',
            }}
          >
            <NeighborhoodComparison
              name1={neighborhoodComparison.name1}
              name2={neighborhoodComparison.name2}
              description1={neighborhoodComparison.description1}
              description2={neighborhoodComparison.description2}
              image1={neighborhoodComparison.image1}
              image2={neighborhoodComparison.image2}
            />
          </div>
        )}

        {/* Sublease Spotlight */}
        {subleaseSpotlight && (
          <div
            style={{
              mixBlendMode: 'normal',
              isolation: 'isolate',
              colorScheme: 'light only',
            }}
          >
            <SubleaseSpotlight
              imgUrl={subleaseSpotlight.imgUrl}
              email={subleaseSpotlight.email}
              description={subleaseSpotlight.description}
              phoneNumber={subleaseSpotlight.phoneNumber ?? undefined}
            />
          </div>
        )}

        {/* Reels Feature */}
        {reels && (
          <div
            style={{
              mixBlendMode: 'normal',
              isolation: 'isolate',
              colorScheme: 'light only',
            }}
          >
            <ReelsFeature gifUrl={reels.gifUrl} description={reels.description} />
          </div>
        )}

        {/* advice section */}
        {advice && (
          <table
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: '100%',
              padding: '10px 0px',
              marginBottom: '20px',
              mixBlendMode: 'normal',
              isolation: 'isolate',
              colorScheme: 'light only',
            }}
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
                      mixBlendMode: 'normal',
                      isolation: 'isolate',
                      colorScheme: 'light only',
                    }}
                  >
                    Advice from Upperclassmen
                  </h1>
                  <p
                    style={{
                      color: '#5D5D5D',
                      fontSize: '15px',
                      mixBlendMode: 'normal',
                      isolation: 'isolate',
                      colorScheme: 'light only',
                    }}
                  >
                    {advice.message}
                  </p>
                  <p
                    style={{
                      color: '#5D5D5D',
                      fontSize: '15px',
                      textAlign: 'end',
                      mixBlendMode: 'normal',
                      isolation: 'isolate',
                      colorScheme: 'light only',
                    }}
                  >
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
          mixBlendMode: 'normal',
          isolation: 'isolate',
          colorScheme: 'light only',
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
              <td
                style={{
                  fontSize: '12px',
                  color: '#FFCFC7',
                  lineHeight: '12.5px',
                  mixBlendMode: 'normal',
                  isolation: 'isolate',
                  colorScheme: 'light only',
                }}
              >
                <p>
                  You&apos;re signed up to this email as [EMAIL HERE]. Manage email preferences.{' '}
                </p>
                <p>
                  Don&apos;t see your apartments? Submit{' '}
                  <a
                    style={{
                      color: '#FFCFC7',
                      mixBlendMode: 'normal',
                      isolation: 'isolate',
                    }}
                    href="https://www.cuapts.org/"
                  >
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
  areaSpotlight: undefined,
  advice: undefined,
  reels: undefined,
  newFeature: undefined,
  neighborhoodComparison: undefined,
  subleaseSpotlight: undefined,
};
export default Newsletter;

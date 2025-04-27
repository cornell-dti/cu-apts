// eslint-disable-next-line no-use-before-define
import React from 'react';
import { Section, Img, Text, Heading } from '@react-email/components';

type Props = {
  imageUrl: string;
  name: string;
  description: string;
  // other props
};

const AreaSpotlight: React.FC<Props> = ({ imageUrl, name, description }: Props) => (
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
    <Heading
      style={{
        color: '#B94630',

        fontSize: '22.5px',
        fontWeight: '700',
        margin: '15px 0',
      }}
    >
      Area Spotlight
    </Heading>
    <table cellPadding="0" cellSpacing="0" style={{ width: '100%' }}>
      <tbody>
        <tr>
          <td style={{ width: '50%', paddingRight: '2%', verticalAlign: 'top' }}>
            <Img
              src={imageUrl}
              alt={name}
              style={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: '6px',
              }}
            />
          </td>
          <td style={{ width: '120px', verticalAlign: 'top' }}>
            <Heading
              as="h2"
              style={{
                color: '#000',

                fontSize: '14.5px',
                fontWeight: '600',
                margin: '0 0 10px 0',
              }}
            >
              {name}
            </Heading>
            <Text
              style={{
                color: '#5D5D5D',
                fontSize: '14.5px',
                lineHeight: '1.5',
                margin: '0',
              }}
            >
              {description}
            </Text>
          </td>
        </tr>
      </tbody>
    </table>

    <Heading
      as="h2"
      style={{
        color: '#000',

        fontSize: '14.5px',
        fontWeight: '600',
        margin: '15px 0',
      }}
    >
      Recently Released/ Vacant
    </Heading>

    <Heading
      as="h2"
      style={{
        color: '#000',

        fontSize: '14.5px',
        fontWeight: '600',
        margin: '15px 0',
      }}
    >
      Things To Do Around This Area
    </Heading>

    <div style={{ display: 'flex' }}>
      <Section
        style={{
          background: 'white',
          borderRadius: '6px',
          border: '0.406px solid #E8E8E8',
          width: '33%',
          padding: '7px',
          margin: '5px',
        }}
      >
        <img
          src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/29/8c/c2/photo3jpg.jpg?w=200&h=-1&s=1"
          alt=""
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
        <p style={{ fontWeight: '700' }}>Elife Market</p>
        <p style={{ color: '#5D5D5D' }}>111 Dryden Rd</p>
      </Section>

      <Section
        style={{
          background: 'white',
          borderRadius: '6px',
          border: '0.406px solid #E8E8E8',
          width: '33%',
          padding: '7px',
          margin: '5px',
        }}
      >
        <img
          src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/29/8c/c2/photo3jpg.jpg?w=200&h=-1&s=1"
          alt=""
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
        <p style={{ fontWeight: '700' }}>Elife Market</p>
        <p style={{ color: '#5D5D5D' }}>111 Dryden Rd</p>
      </Section>

      <Section
        style={{
          background: 'white',
          borderRadius: '6px',
          border: '0.406px solid #E8E8E8',
          width: '33%',
          padding: '7px',
          margin: '5px',
        }}
      >
        <img
          src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/29/8c/c2/photo3jpg.jpg?w=200&h=-1&s=1"
          alt=""
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
        <p style={{ fontWeight: '700' }}>Elife Market</p>
        <p style={{ color: '#5D5D5D' }}>111 Dryden Rd</p>
      </Section>
    </div>
  </Section>
);

export default AreaSpotlight;

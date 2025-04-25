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
      gap: '22px',
      alignItems: 'center',
    }}
  >
    <Heading
      style={{
        color: '#B94630',
        fontFamily: 'Work-Sans, Arial, sans-serif',
        fontSize: '22.5px',
        fontWeight: '700',
        margin: '15px 0',
      }}
    >
      Area Spotlight
    </Heading>

    <Section style={{ display: 'flex', flexDirection: 'row', alignContent: 'start' }}>
      <Img
        src={imageUrl}
        alt={name}
        style={{
          marginRight: '2%',
          width: '50%',
          overflow: 'hidden',
          borderRadius: '6px',
        }}
      />
      <Section style={{ display: 'flex', flexDirection: 'column', width: '120px' }}>
        <Heading
          as="h2"
          style={{
            color: '#000',
            fontFamily: 'Work-Sans, Arial, sans-serif',
            fontSize: '14.5px',
            fontWeight: '600',
            margin: '0 0 10px 0',
          }}
        >
          {name}
        </Heading>
        <Text
          style={{
            fontFamily: 'Work-Sans, Arial, sans-serif',
            color: '#5D5D5D',
            fontSize: '14.5px',
            lineHeight: '1.5',
            margin: '0',
          }}
        >
          {description}
        </Text>
      </Section>
    </Section>

    <Heading
      as="h2"
      style={{
        color: '#000',
        fontFamily: 'Work-Sans, Arial, sans-serif',
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
        fontFamily: 'Work-Sans, Arial, sans-serif',
        fontSize: '14.5px',
        fontWeight: '600',
        margin: '15px 0',
      }}
    >
      Things To Do Around This Area
    </Heading>
  </Section>
);

export default AreaSpotlight;

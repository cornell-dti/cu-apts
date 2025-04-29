type Props = {
  imgUrl: string;
  description: string;
  phoneNumber?: string;
  email: string;
};

/**
 * SubleaseSpotlight Component
 *
 * This component showcases a "Sublease Spotlight" section, designed to display key details about
 * a sublease opportunity. It includes an image, a description, and optional contact information
 * such as a phone number and email. The component is styled with a clean, modern layout and
 * uses default icons for contact details when available.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.imgUrl - The URL of the image to display in the spotlight section.
 * @param {string} props.description - A brief description of the sublease opportunity.
 * @param {string} [props.phoneNumber] - The phone number for contacting regarding the sublease (optional).
 * @param {string} props.email - The email address for contacting regarding the sublease.
 * @returns {ReactElement} SubleaseSpotlight component.
 */

const SubleaseSpotlight: React.FC<Props> = ({ imgUrl, description, phoneNumber, email }: Props) => (
  <table
    style={{
      backgroundColor: '#F6F6F6',
      borderRadius: '8px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px',
    }}
  >
    <tr>
      <td>
        <img
          src={imgUrl}
          alt=""
          style={{
            borderRadius: '8px',
            marginRight: '20px',
            height: '190px',
            width: '190px',
            overflow: 'hidden',
          }}
        />
      </td>
      <td>
        <h1
          style={{
            color: '#B94630',
            fontSize: '22.5px',
            fontWeight: '700',
            margin: '0 0 15px 0',
          }}
        >
          Sublease Spotlight
        </h1>
        <p
          style={{
            color: '#5D5D5D',
            fontSize: '14.5px',
            lineHeight: '1.5',
            marginBottom: '5px',
          }}
        >
          {description}
        </p>
        {phoneNumber && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="https://i.pinimg.com/736x/6c/99/1f/6c991fb7ebe3cdff3856bd0c1b46b41e.jpg"
              alt=""
              style={{ width: '20px', height: 'auto', marginRight: '5px' }}
            />
            <p
              style={{
                color: '#5D5D5D',
                fontSize: '13px',
                margin: '0',
              }}
            >
              Number: {phoneNumber}
            </p>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://icons.veryicon.com/png/o/business/official-icon-library-of-alibaba/email-fill.png"
            alt=""
            style={{ width: '20px', height: 'auto', marginRight: '5px' }}
          />
          <p
            style={{
              color: '#5D5D5D',
              fontSize: '13px',
              lineHeight: '1.5',
              margin: '0',
              width: '215',
            }}
          >
            Email: {email}
          </p>
        </div>
      </td>
    </tr>
  </table>
);

SubleaseSpotlight.defaultProps = {
  phoneNumber: undefined,
};

export default SubleaseSpotlight;

type Props = {
  imgUrl: string;
  description: string;
  phoneNumber?: string;
  email: string;
};

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
            margin: '15px 0',
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
          <div style={{ display: 'flex' }}>
            <img
              src="https://i.pinimg.com/736x/6c/99/1f/6c991fb7ebe3cdff3856bd0c1b46b41e.jpg"
              alt=""
              style={{ width: '20px', height: 'auto', marginRight: '5px' }}
            />
            <p
              style={{
                color: '#5D5D5D',
                fontSize: '11px',
                margin: '0',
              }}
            >
              Number: {phoneNumber}
            </p>
          </div>
        )}
        <div>
          <img
            src="https://icons.veryicon.com/png/o/business/official-icon-library-of-alibaba/email-fill.png"
            alt=""
            style={{ width: '20px', height: 'auto', marginRight: '5px' }}
          />
          <p
            style={{
              color: '#5D5D5D',
              fontSize: '11px',
              lineHeight: '1.5',
              margin: '0',
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

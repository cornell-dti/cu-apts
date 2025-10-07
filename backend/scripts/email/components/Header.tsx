/* eslint-disable react/prop-types */
import { ReactElement } from 'react';

/**
 * Header Component
 *
 * This component displays the header at the top of a newsletter.
 * Uses responsive design to show different images on desktop vs mobile (not supported on all email services—will render as only desktop in some inboxes).
 *
 * @component
 * @param {string} headerUrl - URL of the header image to display (for desktop).
 * @returns {ReactElement} Header component.
 */
interface HeaderProps {
  headerUrl: string;
}
const Header: React.FC<HeaderProps> = ({ headerUrl }): ReactElement => (
  // Responsive header for email (inline styles with media queries)
  <>
    <style>
      {`
      .desktop-header {
        text-align: center;
        width: 100%;
        display: block;
      }
      
      .mobile-header {
        display: none;
        text-align: center;
        width: 100%;
      }
      
      @media (max-width: 768px) {
        .desktop-header {
          display: none !important;
        }
        
        .mobile-header {
          display: block !important;
        }
      }
    `}
    </style>

    {/* Desktop header */}
    <div
      className="desktop-header"
      style={{ textAlign: 'center', width: '100%', display: 'block' }}
    >
      <img
        src={headerUrl}
        alt=""
        style={{ width: '100%', height: 'auto', maxWidth: '700px', marginBottom: '20px' }}
      />
    </div>

    {/* Mobile header */}
    <div className="mobile-header" style={{ display: 'none', textAlign: 'center', width: '100%' }}>
      <img
        src="https://i.postimg.cc/LXDfyV1j/mobile-header.png"
        alt=""
        style={{ width: '100%', height: 'auto', maxWidth: '100%', marginBottom: '20px' }}
      />
    </div>
  </>
);

Header.defaultProps = {
  headerUrl: 'https://i.postimg.cc/7Ps1ZM8d/header.png',
};

export default Header;

import React, { ReactElement, useEffect, useState } from 'react';
import icon from '../images/home-icon.png';
import { Link } from 'react-router-dom';
import styles from './FAQNavBar.module.scss';
import { Dropdown } from 'react-bootstrap';

const FAQNavBar = (): ReactElement => {
  const [toggleMenu, setToggle] = React.useState(false);
  const clickToggle = (): void => {
    setToggle(!toggleMenu);
  };
  const [width, setWidth] = useState(0);
  const update = (): void => {
    setWidth(window.innerWidth);
    if (width > 600) {
      setToggle(false);
    }
  };

  window.addEventListener('resize', update);
  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayMobileMenu = (): ReactElement => {
    return (
      <Dropdown show={toggleMenu} onToggle={clickToggle}>
        <Dropdown.Toggle>
          <span className={`navbar-toggler-icon ${styles.navbarTogglerIcon}`}></span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link className="links" to="/reviews">
              Reviews
            </Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const displayNavBar = (): ReactElement => {
    return (
      <ul className={`nav ${styles.navButtonMargin}`}>
        <li>
          <button type="button" className="btn btn-lg btn-outline-dark">
            <Link to="/reviews" className="links">
              Reviews
            </Link>
          </button>
        </li>
      </ul>
    );
  };

  return (
    <div>
      <nav className={`${styles.navbarExpandLg} navbar navbar-light ${styles.faqNavbar}`}>
        <a className="navbar-brand" href="/">
          <h1>
            <img className={styles.logo} src={icon} width="40" height="auto" alt="home icon" /> CU
            Housing
          </h1>
        </a>

        {width > 600 ? displayNavBar() : displayMobileMenu()}
      </nav>
    </div>
  );
};

export default FAQNavBar;

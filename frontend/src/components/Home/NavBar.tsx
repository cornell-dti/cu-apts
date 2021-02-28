import React, { ReactElement, useState, useEffect } from 'react';
import icon from '../images/home-icon.png';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import styles from './NavBar.module.scss';

const NavBar = (): ReactElement => {
  const [toggleMenu, setToggle] = useState(false);
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
      <Dropdown isOpen={toggleMenu} toggle={clickToggle}>
        <DropdownToggle>
          <span className={`navbar-toggler-icon ${styles.navbarTogglerIcon}`}></span>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem>
            <Link className="links" to="/faq">
              FAQ
            </Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  };

  const displayNavBar = (): ReactElement => {
    return (
      <ul className='nav nav-button-margin' >
              <li>
                <button type="button" className="btn btn-lg btn-outline-dark mr-4" > 
                <Link to='/faq' className="links">FAQ</Link>
                </button>
                <button type="button" className="btn btn-lg btn-outline-dark">
                  <Link to='' className="links">Write Review</Link>
                </button>
              </li>
      </ul>
    );
  };

  return (
    <div>
      <nav className={`navbar navbar-light ${styles.navbarExpandLg}`}>
        <a className="navbar-brand" href="/">
          <h1>
            <img className={styles.logo} src={icon} width="40" height="auto" alt="home icon" /> CU
            Housing
          </h1>
        </a>

        {width > 600 ? displayNavBar() : displayMobileMenu()}
      </nav>

      <div className={styles.homepageDescription}>
        <h5>Search for off-campus housing, review apartments, and share feedback!</h5>
      </div>
    </div>
  );
};

export default NavBar;

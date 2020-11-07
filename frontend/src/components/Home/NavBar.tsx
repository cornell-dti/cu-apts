import React, { ReactElement } from 'react';
import icon from '../images/home-icon.png'
import { Link } from 'react-router-dom'
import HamburgerMenu from 'react-hamburger-menu'

const NavBar= (): ReactElement => {
  const [toggleMenu, setToggle] = React.useState(false)
  const clickToggle = (): void => {
    setToggle(!toggleMenu)
  }
  const [width, setWidth] = React.useState(0)
  const update = (): void => {
    setWidth(window.innerWidth)
    if (width > 1200) {
      setToggle(false)
    }
  }

  window.addEventListener('resize', update)
  React.useEffect(() => {
    update()
  }, [])


  const displayHamburgerMenu = (): ReactElement => {
    return (
      <HamburgerMenu
                    isOpen={toggleMenu}
                    menuClicked={clickToggle}
                    width={25}
                    height={20}
                    strokeWidth={1}
                    rotate={0}
                    color='black'
                    borderRadius={0}
                    animationDuration={0.5}
                />
    )
  }

  const displayMobileMenu = (): ReactElement => {
    return (
      <ul className='hamburgerDropDown'>
              <li><a className="nav-link" href="/faq">FAQ</a></li>
      </ul>
  )
  }

  const displayNavBar = (): ReactElement => {
    return (
      <ul className='nav nav-button-margin' >
              <li>
                <button type="button" className="btn btn-lg btn-outline-dark" > 
                <Link to='/faq' className="links">FAQ</Link>
                </button>
              </li>
      </ul>
  )
  }

  return (
    <div>
    <nav className="navbar navbar-expand-lg navbar-light">
      <a className="navbar-brand" href="/">
      <h1><img className="logo" src={icon} width="40" height="auto" alt="home icon"/> CU Housing</h1>
      </a>
      { toggleMenu ?  displayMobileMenu() : null}
      {width > 1200 ? displayNavBar() : displayHamburgerMenu()}
      
    </nav>
    
    <div className="homepage-description">
    <h5>Search for off-campus housing, review apartments, and share feedback!</h5>
  </div>
  </div>
  );
}

export default NavBar;
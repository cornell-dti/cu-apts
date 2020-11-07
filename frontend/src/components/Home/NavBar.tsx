import React, { ReactElement } from 'react';
import icon from '../images/home-icon.png'
import { Link } from 'react-router-dom'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayMobileMenu = (): ReactElement => {
    return (
      <Dropdown isOpen={toggleMenu} toggle={clickToggle}>
      <DropdownToggle>
        <span className="navbar-toggler-icon"></span>
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem><Link className="links" to="/faq">FAQ</Link></DropdownItem>
      </DropdownMenu>
    </Dropdown>
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

      {width > 600 ? displayNavBar() : displayMobileMenu()}
      
    </nav>
    
    <div className="homepage-description">
    <h5>Search for off-campus housing, review apartments, and share feedback!</h5>
  </div>
  </div>
  );
}

export default NavBar;
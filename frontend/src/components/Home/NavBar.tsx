import React, { ReactElement } from 'react';
import icon from '../assets/home-icon.png'
import { Link } from 'react-router-dom'

const NavBar= (): ReactElement => {
  const [toggleMenu, setToggle] = React.useState(false)
  const clickToggle = (): void => {
    setToggle(!toggleMenu)
  }

  const show: string = toggleMenu? "show" : "";

  return (
    <div>
    <nav className="navbar navbar-expand-lg navbar-light">
      <a className="navbar-brand" href="/">
      <h1><img className="logo" src={icon} width="40" height="auto" alt="home icon"/> CU Housing</h1>
      </a>
      <button className="navbar-toggler collapsed" onClick={clickToggle} type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className={"collapse navbar-collapse "+ show} id="navbarNav">
        <ul className="navbar-nav ml-auto w-100 justify-content-end">
          <li className="nav-item active">
            {toggleMenu? <a className="nav-link" href="/faq">FAQ</a> : 
              <button type="button" className="btn btn-lg btn-outline-dark"><Link to='/faq' className="links">FAQ</Link></button> }
          </li>
        </ul>
      </div>  
    </nav>
    <div className="homepage-description">
    <h5>Search for off-campus housing, review apartments, and share feedback!</h5>
  </div>
  </div>
  );
}

export default NavBar;
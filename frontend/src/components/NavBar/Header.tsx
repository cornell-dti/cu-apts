import React, { ReactElement, useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  Button,
  IconButton,
  Drawer,
  Link,
  MenuItem,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink } from 'react-router-dom';
import icon from '../../assets/home-icon.png';

const headersData = [
  {
    label: 'FAQ',
    href: '/faq',
  },
  {
    label: 'Reviews',
    href: '/reviews',
  },
];

const useStyles = makeStyles(() => ({
  header: {
    backgroundColor: 'transparent',
    paddingRight: '7%',
    paddingLeft: '7%',
    paddingTop: '3%',
    '@media (max-width: 900px)': {
      paddingLeft: 0,
    },
    boxShadow: 'none',
  },
  logo: {
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 500,
    color: 'black',
    textAlign: 'left',
  },
  menuButton: {
    fontFamily: 'Work Sans, sans-serif',
    size: '18px',
    color: 'black',
    fontSize: '1.2rem',
    marginLeft: '38px',
    borderStyle: 'solid',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  drawerContainer: {
    padding: '20px 30px',
  },
  homeImage: {
    marginBottom: '8px',
  },
  menuDrawer: {
    alignSelf: 'right',
  },
}));

const Header = (): ReactElement => {
  const [state, setState] = useState({
    mobileView: false,
    drawerOpen: false,
  });
  const { mobileView, drawerOpen } = state;
  const { header, logo, menuButton, toolbar, drawerContainer, homeImage, menuDrawer } = useStyles();

  useEffect(() => {
    const setResponsiveness = () => {
      return window.innerWidth < 900
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }));
    };
    setResponsiveness();
    window.addEventListener('resize', () => setResponsiveness());
  }, []);

  const getDrawerChoices = () => {
    return headersData.map(({ label, href }) => {
      return (
        <Link
          {...{
            component: RouterLink,
            to: href,
            color: 'inherit',
            style: { textDecoration: 'none' },
            key: label,
          }}
        >
          <MenuItem>{label}</MenuItem>
        </Link>
      );
    });
  };

  const getMenuButtons = () => {
    return headersData.map(({ label, href }) => {
      return (
        <Button
          {...{
            key: label,
            color: 'inherit',
            to: href,
            component: RouterLink,
            className: menuButton,
          }}
        >
          {label}
        </Button>
      );
    });
  };

  const homeLogo = (
    <Typography variant="h4" component="h1" className={logo}>
      <img className={homeImage} src={icon} width="40" height="auto" alt="home icon" /> CU Housing
    </Typography>
  );

  const displayDesktop = () => {
    return (
      <Toolbar className={toolbar}>
        {homeLogo}
        <div>{getMenuButtons()}</div>
      </Toolbar>
    );
  };

  const displayMobile = () => {
    const handleDrawerOpen = () => setState((prevState) => ({ ...prevState, drawerOpen: true }));
    const handleDrawerClose = () => setState((prevState) => ({ ...prevState, drawerOpen: false }));

    return (
      <Toolbar>
        <div>{homeLogo}</div>
        <IconButton
          className={menuDrawer}
          {...{
            edge: 'start',
            color: 'default',
            'aria-label': 'menu',
            'aria-haspopup': 'true',
            onClick: handleDrawerOpen,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          {...{
            anchor: 'right',
            open: drawerOpen,
            onClose: handleDrawerClose,
          }}
        >
          <div className={drawerContainer}>{getDrawerChoices()}</div>
        </Drawer>
      </Toolbar>
    );
  };

  return (
    <header>
      <AppBar className={header}>{mobileView ? displayMobile() : displayDesktop()}</AppBar>
    </header>
  );
};

export default Header;

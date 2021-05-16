import React, { ReactElement, useState } from 'react';
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
  Hidden,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink } from 'react-router-dom';

export type NavbarButton = {
  label: string;
  href: string;
};

type Props = {
  readonly headersData: NavbarButton[];
};

const useStyles = makeStyles(() => ({
  grow: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: '1em',
    paddingLeft: '5em',
    paddingRight: '5em',
    paddingBottom: '1em',
    '@media only screen and (max-width: 414px) ': {
      paddingLeft: '1em',
      paddingRight: '1em',
    },
    boxShadow: 'none',
  },
  logo: {
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 500,
    '@media only screen and (max-width: 320px) ': {
      fontSize: '1.7em',
    },
    color: 'black',
    textAlign: 'left',
  },
  menuButton: {
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 700,
    size: '18px',
    color: 'black',
    fontSize: '1.2rem',
    textTransform: 'none',
    marginLeft: '38px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  drawerContainer: {
    padding: '20px 30px',
  },
  menuDrawer: {
    alignSelf: 'right',
    marginBottom: '8px',
  },
}));

const NavBar = ({ headersData }: Props): ReactElement => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { grow, header, logo, menuButton, toolbar, drawerContainer, menuDrawer } = useStyles();

  const getDrawerChoices = (): ReactElement[] => {
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

  const getMenuButtons = (): ReactElement[] => {
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
          {label.toUpperCase()}
        </Button>
      );
    });
  };

  const homeLogo: ReactElement = (
    <Typography variant="h4" component="h1" className={logo}>
      <Link color="textPrimary" underline="none" href="/">
        CUAPTS
      </Link>
    </Typography>
  );

  const displayDesktop = (): ReactElement => {
    return (
      <Toolbar className={toolbar}>
        {homeLogo}
        <div>{getMenuButtons()}</div>
      </Toolbar>
    );
  };

  const displayMobile = (): ReactElement => {
    return (
      <Toolbar>
        <div>{homeLogo}</div>
        <div className={grow} />
        <IconButton
          className={menuDrawer}
          {...{
            edge: 'start',
            color: 'default',
            'aria-label': 'menu',
            'aria-haspopup': 'true',
            onClick: () => setDrawerOpen(true),
          }}
        >
          <MenuIcon fontSize="large" />
        </IconButton>
        <Drawer
          {...{
            anchor: 'right',
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
          }}
        >
          <div className={drawerContainer}>{getDrawerChoices()}</div>
        </Drawer>
      </Toolbar>
    );
  };

  return (
    <header>
      <AppBar position="fixed" className={header}>
        <Hidden smDown>{displayMobile()}</Hidden>
        <Hidden mdUp>{displayDesktop()}</Hidden>
      </AppBar>
    </header>
  );
};

export default NavBar;

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
  Icon,
  Grid,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink } from 'react-router-dom';
import { isMobile } from '../../../utils/isMobile';
import LogoIcon from '../../../assets/navbar-logo.svg';
import { useLocation } from 'react-router-dom';

export type NavbarButton = {
  label: string;
  href: string;
};

type View = {
  mobileView: boolean;
  drawerOpen: boolean;
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
    '@media only screen and (max-width: 992px) ': {
      paddingLeft: '1em',
      paddingRight: '1em',
    },
    boxShadow: 'none',
  },
  icon: {
    fontSize: 0,
  },
  logo: {
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 600,
    '@media only screen and (max-width: 320px) ': {
      fontSize: '1.7em',
    },
    color: 'black',
    textAlign: 'left',
    paddingTop: '25px',
    marginLeft: '10px',
    fontSize: '20.1176px',
    lineHeight: '24px',
  },
  description: {
    fontFamily: 'Work Sans, sans-serif',
    color: 'black',
    textAlign: 'left',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '17.4658px',
    '@media only screen and (max-width: 425px) ': {
      fontSize: '10px',
    },
    lineHeight: '20px',
    paddingTop: '10px',
  },
  menuButton: {
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 'bold',
    size: '19px',
    fontSize: '16px',
    lineHeight: '19px',
    letterSpacing: '0.08em',
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
  const [state, setState] = useState<View>({
    mobileView: false,
    drawerOpen: false,
  });
  const { mobileView, drawerOpen } = state;
  const {
    grow,
    header,
    logo,
    description,
    menuButton,
    toolbar,
    drawerContainer,
    menuDrawer,
    icon,
  } = useStyles();
  const muiTheme = createMuiTheme({
    palette: { primary: { main: '#898989' }, secondary: { main: '#B94630' } },
  });
  const location = useLocation();
  useEffect(() => {
    const setResponsiveness = () => {
      return isMobile()
        ? setState((prevState) => ({ ...prevState, mobileView: true }))
        : setState((prevState) => ({ ...prevState, mobileView: false }));
    };
    setResponsiveness();
    window.addEventListener('resize', () => setResponsiveness());
  }, []);

  const getDrawerChoices = (): ReactElement[] => {
    return headersData.map(({ label, href }) => {
      return (
        <ThemeProvider theme={muiTheme}>
          <Link
            {...{
              component: RouterLink,
              to: href,
              color:
                (location.pathname === '/' && label.includes('Home')) ||
                ((location.pathname.includes('landlord') ||
                  location.pathname.includes('reviews')) &&
                  label.includes('Reviews'))
                  ? 'secondary'
                  : 'primary',
              style: { textDecoration: 'none' },
              key: label,
            }}
          >
            <MenuItem>{label}</MenuItem>
          </Link>
        </ThemeProvider>
      );
    });
  };

  const getMenuButtons = (): ReactElement[] => {
    return headersData.map(({ label, href }) => {
      return (
        <ThemeProvider theme={muiTheme}>
          <Button
            {...{
              key: label,
              color:
                (location.pathname === '/' && label.includes('Home')) ||
                ((location.pathname.includes('landlord') ||
                  location.pathname.includes('reviews')) &&
                  label.includes('Reviews'))
                  ? 'secondary'
                  : 'primary',
              to: href,
              component: RouterLink,
              className: menuButton,
            }}
          >
            {label.toUpperCase()}
          </Button>
        </ThemeProvider>
      );
    });
  };

  const homeLogo: ReactElement = (
    <Grid container xs={11} md={7} direction="column">
      <Grid item>
        <Grid container alignItems="center">
          <Grid item>
            <Link color="textPrimary" underline="none" href="/">
              <Icon className={icon}>
                <img src={LogoIcon} alt="CU Apts Logo" height={57.41} width={30.16} />
              </Icon>
            </Link>
          </Grid>
          <Grid item>
            <Typography variant="h4" component="h1" className={logo}>
              <Link color="textPrimary" underline="none" href="/">
                CUAPTS
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h4" component="h1" className={description}>
          <Link color="textPrimary" underline="none" href="/">
            Search for off-campus housing, review apartments, and share feedback!
          </Link>
        </Typography>
      </Grid>
    </Grid>
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
    const handleDrawerOpen = () => setState((prevState) => ({ ...prevState, drawerOpen: true }));
    const handleDrawerClose = () => setState((prevState) => ({ ...prevState, drawerOpen: false }));

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
            onClick: handleDrawerOpen,
          }}
        >
          <MenuIcon fontSize="large" />
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
      <AppBar position="fixed" className={header}>
        {mobileView ? displayMobile() : displayDesktop()}
      </AppBar>
    </header>
  );
};

export default NavBar;

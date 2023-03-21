import React, { ReactElement, useEffect, useState } from 'react';
import { getUser, signOut } from '../../../utils/firebase';

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
  Icon,
  Grid,
  ThemeProvider,
  Container,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink } from 'react-router-dom';
import LogoIcon from '../../../assets/navbar-logo.svg';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../colors';
import auto from '../../Home/Autocomplete';
import { isAdmin } from '../../../utils/adminTool';

export type NavbarButton = {
  label: string;
  href: string;
};

type Props = {
  readonly headersData: NavbarButton[];
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const useStyles = makeStyles(() => ({
  grow: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: '1em',
    paddingBottom: '0.75em',
    margin: '0.5em 0 0.5em 0',
    boxShadow: 'none',
  },
  icon: {
    fontSize: 0,
  },
  authButton: {
    backgroundColor: colors.red1,
    color: 'white',
    '&:hover': {
      backgroundColor: 'grey',
    },
    marginLeft: '10px',
    width: '120px',
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  adminButton: {
    backgroundColor: 'grey',
    color: 'white',
    '&:hover': {
      backgroundColor: 'grey',
    },
    marginRight: '100px',
    width: '120px',
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  description: {
    color: colors.black,
    textAlign: 'left',
    fontSize: '1.125em',
    '@media only screen and (max-width: 425px) ': {
      fontSize: '0.75em',
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
    marginRight: '38px',
  },
  toolbar: {
    display: 'flex',
    paddingLeft: 0,
  },
  drawerContainer: {
    padding: '20px 30px',
  },
  menuDrawer: {
    alignSelf: 'right',
    marginBottom: '8px',
    marginLeft: '50%',
  },
  drawerButton: {
    fontFamily: 'Work Sans, sans-serif',
  },
  search: {
    width: '50%',
    marginRight: '25%',
    marginBottom: '-15px',
  },
  searchHidden: {
    width: '50%',
    paddingLeft: '3%',
    visibility: 'hidden',
  },
  menu: {
    alignSelf: 'right',
    marginTop: '-40px',
    marginLeft: '70%',
  },
  searchDrawer: {
    marginBottom: '5%',
  },
}));

function GetButtonColor(lab: string) {
  const location = useLocation();
  return (location.pathname === '/' && lab.includes('Home')) ||
    ((location.pathname.includes('landlord') || location.pathname.includes('reviews')) &&
      lab.includes('Reviews')) ||
    (location.pathname.includes('faq') && lab.includes('FAQ'))
    ? 'secondary'
    : 'primary';
}

const NavBar = ({ headersData, user, setUser }: Props): ReactElement => {
  const initialUserState = !user ? 'Sign In' : 'Sign Out';
  const [buttonText, setButtonText] = useState(initialUserState);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const location = useLocation();
  const {
    header,
    menuButton,
    toolbar,
    drawerContainer,
    menuDrawer,
    icon,
    drawerButton,
    search,
    searchHidden,
    menu,
    searchDrawer,
    adminButton,
    authButton,
  } = useStyles();

  const muiTheme = createTheme({
    palette: { primary: { main: colors.gray2 }, secondary: { main: colors.red1 } },
  });

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    setButtonText(!user ? 'Sign In' : 'Sign Out');
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDrawerChoices = () => {
    return (
      <ThemeProvider theme={muiTheme}>
        <Grid className={searchDrawer}>{auto()}</Grid>
        {headersData.map(({ label, href }, index) => {
          return (
            <Link component={RouterLink} to={href} color={GetButtonColor(label)} key={index}>
              <MenuItem key={index} className={drawerButton}>
                {label}
              </MenuItem>
            </Link>
          );
        })}
      </ThemeProvider>
    );
  };

  const signInOutButtonClick = async () => {
    if (user) {
      signOut();
      setUser(null);
      setButtonText('Sign In');
      return;
    }
    let newUser = await getUser(true);
    setUser(newUser);
    setButtonText(!newUser ? 'Sign In' : 'Sign Out');
  };

  useEffect(() => {
    setTimeout(async () => {
      let user = await getUser(false);
      setUser(user);
    }, 1000);
  });

  const signInButton = () => {
    return (
      <Button onClick={signInOutButtonClick} className={authButton}>
        {buttonText}
      </Button>
    );
  };

  const getAdminButton = () => {
    return (
      <Button
        {...{
          to: '/admin',
          component: RouterLink,
          className: adminButton,
        }}
      >
        Admin
      </Button>
    );
  };

  const getMenuButtons = () => {
    return (
      <ThemeProvider theme={muiTheme}>
        {headersData.map(({ label, href }, index) => {
          return (
            <Button
              {...{
                key: index,
                color: GetButtonColor(label),
                to: href,
                component: RouterLink,
                className: menuButton,
              }}
            >
              {label.toUpperCase()}
            </Button>
          );
        })}
      </ThemeProvider>
    );
  };

  const homeLogo: ReactElement = (
    <Grid container item direction="column">
      <Grid>
        <Grid container alignItems="center">
          <Grid item>
            <Link
              color="textPrimary"
              underline="none"
              {...{
                to: `/`,
                style: { textDecoration: 'none' },
                component: RouterLink,
              }}
            >
              <Icon className={icon}>
                <img src={LogoIcon} alt="CU Apts Logo" height={57.41} width={30.16} />
              </Icon>
            </Link>
          </Grid>
          <Grid item>
            <Link
              color="textPrimary"
              underline="none"
              {...{
                to: `/`,
                style: { textDecoration: 'none' },
                component: RouterLink,
              }}
            >
              <Typography
                style={{
                  fontWeight: 600,
                  fontSize: !isMobile ? '24px' : '18px',
                  color: colors.black,
                  textAlign: 'left',
                  paddingTop: '25px',
                  marginLeft: '10px',
                  lineHeight: '32px',
                }}
              >
                CUAPTS
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const searchBar = location.pathname !== '/';

  const displayDesktop = () => {
    return (
      <Grid container className={toolbar} alignItems="center" justifyContent="space-between">
        <Grid item md={3}>
          {homeLogo}
        </Grid>
        <Grid item md={6} className={searchBar ? search : searchHidden}>
          {auto()}
        </Grid>
        {isAdmin(user) && (
          <Grid item md={1} className={menu} container justifyContent="flex-end">
            {getAdminButton()}
          </Grid>
        )}
        <Grid item md={4} className={menu} container justifyContent="flex-end">
          {getMenuButtons()}
          {signInButton()}
        </Grid>
      </Grid>
    );
  };

  const displayMobile = (): ReactElement => {
    return (
      <Toolbar className={toolbar}>
        <div>{homeLogo}</div>
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
      <AppBar position="static" className={header}>
        <Container maxWidth="lg">
          <Hidden mdUp>{displayMobile()}</Hidden>
          <Hidden smDown>{displayDesktop()}</Hidden>
        </Container>
      </AppBar>
    </header>
  );
};

export default NavBar;

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
  Icon,
  Grid,
  createMuiTheme,
  ThemeProvider,
  Container,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink } from 'react-router-dom';
import LogoIcon from '../../../assets/navbar-logo.svg';
import { useLocation } from 'react-router-dom';
import auto from '../../Home/Autocomplete';

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
    paddingBottom: '0.75em',
    margin: '0.5em 0 0.5em 0',
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
    fontStyle: 'normal',
    color: 'black',
    textAlign: 'left',
    paddingTop: '25px',
    marginLeft: '10px',
    fontSize: '27px',
    lineHeight: '32px',
  },
  description: {
    fontFamily: 'Work Sans, sans-serif',
    color: 'black',
    textAlign: 'left',
    fontStyle: 'normal',
    fontWeight: 'normal',
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
    marginLeft: '38px',
  },
  toolbar: {
    display: 'flex',
    // justifyContent: 'space-between',
    paddingLeft: 0,
    // paddingRight: 0,
    // '& .MuiToolbar-gutters': {
    //   paddingLeft: 0,
    //   paddingRight: 0,
    // },
    // '& .MuiGrid-item': {
    //   marginLeft: 0,
    //   marginRight: 0,
    // },
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
    paddingLeft: '3%',
  },
  searchDrawer: {
    marginBottom: '5%',
  },
}));
function GetButtonColor(lab: string) {
  const location = useLocation();
  return (location.pathname === '/' && lab.includes('Home')) ||
    ((location.pathname.includes('landlord') || location.pathname.includes('reviews')) &&
      lab.includes('Reviews'))
    ? 'secondary'
    : 'primary';
}
const NavBar = ({ headersData }: Props): ReactElement => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    header,
    logo,
    description,
    menuButton,
    toolbar,
    drawerContainer,
    menuDrawer,
    icon,
    drawerButton,
    search,
    searchDrawer,
  } = useStyles();
  const muiTheme = createMuiTheme({
    palette: { primary: { main: '#898989' }, secondary: { main: '#B94630' } },
  });

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
            <Link color="textPrimary" underline="none" href="/">
              <Icon className={icon}>
                <img src={LogoIcon} alt="CU Apts Logo" height={57.41} width={30.16} />
              </Icon>
            </Link>
          </Grid>
          <Grid item>
            <Typography className={logo}>
              <Link color="textPrimary" underline="none" href="/">
                CUAPTS
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Typography className={description}>
          <Link color="textPrimary" underline="none" href="/">
            Easy browsing for off-campus housing
          </Link>
        </Typography>
      </Grid>
    </Grid>
  );

  const displayDesktop = (): ReactElement => {
    return (
      <Grid container className={toolbar} alignItems="center">
        <Grid item md={3}>
          {homeLogo}
        </Grid>
        <Grid item md={6} className={search}>
          {auto()}
        </Grid>
        <Grid item md={3}>
          {getMenuButtons()}
        </Grid>
      </Grid>
    );
  };

  const displayMobile = (): ReactElement => {
    return (
      <Toolbar className={toolbar}>
        <div>{homeLogo}</div>
        {/* <div className={grow} /> */}
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
        {auto()}
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

import React, { ReactElement, useEffect, useState, useRef } from 'react';
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
import { Link as RouterLink, useHistory } from 'react-router-dom';
import LogoIcon from '../../../assets/navbar-logo.svg';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../colors';
import Autocomplete from '../../Home/Autocomplete';
import { isAdmin } from '../../../utils/adminTool';
import defaultProfilePic from '../../../assets/cuapts-bear.png';
import { ReactComponent as ProfileIcon } from '../../../assets/profile-icon.svg';
import { ReactComponent as BookmarkIcon } from '../../../assets/bookmark.svg';
import { ReactComponent as SignOutIcon } from '../../../assets/signout.svg';

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
  profileButton: {
    width: '3.5em',
    height: '3.5em',
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: 'transparent',
    },
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
  adminButtonMobile: {
    backgroundColor: 'grey',
    color: 'white',
    marginLeft: '10px',
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
    marginLeft: '30px',
    marginBottom: '-15px',
    borderRadius: '10px',
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
    width: '100%',
    marginBottom: '5%',
  },
  profileDropDownMenu: {
    position: 'absolute',
    right: '0',
    top: '100%',
    width: '14em',
    color: 'black',
    backgroundColor: 'white',
    listStyle: 'none',
    borderRadius: '10px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
    paddingBottom: '10%',
    paddingTop: '10%',
    paddingRight: '0',
    paddingLeft: '0',
    zIndex: 1000,
  },
  drawerProfileDropDown: {
    position: 'absolute',
    top: '100%',
    width: '14em',
    color: 'black',
    backgroundColor: 'white',
    listStyle: 'none',
    borderRadius: '10px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
    paddingBottom: '10%',
    paddingTop: '10%',
    paddingRight: '0',
    paddingLeft: '0',
  },
  dropDownIcons: {
    fill: colors.red1,
    paddingRight: '0.8em',
  },
  dropDownButtons: {
    fontFamily: 'Work Sans',
    fontSize: '16px',
    textTransform: 'none',
    width: '95%',
    paddingRight: '0',
    justifyContent: 'flex-start',
  },
}));

/** This function dictates whether a menu button(/menu drawer button) is red or not. It should be red when the user is on that page. */
function GetButtonColor(lab: string) {
  const location = useLocation();
  return (location.pathname === '/' && lab.includes('Home')) ||
    ((location.pathname.includes('landlord') || location.pathname.includes('reviews')) &&
      lab.includes('Reviews')) ||
    (location.pathname.includes('faq') && lab.includes('FAQ')) ||
    (location.pathname.includes('profile') && lab.includes('Profile')) ||
    (location.pathname.includes('bookmarks') && lab.includes('Bookmarks'))
    ? 'secondary'
    : 'primary';
}

/**
 * NavBar Component
 *
 * This component is the navigation bar that is used on all pages throughout the CUApts website. It provides routing to the Home and FAQ pages
 * and the Login/Sign Out buttons.
 * @param headersData: An array of objects representing navigation links. Each object should have label (string) and href (string) properties.
 * @param user: (firebase.User | null) The current user object, can be null if the user is not authenticated.
 * @param setUser: function to set user.
 * @returns the NavBar component.
 */

const NavBar = ({ headersData, user, setUser }: Props): ReactElement => {
  const initialUserState = !user ? 'Sign In' : 'Sign Out';
  const [buttonState, setButtonState] = useState(initialUserState);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const location = useLocation();
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
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
    adminButtonMobile,
    authButton,
    profileButton,
    profileDropDownMenu,
    drawerProfileDropDown,
    dropDownIcons,
    dropDownButtons,
  } = useStyles();

  const history = useHistory();

  const muiTheme = createTheme({
    palette: { primary: { main: colors.gray2 }, secondary: { main: colors.red1 } },
  });

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    setButtonState(!user ? 'Sign In' : 'Profile');
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
      if (drawerOpen && window.innerWidth >= 960) {
        setDrawerOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerOpen]);

  /** This sets the Profile button drop down menu to false (close) when user clicks outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropDownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropDownOpen]);

  /** This returns the drawer menu buttons */
  const getDrawerChoices = () => {
    const profile: NavbarButton = {
      label: 'Profile',
      href: `/profile`,
    };
    const bookmarks: NavbarButton = {
      label: 'Bookmarks',
      href: `/bookmarks`,
    };
    //Sets headers data depending on whether menu drawer is open or not. If open, add profile and bookmarks page buttons.
    const displayHeadersData =
      drawerOpen && user ? [...headersData, profile, bookmarks] : headersData;
    return (
      <ThemeProvider theme={muiTheme}>
        <Grid className={searchDrawer}>
          <Autocomplete drawerOpen={drawerOpen} />
        </Grid>
        {displayHeadersData.map(({ label, href }, index) => {
          return (
            <Link component={RouterLink} to={href} color={GetButtonColor(label)} key={index}>
              <MenuItem key={index} className={drawerButton}>
                {label}
              </MenuItem>
            </Link>
          );
        })}
        <Grid style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {signInButton()}
        </Grid>
      </ThemeProvider>
    );
  };

  const signInProfileButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (user) {
      setDropDownOpen(!dropDownOpen);
      return;
    }
    let newUser = await getUser(true);
    setUser(newUser);
    setButtonState(!newUser ? 'Sign In' : 'Profile');
  };

  useEffect(() => {
    setTimeout(async () => {
      let user = await getUser(false);
      setUser(user);
    }, 1000);
  });

  /** This function navigates the user to the page depending on the dropdown button pressed */
  const dropDownButtonClick = async (button: 'profile' | 'bookmarks' | 'signOut') => {
    if (button === 'profile') {
      history.push(`/profile`);
    } else if (button === 'bookmarks') {
      history.push(`/bookmarks`);
    } else {
      signOut();
      history.push('/');
      setDropDownOpen(false);
    }
    setDropDownOpen(false);
  };

  /** This function returns a Sign In button or Sign Out button or Profile (circular picture) depending on whether the user is signed in or not/drawer is open or not**/
  const signInButton = () => {
    if (buttonState === 'Sign In') {
      return (
        <Button onClick={signInProfileButtonClick} className={authButton}>
          {buttonState}
        </Button>
      );
    } else if (drawerOpen) {
      return (
        <Button onClick={() => dropDownButtonClick('signOut')} className={authButton}>
          Sign Out
        </Button>
      );
    } else {
      return (
        <div>
          <Button
            onClick={signInProfileButtonClick}
            style={{
              height: '40px',
              width: '0',
              backgroundColor: 'transparent',
              color: 'transparent',
            }}
          >
            <img
              src={user?.photoURL || defaultProfilePic}
              className={profileButton}
              alt="User Profile"
            />
            {dropDownOpen && (
              <ul
                className={drawerOpen ? drawerProfileDropDown : profileDropDownMenu}
                ref={dropdownRef}
              >
                <li>
                  {' '}
                  <Button
                    className={dropDownButtons}
                    onClick={() => dropDownButtonClick('profile')}
                  >
                    <ProfileIcon className={dropDownIcons} />
                    Profile
                  </Button>
                </li>
                <li>
                  {' '}
                  <Button
                    className={dropDownButtons}
                    onClick={() => dropDownButtonClick('bookmarks')}
                  >
                    <BookmarkIcon className={dropDownIcons} />
                    Bookmarks
                  </Button>
                </li>
                <li>
                  {' '}
                  <Button
                    className={dropDownButtons}
                    onClick={() => dropDownButtonClick('signOut')}
                  >
                    <SignOutIcon className={dropDownIcons} />
                    Sign Out
                  </Button>
                </li>
              </ul>
            )}
          </Button>
        </div>
      );
    }
  };

  const getAdminButton = () => {
    return (
      <Button
        to="/admin"
        component={RouterLink}
        className={isMobile ? adminButtonMobile : adminButton}
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
        <Grid container alignItems="center" style={{ marginTop: '-10px' }}>
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
                <img
                  src={LogoIcon}
                  alt="CU Apts Logo"
                  height={isMobile ? 45.684 : 57.41}
                  width={isMobile ? 24 : 30.16}
                />
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
                  fontSize: !isMobile ? '22px' : '16px',
                  color: colors.black,
                  textAlign: 'left',
                  marginTop: isMobile ? 17 : 20,
                  marginLeft: '8px',
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
        <Grid item md={9} container alignItems="center">
          <Grid item>{homeLogo}</Grid>
          <Grid item className={searchBar ? search : searchHidden}>
            <Autocomplete drawerOpen={drawerOpen} />
          </Grid>
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
      <Toolbar className={toolbar} style={{ marginTop: '-20px' }}>
        <div>{homeLogo}</div>
        {isAdmin(user) && getAdminButton()}
        <IconButton
          className={menuDrawer}
          style={{ position: 'absolute', right: '10px' }}
          {...{
            edge: 'start',
            color: 'default',
            'aria-label': 'menu',
            'aria-haspopup': 'true',
            onClick: () => setDrawerOpen(true),
          }}
        >
          <MenuIcon
            fontSize={'large'}
            style={{ color: '#B94630', marginRight: isMobile ? '-10px' : '0px' }}
          />
        </IconButton>
        <Drawer
          {...{
            anchor: 'right',
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
          }}
        >
          <div className={drawerContainer} style={{ width: '80%' }}>
            {getDrawerChoices()}
          </div>
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

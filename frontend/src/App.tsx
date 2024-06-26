import React, { ReactElement, useEffect, useState } from 'react';
import './App.scss';
import { Route, Switch, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FAQPage from './pages/FAQPage';
import ReviewPage from './pages/ReviewPage';
import LandlordPage from './pages/LandlordPage';
import ProfilePage from './pages/ProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import { ThemeProvider } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import NavBar, { NavbarButton } from './components/utils/NavBar';
import NotFoundPage from './pages/NotFoundPage';
import { ApartmentWithId } from '../../common/types/db-types';
import Footer from './components/utils/Footer';
import ContactModal from './components/utils/Footer/ContactModal';
import { ModalProvider } from './components/utils/Footer/ContactModalContext';
import { hotjar } from 'react-hotjar';
import { HJID, HJSV } from './constants/hotjar';
import Policies from './pages/Policies';
import ApartmentPage from './pages/ApartmentPage';
import AdminPage from './pages/AdminPage';
import LocationPage from './pages/LocationPage';
import axios from 'axios';
import { colors } from './colors';
import SearchResultsPage from './pages/SearchResultsPage';
import { isAdmin } from './utils/adminTool';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.red1,
    },
    secondary: {
      main: colors.gray2,
    },
  },
  typography: {
    fontFamily: ['"Work Sans"', 'sans-serif'].join(','),
    h1: {
      fontSize: 48,
    },
    h2: {
      fontSize: 36,
    },
    h3: {
      fontSize: 28,
    },
    h4: {
      fontSize: 22,
    },
    body1: {
      fontSize: 18,
    },
    body2: {
      fontSize: 16,
    },
  },
  overrides: {
    MuiFormLabel: {
      root: {
        color: colors.black,
      },
      colorSecondary: {
        color: colors.gray1,
      },
    },
  },
});

const home: NavbarButton = {
  label: 'Home',
  href: '/',
};

const faq: NavbarButton = {
  label: 'FAQ',
  href: '/faq',
};

export type CardData = {
  buildingData: ApartmentWithId;
  numReviews: number;
  company?: string;
  avgRating?: number;
  avgPrice?: number;
};

export type LocationCardData = {
  photo: string;
  location: string;
};

const headersData = [home, faq];

hotjar.initialize(HJID, HJSV);

const App = (): ReactElement => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const setData = async () => {
      await axios.post('/api/set-data');
    };
    setData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ModalProvider user={user} setUser={setUser}>
        <NavBar headersData={headersData} user={user} setUser={setUser} />
        <div className="root">
          <Switch>
            <Route exact path="/" component={() => <HomePage user={user} setUser={setUser} />} />

            <Route exact path="/faq" component={FAQPage} />
            <Route
              exact
              path="/reviews"
              component={() => <ReviewPage user={user} setUser={setUser} />}
            />

            <Route exact path="/policies" component={Policies} />
            <Route
              path="/location/:location"
              component={() => <LocationPage user={user} setUser={setUser} />}
            />
            <Route
              path="/landlord/:landlordId"
              component={() => <LandlordPage user={user} setUser={setUser} />}
            />
            <Route
              path="/profile"
              component={() => <ProfilePage user={user} setUser={setUser} />}
            />
            <Route
              path="/bookmarks"
              component={() => <BookmarksPage user={user} setUser={setUser} />}
            />
            <Route
              path="/apartment/:aptId"
              component={() => <ApartmentPage user={user} setUser={setUser} />}
            />
            <Route exact path="/notfound" component={NotFoundPage} />
            <Route
              path="/search"
              component={() => <SearchResultsPage user={user} setUser={setUser} />}
            />
            {isAdmin(user) && <Route exact path="/admin" component={AdminPage} />}
          </Switch>
        </div>
        {pathname !== '/faq' && <Footer />}
        <ContactModal user={user} />
      </ModalProvider>
    </ThemeProvider>
  );
};

export default App;

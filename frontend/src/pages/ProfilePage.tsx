import React, { ReactElement, useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  makeStyles,
  Button,
  useTheme,
  useMediaQuery,
} from '@material-ui/core';
import { colors } from '../colors';
import questionIcon from '../assets/question.svg';
import { signOut } from '../utils/firebase';
import { useHistory } from 'react-router-dom';
import { useTitle } from '../utils';

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: colors.gray3,
    minHeight: '100vh',
    width: '100%',
  },
  gridContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: '10px',
  },
  headerStyle: {
    fontFamily: 'Work Sans',
  },
  myProfileCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center',
    borderRadius: '15px',
  },
  questionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '20px',
    border: '0',
    top: '0',
    marginLeft: '90%',
    cursor: 'pointer',
  },
  questionIconStyle: {
    width: '1.8vw',
    height: '1.8vw',
    minWidth: '15px',
    minHeight: '15px',
    margin: '0',
  },
  userImage: {
    width: '11.5vw',
    height: '11.5vw',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '24px',
    marginTop: 0,
    minWidth: '80px',
    minHeight: '80px',
  },
  signOutButton: {
    backgroundColor: colors.red1,
    color: 'white',
    '&:hover': {
      backgroundColor: 'grey',
    },
    width: '100%',
    fontFamily: 'Work Sans, sans-serif',
    fontWeight: 'bold',
    fontSize: '12px',
    borderRadius: '21px',
  },
  modalContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: '50vw',
    top: '40vh',
  },
  modalStyle: {
    textAlign: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    width: '22vw',
    fontSize: '14px',
    borderRadius: '15px',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
    padding: '12px',
    paddingBottom: '30px',
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
}));

/**
 * Profile Page
 * This componenet represents the Profile page. It displays the user's profile and their past reviews.
 * @component
 * @param props - The props for the ProfilePage component.
 * @param user props.user - The current user, null if not logged in.
 * @param setUser - Function to set the current user.
 * @returns ProfilePage The ProfilePage component.
 */

const ProfilePage = ({ user, setUser }: Props): ReactElement => {
  const {
    root,
    gridContainer,
    headerStyle,
    myProfileCard,
    questionButton,
    questionIconStyle,
    userImage,
    signOutButton,
    modalContainer,
    modalStyle,
    modalOverlay,
  } = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));

  useTitle('Profile');

  /** This function opens the 'Who can view my profile?' modal **/
  const openModal = () => {
    setIsModalOpen(true);
  };

  /** This function is called when sign out button clicked; signs out, navigates to home page **/
  const signOutButtonClick = async () => {
    if (user) {
      signOut();
      history.push('/');
    }
  };

  /** This closes the modal (who can view my profile) when modal is open and user clicks out **/
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.body.style.overflow = 'visible';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, setIsModalOpen]);

  return (
    <div className={root}>
      <Grid container spacing={2} className={gridContainer}>
        <Grid item xs={11} sm={4} md={3}>
          <div style={isXsScreen ? { width: '100%' } : { width: '70%' }}>
            <h2 className={headerStyle}>My Profile</h2>
            <Card variant="outlined" className={myProfileCard}>
              <CardContent>
                <button className={questionButton}>
                  <img
                    src={questionIcon}
                    onClick={openModal}
                    className={questionIconStyle}
                    alt="Who can view my profile?"
                  />
                </button>
                <div>
                  <img src={user?.photoURL || ''} className={userImage} alt="User Profile"></img>
                </div>
                <h3 style={{ marginTop: '0', marginBottom: '4px' }}>{user?.displayName}</h3>
                <h5
                  style={{
                    fontWeight: '400',
                    marginTop: '0',
                    marginBottom: '24px',
                    color: colors.gray1,
                  }}
                >
                  {user?.email}
                </h5>
                <Button className={signOutButton} onClick={signOutButtonClick}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </Grid>
        <Grid item xs={11} sm={7} md={6}>
          <h2 className={headerStyle}>My Reviews</h2>
          <Card variant="outlined">
            <CardContent></CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* checks if modal is open and displays it. */}
      <div className={modalContainer}>
        {isModalOpen && (
          <div className={modalOverlay}>
            <div className={modalStyle}>
              <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Who can view my profile?</h2>
              <p style={{ color: colors.gray1, marginTop: '0' }}>
                No one — all reviews are entirely anonymous. This information is only visible to
                you.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

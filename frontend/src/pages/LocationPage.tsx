import React, { ReactElement, useState, useEffect } from 'react';
import { Box, CardMedia, Container, Typography, makeStyles } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import CollegetownImg from '../assets/collegetown-coverpic.svg';
import WestImg from '../assets/west-coverpic.svg';
import NorthImg from '../assets/north-coverpic.svg';
import DowntownImg from '../assets/downtown-coverpic.svg';
import { colors } from '../colors';
import { CardData } from '../App';
import { get } from '../utils/call';
import ApartmentCards from '../components/ApartmentCard/ApartmentCards';
import { useSaveScrollPosition } from '../utils/saveScrollPosition';

interface Images {
  [location: string]: string;
}

type Props = {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
};

/**
 * LocationPage Component – Displays information and apartments for a specific location
 * (i.e. Collegetown, West, North, Downtown).
 *
 * @remarks
 * The LocationPage displays the name and description of the location. It also fetches and
 * displays apartment cards that are located in the specific location (e.g. all apartments
 * in Collegetown).
 *
 * @param {firebase.User | null} props.user – The currently logged-in Firebase user or null
 * if no user is logged in.
 * @param {React.Dispatch<React.SetStateAction<firebase.User | null>>} props.setUser - A
 * function to update the `user` state.
 *
 * @return {ReactElement} The JSX structure of the LocationPage component.
 */

const LocationPage = ({ user, setUser }: Props): ReactElement => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [data, setData] = useState<CardData[]>([]);
  const useStyles = makeStyles({
    imgStyle: {
      height: isMobile ? '200px' : '300px',
      width: '100%',
      borderRadius: '10px',
    },
    titleStyle: {
      marginBottom: '40px',
      color: colors.white,
      marginLeft: '20px',
      marginTop: '-80px',
      fontFamily: 'Work Sans',
      fontStyle: 'bold',
      fontWeight: 700,
      fontSize: '50px',
      lineHeight: '70px',
    },
    bodyStyle: {
      marginLeft: '5px',
    },
  });

  const path = useLocation();
  const [pathName] = useState(path.pathname);
  const location = path.pathname.substring(path.pathname.lastIndexOf('/') + 1);
  const locAPI = `/api/location/${location}/`;
  const locToImg: Images = {
    Collegetown: CollegetownImg,
    West: WestImg,
    North: NorthImg,
    Downtown: DowntownImg,
  };

  useEffect(() => {
    get<CardData[]>(locAPI, {
      callback: setData,
    });
  }, [locAPI]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useSaveScrollPosition(`scrollPosition_${pathName}`, pathName);
  const saveResultsCount = (count: number) => {
    sessionStorage.setItem(`resultsCount_${location}`, count.toString());
  };
  const locDescText: Images = {
    Collegetown: isMobile
      ? 'Collegetown is an off-campus gathering place for Cornellians located within walking distance of campus.'
      : 'Collegetown is an off-campus gathering place for Cornellians located within walking distance of campus. Many upperclassmen live in apartments located within Collegetown. Collegetown hosts a diverse array of restaurants. It is a special gathering place for dining, shopping, and hanging out.',

    West: isMobile
      ? 'West Campus houses upper level students who live in a community that emphasizes informal interaction with faculty members, self-governance, social initiative, and personal discovery.'
      : 'West Campus houses upper level students who live in a community that emphasizes informal interaction with faculty members, self-governance, social initiative, and personal discovery. West Campus has a variety of off-campus small living units that are privately and university owned. In addition, there is easy access to campus as well as restaurants in both Collegetown and Downtown Ithaca.',
    North: isMobile
      ? 'North Campus is located north of Fall Creek. The residential experience is foundational for increasing interaction among students, especially those of the freshman class.'
      : 'North Campus is located north of Fall Creek. The residential experience is foundational for increasing interaction among students, especially those of the freshman class. Students may live in either a residence hall or a program house. Buses are very accessible and Greek life and other forms of off-campus housing options are available in abundance.',
    Downtown: isMobile
      ? 'Downtown is the area surrounding and including Ithaca Commons – a vibrant off-campus gathering place for residents of Ithaca.'
      : 'Downtown is the area surrounding and including Ithaca Commons – a vibrant off-campus gathering place for residents of Ithaca. Downtown is a walkable and well-connected area that is home to more than 100 stores and 50 restaurants.',
  };
  let img = locToImg[location];
  let desc = locDescText[location];
  const { imgStyle, titleStyle, bodyStyle } = useStyles();

  return (
    <>
      <Box mt={isMobile ? -2 : 0}>
        <Container maxWidth="lg">
          <CardMedia className={imgStyle} image={img} component="img" title={location} />
          <Typography className={titleStyle}>{location}</Typography>
          <Typography variant="body1" className={bodyStyle}>
            {desc}
          </Typography>
          <ApartmentCards
            user={user}
            initialResultsToShow={parseInt(
              sessionStorage.getItem(`resultsCount_${location}`) || '5',
              10
            )}
            setUser={setUser}
            data={data}
            onMoreResultsLoaded={saveResultsCount}
          />
        </Container>
      </Box>
    </>
  );
};
export default LocationPage;

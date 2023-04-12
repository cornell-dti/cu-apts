import React, { ReactElement, useState, useEffect } from 'react';
import ApartmentCard from './ApartmentCard';
import { Grid, Link, makeStyles, Button, useMediaQuery } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { CardData } from '../../App';

type Props = {
  data: CardData[];
};

const useStyles = makeStyles({
  boundingBox: {
    marginTop: '0.2em',
    marginBottom: '2em',
  },
  showMoreButton: {
    border: '1px solid #A3A3A3',
    borderRadius: '9px',
    color: '#000000B2',
    width: '10em',
    textTransform: 'initial',
  },
  horizontalLine: {
    borderTop: '1px solid #C4C4C4',
    width: '95%',
    margin: '16px auto',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: 'none',
  },
});

const ApartmentCards = ({ data }: Props): ReactElement => {
  const { boundingBox, showMoreButton, horizontalLine } = useStyles();

  const [resultsToShow, setResultsToShow] = useState<number>(data.length);

  useEffect(() => {
    setResultsToShow(5);
  }, [data.length]);

  const handleShowMore = () => {
    setResultsToShow(resultsToShow + 5);
  };

  return (
    <>
      <Grid container spacing={3} className={boundingBox}>
        {data &&
          data.slice(0, resultsToShow).map(({ buildingData, numReviews, company }, index) => {
            const { id } = buildingData;
            return (
              <Grid item md={12} key={index}>
                <Link
                  {...{
                    to: `/apartment/${id}`,
                    style: { textDecoration: 'none' },
                    component: RouterLink,
                  }}
                >
                  <ApartmentCard
                    key={index}
                    numReviews={numReviews}
                    buildingData={buildingData}
                    company={company}
                  />
                </Link>
              </Grid>
            );
          })}

        {data && data.length > resultsToShow && (
          <>
            <Grid item xs={12}>
              <hr className={horizontalLine} />
            </Grid>
            <Grid item xs={12} container justifyContent="center">
              <Button className={showMoreButton} onClick={handleShowMore}>
                Show more
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default ApartmentCards;

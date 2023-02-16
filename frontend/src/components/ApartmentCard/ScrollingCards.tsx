import React, { ReactElement, useEffect, useState } from 'react';
import ApartmentCards from './ApartmentCards';
import { loadingLength } from '../../constants/HomeConsts';
import { CardData } from '../../App';
import { get } from '../../utils/call';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  loadingMsg: {
    marginTop: '-30px',
  },
});

type Props = {
  API: string;
};

type returnData = {
  buildingData: CardData[];
  isEnded: boolean;
};

const ScrollingCards = ({ API }: Props): ReactElement => {
  const [dataSize, setDataSize] = useState(loadingLength);
  const [data, setData] = useState<returnData>({ buildingData: [], isEnded: false });
  const { loadingMsg } = useStyles();

  useEffect(() => {
    get<returnData>(API + `${dataSize}`, {
      callback: setData,
    });
  }, [dataSize, API]);

  window.onscroll = function (ev: Event) {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setDataSize(dataSize + loadingLength);
    }
  };

  return (
    <>
      <ApartmentCards data={data.buildingData} />
      <Typography className={loadingMsg}>
        {!data.isEnded ? 'Loading more apartments...' : "There's no more apartments!"}
      </Typography>
    </>
  );
};

export default ScrollingCards;

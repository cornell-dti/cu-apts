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

const ScrollingCards = ({ API }: Props): ReactElement => {
  const [dataSize, setDataSize] = useState(loadingLength);
  const [data, setData] = useState<CardData[]>([]);
  const { loadingMsg } = useStyles();

  useEffect(() => {
    get<CardData[]>(API + `${dataSize}`, {
      callback: setData,
    });
  }, [dataSize]);

  window.onscroll = function (ev: Event) {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setDataSize(dataSize + loadingLength);
    }
  };

  return (
    <>
      <ApartmentCards data={data} />
      <Typography className={loadingMsg}>Loading more apartments...</Typography>
    </>
  );
};

export default ScrollingCards;

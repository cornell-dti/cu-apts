import React, { ReactElement } from 'react';
import styles from './Reviews.module.scss';

type Props = {
  readonly image: string;
  readonly phone: string;
  readonly address: string;
};

export default function Info({ image, phone, address }: Props): ReactElement {
  return (
    <div className={styles.component}>
      <p className={styles.title}>Info</p>
      <div className={styles.detail}>
        <p>{phone}</p>
        <p>{address}</p>
        <img className={styles.image} src={image} alt="" />
      </div>
    </div>
  );
}

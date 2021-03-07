import React, { ReactElement } from 'react';
import styles from './Review.module.scss';

type Props = {
  readonly phone: string;
  readonly address: string;
};

export default function Info({ phone, address }: Props): ReactElement {
  return (
    <div className={styles.component}>
      <p className={styles.title}>Info</p>
      <div className={styles.detail}>
        <p>{phone}</p>
        <p>{address}</p>
      </div>
    </div>
  );
}

import React, { useState, ReactElement } from 'react';
import CollapsibleQuestion from './CollapsibleQuestion';
import styles from './CollapsibleFAQ.module.scss';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FAQ } from '../../pages/FAQPage';
import { Button, Card, Collapse } from 'react-bootstrap';

type Props = {
  readonly headerName: string;
  readonly faqs: FAQ[];
};

export default function CollapsibleHeader({ headerName, faqs }: Props): ReactElement {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const toggle = () => setCollapseOpen(!collapseOpen);
  const collapseProps = { in: collapseOpen };

  return (
    <div>
      <Card className={styles.card}>
        <Card.Header
          className={collapseOpen ? styles.sectionCardHeaderOpen : styles.sectionCardHeaderClosed}
        >
          <Button
            className={collapseOpen ? styles.sectionToggleBtnOpen : styles.sectionToggleBtnClosed}
            style={styles}
            color="transparent"
            onClick={toggle}
          >
            {collapseOpen ? <ExpandMoreIcon fontSize="large" /> : <NavigateNextIcon fontSize="large" />}
          </Button>
          <div className={collapseOpen ? styles.sectionOpen : styles.sectionClosed}>{headerName}</div>
        </Card.Header>

        <Collapse {...collapseProps}>
          <Card.Body className={styles.sectionBody}>
            {faqs && faqs.map((faq, index) => <CollapsibleQuestion key={index} {...faq} />)}
          </Card.Body>
        </Collapse>
      </Card>
    </div>
  );
}

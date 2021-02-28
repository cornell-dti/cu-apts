import React, { useState, ReactElement } from 'react';
import styles from './CollapsibleFAQ.module.scss';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { Card, Button, Collapse } from 'react-bootstrap';

type Props = {
  readonly question: string;
  readonly answer: string;
};

export default function CollapsableQuestion({ answer, question }: Props): ReactElement {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const toggle = () => setCollapseOpen(!collapseOpen);
  const collapseProps = { in: collapseOpen };

  return (
    <div>
      <Card className={styles.card}>
        <Card.Header className={styles.questionCardHeader}>
          <div className={styles.question}>{question}</div>
          <Button className={styles.toggleBtn} style={styles} color="transparent" onClick={toggle}>
            {collapseOpen ? <RemoveIcon /> : <AddIcon />}
          </Button>
        </Card.Header>

        <Collapse {...collapseProps}>
          <Card.Body className={styles.answer}>{answer}</Card.Body>
        </Collapse>
      </Card>
    </div>
  );
}

import React, { useState, ReactElement } from 'react';
import { Collapse, Button, Card, CardBody, CardHeader } from 'reactstrap';
import styles from './CollapsibleQuestion.module.scss';

type Props = {
  readonly question: string;
  readonly answer: string;
}

export default function CollapsableQuestion({ answer, question }: Props): ReactElement {

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const collapseProps = { isOpen: isOpen };

  return (
    <div>
      <Card className={styles.card}>

        <CardHeader className={styles.header}>
          <div className={styles.question}>{question}</div>
          {!isOpen && <Button className={styles.Button} style={styles} color="primary" onClick={toggle}>+</Button>}
          {isOpen && <Button className={styles.Button} style={styles} color="primary" onClick={toggle}>-</Button>}
        </CardHeader>

        <Collapse {...collapseProps}>
          <CardBody className={styles.question}>
            {answer}
          </CardBody>
        </Collapse>

      </Card>
    </div>
  )

}

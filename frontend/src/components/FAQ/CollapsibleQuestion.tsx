import React, { useState, ReactElement } from 'react';
import { Collapse, Button, Card, CardBody, CardHeader } from 'reactstrap';
import styles from './CollapsibleFAQ.module.scss';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

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

        <CardHeader className={styles.questionCardHeader}>
          <div className={styles.question}>{question}</div>
          <Button className={styles.toggleBtn} style={styles} color="transparent" onClick={toggle}>{isOpen ? <RemoveIcon /> : <AddIcon />}</Button>
        </CardHeader>

        <Collapse {...collapseProps}>
          <CardBody className={styles.answer}>
            {answer}
          </CardBody>
        </Collapse>

      </Card>
    </div>
  )

}

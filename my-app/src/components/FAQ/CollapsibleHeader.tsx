import React, { useState, ReactElement } from 'react';
import { Collapse, Button, Card, CardBody, CardHeader } from 'reactstrap';
import CollapsibleQuestion from './CollapsibleQuestion';
import styles from './CollapsibleFAQ.module.scss';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

type faqQuestion = {
  readonly question: string;
  readonly answer: string;
}

type Props = {
  readonly headerName: string;
  readonly faqs: faqQuestion[];
}

export default function CollapsibleHeader({ headerName, faqs }: Props): ReactElement {

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const collapseProps = { isOpen: isOpen };


  return (
    <div>
      <Card className={styles.card}>

        <CardHeader className={isOpen ? styles.sectionCardHeaderOpen : styles.sectionCardHeaderClosed}>
          <Button className={isOpen ? styles.sectionToggleBtnOpen :
            styles.sectionToggleBtnClosed} style={styles} color="transparent"
            onClick={toggle}>{isOpen ? <ExpandMoreIcon fontSize="large" /> : <NavigateNextIcon fontSize="large" />}</Button>
          <div className={isOpen ? styles.sectionOpen : styles.sectionClosed}>{headerName}</div>
        </CardHeader>

        <Collapse {...collapseProps}>
          <CardBody className={styles.sectionBody}>
            {faqs.map((faq, index) => (<CollapsibleQuestion key={index} {...faq} />))}
          </CardBody>
        </Collapse>

      </Card>

    </div>
  )
}

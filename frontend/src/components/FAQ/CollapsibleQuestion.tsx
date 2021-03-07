import React, { ReactElement } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@material-ui/core';

type Props = {
  readonly question: string;
  readonly answer: string;
};

export default function CollapsableQuestion({ answer, question }: Props): ReactElement {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{question}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>{answer}</Typography>
      </AccordionDetails>
    </Accordion>
  );
}

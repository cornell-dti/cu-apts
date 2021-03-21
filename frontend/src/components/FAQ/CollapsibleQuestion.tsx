import React, { ReactElement } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  withStyles,
} from '@material-ui/core';

type Props = {
  readonly question: string;
  readonly answer: string;
};

const StyledAccordion = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
  },
})(Accordion);

export default function CollapsableQuestion({ answer, question }: Props): ReactElement {
  return (
    <Grid item>
      <StyledAccordion variant="outlined" square>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body1">{question}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography gutterBottom variant="body2">
            {answer}
          </Typography>
        </AccordionDetails>
      </StyledAccordion>
    </Grid>
  );
}

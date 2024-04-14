import React, { ReactElement, useEffect, useState } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  makeStyles,
} from '@material-ui/core';
import { colors } from '../../colors';

type Props = {
  readonly question: string;
  readonly answer: string;
};

/**
 * CollapsableQuestion Component
 *
 * Displays a question and answer in a collapsable format. Formatted for the FAQ page.
 *
 * @param answer - the answer to the question
 * @param question - the question to be displayed
 * @returns ReactElement
 *
 */
export default function CollapsableQuestion({ answer, question }: Props): ReactElement {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const useStyles = makeStyles(() => ({
    questionTitle: {
      fontSize: isMobile ? '10px' : '22px',
      fontWeight: 600,
      lineHeight: isMobile ? '14px' : '32px',
      color: colors.red1,
    },
    answerBlurb: {
      fontSize: isMobile ? '10px' : '18px',
      fontWeight: 400,
      lineHeight: isMobile ? '14px' : '28px',
      color: colors.black,
    },
    questionContainer: {
      borderRadius: '8px',
      border: '1px solid' + colors.gray5,
      background: colors.white,
      marginBottom: isMobile ? ('8px!important' as '8px') : ('16px!important' as '16px'),
      padding: isMobile ? '0px' : '12px',
    },
  }));
  const { questionTitle, answerBlurb, questionContainer } = useStyles();
  return (
    <Grid item>
      <Accordion variant="outlined" square className={questionContainer}>
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon fontSize={isMobile ? 'medium' : 'large'} htmlColor={colors.red1} />
          }
        >
          <Typography variant="body1" className={questionTitle}>
            {question}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography gutterBottom variant="body2" className={answerBlurb}>
            {answer}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}

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

const useStyles = makeStyles(
  () => ({
    questionTitle: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '32px',
      color: colors.red1,
    },
    answerBlurb: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
      color: colors.black,
      padding: 0,
    },
    questionContainer: {
      borderRadius: '8px',
      border: '1px solid' + colors.gray5,
      background: colors.white,
      marginBottom: '16px!important' as '16px',
      padding: '2px',
    },
    summary: {
      padding: '5px 16px',
      minHeight: 15,
      '&.Mui-expanded': {
        minHeight: 15,
      },
      '& .MuiAccordionSummary-content': {
        padding: '0 0',
        '&.Mui-expanded': {
          margin: '12px 0',
        },
      },
      '& .MuiButtonBase-root': {
        padding: '0 12px',
      },
    },
    details: {
      display: 'flex',
      padding: '0px 16px 16px 16px',
    },
    questionTitleMobile: {
      fontSize: '10px',
      fontWeight: 600,
      lineHeight: '14px',
      color: colors.red1,
    },
    answerBlurbMobile: {
      fontSize: '10px',
      fontWeight: 400,
      lineHeight: '14px',
      color: colors.black,
      padding: 0,
    },
    questionContainerMobile: {
      borderRadius: '8px',
      border: '1px solid' + colors.gray5,
      background: colors.white,
      marginBottom: '8px!important' as '8px',
      padding: '0px',
    },
    summaryMobile: {
      padding: '0px 10px',
      minHeight: 15,
      '&.Mui-expanded': {
        minHeight: 15,
      },
      '& .MuiAccordionSummary-content': {
        padding: '0 0',
        '&.Mui-expanded': {
          margin: '12px 0',
        },
      },
      '& .MuiButtonBase-root': {
        padding: '0 12px',
      },
    },
  }),
  {}
);

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

  const { questionTitle, answerBlurb, questionContainer, summary, details } = useStyles(isMobile);
  return (
    <Grid item>
      <Accordion
        variant="outlined"
        square
        className={questionContainer}
        style={isMobile ? { marginBottom: '8px!important' as '8px', padding: '0' } : {}}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon fontSize={isMobile ? 'small' : 'medium'} htmlColor={colors.red1} />
          }
          className={summary}
          style={isMobile ? { padding: '0 10px' } : {}}
        >
          <Typography
            variant="body1"
            className={questionTitle}
            style={isMobile ? { fontSize: '10px', lineHeight: '14px' } : {}}
          >
            {question}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={details}>
          <Typography
            gutterBottom
            variant="body2"
            className={answerBlurb}
            style={isMobile ? { fontSize: '10px', lineHeight: '14px' } : {}}
          >
            {answer}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}

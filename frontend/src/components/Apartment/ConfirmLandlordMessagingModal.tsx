import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUser, createAuthHeaders } from '../../utils/firebase';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  makeStyles,
  Divider,
  TextField,
  Button,
} from '@material-ui/core';
import closeIcon from '../../assets/close-button-icon.svg';
import sendIcon from '../../assets/send-icon.svg';

const useStyles = makeStyles(() => ({
  dialog: {
    borderRadius: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '0px' : '15px'),
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '100%' : '1200px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '100%' : '768px'),
    margin: 'auto', // Center the dialog
    padding: ({ isMobile }: { isMobile: boolean }) => (isMobile ? undefined : '0px 0px 0px 0px'),
  },
  firstContentBox: {
    width: '100%',
    maxWidth: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '317px' : '1131px'),
    marginBottom: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '0px'),
  },
  firstContentTitleBox: {
    width: '100%',
    maxWidth: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '317px' : '1131px'),
  },
  titleBox: {
    fontWeight: 600,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '24px' : '26px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '100%' : '36px'),
  },
  firstContentDescriptionBox: {
    width: '100%',
    maxWidth: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '317px' : '939px'),
  },
  contentDescription: {
    fontWeight: 400,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '18px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '28px'),
    marginTop: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '8px' : '4px'),
    color: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '#5D5D5D' : '#292929'),
  },
  secondTitle: {
    fontWeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? 400 : 600),
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '24px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '130%'),
  },
  subjectField: {
    width: '100%',
    maxWidth: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '317px' : '940px'),
    '& .MuiOutlinedInput-root': {
      height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '32px' : '48px'),
      borderRadius: '8px',
    },
    marginTop: '4px',
  },
  subjectText: {
    fontWeight: 400,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    marginBottom: '4px',
  },
  bodyText: {
    fontWeight: 400,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    marginTop: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '24px'),
  },
  counterText: {
    marginTop: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '24px'),
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    color: '#999',
  },
  customTextField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      padding: 0,
    },
    '& .MuiInputBase-inputMultiline': {
      padding: '16px',
      fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
      lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    },
  },
  draftText: {
    color: '#898989',
    marginTop: '16px',
    width: '137px',
    height: '16px',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '100%',
    letterSpacing: '0%',
  },
  submitButton: {
    backgroundColor: '#B94630',
    color: 'white',
    borderRadius: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '20px' : '30px'),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    marginLeft: '24px',
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '125px' : '168px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '36px' : '48px'),
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#e02f52',
      boxShadow: 'none',
    },
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    color: '#5D5D5D',
    borderRadius: '30px',
    border: '1.5px solid #E8E8E8',
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '28px',
    letterSpacing: '0%',
    width: '100px',
    height: '48px',
    boxShadow: 'none',
    textTransform: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  },
  bottomButtons: {
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '117px' : '292px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '36px' : '48px'),
    marginLeft: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '160px' : '702px'),
  },
}));

export type ConfirmLandlordMessagingModalProps = {
  open: boolean;
  email: string | null;
  subject: string;
  body: string;
  onClose: () => void;
  isMobile: boolean;
  triggerToast: () => void;
  triggerErrorToast: () => void;
};

const ConfirmLandlordMessagingModal = ({
  open,
  email,
  subject,
  body,
  onClose,
  isMobile,
  triggerToast,
  triggerErrorToast,
}: ConfirmLandlordMessagingModalProps) => {
  const classes = useStyles({ isMobile });
  const [textSubject, setSubject] = useState(subject);
  const [message, setMessage] = useState(body);

  const handleSubmit = async () => {
    try {
      // Check if email is null
      if (email === null) {
        console.error('No contact information found');
        return; // Exit the function early
      }

      const user = await getUser(true); // Forces sign-in if not already
      if (!user) throw new Error('User not signed in');

      const token = await user.getIdToken(true);
      const headers = createAuthHeaders(token);

      const response = await axios.post(
        `/api/send-email-to-landlord/${encodeURIComponent(email)}/${encodeURIComponent(
          message
        )}/${encodeURIComponent(textSubject)}`,
        {},
        headers
      );

      console.log('Email sent:', response.data);
      triggerToast(); // ✅ show success toast
      onClose();
    } catch (error) {
      triggerErrorToast();
      onClose();
    }
  };

  useEffect(() => {
    setSubject(subject);
    setMessage(body);
  }, [subject, body]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: classes.dialog,
      }}
      maxWidth={false}
      fullScreen={isMobile}
    >
      <DialogContent style={{ padding: isMobile ? '40px 38px 58px 38px' : '40px 36px 58px 33px' }}>
        <Box className={classes.firstContentBox}>
          <Box style={{ display: 'flex' }} className={classes.firstContentTitleBox}>
            <Typography className={classes.titleBox}>Confirm Your Message</Typography>
            {!isMobile && (
              <Button
                style={{ width: '36px', height: '36px', minWidth: '36px', marginLeft: '811px' }}
                onClick={onClose}
              >
                <img src={closeIcon} style={{ width: '24px', height: '24px' }} />
              </Button>
            )}
          </Box>
          <Box className={classes.firstContentDescriptionBox}>
            <Typography className={classes.contentDescription}>
              You're almost there! Take a moment to review your message and ensure it's exactly what
              you want to send to the landlord.
            </Typography>
          </Box>
        </Box>
        {!isMobile && (
          <Divider
            style={{ height: '1px', backgroundColor: '#aaa', width: '100%', margin: '22px auto' }}
          />
        )}
        <Box style={{ width: '1134px', height: '470px' }}>
          <Box style={{ width: '940px', height: '31px' }}>
            <Typography className={classes.secondTitle}>
              Auto generated message based on your inputs
            </Typography>
          </Box>
          <Box style={{ width: '940px', height: '68px', marginTop: isMobile ? '12px' : '24px' }}>
            <Typography className={classes.subjectText}>Subject</Typography>
            <TextField
              variant="outlined"
              value={textSubject}
              onChange={(e) => setSubject(e.target.value)}
              className={classes.subjectField}
              inputProps={{
                style: {
                  padding: '0px 0px 0px 16px',
                  fontSize: isMobile ? '12px' : '16px',
                  lineHeight: isMobile ? '16px' : '100%',
                },
              }}
            />
          </Box>
          <Box
            style={{
              width: isMobile ? '317px' : '940px',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <Typography className={classes.bodyText}>Body</Typography>
            <Typography className={classes.counterText}>{message.length}/2000</Typography>
          </Box>
          <Box
            style={{
              width: isMobile ? '317px' : '940px',
              height: isMobile ? '240px' : '270px',
              marginTop: '4px',
            }}
          >
            <TextField
              variant="outlined"
              multiline
              minRows={12}
              maxRows={12}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              className={classes.customTextField}
            />
          </Box>
          <Box
            style={{
              display: 'flex',
              width: isMobile ? '117px' : '1131px',
              height: isMobile ? '36px' : '48px',
              marginTop: isMobile ? '16px' : '22px',
            }}
          >
            {!isMobile && <Typography className={classes.draftText}>Email draft saved</Typography>}

            <Box className={classes.bottomButtons}>
              {!isMobile && (
                <Button variant="contained" onClick={onClose} className={classes.cancelButton}>
                  Cancel
                </Button>
              )}

              <Button variant="contained" className={classes.submitButton} onClick={handleSubmit}>
                <Box style={{ display: 'flex' }}>
                  <img
                    src={sendIcon}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginLeft: '-5px',
                      marginTop: '-2px',
                      marginRight: '10px',
                    }}
                  />
                  Send Email
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmLandlordMessagingModal;

import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  makeStyles,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Slider,
} from '@material-ui/core';
import { Add, Remove } from '@material-ui/icons';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import calendarIcon from '../../assets/date-dropdown.svg';
import bedroomIcon from '../../assets/bedroom-icon.svg';
import bathtubIcon from '../../assets/bathtub-icon.svg';
import sendIcon from '../../assets/send-icon.svg';
import closeIcon from '../../assets/close-button-icon.svg';
import ConfirmLandlordMessagingModal from '../../components/Apartment/ConfirmLandlordMessagingModal';

const useStyles = makeStyles(() => ({
  dialog: {
    borderRadius: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '0px' : '15px'),
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '100%' : '1200px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '100%' : '768px'),
    margin: 'auto',
    padding: ({ isMobile }: { isMobile: boolean }) => (isMobile ? undefined : '0px 0px 0px 0px'),
  },
  firstContentBox: {
    width: '100%',
    maxWidth: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '318px' : '1131px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? 'auto' : 'auto'),
  },
  firstContentTitleBox: {
    width: '100%',
    maxWidth: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '318px' : '1131px'),
    flexDirection: ({ isMobile }: { isMobile: boolean }) => (isMobile ? 'column' : 'row'),
    alignItems: ({ isMobile }: { isMobile: boolean }) => (isMobile ? 'flex-start' : 'center'),
  },
  firstContentTitle: {
    fontWeight: 600,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '24px' : '26px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '100%' : '36px'),
  },
  firstContentDescriptionBox: {
    width: '100%',
    maxWidth: '1004px',
  },
  secondContentBox: {
    width: '100%',
    maxWidth: '1131px',
    display: 'flex',
    flexDirection: ({ isMobile }: { isMobile: boolean }) => (isMobile ? 'column' : 'row'),
    marginTop: '20px',
  },
  inputLabel: {
    fontWeight: 400,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: '16px',
    marginBottom: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '0px' : '4px'),
    marginLeft: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '6.15px' : '10px'),
  },
  inputField: {
    width: '100%',
    borderRadius: '8px',
    '& .MuiOutlinedInput-root': {
      height: '48px',
    },
    marginTop: '4px',
  },
  subjectField: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '40px' : '48px'),
      borderRadius: '8px',
    },
    marginTop: '4px',
  },
  datePickerField: {
    width: '100%',
    '& .MuiInputBase-root': {
      height: '48px',
    },
  },
  counterButton: {
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12.29px' : '32px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12.29px' : '32px'),
    minWidth: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12.29px' : '32px'),
    borderRadius: '50%',
    padding: 0,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#d1d1d1',
    },
  },
  counterValue: {
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '14.74px' : '24px'),
    fontWeight: 600,
    marginTop: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '2.16px' : '4px'),
    marginLeft: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '32px' : '43.75px'),
  },
  slider: {
    color: '#ff385c',
    '& .MuiSlider-rail': {
      height: '6px',
      backgroundColor: '#E6E6E6',
    },
    '& .MuiSlider-track': {
      height: '6px',
      borderRadius: '3px',
    },
    '& .MuiSlider-thumb': {
      width: '16px',
      height: '16px',
      backgroundColor: '#FFFFFF',
      border: '2px solid #ff385c',
      marginTop: '-5px',
      marginLeft: '-8px',
    },
    '& .MuiSlider-markLabel': {
      display: 'none',
    },
    '& .MuiSlider-mark': {
      backgroundColor: '#E6E6E6',
      height: '20px',
      borderRadius: 2,
      width: '5px',
      marginTop: '-7px',
    },
  },
  priceBoxContainer: {
    position: 'relative',
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '308px' : '485px'),
    marginTop: '10px',
    marginBottom: '40px',
  },
  priceValueBox: {
    position: 'absolute',
    top: '40px',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    border: '1px solid #E0E0E0',
    borderRadius: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '5.46px' : '8px'),
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
  },
  priceText: {
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    fontWeight: 400,
  },
  currencySymbol: {
    color: '#666',
    marginRight: '4px',
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
  },
  priceRangeDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '14px',
    color: '#666',
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
  iconLayout: {
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '153.63px' : '230.5px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '46.69px' : '76px'),
    borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
  },
  iconsDisplay: {
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '73px' : '100px'),
  },
  inquiryButtonContainer: {
    display: 'flex',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  subjectTextField: {
    fontWeight: 400,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    marginBottom: '4px',
  },
  inquiryButton: {
    backgroundColor: 'transparent',
    color: '#333',
    fontWeight: 500,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '16px' : '100%'),
    textTransform: 'none',
    '&:not(.selected)': {
      border: '1px solid #ddd',
    },
    '&.selected': {
      backgroundColor: '#DC4A4A1A',
      color: '#DC4A4A',
      border: '1.5px solid #DC4A4A !important',
    },
    '&.selected:hover': {},
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    '&:focus': {
      outline: 'none',
    },
  },
  iconParameters: {
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? 22.11 : 30),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? 22.11 : 30),
    padding: ({ isMobile }: { isMobile: boolean }) =>
      isMobile ? '12.29px 64.76px' : '23px 100.25px',
  },
  buttonIconParametersLeft: {
    borderRight: '1px solid rgba(0, 0, 0, 0.23)',
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '39.31px' : '64px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '39.31px' : '64px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconParametersRight: {
    borderLeft: '1px solid rgba(0, 0, 0, 0.23)',
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '39.31px' : '64px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '39.31px' : '64px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondColumnTitle: {
    fontWeight: 600,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '18px' : '24px'),
    lineHeight: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '28px' : '130%'),
    marginBottom: '16px',
  },
  messageArea: {
    width: '100%',
    marginTop: '16px',
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
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '99px' : '168px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '36px' : '48px'),
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#e02f52',
      boxShadow: 'none',
    },
  },
  bottomButtons: {
    width: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '180px' : '292px'),
    height: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '36px' : '48px'),
    marginLeft: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '210px' : '702px'),
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
  secondTitleBox: {
    fontWeight: 400,
    fontSize: ({ isMobile }: { isMobile: boolean }) => (isMobile ? '12px' : '16px'),
    lineHeight: '16px',
  },
  inputFieldMobile: {
    width: '318px',
    marginTop: '4px',
    '& .MuiOutlinedInput-root': {
      height: '40px',
    },
  },
  datePickerFieldMobile: {
    width: '318px',
    marginTop: '4px',
    '& .MuiInputBase-root': {
      height: '40px',
    },
  },
}));

export type LandlordMessagingModalProps = {
  aptName: string;
  open: boolean;
  landlord: string;
  email: string | null;
  onClose: () => void;
  isMobile: boolean;
  onSubmit: (subject: string, body: string) => void;
  onEmailSuccess: () => void;
  onEmailFailure: () => void;
};

const LandlordMessagingModal = ({
  aptName,
  open,
  landlord,
  email,
  onClose,
  isMobile,
  onSubmit,
  onEmailSuccess,
  onEmailFailure,
}: LandlordMessagingModalProps) => {
  const classes = useStyles({ isMobile });
  const [nameInputValue, setNameInputValue] = useState('');
  const [phoneInputValue, setPhoneInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [priceRange, setPriceRange] = useState([1000, 2500]);
  const [inquiryType, setInquiryType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const pickerRef = useRef<any>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [messageError, setMessageError] = useState(false);

  const handleInquiryType = (inquiryType: string) => {
    if (inquiryType == 'availability') {
      setSubject('Inquiry for ' + aptName + ' Rental Availabilities');
      setMessage(
        'Dear ' +
          landlord +
          ', \n\nI am interested in learning more about your available apartments at ' +
          aptName +
          '. My preferred move-in date is ' +
          selectedDate?.toLocaleDateString() +
          ', and I am looking for a ' +
          bedrooms +
          ' beds and ' +
          bathrooms +
          ' bathrooms unit within my budget of $' +
          priceRange[0] +
          ' to $' +
          priceRange[1] +
          ' \n\nCould you please let me know which units are currently available and any next steps for applying? You can reach me at ' +
          phoneInputValue +
          ' or using this email. Please let me know if you need any additional information from me. \n\nBest regards, \n' +
          nameInputValue
      );
      setInquiryType('availability');
    } else if (inquiryType == 'tour') {
      setSubject('Request to Schedule a Tour for ' + aptName);
      setMessage(
        'Dear ' +
          landlord +
          ', \n\nI am very interested in ' +
          aptName +
          ' and would like to schedule a tour to view the available units. My preferred dates and times are [List 2-3 options], but I am flexible and can adjust to your availability. \n\nPlease let me know if a tour can be arranged and what the next steps are. You can contact me at ' +
          phoneInputValue +
          ' or using this email. Thank you for your time, and I look forward to your response. \n\nBest regards, \n' +
          nameInputValue
      );
      setInquiryType('tour');
    } else {
      setSubject('Request for Pricing Details at ' + aptName);
      setMessage(
        'Dear ' +
          landlord +
          ', \n\nI am interested in your rental at ' +
          aptName +
          ' and would like to request more information regarding the pricing for your available units. Specifically, I am looking for details on monthly rent, utilities, and any additional fees for a ' +
          bedrooms +
          ' bedroom and ' +
          bathrooms +
          ' bathroom apartment. \n\nMy intended move-in date is ' +
          selectedDate?.toLocaleDateString() +
          '. Please let me know if you need any further information from me. I can be reached at ' +
          phoneInputValue +
          ' or using this email. \n\nThank you for your assistance. \n\nBest regards, \n' +
          nameInputValue
      );
      setInquiryType('pricing');
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const handlePriceRangeChange = (event: React.ChangeEvent<{}>, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const incrementBedrooms = () => {
    setBedrooms((prev) => Math.min(prev + 1, 5));
  };

  const decrementBedrooms = () => {
    setBedrooms((prev) => Math.max(prev - 1, 1));
  };

  const incrementBathrooms = () => {
    setBathrooms((prev) => Math.min(prev + 1, 5));
  };

  const decrementBathrooms = () => {
    setBathrooms((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const nameValid = nameInputValue.trim() !== '';
    const phoneValid = phoneInputValue.trim() !== '';
    const dateValid = selectedDate !== null;
    const subjectValid = subject.trim() !== '';
    const messageValid = message.trim() !== '';

    setNameError(!nameValid);
    setPhoneError(!phoneValid);
    setDateError(!dateValid);
    setSubjectError(!subjectValid);
    setMessageError(!messageValid);

    if (nameValid && phoneValid && dateValid && subjectValid && messageValid) {
      setShowConfirmModal(true);
      onSubmit(subject, message);
    }
  };

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
      <DialogContent style={{ padding: isMobile ? '40px 37px 58px 38px' : '40px 36px 58px 33px' }}>
        <Box className={classes.firstContentBox}>
          <Box style={{ display: 'flex' }} className={classes.firstContentTitleBox}>
            <Typography className={classes.firstContentTitle}>
              Send an Email to {landlord}
            </Typography>
            {!isMobile && (
              <Button
                style={{ width: '36px', height: '36px', minWidth: '36px', marginLeft: '702px' }}
                onClick={onClose}
              >
                <img src={closeIcon} style={{ width: '24px', height: '24px' }} />
              </Button>
            )}
          </Box>
          <Box className={classes.firstContentDescriptionBox}>
            <Typography
              style={{
                fontWeight: 400,
                fontSize: isMobile ? '12px' : '18px',
                lineHeight: isMobile ? '16px' : '28px',
                marginTop: isMobile ? '8px' : '0px',
              }}
            >
              Not sure how to reach out to the landlord? Fill out the form, and we'll create and
              send a tailored email directly to their inbox.
            </Typography>
          </Box>
        </Box>
        {!isMobile && (
          <Divider
            style={{ height: '1px', backgroundColor: '#aaa', width: '100%', margin: '20px auto' }}
          />
        )}

        <Box className={classes.secondContentBox}>
          <Box style={{ flex: 1, maxWidth: isMobile ? '100%' : '485px', marginRight: '40px' }}>
            <Box
              style={{
                display: 'flex',
                gap: '24px',
                flexDirection: isMobile ? 'column' : 'row',
                marginBottom: '24px',
              }}
            >
              <Box style={{ flex: isMobile ? 1 : '0 0 206px' }}>
                <Box style={{ display: 'flex' }}>
                  <Typography className={classes.secondTitleBox}>Name</Typography>
                  {subjectError && (
                    <Typography
                      style={{
                        color: '#f44336',
                        fontSize: '12px',
                        marginBottom: '4px',
                        marginLeft: '8px',
                      }}
                    >
                      *This field is required
                    </Typography>
                  )}
                </Box>
                <TextField
                  variant="outlined"
                  placeholder="First Last"
                  value={nameInputValue}
                  onChange={(e) => setNameInputValue(e.target.value)}
                  className={isMobile ? classes.inputFieldMobile : classes.inputField}
                  error={nameError}
                  inputProps={{
                    style: {
                      padding: '0px 0px 0px 16px',
                      fontSize: isMobile ? '12px' : '16px',
                    },
                  }}
                />
              </Box>
              <Box style={{ flex: isMobile ? 1 : '0 0 255px' }}>
                <Box style={{ display: 'flex' }}>
                  <Typography className={classes.secondTitleBox}>Phone</Typography>
                  {subjectError && (
                    <Typography
                      style={{
                        color: '#f44336',
                        fontSize: '12px',
                        marginBottom: '4px',
                        marginLeft: '8px',
                      }}
                    >
                      *This field is required
                    </Typography>
                  )}
                </Box>
                <TextField
                  variant="outlined"
                  placeholder="+1 (xxx) xxx-xxxx"
                  value={phoneInputValue}
                  onChange={(e) => setPhoneInputValue(e.target.value)}
                  className={isMobile ? classes.inputFieldMobile : classes.inputField}
                  error={phoneError}
                  inputProps={{
                    style: {
                      padding: '0px 0px 0px 16px',
                      fontSize: isMobile ? '12px' : '16px',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Move-in date */}
            <Box style={{ marginBottom: '24px' }}>
              <Box style={{ display: 'flex' }}>
                <Typography className={classes.secondTitleBox} style={{ marginBottom: '4px' }}>
                  Move-in date
                </Typography>
                {subjectError && (
                  <Typography
                    style={{
                      color: '#f44336',
                      fontSize: '12px',
                      marginBottom: '4px',
                      marginLeft: '8px',
                    }}
                  >
                    *This field is required
                  </Typography>
                )}
              </Box>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  id="move-in-date-picker"
                  placeholder="MM/DD/YYYY"
                  value={selectedDate}
                  onChange={handleDateChange}
                  error={dateError}
                  open={isCalendarOpen}
                  onClose={() => setIsCalendarOpen(false)}
                  PopoverProps={{
                    anchorEl: pickerRef.current,
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                  className={isMobile ? classes.datePickerFieldMobile : classes.datePickerField}
                  KeyboardButtonProps={{ style: { display: 'none' } }}
                  TextFieldComponent={(props) => (
                    <TextField
                      {...props}
                      inputRef={pickerRef}
                      variant="outlined"
                      onClick={() => setIsCalendarOpen(true)}
                      InputProps={{
                        ...props.InputProps,
                        readOnly: true,
                        style: {
                          paddingLeft: 0,
                          height: isMobile ? '40px' : '48px',
                          fontSize: isMobile ? '12px' : '16px',
                        },
                        startAdornment: (
                          <InputAdornment position="start" style={{ marginRight: 0 }}>
                            <Box
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: isMobile ? '40px' : '48px',
                                height: isMobile ? '40px' : '48px',
                                borderRight: '1px solid #E0E0E0',
                                marginRight: '16px',
                              }}
                            >
                              <img
                                src={calendarIcon}
                                alt="calendar"
                                style={{ width: 20, height: 20, paddingLeft: '3px' }}
                              />
                            </Box>
                          </InputAdornment>
                        ),
                        endAdornment: null,
                      }}
                    />
                  )}
                />
              </MuiPickersUtilsProvider>
            </Box>

            {/* Bedrooms */}
            <Box style={{ display: 'flex' }}>
              <Box
                style={{
                  marginBottom: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                }}
              >
                <Box className={classes.iconLayout}>
                  <img src={bedroomIcon} className={classes.iconParameters} />
                </Box>
                <Box style={{ display: 'flex' }}>
                  <Box className={classes.buttonIconParametersLeft}>
                    <Button
                      variant="contained"
                      className={classes.counterButton}
                      onClick={decrementBedrooms}
                      disabled={bedrooms <= 1}
                    >
                      <Remove fontSize="small" />
                    </Button>
                  </Box>
                  <Box className={classes.iconsDisplay}>
                    <Typography className={classes.counterValue}>{bedrooms}</Typography>
                    <Typography className={classes.inputLabel}>Bedrooms</Typography>
                  </Box>
                  <Box className={classes.buttonIconParametersRight}>
                    <Button
                      variant="contained"
                      className={classes.counterButton}
                      onClick={incrementBedrooms}
                      disabled={bedrooms >= 5}
                    >
                      <Add fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Bathrooms */}
              <Box
                style={{
                  marginLeft: isMobile ? '8px' : '20px',
                  marginBottom: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                }}
              >
                <Box className={classes.iconLayout}>
                  <img src={bathtubIcon} className={classes.iconParameters} />
                </Box>
                <Box style={{ display: 'flex' }}>
                  <Box className={classes.buttonIconParametersLeft}>
                    <Button
                      variant="contained"
                      className={classes.counterButton}
                      onClick={decrementBathrooms}
                      disabled={bathrooms <= 1}
                    >
                      <Remove fontSize="small" />
                    </Button>
                  </Box>
                  <Box className={classes.iconsDisplay}>
                    <Typography className={classes.counterValue}>{bathrooms}</Typography>
                    <Typography className={classes.inputLabel}>Bathrooms</Typography>
                  </Box>
                  <Box className={classes.buttonIconParametersRight}>
                    <Button
                      variant="contained"
                      className={classes.counterButton}
                      onClick={incrementBathrooms}
                      disabled={bathrooms >= 5}
                    >
                      <Add fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Price Range */}
            <Box style={{ marginBottom: '24px' }}>
              <Typography className={classes.inputLabel}>Price range</Typography>
              <Box className={classes.priceBoxContainer}>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="off"
                  min={0}
                  max={3500}
                  step={50}
                  className={classes.slider}
                  marks={[{ value: 0 }, { value: 3500 }]}
                />
                {/* First thumb value box */}
                <Box
                  className={classes.priceValueBox}
                  style={{
                    left: `calc(${((priceRange[0] - 0) / (3500 - 0)) * 100}%)`,
                  }}
                >
                  <Typography component="span" className={classes.currencySymbol}>
                    $
                  </Typography>
                  <Typography component="span" className={classes.priceText}>
                    {priceRange[0]}
                  </Typography>
                </Box>
                {/* Second thumb value box */}
                <Box
                  className={classes.priceValueBox}
                  style={{
                    left: `calc(${((priceRange[1] - 0) / (3500 - 0)) * 100}%)`,
                  }}
                >
                  <Typography component="span" className={classes.currencySymbol}>
                    $
                  </Typography>
                  <Typography component="span" className={classes.priceText}>
                    {priceRange[1]}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Column */}
          <Box style={{ flex: 1, maxWidth: isMobile ? '100%' : '606px' }}>
            <Typography className={classes.secondColumnTitle}>Your message</Typography>

            {/* Inquiry Type */}
            <Box style={{ marginBottom: '24px' }}>
              <Box className={classes.inquiryButtonContainer}>
                <Button
                  className={`${classes.inquiryButton} ${
                    inquiryType === 'availability' ? 'selected' : ''
                  }`}
                  style={{
                    width: isMobile ? '142px' : '205px',
                    height: isMobile ? '32px' : '48px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: isMobile ? '8px' : '0px',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: isMobile ? '8px' : '0px',
                  }}
                  onClick={() => handleInquiryType('availability')}
                >
                  Ask for availabilities
                </Button>
                <Button
                  className={`${classes.inquiryButton} ${inquiryType === 'tour' ? 'selected' : ''}`}
                  style={{
                    width: isMobile ? '118px' : '173px',
                    height: isMobile ? '32px' : '48px',
                    borderTopLeftRadius: isMobile ? '8px' : '0px',
                    borderTopRightRadius: isMobile ? '8px' : '0px',
                    borderBottomLeftRadius: isMobile ? '8px' : '0px',
                    borderBottomRightRadius: isMobile ? '8px' : '0px',
                    marginLeft: isMobile ? '4px' : '0px',
                  }}
                  onClick={() => handleInquiryType('tour')}
                >
                  Schedule a tour
                </Button>
                <Button
                  className={`${classes.inquiryButton} ${
                    inquiryType === 'pricing' ? 'selected' : ''
                  }`}
                  style={{
                    width: isMobile ? '159px' : '228px',
                    height: isMobile ? '32px' : '48px',
                    borderTopLeftRadius: isMobile ? '8px' : '0px',
                    borderTopRightRadius: '8px',
                    borderBottomLeftRadius: isMobile ? '8px' : '0px',
                    borderBottomRightRadius: '8px',
                    marginTop: isMobile ? '8px' : '0px',
                  }}
                  onClick={() => handleInquiryType('pricing')}
                >
                  Request pricing details
                </Button>
              </Box>
            </Box>

            {/* Subject */}
            <Box style={{ marginBottom: '24px' }}>
              <Box style={{ display: 'flex' }}>
                <Typography className={classes.subjectTextField}>Subject</Typography>
                {subjectError && (
                  <Typography
                    style={{
                      color: '#f44336',
                      fontSize: '12px',
                      marginBottom: '4px',
                      marginLeft: '8px',
                    }}
                  >
                    *This field is required
                  </Typography>
                )}
              </Box>

              <TextField
                variant="outlined"
                placeholder="Please describe the subject of your message"
                value={subject}
                error={subjectError}
                onChange={(e) => setSubject(e.target.value)}
                className={classes.subjectField}
                inputProps={{
                  style: {
                    padding: '0px 0px 0px 16px',
                    fontSize: isMobile ? '12px' : '16px',
                    lineHeight: isMobile ? '16px' : '100%',
                  },
                }}
                // 🔻 Remove the default helperText
                helperText=""
              />
            </Box>

            {/* Message */}
            <Box className={classes.messageArea}>
              <Box
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}
              >
                <Typography className={classes.subjectTextField}>Body</Typography>
                {subjectError && (
                  <Typography
                    style={{
                      color: '#f44336',
                      fontSize: '12px',
                      marginBottom: '4px',
                      marginLeft: isMobile ? '-110px' : '-360px',
                    }}
                  >
                    *This field is required
                  </Typography>
                )}
                <Typography
                  style={{
                    fontSize: isMobile ? '12px' : '16px',
                    lineHeight: isMobile ? '16px' : '100%',
                    color: '#999',
                  }}
                >
                  {message.length}/2000
                </Typography>
              </Box>
              <TextField
                variant="outlined"
                multiline
                minRows={10}
                maxRows={10}
                error={messageError}
                placeholder="Write your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth
                className={classes.customTextField}
              />
            </Box>
          </Box>
        </Box>

        {/* Footer with Submit Button */}
        <Box style={{ display: 'flex', width: '1131px', height: '48px', marginTop: '20px' }}>
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
                  style={{ width: '20px', height: '20px', marginRight: '4px', marginTop: '-2px' }}
                />
                Confirm
              </Box>
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <ConfirmLandlordMessagingModal
        open={showConfirmModal}
        email={email}
        subject={subject}
        body={message}
        onClose={() => setShowConfirmModal(false)}
        isMobile={isMobile}
        triggerToast={onEmailSuccess}
        triggerErrorToast={onEmailFailure}
      />
    </Dialog>
  );
};

export default LandlordMessagingModal;

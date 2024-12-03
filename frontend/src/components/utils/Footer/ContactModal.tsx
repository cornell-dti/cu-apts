import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import Toast from '../Toast';
import { colors } from '../../../colors';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useModal } from './ContactModalContext';
import apartmentIcon from '../../../assets/apartmentIcon.svg';
import questionMarkIcon from '../../../assets/questionMark.svg';
import UploadPhotos from '../UploadPhotos';
import { CantFindApartmentForm } from '../../../../../common/types/db-types';
import { QuestionForm } from '../../../../../common/types/db-types';
import { createAuthHeaders, uploadFile } from '../../../utils/firebase';
import { includesProfanity } from '../../../utils/profanity';
import { ReactComponent as XIcon } from '../../../assets/xIcon.svg';

const PHOTOS_LIMIT = 3;
const PHOTO_MAX_MB = 10;
const TOAST_TIME = 3500;

interface Props {
  user: firebase.User | null;
}

const useStyles = makeStyles((theme) => ({
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    height: '1px',
    width: '100%',
    margin: '10px auto',
  },
  modalStyle: {
    width: '640px',
    padding: '32px',
    borderRadius: '13px',
  },
  bodyText: {
    fontSize: '18px',
    margin: '22px 0 22px 0',
  },
  xButton: {
    fill: colors.black,
    cursor: 'pointer',
    position: 'absolute',
    right: '32px',
    top: '33px',
  },

  optionGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: colors.red1 + '!important',
    padding: '32px 36px',
    gap: '16px',
    height: '169px',
    justifyContent: 'center',
    '& > span': {
      flexDirection: 'column',
    },
    '&:hover': {
      backgroundColor: colors.red5,
      boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.25)',
    },
  },
  optionText: {
    fontSize: '18px',
    fontWeight: 500,
    textTransform: 'none',
  },
  optionIcon: {
    paddingBottom: '16px',
  },

  hollowRedButton: {
    minWidth: '80px',
    height: '35px',
    borderRadius: '30px',
    border: '2px solid',
    borderColor: `${colors.red1} !important`,
    backgroundColor: 'transparent',
    color: colors.red1,
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.1)',
      opacity: 0.8,
    },
  },
  submitButton: {
    borderRadius: '30px',
    width: '80px',
  },
}));

//  Can't Find Your Apartment Modal Data
interface CantFindApartmentFormData {
  name: string;
  address: string;
  localPhotos: File[];
}

const defaultApartmentForm: CantFindApartmentFormData = {
  name: '',
  address: '',
  localPhotos: [],
};

type apartmentFormAction =
  | { type: 'updateApartmentName'; name: string }
  | { type: 'updateApartmentAddress'; address: string }
  | { type: 'updatePhotos'; photos: File[] }
  | { type: 'reset' };

const apartmentReducer = (
  state: CantFindApartmentFormData,
  action: apartmentFormAction
): CantFindApartmentFormData => {
  switch (action.type) {
    case 'updateApartmentName':
      return { ...state, name: action.name };
    case 'updateApartmentAddress':
      return { ...state, address: action.address };
    case 'updatePhotos':
      return { ...state, localPhotos: action.photos ? [...action.photos] : [] };
    case 'reset':
      return defaultApartmentForm;
    default:
      throw new Error('invalid action type');
  }
};

//  Question Modal Data
interface QuestionFormData {
  name: string;
  email: string;
  msg: string;
}

const defaultQuestionForm: QuestionFormData = {
  name: '',
  email: '',
  msg: '',
};

type questionFormAction =
  | { type: 'updateQuestionName'; name: string }
  | { type: 'updateQuestionEmail'; email: string }
  | { type: 'updateQuestionMsg'; msg: string }
  | { type: 'reset' };

const questionReducer = (state: QuestionFormData, action: questionFormAction): QuestionFormData => {
  switch (action.type) {
    case 'updateQuestionName':
      return { ...state, name: action.name };
    case 'updateQuestionEmail':
      return { ...state, email: action.email };
    case 'updateQuestionMsg':
      return { ...state, msg: action.msg };
    case 'reset':
      return defaultQuestionForm;
    default:
      throw new Error('invalid action type');
  }
};

/**
 * ContactModal Component
 *
 * This component displays 3 types of modals: the Contact Us modal, Can't Find Your Apartment modal, and Ask us a Question modal.
 * The first modal displayed is the Contact Us modal and the contents/type of the modal changes as the user navigates through it.
 *
 * @component
 * @param props.user – The current user, null if not logged in.
 * @returns ContactModal – The ContactModal component.
 */

const ContactModal = ({ user }: Props) => {
  const { modalOpen, closeModal } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const [currModal, setCurrModal] = useState('contact');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sending, setSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [showError, setShowError] = useState(false);

  //  Can't Find Your Apartment Modal
  const [apartmentForm, apartmentDispatch] = useReducer(apartmentReducer, defaultApartmentForm);
  const [addedPhoto, setAddedPhoto] = useState(false);
  const [emptyNameError, setEmptyNameError] = useState(false);
  const [nameProfanityError, setNameProfanityError] = useState(false);
  const [addressProfanityError, setAddressProfanityError] = useState(false);

  //  Question Modal
  const [questionForm, questionDispatch] = useReducer(questionReducer, defaultQuestionForm);
  const [emptyEmailError, setEmptyEmailError] = useState(false);
  const [emptyMsgError, setEmptyMsgError] = useState(false);
  const [msgProfanityError, setMsgProfanityError] = useState(false);

  const {
    divider,
    modalStyle,
    bodyText,
    xButton,
    optionGrid,
    optionButton,
    optionText,
    optionIcon,
    hollowRedButton,
    submitButton,
  } = useStyles();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (modalRef.current) {
        const { scrollHeight, clientHeight } = modalRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        modalRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
      }
    };
    const timer = setTimeout(updateScrollPosition, 100);
    return () => clearTimeout(timer);
  }, [addedPhoto]);

  const clearPhotosAndErrors = () => {
    apartmentDispatch({ type: 'updatePhotos', photos: [] });
    // Clear apartment errors
    setNameProfanityError(false);
    setAddressProfanityError(false);
    setEmptyNameError(false);

    //  Clear question errors
    setEmptyEmailError(false);
    setEmptyMsgError(false);
    setMsgProfanityError(false);
  };

  //  Can't Find Your Apartment Modal Constants/Functions
  const apartmentFormDataToReview = async ({
    name,
    address,
    localPhotos,
  }: CantFindApartmentFormData): Promise<CantFindApartmentForm> => {
    const photos = await Promise.all(localPhotos.map(uploadFile));
    return {
      date: new Date(),
      name: name,
      address: address,
      photos,
      userId: user?.uid,
    };
  };

  const updateApartmentName = (event: React.ChangeEvent<HTMLInputElement>) => {
    apartmentDispatch({ type: 'updateApartmentName', name: event.target.value });
  };

  const updateApartmentAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    apartmentDispatch({ type: 'updateApartmentAddress', address: event.target.value });
  };

  const updateApartmentPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files) return;
    const availablePhotos = PHOTOS_LIMIT - apartmentForm.localPhotos.length;
    if (availablePhotos <= 0) {
      console.log(`Max file limit of ${PHOTOS_LIMIT} exceeded`);
      return;
    }

    const newFiles = [...files].slice(0, availablePhotos);
    const bigPhoto = newFiles.find((newFiles) => newFiles.size > PHOTO_MAX_MB * Math.pow(1024, 2));
    if (bigPhoto) {
      console.log(`File ${bigPhoto.name} exceeds max size of ${PHOTO_MAX_MB}`);
      return;
    }
    apartmentDispatch({
      type: 'updatePhotos',
      photos: [...apartmentForm.localPhotos, ...newFiles],
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = apartmentForm.localPhotos.filter((_, photoIndex) => index !== photoIndex);
    apartmentDispatch({ type: 'updatePhotos', photos: newPhotos });
  };

  //  Question Modal Constants/Functions
  const questionFormDataToReview = async ({
    name,
    email,
    msg,
  }: QuestionFormData): Promise<QuestionForm> => {
    return {
      date: new Date(),
      name: name,
      email: email,
      msg: msg,
      userId: user?.uid,
    };
  };

  const updateQuestionName = (event: React.ChangeEvent<HTMLInputElement>) => {
    questionDispatch({ type: 'updateQuestionName', name: event.target.value });
  };

  const updateQuestionEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    questionDispatch({ type: 'updateQuestionEmail', email: event.target.value });
  };

  const updateQuestionMsg = (event: React.ChangeEvent<HTMLInputElement>) => {
    questionDispatch({ type: 'updateQuestionMsg', msg: event.target.value });
  };

  // Toast
  const showToast = (setState: (value: React.SetStateAction<boolean>) => void) => {
    setState(true);
    setTimeout(() => {
      setState(false);
    }, TOAST_TIME);
  };
  const showConfirmationToast = (type: string) => {
    setConfirmationType(type);
    showToast(setShowConfirmation);
  };

  //  onSubmit functions for each modal
  const onApartmentSubmit = async () => {
    try {
      setSending(true);
      const token = await user!.getIdToken(true);
      const data = await apartmentFormDataToReview(apartmentForm);
      if (data.name === '' || includesProfanity(data.name) || includesProfanity(data.address)) {
        data.name === '' ? setEmptyNameError(true) : setEmptyNameError(false);
        includesProfanity(data.name) ? setNameProfanityError(true) : setNameProfanityError(false);
        includesProfanity(data.address)
          ? setAddressProfanityError(true)
          : setAddressProfanityError(false);
        if (modalRef.current) {
          modalRef.current.scrollTop = 0;
        }
        return;
      }
      const res = await axios.post('/api/add-pending-building', data, createAuthHeaders(token));
      if (res.status !== 201) {
        throw new Error('Failed to submit form');
      }
      closeModal();
      clearPhotosAndErrors();
      apartmentDispatch({ type: 'reset' });
      showConfirmationToast('apartment');
    } catch (err) {
      console.log(err);
      console.log('Failed to submit form');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, TOAST_TIME);
    } finally {
      setSending(false);
    }
  };

  const onQuestionSubmit = async () => {
    console.log('on question submit');
    try {
      setSending(true);
      const token = await user!.getIdToken(true);
      const data = await questionFormDataToReview(questionForm);
      if (data.name === '' || data.email === '' || data.msg === '' || includesProfanity(data.msg)) {
        data.name === '' ? setEmptyNameError(true) : setEmptyNameError(false);
        data.email === '' ? setEmptyEmailError(true) : setEmptyEmailError(false);
        data.msg === '' ? setEmptyMsgError(true) : setEmptyMsgError(false);
        includesProfanity(data.msg) ? setMsgProfanityError(true) : setMsgProfanityError(false);
        if (modalRef.current) {
          modalRef.current.scrollTop = 0;
        }
        return;
      }
      const res = await axios.post('/api/add-contact-question', data, createAuthHeaders(token));
      if (res.status !== 201) {
        throw new Error('Failed to submit form');
      }
      closeModal();
      clearPhotosAndErrors();
      questionDispatch({ type: 'reset' });
      showConfirmationToast('question');
    } catch (err) {
      console.log(err);
      console.log('Failed to submit form');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, TOAST_TIME);
    } finally {
      setSending(false);
    }
  };

  //  Contact Us Modal
  const contactModal = (
    <>
      <DialogTitle style={{ padding: '0' }}>
        <h3 style={{ margin: '0' }}>Contact Us</h3>
        <XIcon
          className={xButton}
          style={
            !isMobile
              ? { minWidth: '26px', minHeight: '26px' }
              : { minWidth: '30px', minHeight: '30px' }
          }
          onClick={() => {
            clearPhotosAndErrors();
            closeModal();
          }}
        />
      </DialogTitle>
      <DialogContent style={{ padding: '0' }}>
        <Typography className={bodyText}>Choose from the following:</Typography>

        <Grid container spacing={3}>
          <Grid item md={6} className={optionGrid}>
            <Button
              className={optionButton}
              onClick={() => {
                setCurrModal('apartment');
              }}
            >
              <img
                className={optionIcon}
                src={apartmentIcon}
                alt="I can’t find my apartment on CUApts"
              />
              <Typography className={optionText}>I can’t find my apartment on CUApts</Typography>
            </Button>
          </Grid>
          <Grid item md={6} className={optionGrid}>
            <Button
              className={optionButton}
              onClick={() => {
                setCurrModal('question');
              }}
            >
              <img
                className={optionIcon}
                src={questionMarkIcon}
                alt="I have a question or concern"
              />
              <Typography className={optionText}>I have a question or concern</Typography>
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );

  //  Can't Find Your Apartment? Modal
  const cantFindApartmentModal = (
    <>
      <DialogTitle style={{ padding: '0' }}>
        <h3 style={{ margin: '0' }}>Can't Find Your Apartment?</h3>
        <XIcon
          className={xButton}
          style={
            !isMobile
              ? { minWidth: '26px', minHeight: '26px' }
              : { minWidth: '30px', minHeight: '30px' }
          }
          onClick={() => {
            clearPhotosAndErrors();
            closeModal();
          }}
        />
      </DialogTitle>
      <DialogContent style={{ padding: '0' }}>
        <Typography className={bodyText}>
          Tell us a little bit about your apartment. Our team will be sure to add it to our
          collection as quick as we can!
        </Typography>
        <div className={divider}></div>
        <Typography className={bodyText} style={{ marginBottom: '0' }}>
          Apartment Name
        </Typography>
        <TextField
          required={true}
          error={emptyNameError || nameProfanityError}
          fullWidth
          id="name"
          rows={1}
          placeholder="e.g. Collegetown Plaza, Dryden South"
          helperText={
            (emptyNameError ? ' This field is required' : '') +
            (nameProfanityError ? ' This contains profanity. Please edit it and try again.' : '')
          }
          onChange={updateApartmentName}
          style={{ margin: '0' }}
          InputProps={{
            style: { fontSize: '13px' },
          }}
        />
        <Typography className={bodyText} style={{ marginBottom: '0' }}>
          Address
        </Typography>
        <TextField
          error={addressProfanityError}
          fullWidth
          id="address"
          rows={1}
          placeholder="e.g. 111 Dryden Rd"
          helperText={
            addressProfanityError ? ' This contains profanity. Please edit it and try again.' : ''
          }
          onChange={updateApartmentAddress}
          style={{ margin: '0', marginBottom: '30px' }}
          InputProps={{
            style: { fontSize: '13px' },
          }}
        />
        <UploadPhotos
          photosLimit={PHOTOS_LIMIT}
          photoMaxMB={PHOTO_MAX_MB}
          photos={apartmentForm.localPhotos}
          onPhotosChange={updateApartmentPhotos}
          removePhoto={removePhoto}
          addedPhoto={addedPhoto}
          setAddedPhoto={setAddedPhoto}
        />
      </DialogContent>
    </>
  );

  //  Question Modal
  const questionModal = (
    <>
      <DialogTitle style={{ padding: '0' }}>
        <h3 style={{ margin: '0' }}>Ask Us a Question</h3>
        <XIcon
          className={xButton}
          style={
            !isMobile
              ? { minWidth: '26px', minHeight: '26px' }
              : { minWidth: '30px', minHeight: '30px' }
          }
          onClick={() => {
            clearPhotosAndErrors();
            closeModal();
          }}
        />
      </DialogTitle>
      <DialogContent style={{ padding: '0' }}>
        <Typography className={bodyText}>
          Want to get in touch with our team? Write your message below and we’ll get back to you as
          soon as we can.
        </Typography>
        <div className={divider}></div>

        <Typography className={bodyText} style={{ marginBottom: '0' }}>
          Name
        </Typography>
        <TextField
          required={true}
          error={emptyNameError}
          fullWidth
          id="name"
          rows={1}
          helperText={emptyNameError ? ' This field is required' : ''}
          onChange={updateQuestionName}
          style={{ margin: '0' }}
          InputProps={{
            style: { fontSize: '13px' },
          }}
        />

        <Typography className={bodyText} style={{ marginBottom: '0' }}>
          Cornell Email
        </Typography>
        <TextField
          error={emptyEmailError}
          fullWidth
          id="email"
          rows={1}
          helperText={emptyEmailError ? ' This field is required' : ''}
          onChange={updateQuestionEmail}
          style={{ margin: '0', marginBottom: '30px' }}
          InputProps={{
            style: { fontSize: '13px' },
          }}
        />

        <Typography className={bodyText} style={{ marginBottom: '0' }}>
          Leave a Note
        </Typography>
        <TextField
          error={emptyMsgError || msgProfanityError}
          fullWidth
          id="message"
          rows={1}
          helperText={
            (emptyMsgError ? ' This field is required' : '') +
            (msgProfanityError ? ' This contains profanity. Please edit it and try again.' : '')
          }
          onChange={updateQuestionMsg}
          style={{ margin: '0', marginBottom: '30px' }}
          InputProps={{
            style: { fontSize: '13px' },
          }}
        />
      </DialogContent>
    </>
  );

  return (
    <>
      {showConfirmation && (
        <Toast
          isOpen={showConfirmation}
          severity="success"
          message={
            confirmationType === 'apartment'
              ? 'Form submitted! Your apartment information will be reviewed by the admin.'
              : confirmationType === 'question'
              ? 'Question submitted! The admin will be notified.'
              : ''
          }
          time={TOAST_TIME}
        />
      )}
      <Dialog
        open={modalOpen}
        onClose={() => {
          clearPhotosAndErrors();
          closeModal();
        }}
        onExited={() => setCurrModal('contact')}
        fullWidth
        maxWidth="md"
        classes={{ paper: modalStyle }}
      >
        {showError && (
          <Toast
            isOpen={true}
            severity="error"
            message="Error submitting form. Please try again."
            time={TOAST_TIME}
          />
        )}
        {currModal === 'contact' && contactModal}
        {currModal === 'apartment' && cantFindApartmentModal}
        {currModal === 'question' && questionModal}

        {currModal !== 'contact' && (
          <DialogActions
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
              height: 'auto',
              margin: '22px 0 0 0',
              padding: '0',
            }}
          >
            <Button
              variant="contained"
              disableElevation
              onClick={() => {
                clearPhotosAndErrors();
                setCurrModal('contact');
              }}
              className={hollowRedButton}
            >
              Back
            </Button>

            <Button
              color="primary"
              variant="contained"
              disableElevation
              onClick={
                currModal === 'apartment'
                  ? onApartmentSubmit
                  : currModal === 'question'
                  ? onQuestionSubmit
                  : () => {}
              }
              disabled={sending}
              className={submitButton}
            >
              Submit
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default ContactModal;

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
import { colors } from '../../../colors';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useModal } from './ContactModalContext';
import apartmentIcon from '../../../assets/apartmentIcon.svg';
import questionMarkIcon from '../../../assets/questionMark.svg';
import UploadPhotos from '../UploadPhotos';
import { CantFindApartment } from '../../../../../common/types/db-types';
import { createAuthHeaders, uploadFile } from '../../../utils/firebase';
import { includesProfanity } from '../../../utils/profanity';
import axios from 'axios';

const PHOTOS_LIMIT = 3;
const PHOTO_MAX_MB = 10;

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
    // padding: '16px 0 16px 0',
    margin: '22px 0 22px 0',
  },
  //  Contact modal
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

  //  Can't find your apartment modal
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
    marginTop: '10px',
    marginBottom: '10px',
    width: '80px',
  },
}));

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

const reducer = (
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
  const [currModal, setCurrModal] = useState('contact');
  const [apartmentForm, dispatch] = useReducer(reducer, defaultApartmentForm);
  const [emptyTextError, setEmptyTextError] = useState(false);
  const [includesProfanityError, setIncludesProfanityError] = useState(false);
  const [addedPhoto, setAddedPhoto] = useState(false);
  const [sending, setSending] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    divider,
    modalStyle,
    bodyText,
    optionGrid,
    optionButton,
    optionText,
    optionIcon,
    hollowRedButton,
    submitButton,
  } = useStyles();

  const updateApartmentName = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateApartmentName', name: event.target.value });
  };

  const updateApartmentAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'updateApartmentAddress', address: event.target.value });
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
    dispatch({ type: 'updatePhotos', photos: [...apartmentForm.localPhotos, ...newFiles] });
  };

  const removePhoto = (index: number) => {
    const newPhotos = apartmentForm.localPhotos.filter((_, photoIndex) => index !== photoIndex);
    dispatch({ type: 'updatePhotos', photos: newPhotos });
  };

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

  const onBackClearPhotos = () => {
    dispatch({ type: 'updatePhotos', photos: [] });
    setCurrModal('contact');
  };

  const formDataToReview = async ({
    name,
    address,
    localPhotos,
  }: CantFindApartmentFormData): Promise<CantFindApartment> => {
    const photos = await Promise.all(localPhotos.map(uploadFile));
    return {
      date: new Date(),
      name: name,
      address: address,
      photos,
      userId: user?.uid,
    };
  };

  const onSubmit = async () => {
    // try {
    //   setSending(true);
    //   const token = await user!.getIdToken(true);
    //   const data = await formDataToReview(apartmentForm);
    //   if (
    //     data.name === '' ||
    //     includesProfanity(data.name) ||
    //     includesProfanity(data.address)
    //   ) {
    //     data.name === '' ? setEmptyTextError(true) : setEmptyTextError(false);
    //     includesProfanity(data.name)
    //       ? setIncludesProfanityError(true)
    //       : setIncludesProfanityError(false);
    //     includesProfanity(data.address)
    //       ? setIncludesProfanityError(true)
    //       : setIncludesProfanityError(false);
    //     if (modalRef.current) {
    //       modalRef.current.scrollTop = 0;
    //     }
    //     return;
    //   }
    //   const res = await axios.post('/api/new-review', data, createAuthHeaders(token));
    //   if (res.status !== 201) {
    //     throw new Error('Failed to submit review');
    //   }
    //   closeModal();
    //   dispatch({ type: 'reset' });
    //   onSuccess();
    // } catch (err) {
    //   console.log(err);
    //   console.log('Failed to submit form');
    //   setShowError(true);
    //   setTimeout(() => {
    //     setShowError(false);
    //   }, toastTime);
    // } finally {
    //   setSending(false);
    // }
  };

  //  Contact Us Modal

  const contactModal = (
    <>
      <DialogTitle style={{ padding: '0' }}>
        <h3 style={{ margin: '0' }}>Contact Us</h3>
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
          error={emptyTextError || includesProfanityError}
          fullWidth
          id="name"
          rows={1}
          placeholder="e.g. Collegetown Plaza, Dryden South"
          helperText={
            (emptyTextError ? ' This field is required' : '') +
            (includesProfanityError
              ? ' This contains profanity. Please edit it and try again.'
              : '')
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
          error={includesProfanityError}
          fullWidth
          id="name"
          rows={1}
          placeholder="e.g. 111 Dryden Rd"
          helperText={
            includesProfanityError ? ' This contains profanity. Please edit it and try again.' : ''
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
      <DialogActions
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignContent: 'center',
          padding: '22px 0px 0px 0px',
        }}
      >
        <Button
          variant="contained"
          disableElevation
          onClick={onBackClearPhotos}
          className={hollowRedButton}
        >
          Back
        </Button>

        <Button
          color="primary"
          variant="contained"
          disableElevation
          onClick={onSubmit}
          disabled={sending}
          className={submitButton}
        >
          Submit
        </Button>
      </DialogActions>
    </>
  );

  //  Ask Us a Question Modal
  const questionModal = (
    <>
      <DialogTitle style={{ padding: '0' }}>
        <h3 style={{ margin: '0' }}>Ask Us a Question</h3>
      </DialogTitle>
      <DialogContent style={{ padding: '0' }}>
        <Typography className={bodyText}>
          Want to get in touch with our team? Write your message below and we’ll get back to you as
          soon as we can.
        </Typography>
      </DialogContent>
    </>
  );

  return (
    <Dialog
      open={modalOpen}
      onClose={closeModal}
      onExited={() => setCurrModal('contact')}
      fullWidth
      maxWidth="md"
      classes={{ paper: modalStyle }}
    >
      {currModal == 'contact' && contactModal}
      {currModal == 'apartment' && cantFindApartmentModal}
      {currModal == 'question' && questionModal}
    </Dialog>
  );
};

export default ContactModal;

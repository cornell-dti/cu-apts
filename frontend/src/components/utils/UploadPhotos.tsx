import React, { useEffect, useState } from 'react';
import {
  Grid,
  FormLabel,
  Button,
  Input,
  makeStyles,
  CardMedia,
  IconButton,
} from '@material-ui/core';
import { colors } from '../../colors';
import { ReactComponent as XIcon } from '../../assets/xIcon.svg';

interface Props {
  photosLimit: number;
  photoMaxMB: number;
  photos: File[];
  onPhotosChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (index: number) => void;
  addedPhoto: boolean;
  setAddedPhoto: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyle = makeStyles({
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
  disabledButton: {
    minWidth: '80px',
    height: '35px',
    borderRadius: '30px',
    border: '2px solid',
    borderColor: '#ced4da',
    backgroundColor: 'transparent',
    color: '#ced4da',
    pointerEvents: 'none',
    cursor: 'default',
  },
  photoHover: {
    backgroundColor: 'black',
    position: 'absolute',
    borderRadius: '6px',
    height: '100%',
    width: '100%',
  },
  photosContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '10px',
  },
  photoRemoveButton: {
    fill: 'white',
    cursor: 'pointer',
    display: 'none',
    position: 'absolute',
    zIndex: 1,
  },
  photoAndButton: {
    position: 'relative',
    borderRadius: '6px',
    '&:hover $photoRemoveButton': {
      display: 'block',
    },
    '&:hover $photo': {
      opacity: 0.8,
    },
  },
  photo: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: '6px',
    '&:hover': {
      opacity: 0.8,
    },
  },
});

/**
 * This component represents a user interface for uploading photos with a title and choose files button. When the user has uploaded
 * photos, it will also show an interactable preview of the images. The choose files button becomes disabled when the photosLimit has
 * been reached. This code also checks whether the max number of photos and the max file size in MB has been reached.
 *
 * @param {number} photosLimit – The maximum number of photos allowed to be uploaded.
 * @param {number} photoMaxMB – The maximum file size in MB per photo.
 * @param {File[]} photos – The array holding the files for each photo.
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} onPhotosChange – The callback function that handles the change event when new files are selected.
 * @param {(index: number) => void} removePhoto – The callback function that handles removing a photo.
 * @param {boolean} addedPhoto – Boolean state to indicate whether a new photo has been added.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setAddedPhoto - State setter function to update the `addedPhoto` state.
 *
 * @returns UploadPhotos – The UploadPhotos component.
 */

export default function UploadPhotos({
  photosLimit,
  photoMaxMB,
  photos,
  onPhotosChange,
  removePhoto,
  addedPhoto,
  setAddedPhoto,
}: Props) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const {
    hollowRedButton,
    disabledButton,
    photoHover,
    photosContainer,
    photoRemoveButton,
    photoAndButton,
    photo,
  } = useStyle();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Grid
        container
        item
        justifyContent="space-between"
        spacing={3}
        style={{ paddingTop: '0', paddingBottom: '0' }}
      >
        <Grid item>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <FormLabel>Upload Pictures: </FormLabel>
            <FormLabel
              style={{
                fontSize: '13px',
                color: colors.gray2,
                paddingTop: '8px',
                marginBottom: '0 !important',
              }}
            >
              {`Reviewers may upload up to ${photosLimit} photos. Max photo size of ${photoMaxMB}MB`}
            </FormLabel>
          </div>
        </Grid>
        <Grid item>
          <Button
            component={'label'}
            variant="contained"
            disableElevation
            className={photos.length >= photosLimit ? disabledButton : hollowRedButton}
          >
            Choose File(s)
            <Input
              style={{ display: 'none' }}
              id="upload"
              type="file"
              inputProps={{ multiple: true, accept: 'image/*' }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                onPhotosChange(event);
                setAddedPhoto(!addedPhoto);
              }}
              disabled={photos.length >= photosLimit}
            />
          </Button>
        </Grid>
      </Grid>
      <Grid item>
        {photos.length > 0 && (
          <Grid
            item
            className={photosContainer}
            style={isMobile ? { flexDirection: 'column' } : { flexDirection: 'row' }}
          >
            {photos.map((p, index) => {
              return (
                <div
                  className={photoAndButton}
                  style={
                    !isMobile
                      ? { width: '148px', height: '103px' }
                      : { width: '70vw', height: '180px' }
                  }
                >
                  <div className={photoHover} />
                  <CardMedia
                    component="img"
                    alt="Apt image"
                    image={p.name.startsWith('https://') ? p.name : URL.createObjectURL(p)}
                    title="Apt image"
                    className={photo}
                  />
                  <IconButton
                    onClick={() => removePhoto(index)}
                    style={
                      !isMobile
                        ? { position: 'absolute', right: '2px' }
                        : { position: 'absolute', right: '10px', top: '10px' }
                    }
                  >
                    <XIcon
                      className={photoRemoveButton}
                      style={
                        !isMobile
                          ? { minWidth: '12px', minHeight: '12px' }
                          : { minWidth: '30px', minHeight: '30px' }
                      }
                    />
                  </IconButton>
                </div>
              );
            })}
          </Grid>
        )}
      </Grid>
    </>
  );
}

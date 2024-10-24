import React from 'react';
import { Box, styled, Container, CardMedia, Dialog, makeStyles } from '@material-ui/core';
import Carousel from 'react-material-ui-carousel';

interface Props {
  photos: readonly string[];
  open: boolean;
  onClose?: () => void;
  startIndex: number;
}

const useStyles = makeStyles((theme) => ({
  modalBackground: {
    backgroundColor: 'transparent',
    overflowY: 'unset',
    boxShadow: 'none',
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: 1,
  },
}));
const ImageBox = styled(Box)({
  width: 'fit-content',
  margin: 'auto',
  borderRadius: '10px',
  overflow: 'hidden',
  maxHeight: '80dvh',
  objectFit: 'contain',
});

/**
 * PhotoCarousel - this component displays a modal with a carousel of photos.
 *
 * @remarks
 * This component is used to display a modal with a carousel of photos.
 * It dynamically adjusts to different screen sizes and can be navigated using the arrow buttons.
 *
 * @component
 * @param {readonly string[]} props.photos - An array of photo URLs to display in the carousel.
 * @param {boolean} props.open - A boolean indicating whether the modal is open.
 * @param {() => void} [props.onClose] - An optional callback function to handle closing the modal.
 * @param {number} props.startIndex - The starting index of the carousel.
 *
 * @returns {JSX.Element} The rendered PhotoCarousel component.
 */
const PhotoCarousel = ({ photos, open, onClose, startIndex }: Props) => {
  const { modalBackground, navButton } = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ className: modalBackground }}
    >
      <Container>
        <Carousel
          autoPlay={false}
          navButtonsAlwaysVisible={true}
          navButtonsProps={{ className: navButton }}
          index={startIndex}
        >
          {photos.map((src, index) => {
            return (
              <ImageBox key={index}>
                <CardMedia component="img" src={src} />
              </ImageBox>
            );
          })}
        </Carousel>
      </Container>
    </Dialog>
  );
};

export default PhotoCarousel;

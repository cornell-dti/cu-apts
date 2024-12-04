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
  indicatorContainer: {
    position: 'absolute',
    bottom: '-10px',
    width: '100%',
    textAlign: 'center',
  },
  carouselContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    overflow: 'visible',
    height: '80vh',
    [theme.breakpoints.down('md')]: {
      height: '60dvw',
    },
    cursor: 'pointer',
  },
}));
const ImageBox = styled(Box)({
  borderRadius: '10px',
  maxHeight: '80dvh',
  backgroundColor: 'transparent',
  '& img': {
    borderRadius: '10px',
    maxHeight: '80dvh',
    objectFit: 'contain',
    width: 'calc(69dvw - 96px)',
    margin: 'auto',
    cursor: 'default',
  },
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
  const { modalBackground, navButton, indicatorContainer, carouselContainer } = useStyles();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      style={{ cursor: 'pointer' }}
      PaperProps={{ className: modalBackground }}
    >
      <Container
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.tagName !== 'IMG' &&
            target.tagName !== 'BUTTON' &&
            target.tagName !== 'svg' &&
            target.tagName !== 'circle'
          ) {
            console.log(target.tagName);
            onClose?.();
          }
        }}
      >
        <Carousel
          autoPlay={false}
          className={carouselContainer}
          navButtonsAlwaysVisible={true}
          navButtonsProps={{ className: navButton }}
          indicatorContainerProps={{ className: indicatorContainer }}
          index={startIndex}
          animation="fade"
        >
          {photos.map((src, index) => {
            return (
              <ImageBox key={index} style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
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

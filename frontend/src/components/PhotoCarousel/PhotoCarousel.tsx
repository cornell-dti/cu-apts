import React from 'react';
import { Box, styled, Container, CardMedia, Dialog, makeStyles } from '@material-ui/core';
import Carousel from 'react-material-ui-carousel';

interface Props {
  photos: readonly string[];
  open: boolean;
  onClose?: () => void;
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
});

const PhotoCarousel = ({ photos, open, onClose }: Props) => {
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

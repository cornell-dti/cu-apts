import React from 'react';
import { Modal, Box, styled, Container, CardMedia } from '@material-ui/core';
import Carousel from 'react-material-ui-carousel';

interface Props {
  photos: readonly string[];
  open: boolean;
  onClose?: () => void;
}

const CenteredModal = styled(Modal)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const ImageBox = styled(Box)({
  width: 'fit-content',
  margin: 'auto',
});

const PhotoCarousel = ({ photos, open, onClose }: Props) => (
  <CenteredModal open={open} onClose={onClose} disableRestoreFocus>
    <Container>
      <Carousel autoPlay={false}>
        {photos.map((src, index) => {
          return (
            <ImageBox key={index}>
              <CardMedia component="img" src={src} />
            </ImageBox>
          );
        })}
      </Carousel>
    </Container>
  </CenteredModal>
);

export default PhotoCarousel;

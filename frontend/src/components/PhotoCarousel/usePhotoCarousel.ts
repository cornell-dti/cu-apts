// src/hooks/usePhotoCarousel.ts
import { useState } from 'react';

const usePhotoCarousel = (defaultPhotos: readonly string[] = []) => {
  const [carouselPhotos, setCarouselPhotos] = useState<readonly string[]>(defaultPhotos);
  const [carouselStartIndex, setCarouselStartIndex] = useState<number>(0);
  const [carouselOpen, setCarouselOpen] = useState<boolean>(false);

  /**
   * showPhotoCarousel – Opens the photo carousel modal with the provided photos and start index.
   *
   * @remarks
   * This function sets the photos and start index for the photo carousel and then opens the carousel modal.
   * If no photos are provided, it defaults to [defaultPhotos].
   *
   * @param {readonly string[]} [photos] – The array of photo URLs to display in the carousel.
   * @param {number} [startIndex] – The index of the photo to start the carousel from.
   * @return {void} – This function does not return anything.
   */
  const showPhotoCarousel = (photos: readonly string[] = defaultPhotos, startIndex: number = 0) => {
    setCarouselPhotos(photos);
    setCarouselStartIndex(startIndex);
    setCarouselOpen(true);
  };

  const closePhotoCarousel = () => {
    setCarouselOpen(false);
  };

  return {
    carouselPhotos,
    carouselStartIndex,
    carouselOpen,
    showPhotoCarousel,
    closePhotoCarousel,
  };
};

export default usePhotoCarousel;

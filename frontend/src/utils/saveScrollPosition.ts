import { useEffect } from 'react';

/**
 * useSaveScrollPosition – Custom hook to save and restore the scroll position of a page using sessionStorage.
 *
 * @remarks
 * This hook listens for scroll events and saves the scroll position in sessionStorage when the document is visible.
 * It also restores the scroll position when the component mounts, ensuring a smooth scroll to the saved position.
 * The scroll position is only saved if the difference between the current and previous scroll positions is less than 300 pixels.
 *
 * @param {string} storageKey – The key used to store the scroll position in sessionStorage.
 * @param {string} pathName – The pathname of the current route to ensure scroll restoration only happens on the correct page.
 * @return {void} – This hook does not return a value.
 */
export const useSaveScrollPosition = (storageKey: string, pathName: string): void => {
  useEffect(() => {
    const handleScroll = () => {
      if (document.visibilityState === 'visible') {
        const previousScrollPosition = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
        const currentScrollPosition = window.scrollY;
        if (Math.abs(currentScrollPosition - previousScrollPosition) < 300) {
          sessionStorage.setItem(storageKey, currentScrollPosition.toString());
        }
      }
    };
    const scrollDown = () => {
      const scrollPosition = sessionStorage.getItem(storageKey);
      if (scrollPosition) {
        const targetPosition = parseInt(scrollPosition, 10);
        if (targetPosition < 200) {
          window.addEventListener('scroll', handleScroll);
          return;
        }
        const scrollInterval = setInterval(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (window.scrollY < targetPosition - 50 && window.location.pathname === pathName) {
            if (targetPosition <= maxScroll) {
              window.scrollTo({
                top: targetPosition,
                behavior: 'auto',
              });
            } else {
              window.scrollTo({
                top: maxScroll,
                behavior: 'auto',
              });
            }
          } else {
            clearInterval(scrollInterval);
            window.addEventListener('scroll', handleScroll);
          }
        }, 16);
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'auto',
        });
        window.addEventListener('scroll', handleScroll);
      }
    };
    scrollDown();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [storageKey, pathName]);
};

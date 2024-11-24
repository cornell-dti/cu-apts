import { useEffect } from 'react';

export const useSaveScrollPosition = (storageKey: string, pathName: string) => {
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
          if (
            Math.abs(window.scrollY - targetPosition) > 50 &&
            window.location.pathname === pathName
          ) {
            if (targetPosition <= maxScroll) {
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth',
              });
            } else {
              window.scrollTo({
                top: maxScroll,
                behavior: 'smooth',
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
          behavior: 'smooth',
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

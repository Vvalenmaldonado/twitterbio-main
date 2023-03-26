import { useEffect } from 'react';

const ScrollHandler = ({ sections }: any) => {
  useEffect(() => {
    let currentSection = 0;

    const handleScroll = (e:any) => {
      e.preventDefault();

      const deltaY: any = e.deltaY;

      if (deltaY > 0) {
        // Scroll hacia abajo
        if (currentSection < sections.length - 1) {
          currentSection++;
        }
      } else {
        // Scroll hacia arriba
        if (currentSection > 0) {
          currentSection--;
        }
      }

      sections[currentSection].scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('DOMContentLoaded', () => {
        // Wait for the DOM to load before adding the scroll event listener
        window.addEventListener('wheel', handleScroll, { passive: false });
      });
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [sections]);

  return null;
};

export default ScrollHandler;
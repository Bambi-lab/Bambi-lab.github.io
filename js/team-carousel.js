(() => {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.team-track');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const dots = Array.from(document.querySelectorAll('.team-dots .dot'));
  const slides = Array.from(track.querySelectorAll('.team-slide'));

  if (!track || !prevBtn || !nextBtn || dots.length === 0) return;

  const applySlideBackground = (slide) => {
    const img = slide.querySelector('img');
    if (!img) return;

    const setBg = () => {
      slide.style.setProperty('--slide-bg', `url("${img.currentSrc || img.src}")`);
    };

    if (img.complete) {
      setBg();
    } else {
      img.addEventListener('load', setBg, { once: true });
    }
  };

  slides.forEach(applySlideBackground);

  const slideCount = dots.length;

  const getSlideWidth = () => track.clientWidth;

  const getCurrentIndex = () => {
    const width = getSlideWidth();
    if (width <= 0) return 0;
    return Math.round(track.scrollLeft / width);
  };

  const setActiveDot = (index) => {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  const goToSlide = (index) => {
    const target = Math.max(0, Math.min(index, slideCount - 1));
    track.scrollTo({ left: target * getSlideWidth(), behavior: 'smooth' });
    setActiveDot(target);
  };

  prevBtn.addEventListener('click', () => {
    goToSlide(getCurrentIndex() - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(getCurrentIndex() + 1);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.slide));
    });
  });

  let scrollTimer = null;
  track.addEventListener('scroll', () => {
    if (scrollTimer) window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      setActiveDot(getCurrentIndex());
    }, 80);
  });

  window.addEventListener('resize', () => {
    goToSlide(getCurrentIndex());
  });
})();

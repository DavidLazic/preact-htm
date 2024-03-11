import { html, createContext, useRef, useState, useEffect } from 'htm/preact';
import { SliderProgress } from './slider.progress.js';
import { SliderCarousel } from './slider.carousel.js';
import { useImageTheme } from '../lib/theme/theme.js';
import { SliderDesktopCover } from './slider.cover.js';

export const SliderContext = createContext();

export const Slider = ({ slides }) => {
  const carouselRef = useRef(null);
  const [isTabActive, setIsTabActive] = useState(false);
  const [tabElement, setTabElement] = useState('');
  const { set: setTheme, update: updateTheme } = useImageTheme();
  const [state, setState] = useState({
    scrollWidth: 0,
    clientWidth: 0,
    scrollX: 0,
    slideFloatIndex: 0,
    slideIndex: 0,
  });

  const handleScroll = (event) => {
    const { target } = event;
    const { scrollWidth, scrollLeft: scrollX, clientWidth } = target;

    const slideFloatIndex = Math.round((scrollX / clientWidth) * 100) / 100;
    const startSlide = Math.floor(slideFloatIndex);
    const endSlide = Math.ceil(slideFloatIndex);

    const slideThreshold = 0.5;
    const slideIndex =
      slideFloatIndex < startSlide + slideThreshold ? startSlide : endSlide;

    setState({
      scrollWidth,
      clientWidth,
      scrollX,
      slideFloatIndex,
      slideIndex,
    });
  };

  const handleFocus = (e) => {
    setTabElement(e.target.getAttribute('data-element'));

    e.target.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  const handleMove =
    (direction = 1) =>
    () => {
      carouselRef.current.scrollLeft +=
        carouselRef.current.clientWidth * direction;

      document.activeElement.blur();
    };

  const handleClick = () => setIsTabActive(false);

  const handleKeyDown = (e) => e.key === 'Tab' && setIsTabActive(true);

  const onLoad = async () => {
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    setTheme(slides[0].image);
  };

  useEffect(() => {
    onLoad();
  }, []);

  useEffect(() => {
    updateTheme(slides[state.slideIndex].image);
  }, [state.slideIndex]);

  const useSlider = {
    carouselRef,
    state,
    slides,
    onScroll: handleScroll,
    onMove: handleMove,
    onFocusChange: handleFocus,
  };

  return html`
    <div class="slider" data-tab=${isTabActive} data-focus=${tabElement}>
      <${SliderContext.Provider} value=${useSlider}>
        <div class="slider-inner">
          <${SliderProgress} />
          <${SliderCarousel} />
          <${SliderDesktopCover} />
        </div>
      <//>
    </div>
  `;
};

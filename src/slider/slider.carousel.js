import { html, useEffect, useState, useContext } from 'htm/preact';
import { SliderContext } from './slider.js';
import { ResponsiveImage } from '../lib/image.js';
import { useImageTheme } from '../lib/theme/theme.js';

const TAB_ELEMENTS = {
  LINK: 'link',
  PREV: 'prev',
  NEXT: 'next',
};

const Slide = ({ index, data }) => {
  const [wrapperTranslate, setWrapperTranslate] = useState(0);
  const [contentTranslate, setContentTranslate] = useState(0);
  const [slideTheme, setSlideTheme] = useState({});
  const { load } = useImageTheme();

  const { state } = useContext(SliderContext);
  const { link, image, title, description } = data;
  const { onFocusChange, onMove } = useContext(SliderContext);

  const updateSlideTransition = () => {
    const { slideFloatIndex } = state;
    const INTENSITY_WRAPPER = 10;
    const INTENSITY_CONTENT = 30;

    const startSlide = Math.floor(slideFloatIndex);
    const endSlide = Math.ceil(slideFloatIndex || 0.1);

    if (index === startSlide) {
      setWrapperTranslate((slideFloatIndex % 1) * INTENSITY_WRAPPER);
      setContentTranslate(-(slideFloatIndex % 1) * INTENSITY_CONTENT);
    }

    if (index === endSlide) {
      setContentTranslate(
        INTENSITY_CONTENT - (slideFloatIndex % 1.01) * INTENSITY_CONTENT
      );
    }
  };

  const getSlideTheme = async () => {
    const theme = await load(image);

    setSlideTheme({
      '--slide-color-rgb': theme.text.rgb,
      '--slide-color-hex': theme.text.hex,
      '--slide-bg-color-hex': theme.dominant.hex,
    });
  };

  useEffect(() => {
    getSlideTheme();
  }, []);

  useEffect(() => {
    updateSlideTransition();
  }, [state]);

  return html`
    <div
      aria-hidden=${index !== state.slideIndex}
      tab-index=${index !== state.slideIndex ? -1 : 0}
      class="slide"
      style=${{
        transform: `translateX(${wrapperTranslate}%)`,
        ...slideTheme,
      }}
    >
      <div class="slide-content-wrapper">
        <div style=${{ transform: `translateX(${contentTranslate}%)` }}>
          <h2>${title}</h2>
          <p>${description}</p>
          <div class="slide-actions-wrapper">
            <a
              class="slide-link"
              href=${link}
              data-element=${TAB_ELEMENTS.LINK}
              onFocus=${onFocusChange}
            >
              Read more
            </a>
            <div class="slide-actions">
              <button
                class="slide-action-prev"
                disabled=${!index}
                aria-label="Previous update"
                data-element=${TAB_ELEMENTS.PREV}
                onFocus=${onFocusChange}
                onClick=${onMove(-1)}
              >
                Left
              </button>
              <button
                class="slide-action-next"
                aria-label="Next update"
                data-element=${TAB_ELEMENTS.NEXT}
                onFocus=${onFocusChange}
                onClick=${onMove(1)}
              >
                Right
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="slide-image-wrapper">
        <div class="slide-image-protection" />
        <${ResponsiveImage} src=${image} />
      </div>
    </div>
  `;
};

export const SliderCarousel = () => {
  const { slides, onScroll, carouselRef } = useContext(SliderContext);

  return html`
    <ul
      class="slider-carousel"
      role="marquee"
      aria-live="assertive"
      onScroll=${onScroll}
      ref=${carouselRef}
    >
      ${slides.map(
        (slide, index) => html`
          <li key=${slide.title} class="slider-slide">
            <${Slide} index=${index} data=${slide} />
          </li>
        `
      )}
    </ul>
  `;
};

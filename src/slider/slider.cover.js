import { html, useContext, useState } from 'htm/preact';
import cx from 'classnames';
import { SliderContext } from './slider.js';
import { IconChevronLeft, IconChevronRight } from '../lib/icons.js';
import { ResponsiveImage } from '../lib/image.js';
import { debounce } from '../lib/utils.js';

const CoverImageItem = (data, index) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { state } = useContext(SliderContext);
  const { image } = data;
  const debouncedLoad = debounce(() => setIsLoaded(true), 100);

  return html` <${ResponsiveImage}
    className=${cx({
      ['animation-ready']: isLoaded,
      ['slide-in']: index <= state.slideIndex,
    })}
    src=${image}
    aria-hidden
    ref=${debouncedLoad}
  />`;
};

const CoverContentItem = (data, index) => {
  const { state, onMove } = useContext(SliderContext);
  const { title, description, link } = data;

  return html`
    <div
      key=${title}
      class=${cx('slide-content-fade', {
        ['fade-in']: index === state.slideIndex,
      })}
    >
      <a href=${link}>
        <h2>${title}</h2>
      </a>
      <p>${description}</p>
      <div class="slide-actions-wrapper">
        <a class="slide-link" href=${link}> Read more </a>
        <div class="slide-actions">
          <button
            class="slide-action-prev"
            disabled=${!index}
            onClick=${onMove(-1)}
          >
            <${IconChevronLeft} />
          </button>
          <button class="slide-action-next" onClick=${onMove(1)}>
            <${IconChevronRight} />
          </button>
        </div>
      </div>
    </div>
  `;
};

export const SliderDesktopCover = () => {
  const { slides } = useContext(SliderContext);

  return html`
    <div class="slider-cover" aria-hidden tab-index="-1">
      <div class="slide">
        <div class="slide-content-wrapper">${slides.map(CoverContentItem)}</div>
        <div class="slide-image-wrapper">
          <div class="slide-image-slide">${slides.map(CoverImageItem)}</div>
        </div>
      </div>
    </div>
  `;
};

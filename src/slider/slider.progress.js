import { html, useContext } from 'htm/preact';
import { SliderContext } from './slider.js';

const ProgressBarItem = ({ index }) => {
  const { state, onMove } = useContext(SliderContext);
  const { slideFloatIndex } = state;

  const value = slideFloatIndex >= index ? (slideFloatIndex - index) * 100 : 0;
  const progress = Math.floor(slideFloatIndex) > index ? 100 : value;

  return html`<div
    class="bar"
    onAnimationEnd=${onMove(1)}
    style=${{
      '--slide-progress': `${progress}%`,
    }}
  />`;
};

export const SliderProgress = () => {
  const { slides } = useContext(SliderContext);

  return html`
    <div class="progress-bar slider-progress">
      <div>
        ${[...new Array(slides.length)].map(
          (_, index) => html`<${ProgressBarItem} key=${index} index=${index} />`
        )}
      </div>
    </div>
  `;
};

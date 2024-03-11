import { html, render } from 'htm/preact';
import { Slider } from './slider/slider.js';
import { SLIDES } from './data.js';

const App = () => {
  return html`<${Slider} slides=${SLIDES} />`;
};

render(html`<${App} />`, document.getElementById('app'));

import { getColorsFromImage } from './colors.js';

const THEME_MODE = {
  LIGHT: 'light',
  DARK: 'dark',
};

const THEME_CACHE_KEY = 'themes';

const state = {
  queue: [],
  cache: JSON.parse(localStorage.getItem(THEME_CACHE_KEY) || '{}'),
};

export const useImageTheme = () => {
  const setDocumentTheme = (theme) => {
    document.body.style.setProperty('--theme-text-rgb', theme.text.rgb);
    document.body.style.setProperty('--theme-text-hex', theme.text.hex);
    document.body.style.setProperty('--theme-dominant-rgb', theme.dominant.rgb);
    document.body.style.setProperty('--theme-dominant-hex', theme.dominant.hex);
    document.body.setAttribute('data-theme-mode', theme.mode);
  };

  const queue = async () => {
    const themes = await Promise.all(state.queue);

    themes.forEach((theme) => {
      state.cache[theme.src] = theme;
    });

    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(state.cache));
  };

  const set = async (src) => {
    await queue();

    setDocumentTheme(state.cache[src] || defaultTheme);
  };

  const get = (src) => {
    const cached = state.cache[src];

    return cached
      ? Promise.resolve(cached)
      : getColorsFromImage(src).then(({ dominant, text, isDark }) =>
          Promise.resolve({
            src,
            dominant,
            text,
            mode: isDark ? THEME_MODE.DARK : THEME_MODE.LIGHT,
          })
        );
  };

  const load = (src) => {
    const theme = get(src);

    state.queue.push(theme);

    return theme;
  };

  return {
    load,
    set,
  };
};

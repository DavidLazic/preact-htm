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

/**
 * @description
 * Updates document CSS variables based on active theme.
 *
 * @param {object} theme
 * @returns {void}
 */
export const useImageTheme = () => {
  const setDocumentTheme = (theme) => {
    document.body.style.setProperty('--theme-text-rgb', theme.text.rgb);
    document.body.style.setProperty('--theme-text-hex', theme.text.hex);
    document.body.style.setProperty('--theme-dominant-rgb', theme.dominant.rgb);
    document.body.style.setProperty('--theme-dominant-hex', theme.dominant.hex);
    document.body.setAttribute('data-theme-mode', theme.mode);
  };

  /**
   * @description
   * Saves themes into localStorage.
   *
   * @returns {void}
   */
  const save = async () =>
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(state.cache));

  const queue = () => {
    return new Promise(async (resolve) => {
      const themes = await Promise.all(state.queue);

      themes.forEach((theme) => {
        state.cache[theme.src] = theme;
      });

      resolve();
    });
  };

  /**
   * @description
   * Updates active theme after queue has been fully loaded.
   *
   * @param {string} src
   * @returns
   */
  const update = async (src) => {
    await queue();

    setDocumentTheme(state.cache[src]);
  };

  /**
   * @description
   * Sets initial active theme after queue has been fully loaded
   * and cache has been saved.
   *
   * @param {string} src
   * @returns {void}
   */
  const set = async (src) => {
    await queue();

    save();
    update(src);
  };

  /**
   * @description
   * Loads single HTTP image and extracts dominant image theme.
   *
   * @param {string} src
   * @returns {Promise<object>} theme
   */
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

  /**
   * @description
   * Queues HTTP image for dominant theme extraction.
   *
   * @param {string} src
   * @returns {Promise<object>} theme
   */
  const load = (src) => {
    const theme = get(src);

    state.queue.push(theme);

    return theme;
  };

  return {
    load,
    set,
    update,
  };
};

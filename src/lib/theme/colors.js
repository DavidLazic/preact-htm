import ColorThief from 'colorthief';
import { Hsluv } from 'hsluv';

export const DEFAULT_COLOR_SET = {
  dominant: {
    rgb: 'rgb(255 255 255)',
    hex: '#fff',
  },
  text: {
    rgb: 'rgb(0 0 0)',
    hex: '#000',
  },
  isDark: false,
};

const AA_CONTRAST = 4.5;

// Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
// Returns a number between 0 and 1
export const getLuminance = (color) => {
  const relativeBrightness = color.map((channel) => {
    const value = channel / 255;

    if (value < 0.03928) {
      return value / 12.92;
    } else {
      return Math.pow((value + 0.055) / 1.055, 2.4);
    }
  });

  return (
    0.2126 * relativeBrightness[0] +
    0.7152 * relativeBrightness[1] +
    0.0722 * relativeBrightness[2]
  );
};

// Formula: https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
// Returns a number between 1 and 21
export const getContrast = (color1, color2) => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  if (luminance1 > luminance2) {
    return (luminance1 + 0.05) / (luminance2 + 0.05);
  }

  return (luminance2 + 0.05) / (luminance1 + 0.05);
};

// Converts RGB color to HSLuv class instance
export function getHsluvFromRGB(color) {
  const hsluvColor = new Hsluv();
  hsluvColor.rgb_r = color[0] / 255;
  hsluvColor.rgb_g = color[1] / 255;
  hsluvColor.rgb_b = color[2] / 255;
  hsluvColor.rgbToHsluv();

  return hsluvColor;
}

export function getRGBfromHSLuv(color) {
  return [
    Math.round(color.rgb_r * 255),
    Math.round(color.rgb_g * 255),
    Math.round(color.rgb_b * 255),
  ];
}

export const modifyLightness = (colorRGB, tweak = 5) => {
  const color = getHsluvFromRGB(colorRGB);

  // Subjectively selected threshold, to favorize darkening the colors
  const IS_LIGHT_THRESHOLD = 30;
  const SUPER_LIGHT = 90;
  const SUPER_SATURATION = 90;

  // Darken on lighten the color for the selected amount
  // 5% by default
  if (color.hsluv_l > IS_LIGHT_THRESHOLD) {
    color.hsluv_l -= tweak;

    // Edge case for super light and super saturated colors.
    // When we darken these colors, we get too much saturation,
    // and we need to artificially decrease it.
    // Color thief shouldn't return these colors, as it un-prioritize white.
    if (color.hsluv_l > SUPER_LIGHT && color.hsluv_s > SUPER_SATURATION) {
      // Reduce saturation by 25%
      color.hsluv_s *= 0.75;
    }
  } else {
    color.hsluv_l += tweak;
  }

  // Make sure RGB values are updated
  color.hsluvToRgb();

  // Get new RGB color from HSLuv
  return getRGBfromHSLuv(color);
};

//  * @returns
export const fixContrast = (
  color,
  blackOrWhite,
  // AA contrast
  minContrast = AA_CONTRAST
) => {
  const isWhite = blackOrWhite === 'white';
  // Convert background to RGB format
  const backgroundRGB = isWhite ? [255, 255, 255] : [0, 0, 0];

  // If contrast is already met, return the color copy
  let contrast = getContrast(color, backgroundRGB);
  if (contrast >= minContrast) {
    return [...color];
  }

  // Convert the color to HSLuv so we can adjust the lightness properly
  const colorHSL = getHsluvFromRGB(color);

  // If background color is white we need to darken the color,
  // otherwise we are lightening it.
  const step = isWhite ? -3 : 3;

  let updatedColor;
  do {
    // Update the lightness and test the contrast again
    colorHSL.hsluv_l += step;

    // Make sure RGB values are updated
    colorHSL.hsluvToRgb();

    // Get new RGB color from HSLuv
    updatedColor = getRGBfromHSLuv(colorHSL);

    // And compare is against the background
    contrast = getContrast(updatedColor, backgroundRGB);

    // When we achieve the contrast, we can exit
  } while (contrast < minContrast);

  return updatedColor;
};

function rgbToHex(color) {
  return `#${color
    .map((c) => (c < 16 ? `0${c.toString(16)}` : c.toString(16)))
    .join('')}`;
}

async function loadImage(image) {
  image.crossOrigin = 'Anonymous';

  if (image.complete) {
    return;
  }

  return new Promise((resolve, reject) => {
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
  });
}

const cache = {};

export async function getColorsFromImage(src, tweak = 0) {
  const image = document.createElement('img');
  image.src = src;

  try {
    await loadImage(image);
  } catch (e) {
    console.log(e);
    // If image failed to load, return the default color set
    return DEFAULT_COLOR_SET;
  }

  const cacheKey = image.src;

  try {
    let dominant = cache[cacheKey];

    if (!dominant) {
      const colorThief = new ColorThief();
      dominant = await colorThief.getColor(image, 10);

      // Cache dominant color
      cache[cacheKey] = dominant;
    }

    const onWhite = fixContrast(dominant, 'white');
    const onBlack = fixContrast(dominant, 'black');

    if (tweak) {
      dominant = modifyLightness(dominant, tweak);
    }

    const whiteContrast = getContrast(dominant, [255, 255, 255]);
    const isDark = whiteContrast >= AA_CONTRAST;

    return {
      dominant: {
        rgb: `rgb(${dominant.join(' ')})`,
        hex: rgbToHex(dominant),
      },
      text: isDark
        ? {
            rgb: `rgb(${onBlack.join(' ')})`,
            hex: rgbToHex(onBlack),
          }
        : {
            rgb: `rgb(${onWhite.join(' ')})`,
            hex: rgbToHex(onWhite),
          },
      isDark,
    };
  } catch (e) {
    console.log(e);
    // If color thief failed to get the color, return the default color set
    return DEFAULT_COLOR_SET;
  }
}

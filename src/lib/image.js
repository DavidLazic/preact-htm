import { html } from 'htm/preact';

const createOptimizedPicture = (
  src,
  alt = '',
  eager = false,
  breakpoints = [
    { media: '(min-width: 1200px)', width: '2400' },
    { media: '(min-width: 900px)', width: '1800' },
    { media: '(min-width: 600px)', width: '1200' },
    { media: '(min-width: 300px)', width: '600' },
    { width: '750' },
  ]
) => {
  const url = new URL(src);
  const picture = document.createElement('picture');
  const { pathname, href } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  //webp
  breakpoints.forEach((bp) => {
    const source = document.createElement('source');
    if (bp.media) source.setAttribute('media', bp.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute(
      'srcset',
      `${href}?width=${bp.width}&format=webply&optimize=medium`
    );
    picture.appendChild(source);
  });

  //fallback
  breakpoints.forEach((bp, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (bp.media) source.setAttribute('media', bp.media);
      source.setAttribute(
        'srcset',
        `${href}?width=${bp.width}&format=${ext}&optimize=medium`
      );
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute(
        'src',
        `${href}?width=${bp.width}&format=${ext}&optimize=medium`
      );
    }
  });

  return picture;
};

export const ResponsiveImage = ({
  ref,
  src,
  alt = '',
  className,
  eager,
  sizes,
  width,
  height,
  ...props
}) => {
  const picture = createOptimizedPicture(src, alt, eager, sizes);

  const sources = Array.from(picture.querySelectorAll('source'));
  const image = picture.querySelector('img');

  const getAttributes = (el) =>
    [...el.attributes].reduce(
      (acc, attr) => ({
        ...acc,
        [attr.nodeName]: attr.nodeValue,
      }),
      {}
    );

  return html`
    <picture ref=${ref} key=${src} class=${className}>
      ${sources.map((source) => html`<source ...${getAttributes(source)} />`)}

      <img
        ...${getAttributes(image)}
        width=${width || '100%'}
        height=${height || '100%'}
        ...${props}
      />
    </picture>
  `;
};

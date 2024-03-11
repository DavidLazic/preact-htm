# preact-htm

An exploration of a quick project setup using [preact](https://preactjs.com/guide/v10/getting-started/#using-preact-with-htm-and-importmaps) and [htm](https://github.com/developit/htm).
This combination allows skipping any bundlers and build steps, so it represents 'plug & play' kind of approach.

The exploration contains:

- an implementation of a `Slider` component, fully responsive and with various levels of accessibility features, such as VoiceOver capabilities and tabbing flow
- few tryout hooks leveraging `Proxy` constructor, such as `useState` and `useEffect`, exploring the limits of state change detection
- an implementation of `useImageTheme` hook for extracting a dominant color theme from an image, user by the `Slider` component itself
- a tryout implementation of a `ResponsiveImage` component for generating `picture` sources based on `srcset` as well as `webp` type of images

![demo_1](/assets/demo_1.jpg 'demo_1')

![demo_2](/assets/demo_2.jpg 'demo_2')

[Preview](https://davidlazic.github.io/preact-htm)

export const debounce = (cb, time) => {
  let timer;

  return (e) => {
    clearTimeout(timer);
    timer = setTimeout(cb, time, e);
  };
};

const LISTENERS = new Map();

export const useState = (value) => {
  const state = new Proxy(
    {
      value,
    },
    {
      set(target, prop, value) {
        target[prop] = value;
        LISTENERS.get(state).forEach((sub) => sub(value));
        return true;
      },
    }
  );

  LISTENERS.set(state, []);

  return [state, (value) => (state.value = value)];
};

export const useEffect = (cb, deps) => {
  deps.forEach((dep) => {
    LISTENERS.set(dep, [...(LISTENERS.get(dep) || []), cb]);
  });
};

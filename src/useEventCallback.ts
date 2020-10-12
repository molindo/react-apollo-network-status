import {useRef, useCallback} from 'react';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

export default function useEventCallback(fn: Function) {
  const ref = useRef<Function>(() => {
    throw new Error('Function is called before it was assigned.');
  });

  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });

  return useCallback((...args) => ref.current(...args), []);
}

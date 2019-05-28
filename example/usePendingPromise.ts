import {useState, useEffect} from 'react';

export default function usePendingPromise<T>(): [
  Promise<T> | undefined,
  (pendingPromise: Promise<T>) => void
] {
  const [pendingPromise, setPendingPromise] = useState<Promise<T>>();

  useEffect(() => {
    let isCanceled = false;

    if (pendingPromise) {
      pendingPromise.then(() => {
        if (isCanceled) return;
        setPendingPromise(undefined);
      });
    }

    return () => {
      isCanceled = true;
    };
  }, [pendingPromise]);

  return [pendingPromise, setPendingPromise];
}

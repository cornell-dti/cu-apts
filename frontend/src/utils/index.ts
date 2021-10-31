import { useEffect } from 'react';

/**
 * Update the document title with provided string
 * @param titleOrFn can be a String or a function.
 * @param deps? if provided, the title will be updated when one of these values changes
 */
export const useTitle = (titleOrFn: string | (() => string), ...deps: any[]) => {
  useEffect(
    () => {
      document.title = ` CU Apartments | ${typeof titleOrFn === 'function' ? titleOrFn() : titleOrFn
        }`;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps]
  );
};

export const splitArr = (arr: any[], n: number) => [arr.slice(0, n), arr.slice(n)];

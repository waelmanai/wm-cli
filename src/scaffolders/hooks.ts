import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig } from '../types';

export async function createHooks(config: ProjectConfig) {
  // Ensure hooks directory exists first
  fs.ensureDirSync('hooks');

  // use-actions hook
  const useActionsFile = `import { useCallback, useState } from "react";

import { ActionState, FieldErrors } from '@/lib/create-safe-action';

type Action<TInput, TOutput> = (data: TInput) => Promise<ActionState<TInput, TOutput>>;

interface UseActionOptions<TOutput> {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
    onComplete?: () => void;
};

export const useAction = <TInput, TOutput>(
    action: Action<TInput, TOutput>,
    options: UseActionOptions<TOutput> = {},
) => {

    const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput> | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [data, setData] = useState<TOutput | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback(
        async (input: TInput) => {
            setIsLoading(true);

            try {
                const result = await action(input);

                if (!result) {
                    return;
                }

                setFieldErrors(result.fieldErrors);

                if (result.error) {
                    setError(result.error);
                    options.onError?.(result.error);
                }

                if (result.data) {
                    setData(result.data);
                    options.onSuccess?.(result.data);
                }

            } finally {
                setIsLoading(false);
                options.onComplete?.();
            }
        },
        [action, options]
    );

    return {
        execute,
        fieldErrors,
        error,
        data,
        isLoading
    };
};`;

  fs.writeFileSync('hooks/use-actions.ts', useActionsFile);

  // Custom navigate hook
  const useCustomNavigateFile = `import { useRouter } from 'next/navigation';

type StateType = {
    [key: string]: string | number | boolean;
};

export const useCustomNavigate = () => {
    const router = useRouter();

    return (path: string, state?: StateType) => {
        const url = state
            ? \`\${path}?\${new URLSearchParams(state as Record<string, string>).toString()}\`
            : path;
        router.push(url);
        window.scroll(0, 0);
    };
};`;

  fs.writeFileSync('hooks/use-custom-navigate.ts', useCustomNavigateFile);

  // Hook template strings - embedded directly for reliability
  const hookTemplates = {
    useDebounce: `import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,

    useToggle: `import { useState, useCallback } from 'react';

/**
 * Custom hook for managing boolean state with toggle functionality
 * @param initialValue - The initial boolean value
 * @returns Array containing [value, toggle, setValue]
 */
export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  return [value, toggle, setValue];
}`,

    useLocalStorage: `import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param key - The localStorage key
 * @param initialValue - The initial value if no value exists in localStorage
 * @returns Array containing [storedValue, setValue]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}`,

    useMediaQuery: `import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design with CSS media query matching
 * @param query - The media query string
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}`,

    useIsClient: `import { useState, useEffect } from 'react';

/**
 * Custom hook to check if code is running on client-side
 * Useful for SSR applications to prevent hydration issues
 * @returns boolean indicating if running on client
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}`,

    useClickAway: `import { useEffect, RefObject } from 'react';

/**
 * Custom hook to detect clicks outside of a specified element
 * @param ref - React ref object pointing to the element
 * @param handler - Callback function to execute when clicked outside
 */
export function useClickAway<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}`,

    useCopyToClipboard: `import { useState, useCallback } from 'react';

/**
 * Custom hook for copying text to clipboard with feedback
 * @returns Array containing [copiedText, copy function, success status]
 */
export function useCopyToClipboard(): [string | null, (text: string) => Promise<boolean>, boolean] {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setIsCopied(true);

      // Reset success status after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);

      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      setIsCopied(false);
      return false;
    }
  }, []);

  return [copiedText, copy, isCopied];
}`,

    useThrottle: `import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that throttles a value
 * @param value - The value to throttle
 * @param limit - The throttle limit in milliseconds
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef<number>(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}`,

    useWindowSize: `import { useEffect, useState } from 'react';

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

/**
 * Custom hook that tracks window size
 * @returns Object with width and height
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}`,

    useEventListener: `import { useEffect, useRef } from 'react';

/**
 * Custom hook for adding event listeners
 * @param eventName - Name of the event
 * @param handler - Event handler function
 * @param element - Element to attach event to (defaults to window)
 * @param options - Event listener options
 */
export function useEventListener<T extends HTMLElement = HTMLDivElement, K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap>(
    eventName: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    element?: React.RefObject<T> | T | null,
    options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof WindowEventMap = keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void,
    element?: undefined,
    options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<
    K extends keyof (HTMLElementEventMap & WindowEventMap),
    T extends HTMLElement | void = void
>(
    eventName: K,
    handler: (event: (HTMLElementEventMap & WindowEventMap)[K]) => void,
    element?: React.RefObject<T> | T | null,
    options?: boolean | AddEventListenerOptions
): void {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const targetElement = element?.hasOwnProperty('current')
            ? (element as React.RefObject<T>).current
            : element ?? window;

        if (!targetElement?.addEventListener) return;

        const eventListener = (event: Event) => savedHandler.current(event as any);

        targetElement.addEventListener(eventName, eventListener, options);

        return () => {
            targetElement.removeEventListener(eventName, eventListener, options);
        };
    }, [eventName, element, options]);
}`,

    useSessionStorage: `import { useState, useEffect } from 'react';

/**
 * Custom hook for managing sessionStorage with React state
 * @param key - The sessionStorage key
 * @param initialValue - The initial value if no value exists in sessionStorage
 * @returns Array containing [storedValue, setValue]
 */
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}`,

    useTimeout: `import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing timeouts
 * @param callback - Function to execute after timeout
 * @param delay - Delay in milliseconds (null to pause)
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const handler = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(handler);
  }, [delay]);
}`,

    useIsFirstRender: `import { useRef } from 'react';

/**
 * Custom hook to check if this is the first render
 * @returns boolean indicating if this is the first render
 */
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}`,

    useHover: `import { useRef, useState, useEffect } from 'react';

/**
 * Custom hook to track hover state of an element
 * @returns Array containing [hoverRef, isHovered]
 */
export function useHover<T extends HTMLElement = HTMLDivElement>(): [React.RefObject<T>, boolean] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}`
  };

  // Generate selected hooks
  Object.entries(config.hooks).forEach(([hookName, isSelected]) => {
    if (isSelected && hookTemplates[hookName as keyof typeof hookTemplates]) {
      const hookContent = hookTemplates[hookName as keyof typeof hookTemplates];
      const fileName = `hooks/${hookName}.ts`;
      
      fs.writeFileSync(fileName, hookContent);
      console.log(`✓ Added ${hookName} hook`);
    }
  });
}
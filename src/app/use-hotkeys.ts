import { useRef, useLayoutEffect, useCallback, useEffect } from "react";

type HotkeysConfig = {
  shortcut: string;
  disableTextInputs?: boolean;
};

const isTextInput = (element: unknown) => {
  if (!(element instanceof HTMLElement)) return false;

  return (
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLInputElement &&
      (!element.type || element.type === "text")) ||
    element.isContentEditable
  );
};

export const useHotkeys = (
  config: HotkeysConfig,
  callback: (e: KeyboardEvent) => void
) => {
  const { shortcut, disableTextInputs = true } = config;

  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (disableTextInputs && isTextInput(event.target)) {
        return event.stopPropagation();
      }

      const modifierMap = {
        Control: event.ctrlKey,
        Alt: event.altKey,
        Command: event.metaKey,
        Shift: event.shiftKey,
      };

      if (shortcut.includes("+")) {
        const keyArray = shortcut.split("+");

        if (Object.keys(modifierMap).includes(keyArray[0])) {
          const finalKey = keyArray.pop();

          if (
            keyArray.every((k) => modifierMap[k as keyof typeof modifierMap]) &&
            finalKey === event.key
          ) {
            return callbackRef.current(event);
          }
        }
      }

      if (shortcut === event.key) {
        return callbackRef.current(event);
      }
    },
    [disableTextInputs, shortcut]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};

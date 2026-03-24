"use client";

import * as React from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToastVariant = "default" | "destructive" | "success";

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastState = {
  toasts: ToastProps[];
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "DISMISS_TOAST"; toastId: string }
  | { type: "REMOVE_TOAST"; toastId: string };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

const reducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToastProps, "id">;

function toast({ title, description, variant = "default" }: Toast) {
  const id = genId();

  dispatch({
    type: "ADD_TOAST",
    toast: { id, title, description, variant },
  });

  const timeout = setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(id, timeout);

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
export type { ToastProps, ToastVariant };

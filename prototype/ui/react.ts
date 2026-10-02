// SPIKE: this build's React, by name (React is CommonJS, so `export *` would export nothing), for a
// page that also loads a React library from esm.sh (`?external=react` plus an import map pointing
// `react` here), so there is one React.
import React from "react";

export default React;
export const {
  Children, Component, Fragment, Profiler, PureComponent, StrictMode, Suspense, cloneElement,
  createContext, createElement, createRef, forwardRef, isValidElement, lazy, memo, startTransition,
  use, useActionState, useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId,
  useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useOptimistic, useReducer,
  useRef, useState, useSyncExternalStore, useTransition, version,
} = React;

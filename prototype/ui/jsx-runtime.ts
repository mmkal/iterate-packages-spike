// SPIKE: this build's react/jsx-runtime, by name (CommonJS), for a page's import map: a library
// built with `external=react` imports it bare.
import * as runtime from "react/jsx-runtime";

export const { Fragment, jsx, jsxs } = runtime;

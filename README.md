<div align="center">

# 🚀 vite-react-locator

### Instantly jump from your browser to the exact source location of any JSX element.

**Default:** Ctrl + Click • **Fully configurable**

<p align="center">

[![npm version](https://img.shields.io/npm/v/vite-react-locator.svg)](https://www.npmjs.com/package/vite-react-locator)
[![npm downloads](https://img.shields.io/npm/dm/vite-react-locator.svg)](https://www.npmjs.com/package/vite-react-locator)
[![License](https://img.shields.io/npm/l/vite-react-locator)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-Plugin-646CFF?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

</p>

A lightweight Vite plugin that lets you hover any JSX element, inspect its source location, and jump directly to the exact line in your editor.

If React renders it, Locator can locate it.

</div>

---

# 🎬 Demo

<p align="center">
  <img src="./assets/demo.gif" width="500" alt="vite-react-locator demo">
</p>

---

# ✨ Features

- ⚡ Single Babel AST traversal per file — fast, deterministic, stable SHA1-based ids
- ⚛️ Every HTML element, every SVG element, and every React component
- 🧩 Function components, arrow components, `memo()`, `forwardRef()`, `lazy()`, `Suspense`, Portals (`createPortal`)
- 🌳 Full parent/child DOM hierarchy and component ownership per element
- 🔁 Understands how an element was rendered — `.map()` / `.filter().map()` / `flatMap()`, nested arrays, `&&`, ternaries, and `switch` cases
- 🪝 Tracks all React hooks (including custom `useXxx` hooks) used by each component
- 🟦 Hover overlay with component name, file, and line
- 🖱️ **Ctrl + Click** (fully configurable) opens the exact source location in your editor
- 🧠 VS Code, Cursor, and Windsurf supported out of the box
- 📦 Development only — the transform, registry, and runtime never ship to production
- 📝 Strict TypeScript, zero `any`, zero runtime dependency on Node internals in the browser bundle

> 💡 Works only in development mode (`apply: "serve"`). Nothing is included in your production build.

---

# 📸 Demo

## Hover any JSX element

<p align="center">
<img src="./assets/hover.png" width="500">
</p>

---

## Ctrl + Click

<p align="center">
<img src="./assets/editor-open.png" width="500">
</p>

---

# 📦 Installation

```bash
npm install -D vite-react-locator
```

or

```bash
pnpm add -D vite-react-locator
```

or

```bash
yarn add -D vite-react-locator
```

---

# ✅ Compatibility

| Tool | Version / Status |
|------|------------------|
| Vite | ^6.0.0 \|\| ^7.0.0 |
| React | 17+ |
| TypeScript | ✅ Supported |
| JavaScript | ✅ Supported (`.jsx`) |
| Development Mode | ✅ Supported |
| Production Build | Not included |

---
# 🚀 Usage

## 1. Add the plugin

```ts
// vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import locator from "vite-react-locator";

export default defineConfig({
  plugins: [
    react(),
    locator(),
  ],
});
```

## 2. Import the runtime

Import the runtime once in your application entry file (for example `main.tsx`, `main.jsx`, `index.tsx`, or `index.jsx`).

```ts
import "vite-react-locator/runtime";
```

Example:

```tsx
// main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "vite-react-locator/runtime";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## 3. Start the development server

```bash
npm run dev
```

> 💡 The runtime import is required only during development. It has no effect on your production build.
---

# 🎯 How to Use

1. Hold the configured activation key (default: **Ctrl**).
2. Hover over any JSX element — HTML, SVG, or a component.
3. A blue overlay and tooltip appear showing the component, file, and line.
4. Click the highlighted element.
5. It opens instantly in VS Code, Cursor, or Windsurf.

---

# ⚙️ How It Works

```
React/TSX source
        │
        ▼
Single Babel traversal (transform/)
        │  component detection · JSX classification
        │  hierarchy tracking · hook tracking
        ▼
Stable SHA1 locator ids injected as data-locator-id
        │
        ▼
Registry served over /__locator + /__locator-options
        │
        ▼
Runtime (browser) hovers via data-locator-id, shows overlay
        │
        ▼
Ctrl + Click → POST /__open { file, line, column }
        │
        ▼
Dev server opens the file in VS Code / Cursor / Windsurf
```

---

# 🧩 Architecture

```
src/
  index.ts          — Vite plugin: transform hook, HTML injection, dev-server wiring
  shared/            — constants, hashing, tag classification, shared types
  transform/         — single-pass Babel visitor: components, JSX, hierarchy, hooks, injection
  runtime/           — browser code: hover overlay, activation-key handling, open requests
  server/            — dev-server routes (/__locator, /__locator-options, /__open) + editors
  tests/             — vitest suite
```

The transform runs once per file (`enforce: "pre"`, before `@vitejs/plugin-react`), tags every JSX element with a content-addressed id, and records its metadata — tag, kind (`html` / `svg` / `component` / `fragment` / `portal`), owning component, parent/child hierarchy, hooks, and how it was rendered (`normal` / `map` / `array` / `logical` / `ternary` / `conditional`).

---

# 🛠 Supported Editors

| Editor | Status |
|---------|--------|
| VS Code | ✅ |
| Cursor | ✅ |
| Windsurf | ✅ |

The editor is auto-detected from `TERM_PROGRAM`, falling back to trying `cursor`, `windsurf`, then `code` on the `$PATH`.

---

# 🧪 Development

```bash
npm install
npm run build   # tsup — bundles src/index.ts and src/runtime/index.ts
npm run test    # vitest
npm run lint    # eslint
```

The `example/` app is a working Vite + React project wired to consume the local plugin as a real `file:` dependency, useful for end-to-end verification against a real dev server.

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "feat: add amazing feature"
```

4. Push and open a Pull Request.

---

# 🐞 Found a Bug?

Please open an issue on GitHub and include:

- Vite version
- React version
- Operating system
- Steps to reproduce

---

# 📄 License

MIT License © Shivam Singh

---

<div align="center">

Made with ❤️ by **Shivam Singh**

</div>

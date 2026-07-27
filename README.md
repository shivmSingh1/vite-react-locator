<div align="center">

# 🚀 vite-react-locator

### Instantly jump from your browser to the source code of any React component.

**Default:** Ctrl + Click • **Fully configurable**


<p align="center">

[![npm version](https://img.shields.io/npm/v/vite-react-locator.svg)](https://www.npmjs.com/package/vite-react-locator)
[![npm downloads](https://img.shields.io/npm/dm/vite-react-locator.svg)](https://www.npmjs.com/package/vite-react-locator)
[![License](https://img.shields.io/npm/l/vite-react-locator)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-Plugin-646CFF?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

</p>

A lightweight Vite plugin that lets you hover React components, inspect their source location, and jump directly to the component file in your editor.

No browser extensions required.

</div>

---

# 🎬 Demo

<p align="center">
  <img src="./assets/demo.gif" width="500" alt="vite-react-locator demo">
</p>

---

# ✨ Features

- ⚡ Lightweight and fast
- ⚛️ Works with React + Vite
- 🔍 Detects React components automatically
- 🟦 Beautiful hover overlay
- ⚡ No browser extensions required
- 🔥 Opens components at the exact source location
- 💬 Tooltip showing:
  - Component name
  - File name
  - Line number
- 🖱️ **Ctrl + Click** opens the component in VS Code
- ⌨️ Configurable activation key
- 🚀 Babel AST based transformation
- 📝 TypeScript support
- 📦 Zero runtime configuration

> 💡 Works only in development mode. Nothing is included in your production build.

---

# 📸 Demo

## Hover any React component

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
| Vite | 5+ |
| React | 18+ |
| TypeScript | ✅ Supported |
| JavaScript | ✅ Supported |
| Development Mode | ✅ Supported |
| Production Build | Not required |

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

---

## 2. Import the runtime

```ts
// src/main.tsx

import "vite-react-locator/runtime";
```

That's it.

Start your dev server.

```bash
npm run dev
```

---

## Optional Configuration

```ts
locator({
  activationKey: "Ctrl", // default
});
```

Examples:

```ts
locator({ activationKey: "Alt" });
locator({ activationKey: "Ctrl+Shift" });
locator({ activationKey: "Ctrl+Alt" });
locator({ activationKey: "Ctrl+Alt+Shift" });
```

Supports any combination of:

- Ctrl
- Alt
- Shift
- Meta

If no activation key is specified, **Ctrl** is used by default.

---

# 🎯 How to Use

1. Hold the configured activation key (default: **Ctrl**).
2. Hover over any React component.
3. A blue overlay and tooltip will appear.
4. Click the component.
5. It opens instantly in your editor.

---

# 📖 Example

Suppose your application contains

```tsx
function LoginButton() {
    return <button>Login</button>;
}
```

Move your mouse over the button while holding **Ctrl**.

You will see

```
LoginButton
LoginButton.tsx:8
```

Now press

```
Ctrl + Click
```

VS Code instantly opens

```
src/components/LoginButton.tsx
```

at the correct line.

---

# ⚙️ How It Works

```
React Component
        │
        ▼
Babel AST Transform
        │
        ▼
Inject Locator Metadata
        │
        ▼
Runtime detects hovered component
        │
        ▼
Tooltip + Overlay
        │
        ▼
Ctrl + Click
        │
        ▼
Vite Dev Server
        │
        ▼
Open VS Code
```

---


# ⚡ Why use vite-react-locator?

Without this plugin

```
Inspect Component

↓

Search Component Name

↓

Search Folder

↓

Open File

↓

Find Line
```

With vite-react-locator

```
Ctrl + Click

↓

Done ✅
```

---

# 🛠 Supported Editors

| Editor | Status |
|---------|--------|
| VS Code | ✅ |
| Cursor | 🚧 Planned |
| VS Code Insiders | 🚧 Planned |
| WebStorm | 🚧 Planned |

---

# 🆕

## v1.0.1

### Added

- ⌨️ Configurable activation key
- 🎯 Support for key combinations
- 📝 Type-safe activation key configuration

### Changed

- Default activation key is now **Ctrl** instead of **Alt**.
- Improved Windows browser compatibility by avoiding the native Alt menu behavior.

---

# 📋 Roadmap

## v1.0.0

- [x] Component detection
- [x] Overlay
- [x] Tooltip
- [x] Editor integration
- [x] VS Code support
- [x] Runtime

## v1.0.1

- [x] Configurable activation key
- [x] Ctrl as default activation key

## v1.1

- [ ] Cursor support
- [ ] WebStorm support
- [ ] VS Code Insiders
- [ ] Better tooltip

## v1.2

- [ ] Editor selection
- [ ] Custom overlay colors

---

# 🤝 Contributing

Contributions are welcome.

If you'd like to improve the project:

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "feat: add amazing feature"
```

4. Push

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

# 🐞 Found a Bug?

Please open an issue on GitHub.

Include

- Vite version
- React version
- Operating System
- Steps to reproduce

---

# 📄 License

MIT License © Shivam Singh

---

# ⭐ Support

If this project saves you time,

please consider giving it a ⭐ on GitHub.

It helps the project reach more developers.

---

<div align="center">

Made with ❤️ by **Shivam Singh**

</div>
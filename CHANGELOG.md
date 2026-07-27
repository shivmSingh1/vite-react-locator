# Changelog

All notable changes to this project will be documented in this file.

---

## 1.1.1

### Fixed

- Fixed React component detection for components declared with arrow functions.
- Fixed component detection for `memo()` and `forwardRef()` wrapped components.
- Improved JSX element source mapping across modern React component patterns.
- Fixed incorrect parent component resolution in projects using arrow function components.
- Improved compatibility with React 19 projects and newer Vite setups.

---

## 1.1.0

### Added

- Locate any JSX element, not just component roots
- Hover overlay for all JSX elements
- Ctrl + Click opens the exact source location of the hovered JSX element
- Precise source mapping for nested JSX elements

### Improved

- Reworked Babel AST analysis for per-element metadata injection
- Improved source location accuracy across JSX trees
- Better developer experience when navigating React applications

---

## 1.0.1

### Added

- Configurable activation key
- Support for activation key combinations
- Type-safe activation key configuration

### Changed

- Default activation key changed from **Alt** to **Ctrl**

### Fixed

- Eliminated the browser Alt menu issue on Windows by avoiding the native Alt menu behavior

---

## 1.0.0

### Added

- Initial release
- React component locator
- Hover overlay
- Component tooltip
- Alt + Click support
- VS Code integration
- Babel AST-based transformation
- TypeScript support
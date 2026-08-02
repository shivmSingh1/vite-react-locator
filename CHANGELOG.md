# Changelog

All notable changes to this project will be documented in this file.
---
## 2.0.1

### Documentation

- Updated README to clarify that the runtime must currently be imported manually:

  ```ts
  import "vite-react-locator/runtime";
---

## 2.0.0

### Rewrite

This is the first major public release since **v1.1.1**.

The plugin has been completely rewritten with a new transform pipeline, runtime, registry synchronization, editor integration, and development workflow.

### Added

- Automatic browser runtime injection via a virtual module + `transformIndexHtml` (no more manual `import "vite-react-locator/runtime"` step)
- Stable SHA1-based locator IDs
- Single-pass Babel transform
- Full parent/child hierarchy tracking
- Portal detection (`ReactDOM.createPortal` / `createPortal`)
- `generatedBy` classification for every element: `map`, `array`, `logical`, `ternary`, `conditional` (switch), or `normal`
- Detection for `memo()`, `forwardRef()`, `lazy()`, and anonymous wrapped components
- Custom hook (`useXxx`) tracking alongside built-in React hooks
- Cursor and Windsurf editor support (auto-detected via `TERM_PROGRAM`, with `$PATH` fallback), in addition to VS Code
- `enabled` plugin option to fully disable the plugin without removing it
- Automatic runtime registry synchronization for lazily transformed modules
- Automatic metadata retry mechanism for newly transformed files
- Filename-derived fallback for scope-less JSX instead of displaying `"Unknown"`
- Comprehensive Vitest suite covering hashing, tag classification, hierarchy, generatedBy kinds, portals, hooks, registry lifecycle, `Context.Provider`, `Context.Consumer`, `props.children`, `React.Children.map()`, `cloneElement()`, nested `.map()`, helper render functions, `memo(forwardRef())`, `Suspense`, and additional regression cases
- Additional regression tests covering helper render functions, anonymous wrapped components, filename fallback, and runtime synchronization

### Fixed

- Build was broken: `transform/visitor.ts` referenced component-detection functions that did not exist
- The browser runtime was never injected into the page, preventing hover/click inspection
- Self-closing JSX elements (e.g. `<input />`) corrupted the locator hierarchy stack
- The global locator registry was cleared on every file transform instead of only the current file
- `tsup.config.ts` referenced non-existent source files
- Runtime registry race condition that required manually refreshing the page before some elements became locatable
- Registry cache synchronization for asynchronously transformed modules
- Retry logic for newly available locator metadata after Vite transforms
- Stale hover state preventing failed locator lookups from recovering until a page refresh
- Added `cache: "no-store"` for registry and options requests to avoid stale metadata
- Tooltip displaying `"Unknown"` for helper render functions, anonymous wrapped components, and scope-less JSX
- Component scope detection for helper functions returning JSX
- Detection of anonymous `memo()`, `forwardRef()`, and `lazy()` wrapped components
- Filename-derived fallback for top-level JSX without component scope
- `Ctrl + Click` failing to open editors on Windows because `.cmd` launchers were not handled correctly
- Added robust cross-platform editor discovery with platform-specific fallback locations
- Improved runtime error reporting when editor launch requests fail

### Changed

- Complete rewrite onto the frozen architecture
- `editors/` moved under `server/editors/` to match the documented architecture
- Removed unused/dead runtime files (`hierarchy.ts`, `inspector.ts`, `locator.ts`, `registry.ts`)
- Improved transform performance with a single Babel traversal
- Improved runtime reliability and registry lifecycle
- Development-only runtime with zero production bundle impact

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
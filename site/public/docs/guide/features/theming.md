---
title: Theming
order: 3
category: guide/features
description: "Learn how to use and customize the theme system in AC Grid, including default themes and creating custom themes"
---

# Theming

AC Grid provides a flexible theme system that allows you to customize the appearance of your grid.

## Quick Start

### Installation

```bash
# Standard installation (recommended)
npm install @ac-grid/core @ac-grid/ac-grid-theme-base @ac-grid/ac-grid-theme-default

# Or using pnpm
pnpm add @ac-grid/core @ac-grid/ac-grid-theme-base @ac-grid/ac-grid-theme-default
```

### Basic Usage

```typescript
// 1. Import Grid core
import '@ac-grid/core';

// 2. Import default themes (automatically applies light theme)
import '@ac-grid/ac-grid-theme-default';

// 3. Use Grid
// Grid automatically uses theme system styles
```

## Theme System Architecture

AC Grid's theme system uses an **independent package architecture**:

```
@ac-grid/core          Core grid functionality
    ↓ (uses CSS variables)
@ac-grid/ac-grid-theme-base    Theme system foundation
    ↓ (provides theme management)
@ac-grid/ac-grid-theme-default Light, Dark, Ocean, Forest, Sunset, Bamboo preset themes
```

### Why Independent Packages?

1. **On-demand Loading**: Only install the theme packages you need
2. **Separation of Concerns**: Core functionality and styling are completely separated
3. **Community Friendly**: Easy to create and share custom theme packages
4. **Independent Evolution**: Core and themes can be versioned independently

## Using Default Themes

### Light Theme (Default)

```typescript
import '@ac-grid/core';
import '@ac-grid/ac-grid-theme-default';

// Automatically applies light theme, no additional configuration needed
```

### Dark Theme

```typescript
import '@ac-grid/core';
import '@ac-grid/ac-grid-theme-default';
import { themeManager } from '@ac-grid/ac-grid-theme-base';

// Switch to dark theme
themeManager.applyTheme('dark');
```

### Available Themes

| Theme | Primary Color | Background | Use Case |
|-------|--------------|-----------|----------|
| Light | Blue `#2563eb` | White | Daytime use, printing |
| Dark | Bright Blue `#3b82f6` | Dark Gray | Nighttime use, eye protection |
| Ocean | Sky Blue `#0ea5e9` | White | Fresh, professional |
| Forest | Emerald `#10b981` | White | Natural, fresh |
| Sunset | Orange `#f97316` | White | Warm, energetic |
| Bamboo | Green `#22c55e` | White | Natural, peaceful |

### Switching Themes

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

// Get current theme
const current = themeManager.getCurrentTheme(); // 'light'

// Switch themes
themeManager.applyTheme('dark');
themeManager.applyTheme('ocean');
themeManager.applyTheme('forest');
themeManager.applyTheme('sunset');
themeManager.applyTheme('bamboo');
```

## Creating Custom Themes

### Method 1: Fully Custom

```typescript
import { themeManager, type ACGridTheme } from '@ac-grid/ac-grid-theme-base';

const customTheme: ACGridTheme = {
  name: 'my-theme',
  displayName: 'My Custom Theme',
  description: 'A beautiful custom theme',
  author: 'Your Name',
  version: '1.0.0',
  colors: {
    primary: '#ff6b6b',
    border: '#dee2e6',
    bgHeader: '#f8f9fa',
    bgHover: '#e9ecef',
    bgCell: '#ffffff',
    bgSelected: '#ffe0e0',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textDisabled: '#adb5bd',
    success: '#51cf66',
    warning: '#ffd43b',
    error: '#ff6b6b',
    info: '#74c0fc',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
    width: {
      thin: '1px',
      base: '1px',
      thick: '2px',
    },
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Register theme
themeManager.registerTheme(customTheme);

// Apply theme
themeManager.applyTheme('my-theme');
```

### Method 2: Extend Preset Theme

```typescript
import { lightTheme } from '@ac-grid/ac-grid-theme-default';
import { themeManager, type ACGridTheme } from '@ac-grid/ac-grid-theme-base';

// Create variant based on light theme
const myLightTheme: ACGridTheme = {
  ...lightTheme,
  name: 'my-light',
  displayName: 'My Light Theme',
  colors: {
    ...lightTheme.colors,
    primary: '#ff6b6b',  // Only modify primary color
  },
};

themeManager.registerTheme(myLightTheme);
themeManager.applyTheme('my-light');
```

### Method 3: Create Theme Package (Recommended for Sharing)

```typescript
// my-theme-package/src/themes/brand.ts
import type { ACGridTheme } from '@ac-grid/ac-grid-theme-base';

export const brandTheme: ACGridTheme = {
  name: 'company-brand',
  displayName: 'Company Brand',
  // ... theme definition
};

// my-theme-package/src/index.ts
import { themeManager } from '@ac-grid/ac-grid-theme-base';
import { brandTheme } from './themes/brand';

// Auto-register
themeManager.registerTheme(brandTheme);

export { brandTheme };
```

Publish as npm package:
```json
{
  "name": "@company/ac-grid-theme-brand",
  "version": "1.0.0",
  "dependencies": {
    "@ac-grid/ac-grid-theme-base": "^0.1.0"
  }
}
```

## Theme Switching

### Manual Switching

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

// Get current theme
const current = themeManager.getCurrentTheme(); // 'light'

// Switch theme
themeManager.applyTheme('dark');

// Switch back to light
themeManager.applyTheme('light');
```

### Theme Toggle Button

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

const toggleButton = document.getElementById('theme-toggle');

toggleButton?.addEventListener('click', () => {
  const current = themeManager.getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  themeManager.applyTheme(next);
  
  // Update button text
  toggleButton.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
});
```

### Listen to Theme Changes

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

const unsubscribe = themeManager.onThemeChange((currentTheme, previousTheme) => {
  console.log(`Theme changed from ${previousTheme} to ${currentTheme}`);
  
  // Update UI
  document.body.setAttribute('data-theme', currentTheme);
  
  // Save user preference
  localStorage.setItem('preferred-theme', currentTheme);
});

// Unsubscribe
// unsubscribe();
```

## Responding to System Theme

### Auto-Follow System

```typescript
import '@ac-grid/ac-grid-theme-default';
import { watchSystemTheme } from '@ac-grid/ac-grid-theme-base';

// Automatically respond to system theme changes
const unwatch = watchSystemTheme('light', 'dark');

// Unwatch
// unwatch();
```

### Manual System Theme Detection

```typescript
import { applySystemTheme } from '@ac-grid/ac-grid-theme-base';

// Apply current system theme
applySystemTheme('light', 'dark');
```

### Complete Example with User Preference

```typescript
import '@ac-grid/ac-grid-theme-default';
import { themeManager, watchSystemTheme } from '@ac-grid/ac-grid-theme-base';

// 1. Read user preference
const savedTheme = localStorage.getItem('preferred-theme');

if (savedTheme && themeManager.hasTheme(savedTheme)) {
  // Use saved theme
  themeManager.applyTheme(savedTheme);
} else {
  // Follow system theme
  watchSystemTheme('light', 'dark');
}

// 2. Save user selection
themeManager.onThemeChange((currentTheme) => {
  localStorage.setItem('preferred-theme', currentTheme);
});
```

## Advanced Usage

### Validate Theme

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

const result = themeManager.validateTheme(customTheme);

if (!result.valid) {
  console.error('Invalid theme:', result.errors);
}
```

### List All Available Themes

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

const themes = themeManager.getThemes();
console.log('Available themes:', themes); // ['light', 'dark', 'ocean', ...]
```

### Get Theme Definition

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

const lightTheme = themeManager.getTheme('light');
console.log('Light theme colors:', lightTheme?.colors);
```

### Dynamic Theme Selector

```typescript
import { themeManager } from '@ac-grid/ac-grid-theme-base';

function createThemeSelector() {
  const select = document.createElement('select');
  
  themeManager.getThemes().forEach(themeName => {
    const option = document.createElement('option');
    option.value = themeName;
    option.textContent = themeName;
    select.appendChild(option);
  });
  
  select.value = themeManager.getCurrentTheme() || 'light';
  
  select.addEventListener('change', (e) => {
    themeManager.applyTheme((e.target as HTMLSelectElement).value);
  });
  
  return select;
}

document.body.appendChild(createThemeSelector());
```

## FAQ

### Q: Does theme switching re-render the Grid?

A: **No**. Theme switching only updates CSS variables, the browser automatically repaints, no JavaScript re-rendering, excellent performance.

### Q: Can I use multiple themes on the same page?

A: Current version (v0.0.2) does not support this yet. Planned for v0.3.0 to support local theme application.

### Q: How to create gradient themes?

A: CSS variables support any CSS value, including gradients:
```typescript
colors: {
  primary: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  // ...
}
```

### Q: What is the theme package size?

A: 
- `theme-base`: ~5KB (gzipped)
- `theme-default`: ~2KB (gzipped)
- Total: ~7KB

### Q: How to share my theme?

A: 
1. Create npm package (see [Method 3](#method-3-create-theme-package-recommended-for-sharing))
2. Publish to npm
3. Submit to [AC Grid Theme List](https://github.com/systembugtj/ac-grid/issues)

### Q: Does it support CSS-in-JS?

A: Not recommended. AC Grid uses CSS variables for optimal performance, CSS-in-JS would add runtime overhead.

## Related Resources

- [RFC-0016: Theme System Architecture](../../../../docs/rfc/0016-theme-system.md)
- [Project Roadmap](../../../../ROADMAP.md)
- [theme-base API Documentation](../../../../packages/theme-base/README.md)
- [theme-default Documentation](../../../../packages/theme-default/README.md)

---

**Contribution**: Welcome to submit your theme packages! See [Contributing Guide](../../../../CONTRIBUTING.md)

**License**: MIT

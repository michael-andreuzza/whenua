// Theme controller for the create-bearnie-theme page
// This handles all client-side theme updates and interactions

import { baseColorValues, baseColorOptions } from '../data/base-colors';
import { primaryColorValues, primaryColorOptions } from '../data/primary-colors';
import { radiusNames, radiusOptions } from '../data/radius';
import { fontFamilies, fontOptions } from '../data/fonts';
import { stylePresets, styleOptions } from '../data/styles';

// State
const state = {
  style: 'bearnie',
  baseColor: 'neutral',
  primaryColor: 'neutral',
  radius: '0.625',
  spacing: '0.25',
  font: 'inter',
  buttonRadius: '', // empty = use --radius, 'full' = pill buttons
  cardBorder: true,
  cardPadding: true,
  cardShadow: false,
  borderWidth: '1px',
  uppercase: false,
  textScale: 'normal'
};

// Elements
const styleLabel = document.getElementById('style-label');
const styleIcon = document.getElementById('style-icon');
const baseColorLabel = document.getElementById('base-color-label');
const baseColorDot = document.getElementById('base-color-dot');
const primaryColorLabel = document.getElementById('primary-color-label');
const primaryColorDot = document.getElementById('primary-color-dot');
const radiusLabel = document.getElementById('radius-label');
const fontLabel = document.getElementById('font-label');
const copyCssBtn = document.getElementById('copy-css');
const resetBtn = document.getElementById('reset-theme');
const shuffleBtn = document.getElementById('shuffle-theme');
const toast = document.getElementById('toast');
const createModal = document.querySelector('[data-create-modal]');

// Style icon rx values
const styleIconRx: Record<string, string> = {
  bearnie: '3',
  rere: '0',
  valentina: '5',
};

// Tailwind color class mapping for dots
const colorClasses: Record<string, string> = {
  neutral: 'bg-neutral-500',
  slate: 'bg-slate-500',
  gray: 'bg-gray-500',
  zinc: 'bg-zinc-500',
  stone: 'bg-stone-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  yellow: 'bg-yellow-500',
  lime: 'bg-lime-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  sky: 'bg-sky-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  purple: 'bg-purple-500',
  fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-500',
  rose: 'bg-rose-500',
};

// Update color dot
function updateColorDot(dot: HTMLElement | null, colorValue: string, isPrimary: boolean = false) {
  if (!dot) return;
  // Remove all color classes
  Object.values(colorClasses).forEach(cls => dot.classList.remove(cls));
  dot.classList.remove('bg-neutral-900', 'dark:bg-neutral-100', 'bg-primary');
  
  if (isPrimary && colorValue === 'neutral') {
    dot.classList.add('bg-neutral-900', 'dark:bg-neutral-100');
  } else {
    dot.classList.add(colorClasses[colorValue] || 'bg-neutral-500');
  }
}

// Update checkmarks
function updateChecks(type: string, value: string) {
  document.querySelectorAll(`[data-${type}]`).forEach(item => {
    const check = item.querySelector('[data-check]');
    if (check) {
      check.classList.toggle('opacity-0', item.getAttribute(`data-${type}`) !== value);
      check.classList.toggle('opacity-100', item.getAttribute(`data-${type}`) === value);
    }
  });
}

// Update theme
function updateTheme() {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const mode = isDark ? 'dark' : 'light';

  // Get all preview elements (components only, not layout wrappers)
  const previewElements = document.querySelectorAll('#theme-preview, [data-theme-preview]');
  
  // Theme values
  const base = baseColorValues[state.baseColor]?.[mode] || baseColorValues.neutral[mode];
  const primary = primaryColorValues[state.primaryColor] || primaryColorValues.neutral;
  const fontFamily = fontFamilies[state.font] || fontFamilies.inter;

  // Apply theme to each preview element
  previewElements.forEach(target => {
    const el = target as HTMLElement;
    
    // Base colors
    el.style.setProperty('--background', base.background);
    el.style.setProperty('--foreground', base.foreground);
    el.style.setProperty('--card', base.card);
    el.style.setProperty('--card-foreground', base.foreground);
    el.style.setProperty('--popover', base.card);
    el.style.setProperty('--popover-foreground', base.foreground);
    el.style.setProperty('--muted', base.muted);
    el.style.setProperty('--muted-foreground', base.mutedForeground);
    el.style.setProperty('--border', base.border);
    el.style.setProperty('--input', base.input);
    el.style.setProperty('--secondary', base.muted);
    el.style.setProperty('--secondary-foreground', base.foreground);
    el.style.setProperty('--accent', base.muted);
    el.style.setProperty('--accent-foreground', base.foreground);

    // Primary colors
    el.style.setProperty('--primary', isDark ? primary.dark : primary.light);
    el.style.setProperty('--primary-foreground', isDark ? primary.darkFg : primary.lightFg);
    el.style.setProperty('--ring', isDark ? primary.dark : primary.light);

    // Destructive colors (static)
    el.style.setProperty('--destructive', 'oklch(0.577 0.245 27.325)');
    el.style.setProperty('--destructive-foreground', 'oklch(0.985 0 0)');

    // Radius
    el.style.setProperty('--radius', `${state.radius}rem`);
    
    // Button radius (for pill buttons in certain styles)
    const buttonRadiusValue = state.buttonRadius === 'full' ? '9999px' : `${state.radius}rem`;
    el.style.setProperty('--button-radius', buttonRadiusValue);

    // Card border (for borderless styles like rere)
    el.style.setProperty('--card-border', state.cardBorder ? state.borderWidth : '0px');
    
    // Card padding (for minimal styles like rere)
    el.style.setProperty('--card-padding', state.cardPadding ? '1.5rem' : '0');

    // Card shadow (for soft styles like monana-nui and valentina)
    el.style.setProperty('--card-shadow', state.cardShadow ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none');

    // Text transform (for swiss style like rere)
    el.style.setProperty('--heading-transform', state.uppercase ? 'uppercase' : 'none');
    el.style.setProperty('--heading-tracking', state.uppercase ? '0.05em' : 'normal');

    // Text scale (for bold styles like valentina)
    const textScaleMultiplier = state.textScale === 'large' ? '1.1' : '1';
    el.style.setProperty('--text-scale', textScaleMultiplier);

    // Spacing (used for padding/gaps)
    el.style.setProperty('--spacing', `${state.spacing}rem`);

    // Font
    el.style.setProperty('--font-sans', fontFamily);
    el.style.fontFamily = `var(--font-sans)`;
  });

  updateUrl();
  updateCliCommands();
  updateChecks('style', state.style);
  updateChecks('base-color', state.baseColor);
  updateChecks('primary-color', state.primaryColor);
  updateChecks('radius', state.radius);
  updateChecks('font', state.font);
}

// URL query params (cleaner format like ?style=bearnie&baseColor=neutral&primaryColor=blue)
function stateToParams(): URLSearchParams {
  const params = new URLSearchParams();
  // Only include non-default values to keep URL clean
  if (state.style !== 'bearnie') params.set('style', state.style);
  if (state.baseColor !== 'neutral') params.set('baseColor', state.baseColor);
  if (state.primaryColor !== 'neutral') params.set('primaryColor', state.primaryColor);
  if (state.radius !== '0.625') params.set('radius', state.radius);
  if (state.font !== 'inter') params.set('font', state.font);
  return params;
}

function paramsToState(params: URLSearchParams): Partial<typeof state> {
  const result: Partial<typeof state> = {};
  if (params.has('style')) result.style = params.get('style')!;
  if (params.has('baseColor')) result.baseColor = params.get('baseColor')!;
  if (params.has('primaryColor')) result.primaryColor = params.get('primaryColor')!;
  if (params.has('radius')) result.radius = params.get('radius')!;
  if (params.has('font')) result.font = params.get('font')!;
  return result;
}

function updateUrl() {
  const params = stateToParams();
  // Preserve the item param if it exists
  const currentParams = new URLSearchParams(window.location.search);
  const item = currentParams.get('item');
  if (item) params.set('item', item);
  
  const queryString = params.toString();
  const newUrl = queryString ? `?${queryString}` : window.location.pathname;
  history.replaceState(null, '', newUrl);
}

// Color name to hue mapping (extracted from OKLCH values in primary-colors.ts)
const colorToHue: Record<string, number> = {
  neutral: 0,
  red: 27.325,
  orange: 41.116,
  amber: 70.08,
  yellow: 86.047,
  lime: 130.85,
  green: 163.225,
  emerald: 163.225,
  teal: 182.503,
  cyan: 199.769,
  sky: 222.492,
  blue: 262.881,
  indigo: 276.966,
  violet: 293.009,
  purple: 302.321,
  fuchsia: 322.896,
  pink: 354.308,
  rose: 16.439,
};

// Base color to neutral hue mapping (extracted from OKLCH values in base-colors.ts)
const baseColorToHue: Record<string, number> = {
  neutral: 0,
  slate: 264.695,
  gray: 261.692,
  zinc: 285.823,
  stone: 49.25,
};

// Generate base64-encoded theme config for CLI
function generateThemeHash(): string {
  const themeConfig = {
    primaryHue: colorToHue[state.primaryColor] ?? 0,
    destructiveHue: 27.325,   // Always red
    successHue: 163.225,      // Always emerald/green
    warningHue: 70.08,        // Always amber
    infoHue: 262.881,         // Always blue
    neutralHue: baseColorToHue[state.baseColor] ?? 0,
    radius: parseFloat(state.radius) * 16, // Convert rem to px (CLI expects px)
    font: state.font as 'inter' | 'geist',
  };
  
  return btoa(JSON.stringify(themeConfig));
}

function updateCliCommands() {
  const themeHash = generateThemeHash();
  const themeUrl = `${window.location.origin}/create-bearnie-theme#${themeHash}`;
  
  const pmCommands: Record<string, string> = {
    npx: `npx create-bearnie my-app --theme="${themeUrl}"`,
    bun: `bunx create-bearnie my-app --theme="${themeUrl}"`,
    pnpm: `pnpm create bearnie my-app --theme="${themeUrl}"`,
    yarn: `yarn create bearnie my-app --theme="${themeUrl}"`,
  };
  
  Object.entries(pmCommands).forEach(([pm, cmd]) => {
    const panel = document.querySelector(`[data-pm-panel="${pm}"]`);
    const codeContent = panel?.querySelector('[data-code-content]');
    const codeBlock = panel?.querySelector('pre code');
    if (codeContent) codeContent.textContent = cmd;
    if (codeBlock) codeBlock.textContent = cmd;
  });
}

// Toast
function showToast(message: string) {
  if (toast) {
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
    }, 2000);
  }
}

async function copyToClipboard(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// Generate CSS
function generateCSS(): string {
  const base = baseColorValues[state.baseColor] || baseColorValues.neutral;
  const primary = primaryColorValues[state.primaryColor] || primaryColorValues.neutral;
  const fontFamily = fontFamilies[state.font] || fontFamilies.inter;

  return `/* Bearnie Theme - Generated at bearnie.dev/create-bearnie-theme */

:root {
  --radius: ${state.radius}rem;
  --spacing: ${state.spacing}rem;
  --font-sans: ${fontFamily};
  
  --background: ${base.light.background};
  --foreground: ${base.light.foreground};
  --card: ${base.light.card};
  --card-foreground: ${base.light.foreground};
  --popover: ${base.light.card};
  --popover-foreground: ${base.light.foreground};
  --primary: ${primary.light};
  --primary-foreground: ${primary.lightFg};
  --secondary: ${base.light.muted};
  --secondary-foreground: ${base.light.foreground};
  --muted: ${base.light.muted};
  --muted-foreground: ${base.light.mutedForeground};
  --accent: ${base.light.muted};
  --accent-foreground: ${base.light.foreground};
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: ${base.light.border};
  --input: ${base.light.input};
  --ring: ${primary.light};
}

.dark {
  --background: ${base.dark.background};
  --foreground: ${base.dark.foreground};
  --card: ${base.dark.card};
  --card-foreground: ${base.dark.foreground};
  --popover: ${base.dark.card};
  --popover-foreground: ${base.dark.foreground};
  --primary: ${primary.dark};
  --primary-foreground: ${primary.darkFg};
  --secondary: ${base.dark.muted};
  --secondary-foreground: ${base.dark.foreground};
  --muted: ${base.dark.muted};
  --muted-foreground: ${base.dark.mutedForeground};
  --accent: ${base.dark.muted};
  --accent-foreground: ${base.dark.foreground};
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: ${base.dark.border};
  --input: ${base.dark.input};
  --ring: ${primary.dark};
}`;
}

// Event listeners using event delegation for reliability with dropdowns

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  // Style preset selection
  const styleTarget = target.closest('[data-style]');
  if (styleTarget) {
    const value = styleTarget.getAttribute('data-style') || 'bearnie';
    state.style = value;
    
    // Apply preset values
    const preset = stylePresets[value];
    if (preset) {
      state.radius = preset.radius;
      state.spacing = preset.spacing;
      state.font = preset.font;
      state.buttonRadius = preset.buttonRadius || '';
      state.cardBorder = preset.cardBorder !== false;
      state.cardPadding = preset.cardPadding !== false;
      state.cardShadow = preset.cardShadow === true;
      state.borderWidth = preset.borderWidth || '1px';
      state.uppercase = preset.uppercase === true;
      state.textScale = preset.textScale || 'normal';
      
      // Update individual labels
      if (radiusLabel) radiusLabel.textContent = radiusNames[preset.radius] || 'Medium';
      if (fontLabel) {
        const fontName = fontOptions.find(f => f.value === preset.font)?.name || 'Inter';
        fontLabel.textContent = fontName;
      }
    }
    
    // Update style label and icon
    const styleName = styleOptions.find(s => s.value === value)?.name || 'Bearnie';
    if (styleLabel) styleLabel.textContent = styleName;
    if (styleIcon) styleIcon.setAttribute('rx', styleIconRx[value] || '3');
    
    updateTheme();
    return;
  }
  
  // Base color selection
  const baseColorTarget = target.closest('[data-base-color]');
  if (baseColorTarget) {
    const value = baseColorTarget.getAttribute('data-base-color') || 'neutral';
    state.baseColor = value;
    const colorName = baseColorOptions.find(c => c.value === value)?.name || 'Neutral';
    if (baseColorLabel) baseColorLabel.textContent = colorName;
    updateColorDot(baseColorDot, value);
    updateTheme();
    return;
  }
  
  // Primary color selection
  const primaryColorTarget = target.closest('[data-primary-color]');
  if (primaryColorTarget) {
    const value = primaryColorTarget.getAttribute('data-primary-color') || 'neutral';
    state.primaryColor = value;
    const colorName = primaryColorOptions.find(c => c.value === value)?.name || 'Neutral';
    if (primaryColorLabel) primaryColorLabel.textContent = colorName;
    updateColorDot(primaryColorDot, value, true);
    updateTheme();
    return;
  }
  
  // Radius selection
  const radiusTarget = target.closest('[data-radius]');
  if (radiusTarget) {
    const value = radiusTarget.getAttribute('data-radius') || '0.625';
    state.radius = value;
    const radiusName = radiusOptions.find(r => r.value === value)?.name || 'Medium';
    if (radiusLabel) radiusLabel.textContent = radiusName;
    updateTheme();
    return;
  }
  
  // Font selection
  const fontTarget = target.closest('[data-font]');
  if (fontTarget) {
    const value = fontTarget.getAttribute('data-font') || 'inter';
    state.font = value;
    const fontName = fontOptions.find(f => f.value === value)?.name || 'Inter';
    if (fontLabel) fontLabel.textContent = fontName;
    updateTheme();
    return;
  }
  
});

// Package manager tab switching in modal
if (createModal) {
  const pmTabs = createModal.querySelectorAll('[data-pm-tab]');
  const pmPanels = createModal.querySelectorAll('[data-pm-panel]');
  
  const setActivePmTab = (activeValue: string) => {
    pmTabs.forEach(tab => {
      if (tab.getAttribute('data-pm-tab') === activeValue) {
        tab.setAttribute('data-active', '');
      } else {
        tab.removeAttribute('data-active');
      }
    });
    
    pmPanels.forEach(panel => {
      if (panel.getAttribute('data-pm-panel') === activeValue) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });
  };
  
  pmTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const value = tab.getAttribute('data-pm-tab');
      if (value) setActivePmTab(value);
    });
  });
  
  // Modal copy button
  const modalCopyButton = createModal.querySelector('[data-modal-copy-button]');
  const copyIcon = modalCopyButton?.querySelector('[data-copy-icon]');
  const checkIcon = modalCopyButton?.querySelector('[data-check-icon]');
  
  modalCopyButton?.addEventListener('click', async () => {
    const visiblePanel = createModal.querySelector('[data-pm-panel]:not(.hidden)');
    const codeContent = visiblePanel?.querySelector('[data-code-content]');
    const code = codeContent?.textContent || '';
    
    try {
      await navigator.clipboard.writeText(code);
      copyIcon?.classList.add('hidden');
      checkIcon?.classList.remove('hidden');
      showToast('Copied!');
      setTimeout(() => {
        copyIcon?.classList.remove('hidden');
        checkIcon?.classList.add('hidden');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}

// Actions
copyCssBtn?.addEventListener('click', async () => {
  const originalText = copyCssBtn.textContent;
  try {
    await navigator.clipboard.writeText(generateCSS());
    copyCssBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyCssBtn.textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
});

resetBtn?.addEventListener('click', () => {
  state.style = 'bearnie';
  state.baseColor = 'neutral';
  state.primaryColor = 'neutral';
  state.radius = '0.625';
  state.spacing = '0.25';
  state.font = 'inter';
  state.buttonRadius = '';
  state.cardBorder = true;
  state.cardPadding = true;
  state.cardShadow = false;
  state.borderWidth = '1px';
  state.uppercase = false;
  state.textScale = 'normal';
  if (styleLabel) styleLabel.textContent = 'Bearnie';
  if (styleIcon) styleIcon.setAttribute('rx', '3');
  if (baseColorLabel) baseColorLabel.textContent = 'Neutral';
  if (primaryColorLabel) primaryColorLabel.textContent = 'Neutral';
  if (radiusLabel) radiusLabel.textContent = 'Medium';
  if (fontLabel) fontLabel.textContent = 'Inter';
  updateColorDot(baseColorDot, 'neutral');
  updateColorDot(primaryColorDot, 'neutral', true);
  updateTheme();
  showToast('Reset!');
});

// Shuffle theme
shuffleBtn?.addEventListener('click', () => {
  // Pick random values
  const randomBaseColor = baseColorOptions[Math.floor(Math.random() * baseColorOptions.length)];
  const randomPrimaryColor = primaryColorOptions[Math.floor(Math.random() * primaryColorOptions.length)];
  const randomRadius = radiusOptions[Math.floor(Math.random() * radiusOptions.length)];
  const randomFont = fontOptions[Math.floor(Math.random() * fontOptions.length)];
  
  // Update state
  state.style = 'bearnie'; // Keep style as custom
  state.baseColor = randomBaseColor.value;
  state.primaryColor = randomPrimaryColor.value;
  state.radius = randomRadius.value;
  state.font = randomFont.value;
  
  // Update labels
  if (styleLabel) styleLabel.textContent = 'Custom';
  if (styleIcon) styleIcon.setAttribute('rx', '3');
  if (baseColorLabel) baseColorLabel.textContent = randomBaseColor.name;
  if (primaryColorLabel) primaryColorLabel.textContent = randomPrimaryColor.name;
  if (radiusLabel) radiusLabel.textContent = randomRadius.name;
  if (fontLabel) fontLabel.textContent = randomFont.name;
  
  // Update color dots
  updateColorDot(baseColorDot, randomBaseColor.value);
  updateColorDot(primaryColorDot, randomPrimaryColor.value, true);
  
  updateTheme();
  showToast('Shuffled!');
});

// Init
function init() {
  const params = new URLSearchParams(window.location.search);
  if (params.toString()) {
    const decoded = paramsToState(params);
    Object.assign(state, decoded);
    
    // Update style label and icon
    const styleName = styleOptions.find(s => s.value === state.style)?.name || 'Bearnie';
    if (styleLabel) styleLabel.textContent = styleName;
    if (styleIcon) styleIcon.setAttribute('rx', styleIconRx[state.style] || '3');
    
    // Update color labels
    const baseColorName = baseColorOptions.find(c => c.value === state.baseColor)?.name || 'Neutral';
    const primaryColorName = primaryColorOptions.find(c => c.value === state.primaryColor)?.name || 'Neutral';
    if (baseColorLabel) baseColorLabel.textContent = baseColorName;
    if (primaryColorLabel) primaryColorLabel.textContent = primaryColorName;
    
    // Update radius and font labels
    if (radiusLabel) radiusLabel.textContent = radiusNames[state.radius] || 'Medium';
    if (fontLabel) {
      const fontName = fontOptions.find(f => f.value === state.font)?.name || 'Inter';
      fontLabel.textContent = fontName;
    }
    
    // Update color dots
    updateColorDot(baseColorDot, state.baseColor);
    updateColorDot(primaryColorDot, state.primaryColor, true);
  }
  updateTheme();
}

// Watch for dark mode changes
new MutationObserver(() => updateTheme()).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

init();

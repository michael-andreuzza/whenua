#!/usr/bin/env node
import prompts from "prompts";
import pc from "picocolors";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Brand colors
const amber = (text: string) => pc.yellow(text);
const logo = `${amber("🐻")} ${pc.bold("bearnie")}`;

// Terminal hyperlink (OSC 8) - works in most modern terminals
const link = (text: string, url: string) =>
  `\u001B]8;;${url}\u0007${pc.cyan(text)}\u001B]8;;\u0007`;

// Theme config interface
interface ThemeConfig {
  primaryHue: number;
  destructiveHue: number;
  successHue: number;
  warningHue: number;
  infoHue: number;
  neutralHue: number;
  radius: number;
  font: "inter" | "geist";
}

// Parse --theme flag from arguments
function parseThemeArg(): string | null {
  const themeArg = process.argv.find((arg) => arg.startsWith("--theme="));
  if (!themeArg) return null;
  // Use indexOf + slice instead of split to preserve = chars in base64 padding
  const equalIndex = themeArg.indexOf("=");
  let value = themeArg.slice(equalIndex + 1);
  // Remove surrounding quotes if present (some shells may pass them through)
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

// Parse --full flag
function parseFullArg(): boolean {
  return process.argv.includes("--full");
}

// Registry base URL
const REGISTRY_URL = "https://bearnie.dev/registry";

// Component list for full install
const COMPONENT_NAMES = [
  "accordion", "alert", "alert-dialog", "aspect-ratio", "avatar",
  "badge", "breadcrumb", "button", "button-group", "card", "carousel",
  "checkbox", "collapsible", "command", "context-menu", "dialog",
  "dropdown-menu", "empty", "file-upload", "hover-card", "input",
  "input-group", "input-otp", "kbd", "label", "menubar", "pagination",
  "popover", "progress", "radio", "scroll-area", "select", "separator",
  "sheet", "sidebar", "skeleton", "slider", "spinner", "stepper",
  "switch", "table", "tabs", "textarea", "toast", "toggle", "tooltip", "tree"
];

// Fetch component from registry
async function fetchComponent(name: string): Promise<{ files: { name: string; content: string }[] } | null> {
  try {
    const response = await fetch(`${REGISTRY_URL}/${name}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch utility from registry
async function fetchUtility(name: string): Promise<{ files: { name: string; content: string }[] } | null> {
  try {
    const response = await fetch(`${REGISTRY_URL}/${name}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Extract hash from theme URL
function extractThemeHash(themeUrl: string): string | null {
  try {
    const hashIndex = themeUrl.indexOf("#");
    if (hashIndex === -1) return null;
    return themeUrl.slice(hashIndex + 1);
  } catch {
    return null;
  }
}

// Decode theme config from base64 hash
function decodeThemeConfig(hash: string): ThemeConfig | null {
  try {
    const decoded = Buffer.from(hash, "base64").toString("utf-8");
    return JSON.parse(decoded) as ThemeConfig;
  } catch {
    return null;
  }
}

// Generate oklch color string
function oklch(l: number, c: number, h: number): string {
  return `oklch(${l} ${c} ${h})`;
}

// Generate custom CSS from theme config
function generateThemeCSS(config: ThemeConfig): string {
  const radiusRem = config.radius / 16;
  const fontFamily =
    config.font === "geist" ? "'Geist', sans-serif" : "Inter, sans-serif";
  const neutralChroma = config.neutralHue > 0 ? 0.01 : 0;

  // Light mode primary
  const lightPrimary =
    config.primaryHue === 0
      ? "oklch(0.205 0 0)"
      : oklch(0.55, 0.2, config.primaryHue);
  const lightPrimaryFg = "oklch(0.985 0 0)";

  // Dark mode primary
  const darkPrimary =
    config.primaryHue === 0
      ? "oklch(0.985 0 0)"
      : oklch(0.7, 0.2, config.primaryHue);
  const darkPrimaryFg = "oklch(0.205 0 0)";

  return `@import "tailwindcss";
@plugin "@tailwindcss/forms";

@theme {
  /* Typography */
  --font-sans: ${fontFamily};
  --font-mono: Geist Mono, monospace;

  /* Border Radius - Base: ${radiusRem}rem */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

@theme inline {
  /* Semantic Colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  /* Sidebar Colors */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: ${radiusRem}rem;
  --background: ${oklch(1, neutralChroma, config.neutralHue)};
  --foreground: ${oklch(0.145, neutralChroma, config.neutralHue)};
  --card: ${oklch(1, neutralChroma, config.neutralHue)};
  --card-foreground: ${oklch(0.145, neutralChroma, config.neutralHue)};
  --popover: ${oklch(1, neutralChroma, config.neutralHue)};
  --popover-foreground: ${oklch(0.145, neutralChroma, config.neutralHue)};
  --primary: ${lightPrimary};
  --primary-foreground: ${lightPrimaryFg};
  --secondary: ${oklch(0.97, neutralChroma, config.neutralHue)};
  --secondary-foreground: ${oklch(0.205, neutralChroma, config.neutralHue)};
  --muted: ${oklch(0.97, neutralChroma, config.neutralHue)};
  --muted-foreground: ${oklch(0.556, neutralChroma, config.neutralHue)};
  --accent: ${oklch(0.97, neutralChroma, config.neutralHue)};
  --accent-foreground: ${oklch(0.205, neutralChroma, config.neutralHue)};
  --destructive: ${oklch(0.577, 0.245, config.destructiveHue)};
  --destructive-foreground: ${oklch(0.577, 0.245, config.destructiveHue)};
  --success: ${oklch(0.564, 0.168, config.successHue)};
  --success-foreground: ${oklch(0.564, 0.168, config.successHue)};
  --warning: ${oklch(0.681, 0.15, config.warningHue)};
  --warning-foreground: ${oklch(0.681, 0.15, config.warningHue)};
  --info: ${oklch(0.609, 0.202, config.infoHue)};
  --info-foreground: ${oklch(0.609, 0.202, config.infoHue)};
  --border: ${oklch(0.922, neutralChroma, config.neutralHue)};
  --input: ${oklch(0.922, neutralChroma, config.neutralHue)};
  --ring: ${oklch(0.708, neutralChroma, config.neutralHue)};
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  /* Sidebar */
  --sidebar: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --sidebar-foreground: ${oklch(0.145, neutralChroma, config.neutralHue)};
  --sidebar-primary: ${lightPrimary};
  --sidebar-primary-foreground: ${lightPrimaryFg};
  --sidebar-accent: ${oklch(0.97, neutralChroma, config.neutralHue)};
  --sidebar-accent-foreground: ${oklch(0.205, neutralChroma, config.neutralHue)};
  --sidebar-border: ${oklch(0.922, neutralChroma, config.neutralHue)};
  --sidebar-ring: ${oklch(0.708, neutralChroma, config.neutralHue)};
}

.dark {
  --background: ${oklch(0.145, neutralChroma, config.neutralHue)};
  --foreground: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --card: ${oklch(0.145, neutralChroma, config.neutralHue)};
  --card-foreground: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --popover: ${oklch(0.145, neutralChroma, config.neutralHue)};
  --popover-foreground: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --primary: ${darkPrimary};
  --primary-foreground: ${darkPrimaryFg};
  --secondary: ${oklch(0.269, neutralChroma, config.neutralHue)};
  --secondary-foreground: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --muted: ${oklch(0.269, neutralChroma, config.neutralHue)};
  --muted-foreground: ${oklch(0.708, neutralChroma, config.neutralHue)};
  --accent: ${oklch(0.269, neutralChroma, config.neutralHue)};
  --accent-foreground: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --destructive: ${oklch(0.65, 0.245, config.destructiveHue)};
  --destructive-foreground: oklch(0.985 0 0);
  --success: ${oklch(0.634, 0.168, config.successHue)};
  --success-foreground: oklch(0.985 0 0);
  --warning: ${oklch(0.785, 0.15, config.warningHue)};
  --warning-foreground: oklch(0.985 0 0);
  --info: ${oklch(0.701, 0.202, config.infoHue)};
  --info-foreground: oklch(0.985 0 0);
  --border: ${oklch(0.269, neutralChroma, config.neutralHue)};
  --input: ${oklch(0.269, neutralChroma, config.neutralHue)};
  --ring: ${oklch(0.439, neutralChroma, config.neutralHue)};
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);

  /* Sidebar */
  --sidebar: ${oklch(0.205, neutralChroma, config.neutralHue)};
  --sidebar-foreground: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --sidebar-primary: ${config.primaryHue === 0 ? "oklch(0.488 0.243 264.376)" : oklch(0.7, 0.2, config.primaryHue)};
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: ${oklch(0.269, neutralChroma, config.neutralHue)};
  --sidebar-accent-foreground: ${oklch(0.985, neutralChroma, config.neutralHue)};
  --sidebar-border: ${oklch(0.269, neutralChroma, config.neutralHue)};
  --sidebar-ring: ${oklch(0.439, neutralChroma, config.neutralHue)};
}

/* Base styles */
* {
  border-color: var(--border);
}
`;
}

async function main() {
  // Parse flags
  const themeUrl = parseThemeArg();
  const fullInstall = parseFullArg();
  let themeConfig: ThemeConfig | null = null;

  if (themeUrl) {
    const hash = extractThemeHash(themeUrl);
    if (hash) {
      themeConfig = decodeThemeConfig(hash);
    }
  }

  console.log(`
  ${logo}

  ${amber("Hey!")} Let's create your Bearnie project.
${themeConfig ? `  ${pc.dim("Using custom theme from URL")}\n` : ""}${fullInstall ? `  ${pc.dim("Full install: including all components")}\n` : ""}
`);

  // Get project name from args (skip flags)
  let projectName = process.argv.find(
    (arg, index) => index >= 2 && !arg.startsWith("--")
  );

  if (!projectName) {
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: "my-bearnie-app",
      validate: (value) => {
        if (!value) return "Project name is required";
        if (!/^[a-z0-9-_]+$/i.test(value))
          return "Project name can only contain letters, numbers, hyphens, and underscores";
        return true;
      },
    });

    if (!response.projectName) {
      console.log(`\n  ${pc.yellow("Cancelled.")}\n`);
      process.exit(0);
    }

    projectName = response.projectName;
  }

  // At this point projectName is guaranteed to be a string
  const finalName = projectName as string;
  const targetDir = path.resolve(process.cwd(), finalName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `Directory ${pc.cyan(finalName)} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      console.log(`\n  ${pc.yellow("Cancelled.")}\n`);
      process.exit(0);
    }

    await fs.remove(targetDir);
  }

  // Copy template
  const templateDir = path.join(__dirname, "..", "template");
  
  console.log(`\n  ${pc.dim("Creating project in")} ${pc.cyan(targetDir)}\n`);

  await fs.copy(templateDir, targetDir);

  // Update package.json with project name
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.name = finalName;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // Apply custom theme if provided
  if (themeConfig) {
    const globalCssPath = path.join(targetDir, "src", "styles", "global.css");
    const customCSS = generateThemeCSS(themeConfig);
    await fs.writeFile(globalCssPath, customCSS);
    console.log(`  ${pc.green("✓")} Applied custom theme`);
  }

  // Install all components if --full flag is provided
  if (fullInstall) {
    console.log(`\n  ${pc.dim("Fetching components from registry...")}\n`);
    
    // Create directories
    await fs.ensureDir(path.join(targetDir, "src", "components", "ui"));
    await fs.ensureDir(path.join(targetDir, "src", "utils"));
    
    // Fetch and install focus-trap utility first
    const focusTrap = await fetchUtility("focus-trap");
    if (focusTrap?.files) {
      for (const file of focusTrap.files) {
        const filePath = path.join(targetDir, "src", file.name);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, file.content);
      }
      console.log(`  ${pc.green("✓")} Added focus-trap utility`);
    }
    
    // Create cn utility
    const cnContent = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
    await fs.writeFile(path.join(targetDir, "src", "utils", "cn.ts"), cnContent);
    console.log(`  ${pc.green("✓")} Added cn utility`);
    
    // Fetch and install all components
    let installed = 0;
    let failed = 0;
    
    for (const componentName of COMPONENT_NAMES) {
      const component = await fetchComponent(componentName);
      if (component?.files) {
        for (const file of component.files) {
          const filePath = path.join(targetDir, "src", file.name);
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, file.content);
        }
        installed++;
        process.stdout.write(`\r  ${pc.green("✓")} Installed ${installed}/${COMPONENT_NAMES.length} components`);
      } else {
        failed++;
      }
    }
    console.log(""); // New line after progress
    
    if (failed > 0) {
      console.log(`  ${pc.yellow("!")} ${failed} components failed to fetch`);
    }
    
    // Update package.json with additional dependencies
    const pkgPath2 = path.join(targetDir, "package.json");
    const pkg2 = await fs.readJson(pkgPath2);
    pkg2.dependencies = {
      ...pkg2.dependencies,
      "clsx": "^2.1.1",
      "tailwind-merge": "^3.3.0",
    };
    await fs.writeJson(pkgPath2, pkg2, { spaces: 2 });
    console.log(`  ${pc.green("✓")} Added component dependencies`);
  }

  // Create .gitignore
  await fs.writeFile(
    path.join(targetDir, ".gitignore"),
    `# Dependencies
node_modules/

# Build output
dist/

# Astro
.astro/

# Environment variables
.env
.env.*
!.env.example

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
`
  );

  console.log(`  ${pc.green("✓")} Created project files`);

  // Success message
  if (fullInstall) {
    console.log(`
  ${pc.green("Done!")} Your Bearnie project is ready with all components.

  ${pc.bold("Next steps:")}

    ${pc.dim("1.")} cd ${pc.cyan(finalName)}
    ${pc.dim("2.")} npm install
    ${pc.dim("3.")} npm run dev

  ${pc.dim("All components are in")} ${pc.cyan("src/components/ui/")}

  ${pc.dim("Browse components at")} ${link("bearnie.dev/docs/components", "https://bearnie.dev/docs/components")}

  ${pc.dim("Made by")} ${link("Michael", "https://michaelandreuzza.com")} ${pc.dim("at")} ${link("Lexington Themes", "https://lexingtonthemes.com")}
`);
  } else {
    console.log(`
  ${pc.green("Done!")} Your Bearnie project is ready.

  ${pc.bold("Next steps:")}

    ${pc.dim("1.")} cd ${pc.cyan(finalName)}
    ${pc.dim("2.")} npm install
    ${pc.dim("3.")} npx bearnie add button card
    ${pc.dim("4.")} npm run dev

  ${pc.dim("Or use")} ${pc.cyan("--full")} ${pc.dim("to include all components:")}
    npx create-bearnie my-app --full

  ${pc.dim("Browse components at")} ${link("bearnie.dev/docs/components", "https://bearnie.dev/docs/components")}

  ${pc.dim("Made by")} ${link("Michael", "https://michaelandreuzza.com")} ${pc.dim("at")} ${link("Lexington Themes", "https://lexingtonthemes.com")}
`);
  }
}

main().catch((err) => {
  console.error(`\n  ${pc.red("Error:")} ${err.message}\n`);
  process.exit(1);
});

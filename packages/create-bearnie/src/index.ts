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

async function main() {
  console.log(`
  ${logo}

  ${amber("Hey!")} Let's create your Bearnie project.
`);

  // Get project name from args or prompt
  let projectName = process.argv[2];

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

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `Directory ${pc.cyan(projectName)} already exists. Overwrite?`,
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
  pkg.name = projectName;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

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
  console.log(`
  ${pc.green("Done!")} Your Bearnie project is ready.

  ${pc.bold("Next steps:")}

    ${pc.dim("1.")} cd ${pc.cyan(projectName)}
    ${pc.dim("2.")} npm install
    ${pc.dim("3.")} npx bearnie add button card
    ${pc.dim("4.")} npm run dev

  ${pc.dim("Browse components at")} ${link("bearnie.dev/docs/components", "https://bearnie.dev/docs/components")}

  ${pc.dim("Made by")} ${link("Michael", "https://michaelandreuzza.com")} ${pc.dim("at")} ${link("Lexington Themes", "https://lexingtonthemes.com")}
`);
}

main().catch((err) => {
  console.error(`\n  ${pc.red("Error:")} ${err.message}\n`);
  process.exit(1);
});

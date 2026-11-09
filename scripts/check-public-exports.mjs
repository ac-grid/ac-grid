import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = resolve(root, "packages");
const publicPackages = {
    core: {
        sourceEntry: "src/index.ts",
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
        "./styles": "./dist/index.css",
    },
    "theme-base": {
        sourceEntry: "src/index.ts",
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    },
    "theme-default": {
        sourceEntry: "src/index.ts",
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    },
    react: {
        sourceEntry: "src/index.tsx",
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    },
    vue: {
        sourceEntry: "src/index.ts",
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    },
    angular: {
        sourceEntry: "src/index.ts",
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    },
    svelte: {
        sourceEntry: "src/AcGrid.svelte",
        ".": "./src/AcGrid.svelte",
    },
};
const failures = [];

for (const [packageDir, packageSpec] of Object.entries(publicPackages)) {
    const { sourceEntry, ...expectedExports } = packageSpec;
    const manifestPath = resolve(packagesDir, packageDir, "package.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const packageRoot = resolve(packagesDir, packageDir);
    if (!existsSync(resolve(packageRoot, sourceEntry))) {
        failures.push(`${manifest.name} is missing its public source entry: ${sourceEntry}`);
    }
    const actualExports = manifest.exports ?? {};
    for (const name of new Set([...Object.keys(expectedExports), ...Object.keys(actualExports)])) {
        if (!(name in expectedExports)) {
            failures.push(`${manifest.name} exposes unexpected public subpath ${name}`);
        } else if (!(name in actualExports)) {
            failures.push(`${manifest.name} is missing public subpath ${name}`);
        } else if (JSON.stringify(actualExports[name]) !== JSON.stringify(expectedExports[name])) {
            failures.push(
                `${manifest.name} export ${name} should be ${JSON.stringify(expectedExports[name])}, got ${JSON.stringify(actualExports[name])}`
            );
        }
    }
}

if (failures.length) {
    console.error("Public export check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
} else {
    console.log(`Public exports are valid for ${Object.keys(publicPackages).length} packages.`);
}

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = resolve(root, "packages");
const publicPackages = {
    core: {
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
        "./styles": "./dist/index.css",
    },
    "theme-base": {
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    },
    "theme-default": {
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    },
};
const failures = [];

for (const [packageDir, expectedExports] of Object.entries(publicPackages)) {
    const manifestPath = resolve(packagesDir, packageDir, "package.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const packageRoot = resolve(packagesDir, packageDir);
    const sourceEntry = resolve(packageRoot, "src/index.ts");
    if (!existsSync(sourceEntry)) {
        failures.push(`${manifest.name} is missing its public source entry: src/index.ts`);
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

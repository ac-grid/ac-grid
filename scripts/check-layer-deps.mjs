import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const allowedWorkspaceDeps = {
    "@ac-grid/theme-base": [],
    "@ac-grid/core": ["@ac-grid/theme-base"],
    "@ac-grid/theme-default": ["@ac-grid/theme-base"],
};
const failures = [];

for (const [name, allowed] of Object.entries(allowedWorkspaceDeps)) {
    const packageDir = name.split("/")[1];
    const manifest = JSON.parse(
        readFileSync(resolve(root, "packages", packageDir, "package.json"), "utf8")
    );
    const workspaceDeps = [manifest.dependencies, manifest.devDependencies]
        .flatMap((group) => Object.keys(group ?? {}))
        .filter((dependency) => dependency.startsWith("@ac-grid/"));
    for (const dependency of workspaceDeps) {
        if (!allowed.includes(dependency)) {
            failures.push(`${name} has disallowed workspace dependency ${dependency}`);
        }
    }
    for (const dependency of allowed) {
        if (!workspaceDeps.includes(dependency)) {
            failures.push(`${name} is missing required workspace dependency ${dependency}`);
        }
    }
}

if (failures.length) {
    console.error("Workspace dependency layer check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
} else {
    console.log("Workspace package dependencies follow the declared layers.");
}

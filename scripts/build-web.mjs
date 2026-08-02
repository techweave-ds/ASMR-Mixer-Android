/**
 * Builds the Noctune web app from its own repository and copies the
 * static export (out/) into Capacitor's webDir (www/).
 *
 * The web source lives in its own repo (techweave-ds/ASMR-Mixer) and is
 * never duplicated here. This script fetches it at a pinned ref, builds it,
 * and produces the assets the native app runs.
 *
 * Usage:
 *   node scripts/build-web.mjs                 # uses latest v* tag
 *   WEB_REF=main node scripts/build-web.mjs    # pinned branch/commit/tag
 *   WEB_REF=v1.0.0 node scripts/build-web.mjs
 */

import { execSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WEB_REPO = "https://github.com/techweave-ds/ASMR-Mixer.git";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, ".web-source");
const outDir = join(srcDir, "out");
const wwwDir = join(root, "www");

const ref = process.env.WEB_REF || (await latestTag(WEB_REPO)) || "main";

function sh(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

async function latestTag(repo) {
  try {
    const tags = execSync(`git ls-remote --tags --refs ${repo}`, { encoding: "utf8" })
      .split("\n")
      .map((line) => line.split("refs/tags/")[1])
      .filter(Boolean)
      .filter((t) => /^v?\d+\.\d+\.\d+$/.test(t))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return tags[tags.length - 1] || null;
  } catch {
    return null;
  }
}

console.log(`\n[build-web] Building web app at ref: ${ref}\n`);

if (existsSync(srcDir)) {
  console.log("[build-web] Updating existing clone...");
  sh(`git -C "${srcDir}" fetch --all --tags --prune`);
  sh(`git -C "${srcDir}" checkout ${ref}`);
} else {
  console.log("[build-web] Cloning web repo...");
  sh(`git clone --depth 1 --branch ${ref} ${WEB_REPO} "${srcDir}"`);
}

sh(`npm ci`, { cwd: srcDir });
sh(`npm run build`, { cwd: srcDir });

if (!existsSync(outDir)) {
  console.error("[build-web] Static export not found at " + outDir);
  process.exit(1);
}

console.log(`\n[build-web] Copying static export to ${wwwDir}...`);
rmSync(wwwDir, { recursive: true, force: true });
mkdirSync(wwwDir, { recursive: true });
cpSync(outDir, wwwDir, { recursive: true });
console.log("[build-web] Done.");

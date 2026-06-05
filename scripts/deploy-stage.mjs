import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = resolve(import.meta.dirname, "..");
const distDir = resolve(rootDir, "dist");
const deployDir = resolve(rootDir, ".deploy/pulseops-static");
const remote = "sasha@stage.dev:/srv/git/pulseops-static.git";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }

  return options.capture ? result.stdout.trim() : "";
}

const sourceRevision = run("git", ["rev-parse", "--short", "HEAD"], { capture: true });

rmSync(deployDir, { force: true, recursive: true });
mkdirSync(deployDir, { recursive: true });
cpSync(distDir, deployDir, { recursive: true });
writeFileSync(resolve(deployDir, ".source-revision"), `${sourceRevision}\n`, "utf8");

run("git", ["init", "-b", "main"], { cwd: deployDir });
run("git", ["add", "--all"], { cwd: deployDir });
run("git", ["commit", "-m", `Deploy PulseOps ${sourceRevision}`], { cwd: deployDir });
run("git", ["remote", "add", "stage", remote], { cwd: deployDir });
run("git", ["push", "--force", "stage", "main"], { cwd: deployDir });

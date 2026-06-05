import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = resolve(rootDir, "src/wasm/health.cpp");
const outputFile = resolve(rootDir, "src/wasm/health.js");

const homebrewPaths = [
  "/opt/homebrew/opt/python@3.12/libexec/bin",
  "/usr/local/opt/python@3.12/libexec/bin",
  "/opt/homebrew/bin",
  "/usr/local/bin"
];

const env = {
  ...process.env,
  PATH: `${homebrewPaths.join(":")}:${process.env.PATH ?? ""}`
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
  });

  if (result.status !== 0) {
    if (options.optional) {
      return null;
    }

    throw new Error(`${command} ${args.join(" ")} failed`);
  }

  return options.capture ? result.stdout.trim() : "";
}

function commandExists(command) {
  return spawnSync("sh", ["-lc", `command -v ${command}`], {
    env,
    encoding: "utf8",
    stdio: "ignore"
  }).status === 0;
}

function resolveCompiler() {
  if (process.platform === "darwin" && commandExists("brew")) {
    const prefix = run("brew", ["--prefix", "emscripten"], { capture: true, optional: true });
    const emccPy = prefix ? resolve(prefix, "libexec/emcc.py") : null;

    if (emccPy && existsSync(emccPy)) {
      const python = homebrewPaths
        .map((path) => resolve(path, "python3"))
        .find((candidate) => existsSync(candidate)) ?? "python3";

      return {
        command: python,
        args: [emccPy]
      };
    }
  }

  if (commandExists("emcc")) {
    return {
      command: "emcc",
      args: []
    };
  }

  throw new Error("Emscripten was not found. Install it with `brew install emscripten` or your Linux package manager.");
}

mkdirSync(dirname(outputFile), { recursive: true });

const compiler = resolveCompiler();
run(compiler.command, [
  ...compiler.args,
  sourceFile,
  "-O3",
  "-sMODULARIZE=1",
  "-sEXPORT_ES6=1",
  "-sENVIRONMENT=web",
  "-sSINGLE_FILE=1",
  "-sEXPORTED_FUNCTIONS=['_score_service','_incident_level','_risk_index']",
  "-o",
  outputFile
]);

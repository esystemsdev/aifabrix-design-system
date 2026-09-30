const FORBIDDEN_EVERYWHERE = [
  { pattern: /from\s+["']react-router(-dom)?["']/, reason: "router dependency" },
  { pattern: /from\s+["']@aifabrix\/miso-/, reason: "Miso SDK dependency" },
  { pattern: /from\s+["'][^"']*\/(services|contexts|hooks|style-guide)\//, reason: "application layer import" },
  { pattern: /AuthContext|usePermission/, reason: "application auth/permission code" },
  { pattern: /import\.meta\.env/, reason: "bundler-specific global" },
  { pattern: /process\.env/, reason: "bundler-specific global" },
];

const FORBIDDEN_IN_CORE = [{ pattern: /from\s+["']react(\/[^"']*)?["']/, reason: "React import in React-free core" }];

/**
 * @param {{ path: string, source: string }[]} files paths relative to the package root, POSIX separators
 * @returns {string[]} violations
 */
export function findContractViolations(files) {
  const violations = [];
  for (const { path, source } of files) {
    const rules = /^(src|dist)\/control-state\//.test(path)
      ? [...FORBIDDEN_EVERYWHERE, ...FORBIDDEN_IN_CORE]
      : FORBIDDEN_EVERYWHERE;
    for (const { pattern, reason } of rules) {
      if (pattern.test(source)) violations.push(`${path}: ${reason} (${pattern})`);
    }
  }
  return violations;
}

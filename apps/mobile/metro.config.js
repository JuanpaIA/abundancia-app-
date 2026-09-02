const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Merge Expo's default watchFolders with the monorepo workspace root so
// Metro can resolve shared src/ and packages/ without losing the defaults
// that expo-doctor expects (node_modules, packages/core, apps/mobile).
config.watchFolders = [
  ...new Set([...(config.watchFolders ?? []), workspaceRoot]),
];

// Resolve node_modules from the mobile package first, then fall back to
// workspace root. This lets pnpm's hoisted deps be found without symlink traversal.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Explicit module mapping for @lumina/core — bypasses symlink resolution entirely.
config.resolver.extraNodeModules = {
  '@lumina/core': path.resolve(workspaceRoot, 'packages/core/src'),
};

module.exports = config;

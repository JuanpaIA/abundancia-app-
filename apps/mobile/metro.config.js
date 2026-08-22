const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire workspace so Metro can resolve shared src/ and packages/
config.watchFolders = [workspaceRoot];

// Resolve node_modules from the mobile package first, then fall back to workspace root.
// This lets pnpm's hoisted deps be found without requiring symlink traversal.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Explicit module mapping for @lumina/core — bypasses symlink resolution entirely.
// TODO: when apps/mobile moves to its own root, verify this path stays correct.
config.resolver.extraNodeModules = {
  '@lumina/core': path.resolve(workspaceRoot, 'packages/core/src'),
};

// TODO(@app/*): add an alias here + matching tsconfig path when ../../../src/... relative
// imports become unwieldy (e.g. extraNodeModules['@app'] = path.resolve(workspaceRoot, 'src')).

module.exports = config;

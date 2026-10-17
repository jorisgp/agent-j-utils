import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [project, packagePath] = process.argv.slice(2);
if (!project || !packagePath) {
  throw new Error(
    'Usage: node scripts/next-release-version.mjs <project> <package-path>',
  );
}
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const versions = [
  JSON.parse(readFileSync(`${packagePath}/package.json`, 'utf8')).version,
  JSON.parse(git('show', `origin/main:${packagePath}/package.json`)).version,
  ...git('tag', '--list', `${project}@*`)
    .split('\n')
    .filter(Boolean)
    .map((tag) => tag.slice(project.length + 1)),
];
// Release preparation produces stable patch releases. Include tags even when
// the release branch was created from a develop branch with an older version.
const parsed = versions.map((version) => {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Expected a stable release version, received ${version}`);
  }
  return version.split('.').map(Number);
});
parsed.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
const [major, minor, patch] = parsed.at(-1);
console.log(`${major}.${minor}.${patch + 1}`);

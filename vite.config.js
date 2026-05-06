import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')
);

function repoWebBase(repoUrl) {
  if (!repoUrl || typeof repoUrl !== 'string') return '';
  let u = repoUrl.replace(/\.git$/u, '').trim();
  if (u.startsWith('git@github.com:')) {
    return `https://github.com/${u.slice('git@github.com:'.length)}`;
  }
  return u.replace(/^git\+/u, '');
}

const repoBase = repoWebBase(pkg.repository?.url);
const changelogUrl = repoBase ? `${repoBase}/blob/main/CHANGELOG.md` : '';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __CHANGELOG_URL__: JSON.stringify(changelogUrl)
  },
  plugins: [react()],
  build: {
    target: 'es2022',
    cssMinify: true,
    sourcemap: false
  }
});

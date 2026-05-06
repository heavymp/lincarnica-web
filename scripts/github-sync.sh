#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/bin:${PATH}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) not found. Put gh in PATH or install to ~/.local/bin/gh." >&2
  exit 1
fi

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh" 2>/dev/null || true
if ! grep -q '^github\.com' "${HOME}/.ssh/known_hosts" 2>/dev/null; then
  ssh-keyscan -t ed25519,rsa github.com 2>/dev/null >> "${HOME}/.ssh/known_hosts" || true
  chmod 644 "${HOME}/.ssh/known_hosts" 2>/dev/null || true
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Not logged in to GitHub." >&2
  echo "Run once:  npm run github:login" >&2
  echo "Then:      npm run github:setup-git" >&2
  echo "Or token:  echo YOUR_PAT | gh auth login --with-token -h github.com" >&2
  exit 1
fi

gh auth setup-git

NAME="$(node -p "require('./package.json').name" 2>/dev/null || basename "$ROOT")"
LOGIN="$(gh api user -q .login)"
URL_HTTPS="https://github.com/${LOGIN}/${NAME}.git"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Pushing to existing origin..."
  git push -u origin main
  exit 0
fi

if gh repo view "${LOGIN}/${NAME}" >/dev/null 2>&1; then
  echo "Repo exists on GitHub; adding origin and pushing..."
  git remote add origin "${URL_HTTPS}"
  git push -u origin main
  exit 0
fi

echo "Creating repo ${LOGIN}/${NAME} and pushing..."
gh repo create "${NAME}" --public --source=. --remote=origin --push

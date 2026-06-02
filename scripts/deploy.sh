#!/usr/bin/env bash
# Deploy wedding site to GitHub Pages (repo: sanjay-k598/kavyasanjay)
set -euo pipefail
cd "$(dirname "$0")/.."

MSG="${1:-Update wedding site}"
REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-main}"

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "Error: not a git repository. Run from Projects/wed."
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"
if [[ "$ROOT" != "$(pwd)" ]]; then
  echo "Error: git root is $ROOT — run from /Users/sanjaykumar/Projects/wed only."
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi

git commit -m "$MSG"
git push -u "$REMOTE" "$BRANCH"
echo ""
echo "Pushed to $REMOTE/$BRANCH"
echo "Live in 1–3 min: https://sanjay-k598.github.io/kavyasanjay/"

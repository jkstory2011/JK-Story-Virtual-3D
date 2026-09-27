#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
runtime_dir="$project_dir/.runtime/deskrpg"
upstream_commit="911069eac66267624c49c46e1f8efe7a49cf018a"

if [ ! -d "$runtime_dir/.git" ]; then
  mkdir -p "$project_dir/.runtime"
  git clone --filter=blob:none https://github.com/dandacompany/deskrpg.git "$runtime_dir"
fi

git -C "$runtime_dir" fetch origin "$upstream_commit"
git -C "$runtime_dir" checkout --detach "$upstream_commit"
cp -R "$project_dir/overlay/." "$runtime_dir/"
cd "$runtime_dir"
npm ci
echo "DeskRPG $upstream_commit + JKSTORY overlay ready."

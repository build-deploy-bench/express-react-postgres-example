#!/bin/sh
set -eu

install() {
  printf '%s\n' '::bench::install_start'
  npm ci
  printf '%s\n' '::bench::install_done'
}

build() {
  printf '%s\n' '::bench::build_start'
  npm run build -w frontend
  write_commit
  printf '%s\n' '::bench::build_done'
}

# The deployed commit comes from the build environment, so an old deployment keeps reporting its own commit.
# BENCH_COMMIT is the harness override (Fly passes it as a build arg); the others are provider variables.
write_commit() {
  commit="${BENCH_COMMIT:-${RENDER_GIT_COMMIT:-${RAILWAY_GIT_COMMIT_SHA:-${VERCEL_GIT_COMMIT_SHA:-}}}}"
  if [ -z "$commit" ]; then
    commit="$(git rev-parse HEAD 2>/dev/null || printf 'unknown')"
  fi
  printf '%s\n' "$commit" > backend/.build-commit
}

case "${1:-all}" in
  install) install ;;
  build) build ;;
  all) install; build ;;
  *) printf 'Usage: %s {install|build|all}\n' "$0" >&2; exit 2 ;;
esac

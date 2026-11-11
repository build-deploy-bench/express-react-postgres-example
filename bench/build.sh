#!/bin/sh
set -eu

# Each marker carries the wall-clock time in epoch milliseconds, so a parser does not depend on the time at which
# the provider received the log line. A `date` without %N (BusyBox) falls back to whole seconds.
mark() {
  now="$(date +%s%3N)"
  case "$now" in *[!0-9]*) now="$(date +%s)000" ;; esac
  printf '::bench::%s %s\n' "$1" "$now"
}

install() {
  mark install_start
  npm ci
  mark install_done
}

build() {
  mark build_start
  npm run build -w frontend
  write_commit
  mark build_done
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

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
  printf '%s\n' '::bench::build_done'
}

case "${1:-all}" in
  install) install ;;
  build) build ;;
  all) install; build ;;
  *) printf 'Usage: %s {install|build|all}\n' "$0" >&2; exit 2 ;;
esac

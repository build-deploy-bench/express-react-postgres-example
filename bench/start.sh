#!/bin/sh
# Start command for every provider. The start marker is printed before npm starts, so the time that npm needs to
# launch the app counts as app boot on every provider.
set -eu
cd "$(dirname "$0")/.."

# Each marker carries the wall-clock time in epoch milliseconds, so a parser does not depend on the time at which
# the provider received the log line. A `date` without %N (BusyBox) falls back to whole seconds.
mark() {
  now="$(date +%s%3N)"
  case "$now" in *[!0-9]*) now="$(date +%s)000" ;; esac
  printf '::bench::%s %s\n' "$1" "$now"
}

mark start
exec npm run start -w backend

# Build-deploy benchmark fixture: Node (Express + React + Postgres)

The provider IDs for this fixture are in the harness repo (`guides/fixtures.md` and `providers/*/setup-notes.md`).
This file lists only the changes to the app.

## Patches

1. `bench/build.sh {install|build|all}` prints the `::bench::` markers. Install is `npm ci`; build is the frontend Vite build.
2. `GET /version` returns `{"commit":"<sha>"}`. `bench/build.sh build` writes `backend/.build-commit` from the
   first value it finds in `BENCH_COMMIT`, `RENDER_GIT_COMMIT`, `RAILWAY_GIT_COMMIT_SHA` or `VERCEL_GIT_COMMIT_SHA`,
   then `git rev-parse HEAD`, and then `unknown`. The route does not query the database, but the server listens only
   after `sequelize.sync` succeeds.
3. `PROD_DB_URL` overrides the `PROD_DB_*` parts (Vercel with Neon, Fly). `PROD_DB_SSL=true` enables TLS for a host
   whose URL has no `sslmode`.
4. `Dockerfile.fly` and `Dockerfile.vercel` (identical below the header comment), `fly.toml` and `vercel.json`. Both
   Dockerfiles declare the build args `BENCH_COMMIT` and `VERCEL_GIT_COMMIT_SHA`.

## Commands

- Install: `./bench/build.sh install`. Build: `./bench/build.sh build`. Render runs `./bench/build.sh all`.
- Start: `npm run start -w backend`. Health path: `/api/tags`. Commit check: `/version`.
- Fly: `flyctl deploy --config fly.toml --app <app> --build-arg BENCH_COMMIT=<full sha>` from a clean `git archive`
  of the commit. Without `BENCH_COMMIT`, `/version` returns `unknown`.

## Fly smoke check

2026-11-10: `flyctl deploy --remote-only --depot=false --ha=false --build-arg BENCH_COMMIT=<sha>` of `1a42f0b` from a
`git archive`. The Machine was stopped since 2026-11-06, and the deploy updated it without a start; after
`flyctl machine start`, `/version` returned that SHA and `/api/tags` returned 200.

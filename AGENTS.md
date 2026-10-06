# Vizzo

ALWAYS USE `./docs/WHITTLE.md`.

Run `bun checks` before code change handoffs.
Treat validated env var types as accurate. Do not add null checks for required strings.
New dependencies use the latest compatible release; pin exact versions.
Use Conventional Commits for commit messages. Keep the subject under ~70 chars; add a body only when the why matters.
Use a 120 print width for code and documentation, unless the existing formatter configuration requires otherwise.
Use MCPProxy for MCP connections when it is available. Use T3 Code (`t3-code`) MCP tools directly, bypassing MCPProxy.
Use Git worktrees for isolated work; never clone a repo unless the user explicitly directs you to.
Reuse dev servers; stop only those you started this session by recorded PID; never `pkill`/`killall` or name/port kills.

## Routing

Load the smallest relevant doc set for the task:

- Open `./docs/PULL_REQUEST.md` when creating or reviewing PRs.
- Open `./docs/TYPESCRIPT.md` when editing TypeScript or JavaScript files.
- Open `./docs/TESTING.md` when editing tests, mocks, or test infrastructure.
- Open `./docs/GH_WORKFLOW.md` when editing `.github/workflows/*`.

## Naming

- `camelCase` for directories, files, and the default fallback.
- `PascalCase` for React components and class constructor files.
- `UPPER_SNAKE_CASE` for markdown files.
- Preserve framework-required filenames.
- Branch names use optional user initials, a ticket ID when available, and a short 3-4 word description.
  Never use AI model or framework names in branch names.

## Comments

- Do not add comments by default.
- Only explain non-obvious rules or constraints that code and types cannot make clear.
- Never narrate or restate the code. Keep necessary comments brief. When unsure, omit them.
- Remove outdated comments as part of the change you are making.
- PR/commit narration belongs in the PR body, not the source.

## Philosophy

Vizzo answers one question:

> How do I turn a TanStack Charts definition into a PNG, SVG, or WebP file?

It is not a charting library, a chart grammar, or a dashboard builder.

## Non-goals

Do not add unless explicitly requested: a competing chart specification, a
new chart DSL, a dashboard application, a visual editor, or anything that
requires a browser, Playwright, or Canvas at render time.

## Rules

- Use TypeScript, Bun, TanStack Charts, Zod, and Resvg.
- Rendering is a pure function of `(definition, width, height, format)`. Same
  input, same bytes, every time.
- `packages/core`'s JSON→TanStack hydration layer (`hydrate.ts`) is a 1:1
  encoding of TanStack's own mark and scale factory calls — same names, same
  options. If a change requires inventing a new field name that doesn't map
  to a real TanStack Charts call, it doesn't belong there.
- Keep startup fast and dependencies minimal; the CLI must run cold in a
  GitHub Action or a Discord bot without a warmup step.
- `packages/core/fonts/Roboto-Regular.ttf` is vendored because resvg-wasm
  cannot read the host's font directories; without it every `<text>` node is
  dropped from PNG and WebP. The CLI build bundles the font and WASM files into
  `packages/cli/dist`; the Worker build inlines the font.
- The published `vizzo` package must work under plain Node, not just Bun.
  Anything it does at runtime (loading the resvg/webp `.wasm` files, in
  particular) has to survive `bun build --target=node` and execution with
  `node`.

## Repository layout

- `packages/schemas` — Zod envelope schema for `{ definition, width, height,
format, theme, preset, background }` and the JSON chart-definition shapes.
- `packages/core` — `render()`: hydrates a JSON definition into a TanStack
  Charts scene, serializes it to SVG, and rasterizes to PNG/WebP with resvg.
- `packages/cli` — the published `vizzo` package: the `vizzo` binary and the
  `render()` re-export for `import { render } from 'vizzo'`.
- `packages/e2e` — everything that exercises the CLI end to end: the source
  chart definitions (`charts/*.json`), the script that renders them into
  `examples/*.svg` and `docs/public/examples/`, the visual regression test with
  its committed `baselines/*.png`, and the Storybook that shows each example
  rendered live by TanStack Charts beside the PNG vizzo produced from the same
  JSON.
- `docs` — the vizzo.dev marketing site (TanStack Start on Cloudflare Workers).

## Code

Keep Vizzo small. Follow KISS, YAGNI, and AHA.

- Do not commit or push while any check fails; fix the findings instead of suppressing them.
- Create worktrees at `.worktrees/<task>` and locally ignore `.worktrees/` in `.git/info/exclude` before creating one.

## Docs site (Tailwind CSS v4)

- Always use Tailwind CSS v4 syntax and conventions.
- Write responsive styles mobile-first: base classes target mobile, then add
  `sm:`, `md:`, `lg:`, etc. only as needed.
- Prefer Tailwind utilities over custom CSS.
- Prefer `size-4` over `w-4 h-4`, `inset-0` over `top-0 right-0 bottom-0
left-0`, and `grow`/`shrink` over verbose flex equivalents.
- Avoid arbitrary values unless the design genuinely requires them.
- When a route component grows beyond ~75 lines or contains multiple visual
  sections, extract those sections into `src/components`.

## Releasing

`vizzo` (`packages/cli`) is the only published package; `@vizzo/core`,
`@vizzo/schemas`, and `@vizzo/e2e` are private workspace-only and get
bundled into it at build time.

Cut a release by running the **Release** workflow from GitHub Actions
(`workflow_dispatch`, must be run from `main`). It:

1. Runs `bun run check`.
2. Determines the version bump (patch/minor/major) from Conventional Commits
   since the last `v*` tag and bumps `packages/cli/package.json` accordingly
   — there is no manual bump choice.
3. Commits the version bump, tags it, and pushes both to `main`.
4. Creates a GitHub release with the generated changelog.
5. Builds `packages/cli` and publishes it to npm.

The npm publish step needs an `NPM_TOKEN` repository secret (an npm
automation token with publish rights for the `vizzo` package).

A release is skipped automatically when there are no releasable commits
(only `chore`/`docs`/etc. since the last tag).

When uncertain, choose the smaller implementation.

# AGENTS.md

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
  dropped from PNG and WebP. `packages/cli`'s build copies it to
  `packages/cli/fonts` (generated, git-ignored, published).
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

- Prefer readable functional code over clever indirection.
- Use `function` for top-level declarations and arrow functions for callbacks.
- Prefer `type` over `interface`, named exports, and unions over enums.
- Do not add comments that restate the code.
- Avoid type assertions (`as`) whenever possible. Where JSON input crosses
  into TanStack's generically-typed API (see `hydrate.ts`), a narrow, commented
  assertion at that boundary is acceptable — keep it there, not scattered.
- Prefer duplication over premature abstraction; keep comments rare.
- Inline one- and two-line logic; extract only when it removes complexity or
  improves testability.
- Add regression tests for bugs when practical.
- Use Conventional Commits: `type(scope): subject`.
- Run `bun run check` before committing or pushing changes.
- Do not commit or push while any check fails; fix the findings instead of
  suppressing them.
- Create Git worktrees at `.worktrees/<task>` inside the repository. Ensure
  `.worktrees/` is locally ignored in `.git/info/exclude` before creating one.

## Naming

- `camelCase` for directories, files, and the default fallback.
- `PascalCase` for React components.
- `UPPER_SNAKE_CASE` for markdown files.
- Branch naming: use a short description of the change; never use an AI
  model or framework name like `codex` or `claude`.

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

## Testing

- Prefer behavior tests through public interfaces (`render()`, the CLI's
  `runRender()`), not internal hydration details.
- Tests are colocated next to source (`*.test.ts`).
- Regenerate `examples/*.svg` and `docs/public/examples/*.svg` with
  `bun run --cwd packages/e2e render` after changing an example
  definition; don't hand-edit generated SVGs.
- Visual changes are caught by `packages/e2e/src/visual.test.ts`, which
  renders every `charts/*.json` to PNG and pixel-diffs it against
  `baselines/*.png`. A failure writes the diff to `packages/e2e/.diffs/`.
  Look at that image first; only run `bun run --cwd packages/e2e baseline`
  once the new rendering is the intended one, and commit the changed baselines
  with the change that caused them.
- `bun run --cwd packages/e2e storybook` shows each example rendered live by
  TanStack Charts beside the vizzo PNG, side by side or as a difference
  overlay. The browser render is the reference: where the two disagree,
  `hydrate.ts` or the SVG serializer is wrong, not the browser.

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

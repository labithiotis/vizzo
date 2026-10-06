# Testing

## Shared rules

- Prefer behaviour tests through public interfaces.
- Mock system boundaries rather than your own modules, unless the seam is external or non-deterministic. Do not mock the
  module under test.
- Keep unit and integration tests off the real network, except for explicitly documented local infrastructure.
- Preserve meaningful assertions. Fix the implementation or mocks instead of weakening tests to make them pass.
- When the repository has `.agents/skills/test-summary/SKILL.md`, use it for test behaviour summaries.

## Picking a seam

- Use unit tests for pure logic.
- Use integration tests for request, data, and persistence flows.
- Use E2E for critical UI journeys that cannot be proven lower in the stack.

## Project tooling and conventions

Use Bun test. Add regression tests for bugs when practical.

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

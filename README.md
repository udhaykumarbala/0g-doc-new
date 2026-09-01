# 0G Documentation

Source for [docs.0g.ai](https://docs.0g.ai), the documentation for 0G: chain, storage, data availability, compute, and the developer hub. Built with [Docusaurus 3](https://docusaurus.io) and deployed on Vercel.

## Quick start

Requirements: Node 24 (pinned in `.nvmrc`, minimum 22 per `package.json`) and pnpm 11 (pinned via the `packageManager` field; do not use yarn or npm, the lockfile is `pnpm-lock.yaml`).

```bash
nvm use                          # picks up .nvmrc
corepack enable                  # activates the pinned pnpm
pnpm install --frozen-lockfile   # same as CI
pnpm start                       # dev server with live reload
```

Other commands:

```bash
pnpm build       # production build into build/; fails on broken internal links
pnpm serve       # serve the built site
pnpm typecheck   # TypeScript check (CI runs this)
pnpm clear       # clear the Docusaurus cache when builds get weird
```

If `pnpm install` aborts with `ERR_PNPM_IGNORED_BUILDS` or a blocked git dependency, see the pnpm notes in [AGENTS.md](AGENTS.md): the fixes live in `pnpm-workspace.yaml` and must not be removed.

## Repository layout

| Path | What it is |
|------|------------|
| `docs/` | All content, as Markdown/MDX. A file at `docs/concepts/chain.md` is served at `/concepts/chain` (docs are at the site root, not under `/docs`). |
| `sidebars.ts` | Hand-curated sidebar. Adding, moving, or renaming a doc requires an update here. |
| `src/` | Site code: custom CSS, React components (for example the add-network wallet buttons), and Docusaurus plugins. |
| `static/` | Static assets copied as is (images, animations, `robots.txt`). |
| `docusaurus.config.ts` | Site configuration, navbar, footer, plugins, analytics gating. |
| `vercel.json` | Production redirects and security headers. Old URLs that move need a redirect here. |
| `.cspell.json` | Project dictionary for the spell check that runs in CI. New product or protocol terms go in `words`. |
| `docs/ai-context.md` | Consolidated network configs, addresses, SDK names, and endpoints for AI coding assistants. Keep it in sync when those change anywhere else. |

The site also publishes every page as raw Markdown (append `.md` to a page URL) plus `llms.txt` and `llms-full.txt` at the root, for LLM tooling.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution process, writing guidelines, and review expectations. [AGENTS.md](AGENTS.md) holds the working notes that both humans and AI coding agents rely on: commands, architecture, conventions, and deployment details.

Open pull requests from a feature branch into `main`, one change per PR. CI builds the site, checks links against production routing, and runs the spell check.

## Deployments

| Branch | Environment |
|--------|-------------|
| `main` | Production, [docs.0g.ai](https://docs.0g.ai) |
| `staging` | [staging.docs.0g.ai](https://staging.docs.0g.ai), a preview environment kept `noindex`; not a release source |
| any PR | Ephemeral Vercel preview URL |

## Community

- [Discord](https://discord.gg/0glabs)
- [X](https://x.com/0g_Labs)
- [GitHub issues](https://github.com/0gfoundation/0g-doc/issues) for documentation bugs and requests

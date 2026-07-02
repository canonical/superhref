# Contributing to superhref

Thanks for your interest in contributing! This document explains how to get
set up and what we expect from contributions.

## Code of Conduct

This project is governed by the [Ubuntu Code of Conduct](https://ubuntu.com/community/ethos/code-of-conduct).
By participating, you are expected to uphold it.

## Contributor License Agreement

Canonical projects require contributors to sign the
[Canonical contributor agreement](https://ubuntu.com/legal/contributors), the
simplest way for you to give us permission to use your contributions.

## Getting started

1. Fork and clone the repository.
2. This project uses [pnpm](https://pnpm.io/). If you don't have it, enable it
   with `corepack enable` (bundled with Node.js).
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Make your changes on a feature branch.

## Before you open a pull request

Please make sure the full check suite passes locally:

```bash
pnpm check   # Biome lint + format check and TypeScript type-check
pnpm test
pnpm build
```

To automatically apply Biome's formatting and safe lint fixes, run
`pnpm check:fix`.

## Commit and pull request guidelines

- Keep commits focused and write clear, descriptive commit messages.
- Reference any related issues in the pull request description.
- Add or update tests for any behavioural change.
- Update the documentation (including the README) when relevant.

## Reporting issues

Please use the [issue tracker](https://github.com/canonical/superhref/issues)
to report bugs or request features. Include reproduction steps and the version
you are using.

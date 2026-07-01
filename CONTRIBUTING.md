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
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes on a feature branch.

## Before you open a pull request

Please make sure the full check suite passes locally:

```bash
npm run check   # Biome lint + format check and TypeScript type-check
npm test
npm run build
```

To automatically apply Biome's formatting and safe lint fixes, run
`npm run check:fix`.

## Commit and pull request guidelines

- Keep commits focused and write clear, descriptive commit messages.
- Reference any related issues in the pull request description.
- Add or update tests for any behavioural change.
- Update the documentation (including the README) when relevant.

## Reporting issues

Please use the [issue tracker](https://github.com/canonical/superhref/issues)
to report bugs or request features. Include reproduction steps and the version
you are using.

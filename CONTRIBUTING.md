# Contributing

Thanks for wanting to contribute! This project follows a lightweight contribution workflow.

1) Issue first

- Open an issue to discuss larger changes or feature requests before starting work. Include screenshots or reproduction steps for bugs.

2) Branches and commits

- Create a branch from `main`: `git checkout -b feat/brief-description` or `fix/short-desc`.
- Keep commits small and focused. Use present-tense, imperative commit messages (e.g., "Add exercise filter UI").

3) Code style

- TypeScript is used across the repo. Keep types strict where sensible.
- Follow existing project patterns (components in `src/components`, actions in `src/lib`).
- Run the linter before opening a PR: `npm run lint`.

4) Pull requests

- Open a PR against `main` and include a short description of the change and any testing notes.
- Link related issues (e.g., "Fixes #123").
- Maintain reviewers' feedback — update your branch and push additional commits rather than force-pushing a replacement.

5) Tests & manual verification

- The repo doesn't include a test suite yet; add tests where appropriate and document how to run them in your PR.
- Manually verify features locally by running `npm run dev` and following the UI path you changed.

6) Security & secrets

- Do not commit secrets or `SUPABASE_SERVICE_ROLE_KEY` to the repository. Use environment variables and secret management in CI/CD and hosting.

7) Small contributions

- For docs, typo fixes, or small UI tweaks, a short PR is fine. Label it clearly and provide context in the description.

Maintainers may suggest changes or request modifications before merging. Thank you for contributing!

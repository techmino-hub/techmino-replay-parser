# Publish Checklist

Things to check before publishing using `npm publish`:

- Bump version number in `package.json`
- Check for dependency updates using `deno outdated`
- Run linter and tests: `deno run check` `bun test`
- Build: `deno run build`
- Check browser functionality: `demo-b64.html` `demo-file.html`
- Review `dist/index.d.ts` for correctness and missing docs
- Commit and wait for CI/CD to pass
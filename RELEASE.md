# Release process

(See also [obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin))

1. Update `manifest-beta.json` and `package.json` with the new version number
2. `npm run build`
3. Tag the new version (GitHub Actions will automatically create a release)

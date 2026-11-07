# Site icons

`public/favicon.svg` is a green dragonfly on the site's cream background,
reflecting the Libélula name and existing dragonfly branding. The checked-in
exports replace the wide promotional image previously used as a favicon.

- `favicon.png`: 96 × 96 for browsers and search results.
- `favicon.ico`: 16, 32, 48, and 96px frames.
- `apple-touch-icon.png`: 180 × 180 for mobile bookmarks.
- `icon-192.png` and `icon-512.png`: web manifest icons.

The root HTML declares stable PNG/ICO URLs; Vite copies the public assets during
`npm run build`. Google controls recrawl timing and search-result display.

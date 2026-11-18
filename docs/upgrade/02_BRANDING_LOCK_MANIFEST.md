# Branding lock manifest

Phases 2–9 development verification recomputed all seven digests before and after edits. All matched this manifest and the original ZIP.

## Follow-up verification

Recomputed SHA-256 for all seven files and compared their bytes against the original ZIP. All seven matched both the manifest and the archive. A separate GitHub branch contains an additional image path, `public/pump-token-sm.png`. It is outside the main/ZIP branding baseline and was left untouched.

All seven archive image assets are locked by exact path and byte digest. Dimensions and formats were decoded with Pillow. Keep the existing bytes and file names throughout the project.

| Path | Format | Dimensions | Bytes | SHA-256 |
|---|---|---|---:|---|
| `public/android-chrome-192x192.png` | PNG | 192×192 | 52071 | `1024baffdaa316b8c106735e4bc9927ee22dbd1e4c0c1b1b371dcf3d41feec94` |
| `public/android-chrome-512x512.png` | PNG | 512×512 | 309015 | `9049fd9daadb37ad8f157f2daf87f974163c80bfd425eb5f388d3e6d89b6494b` |
| `public/apple-touch-icon.png` | PNG | 180×180 | 46822 | `cb31160665ff5323f76acc34bee6870416cab4c384dfac61a5cf21e10c736f40` |
| `public/favicon-16x16.png` | PNG | 16×16 | 802 | `ec1548a06216ad82a12276ef62a1ffe2a0d341c3463ca809ab15dca8c114fd06` |
| `public/favicon-32x32.png` | PNG | 32×32 | 2378 | `6a626ec8763324386d0ddbf90b19db86981cf866900aac0ef8814a9dc592ccd2` |
| `public/favicon.ico` | ICO | 16×16, 32×32, 48×48 | 15406 | `af4bacfb1c753a48b926f50469e826383190965162c5a1daafb4ebcb38cd8e4b` |
| `public/pump-token.png` | JPEG | 1024×1024 | 66405 | `81acef054bd58f4a5a841c598ad2be3b6d1e128c4ecf21d159d8b558ffcd7b1e` |

`pump-token.png` is JPEG-encoded. It is the main logo, token image, navigation and loader mark, tokenomics/background art, footer/community art, Three.js texture source and Open Graph/Twitter image. The orb tiles the file into a texture at runtime. The same file also supplies tokenomics canvas graphics. Open Graph currently declares 1200×630 for an actual square 1024×1024 asset.

The layout references the ICO, 32 px favicon and Apple touch icon. The web manifest references both Android icons. The 16 px PNG exists without an active explicit layout reference. CSS noise and procedural motion contain no separate logo files. Verify with `Get-FileHash -Algorithm SHA256 public/*` and compare this table before every approved release.

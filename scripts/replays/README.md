# Replays

The site's case study clips are HTML recordings, made with
[html-recording](https://www.npmjs.com/package/html-recording) (a devDependency). They are the real
page, replayed by `src/components/replay/`. They are never screen video.

```bash
npx html-recording setup                       # once: the Chromium it drives
npm run replays:record -- scripts/replays/<study>.mjs [clip] --base <app url> --out public/replays
npm run replays                                # Recording Studio on public/replays
```

- **One clip script per study** lives here (`rfp.mjs`, …), so clips survive the workspace that made
  them. Clip names carry the study folder (`rfp/tenancy-switch`): recordings land in
  `public/replays/<study>/` and their images, fonts and CSS in the shared `public/replays/assets/`.
- Most clips record other apps (DAISY, the prototypes repo), so the app has to be running locally.
  Each script says which branch and port.
- **Recording Studio** edits a take without changing it: zooms that follow the mouse, cuts, speed
  changes, highlights and captions, saved as `<name>.edit.json`. **Re-record** reruns the clip with a
  different cursor speed or screen size. The site's players don't read edit files yet, so use
  "Copy for the portfolio" to get a reel scene (crop, zooms as camera keyframes, captions) for
  `src/content/`.

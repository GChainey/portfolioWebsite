// Styles for rrweb replays on the site. The replayer draws a recorded mouse track above the
// replay (above modal dialogs and iframes too); it is shown as the site's own arrow and click
// ring, only for recordings that have one (meta.mouse).
const ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 3l14 8.5-6.2 1.4L16.5 20l-2.8 1.3-3.6-7.1L5 18z' fill='%23111' stroke='%23fff' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E")`

export const REPLAY_CSS = `
  .rr-stage .replayer-wrapper { position: relative; }
  .rr-stage .replayer-wrapper > iframe { border: none; display: block; pointer-events: none; }
  .rr-stage .replayer-mouse-tail { display: none; }
  .rr-stage .replayer-mouse { display: none; }
  .rr-stage.rr-mouse .replayer-mouse {
    display: block; position: absolute; z-index: 10; width: 22px; height: 22px; margin: -3px 0 0 -4px; pointer-events: none;
    background: ${ARROW} no-repeat center / contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
    transition: left .05s linear, top .05s linear;
  }
  .rr-stage.rr-mouse .replayer-mouse::after {
    content: ''; position: absolute; left: 4px; top: 3px; width: 28px; height: 28px; border-radius: 50%;
    background: rgba(17,17,17,.2); opacity: 0; transform: translate(-50%, -50%) scale(.4);
  }
  .rr-stage.rr-mouse .replayer-mouse.active::after { animation: rr-click .35s ease-out; }
  @keyframes rr-click { from { opacity: 1; transform: translate(-50%, -50%) scale(.4) } to { opacity: 0; transform: translate(-50%, -50%) scale(1.5) } }
`

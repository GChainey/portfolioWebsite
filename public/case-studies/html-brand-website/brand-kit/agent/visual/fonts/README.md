# fonts

`DECIDE` (Decision #9). Default: Inter for body, Inter Tight for display,
JetBrains Mono for code. The other stack in use today is Geist and Geist Mono.

The default fonts load from Google Fonts through `../colors_and_type.css`, so
there are no files here yet. All of them use the SIL Open Font Licence. Once
Decision #9 is closed, put the font files (OTF or WOFF2) in this folder and switch
the CSS to `@font-face`. Agents working offline can then use them too.

| Role | Family | Weights | Licence |
| --- | --- | --- | --- |
| Body | Inter | 400, 500, 600, 700 | OFL |
| Display | Inter Tight | 400, 500, 600, 700 | OFL |
| Code | JetBrains Mono | 400, 500 | OFL |

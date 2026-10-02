// Every round of feedback on the Add document dialog (AI Document Review),
// taken from ADD-DOCUMENT-LOG.md in the prototypes repo. Each round is one
// piece of feedback I gave the coding agent and what changed because of it.

export type RoundTheme = 'Words' | 'Layout' | 'Polish' | 'Preview' | 'State machine'

export interface Round {
  n: number
  title: string
  feedback: string
  changes: string[]
  theme: RoundTheme
}

export const ROUND_THEMES: RoundTheme[] = ['Words', 'Layout', 'Polish', 'Preview', 'State machine']

export const ROUNDS: Round[] = [
  {
    n: 1,
    title: 'Make every word earn its place',
    feedback: 'for every title every label, every description text, have a through line of why it\'s valuable to them',
    theme: 'Words',
    changes: [
      'Every AI setup step opens with a picture, what you\'re doing, why it helps, and a real example',
      'Every title, label, hint and empty state rewritten to say why it matters',
    ],
  },
  {
    n: 2,
    title: 'Show the document',
    feedback: 'try making this two column and showing in the second column a lo-fi document. i.e. drivers license … when we focus on a field, it can highlight the area',
    theme: 'Preview',
    changes: [
      'Two columns: the form on the left, a lo-fi sample of the document on the right',
      'Clicking into a rule lights up the part of the document it checks',
      'A driver\'s license and a medical certificate drawn as samples; anything else gets a plain page',
      'The Remove link becomes a quiet trash button',
      'Common rules offered as one-click chips',
    ],
  },
  {
    n: 3,
    title: 'Stop the dialog growing',
    feedback: 'as we add rules, have them added to a compact table, so that when we add more rules, we can scroll and not grow the dialog',
    theme: 'Layout',
    changes: [
      'Rules move into a compact table that scrolls after five rows',
      '"Add document type" becomes "Add document"',
      'Asterisks off the labels; the divider above Rules removed',
      'Field hints stay under the field, as shadcn does',
    ],
  },
  {
    n: 4,
    title: 'Grey footers, everywhere',
    feedback: 'copy vercel and make our footer grey in dialogs like we do in our cards',
    theme: 'Polish',
    changes: ['Every dialog\'s footer becomes a grey bar, Cancel on the left, action on the right'],
  },
  {
    n: 5,
    title: 'Proper split layout',
    feedback: 'the header title is actually part of the main content column … Close is part of the second column … fill the height of the second column grey',
    theme: 'Layout',
    changes: ['Title and form in the left column; Close and the sample in a full-height grey right column'],
  },
  {
    n: 6,
    title: 'Generate the description',
    feedback: 'add a "Generate" button for description, small and in the bottom right of the field box',
    theme: 'Words',
    changes: ['A Generate button inside the Description box writes a description from the name'],
  },
  {
    n: 7,
    title: 'Eight small things at once',
    feedback: 'reduce the size of Rules label … shadcn default focus not blue … remove the ticks … "sample document" mono font … reduce the padding … rule suggestions a dropdown with a checkbox … add rules with a compact button inside the field … fix the position of the generate button',
    theme: 'Polish',
    changes: [
      'Rules label sized like the other labels',
      'Focus ring changed from blue to shadcn\'s neutral grey',
      'Green ticks removed from the sample',
      '"Sample document" in mono, top right',
      '8px less padding on the sample',
      'Common rules turned into a checkbox dropdown',
      'Add moved inside the field as a compact button',
      'Generate pinned 4px from the corner',
    ],
  },
  {
    n: 8,
    title: 'The table is the input',
    feedback: 'lets just use the table as our add rule … bottom row is always an add rule',
    theme: 'Layout',
    changes: ['The separate input is gone. The table\'s last row is always the add row, pinned while the rules above scroll'],
  },
  {
    n: 9,
    title: 'A state machine to review it in',
    feedback: 'lets put it in a state machine like we have for other ones so we can see the different pre loaded document types vs ones that aren\'t',
    theme: 'State machine',
    changes: [
      'New state machine page showing the real dialog in each state',
      'The dialog moved into its own file so the page and the app share it',
      'Errors made red and specific',
    ],
  },
  {
    n: 10,
    title: 'Put it where I can find it',
    feedback: 'put it on launchpad in state machine so i can access it',
    theme: 'State machine',
    changes: ['Committed, pushed and opened a PR so the hosted launch pad gets it on merge'],
  },
  {
    n: 11,
    title: 'Tighten it up',
    feedback: 'remove the icon from generate … footer stretch the full width of the two columns … "Name" "Document name" … compact version of generate and add … a generate rules button … remove the text under the preview',
    theme: 'Polish',
    changes: [
      'Generate loses its icon; Generate and Add shrink to 24px',
      'Footer spans both columns',
      '"Name" becomes "Document name"',
      'New "Generate from description" button writes rules from what the description mentions',
      'The note under the sample removed',
    ],
  },
  {
    n: 12,
    title: 'Hints should look like hints',
    feedback: 'the rules description should match the styling of the description in name and description',
    theme: 'Polish',
    changes: ['The Rules hint moves under the table and matches the other field hints'],
  },
  {
    n: 13,
    title: 'Calmer feedback, and a loading state',
    feedback: 'dont use the green color when a rule is added … until a document name is added just have the document as a shimmering document',
    theme: 'Preview',
    changes: [
      'New rules flash grey, not green',
      'The sample is a shimmering placeholder until there\'s a document name, then fades in',
    ],
  },
  {
    n: 14,
    title: 'Generate goes up a line',
    feedback: 'put generate aligned with desc title … right aligned with field below',
    theme: 'Layout',
    changes: ['Generate moves out of the box onto the Description label row, right-aligned'],
  },
  {
    n: 15,
    title: 'One way to suggest rules',
    feedback: 'lose "generate from description" and just have common rules as "suggested rules" … stretch the placeholder document to fill the height',
    theme: 'Layout',
    changes: [
      'One "Suggested rules" dropdown: rules for what the description mentions, then the common ones',
      'The placeholder fills the column',
    ],
  },
  {
    n: 16,
    title: 'Make it American',
    feedback: 'remove this … the "sample" outside of the document, just above it … clean up the left states … make the seed data USA specific … dont use the red hover',
    theme: 'Preview',
    changes: [
      'State machine rail stripped back to three short groups',
      '"Sample …" moved above the document',
      'Trash hover turned neutral',
      'Samples rebuilt for New York: a NYS driver\'s license, a Brooklyn doctor\'s note, a certificate of insurance',
    ],
  },
  {
    n: 17,
    title: 'Weight',
    feedback: 'the body text in the fields is darker than in the rules — use the rules styling',
    theme: 'Polish',
    changes: ['The fields were inheriting the label\'s 500 weight. Set to 400 to match the rules table'],
  },
  {
    n: 18,
    title: 'It\'s obvious',
    feedback: 'lets remove the "sample drivers license" its clear enough',
    theme: 'Preview',
    changes: ['The "Sample …" label above the document is gone. The picture says it'],
  },
  {
    n: 19,
    title: 'What if the sample doesn\'t have it?',
    feedback: 'i added "company matches our insurers" we need to have a solution if we dont know what it would look like in the preview',
    theme: 'Preview',
    changes: [
      'A rule that names something the sample doesn\'t show gets its own dashed field on the document',
      'The field is labelled from the rule: "Company matches our insurers" becomes Company',
      'Replaces outlining the whole page, which read as "everything" rather than "something we don\'t know yet"',
      'The link to the log comes off the state machine',
    ],
  },
  {
    n: 20,
    title: 'Don\'t reload the picture',
    feedback: 'when we jump through states, right now the right preview always resets and loads back in. we just want the focused area to change',
    theme: 'Preview',
    changes: ['Switching states updates the open dialog in place. Only the lit part moves'],
  },
  {
    n: 21,
    title: 'AI is purple, and line things up',
    feedback: 'instead of using blue to show the selection, lets use the AI purple color. and make sure the redacted bit is readable … there is too much top padding … make it follow the rules we have for the footer (distance to boundary)',
    theme: 'Polish',
    changes: [
      'What AI looks at lights up in purple, a new design-system token kept for AI',
      'The redacted value in a found field is darker, and tinted purple when lit',
      'Both title rows mirror the footer: 16px from the edge, 24px at the sides',
    ],
  },
  {
    n: 22,
    title: 'Twenty rules, some of them long',
    feedback: 'lets make an example state with 20 rules … and with some rules being very long written',
    theme: 'State machine',
    changes: [
      'New "20 rules" state, three of them a paragraph long',
      'Long rules wrap in the table instead of being cut off',
      'Found a bug on the way: rows were 49px, not 40px. Now 40px',
      'Dashed fields get better labels: "Not a learner permit" becomes Learner permit',
      '"Person" no longer lights up the name, which was a false match',
      'The line above the pinned add row stays put as rules scroll under it',
    ],
  },
  {
    n: 23,
    title: 'Less text on the review page',
    feedback: 'remove the desc and the text underneath the preview',
    theme: 'State machine',
    changes: ['The state machine shows just the state\'s name above the dialog'],
  },
  {
    n: 24,
    title: 'A state machine, not a list',
    feedback: 'we sort of need radio selections or checkboxes … i can have drivers license, doctors note, or other. that can be paired with any of the rules. thats what makes it a state machine',
    theme: 'State machine',
    changes: [
      'The rail is now six axes instead of a list of fixed screens: Mode, Document, Description, Rules, Focus, Show',
      'Any document pairs with any rule set: none, a few, many, or 20',
      'The title describes the combination, and the URL keeps it, so any combination can be linked',
    ],
  },
  {
    n: 25,
    title: 'Radios, stacked',
    feedback: 'lets use radio buttons and just have them vertically',
    theme: 'State machine',
    changes: ['Segmented controls become plain radio buttons, one option per line'],
  },
  {
    n: 26,
    title: 'Float the sidebar',
    feedback: 'make the left nav a floating nav like it is in macOS',
    theme: 'State machine',
    changes: ['The rail floats like a macOS sidebar: inset, rounded, translucent with a blur'],
  },
  {
    n: 27,
    title: 'Show it as it\'s added',
    feedback: 'as the rules are going through it is not showing on the drivers license preview (and it should be)',
    theme: 'Preview',
    changes: ['Adding a rule lights up the part of the document it checks for a moment, not only when you click into it'],
  },
]

// How many times one decision moved before it settled.
export const MIGRATIONS: { label: string; path: string[] }[] = [
  { label: 'Adding a rule', path: ['Stacked boxes', 'Chips + input', 'Input + table', 'The table\'s last row'] },
  { label: 'Generate button', path: ['Inside the box', 'Corner of the box', 'Label row'] },
  { label: 'Suggesting rules', path: ['Chips', 'Dropdown + generate button', 'One dropdown'] },
  { label: '"Sample" label', path: ['Preview header', 'Top right of the document', 'Above it', 'Gone'] },
]

// Screenshots the agent took while working, keyed by the round they were taken
// after. Rounds without their own screenshot show the most recent one.
const FRAME_ROUNDS = [1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26, 27]

export const frameForRound = (n: number) => {
  const at = FRAME_ROUNDS.filter((r) => r <= n).pop() ?? FRAME_ROUNDS[0]
  return `/case-studies/add-document/timelapse/r${String(at).padStart(2, '0')}.webp`
}

export const TIMELAPSE_FRAMES = FRAME_ROUNDS.map((n) => frameForRound(n))

export const LIFELINE_LABEL_COLUMN_WIDTH = 56
export const LIFELINE_LABEL_GAP = 16
export const LIFELINE_STICKY_SHIELD_WIDTH =
  LIFELINE_LABEL_COLUMN_WIDTH + LIFELINE_LABEL_GAP
export const LIFELINE_STICKY_LEFT = 20

export function LifelineStickyLabels() {
  return (
    <div
      className="relative"
      style={{ width: LIFELINE_LABEL_COLUMN_WIDTH }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-start text-left">
        {/*
          Deliberately blank. Our timeline is a career, not a life, so every
          marker suppresses its age — leaving an "Age" heading over an empty
          row. The element stays for its height, which keeps "Years" aligned
          with the year row. Put the text back if you ever plot real ages.
        */}
        <p className="mb-5 h-4 text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-zinc-500 transition-colors duration-300 dark:text-zinc-600" />
        <p className="mb-6 h-5 text-[11px] font-medium uppercase leading-5 tracking-[0.08em] text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
          Years
        </p>
      </div>
    </div>
  )
}
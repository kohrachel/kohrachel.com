export const inputClass =
  "w-full rounded-md border border-stone-300 bg-transparent px-2 py-1.5 text-base outline-none focus:border-stone-500";
// iOS Safari gives date inputs a minimum width, and no height when empty.
export const dateInputClass = `${inputClass} block min-h-[2.375rem] min-w-0 appearance-none`;
export const buttonClass =
  "w-fit rounded-md bg-stone-900 px-4 py-1.5 text-sm text-white disabled:opacity-50";
export const quietButtonClass =
  "w-fit rounded-md px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-50";

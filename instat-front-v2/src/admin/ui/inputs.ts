const base =
  "border border-rule bg-white px-3 text-[0.95rem] placeholder:text-muted/60 hover:border-muted focus-visible:border-paddy focus-visible:shadow-[inset_0_0_0_1px_var(--color-paddy)] focus-visible:outline-none aria-[invalid=true]:border-laterite disabled:bg-paper disabled:text-muted";

export const inputClass = `h-11 w-full ${base}`;
export const textareaClass = `w-full py-2.5 leading-relaxed ${base}`;
/** Liste déroulante de filtre, au-dessus d'un tableau : largeur selon le contenu. */
export const filterClass = `h-11 w-full sm:w-auto ${base}`;

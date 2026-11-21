import { initials } from "../../lib/format";

const sizes = {
  sm: { disc: "size-9 text-[0.8rem]", dot: "size-2.5" },
  lg: { disc: "size-11 text-[0.95rem]", dot: "size-3" },
  xl: { disc: "size-14 text-xl", dot: "size-3.5" },
};

/** Initiales dans un rond vert, avec la pastille « connecté » (menu du compte, « Mon compte »). */
export default function Avatar({ name, size }: { name: string; size: keyof typeof sizes }) {
  return (
    <span aria-hidden="true" className="relative inline-block shrink-0">
      <span
        className={`flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-paddy),var(--color-paddy-deep))] font-semibold text-white shadow-[0_0_0_2px_#fff,0_0_0_3px_rgb(20_87_63/0.25)] ${sizes[size].disc}`}
      >
        {initials(name)}
      </span>
      <span className={`absolute right-0 bottom-0 rounded-full bg-[#3fae74] ring-2 ring-white ${sizes[size].dot}`} />
    </span>
  );
}

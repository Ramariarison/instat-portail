import { quickLinks } from "../../data/navigation";

export default function TopBar() {
  return (
    <div className="on-dark bg-paddy-night text-[0.8rem] text-white">
      <nav
        aria-label="Liens rapides"
        className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 whitespace-nowrap sm:px-6 lg:justify-end lg:px-8"
      >
        {quickLinks.map((link) => (
          <a key={link.href} href={link.href} className="text-white/80 hover:text-white hover:underline">
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

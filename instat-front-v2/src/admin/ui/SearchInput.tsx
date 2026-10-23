import { Search } from "lucide-react";
import { inputClass } from "./inputs";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, label, placeholder = "Rechercher…" }: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-72">
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className={`${inputClass} pl-9`}
      />
    </div>
  );
}

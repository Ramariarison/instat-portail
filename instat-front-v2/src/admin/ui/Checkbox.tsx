import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
  label: ReactNode;
  hint?: string;
}

export default function Checkbox({ label, hint, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 text-[0.95rem] ${className}`}>
      <input type="checkbox" className="mt-1 size-4 shrink-0 accent-paddy" {...props} />
      <span>
        <span>{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  );
}

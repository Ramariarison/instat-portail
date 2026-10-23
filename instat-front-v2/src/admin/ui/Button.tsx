import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-paddy-deep text-white hover:bg-paddy",
  secondary: "border border-rule bg-white text-ink hover:border-paddy hover:text-paddy",
  danger: "bg-laterite text-white hover:bg-[#962f23]",
  ghost: "text-ink hover:bg-paddy-soft",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[0.95rem]",
  sm: "h-8 px-2.5 text-sm",
};

/** Classes d'un bouton, pour les appliquer aussi à un lien (<a>) qui a l'allure d'un bouton. */
export function buttonClass(variant: Variant = "secondary", size: Size = "md"): string {
  return `inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export default function Button({ variant, size, className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...props} />;
}

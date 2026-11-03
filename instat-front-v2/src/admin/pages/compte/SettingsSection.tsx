import type { FormEvent, ReactNode, Ref } from "react";

/**
 * Section de « Mon compte », à la manière des pages de réglages : titre et explication à gauche,
 * formulaire dans une carte à droite, avec le bouton dans un pied de carte.
 */
export default function SettingsSection({
  title,
  description,
  footer,
  onSubmit,
  formRef,
  children,
}: {
  title: string;
  description: ReactNode;
  /** Pied de carte : note à gauche et bouton d'envoi à droite. */
  footer: ReactNode;
  onSubmit: (event: FormEvent) => void;
  formRef?: Ref<HTMLFormElement>;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-x-10 gap-y-4 border-t border-line pt-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="border border-line bg-white">
        <div className="space-y-5 p-5 sm:p-6">{children}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper px-5 py-3 sm:px-6">{footer}</div>
      </form>
    </section>
  );
}

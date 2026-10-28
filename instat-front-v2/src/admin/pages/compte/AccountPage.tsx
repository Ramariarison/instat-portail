import type { ReactNode } from "react";
import PageHeader, { BlockTitle } from "../../ui/PageHeader";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";

function Block({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="border border-t-2 border-line border-t-ink bg-white p-5 sm:p-7">
      <BlockTitle number={number}>{title}</BlockTitle>
      <div className="mt-6 border-t border-line pt-6">{children}</div>
    </section>
  );
}

/** « Mon compte » : accessible à tous les rôles. */
export default function AccountPage() {
  return (
    <>
      <PageHeader title="Mon compte" description="Votre profil et votre mot de passe." />
      <div className="max-w-3xl space-y-6">
        <Block number="01" title="Profil">
          <ProfileForm />
        </Block>
        <Block number="02" title="Mot de passe">
          <PasswordForm />
        </Block>
      </div>
    </>
  );
}

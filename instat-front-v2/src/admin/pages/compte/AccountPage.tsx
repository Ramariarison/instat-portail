import PageHeader from "../../ui/PageHeader";
import AccountSummary from "./AccountSummary";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";

/** « Mon compte » : accessible à tous les rôles. */
export default function AccountPage() {
  return (
    <>
      <PageHeader title="Mon compte" description="Votre profil et votre mot de passe." />
      <div className="max-w-4xl space-y-8">
        <AccountSummary />
        <ProfileForm />
        <PasswordForm />
      </div>
    </>
  );
}

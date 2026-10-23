import { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useRoute } from "./lib/route";
import AdminApp from "./admin/AdminApp";
import TopBar from "./components/layout/TopBar";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LoginModal from "./components/auth/LoginModal";
import Hero from "./components/home/Hero";
import KeyFigures from "./components/home/KeyFigures";
import Publications from "./components/home/Publications";
import Themes from "./components/home/Themes";
import DataAndServices from "./components/home/DataAndServices";

function PublicSite() {
  const [loginOpen, setLoginOpen] = useState(false);

  // Au retour du back-office (ou à l'ouverture d'un lien d'ancre), on se place au bon endroit de la page.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <TopBar />
      <Navbar onLoginClick={() => setLoginOpen(true)} />
      <main id="contenu">
        <Hero />
        <KeyFigures />
        <Publications />
        <Themes />
        <DataAndServices />
      </main>
      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default function App() {
  const segments = useRoute();

  return (
    <AuthProvider>{segments[0] === "admin" ? <AdminApp segments={segments} /> : <PublicSite />}</AuthProvider>
  );
}

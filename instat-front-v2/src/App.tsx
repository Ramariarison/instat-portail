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
import ComingSoonPage from "./pages/ComingSoonPage";
import NewsPage from "./pages/NewsPage";
import PublicationPage from "./pages/PublicationPage";
import PublicationsPage from "./pages/PublicationsPage";

function Home() {
  return (
    <>
      <Hero />
      <KeyFigures />
      <Publications />
      <Themes />
      <DataAndServices />
    </>
  );
}

/** Page publique correspondant à la route (« #/publications/pub-… » → fiche de la publication). */
function PublicPage({ segments }: { segments: string[] }) {
  const [section, id, extra] = segments;
  if (!section) return <Home />;
  if (section === "publications" && !extra) return id ? <PublicationPage key={id} id={id} /> : <PublicationsPage />;
  if (section === "actualites" && !id) return <NewsPage />;
  return <ComingSoonPage />;
}

function PublicSite({ segments }: { segments: string[] }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const routeKey = segments.join("/");

  // À chaque changement de page (et au retour du back-office) : ancre de l'accueil (#chiffres…) ou haut de page.
  // Saut immédiat : le défilement doux (index.css) partirait de l'ancienne page pendant que la nouvelle s'affiche.
  useEffect(() => {
    const hash = window.location.hash;
    const id = hash.startsWith("#/") ? "" : decodeURIComponent(hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    target.scrollIntoView({ behavior: "instant" });

    // Les sections au-dessus de l'ancre se remplissent après coup (données de l'API) et la repoussent :
    // on la garde en place tant que la page change de taille, 2 s au plus, sauf si la personne fait défiler.
    const observer = new ResizeObserver(() => target.scrollIntoView({ behavior: "instant" }));
    observer.observe(document.getElementById("contenu") ?? document.body);
    const stop = () => observer.disconnect();
    const timer = window.setTimeout(stop, 2000);
    const userEvents = ["wheel", "touchstart", "keydown", "mousedown"] as const;
    userEvents.forEach((type) => window.addEventListener(type, stop, { once: true, passive: true }));
    return () => {
      stop();
      window.clearTimeout(timer);
      userEvents.forEach((type) => window.removeEventListener(type, stop));
    };
  }, [routeKey]);

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
        <PublicPage segments={segments} />
      </main>
      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default function App() {
  const segments = useRoute();

  return (
    <AuthProvider>{segments[0] === "admin" ? <AdminApp segments={segments} /> : <PublicSite segments={segments} />}</AuthProvider>
  );
}

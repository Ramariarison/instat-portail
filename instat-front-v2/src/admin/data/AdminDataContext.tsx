import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { api, errorMessage } from "../../lib/api";
import { can } from "../permissions";
import type {
  AdminPublication,
  AdminUser,
  DataType,
  FigureRegion,
  FigureValue,
  IndicatorDef,
  Region,
  Thematique,
} from "./types";

/**
 * Données du back-office, lues et écrites par la passerelle d'API (services Publications, « Madagascar en chiffres » et Auth).
 * Tout est chargé à la connexion ; chaque écriture attend la réponse du serveur, puis met la liste locale à jour
 * avec l'élément renvoyé. En cas de refus (droits, doublon, élément utilisé ailleurs), la promesse est rejetée
 * avec une ApiError dont le message est prêt à afficher.
 */

export interface Collection<T extends { id: string }, Input = Omit<T, "id">> {
  items: T[];
  add: (draft: Input) => Promise<T>;
  update: (id: string, patch: Partial<Input>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  setAll: Dispatch<SetStateAction<T[]>>;
}

/** Pour une mise à jour partielle, un champ présent mais vide (undefined) doit être effacé côté serveur : on envoie null. */
function withNulls(patch: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, value === undefined ? null : value]));
}

const itemPath = (path: string, id: string) => `${path}/${encodeURIComponent(id)}`;

function useCollection<T extends { id: string }, Input = Omit<T, "id">>(path: string): Collection<T, Input> {
  const [items, setItems] = useState<T[]>([]);
  return useMemo<Collection<T, Input>>(
    () => ({
      items,
      add: async (draft) => {
        const created = await api.post<T>(path, draft);
        setItems((previous) => [...previous, created]);
        return created;
      },
      update: async (id, patch) => {
        const saved = await api.patch<T>(itemPath(path, id), withNulls(patch as object));
        setItems((previous) => previous.map((item) => (item.id === id ? saved : item)));
        return saved;
      },
      remove: async (id) => {
        await api.delete(itemPath(path, id));
        setItems((previous) => previous.filter((item) => item.id !== id));
      },
      setAll: setItems,
    }),
    [items, path],
  );
}

/** Champs envoyés pour un compte : le mot de passe n'est jamais relu. */
export type UserInput = Omit<AdminUser, "id" | "lastLogin"> & { password?: string };

export type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready" };

interface AdminData {
  state: LoadState;
  reload: () => void;
  thematiques: Collection<Thematique>;
  regions: Collection<Region>;
  publications: Collection<AdminPublication>;
  dataTypes: Collection<DataType>;
  indicators: Collection<IndicatorDef>;
  figureRegions: Collection<FigureRegion>;
  figureValues: Collection<FigureValue>;
  users: Collection<AdminUser, UserInput>;
  /** Enregistre une publication ; si elle porte « la plus récente NIPC », le serveur retire le marqueur des autres. */
  savePublication: (draft: Omit<AdminPublication, "id">, id?: string) => Promise<AdminPublication>;
  /** Supprime une région en chiffres et toutes ses données. */
  removeFigureRegion: (id: string) => Promise<void>;
}

const AdminDataContext = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const thematiques = useCollection<Thematique>("/thematiques");
  const regions = useCollection<Region>("/regions");
  const publications = useCollection<AdminPublication>("/admin/publications");
  const dataTypes = useCollection<DataType>("/chiffres/types");
  const indicators = useCollection<IndicatorDef>("/chiffres/indicators");
  const figureRegions = useCollection<FigureRegion>("/chiffres/regions");
  const figureValues = useCollection<FigureValue>("/chiffres/values");
  const users = useCollection<AdminUser, UserInput>("/users");

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const userId = user?.id;
  const role = user?.role;

  // Chargement complet à la connexion (et sur « Réessayer »). Les setAll sont des setState React : stables.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setState({ status: "loading" });

    Promise.all([
      api.get<Thematique[]>("/thematiques"),
      api.get<Region[]>("/regions"),
      api.get<AdminPublication[]>("/admin/publications"),
      api.get<DataType[]>("/chiffres/types"),
      api.get<IndicatorDef[]>("/chiffres/indicators"),
      api.get<FigureRegion[]>("/chiffres/regions"),
      api.get<FigureValue[]>("/chiffres/values"),
      // Seul le super administrateur a le droit de lister les comptes.
      can(role, "users", "view") ? api.get<AdminUser[]>("/users") : Promise.resolve([]),
    ]).then(
      ([t, r, p, d, i, fr, fv, u]) => {
        if (cancelled) return;
        thematiques.setAll(t);
        regions.setAll(r);
        publications.setAll(p);
        dataTypes.setAll(d);
        indicators.setAll(i);
        figureRegions.setAll(fr);
        figureValues.setAll(fv);
        users.setAll(u);
        setState({ status: "ready" });
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: "error", message: errorMessage(error, "Les données n'ont pas pu être chargées.") });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId, role, attempt]);

  const setPublications = publications.setAll;
  const savePublication = useCallback<AdminData["savePublication"]>(
    async (draft, id) => {
      const saved = id
        ? await api.patch<AdminPublication>(itemPath("/admin/publications", id), withNulls(draft))
        : await api.post<AdminPublication>("/admin/publications", draft);
      setPublications((previous) => {
        const base = saved.latestNipc ? previous.map((p) => ({ ...p, latestNipc: false })) : previous;
        return id ? base.map((p) => (p.id === id ? saved : p)) : [...base, saved];
      });
      return saved;
    },
    [setPublications],
  );

  const removeFigureRegionOnly = figureRegions.remove;
  const setFigureValues = figureValues.setAll;
  const removeFigureRegion = useCallback(
    async (id: string) => {
      // Le service supprime les valeurs en cascade ; on fait de même dans la liste locale.
      await removeFigureRegionOnly(id);
      setFigureValues((previous) => previous.filter((value) => value.figureRegionId !== id));
    },
    [removeFigureRegionOnly, setFigureValues],
  );

  const value = useMemo(
    () => ({
      state, reload,
      thematiques, regions, publications, dataTypes, indicators, figureRegions, figureValues, users,
      savePublication, removeFigureRegion,
    }),
    [state, reload, thematiques, regions, publications, dataTypes, indicators, figureRegions, figureValues, users, savePublication, removeFigureRegion],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminData {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error("useAdminData doit être utilisé à l'intérieur de <AdminDataProvider>.");
  return context;
}

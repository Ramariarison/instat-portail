/**
 * Client de la passerelle d'API (services/gateway). Toutes les requêtes passent par ici :
 * jeton de session, encodage JSON, erreurs `{ error: { code, message } }` des microservices.
 * En développement, Vite relaie /api vers la passerelle (vite.config.ts).
 */

const BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");
const TOKEN_KEY = "instat.session";

export class ApiError extends Error {
  readonly status: number;
  /** Code stable renvoyé par le service (INVALID_CREDENTIALS, IN_USE, ALREADY_EXISTS…). */
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// Jeton gardé pour l'onglet (sessionStorage) : il survit au rechargement, pas à la fermeture.
function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

let token = readToken();

export function getToken(): string | null {
  return token;
}

export function setToken(value: string | null): void {
  token = value;
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Stockage indisponible (navigation privée stricte) : la session ne durera que le temps de la page.
  }
}

const unauthorizedListeners = new Set<() => void>();

/** Prévient quand le serveur refuse le jeton (session expirée, compte désactivé). */
export function onUnauthorized(listener: () => void): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, { method, headers, body: payload, signal });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new ApiError(0, "NETWORK", "Le serveur est injoignable. Vérifiez votre connexion et réessayez.");
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (response.ok) return data as T;

  if (response.status === 401 && token) {
    setToken(null);
    unauthorizedListeners.forEach((listener) => listener());
  }
  const error = (data as { error?: { code?: string; message?: string } } | null)?.error;
  if (!error && response.status >= 502) {
    // Réponse de la passerelle elle-même : le service visé est arrêté ou ne répond pas.
    throw new ApiError(response.status, "UNAVAILABLE", "Le service est momentanément indisponible. Réessayez dans quelques instants.");
  }
  throw new ApiError(response.status, error?.code ?? "HTTP_ERROR", error?.message ?? "La requête a échoué. Réessayez.");
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>("GET", path, undefined, signal),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};

/** Message à afficher pour une erreur quelconque (celui du service s'il y en a un). */
export function errorMessage(error: unknown, fallback = "L'opération a échoué. Réessayez."): string {
  return error instanceof ApiError ? error.message : fallback;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  /** Adresse publique du fichier, à enregistrer telle quelle (ex. « /api/files/file-… »). */
  url: string;
}

/** Envoie un fichier au service Fichiers. */
export function uploadFile(file: File): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);
  return request<UploadedFile>("POST", "/files", form);
}

/** Adresse de téléchargement d'un document de publication. */
export function fileUrl(id: string): string {
  return `${BASE}/files/${encodeURIComponent(id)}`;
}

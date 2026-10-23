import { useAuth } from "../context/AuthContext";
import { can, type Resource } from "./permissions";

/** Ce que l'utilisateur connecté peut faire sur une ressource (pour afficher ou masquer les boutons). */
export function usePermissions(resource: Resource) {
  const { user } = useAuth();
  const role = user?.role;
  return {
    canCreate: can(role, resource, "create"),
    canUpdate: can(role, resource, "update"),
    canDelete: can(role, resource, "delete"),
  };
}

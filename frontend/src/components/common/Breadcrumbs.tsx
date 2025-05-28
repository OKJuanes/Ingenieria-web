import { Link, useLocation } from "react-router-dom";

const routeNames: Record<string, string> = {
  "": "Inicio",
  "home-admin": "Panel Admin",
  "admin": "Admin",
  "eventos": "Eventos",
  "mis-hitos": "Mis Hitos",
  "perfil": "Perfil",
  "anadir-invitado": "Añadir Invitado",
  "cambiar-roles": "Cambiar Roles",
  // Agrega más rutas si lo necesitas
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  let pathAcc = "";
  return (
    <nav aria-label="breadcrumb" className="breadcrumbs">
      <ol>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        {paths.map((segment, idx) => {
          pathAcc += "/" + segment;
          const isLast = idx === paths.length - 1;
          return (
            <li key={idx} aria-current={isLast ? "page" : undefined}>
              {isLast ? (
                <span>{routeNames[segment] || segment}</span>
              ) : (
                <Link to={pathAcc}>{routeNames[segment] || segment}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
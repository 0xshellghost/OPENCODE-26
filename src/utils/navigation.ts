import { IRoute } from "types/navigation";

// NextJS Requirement
export const isWindowAvailable = () => typeof window !== "undefined";

export const findCurrentRoute = (routes: IRoute[]): IRoute => { 
  const foundRoute: IRoute | undefined = routes.find(
    (route) =>
      isWindowAvailable() &&
      window.location.href.indexOf(route.layout + route.path) !== -1 &&
      route
  );

  return foundRoute as IRoute;
};

export const getActiveRoute = (routes: IRoute[]): string => {
  const route = findCurrentRoute(routes);
  return route?.name || "";
};

export const getActiveNavbar = (routes: IRoute[]): boolean => {
  const route = findCurrentRoute(routes);
  return route?.secondary || false;
};

export const getActiveNavbarText = (routes: IRoute[]): string | boolean => {
  return getActiveRoute(routes) || false;
};

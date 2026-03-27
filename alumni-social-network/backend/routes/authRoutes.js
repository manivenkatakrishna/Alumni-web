export const authRoutes = {
  login: "/login",
  signup: "/signup",
};

const protectedRoutes = new Set(["home", "profile", "directory", "messages"]);

export function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/home";
  const [path, queryString = ""] = hash.split("?");
  const segments = path.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryString).entries());

  if (segments[0] === "login") {
    return { name: "login", params: {}, query };
  }

  if (segments[0] === "signup") {
    return { name: "signup", params: {}, query };
  }

  if (segments[0] === "profile") {
    return { name: "profile", params: { id: segments[1] || null }, query };
  }

  if (segments[0] === "directory") {
    return { name: "directory", params: {}, query };
  }

  if (segments[0] === "messages") {
    return { name: "messages", params: { id: segments[1] || null }, query };
  }

  return { name: "home", params: {}, query };
}

export function normalizeRoute(route) {
  if (!route || !route.name) {
    return { name: "home", params: {}, query: {} };
  }
  return route;
}

export function isProtectedRoute(name) {
  return protectedRoutes.has(name);
}

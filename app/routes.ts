import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./middleware/protected.tsx", [
    index("routes/home.tsx"),
    route("upload", "routes/upload.tsx"),

    ...prefix("download", [
      index("routes/download/single.tsx"),
      route("all", "routes/download/all.tsx"),
    ]),
  ]),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;

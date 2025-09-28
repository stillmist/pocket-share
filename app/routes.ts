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

    ...prefix("upload", [
      index("routes/upload/index.tsx"),
      route("do-upload", "routes/upload/do-upload.tsx"),
    ]),

    ...prefix("download", [
      index("routes/download/index.tsx"),
      route("single", "routes/download/single.tsx"),
      route("all", "routes/download/all.tsx"),
    ]),
  ]),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;

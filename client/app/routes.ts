import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),         // for "/"
  route("chess", "routes/chess.tsx"), // for "/chess"
  route("*", "routes/notfound.tsx") // catch-all route
] satisfies RouteConfig;

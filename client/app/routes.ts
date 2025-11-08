import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),         // for "/"
  route("chess/:roomId", "routes/chess.tsx"), // for "/chess"
   route("chess", "routes/chessDashboard.tsx"),
  route("*", "routes/notfound.tsx") // catch-all route
] satisfies RouteConfig;

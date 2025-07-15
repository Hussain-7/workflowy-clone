import { type RouteConfig, route, index } from "@react-router/dev/routes";

const routes = [
  {
    path: "index",
    component: "routes/index.tsx",
  },
  {
    path: "test",
    component: "routes/test.tsx",
  },
];

export default routes.map((item) => 
  item.path === "index" ? index(item.component) : route(item.path, item.component)
) satisfies RouteConfig;

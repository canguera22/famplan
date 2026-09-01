import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/join-BPw7xnRF.js
var $$splitComponentImporter = () => import("./join-BH8Qdnm5.mjs");
var Route = createFileRoute("/join")({
	validateSearch: (search) => ({ token: typeof search.token === "string" ? search.token : "" }),
	head: () => ({ meta: [{ title: "Join your family — Mesa" }, {
		name: "description",
		content: "Accept an invitation to a shared Mesa family space."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };

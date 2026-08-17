import e from "@deepseek-ai/schemastery";
import { installSettingsSection as t, settingsNamespace as n } from "@deepseek-ai/dsh-settings";
//#region src/index.ts
var r = "dsh-vibe", i = n("dsh-vibe"), a = [
	"off",
	"light",
	"medium",
	"strong"
], o = e.object({
	enabled: e.boolean().default(!0),
	feedback: e.boolean().default(!0),
	flame: e.boolean().default(!0),
	shake: e.union([...a]).default("off"),
	response: e.boolean().default(!0),
	pageShake: e.boolean().default(!0),
	pageShakeLevel: e.union([...a]).default("off"),
	sound: e.boolean().default(!0),
	opacity: e.number().min(.1).max(1).default(.5),
	scale: e.number().min(.6).max(1.5).default(1)
});
function s(e) {
	return "data: " + JSON.stringify(e) + "\n\n";
}
var c = {
	inject: ["webServer"],
	apply(e, n) {
		let r = () => n;
		t(e, i, o, n, {
			setSource: (e) => {
				r = e;
			},
			onChange: () => {
				r();
			}
		});
		let a = /* @__PURE__ */ new Set();
		function c(e) {
			let t = s({ type: e });
			for (let e of a) try {
				e.write(t);
			} catch {}
		}
		e.on("session/event", (e, t) => {
			t && t.type === "turn/end" && c("answer-done");
		}), e.effect(() => {
			let t = e.webServer.register({
				kind: "exact",
				path: "/api/vibe-events",
				handler: (e, t) => {
					if (e.method !== "GET" && e.method !== "HEAD") {
						t.writeHead(405), t.end();
						return;
					}
					t.writeHead(200, {
						"content-type": "text/event-stream",
						"cache-control": "no-cache",
						connection: "keep-alive"
					}), t.write(": connected\n\n"), a.add(t), t.on("close", () => {
						a.delete(t);
					});
				}
			});
			return () => {
				t();
				for (let e of a) e.destroy();
				a.clear();
			};
		});
	}
};
//#endregion
export { o as Config, a as SHAKE_LEVELS, i as VIBE_SETTINGS_NAMESPACE, c as default, r as name };

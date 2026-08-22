import e from "@deepseek-ai/schemastery";
import { installSettingsSection as t, settingsNamespace as n } from "@deepseek-ai/dsh-settings";
//#region package.json
var r = "dsh-vibe";
//#endregion
//#region src/shared/identity.ts
function i() {
	return r;
}
//#endregion
//#region src/host/index.ts
var a = i(), o = n(i()), s = [
	"off",
	"light",
	"medium",
	"strong"
], c = [
	"off",
	"low",
	"medium",
	"high"
], l = e.object({
	enabled: e.boolean().default(!0),
	opacity: e.number().min(.1).max(1).default(.5),
	moleFrequency: e.union([...c]).default("medium"),
	feedback: e.boolean().default(!0),
	flame: e.boolean().default(!0),
	shake: e.union([...s]).default("off"),
	response: e.boolean().default(!0),
	pageShakeLevel: e.union([...s]).default("off"),
	sound: e.boolean().default(!0)
});
function u(e) {
	return "data: " + JSON.stringify(e) + "\n\n";
}
var d = {
	inject: ["webServer"],
	apply(e, n) {
		let r = () => n;
		t(e, o, l, n, {
			setSource: (e) => {
				r = e;
			},
			onChange: () => {
				r();
			}
		});
		let i = /* @__PURE__ */ new Set();
		function a(e) {
			let t = u({ type: e });
			for (let e of i) try {
				e.write(t);
			} catch {}
		}
		e.on("session/event", (e, t) => {
			t && t.type === "turn/end" && a("answer-done");
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
					}), t.write(": connected\n\n"), i.add(t), t.on("close", () => {
						i.delete(t);
					});
				}
			});
			return () => {
				t();
				for (let e of i) e.destroy();
				i.clear();
			};
		});
	}
};
//#endregion
export { l as Config, c as MOLE_FREQUENCIES, s as SHAKE_LEVELS, o as VIBE_SETTINGS_NAMESPACE, d as default, a as name };

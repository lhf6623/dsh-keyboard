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
//#region src/shared/config.ts
var a = [
	"off",
	"light",
	"medium",
	"strong"
], o = [
	"off",
	"low",
	"medium",
	"high"
], s = [
	{
		key: "enabled",
		kind: "boolean",
		def: !0
	},
	{
		key: "opacity",
		kind: "number",
		min: .1,
		max: 1,
		def: .5
	},
	{
		key: "moleFrequency",
		kind: "enum",
		values: o,
		def: "medium"
	},
	{
		key: "feedback",
		kind: "boolean",
		def: !0
	},
	{
		key: "flame",
		kind: "boolean",
		def: !0
	},
	{
		key: "shake",
		kind: "enum",
		values: a,
		def: "off"
	},
	{
		key: "response",
		kind: "boolean",
		def: !0
	},
	{
		key: "pageShakeLevel",
		kind: "enum",
		values: a,
		def: "off"
	},
	{
		key: "sound",
		kind: "boolean",
		def: !0
	}
];
s.map((e) => e.key), Object.fromEntries(s.map((e) => [e.key, e.def]));
//#endregion
//#region src/host/index.ts
var c = i(), l = n(i());
function u(t) {
	switch (t.kind) {
		case "boolean": return e.boolean().default(t.def);
		case "number": return e.number().min(t.min).max(t.max).default(t.def);
		case "enum": return e.union([...t.values]).default(t.def);
	}
}
var d = e.object(Object.fromEntries(s.map((e) => [e.key, u(e)])));
function f(e) {
	return "data: " + JSON.stringify(e) + "\n\n";
}
var p = {
	inject: ["webServer"],
	apply(e, n) {
		t(e, l, d, n, {
			setSource: () => {},
			onChange: () => {}
		});
		let r = /* @__PURE__ */ new Set();
		function i(e) {
			let t = f({ type: e });
			for (let e of r) try {
				e.write(t);
			} catch {}
		}
		e.on("session/event", (e, t) => {
			t && t.type === "turn/end" && i("answer-done");
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
					}), t.write(": connected\n\n"), r.add(t), t.on("close", () => {
						r.delete(t);
					});
				}
			});
			return () => {
				t();
				for (let e of r) e.destroy();
				r.clear();
			};
		});
	}
};
//#endregion
export { d as Config, o as MOLE_FREQUENCIES, a as SHAKE_LEVELS, l as VIBE_SETTINGS_NAMESPACE, p as default, c as name };

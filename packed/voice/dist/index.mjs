import { i as voiceAgentFacetSpec } from "./install-DuW0NyzX.mjs";
import { bytesToBase64 } from "iterate/lib";
import { IterateConfigEntrypoint, StreamProcessorDurableObject } from "iterate/sdk";
import { z } from "zod";
import { inflate } from "pako";
import { AgentContract } from "iterate/agents/contract";
import { StreamProcessor, defineProcessorContract } from "iterate/stream/processor";
//#region src/screen.ts
const PixelFormat = z.enum([
	"mono1",
	"gray4",
	"rgb565"
]);
const ScreenInfo = z.object({
	width: z.number().int().min(1).max(2048),
	height: z.number().int().min(1).max(2048),
	formats: z.array(PixelFormat).min(1).max(3),
	preferredFormat: PixelFormat,
	maxChunkBytes: z.number().int().min(1).max(4096),
	refreshTimeoutMs: z.number().int().min(1).max(6e4),
	partialRefresh: z.boolean()
}).refine((info) => info.formats.includes(info.preferredFormat), "Preferred format must be supported").refine((info) => info.formats.every((format) => Math.ceil(info.width * (format === "mono1" ? 1 : format === "gray4" ? 4 : 16) / 8) * info.height <= 1048576), "Screen frame exceeds 1 MiB");
const ScreenImageInput = z.object({
	device: z.string().regex(/^[A-Za-z0-9_]{1,64}$/),
	image: z.object({
		html: z.string().min(1).max(24e3),
		format: PixelFormat.optional()
	}).nullable()
});
function pngU32(bytes, offset) {
	return bytes[offset] * 16777216 + bytes[offset + 1] * 65536 + bytes[offset + 2] * 256 + bytes[offset + 3];
}
/** Decode exactly the non-interlaced 8-bit RGB/RGBA PNG Browser Run emits.
* Parsing it here keeps image codecs, allocation and dithering off the ESP32. */
function browserPng(bytes, expectedWidth, expectedHeight) {
	const signature = [
		137,
		80,
		78,
		71,
		13,
		10,
		26,
		10
	];
	if (bytes.length < signature.length || signature.some((byte, i) => bytes[i] !== byte)) throw new Error("Browser Run did not return a PNG");
	let offset = signature.length;
	let width = 0;
	let height = 0;
	let channels = 3;
	const compressed = [];
	while (offset + 12 <= bytes.length) {
		const length = pngU32(bytes, offset);
		const dataStart = offset + 8;
		const dataEnd = dataStart + length;
		if (dataEnd + 4 > bytes.length) throw new Error("PNG chunk is truncated");
		const type = String.fromCharCode(...bytes.subarray(offset + 4, dataStart));
		if (type === "IHDR") {
			if (length !== 13) throw new Error("PNG header has an invalid length");
			width = pngU32(bytes, dataStart);
			height = pngU32(bytes, dataStart + 4);
			const bitDepth = bytes[dataStart + 8];
			const colourType = bytes[dataStart + 9];
			const compression = bytes[dataStart + 10];
			const filter = bytes[dataStart + 11];
			const interlace = bytes[dataStart + 12];
			if (bitDepth !== 8 || colourType !== 2 && colourType !== 6 || compression !== 0 || filter !== 0 || interlace !== 0) throw new Error("PNG must be non-interlaced 8-bit RGB or RGBA");
			channels = colourType === 2 ? 3 : 4;
		} else if (type === "IDAT") compressed.push(bytes.subarray(dataStart, dataEnd));
		else if (type === "IEND") break;
		offset = dataEnd + 4;
	}
	if (width !== expectedWidth || height !== expectedHeight || compressed.length === 0) throw new Error("Browser screenshot dimensions do not match the device");
	const joined = new Uint8Array(compressed.reduce((sum, part) => sum + part.length, 0));
	let cursor = 0;
	for (const part of compressed) {
		joined.set(part, cursor);
		cursor += part.length;
	}
	const stride = width * channels;
	const filtered = inflate(joined);
	if (filtered.length !== height * (stride + 1)) throw new Error("PNG pixels have an invalid length");
	const pixels = new Uint8Array(width * height * channels);
	for (let y = 0; y < height; y += 1) {
		const source = y * (stride + 1);
		const destination = y * stride;
		const filter = filtered[source];
		for (let x = 0; x < stride; x += 1) {
			const raw = filtered[source + 1 + x];
			const left = x >= channels ? pixels[destination + x - channels] : 0;
			const up = y > 0 ? pixels[destination - stride + x] : 0;
			const upLeft = y > 0 && x >= channels ? pixels[destination - stride + x - channels] : 0;
			let value = raw;
			if (filter === 1) value = raw + left & 255;
			else if (filter === 2) value = raw + up & 255;
			else if (filter === 3) value = raw + Math.floor((left + up) / 2) & 255;
			else if (filter === 4) {
				const p = left + up - upLeft;
				const pa = Math.abs(p - left);
				const pb = Math.abs(p - up);
				const pc = Math.abs(p - upLeft);
				value = raw + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft) & 255;
			} else if (filter !== 0) throw new Error("PNG uses an unsupported row filter");
			pixels[destination + x] = value;
		}
	}
	return {
		width,
		height,
		pixels,
		channels
	};
}
/** Server-side colour conversion; no PNG decoder or dither loop on the board.
* Every row starts at a byte boundary, including widths not divisible by 8. */
function renderScreenPixels(png, info, format) {
	const image = browserPng(png, info.width, info.height);
	const bits = format === "mono1" ? 1 : format === "gray4" ? 4 : 16;
	const stride = Math.ceil(image.width * bits / 8);
	const bitmap = new Uint8Array(stride * image.height);
	const bayer4 = [
		0,
		8,
		2,
		10,
		12,
		4,
		14,
		6,
		3,
		11,
		1,
		9,
		15,
		7,
		13,
		5
	];
	for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
		const i = (y * image.width + x) * image.channels;
		const alpha = image.channels === 4 ? image.pixels[i + 3] / 255 : 1;
		const r = Math.round(image.pixels[i] * alpha + 255 * (1 - alpha));
		const g = Math.round(image.pixels[i + 1] * alpha + 255 * (1 - alpha));
		const b = Math.round(image.pixels[i + 2] * alpha + 255 * (1 - alpha));
		const luminance = r * 77 + g * 150 + b * 29 >> 8;
		if (format === "mono1") {
			if (luminance < bayer4[y % 4 * 4 + x % 4] * 16 + 8) bitmap[y * stride + (x >> 3)] |= 128 >> (x & 7);
		} else if (format === "gray4") bitmap[y * stride + (x >> 1)] |= Math.round(luminance / 17) << (x % 2 ? 0 : 4);
		else {
			const pixel = r >> 3 << 11 | g >> 2 << 5 | b >> 3;
			bitmap[y * stride + x * 2] = pixel >> 8;
			bitmap[y * stride + x * 2 + 1] = pixel & 255;
		}
	}
	return bitmap;
}
//#endregion
//#region src/screen-context.md
var screen_context_default = "# Drawing for this device\n\nYou are speaking to someone using `itx.clients.{{DEVICE}}`. It advertises a\nscreen. Call `itx.cd(\"/\").clients.{{DEVICE}}.screen.info()` before designing a\nview: the result gives `width`, `height`, `formats`, `preferredFormat`,\n`partialRefresh`, and `refreshTimeoutMs`. Never infer these from a board name.\nUse `itx.cd(\"/\").voice.setImage({ device: \"{{DEVICE}}\", image: { html } })`.\nYou may select a supported `image.format`: `mono1` is black/white, `gray4` is\n16 shades of grey, and `rgb565` is colour. The default is the device's\npreferred format. NOTE4 grayscale requires a slower full refresh. No screen\nin this interface implies touch input. Show one useful static view at a time.\n\nThe device receives pixels; HTML, fonts and image conversion run on the\nserver. The following example is designed for a 400 × 300 screen: adapt its\nlayout to the actual advertised dimensions for any other screen.\n\n## Render on the pixel grid\n\n- Render at the advertised width × height in CSS pixels, `deviceScaleFactor: 1`. The image\n  setter already selects this viewport. Use `margin: 0`, `box-sizing:\nborder-box` and `overflow: hidden`; keep useful content 16px from the edges.\n- Use integer pixel sizes, positions, gaps and line heights. Prefer explicit\n  columns to layouts that divide into fractional widths. Avoid fractional\n  transforms, CSS zoom, rotated text and resizing a larger screenshot down.\n- For `mono1`, use opaque `#000` and `#fff`. Separate sections with space, a solid rule,\n  or an inverted black block with white text. Avoid shadows, blurs, gradients,\n  translucent borders and subtle differences in grey. These are design\n  recommendations for monochrome displays, not Chromium limitations.\n\n## Text\n\nUse the supplied **Iterate Pixel** font (Press Start 2P), normal weight 400,\nusually **16px/24px** for text and **24px/32px** for headings. It produced\nstrictly black/white glyphs at those sizes in the actual Chromium bench test.\nAvoid synthetic bold/italic. Use `font-kerning: none`,\n`font-variant-ligatures: none` and `letter-spacing: 0`; shorten labels instead\nof squeezing text with transforms. These settings alone do not turn an\nordinary font into a bitmap font.\n\nThe bundled font contains printable ASCII: use ordinary quotes, hyphens,\ndigits and short labels; draw symbols as SVG if needed. A 16px character is\napproximately 16px wide, so plan for about 21 characters in a 336px content\narea. Do not rely on emoji or an uninstalled system font for an icon.\n\nFetch `voice/screen-font.css` from root KV and embed the returned CSS in\n`<style>`. Its font is a 2.5KB WOFF2 data URL: no external font request, and no\nneed to print the base64 data in your reply. Browser Run supports embedded\ncustom fonts; otherwise an unavailable family can silently fall back.\n[Cloudflare custom fonts](https://developers.cloudflare.com/browser-run/features/custom-fonts/)\n\nPrefer static, self-contained HTML with embedded assets. Avoid animation,\nframework bootstrapping and external stylesheets. If building a separate\nrenderer with external fonts, await `document.fonts.ready` before capture;\ndo not substitute an arbitrary sleep. The copyable view below embeds its font.\n[Font readiness](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/ready)\n\n## Borders, rules and icons\n\nUse square corners and **1px or 2px solid CSS borders** on integer-positioned\nboxes. A filled `height: 1px` or `height: 2px` black rectangle is a dependable\nhorizontal divider. Make critical dividers and small icon strokes 2px when\npossible; keep detail sparse. Prefer filled pixel shapes for small icons.\n\nFor SVG, set matching integer `width`, `height` and `viewBox` dimensions so\none SVG unit is one screen pixel. Use `shape-rendering=\"crispEdges\"` for\nrectilinear charts and icons; it is a rendering hint, not a substitute for\ncorrect geometry. Use filled `<rect>` elements for rules to avoid stroke\ncentering. [SVG shape rendering](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/shape-rendering)\n\n```html\n<svg\n  width=\"336\"\n  height=\"18\"\n  viewBox=\"0 0 336 18\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  shape-rendering=\"crispEdges\"\n>\n  <rect x=\"0\" y=\"0\" width=\"336\" height=\"2\" fill=\"#000\" />\n  <rect x=\"0\" y=\"8\" width=\"160\" height=\"8\" fill=\"#000\" />\n</svg>\n```\n\nFor a canvas or SVG stroke, its width is centered on the path: align an\naxis-aligned **1px stroke at a half-pixel coordinate**, or a **2px stroke at an\ninteger coordinate**, when rendering 1:1. Do not shift the entire page by\nhalf a pixel; CSS filled boxes use integer edges. [Stroke alignment](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors)\n\nFor pixel-art raster assets, use native size or an integer scale with\n`image-rendering: pixelated`. For canvas image scaling also set\n`ctx.imageSmoothingEnabled = false`. These control raster-image scaling;\n**they do not disable font or vector antialiasing**.\n[Pixel-art scaling](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look)\n[Canvas image smoothing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled)\n\nIn `mono1`, the server applies ordered dithering to grey pixels. `gray4`\nquantizes to sixteen levels, while `rgb565` retains colour. That can help photos,\nbut grey antialiased text becomes a dot pattern. Prefer already-black/white\ntext and UI; reserve dithered imagery for larger areas. Do not depend on\n`-webkit-font-smoothing: none`: it is not a portable Chromium/Linux solution.\n[Font smoothing limitations](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-smooth)\n\n## Copyable view\n\n### Photos and other raster images\n\nDiscover image URLs from the actual source page; never guess an asset path.\nResolve relative URLs against that page. Before rendering, fetch the chosen\nURL and check for a successful HTTP status and an `image/` content type.\nA 404 page is not an image, even when its URL ends in `.jpg`.\n\nUse an explicit `<img src=\"...\" width=\"400\" height=\"300\"\nstyle=\"object-fit:contain\">`, with an HTML-escaped URL. The setter waits for\nevery `<img>` to decode before capture, up to five seconds. A broken or slow\nimage fails the call and leaves the previous screen intact. Use `<img>` for\nphotos, rather than CSS background images, so this check covers them.\nFor assets that block remote loading, fetch and embed a real image data URL\nonly if the whole HTML still fits the 24,000-character limit. Do not invent\nbase64 or truncate an image to fit. Choose a smaller source if necessary.\n\nIf rendering fails, report it or choose another verified source. A successful\ntransfer confirms the rendered pixels reached the panel; it does not prove\nthat the photo depicts the requested subject.\n\n### Text and layout\n\nRun this code inside your normal `<codemode>` response. Change the content\nand layout, keep the font embedding and screen dimensions. Escape any\nuntrusted values before inserting them into HTML. The helper accepts at most\n24,000 HTML characters, including the roughly 3.5KB embedded font CSS.\n\n```ts\nconst root = itx.cd(\"/\");\nconst fontCSS = await root.kv.get(\"voice/screen-font.css\");\nif (!fontCSS) throw new Error(\"Screen font is not installed\");\n\nconst html = `<!doctype html><html><head><meta charset=\"utf-8\"><style>\n${fontCSS}\n* { box-sizing: border-box; }\nhtml, body { width: 400px; height: 300px; margin: 0; overflow: hidden; }\nbody {\n  padding: 16px; background: #fff; color: #000;\n  font: 400 16px/24px \"Iterate Pixel\", monospace;\n  font-kerning: none; font-variant-ligatures: none; letter-spacing: 0;\n}\nmain { height: 268px; border: 2px solid #000; padding: 14px; }\nh1 { margin: 0; font: 400 24px/32px \"Iterate Pixel\", monospace; }\np { margin: 8px 0 0; }\n.rule { height: 2px; margin: 12px 0; background: #000; }\n.grid { display: grid; grid-template-columns: 160px 160px; gap: 16px; }\n.cell { height: 80px; border: 1px solid #000; padding: 11px; }\n.label { font-size: 16px; line-height: 16px; }\n.value { margin-top: 8px; font-size: 24px; line-height: 32px; }\nfooter { margin-top: 16px; }\n</style></head><body><main>\n<h1>NEXT STEP</h1><p>Focus for 25 min</p><div class=\"rule\"></div>\n<div class=\"grid\">\n  <div class=\"cell\"><div class=\"label\">TIME</div><div class=\"value\">25:00</div></div>\n  <div class=\"cell\"><div class=\"label\">STEP</div><div class=\"value\">1 / 3</div></div>\n</div>\n<footer>KEY: start/stop</footer>\n</main></body></html>`;\n\nreturn await root.voice.setImage({\n  device: \"{{DEVICE}}\",\n  image: { html },\n});\n```\n\nTo restore the normal status screen, use **the same setter**:\n\n```ts\nreturn await itx.cd(\"/\").voice.setImage({\n  device: \"{{DEVICE}}\",\n  image: null,\n});\n```\n\nSay the image was shown only after the setter returns `shown: true`. It\nreturns once the device has finished its refresh.\nThis acknowledges the controller operation, not an optical measurement. A failure must\nbe reported rather than described as success.\n\nFor previews, `itx.browser.quickAction(\"screenshot\", { html,\nviewport: { width: 400, height: 300, deviceScaleFactor: 1 },\nscreenshotOptions: { type: \"png\", fullPage: false } })` returns PNG bytes.\nInspect the final 1-bit result as well as the browser screenshot when checking\nnew layouts. [Cloudflare screenshots](https://developers.cloudflare.com/browser-run/quick-actions/screenshot-endpoint/)\n";
//#endregion
//#region src/voice-context.md
var voice_context_default = "# Answering a voice call\n\nThis conversation is a spoken call. A live voice model talks to the person and\nhands you the requests it cannot answer itself. Each hand-over is one message\nfrom this call's own context, where the voice model's relay runs, with the\nwords said since the last one: `Person:` lines are the person, `Voice:` lines\nare the voice model. The voice model reads your final answer aloud.\n\n- Your final answer, prose with no codemode block, is what the person hears.\n  Keep it to one to three short sentences, with no markdown and no preamble.\n  Be exact about numbers and names.\n- Write no prose beside a codemode block. Its status is the progress the\n  voice model sees while the script runs, and prose there would guess at a\n  result you have not seen. Report actions and failures only from script\n  results you have observed.\n- End every turn with a final answer, including when you are blocked: say\n  what stopped you and what you already changed.\n- If the person asked to end the call, answer with a short goodbye and end\n  your answer with the token HANG_UP.\n";
//#endregion
//#region \0@oxc-project+runtime@0.151.0/helpers/esm/usingCtx.js
function _usingCtx() {
	var r = "function" == typeof SuppressedError ? SuppressedError : function(r, e) {
		var n = Error();
		return n.name = "SuppressedError", n.error = r, n.suppressed = e, n;
	}, e = {}, n = [];
	function using(r, e) {
		if (null != e) {
			if (Object(e) !== e) throw new TypeError("using declarations can only be used with objects, functions, null, or undefined.");
			if (r) var o = e[Symbol.asyncDispose || Symbol["for"]("Symbol.asyncDispose")];
			if (void 0 === o && (o = e[Symbol.dispose || Symbol["for"]("Symbol.dispose")], r)) var t = o;
			if ("function" != typeof o) throw new TypeError("Object is not disposable.");
			t && (o = function o() {
				try {
					t.call(e);
				} catch (r) {
					return Promise.reject(r);
				}
			}), n.push({
				v: e,
				d: o,
				a: r
			});
		} else r && n.push({
			d: e,
			a: r
		});
		return e;
	}
	return {
		e,
		u: using.bind(null, !1),
		a: using.bind(null, !0),
		d: function d() {
			var o, t = this.e, s = 0;
			function next() {
				for (; o = n.pop();) try {
					if (!o.a && 1 === s) return s = 0, n.push(o), Promise.resolve().then(next);
					if (o.d) {
						var r = o.d.call(o.v);
						if (o.a) return s |= 2, Promise.resolve(r).then(next, err);
					} else s |= 1;
				} catch (r) {
					return err(r);
				}
				if (1 === s) return t !== e ? Promise.reject(t) : Promise.resolve();
				if (t !== e) throw t;
			}
			function err(n) {
				return t = t !== e ? new r(n, t) : n, next();
			}
			return next();
		}
	};
}
//#endregion
//#region src/worker.ts
var VoiceWorker = class extends IterateConfigEntrypoint {
	async health() {
		try {
			var _usingCtx$2 = _usingCtx();
			const { projectId } = await _usingCtx$2.u(this.getItx()).whoami();
			return {
				ok: true,
				projectId
			};
		} catch (_) {
			_usingCtx$2.e = _;
		} finally {
			_usingCtx$2.d();
		}
	}
	/** Render to the resolution and pixel format advertised by the target. */
	async setImage(rawInput) {
		try {
			var _usingCtx3 = _usingCtx();
			const input = ScreenImageInput.parse(rawInput);
			const startedAt = Date.now();
			const itx = _usingCtx3.u(this.getItx());
			const screen = itx.clients[input.device].screen;
			const info = ScreenInfo.parse(await screen.info());
			if (!input.image) {
				const transferStartedAt = Date.now();
				await screen.setImage(null);
				return {
					shown: false,
					bytes: 0,
					renderMs: 0,
					transferMs: Date.now() - transferStartedAt,
					totalMs: Date.now() - startedAt
				};
			}
			const format = input.image.format || info.preferredFormat;
			if (!info.formats.includes(format)) throw new Error(`Screen does not support ${format}`);
			const renderStartedAt = Date.now();
			const png = await itx.browser.quickAction("screenshot", {
				html: input.image.html,
				viewport: {
					width: info.width,
					height: info.height,
					deviceScaleFactor: 1
				},
				addScriptTag: [{ content: `
          document.documentElement.removeAttribute("data-iterate-screen-assets");
          Promise.all([
            ...Array.from(document.images, image => { image.loading = "eager"; return image.decode(); }),
            document.fonts.ready,
          ]).then(
            () => document.documentElement.setAttribute("data-iterate-screen-assets", "ready"),
            () => document.documentElement.setAttribute("data-iterate-screen-assets", "failed"),
          );
        ` }],
				waitForSelector: {
					selector: "[data-iterate-screen-assets=\"ready\"]",
					timeout: 5e3
				},
				screenshotOptions: {
					type: "png",
					fullPage: false
				}
			});
			const renderMs = Date.now() - renderStartedAt;
			const bitmap = renderScreenPixels(png instanceof Uint8Array ? png : new Uint8Array(png), info, format);
			const uploadId = Math.floor(Math.random() * 2147483647);
			const transferStartedAt = Date.now();
			let slowestChunkMs = 0;
			for (let offset = 0; offset < bitmap.length; offset += info.maxChunkBytes) {
				const expected = Math.min(offset + info.maxChunkBytes, bitmap.length);
				const sentAt = Date.now();
				const answer = screen.setImage({
					uploadId,
					format,
					offset,
					data: bytesToBase64(bitmap.subarray(offset, expected))
				});
				let refreshDeadline;
				const acknowledged = await (expected < bitmap.length ? answer : Promise.race([answer, new Promise((_, reject) => {
					refreshDeadline = setTimeout(() => reject(/* @__PURE__ */ new Error("Screen refresh timed out")), slowestChunkMs + info.refreshTimeoutMs);
				})]).finally(() => {
					if (refreshDeadline) clearTimeout(refreshDeadline);
				}));
				slowestChunkMs = Math.max(slowestChunkMs, Date.now() - sentAt);
				if (acknowledged !== expected) throw new Error(`screen acknowledged ${String(acknowledged)} bytes; expected ${String(expected)}`);
			}
			const transferMs = Date.now() - transferStartedAt;
			return {
				shown: true,
				width: info.width,
				height: info.height,
				format,
				bytes: bitmap.length,
				renderMs,
				transferMs,
				totalMs: Date.now() - startedAt
			};
		} catch (_) {
			_usingCtx3.e = _;
		} finally {
			_usingCtx3.d();
		}
	}
	/** The press. `activation` is the device's call identity: the call starts under it at boot and
	* the microphone frames carry it. */
	async setupVoiceAgent(options) {
		try {
			var _usingCtx4 = _usingCtx();
			const { streamPath } = options;
			if (!streamPath.startsWith("/")) throw new Error(`voice streamPath must be absolute; received ${JSON.stringify(streamPath)}`);
			const screenDevice = options.screen ? ScreenImageInput.shape.device.parse(options.screen) : void 0;
			const itx = _usingCtx4.u(this.getItx());
			await itx.agents.create(streamPath);
			const instruction = (key, content) => ({
				type: "events.iterate.com/agent/context-added",
				idempotencyKey: `voice-agent/${key}:${options.activation}`,
				payload: {
					role: "developer",
					content,
					llmRequestPolicy: { behaviour: "dont-trigger-request" }
				}
			});
			await itx.cd(streamPath).append({
				type: "events.iterate.com/itx/subscription-configured",
				payload: {
					name: "voice-agent",
					target: [
						"itx",
						"facets",
						[
							"get",
							"voice-agent",
							voiceAgentFacetSpec
						],
						"processEventBatch"
					],
					consumes: [
						"*",
						"events.iterate.com/voice-agent/mic-frame",
						"events.iterate.com/voice-agent/keepalive"
					]
				}
			}, {
				type: "events.iterate.com/voice-agent/call-started",
				idempotencyKey: `voice-agent/call:${options.activation}`,
				payload: {
					activation: options.activation,
					conversationId: `conv_${options.activation}`
				}
			}, instruction("voice-context", voice_context_default), ...screenDevice ? [instruction("screen-context", screen_context_default.replaceAll("{{DEVICE}}", screenDevice))] : []);
			return { streamPath };
		} catch (_) {
			_usingCtx4.e = _;
		} finally {
			_usingCtx4.d();
		}
	}
};
//#endregion
//#region src/voice-agent.ts
/** The device's call identity: the press mints it, the frames carry it. */
const Activation = z.string().min(1).max(64);
/** Fixed GPT-Live session configuration. */
const LIVE = {
	url: "https://api.openai.com/v1/live/sessions",
	model: "gpt-live-1",
	voice: "marin",
	rate: 16e3
};
/** 16 kHz mono PCM16: two bytes per sample, sixteen samples per millisecond. */
const PCM16_BYTES_PER_MS = 32;
/** The most audio one speaker frame may carry: one 100 ms GPT-Live delta, which fits the
* device's 4,800-byte decoded chunk and 6,912-byte base64 buffer. */
const MAX_SPEAKER_PAYLOAD_BYTES = 3200;
/** The device holds ten seconds of speaker audio; more than that queued here means an append
* has stalled. */
const SPEAKER_OUTBOX_MAX_BYTES = 1e4 * PCM16_BYTES_PER_MS;
/** A transcript fragment this far (on the session timeline) after the same speaker's previous
* one starts a new turn; the fragments themselves carry no turn boundaries. The two speakers may
* overlap, so the open rows are per speaker. */
const TURN_GAP_MS = 1200;
/** No input from the device for this long and the call is over. */
const IDLE_TIMEOUT_MS = 6e4;
/** GPT-Live's session timeline runs on INPUT audio, silence included; a device that goes quiet
* starves it and an answer dies mid-sentence. Whenever no device audio covers the clock, one
* frame of digital silence this long goes to the provider instead. */
const SILENCE_FILL_MS = 100;
const SILENCE_FILL_FRAME_B64 = bytesToBase64(/* @__PURE__ */ new Uint8Array(3200));
/** The idle stamp in the fold advances in steps of this, not per frame: the deadline is a
* minute, so most microphone batches leave the reduced state untouched. */
const IDLE_STAMP_STEP_MS = 5e3;
/** Socket creation and `session.started` must both finish within this bound. */
const OPENING_DEADLINE_MS = 15e3;
/** An agent answer ending in this token (voice-context.md asks for it after a goodbye) arms a
* hang-up before GPT-Live speaks the goodbye: the call ends at the first answer ending after that,
* or after this grace when no answer arrives. The token itself is never spoken. */
const HANG_UP_TOKEN = "HANG_UP";
const HANG_UP_GOODBYE_GRACE_MS = 8e3;
/** Microphone audio held while the provider completes its handshake: 21 s covers the clients'
* 20 s opening capture. Overflow ends the call with a reason, because keeping a truncated request
* would tell the model a different one. */
const MAX_HELD_MIC_BYTES = 21e3 * PCM16_BYTES_PER_MS;
/** What the live model is told about the arrangement, structured the way the provider's prompting
* guide asks (role, backchannel policy, interruption policy, a labelled delegation policy). It is
* transparent about the backend on purpose: a model forbidden to mention it invented explanations
* for delays. */
const LIVE_DELEGATION_POLICY = [
	"Backchannel policy: Use moderate backchannels. Acknowledge naturally without competing",
	"with the main response.",
	"Interruption policy: Stop speaking when the user interrupts. Listen to what they say.",
	"",
	"Delegation policy:",
	"Backend tools:",
	"- This project’s standard Agent processor: it can read and change the",
	"  project, look things up, run scripts, and end this call after saying goodbye.",
	"Ending the call:",
	"- Always request a NEW client delegation when the user asks to end or hang up,",
	"  or when the conversation is clearly over, even after earlier backend work completed.",
	"- Only the backend closes the call. Saying goodbye does not close it: delegate",
	"  BEFORE a goodbye, then wait for the backend's goodbye result.",
	"- Do not stop conversing merely because you acknowledged ending. If the user still",
	"  asks, respond and delegate again.",
	"Delegate to the backend when:",
	"- The person asks for information, reasoning, a lookup, a change, device control, or",
	"  ending the call. Delegate even trivial requests. When uncertain, delegate.",
	"- The person repeats or corrects a request. Every newly spoken request needs a NEW",
	"  client delegation, even if an identical request appears in prior conversation history.",
	"Do not delegate to the backend when:",
	"- It is social conversation, a brief clarifying question, or repeating a verified result.",
	"Request client delegation IMMEDIATELY, BEFORE acknowledging an action or saying",
	"you will check. Saying 'I'll check' does not start backend work. Only after delegating",
	"may you say you've handed it over. Past acknowledgments in conversation history do not",
	"mean a request in this new call has been delegated. Keep conversing while the Agent works.",
	"Do not guess results or invent progress. Say a thing is",
	"done only when the backend has reported it done for THAT request. Relay backend results",
	"faithfully, read one out in full when the person wants the details, and correct yourself",
	"plainly if one contradicts something you said. If the backend reports a failure, SAY SO",
	"— never invent an explanation for a delay or a result you have not seen."
].join("\n");
/** Fold one finished turn onto the recap: the newest 20 turns, each cut to 600 characters, well
* inside the provider's 128-message / 8,192-token `input` history. */
function foldTranscriptTurn(transcript, turn) {
	const text = turn.text.length > 600 ? `${turn.text.slice(0, 600)}…` : turn.text;
	return [...transcript, {
		role: turn.role,
		text
	}].slice(-20);
}
/** Each Live context append allows 500 tokens. UTF-8 bytes are a conservative upper bound,
* independent of language and tokenizer; split at spaces where possible. */
function* commentaryChunks(text) {
	const encoder = new TextEncoder();
	let chunk = "";
	let bytes = 0;
	for (const character of text) {
		const size = encoder.encode(character).length;
		if (bytes + size > 500) {
			const space = chunk.lastIndexOf(" ");
			const boundary = space > 0 ? space + 1 : chunk.length;
			yield chunk.slice(0, boundary);
			chunk = chunk.slice(boundary);
			bytes = encoder.encode(chunk).length;
		}
		chunk += character;
		bytes += size;
	}
	if (chunk) yield chunk;
}
function base64ToBytes(base64) {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
	return bytes;
}
/** Decoded byte length of a base64 string, without decoding it. */
function base64ByteLength(base64) {
	const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
	return Math.floor(base64.length / 4) * 3 - padding;
}
/** All-zero bytes encode to nothing but `A`s (plus padding). */
const ALL_ZERO_BASE64 = /^A+=*$/;
/** The loudest sample in a base64 PCM16 delta. Exact digital silence, the idle stream's whole
* content, is recognised off the string; anything else decodes once and scans. */
function peakOfBase64Pcm16(base64) {
	if (base64 === "" || ALL_ZERO_BASE64.test(base64)) return 0;
	const bytes = base64ToBytes(base64);
	let peak = 0;
	for (let index = 0; index + 1 < bytes.length; index += 2) {
		const sample = (bytes[index] | bytes[index + 1] << 8) << 16 >> 16;
		const magnitude = sample < 0 ? -sample : sample;
		if (magnitude > peak) peak = magnitude;
	}
	return peak;
}
/** Everything that outlives the Durable Object holding the socket. No queues, no byte counts, no
* "is speaking" flag: reduced state that depends on a buffer no restart can replay is a lie. */
const VoiceState = z.object({
	/** The rolling recap of finished turns, folded from the transcript events and seeded as history
	* into every fresh provider session, so a re-dial resumes the conversation. */
	transcript: z.array(z.strictObject({
		role: z.enum(["listener", "assistant"]),
		text: z.string()
	})).default([]),
	call: z.object({
		conversationId: z.string(),
		activation: Activation,
		/** When the stream committed the device's most recent input (a mic frame or a keepalive).
		* The device's input only: the agent's own speech leaves no durable event. */
		lastDeviceInputAtStreamMs: z.number()
	}).nullable().default(null),
	/** How the last call ended, for the live view a browser renders after hanging up. */
	lastEnd: z.object({
		activation: Activation,
		reason: z.string()
	}).nullable().default(null)
});
const VoiceAgentContract = defineProcessorContract({
	slug: "voice-agent",
	version: "2.0.0",
	description: "Runs a GPT-Live voice call in the conversation's own Durable Object, relaying audio both ways as it arrives and the live model's delegations to the agent on the same context.",
	stateSchema: VoiceState,
	events: {
		"events.iterate.com/voice-agent/keepalive": {
			description: "The client's call UI is alive, said every ~20s: feeds the idle deadline so a caller who waits quietly is not reaped at 60s of mic silence.",
			ephemeral: true,
			payloadSchema: z.strictObject({})
		},
		"events.iterate.com/voice-agent/mic-frame": {
			description: "One capture chunk of the call named by its activation.",
			ephemeral: true,
			payloadSchema: z.looseObject({
				activation: Activation,
				/** 16 kHz mono PCM16, base64. */
				pcm: z.string()
			})
		},
		"events.iterate.com/voice-agent/call-started": {
			description: "The press opened the call: the device's activation and the conversation id derived from it.",
			payloadSchema: z.looseObject({
				activation: Activation,
				conversationId: z.string()
			})
		},
		"events.iterate.com/voice-agent/conversation-accepted": {
			description: "The provider started the session; the call is live.",
			payloadSchema: z.looseObject({
				activation: Activation,
				conversationId: z.string(),
				/** Facet clock: dial to usable. */
				handshakeTookMs: z.number(),
				/** Facet clock: dial to the provider's 101, the egress and upgrade share of the handshake. */
				upgradeTookMs: z.number(),
				/** Capture held during the handshake and released in one go. */
				heldMicFrames: z.number()
			})
		},
		"events.iterate.com/voice-agent/call-ended": {
			description: "The call is over; the device appends it too (the hang-up button).",
			payloadSchema: z.looseObject({
				activation: Activation,
				reason: z.string()
			})
		},
		"events.iterate.com/voice-agent/provider-error-reported": {
			description: "The provider reported an error, verbatim.",
			payloadSchema: z.looseObject({
				conversationId: z.string(),
				message: z.string()
			})
		},
		"events.iterate.com/voice-agent/provider-disconnected": {
			description: "The provider's session or socket closed under a live call.",
			payloadSchema: z.looseObject({
				conversationId: z.string(),
				reason: z.string()
			})
		},
		"events.iterate.com/voice-agent/utterance-transcribed": {
			description: "The provider's transcription of one finished listener turn.",
			payloadSchema: z.looseObject({
				conversationId: z.string(),
				text: z.string(),
				key: z.string().optional()
			})
		},
		"events.iterate.com/voice-agent/answer-transcribed": {
			description: "The provider's own transcript of one finished spoken answer — what was said, not necessarily what was heard: the listener may have talked over it.",
			payloadSchema: z.looseObject({
				conversationId: z.string(),
				text: z.string(),
				key: z.string().optional()
			})
		},
		"events.iterate.com/voice-agent/speaker-frame": {
			description: "One chunk of the answer, forwarded as it arrived.",
			ephemeral: true,
			payloadSchema: z.looseObject({
				activation: Activation,
				conversationId: z.string(),
				/** 16 kHz mono PCM16, base64. Empty on a frame whose only job is the end marker. */
				pcm: z.string(),
				/** Throw away everything queued, then play this frame. */
				clearSpeakerBufferBeforeFrame: z.boolean().optional(),
				/** Nothing more is coming for this answer. */
				lastFrameOfAnswer: z.boolean().optional()
			})
		}
	},
	processorDeps: [AgentContract],
	consumes: [
		"events.iterate.com/agent/summary-updated",
		"events.iterate.com/agent/web-message-sent",
		"events.iterate.com/agent/paused",
		"events.iterate.com/voice-agent/call-started",
		"events.iterate.com/voice-agent/call-ended",
		"events.iterate.com/voice-agent/utterance-transcribed",
		"events.iterate.com/voice-agent/answer-transcribed",
		"events.iterate.com/voice-agent/mic-frame",
		"events.iterate.com/voice-agent/keepalive"
	],
	emits: [
		"events.iterate.com/voice-agent/conversation-accepted",
		"events.iterate.com/voice-agent/call-ended",
		"events.iterate.com/voice-agent/provider-error-reported",
		"events.iterate.com/voice-agent/provider-disconnected",
		"events.iterate.com/voice-agent/utterance-transcribed",
		"events.iterate.com/voice-agent/answer-transcribed",
		"events.iterate.com/voice-agent/speaker-frame"
	]
});
const freshAnswer = () => ({
	phase: "settled",
	trailingSilenceMs: 0
});
const freshDial = (conversationId, activation) => ({
	conversationId,
	activation,
	dialId: crypto.randomUUID(),
	socket: null,
	ready: false,
	socketReadyAtFacetMs: 0,
	micQueue: [],
	micQueueBytes: 0,
	speakerOutbox: [],
	speakerOutboxBytes: 0,
	speakerOutboxOverflowed: false,
	sending: false,
	wakeSender: null,
	lastSpeakerFrameAtFacetMs: 0,
	clearSpeakerBufferBeforeNextFrame: true,
	hangUpReason: null,
	hangUpArmedAtFacetMs: 0,
	answerBeforeHangUp: null,
	transcript: [],
	turnsForAgent: [],
	delegations: [],
	answer: freshAnswer(),
	micAudioCoveredUntilFacetMs: 0,
	timelineMs: 0,
	turns: {
		user: null,
		assistant: null
	}
});
var VoiceAgentProcessor = class extends StreamProcessor {
	contract = VoiceAgentContract;
	deps;
	constructor(deps) {
		super();
		this.deps = deps;
	}
	/** The engine's `append` and fire-and-forget helper as handed over by the latest delivery.
	* Provider messages arrive outside any delivery and use these. */
	#append;
	#background;
	/** The dial this incarnation runs, or null. Created synchronously the moment a dial is decided,
	* so two deliveries cannot open two sockets, and null again when it fails, its socket closes or
	* the call is hung up. Every closure the dial spawns fences itself with `this.#dial !== dial`. */
	#dial = null;
	/** The fold's `lastDeviceInputAtStreamMs`, mirrored for the idle tick that runs between
	* deliveries and cannot read the fold. */
	#lastDeviceInputAtStreamMsMirror = 0;
	/** The activation whose terminal event is travelling through the log. */
	#endingActivation = null;
	reduce({ state, event }) {
		const committedAtStreamMs = Date.parse(event.createdAt);
		switch (event.type) {
			case "events.iterate.com/voice-agent/call-started":
				if (state.call) return state;
				return {
					...state,
					call: {
						conversationId: event.payload.conversationId,
						activation: event.payload.activation,
						lastDeviceInputAtStreamMs: committedAtStreamMs
					}
				};
			case "events.iterate.com/voice-agent/mic-frame":
			case "events.iterate.com/voice-agent/keepalive": return !state.call || committedAtStreamMs - state.call.lastDeviceInputAtStreamMs < IDLE_STAMP_STEP_MS ? state : {
				...state,
				call: {
					...state.call,
					lastDeviceInputAtStreamMs: Math.max(state.call.lastDeviceInputAtStreamMs, committedAtStreamMs)
				}
			};
			case "events.iterate.com/voice-agent/call-ended": return state.call?.activation === event.payload.activation ? {
				...state,
				call: null,
				lastEnd: {
					activation: event.payload.activation,
					reason: event.payload.reason
				}
			} : state;
			case "events.iterate.com/voice-agent/utterance-transcribed":
				if (event.payload.text === "") return state;
				return {
					...state,
					transcript: foldTranscriptTurn(state.transcript, {
						role: "listener",
						text: event.payload.text
					})
				};
			case "events.iterate.com/voice-agent/answer-transcribed":
				if (event.payload.text === "") return state;
				return {
					...state,
					transcript: foldTranscriptTurn(state.transcript, {
						role: "assistant",
						text: event.payload.text
					})
				};
			default: return state;
		}
	}
	/** The engine publishes this after every batch — twenty microphone batches a second during a
	* call, so the runtime facts (dial ready, answer speaking) reach the page within a frame. */
	projectLiveState(state) {
		const dial = this.#dial;
		return {
			phase: state.call ? dial?.activation === state.call.activation && dial.ready ? "live" : "dialing" : state.lastEnd ? "ended" : "idle",
			activation: state.call?.activation || null,
			answering: Boolean(dial?.ready) && dial?.answer.phase === "speaking",
			transcript: state.transcript,
			lastEnd: state.lastEnd
		};
	}
	processEvent(args) {
		const { state, event, delivery } = args;
		this.#append = args.append;
		this.#background = args.runInBackground;
		if (state.call) this.#lastDeviceInputAtStreamMsMirror = state.call.lastDeviceInputAtStreamMs;
		if (event?.type === "events.iterate.com/voice-agent/call-started" && state.call?.activation === event.payload.activation && this.#dial === null) this.#openProviderConnection(state.call.conversationId, state.call.activation, state);
		const owedCall = delivery.caughtUp ? state.call : null;
		if (owedCall && this.#dial?.activation !== owedCall.activation) args.blockProcessorWhile(() => this.#end(owedCall.activation, "the voice session was interrupted"));
		if (event === null) return;
		switch (event.type) {
			case "events.iterate.com/agent/summary-updated": {
				const dial = this.#dial;
				if (!dial) return;
				this.#sendToLiveModel(dial, {
					kind: "thinking",
					delegationId: null,
					content: event.payload.activity,
					offset: event.offset
				});
				return;
			}
			case "events.iterate.com/agent/web-message-sent": {
				const dial = this.#dial;
				const { message, llmRequestOffset, besideScript } = event.payload;
				if (!dial || besideScript || !llmRequestOffset) return;
				if (message.includes(HANG_UP_TOKEN)) {
					dial.hangUpReason = "the Agent hung up";
					dial.hangUpArmedAtFacetMs = this.deps.nowAtFacetMs();
					dial.answerBeforeHangUp = dial.answer;
					this.#background(async () => {
						await this.deps.sleep(HANG_UP_GOODBYE_GRACE_MS);
						if (this.#dial !== dial || dial.answer.phase === "speaking") return;
						await this.#settleHangUp(dial);
					});
				}
				this.#sendToLiveModel(dial, {
					kind: "commentary",
					delegationId: dial.delegations.findLast((row) => row.offset < llmRequestOffset)?.delegationId ?? null,
					content: message.replace(HANG_UP_TOKEN, "").trim(),
					offset: event.offset
				});
				return;
			}
			case "events.iterate.com/agent/paused": {
				const dial = this.#dial;
				if (!dial) return;
				this.#sendToLiveModel(dial, {
					kind: "commentary",
					delegationId: dial.delegations.at(-1)?.delegationId ?? null,
					content: `The agent stopped working on the request: ${event.payload.reason}`,
					offset: event.offset
				});
				return;
			}
			case "events.iterate.com/voice-agent/mic-frame": {
				const micB64 = event.payload.pcm;
				if (micB64 === "") return;
				const dial = this.#dial;
				if (!dial || dial.activation !== event.payload.activation) return;
				const micBytes = base64ByteLength(micB64);
				if (dial.ready && dial.socket) {
					dial.micAudioCoveredUntilFacetMs += micBytes / PCM16_BYTES_PER_MS;
					this.#sendMicAudio(dial.socket, micB64);
					return;
				}
				if (dial.micQueueBytes + micBytes <= MAX_HELD_MIC_BYTES) {
					dial.micQueue.push(micB64);
					dial.micQueueBytes += micBytes;
					return;
				}
				this.#hangUp();
				this.#background(() => this.#end(dial.activation, `the provider did not become ready before ${MAX_HELD_MIC_BYTES / PCM16_BYTES_PER_MS}ms of microphone audio accumulated`));
				return;
			}
			case "events.iterate.com/voice-agent/call-ended": {
				const dial = this.#dial;
				if (dial && dial.activation === event.payload.activation) {
					this.#flushTurns(dial, true);
					this.#hangUp();
				}
				return;
			}
			default: return;
		}
	}
	/** Open a provider connection for this call, now. */
	#openProviderConnection(conversationId, activation, state) {
		if (this.#dial !== null) return;
		const dial = freshDial(conversationId, activation);
		dial.transcript = state.transcript;
		this.#dial = dial;
		const dialStartedAtFacetMs = this.deps.nowAtFacetMs();
		this.#background(async () => {
			await this.deps.sleep(OPENING_DEADLINE_MS);
			if (this.#dial !== dial || dial.ready) return;
			this.#releaseDial(dial);
			try {
				dial.socket?.close();
			} catch {}
			await this.#end(activation, `the provider did not become ready within ${OPENING_DEADLINE_MS}ms`);
		});
		this.#background(async () => {
			let socket;
			try {
				socket = await this.deps.dialProvider();
			} catch (error) {
				if (this.#dial !== dial) return;
				this.#releaseDial(dial);
				await this.#end(activation, `the provider dial failed: ${String(error).slice(0, 200)}`);
				return;
			}
			if (this.#dial !== dial) {
				try {
					socket.close();
				} catch {}
				return;
			}
			dial.socket = socket;
			dial.socketReadyAtFacetMs = this.deps.nowAtFacetMs();
			socket.addEventListener("message", (message) => {
				if (this.#dial !== dial) return;
				if (typeof message.data !== "string") return;
				let live;
				try {
					live = JSON.parse(message.data);
				} catch {
					return;
				}
				const type = String(live.type ?? "");
				const receivedAtFacetMs = this.deps.nowAtFacetMs();
				this.#onLiveEvent(dial, live, type, receivedAtFacetMs, dialStartedAtFacetMs);
				this.#flushTurns(dial, false);
			});
			socket.addEventListener("close", (event) => {
				if (this.#dial !== dial) return;
				this.#releaseDial(dial);
				this.#flushTurns(dial, true);
				this.#providerClosed(conversationId, activation, `the provider's socket closed (${String(event.code)}${event.reason ? ` ${event.reason}` : ""})`);
			});
			await this.#startSession(dial, state);
		});
		const idleTick = async () => {
			await this.deps.sleep(5e3);
			if (this.#dial !== dial) return;
			if (this.deps.nowAtFacetMs() - Math.max(this.#lastDeviceInputAtStreamMsMirror, dial.lastSpeakerFrameAtFacetMs) < IDLE_TIMEOUT_MS) {
				this.#background(idleTick);
				return;
			}
			await this.#end(activation, `no input from the device for ${IDLE_TIMEOUT_MS / 1e3}s`);
		};
		this.#background(idleTick);
	}
	/** Start client delegation with the policy and the recap as history. */
	async #startSession(dial, state) {
		if (!dial.socket) return;
		const input = state.transcript.map((turn) => turn.role === "listener" ? {
			type: "message",
			role: "user",
			content: [{
				type: "input_text",
				text: turn.text
			}]
		} : {
			type: "message",
			role: "assistant",
			content: [{
				type: "output_text",
				text: turn.text
			}]
		});
		dial.socket.send(JSON.stringify({
			type: "session.start",
			event_id: `start_${dial.dialId}`,
			session: {
				model: LIVE.model,
				instructions: LIVE_DELEGATION_POLICY + `\nCURRENT PROJECT: ${await this.deps.projectContext()}. Ingress refers to this project website.`,
				...input.length > 0 && { input },
				audio: {
					format: {
						type: "audio/pcm",
						rate: LIVE.rate
					},
					output: { voice: LIVE.voice }
				},
				delegation: { type: "client" }
			}
		}));
	}
	/** The provider's message switch. Every arm returns. */
	#onLiveEvent(dial, live, type, receivedAtFacetMs, dialStartedAtFacetMs) {
		const { conversationId } = dial;
		switch (type) {
			case "session.started": {
				dial.ready = true;
				const heldMicFrames = dial.micQueue.length;
				for (const held of dial.micQueue) this.#sendMicAudio(dial.socket, held);
				dial.micQueue = [];
				dial.micQueueBytes = 0;
				dial.micAudioCoveredUntilFacetMs = receivedAtFacetMs;
				this.#startSilenceFill(dial);
				this.#background(() => this.#append({
					type: "events.iterate.com/voice-agent/conversation-accepted",
					idempotencyKey: this.idempotencyKey(`accepted:${conversationId}:${dial.dialId}`),
					payload: {
						activation: dial.activation,
						conversationId,
						handshakeTookMs: receivedAtFacetMs - dialStartedAtFacetMs,
						upgradeTookMs: dial.socketReadyAtFacetMs - dialStartedAtFacetMs,
						heldMicFrames
					}
				}));
				return;
			}
			case "session.output_audio.delta":
				if (typeof live.delta !== "string") return;
				this.#onOutputAudio(dial, live.delta, receivedAtFacetMs);
				return;
			case "session.input_transcript.delta":
			case "session.output_transcript.delta": {
				if (typeof live.delta !== "string") return;
				const speaker = type === "session.input_transcript.delta" ? "user" : "assistant";
				const startTimelineMs = typeof live.start_ms === "number" ? live.start_ms : dial.timelineMs;
				const endTimelineMs = typeof live.end_ms === "number" ? live.end_ms : startTimelineMs;
				dial.timelineMs = Math.max(dial.timelineMs, endTimelineMs);
				const open = dial.turns[speaker];
				if (open && startTimelineMs - open.endTimelineMs >= TURN_GAP_MS) this.#closeTurn(dial, speaker);
				const row = dial.turns[speaker];
				if (!row) dial.turns[speaker] = {
					text: live.delta,
					startTimelineMs,
					endTimelineMs
				};
				else {
					row.text += live.delta;
					row.endTimelineMs = Math.max(row.endTimelineMs, endTimelineMs);
				}
				return;
			}
			case "session.delegation.created": {
				const parsed = z.object({ delegation: z.object({
					id: z.string().min(1).max(128),
					target: z.literal("client")
				}) }).safeParse(live);
				if (!parsed.success) return;
				this.#delegate(dial, parsed.data.delegation.id);
				return;
			}
			case "session.closed":
				this.#flushTurns(dial, true);
				this.#releaseDial(dial);
				this.#providerClosed(conversationId, dial.activation, `the provider closed the session (${String(live.reason ?? "unknown")})`);
				return;
			case "error":
				this.#background(() => this.#append({
					type: "events.iterate.com/voice-agent/provider-error-reported",
					payload: {
						conversationId,
						message: JSON.stringify(live.error ?? live).slice(0, 2e3)
					}
				}));
				return;
			default: return;
		}
	}
	/** One 100 ms delta of the provider's continuous output stream. The stream never stops, so
	* "is the voice speaking" is read off the audio: idle silence is dropped, speech opens an
	* answer and goes straight to the device, silence inside an answer rides along until the tail
	* bound ends the answer and `lastFrameOfAnswer` follows the last frame out. */
	#onOutputAudio(dial, delta, receivedAtFacetMs) {
		const deltaMs = base64ByteLength(delta) / PCM16_BYTES_PER_MS;
		dial.timelineMs += deltaMs;
		const speaking = peakOfBase64Pcm16(delta) >= 100;
		if (dial.answer.phase === "settled") {
			if (!speaking) return;
			dial.answer = {
				phase: "speaking",
				trailingSilenceMs: 0
			};
		} else if (speaking) dial.answer.trailingSilenceMs = 0;
		else {
			dial.answer.trailingSilenceMs += deltaMs;
			if (dial.answer.trailingSilenceMs >= 700) {
				this.#endAnswer(dial, receivedAtFacetMs);
				return;
			}
		}
		if (base64ByteLength(delta) <= MAX_SPEAKER_PAYLOAD_BYTES) {
			this.#sendSpeakerFrame(dial, delta, receivedAtFacetMs);
			return;
		}
		const pcm16 = base64ToBytes(delta);
		for (let cut = 0; cut < pcm16.length; cut += MAX_SPEAKER_PAYLOAD_BYTES) this.#sendSpeakerFrame(dial, bytesToBase64(pcm16.subarray(cut, Math.min(cut + MAX_SPEAKER_PAYLOAD_BYTES, pcm16.length))), receivedAtFacetMs);
	}
	#sendSpeakerFrame(dial, pcm, nowAtFacetMs) {
		if (dial.speakerOutboxOverflowed) return;
		const pcmBytes = base64ByteLength(pcm);
		if (dial.speakerOutboxBytes + pcmBytes > SPEAKER_OUTBOX_MAX_BYTES) {
			dial.speakerOutboxOverflowed = true;
			this.#background(() => this.#end(dial.activation, "the device speaker append stalled with more than ten seconds of queued audio"));
			return;
		}
		dial.lastSpeakerFrameAtFacetMs = nowAtFacetMs;
		dial.speakerOutbox.push({ pcm });
		dial.speakerOutboxBytes += pcmBytes;
		this.#startSpeakerSender(dial);
	}
	/** The answer ended: the marker goes out behind the last frame, and a hang-up armed before this
	* answer ended is now settleable. */
	#endAnswer(dial, nowAtFacetMs) {
		const endedAnswer = dial.answer;
		dial.answer = freshAnswer();
		dial.speakerOutbox.push({
			pcm: "",
			lastFrameOfAnswer: true
		});
		this.#startSpeakerSender(dial);
		if (dial.hangUpReason && (endedAnswer !== dial.answerBeforeHangUp || nowAtFacetMs - dial.hangUpArmedAtFacetMs >= 8e3)) this.#background(async () => {
			await this.deps.sleep(1e3);
			await this.#settleHangUp(dial);
		});
	}
	/** End the call the backend asked to end, unless the dial is already gone. Idempotent. */
	async #settleHangUp(dial) {
		if (this.#dial !== dial || !dial.hangUpReason) return;
		const reason = dial.hangUpReason;
		dial.hangUpReason = null;
		await this.#end(dial.activation, reason);
	}
	/** Send queued speaker frames in order for the lifetime of the dial, one frame per append (a
	* client push carries every event folded behind it, and the ESP32's inbox slot holds 16 KiB).
	* A rejected append ends the call: lost audio, a lost clear or a lost end marker cannot be
	* recovered by continuing with the next frame. */
	#startSpeakerSender(dial) {
		if (dial.sending) {
			dial.wakeSender?.();
			return;
		}
		dial.sending = true;
		this.#background(async () => {
			try {
				while (this.#dial === dial) {
					const frame = dial.speakerOutbox.shift();
					if (!frame) {
						await new Promise((resolve) => {
							dial.wakeSender = resolve;
						});
						dial.wakeSender = null;
						continue;
					}
					dial.speakerOutboxBytes -= base64ByteLength(frame.pcm);
					const clearFirst = dial.clearSpeakerBufferBeforeNextFrame;
					dial.clearSpeakerBufferBeforeNextFrame = false;
					try {
						await this.#append({
							type: "events.iterate.com/voice-agent/speaker-frame",
							ephemeral: true,
							payload: {
								activation: dial.activation,
								conversationId: dial.conversationId,
								pcm: frame.pcm,
								...clearFirst && { clearSpeakerBufferBeforeFrame: true },
								...frame.lastFrameOfAnswer && { lastFrameOfAnswer: true }
							}
						});
					} catch {
						await this.#end(dial.activation, "the device speaker frame could not be appended");
						return;
					}
				}
			} finally {
				dial.sending = false;
				dial.wakeSender = null;
			}
		});
	}
	#flushTurns(dial, force) {
		for (const speaker of ["user", "assistant"]) {
			const row = dial.turns[speaker];
			if (!row) continue;
			if (force || dial.timelineMs - row.endTimelineMs >= TURN_GAP_MS) this.#closeTurn(dial, speaker);
		}
	}
	/** One finished turn leaves one durable event carrying its words, keyed on the dial and the
	* row's start so a redelivered close cannot write a turn twice. */
	#closeTurn(dial, speaker) {
		const row = dial.turns[speaker];
		dial.turns[speaker] = null;
		if (!row) return;
		const text = row.text.replace(/\s+/g, " ").trim();
		if (text === "") return;
		const turn = {
			role: speaker === "user" ? "listener" : "assistant",
			text
		};
		dial.transcript = foldTranscriptTurn(dial.transcript, turn);
		dial.turnsForAgent.push(turn);
		const key = `live-turn:${dial.dialId}:${speaker}:${String(row.startTimelineMs)}`;
		const transcriptKey = `voice-agent/transcript:${dial.dialId}:${speaker}:${String(row.startTimelineMs)}`;
		this.#background(() => speaker === "user" ? this.#append({
			type: "events.iterate.com/voice-agent/utterance-transcribed",
			idempotencyKey: this.idempotencyKey(key),
			payload: {
				conversationId: dial.conversationId,
				text,
				key: transcriptKey
			}
		}) : this.#append({
			type: "events.iterate.com/voice-agent/answer-transcribed",
			idempotencyKey: this.idempotencyKey(key),
			payload: {
				conversationId: dial.conversationId,
				text,
				key: transcriptKey
			}
		}));
	}
	#startSilenceFill(dial) {
		this.#background(async () => {
			while (this.#dial === dial && dial.socket && dial.ready) {
				await this.deps.sleep(SILENCE_FILL_MS);
				if (this.#dial !== dial || !dial.socket || !dial.ready) return;
				let owedMs = this.deps.nowAtFacetMs() - dial.micAudioCoveredUntilFacetMs;
				if (owedMs > 1e3) {
					await this.#end(dial.activation, `the provider input clock fell ${owedMs}ms behind`);
					return;
				}
				while (owedMs >= SILENCE_FILL_MS) {
					dial.micAudioCoveredUntilFacetMs += SILENCE_FILL_MS;
					owedMs -= SILENCE_FILL_MS;
					this.#sendMicAudio(dial.socket, SILENCE_FILL_FRAME_B64);
				}
			}
		});
	}
	#sendMicAudio(socket, b64) {
		const padded = b64.length % 4 === 0 ? b64 : b64 + "=".repeat(4 - b64.length % 4);
		socket.send(JSON.stringify({
			type: "session.input_audio.append",
			audio: padded
		}));
	}
	/** A provider close ends the uncertain session; it is never replayed. */
	#providerClosed(conversationId, activation, reason) {
		if (this.#endingActivation === activation) return;
		this.#background(async () => {
			await this.#end(activation, reason);
			await this.#append({
				type: "events.iterate.com/voice-agent/provider-disconnected",
				payload: {
					conversationId,
					reason
				}
			});
		});
	}
	async #end(activation, reason) {
		if (this.#endingActivation === activation) return;
		this.#endingActivation = activation;
		const dial = this.#dial;
		if (dial?.activation === activation) {
			this.#flushTurns(dial, true);
			this.#hangUp();
		}
		try {
			await this.#append({
				type: "events.iterate.com/voice-agent/call-ended",
				idempotencyKey: this.idempotencyKey(`ended:${activation}`),
				payload: {
					activation,
					reason
				}
			});
		} catch (error) {
			if (this.#endingActivation === activation) this.#endingActivation = null;
			throw error;
		}
	}
	/** The live model handed a request to the backend: hand the words said since the last hand-over
	* to the agent on this context, as one message, and tell the voice it may keep talking. The open
	* rows are closed first: they are usually the request itself. */
	#delegate(dial, delegationId) {
		this.#flushTurns(dial, true);
		const words = dial.turnsForAgent.map((turn) => `${turn.role === "listener" ? "Person" : "Voice"}: ${turn.text}`).join("\n");
		dial.turnsForAgent = [];
		this.#background(async () => {
			try {
				const { offset } = await this.deps.messageAgent(words || "The voice handed the request over again; nothing new was said.");
				if (this.#dial !== dial) return;
				dial.delegations = [...dial.delegations, {
					delegationId,
					offset
				}].sort((a, b) => a.offset - b.offset);
				this.#sendControl(dial, {
					type: "session.thinking.append",
					delegation_id: delegationId,
					content: "The request was handed to the backend; the conversation may continue."
				});
			} catch (error) {
				if (this.#dial !== dial) return;
				await this.#end(dial.activation, `the delegation could not be handed to the agent: ${String(error).slice(0, 200)}`);
			}
		});
	}
	/** Words from the agent for the live model: `commentary` to paraphrase aloud, `thinking` to use
	* quietly, in `commentaryChunks` under one delegation id. */
	#sendToLiveModel(dial, update) {
		let chunkIndex = 0;
		for (const content of commentaryChunks(update.content)) this.#sendControl(dial, {
			type: `session.${update.kind}.append`,
			event_id: `agent_${update.offset}_${chunkIndex++}`,
			delegation_id: update.delegationId,
			content
		});
	}
	#sendControl(dial, message) {
		if (!dial.socket) return;
		dial.socket.send(JSON.stringify(message));
	}
	/** Let go of the dial if it is still this incarnation's, waking its speaker sender so the sender
	* sees the dial is gone and returns instead of waiting on an outbox nothing fills any more. */
	#releaseDial(dial) {
		if (this.#dial !== dial) return;
		this.#dial = null;
		dial.wakeSender?.();
	}
	/** Let the dial and everything hanging off it go. Safe to call twice. The provider is asked to
	* close first (`session.close` is what makes it finalize usage) and the socket is closed behind
	* it without waiting. */
	#hangUp() {
		const dial = this.#dial;
		if (dial) this.#releaseDial(dial);
		try {
			if (dial?.ready && dial.socket) dial.socket.send(JSON.stringify({ type: "session.close" }));
		} catch {}
		try {
			dial?.socket?.close();
		} catch {}
	}
};
/** Open the provider's WebSocket. No query parameters (the model rides `session.start`), and the
* bearer is the platform's `getSecret` grammar, substituted at egress so the key never enters this
* isolate. */
async function dialProviderSocket() {
	const response = await fetch(LIVE.url, { headers: {
		Upgrade: "websocket",
		Authorization: "Bearer getSecret(\"/secrets/openai\")"
	} });
	const socket = response.webSocket;
	if (!socket) throw new Error(`Voice provider upgrade returned HTTP ${response.status}`);
	socket.binaryType = "arraybuffer";
	socket.accept();
	return socket;
}
/** The class the loader hosts: `facets.get("voice-agent", { source, className: "VoiceAgentDurableObject" })`. */
var VoiceAgentDurableObject = class extends StreamProcessorDurableObject {
	/** `itx.whoami()`, read once per incarnation: every dial's `session.start` names the project,
	*  and every hand-over names the agent by this context's path. */
	#whoami;
	async #identity() {
		try {
			var _usingCtx$1 = _usingCtx();
			if (this.#whoami) return this.#whoami;
			const itx = _usingCtx$1.u(this.getItx());
			return this.#whoami = await itx.whoami();
		} catch (_) {
			_usingCtx$1.e = _;
		} finally {
			_usingCtx$1.d();
		}
	}
	processor = new VoiceAgentProcessor({
		nowAtFacetMs: () => Date.now(),
		sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
		dialProvider: dialProviderSocket,
		projectContext: async () => JSON.stringify(await this.#identity()),
		messageAgent: async (words) => {
			try {
				var _usingCtx3 = _usingCtx();
				const { path } = await this.#identity();
				return await _usingCtx3.u(this.getItx()).agents.get(path).message(words);
			} catch (_) {
				_usingCtx3.e = _;
			} finally {
				_usingCtx3.d();
			}
		}
	});
};
//#endregion
export { VoiceAgentDurableObject, VoiceWorker as default };

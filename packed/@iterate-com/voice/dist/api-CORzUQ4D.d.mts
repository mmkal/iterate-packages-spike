import { z } from "zod";
//#region src/screen.d.ts
declare const ScreenInfo: z.ZodObject<{
  width: z.ZodNumber;
  height: z.ZodNumber;
  formats: z.ZodArray<z.ZodEnum<{
    gray4: "gray4";
    mono1: "mono1";
    rgb565: "rgb565";
  }>>;
  preferredFormat: z.ZodEnum<{
    gray4: "gray4";
    mono1: "mono1";
    rgb565: "rgb565";
  }>;
  maxChunkBytes: z.ZodNumber;
  refreshTimeoutMs: z.ZodNumber;
  partialRefresh: z.ZodBoolean;
}, z.core.$strip>;
declare const ScreenImageInput: z.ZodObject<{
  device: z.ZodString;
  image: z.ZodNullable<z.ZodObject<{
    html: z.ZodString;
    format: z.ZodOptional<z.ZodEnum<{
      gray4: "gray4";
      mono1: "mono1";
      rgb565: "rgb565";
    }>>;
  }, z.core.$strip>>;
}, z.core.$strip>;
//#endregion
//#region src/api.d.ts
/** `itx.voice`: the device's press, the screen renderer, and the installer's liveness probe. */
interface VoiceApi {
  /** The installer's check that the service loads and answers, in the project it names. */
  health(): Promise<{
    ok: true;
    projectId: string;
  }>;
  /** Render `image.html` in Browser Run at the device's advertised resolution and upload it to
   *  `itx.clients[device].screen` in its chunk size; `image: null` restores the call-status view. */
  setImage(input: z.input<typeof ScreenImageInput>): Promise<{
    shown: false;
    bytes: number;
    renderMs: number;
    transferMs: number;
    totalMs: number;
  } | {
    shown: true;
    width: number;
    height: number;
    format: z.infer<typeof ScreenInfo>["preferredFormat"];
    bytes: number;
    renderMs: number;
    transferMs: number;
    totalMs: number;
  }>;
  /** The press: create the agent at `streamPath`, which answers the call's delegations, put the
   *  voice relay beside it and start the call under `activation`. A caller names its call
   *  `/agents/voice/<client>/<UTC>-<activation>` (a Kit board's `<client>` is its `itx.clients`
   *  name, the voice app's is `web`). `screen` is the `itx.clients` name of a device with a
   *  screen: the call gets instructions for drawing on it with `setImage`. */
  setupVoiceAgent(options: {
    streamPath: string;
    activation: string;
    screen?: string;
  }): Promise<{
    streamPath: string;
  }>;
}
declare module "iterate/api" {
  interface InstalledAppRoots {
    voice: VoiceApi;
  }
}
//#endregion
export { VoiceApi as t };
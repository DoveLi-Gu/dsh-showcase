export const name: string;
export const inject: string[];
export type ShowcaseTheme = "frontier-signal" | "blue-big-fish";
export type ShowcaseSettings = {
  theme: ShowcaseTheme;
  generatePoster: boolean;
};
export const SETTINGS_NAMESPACE: string;
export const SETTINGS_RPC_CHANNEL: string;
export const Config: {
  (value?: { theme?: ShowcaseTheme; generatePoster?: boolean }): ShowcaseSettings;
  toJSON(): unknown;
};
export function apply(ctx: {
  connection: { rpc: { handle(channel: string, handler: (endpoint: string, payload: unknown) => Promise<unknown>, options: { authority: "loopback" }): unknown } };
  settings: { register(namespace: string, schema: unknown, options: { base: ShowcaseSettings }): { get(): ShowcaseSettings; update(patch: Partial<ShowcaseSettings>): Promise<void> } };
  tools: { register(definition: unknown): void };
}, config?: { theme?: ShowcaseTheme; generatePoster?: boolean }): void;

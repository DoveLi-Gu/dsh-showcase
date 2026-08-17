export const name: string;
export const inject: string[];
export type ShowcaseTheme = "frontier-signal" | "blue-big-fish";
export const SETTINGS_NAMESPACE: string;
export const SETTINGS_RPC_CHANNEL: string;
export const Config: {
  (value?: { theme?: ShowcaseTheme }): { theme: ShowcaseTheme };
  toJSON(): unknown;
};
export function apply(ctx: {
  connection: { rpc: { handle(channel: string, handler: (endpoint: string, payload: unknown) => Promise<unknown>, options: { authority: "loopback" }): unknown } };
  settings: { register(namespace: string, schema: unknown, options: { base: { theme: ShowcaseTheme } }): { get(): { theme: ShowcaseTheme }; update(patch: { theme: ShowcaseTheme }): Promise<void> } };
  tools: { register(definition: unknown): void };
}, config?: { theme?: ShowcaseTheme }): void;

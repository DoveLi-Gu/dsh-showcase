export const name: string;
export const inject: string[];
export type ShowcaseTheme = "frontier-signal" | "blue-big-fish";
export interface VolatileRef<T> {
  get(): T;
}
export type ShowcaseSettings = {
  theme: VolatileRef<ShowcaseTheme>;
  generatePoster: VolatileRef<boolean>;
};
export type ShowcaseSettingsInput = {
  theme?: ShowcaseTheme;
  generatePoster?: boolean;
};
export const SETTINGS_NAMESPACE: string;
export const Config: {
  (value?: ShowcaseSettingsInput): ShowcaseSettings;
  toJSON(): unknown;
};
export function apply(ctx: {
  connection?: unknown;
  settings: {
    describe?(): Array<{ ns: string; value?: Partial<Record<"theme" | "generatePoster", unknown>>; revision?: number }>;
    update?(namespace: string, patch: ShowcaseSettingsInput, expectedRevision?: number): Promise<void>;
    register?(namespace: string, schema: unknown, options: { base: ShowcaseSettingsInput }): { get(): ShowcaseSettingsInput; update(patch: ShowcaseSettingsInput): Promise<void> };
  };
  tools: { register(definition: unknown): void };
  inject?: (services: string[], apply: (ctx: { settings: { configure(options: { auto?: boolean }, owner?: unknown): () => void } }) => unknown) => unknown;
  fiber?: unknown;
  effect?: (callback: () => unknown, label?: string) => unknown;
}, config?: ShowcaseSettingsInput | ShowcaseSettings): void;

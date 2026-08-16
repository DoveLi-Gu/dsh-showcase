export const name: string;
export const inject: string[];
export const Config: unknown;
export function apply(ctx: { tools: { register(definition: unknown): void } }): void;

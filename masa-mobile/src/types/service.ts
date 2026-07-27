export type ServiceResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface WrapResult<T> {
  data: T;
  durationMs: number;
  error: any;
  errorStr: string;
}

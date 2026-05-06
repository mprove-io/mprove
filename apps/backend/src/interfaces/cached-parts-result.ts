export interface CachedPartsResult {
  values: {
    columnValue: string;
    count: number;
  }[];
  errorMessage?: string;
}

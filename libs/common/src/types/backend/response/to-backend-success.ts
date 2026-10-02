export type ToBackendSuccess<TOutput> = {
  type: 'Success';
  output: TOutput;
};

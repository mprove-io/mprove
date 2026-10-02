export type ToBackendFailure<TError> = {
  type: 'Failure';
  error: TError;
};

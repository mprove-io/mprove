export type ToBlockmlFailure<TError> = {
  type: 'Failure';
  error: TError;
};

export type ToDiskFailure<TError> = {
  type: 'Failure';
  error: TError;
};

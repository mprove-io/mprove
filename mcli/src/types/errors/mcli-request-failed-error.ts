export type McliRequestFailedError = {
  code: 'MCLI_REQUEST_FAILED';
  displayData: {
    status?: number;
    reason?: string;
  };
};

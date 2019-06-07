export function getResponseBodyInfoErrorMessage(error) {
  if (
    error &&
    error.data &&
    error.data.response &&
    error.data.response.body &&
    error.data.response.body.info &&
    error.data.response.body.info.error
  ) {
    return error.data.response.body.info.error.message;
  } else {
    return undefined;
  }
}

export function getResponseBodyInfoStatus(error) {
  if (
    error &&
    error.data &&
    error.data.response &&
    error.data.response.body &&
    error.data.response.body.info
  ) {
    return error.data.response.body.info.status;
  } else {
    return undefined;
  }
}

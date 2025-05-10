export const environment = {
  production: true,
  httpUrl:
    window.location.hostname === 'localhost'
      ? `${window.location.protocol}//localhost:3000`
      : ''
};

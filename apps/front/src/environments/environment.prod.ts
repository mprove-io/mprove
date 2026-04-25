import { EXPLORER_ENABLED } from '#common/constants/top-front';

export const environment = {
  production: true,
  explorerEnabled: EXPLORER_ENABLED,
  httpUrl:
    window.location.hostname === 'localhost'
      ? `${window.location.protocol}//localhost:3000`
      : ''
};

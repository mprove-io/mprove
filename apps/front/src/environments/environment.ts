// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { EXPLORER_ENABLED } from '#common/constants/top-front';

export const environment = {
  production: false,
  explorerEnabled: EXPLORER_ENABLED,
  httpUrl:
    window.location.hostname === 'localhost'
      ? `${window.location.protocol}//localhost:3000`
      : ''
};

import { toDiskControllers } from './controllers/to-disk-controllers';
import { toBlockmlControllers } from './controllers/to-blockml-controllers';
import { toSpecialControllers } from './controllers/to-special-controllers';
import { toBackendControllers } from './controllers/to-backend-controllers';

export const appControllers = [
  ...toDiskControllers,
  ...toBlockmlControllers,
  ...toSpecialControllers,
  ...toBackendControllers
];

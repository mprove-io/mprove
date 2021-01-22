import { toDiskControllers } from './controllers/to-disk/to-disk-controllers';
import { toBlockmlControllers } from './controllers/to-blockml/to-blockml-controllers';
import { toSpecialControllers } from './controllers/to-special/to-special-controllers';
import { toBackendControllers } from './controllers/to-backend/to-backend-controllers';

export const appControllers = [
  ...toDiskControllers,
  ...toBlockmlControllers,
  ...toSpecialControllers,
  ...toBackendControllers
];

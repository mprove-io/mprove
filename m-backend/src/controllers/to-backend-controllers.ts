import { ToBackendDeleteRecordsController } from './to-backend/records/delete-records.controller';
import { ToBackendSeedRecordsController } from './to-backend/records/seed-records.controller';
import { ToBackendRegisterUserController } from './to-backend/users/register-user.controller';

export const toBackendControllers = [
  // records
  ToBackendDeleteRecordsController,
  ToBackendSeedRecordsController,
  // users
  ToBackendRegisterUserController
];

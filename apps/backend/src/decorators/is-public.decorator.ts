import { SetMetadata } from '@nestjs/common';
import { constants } from '~backend/barrels/constants';

export const SkipJwtCheck = () => SetMetadata(constants.SKIP_JWT, true);

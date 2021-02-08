import { SetMetadata } from '@nestjs/common';
import { constants } from '~backend/barrels/constants';

export const Public = () => SetMetadata(constants.IS_PUBLIC_KEY, true);

import { SetMetadata } from '@nestjs/common';
import { SKIP_JWT } from '#common/constants/top-backend';

export const SkipJwtCheck = () => SetMetadata(SKIP_JWT, true);

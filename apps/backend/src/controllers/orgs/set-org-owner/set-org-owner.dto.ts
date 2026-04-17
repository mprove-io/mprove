import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetOrgOwnerRequest,
  zToBackendSetOrgOwnerResponse
} from '#common/zod/to-backend/orgs/to-backend-set-org-owner';

export class ToBackendSetOrgOwnerRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgOwnerRequest })
) {}

export class ToBackendSetOrgOwnerResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetOrgOwnerResponse })
) {}

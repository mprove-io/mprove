import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendIsOrgExistRequest,
  zToBackendIsOrgExistResponse
} from '#common/zod/to-backend/orgs/to-backend-is-org-exist';

export class ToBackendIsOrgExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsOrgExistRequest })
) {}

export class ToBackendIsOrgExistResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsOrgExistResponse })
) {}

import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetOrgUsersRequest,
  zToBackendGetOrgUsersResponse
} from '#common/zod/to-backend/org-users/to-backend-get-org-users';

export class ToBackendGetOrgUsersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgUsersRequest })
) {}

export class ToBackendGetOrgUsersResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgUsersResponse })
) {}

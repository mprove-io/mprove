import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetOrgUsersRequest } from '#common/zod/backend/routes/org-users/get-org-users/get-org-users-request';
import { zToBackendGetOrgUsersResponse } from '#common/zod/backend/routes/org-users/get-org-users/get-org-users-response';

export class ToBackendGetOrgUsersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgUsersRequest })
) {}

export class ToBackendGetOrgUsersResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgUsersResponse })
) {}

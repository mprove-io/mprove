import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetServerUsersRequest,
  zToBackendGetServerUsersResponse
} from '#common/zod/to-backend/users/to-backend-get-server-users';

export class ToBackendGetServerUsersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetServerUsersRequest })
) {}

export class ToBackendGetServerUsersResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetServerUsersResponse })
) {}

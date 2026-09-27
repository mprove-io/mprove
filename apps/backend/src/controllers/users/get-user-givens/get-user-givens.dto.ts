import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetUserGivensRequest } from '#common/zod/backend/routes/users/get-user-givens/get-user-givens-request';
import { zToBackendGetUserGivensResponse } from '#common/zod/backend/routes/users/get-user-givens/get-user-givens-response';

export class ToBackendGetUserGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserGivensRequest })
) {}

export class ToBackendGetUserGivensResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserGivensResponse })
) {}

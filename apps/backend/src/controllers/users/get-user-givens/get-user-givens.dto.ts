import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendGetUserGivensRequest,
  zToBackendGetUserGivensResponse
} from '#common/zod/to-backend/users/to-backend-get-user-givens';

export class ToBackendGetUserGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserGivensRequest })
) {}

export class ToBackendGetUserGivensResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserGivensResponse })
) {}

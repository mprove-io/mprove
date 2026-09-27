import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetStructRequest } from '#common/zod/backend/routes/structs/get-struct/get-struct-request';
import { zToBackendGetStructResponse } from '#common/zod/backend/routes/structs/get-struct/get-struct-response';

export class ToBackendGetStructRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStructRequest })
) {}

export class ToBackendGetStructResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStructResponse })
) {}

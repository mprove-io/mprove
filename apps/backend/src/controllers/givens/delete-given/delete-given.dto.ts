import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteGivenRequest } from '#common/types/backend/routes/givens/delete-given/delete-given-request';
import { zToBackendDeleteGivenResponse } from '#common/types/backend/routes/givens/delete-given/delete-given-response';

export class ToBackendDeleteGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteGivenRequest })
) {}

export class ToBackendDeleteGivenResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteGivenResponse
}) {}

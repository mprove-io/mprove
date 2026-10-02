import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteGivenRequest } from '#common/types/backend/routes/givens/delete-given/delete-given-request';
import { zToBackendDeleteGivenResponse } from '#common/types/backend/routes/givens/delete-given/delete-given-response';

export class ToBackendDeleteGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteGivenRequest })
) {}

export class ToBackendDeleteGivenResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteGivenResponse
}) {}

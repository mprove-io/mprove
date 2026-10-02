import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditGivenRequest } from '#common/types/backend/routes/givens/edit-given/edit-given-request';
import { zToBackendEditGivenResponse } from '#common/types/backend/routes/givens/edit-given/edit-given-response';

export class ToBackendEditGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditGivenRequest })
) {}

export class ToBackendEditGivenResponseDto extends createBackendResponseDto({
  schema: zToBackendEditGivenResponse
}) {}

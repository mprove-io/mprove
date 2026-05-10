import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetSkillsRequest,
  zToBackendGetSkillsResponse
} from '#common/zod/to-backend/skills/to-backend-get-skills';

export class ToBackendGetSkillsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSkillsRequest })
) {}

export class ToBackendGetSkillsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSkillsResponse })
) {}

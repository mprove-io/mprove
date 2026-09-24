import { Injectable } from '@nestjs/common';
import type { Preset } from '#common/zod/blockml/preset';
@Injectable()
export class PresetsService {
  presets: Preset[] = [];

  constructor() {}

  setPresets(presets: Preset[]) {
    this.presets = presets;
  }

  getPresets(): Preset[] {
    return this.presets;
  }
}

import { Injectable } from '@nestjs/common';
import { common } from '~blockml/barrels/common';

@Injectable()
export class PresetsService {
  presets: common.Preset[] = [];

  constructor() {}

  setPresets(presets: common.Preset[]) {
    this.presets = presets;
  }

  getPresets(): common.Preset[] {
    return this.presets;
  }
}

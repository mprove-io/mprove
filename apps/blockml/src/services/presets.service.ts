import { Injectable } from '@nestjs/common';
import { Preset } from '~common/interfaces/blockml/preset';

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

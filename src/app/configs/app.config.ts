import { InjectionToken } from '@angular/core';
import * as interfaces from 'src/app/interfaces/_index';

const CONFIG: interfaces.AppConfig = {
  tooltipDelay: 400,
  forceWindowReload: false
};

export const APP_CONFIG = new InjectionToken<interfaces.AppConfig>('app.config');

export const APP_CONFIG_PROVIDER = {
  provide: APP_CONFIG,
  useValue: CONFIG
};

import { Extension } from '@codemirror/state';
import { defaultSettingsLightTheme } from './default-settings-light-theme';
import { LIGHT_PLUS_STYLES } from './light-plus-tags';
import { createTheme } from './theme-creators/create-theme';
import { createThemeExtra } from './theme-creators/create-theme-extra';
import { createThemeExtraDiff } from './theme-creators/create-theme-extra-diff';
import { createThemeExtraSingle } from './theme-creators/create-theme-extra-single';

export const LIGHT_PLUS_THEME = createTheme({
  theme: 'light',
  settings: {
    ...defaultSettingsLightTheme,
    ...{ lineHighlight: '#f3f4f6' }
  },
  styles: [...LIGHT_PLUS_STYLES]
});

export const LIGHT_PLUS_THEME_EXTRA: Extension =
  createThemeExtra(LIGHT_PLUS_THEME);

export const LIGHT_PLUS_THEME_EXTRA_SINGLE: Extension = createThemeExtraSingle(
  LIGHT_PLUS_THEME_EXTRA
);

export const LIGHT_PLUS_THEME_EXTRA_DIFF: Extension = createThemeExtraDiff(
  LIGHT_PLUS_THEME_EXTRA
);

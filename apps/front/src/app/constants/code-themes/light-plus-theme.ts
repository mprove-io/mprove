import { Extension } from '@codemirror/state';
import { defaultSettingsLightTheme } from './default-settings-light-theme';
import { LIGHT_PLUS_STYLES } from './light-plus-tags';
import { createTheme } from './theme-creators/create-theme';
import { createThemeExtra } from './theme-creators/create-theme-extra';
import { createThemeExtraMod } from './theme-creators/create-theme-extra-mod';

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

export const LIGHT_PLUS_THEME_EXTRA_MOD: Extension = createThemeExtraMod(
  LIGHT_PLUS_THEME_EXTRA
);

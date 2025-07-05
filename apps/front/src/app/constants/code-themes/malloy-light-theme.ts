import { Extension } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';
import { defaultSettingsLightTheme } from './default-settings-light-theme';
import { LIGHT_PLUS_STYLES } from './light-plus-tags';
import { createThemeExtra } from './theme-creators/create-theme-extra';
import { createThemeExtraMod } from './theme-creators/create-theme-extra-mod';
import { CreateThemeOptions, createTheme } from './theme-parts';

export const malloyLightStyle: CreateThemeOptions['styles'] = [
  {
    tag: [t.keyword, t.controlKeyword, t.operatorKeyword], // Keywords (e.g., is, on, not, or, and, etc.)
    color: '#0000ff'
  },
  {
    tag: t.propertyName, // Properties (e.g., select, where, join_one, query, etc.)
    color: '#af00db'
  },
  {
    tag: [t.variableName, t.labelName], // Identifiers (quoted and unquoted)
    color: '#0070c1'
  },
  {
    tag: [t.function(t.variableName)], // Functions (e.g., COUNT, SUM, AVG, etc.)
    color: '#795e26'
  },
  {
    tag: [t.typeName], // Types (e.g., string, number, date, timestamp, boolean)
    color: '#267f99'
  },
  {
    tag: [t.number], // Numbers (e.g., integers, decimals)
    color: '#098658'
  },
  {
    tag: [t.string, t.special(t.string)], // Strings (single, double, triple quoted, regex)
    color: '#a31515'
  },
  {
    tag: [t.bool, t.null], // Constants (true, false, null)
    color: '#267f99'
  },
  {
    tag: t.unit, // Timeframes (e.g., year, month, day, etc.) // Using unit for timeframes as a close match
    color: '#0000ff'
  },
  {
    tag: t.special(t.literal), // Datetimes (e.g., @2023-01-01, timestamps) // Using special literal for datetimes
    color: '#098658'
  },
  {
    tag: [t.comment, t.docComment], // Comments (block, line, tags)
    color: '#008000'
  },
  {
    tag: t.meta, // SQL blocks (within triple quotes) // Using meta for embedded SQL
    color: '#383a42'
  },
  {
    tag: [t.punctuation, t.brace, t.paren, t.separator], // Punctuation (e.g., braces, parentheses, commas)
    color: '#383a42'
  },
  {
    tag: [t.operator], // Operators (e.g., =, !)
    color: '#383a42'
  },
  {
    tag: t.annotation, // Tags (e.g., #, ## for annotations)
    color: '#008000'
  },
  {
    tag: t.invalid, // Invalid syntax
    color: '#e45649'
  }
];

export function malloyLightInit(options?: Partial<CreateThemeOptions>) {
  const { theme = 'light', settings = {}, styles = [] } = options || {};

  return createTheme({
    theme: theme,
    settings: {
      ...defaultSettingsLightTheme,
      ...settings
    },
    styles: [...LIGHT_PLUS_STYLES, ...malloyLightStyle, ...styles]
  });
}

export const MALLOY_LIGHT_THEME = malloyLightInit({
  settings: {
    lineHighlight: '#f3f4f6'
  }
});

export const MALLOY_LIGHT_THEME_EXTRA: Extension =
  createThemeExtra(MALLOY_LIGHT_THEME);

export const MALLOY_LIGHT_THEME_EXTRA_MOD: Extension = createThemeExtraMod(
  MALLOY_LIGHT_THEME_EXTRA
);

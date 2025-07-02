import { Extension } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';
import { defaultSettingsLightTheme } from './default-settings-light-theme';
import { createThemeExtra } from './theme-creators/create-theme-extra';
import { createThemeExtraMod } from './theme-creators/create-theme-extra-mod';
import { CreateThemeOptions, createTheme } from './theme-parts';

// https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/light.ts

export const vscodeLightStyle: CreateThemeOptions['styles'] = [
  {
    tag: [
      t.keyword,
      t.operatorKeyword,
      t.modifier,
      t.color,
      t.constant(t.name),
      t.standard(t.name),
      t.standard(t.tagName),
      t.special(t.brace),
      t.atom,
      t.bool,
      t.special(t.variableName)
    ],
    color: '#0000ff'
  },
  { tag: [t.moduleKeyword, t.controlKeyword], color: '#af00db' },
  {
    tag: [
      t.name,
      t.deleted,
      t.character,
      t.macroName,
      t.propertyName,
      t.variableName,
      t.labelName,
      t.definition(t.name)
    ],
    color: '#0070c1'
  },
  { tag: t.heading, fontWeight: 'bold', color: '#0070c1' },
  {
    tag: [
      t.typeName,
      t.className,
      t.tagName,
      t.number,
      t.changed,
      t.annotation,
      t.self,
      t.namespace
    ],
    color: '#267f99'
  },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: '#795e26'
  },
  { tag: [t.number], color: '#098658' },
  {
    tag: [t.operator, t.punctuation, t.separator, t.url, t.escape, t.regexp],
    color: '#383a42'
  },
  { tag: [t.regexp], color: '#af00db' },
  {
    tag: [t.special(t.string), t.processingInstruction, t.string, t.inserted],
    color: '#a31515'
  },
  { tag: [t.angleBracket], color: '#383a42' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.meta, t.comment], color: '#008000' },
  { tag: t.link, color: '#4078f2', textDecoration: 'underline' },
  { tag: t.invalid, color: '#e45649' }
];

export function vscodeLightInit(options?: Partial<CreateThemeOptions>) {
  const { theme = 'light', settings = {}, styles = [] } = options || {};

  return createTheme({
    theme: theme,
    settings: {
      ...defaultSettingsLightTheme,
      ...settings
    },
    styles: [...vscodeLightStyle, ...styles]
  });
}

export const VS_LIGHT_THEME = vscodeLightInit({
  settings: {
    lineHighlight: '#f3f4f6' //  '#f0f9ff', '#00000012'
  }
});

export const VS_LIGHT_THEME_EXTRA: Extension = createThemeExtra(VS_LIGHT_THEME);

export const VS_LIGHT_THEME_EXTRA_MOD: Extension =
  createThemeExtraMod(VS_LIGHT_THEME_EXTRA);

import { Extension } from '@codemirror/state';
import { Tag, tags as t } from '@lezer/highlight';
import { defaultSettingsLightTheme } from './default-settings-light-theme';
import { createThemeExtra } from './theme-creators/create-theme-extra';
import { createThemeExtraMod } from './theme-creators/create-theme-extra-mod';
import { CreateThemeOptions, createTheme } from './theme-parts';

// Define custom tags
const sqlTags = {
  sqlBracketed: Tag.define(),
  sqlStorage: Tag.define(),
  sqlEntityName: Tag.define(),
  sqlInterpolatedString: Tag.define(),
  sqlStringPunctuation: Tag.define()
};

export const sqlLightStyle: CreateThemeOptions['styles'] = [
  {
    tag: [t.variableName],
    color: '#aa0d91', // Variables (e.g., @variable) // Purple for variables
    fontStyle: 'italic'
  },
  {
    tag: [sqlTags.sqlBracketed],
    color: '#0077b6' // Bracketed Text (e.g., [table_name]) // Blue for bracketed identifiers
  },
  {
    tag: [t.comment, t.lineComment, t.blockComment],
    color: '#6a737d', // Comments (e.g., -- comment, /* comment */) // Gray for comments
    fontStyle: 'italic'
  },
  {
    tag: [t.keyword],
    color: '#0000ff', // Keywords (e.g., CREATE, SELECT, FROM, AS, NULL, GRANT, ASC) // Blue for keywords
    fontWeight: 'bold'
  },
  {
    tag: [t.operator], // Operators (e.g., *, =, <>, +, ||)
    color: '#d73a49' // Red-orange for operators
  },
  {
    tag: [sqlTags.sqlStorage], // Storage Types and Modifiers (e.g., BIGINT, VARCHAR, PRIMARY KEY)
    color: '#2e7d32' // Green for data types and modifiers
  },
  {
    tag: [t.number], // Numeric Constants (e.g., 123)
    color: '#098658' // Teal for numbers
  },
  {
    tag: [sqlTags.sqlEntityName], // Entity Names (e.g., function names, table names, database names)
    color: '#800000' // Maroon for entity names
  },
  {
    tag: [t.function(t.name)], // Functions (e.g., COUNT, GETDATE, SUBSTRING)
    color: '#005f87', // Dark blue for functions
    fontWeight: 'bold'
  },
  {
    tag: [t.string], // Strings (e.g., 'text', "text", `text`, %{text})
    color: '#a31515' // Red for strings
  },
  {
    tag: [sqlTags.sqlStringPunctuation], // String Punctuation (e.g., ', ", `)
    color: '#a31515' // Match string color
  },
  {
    tag: [t.special(t.string)], // Escape Characters (e.g., \' in strings)
    color: '#c46210' // Orange for escapes
  },
  {
    tag: [sqlTags.sqlInterpolatedString], // Interpolated Strings (e.g., #{expression})
    color: '#a31515', // Match string color
    fontStyle: 'italic'
  },
  {
    tag: [t.regexp], // Regular Expressions (e.g., /regex/, %r{regex})
    color: '#005f5f' // Dark teal for regex
  },
  {
    tag: [t.bracket], // Brackets (e.g., () in blocks)
    color: '#000000' // Black for brackets
  }
];

export function sqlLightInit(options?: Partial<CreateThemeOptions>) {
  const { theme = 'light', settings = {}, styles = [] } = options || {};

  return createTheme({
    theme: theme,
    settings: {
      ...defaultSettingsLightTheme,
      ...settings
    },
    styles: [...sqlLightStyle, ...styles]
  });
}

export const SQL_LIGHT_THEME = sqlLightInit({
  settings: {
    lineHighlight: '#f3f4f6'
  }
});

export const SQL_LIGHT_THEME_EXTRA: Extension =
  createThemeExtra(SQL_LIGHT_THEME);

export const SQL_LIGHT_THEME_EXTRA_MOD: Extension = createThemeExtraMod(
  SQL_LIGHT_THEME_EXTRA
);

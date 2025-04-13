// logo '#0084d1'; // sky-600
// favicon '#0084d1'; // sky-600
// ui-switch '#00a6f4'; // sky-500

// old blue2 = '#E7F2FD';
// old blue3 = '#365EE0';
// '#0069a8'; // sky-700

var blue1 = '#F2F5FA'; // main background
var blue2 = '#dff2fe'; // sky-100 selected objects
var blue3 = '#0084d1'; // sky-600 main buttons, main clickable text
var blue4 = '#f0f9ff'; // sky-50 hover elements
var blue5 = '#C3DCF3'; // table - selected dimensions

var gray1 = '#4D4F5C';
var gray2 = '#00030B';
var gray3 = '#D7DBEC';
var gray4 = '#D7DBECA3';
var gray5 = '#4F505C';

var green1 = '#B6E1BC';
var green2 = '#E9F6EB';

var purple1 = '#90A6EE';
var purple2 = '#E1E7FB';

var red1 = '#DE4343';

const colors = require('tailwindcss/colors');

const { createGlobPatternsForDependencies } = require('@nrwl/angular/tailwind');
const { join } = require('path');

module.exports = {
  prefix: '',
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    namedGroups: ['foo', 'bar'],
    // groupLevel: 10,
    // groupScope: 'scope',
    extend: {
      colors: {
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet
      },
      scale: {
        '-1': '-1'
      },
      boxShadow: {
        m1: '0px 1px 4px rgba(21,34,50,0.078)'
      },
      fontFamily: {
        ms: ['Montserrat', 'sans-serif'],
        mono: ['monospace']
      }
    },
    backgroundColor: theme => ({
      ...theme('colors'),
      blue1,
      blue2,
      blue3,
      blue4,
      blue5,
      gray1,
      gray2,
      gray3,
      gray4,
      gray5,
      green1,
      green2,
      purple1,
      purple2,
      red1
    }),
    textColor: theme => ({
      ...theme('colors'),
      blue1,
      blue2,
      blue3,
      blue4,
      blue5,
      gray1,
      gray2,
      gray3,
      gray4,
      gray5,
      green1,
      green2,
      purple1,
      purple2,
      red1
    }),
    borderColor: theme => ({
      ...theme('colors'),
      blue1,
      blue2,
      blue3,
      blue4,
      blue5,
      gray1,
      gray2,
      gray3,
      gray4,
      gray5,
      green1,
      green2,
      purple1,
      purple2,
      red1
    })
  },
  plugins: [
    // tailwindcss-labeled-groups
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms')({
      strategy: 'class'
    }),
    // require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography')
  ]
};

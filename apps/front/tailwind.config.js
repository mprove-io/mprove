// logo '#0084d1'; // sky-600
// favicon '#0084d1'; // sky-600
// ui-switch '#00a6f4'; // sky-500

// old blue2 = '#E7F2FD';
// old blue3 = '#365EE0';
// '#0069a8'; // sky-700
// '#dff2fe'; // sky-100
// '#64BD63'; // ui-switch default green-color

var m1 = '#F2F5FA'; // main background
var m50 = '#f0f9ff'; // sky-50 hover elements
var m75 = '#e8f6ff'; // sky-75 model tree dimensions
var m150 = '#cdecfe'; // sky-150 selected objects
var m200 = '#b8e6fe'; // sky-200 dot options icon button, avatar
var m500 = '#00a6f4'; // clickable text
var m600 = '#0084d1'; // sky-600 main buttons, main clickable text

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
      m1,
      m150,
      m500,
      m600,
      m50,
      m75,
      m200,
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
      m1,
      m150,
      m500,
      m600,
      m50,
      m75,
      m200,
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
      m1,
      m150,
      m500,
      m600,
      m50,
      m75,
      m200,
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

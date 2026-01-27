// logo '#0084d1'; // sky-600
// favicon '#0069a8'; // sky-700
// ui-switch '#64BD63'; // default green
// ngx-spinner color '#0084d1'; // sky-600
// ngx-spinner bdColor '#00000000'; // transparent
// styles.scss has colors

var m0 = '#FFFFFF'; // white
var m1 = '#F2F5FA'; // main background
var m50 = '#f0f9ff'; // sky-50 hover elements
var m75 = '#e8f6ff'; // sky-75 model tree dimensions
var m150 = '#cdecfe'; // sky-150 selected objects
var m200 = '#b8e6fe'; // sky-200 dot options icon button, avatar
var m500 = '#00a6f4'; // sky-500 clickable text
var m600 = '#0084d1'; // sky-600 main buttons, main clickable text

var s1 = '#4D4F5C';
var s2 = '#00030B';
var s3 = '#D7DBEC';
var s4 = '#D7DBECA3';
var s100 = '#f3f4f6'; // gray-100
var s150 = '#eceef1'; // gray-150
var s200 = '#e5e7eb'; // gray-200
var s300 = '#d1d5dc'; // gray-300
var s400 = '#99a1af'; // gray-400
var s500 = '#6a7282'; // gray-500

var a500 = '#fe9a00'; // amber-500

var g1 = '#64BD63'; // the same as ui-switch
var g2 = '#B6E1BC'; // table measures and calculations
var g700 = '#008236'; // green-700

var p200 = '#e9d4ff'; // purple-200
var p300 = '#dab2ff'; // purple-300
var p500 = '#ad46ff'; // purple-500

var r1 = '#DE4343';
var r100 = '#ffe2e2'; // red-100
var r600 = '#e7000b'; // red-600
var r700 = '#c10007'; // red-700

// const colors = require('tailwindcss/colors');

const { join } = require('path');

module.exports = {
  prefix: '',
  content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}')],
  theme: {
    namedGroups: ['bar'],
    // namedGroups: ['foo', 'bar'],
    // groupLevel: 10,
    // groupScope: 'scope',
    extend: {
      // colors: {
      //   green: colors.emerald,
      //   yellow: colors.amber,
      //   purple: colors.violet
      // },
      // scale: {
      //   '-1': '-1'
      // },
      // boxShadow: {
      //   custom1: '0px 1px 4px rgba(21,34,50,0.078)'
      // },
      fontFamily: {
        ms: ['Montserrat', 'sans-serif'],
        mono: ['monospace']
      }
    },
    backgroundColor: theme => ({
      ...theme('colors'),
      m0,
      m1,
      m150,
      m500,
      m600,
      m50,
      m75,
      m200,
      s1,
      s2,
      s3,
      s4,
      s100,
      s150,
      s200,
      s300,
      s400,
      s500,
      a500,
      g1,
      g2,
      g700,
      p200,
      p300,
      p500,
      r1,
      r100,
      r600,
      r700
    }),
    textColor: theme => ({
      ...theme('colors'),
      m0,
      m1,
      m150,
      m500,
      m600,
      m50,
      m75,
      m200,
      s1,
      s2,
      s3,
      s4,
      s100,
      s150,
      s200,
      s300,
      s400,
      s500,
      a500,
      g1,
      g2,
      g700,
      p200,
      p300,
      p500,
      r1,
      r100,
      r600,
      r700
    }),
    borderColor: theme => ({
      ...theme('colors'),
      m0,
      m1,
      m150,
      m500,
      m600,
      m50,
      m75,
      m200,
      s1,
      s2,
      s3,
      s4,
      s100,
      s150,
      s200,
      s300,
      s400,
      s500,
      a500,
      g1,
      g2,
      g700,
      p200,
      p300,
      p500,
      r1,
      r100,
      r600,
      r700
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

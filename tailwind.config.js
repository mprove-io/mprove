var blue1 = '#F2F5FA';
var blue2 = '#E7F2FD';
var blue3 = '#365EE0';
var blue4 = '#465EDC';

var gray1 = '#4D4F5C';
var gray2 = '#00030B';
var gray3 = '#D7DBEC';
var gray4 = '#D7DBECA3';

module.exports = {
  prefix: '',
  purge: ['apps/front/src/**/*.{html,ts}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: {
        m1: '0px 1px 4px rgba(21,34,50,0.078)'
      },
      fontFamily: {
        ms: ['Montserrat', 'sans-serif']
      }
    },
    backgroundColor: theme => ({
      ...theme('colors'),
      blue1,
      blue2,
      blue3
    }),
    textColor: theme => ({
      ...theme('colors'),
      blue3,
      blue4,
      gray1,
      gray2
    }),
    borderColor: theme => ({
      ...theme('colors'),
      blue3,
      gray3,
      gray4
    })
  },
  variants: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms')({
      strategy: 'class'
    }),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography')
  ]
};

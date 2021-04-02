module.exports = {
  prefix: '',
  purge: ['apps/front/src/**/*.{html,ts}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: {
        m1: '0px 1px 4px rgba(21,34,50,0.078)'
      }
    },
    backgroundColor: theme => ({
      ...theme('colors'),
      b1: '#F2F5FA',
      b2: '#365EE0'
    }),
    textColor: theme => ({
      ...theme('colors'),
      t1: '#00030B',
      t2: '#465EDC'
    }),
    borderColor: theme => ({
      ...theme('colors'),
      r1: '#D7DBEC',
      r2: '#365EE0'
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

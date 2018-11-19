import * as interfaces from 'app/interfaces/_index';

export const authConfig: interfaces.AuthConfiguration = {
  clientID: 'yefb1L9FtIDQAvBgs5xrlC0Cyij4vngQ',
  domain: 'mprove.auth0.com',
  options: {
    autoclose: true, // default false
    // autofocus:                 // default depends on platform
    avatar: null,
    // closable:                  // default true
    // container:
    // language:
    languageDictionary: {
      // https://github.com/auth0/lock/blob/master/src/i18n/en.js
      title: 'Mprove'
      // emailInputPlaceholder: "something@youremail.com",
    },
    // popupOptions: {
    //   width: 300,
    //   height: 400,
    //   left: 200,
    //   top: 300
    // },
    rememberLastLogin: true, // default true

    theme: {
      // primaryColor: '#31324F', // default #ea5323
      logo:
        // TODO: #19 logo path
        'https://raw.githubusercontent.com/akalitenya/Other/master/mrove_logo_square_auth.png',
      // authButtons: {
      //   'testConnection': {
      //     displayName: 'Test Conn',
      //     primaryColor: '#b7b7b7',
      //     foregroundColor: '#000000',
      //     icon: 'http://example.com/icon.png'
      //   },
      //   'testConnection2': {
      //     primaryColor: '#000000',
      //     foregroundColor: '#ffffff',
      //   }
      // },
      labeledSubmitButton: true // default true
    },

    socialButtonStyle: 'small',

    auth: {
      audience: 'https://' + 'mprove.auth0.com' + '/userinfo',
      // autoParseHash
      // connectionScopes: {
      //   'facebook': ['scope1', 'scope2']
      // },
      allowAutocomplete: false, // default false
      // allowedConnections:      // default to all enabled connections
      allowShowPassword: true, // default false
      params: {
        scope: 'openid profile email'
        // state:
        // nonce:
      },
      redirect: false,
      redirectUrl: '',
      // responseMode:
      responseType: 'token id_token',
      sso: false
    },

    popup: true, // not documented yet

    // additionalSignUpFields:
    allowLogin: true, // default true
    allowForgotPassword: true, // default true
    allowSignUp: true, // default true
    // defaultDatabaseConnection
    // initialScreen
    loginAfterSignUp: true, // default true
    // forgotPasswordLink
    mustAcceptTerms: false // default false
    // prefill: {
    //   email:
    //   username:
    // },
    // signUpLink
    // usernameStyle

    // defaultEnterpriseConnection
    // defaultADUsernameFromEmailPrefix

    // clientBaseUrl
    // languageBaseUrl
    // hashCleanup
    //
  }
};

import i18n from './config/i18n'

export default {

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Boilerplate MEVN',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/scss/custom-bootstrap.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/persistedState.js', mode: 'client' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/fontawesome',
    '@nuxtjs/google-fonts',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    '@nuxtjs/auth',
    '@nuxtjs/axios',
    '@nuxtjs/i18n',
    //['nuxt-cookie-control', {barPosition: 'bottom-right',}],
  ],

  axios: {
    //baseURL: 'http://127.0.0.1:3333/api',
  },

  bootstrapVue: {
    bootstrapCSS: false, 
    bootstrapVueCSS: false
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  rules: [
    {
       test: /\.s[ac]ss$/i,
       use: ['style-loader','css-loader','sass-loader',],
     },
     
  ],

  auth: {
    strategies: {
      local: {
        endpoints: {
          //login: { url: '/auth/signin', method: 'post'},
          //user: { url: '/dashboard/user', method: 'get'},
          //logout: false
        }
      }
    }
  },

  googleFonts: {
    families:{
      'Crimson+Pro': [100,200,300,400,500,600,700,800,900]
    } 
  },

  fontawesome: {
    icons: {
      //solid: ['faLanguage', 'faChevronRight', 'faChevronDown', 'faCheck', 'faXmark', 'faTriangleExclamation', 'faPaste', 'faEuroSign'],
    }

  },

  i18n: {
    locales: [ 
      {
        code: 'en',
        name: 'English'
      },
      {
        code: 'fr',
        name: 'Français'
      }
    ],
    defaultLocale: 'fr',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',  // recommended
    }, 
    vueI18n: {
      fallbackLocale: 'fr',
      messages: i18n
    }
  },

  /*cookies: {
    necessary: [
      {
        name: {
          en: 'Functionnal Cookies',
          fr: "Cookies fonctionnelles"  
        },
        description: {
          en:  'We use our own cookies and third-party cookies so that we can show you this website and better understand how you use it, with a view to improving the services we offer. ',
          fr: "Ces cookies sont destinés à vous offrir une navigation optimisée sur ce site web et de nous donner un aperçu de son utilisation, en vue de l’amélioration des services que nous offrons.",
        },
        //cookies: ['cookie_control_consent', 'cookie_control_enabled_cookies']
      }
    ],
    optional: [
      {
        name:  'Google Analitycs',
        //if you don't set identifier, slugified name will be used
        identifier: 'ga',
        //if multilanguage
        description: {
          en:  'Google Analytics is a web analytics service that provides statistics and basic analytical tools for search engine optimization (SEO) and marketing purposes.',
          fr:  "Google Analytics est un service d'analyse Web qui fournit des statistiques et des outils d'analyse de base à des fins d'optimisation des moteurs de recherche (SEO) et de marketing.",
        },
  
        initialState: true,
        src:  'https://www.googletagmanager.com/gtag/js?id=<CHANGE-IT>',
        async:  true,
        //cookies: ['_ga', '_gat', '_gid'],
        accepted: () =>{
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
          });
        },
        declined: () =>{
        }
      }
    ]
  }, */

}

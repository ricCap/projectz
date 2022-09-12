import Polyglot from 'node-polyglot'

const englishPhrases = {
  welcome: 'Welcome to LifeLoop',
  navbar: {
    'button-connect': 'Connect',
    'button-connect-extension': 'with browser extension',
    'button-connect-wallet-connect': 'with wallet connect',
    'button-disconnect': 'Disconnect',
    'button-switch-language': 'Switch to Italian',
  },
}

const italianPhrases = {
  welcome: 'Benvenuto in LifeLoop',
  navbar: {
    'button-connect': 'Collega Portafoglio',
    'button-connect-extension': 'con estensione chrome',
    'button-connect-wallet-connect': 'con wallet connect',
    'button-disconnect': 'Scollega Portafoglio',
    'button-switch-language': 'Switch to English',
  },
}

export function getI18N(locale: string): Polyglot {
  switch (locale) {
    case 'it': {
      return new Polyglot({
        phrases: italianPhrases,
        locale: 'it',
      })
    }
    case 'en':
    default: {
      return new Polyglot({
        phrases: englishPhrases,
        locale: 'en',
      })
    }
  }
}

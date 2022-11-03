import Polyglot from 'node-polyglot'

const englishPhrases = {
  welcome: 'Welcome to LifeLoop',
  info: {
    'to-projects': 'Connect and browse projects',
    debug:
      'To create projects, make sure to connect using the wallet that deployed the contracts. You will need multiple wallets to access the application.',
    partner: {
      selector: 'Partner',
      description:
        "A secure and transparent online donation system powered by the Celo blockchain technology that allows you to track donations from start to finish. You'll know exactly who you're helping.",
      details:
        "Our way of ensuring that the donation actually reaches those you are helping is through our projects. (I beneficiari vengono individuati tramite un processo di selezione -> questo lo inseriremo all'interno di riquadri che vanno più nel dettaglio del processo che quindi un donatore può andare a vederselo). The undertaking is crowdfunded. The project is what connects the giver and partecipant together. Select the cause that is most important to you, and then you can donate right from the project's page.",
    },
    partecipant: {
      selector: 'Participant',
      description: 'Participant description',
      details: 'Participant details',
    },
    donor: {
      selector: 'Donor',
      description:
        'By boosting donor confidence and streamlining transactions, automating them by enhancing speed and effectiveness, your organization will benefit significantly. Do you require assistance with building up your blockchain infrastructure? We have your back.',
      details:
        "We'll hold a spot for you! By participating in LifeLoop, you will have the chance to develop projects that are tailored to the requirements of your business and target market, with even configurable categories. Additionally, you will have the chance to structure the project with milestones that correspond to the stages of fundraising required and enable you to pique funders' interest in the project's progress.",
    },
  },
  navbar: {
    'toggle-debug': 'Debug',
    'button-connect': 'Connect',
    'button-connect-extension': 'with browser extension',
    'button-connect-wallet-connect': 'with wallet connect',
    'button-disconnect': 'Disconnect',
    'button-switch-language': 'Switch to Italian',
  },
  body: {
    templates: {
      'button-create-project': 'Create project',
      'button-see-project': 'Show projects',
    },
  },
}

const italianPhrases = {
  welcome: 'Benvenuto in LifeLoop',
  info: {
    overview: 'Dove tu puoi fare la differenza!',
  },
  navbar: {
    'button-connect': 'Collega Portafoglio',
    'button-connect-extension': 'con estensione chrome',
    'button-connect-wallet-connect': 'con wallet connect',
    'button-disconnect': 'Scollega Portafoglio',
    'button-switch-language': 'Switch to English',
  },
  body: {
    templates: {
      'button-create-project': 'Crea progetto',
      'button-see-project': 'Guarda progetti',
    },
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

import Polyglot from 'node-polyglot';

const englishPhrases = {
    "welcome": "Welcome to LifeLoop"
}

const italianPhrases = {
    "welcome": "Benvenuto in LifeLoop"
}

export function getI18N(locale: string): Polyglot {
    switch (locale) {
        case "it": {
            return new Polyglot({
                phrases: italianPhrases,
                locale: "it"
            })
        }
        case "en":
        default: {
            return new Polyglot({
                phrases: englishPhrases,
                locale: "en"
            })
        }
    }
}
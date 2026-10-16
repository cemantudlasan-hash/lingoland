var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/languageModulesData.ts
var LANGUAGE_LESSONS = [
  {
    "id": "th-01",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Thai Alphabet Basics",
    "description": "Learn the foundation of Thai consonants and vowels",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "thai",
    "content": {
      "introduction": "Thai uses its own unique script with 44 consonants and 15 vowel symbols. Understanding the basics opens up the world of Thai reading.",
      "words": [
        {
          "word": "\u0E01",
          "partOfSpeech": "phrase",
          "definition": "Chicken (base consonant)",
          "englishExample": "[K]"
        },
        {
          "word": "\u0E02",
          "partOfSpeech": "phrase",
          "definition": "Egg (high class consonant)",
          "englishExample": "[Kh]"
        },
        {
          "word": "\u0E07",
          "partOfSpeech": "phrase",
          "definition": "Snake (low class)",
          "englishExample": "[Ng]"
        },
        {
          "word": "\u0E08",
          "partOfSpeech": "phrase",
          "definition": "Plate (mid class)",
          "englishExample": "[J]"
        },
        {
          "word": "\u0E14",
          "partOfSpeech": "phrase",
          "definition": "Child (mid class)",
          "englishExample": "[D]"
        }
      ],
      "quiz": [
        {
          "id": "th-01-q1",
          "question": 'What is the meaning of "\u0E01"?',
          "options": [
            "Chicken (base consonant)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Chicken (base consonant)"
        }
      ]
    }
  },
  {
    "id": "th-02",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Greetings & Politeness",
    "description": "Essential Thai greetings and polite expressions",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "thai",
    "content": {
      "introduction": 'Thai culture places great emphasis on politeness. "Wai" (the prayer-like gesture) accompanies many greetings.',
      "words": [
        {
          "word": "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35",
          "partOfSpeech": "phrase",
          "definition": "Hello / Goodbye",
          "englishExample": "[Sawasdee]"
        },
        {
          "word": "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13",
          "partOfSpeech": "phrase",
          "definition": "Thank you",
          "englishExample": "[Khob Khun]"
        },
        {
          "word": "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23",
          "partOfSpeech": "phrase",
          "definition": "It's okay / No problem",
          "englishExample": "[Mai pen rai]"
        },
        {
          "word": "\u0E42\u0E17\u0E29\u0E17\u0E35",
          "partOfSpeech": "phrase",
          "definition": "Excuse me / Sorry",
          "englishExample": "[Thot thee]"
        },
        {
          "word": "\u0E22\u0E34\u0E19\u0E14\u0E35\u0E17\u0E35\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01",
          "partOfSpeech": "phrase",
          "definition": "Nice to meet you",
          "englishExample": "[Yin dee thi roo jak]"
        }
      ],
      "quiz": [
        {
          "id": "th-02-q1",
          "question": 'What is the meaning of "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35"?',
          "options": [
            "Hello / Goodbye",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Hello / Goodbye"
        }
      ]
    }
  },
  {
    "id": "th-03",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Numbers 1\u2013100",
    "description": "Count in Thai from one to one hundred",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "thai",
    "content": {
      "introduction": "Thai numbers are fairly straightforward once you learn the base numbers. They follow a logical pattern.",
      "words": [
        {
          "word": "\u0E2B\u0E19\u0E36\u0E48\u0E07",
          "partOfSpeech": "phrase",
          "definition": "One (1)",
          "englishExample": "[Nueng]"
        },
        {
          "word": "\u0E2A\u0E2D\u0E07",
          "partOfSpeech": "phrase",
          "definition": "Two (2)",
          "englishExample": "[Song]"
        },
        {
          "word": "\u0E2A\u0E32\u0E21",
          "partOfSpeech": "phrase",
          "definition": "Three (3)",
          "englishExample": "[Sam]"
        },
        {
          "word": "\u0E2A\u0E34\u0E1A",
          "partOfSpeech": "phrase",
          "definition": "Ten (10)",
          "englishExample": "[Sip]"
        },
        {
          "word": "\u0E23\u0E49\u0E2D\u0E22",
          "partOfSpeech": "phrase",
          "definition": "Hundred (100)",
          "englishExample": "[Roi]"
        }
      ],
      "quiz": [
        {
          "id": "th-03-q1",
          "question": 'What is the meaning of "\u0E2B\u0E19\u0E36\u0E48\u0E07"?',
          "options": [
            "One (1)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One (1)"
        }
      ]
    }
  },
  {
    "id": "th-04",
    "category": "conversation",
    "level": "beginner",
    "title": "Food & Ordering at a Restaurant",
    "description": "Order food and drinks like a local",
    "xpReward": 150,
    "estimatedMinutes": 14,
    "targetLang": "thai",
    "content": {
      "introduction": "Thailand is famous for its cuisine. Knowing how to order food is one of the most practical skills for travelers.",
      "words": [
        {
          "word": "\u0E02\u0E2D\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E19\u0E48\u0E2D\u0E22\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21",
          "partOfSpeech": "phrase",
          "definition": "Can I have the menu please?",
          "englishExample": "[Kho menu noi dai mai]"
        },
        {
          "word": "\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E21\u0E32\u0E01",
          "partOfSpeech": "phrase",
          "definition": "Very delicious!",
          "englishExample": "[Aroi mak]"
        },
        {
          "word": "\u0E40\u0E1C\u0E47\u0E14\u0E19\u0E49\u0E2D\u0E22\u0E46",
          "partOfSpeech": "phrase",
          "definition": "A little bit spicy",
          "englishExample": "[Phet noi noi]"
        },
        {
          "word": "\u0E40\u0E0A\u0E47\u0E04\u0E1A\u0E34\u0E25\u0E14\u0E49\u0E27\u0E22",
          "partOfSpeech": "phrase",
          "definition": "Bill please",
          "englishExample": "[Check bin duai]"
        },
        {
          "word": "\u0E44\u0E21\u0E48\u0E43\u0E2A\u0E48\u0E1C\u0E31\u0E01\u0E0A\u0E35",
          "partOfSpeech": "phrase",
          "definition": "No coriander please",
          "englishExample": "[Mai sai phak chi]"
        }
      ],
      "quiz": [
        {
          "id": "th-04-q1",
          "question": 'What is the meaning of "\u0E02\u0E2D\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E19\u0E48\u0E2D\u0E22\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21"?',
          "options": [
            "Can I have the menu please?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Can I have the menu please?"
        }
      ]
    }
  },
  {
    "id": "th-05",
    "category": "conversation",
    "level": "beginner",
    "title": "Getting Around: Directions",
    "description": "Ask for and give directions in Thai",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "thai",
    "content": {
      "introduction": "Navigating Thai cities requires knowing direction words and transportation vocabulary.",
      "words": [
        {
          "word": "\u0E44\u0E1B\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E19",
          "partOfSpeech": "phrase",
          "definition": "Where are you going?",
          "englishExample": "[Pai thi nai]"
        },
        {
          "word": "\u0E15\u0E23\u0E07\u0E44\u0E1B",
          "partOfSpeech": "phrase",
          "definition": "Go straight",
          "englishExample": "[Trong pai]"
        },
        {
          "word": "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22",
          "partOfSpeech": "phrase",
          "definition": "Turn left",
          "englishExample": "[Liao sai]"
        },
        {
          "word": "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E02\u0E27\u0E32",
          "partOfSpeech": "phrase",
          "definition": "Turn right",
          "englishExample": "[Liao kwa]"
        },
        {
          "word": "\u0E2D\u0E22\u0E39\u0E48\u0E44\u0E01\u0E25\u0E44\u0E2B\u0E21",
          "partOfSpeech": "phrase",
          "definition": "Is it far?",
          "englishExample": "[Yu klai mai]"
        }
      ],
      "quiz": [
        {
          "id": "th-05-q1",
          "question": 'What is the meaning of "\u0E44\u0E1B\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E19"?',
          "options": [
            "Where are you going?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Where are you going?"
        }
      ]
    }
  },
  {
    "id": "th-06",
    "category": "pronunciation",
    "level": "intermediate",
    "title": "Tones in Thai",
    "description": "Master the 5 Thai tones with practice exercises",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "thai",
    "content": {
      "introduction": "Thai is a tonal language. The same syllable can have completely different meanings depending on the tone used.",
      "words": [
        {
          "word": "\u0E21\u0E32",
          "partOfSpeech": "phrase",
          "definition": "To come",
          "englishExample": "[Maa (mid)]"
        },
        {
          "word": "\u0E21\u0E49\u0E32",
          "partOfSpeech": "phrase",
          "definition": "Horse",
          "englishExample": "[M\xE1a (rising)]"
        },
        {
          "word": "\u0E2B\u0E21\u0E32",
          "partOfSpeech": "phrase",
          "definition": "Dog",
          "englishExample": "[M\u01CEa (falling)]"
        },
        {
          "word": "\u0E2B\u0E21\u0E49\u0E32",
          "partOfSpeech": "phrase",
          "definition": "Widow",
          "englishExample": "[M\xE0 (low)]"
        },
        {
          "word": "\u0E2B\u0E21\u0E32\u0E01",
          "partOfSpeech": "phrase",
          "definition": "Betel nut",
          "englishExample": "[M\xE2a (high)]"
        }
      ],
      "quiz": [
        {
          "id": "th-06-q1",
          "question": 'What is the meaning of "\u0E21\u0E32"?',
          "options": [
            "To come",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means To come"
        }
      ]
    }
  },
  {
    "id": "th-07",
    "category": "vocabulary",
    "level": "intermediate",
    "title": "Thai Family & Relationships",
    "description": "Vocabulary for family members and social relationships",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "thai",
    "content": {
      "introduction": "Thai family terms are specific \u2014 different words exist depending on whether a family member is older or younger.",
      "words": [
        {
          "word": "\u0E1E\u0E48\u0E2D",
          "partOfSpeech": "phrase",
          "definition": "Father",
          "englishExample": "[Pho]"
        },
        {
          "word": "\u0E41\u0E21\u0E48",
          "partOfSpeech": "phrase",
          "definition": "Mother",
          "englishExample": "[Mae]"
        },
        {
          "word": "\u0E1E\u0E35\u0E48",
          "partOfSpeech": "phrase",
          "definition": "Older sibling",
          "englishExample": "[Phi]"
        },
        {
          "word": "\u0E19\u0E49\u0E2D\u0E07",
          "partOfSpeech": "phrase",
          "definition": "Younger sibling",
          "englishExample": "[Nong]"
        },
        {
          "word": "\u0E25\u0E39\u0E01",
          "partOfSpeech": "phrase",
          "definition": "Child / Son / Daughter",
          "englishExample": "[Luk]"
        }
      ],
      "quiz": [
        {
          "id": "th-07-q1",
          "question": 'What is the meaning of "\u0E1E\u0E48\u0E2D"?',
          "options": [
            "Father",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Father"
        }
      ]
    }
  },
  {
    "id": "th-08",
    "category": "conversation",
    "level": "beginner",
    "title": "Thai Festivals & Traditions",
    "description": "Explore Thai culture through its major festivals",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "thai",
    "content": {
      "introduction": "Thailand has many rich festivals that reflect Buddhist traditions and local customs.",
      "words": [
        {
          "word": "\u0E2A\u0E07\u0E01\u0E23\u0E32\u0E19\u0E15\u0E4C",
          "partOfSpeech": "phrase",
          "definition": "Thai New Year Water Festival",
          "englishExample": "[Songkran]"
        },
        {
          "word": "\u0E25\u0E2D\u0E22\u0E01\u0E23\u0E30\u0E17\u0E07",
          "partOfSpeech": "phrase",
          "definition": "Lantern Festival",
          "englishExample": "[Loy Krathong]"
        },
        {
          "word": "\u0E27\u0E31\u0E19\u0E1E\u0E23\u0E30",
          "partOfSpeech": "phrase",
          "definition": "Buddhist holy day",
          "englishExample": "[Wan Phra]"
        },
        {
          "word": "\u0E27\u0E31\u0E14\u0E1E\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27",
          "partOfSpeech": "phrase",
          "definition": "Temple of the Emerald Buddha",
          "englishExample": "[Wat Phra Kaew]"
        },
        {
          "word": "\u0E16\u0E27\u0E32\u0E22\u0E17\u0E32\u0E19",
          "partOfSpeech": "phrase",
          "definition": "Making merit / offerings",
          "englishExample": "[Thawai than]"
        }
      ],
      "quiz": [
        {
          "id": "th-08-q1",
          "question": 'What is the meaning of "\u0E2A\u0E07\u0E01\u0E23\u0E32\u0E19\u0E15\u0E4C"?',
          "options": [
            "Thai New Year Water Festival",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Thai New Year Water Festival"
        }
      ]
    }
  },
  {
    "id": "th-09",
    "category": "grammar",
    "level": "intermediate",
    "title": "Present Tense Sentences",
    "description": "Build simple present tense Thai sentences",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "thai",
    "content": {
      "introduction": "Thai grammar is simpler than English in some ways \u2014 there is no verb conjugation or plurals, but word order is important.",
      "words": [
        {
          "word": "\u0E09\u0E31\u0E19\u0E01\u0E34\u0E19\u0E02\u0E49\u0E32\u0E27",
          "partOfSpeech": "phrase",
          "definition": "I eat rice",
          "englishExample": "[Chan gin khao]"
        },
        {
          "word": "\u0E40\u0E02\u0E32\u0E17\u0E33\u0E07\u0E32\u0E19",
          "partOfSpeech": "phrase",
          "definition": "He works",
          "englishExample": "[Khao tham ngan]"
        },
        {
          "word": "\u0E40\u0E23\u0E32\u0E40\u0E23\u0E35\u0E22\u0E19\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22",
          "partOfSpeech": "phrase",
          "definition": "We study Thai language",
          "englishExample": "[Rao rian phasa thai]"
        },
        {
          "word": "\u0E40\u0E18\u0E2D\u0E0A\u0E2D\u0E1A\u0E40\u0E1E\u0E25\u0E07",
          "partOfSpeech": "phrase",
          "definition": "She likes music",
          "englishExample": "[Thoe chop phleng]"
        },
        {
          "word": "\u0E1E\u0E27\u0E01\u0E40\u0E02\u0E32\u0E27\u0E34\u0E48\u0E07",
          "partOfSpeech": "phrase",
          "definition": "They run",
          "englishExample": "[Phuak khao wing]"
        }
      ],
      "quiz": [
        {
          "id": "th-09-q1",
          "question": 'What is the meaning of "\u0E09\u0E31\u0E19\u0E01\u0E34\u0E19\u0E02\u0E49\u0E32\u0E27"?',
          "options": [
            "I eat rice",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I eat rice"
        }
      ]
    }
  },
  {
    "id": "th-10",
    "category": "conversation",
    "level": "intermediate",
    "title": "Shopping Vocabulary",
    "description": "Bargain and shop at Thai markets",
    "xpReward": 150,
    "estimatedMinutes": 13,
    "targetLang": "thai",
    "content": {
      "introduction": "Shopping at Thai markets (talaat) is an experience. Bargaining is expected at most street markets.",
      "words": [
        {
          "word": "\u0E23\u0E32\u0E04\u0E32\u0E40\u0E17\u0E48\u0E32\u0E44\u0E23",
          "partOfSpeech": "phrase",
          "definition": "How much does it cost?",
          "englishExample": "[Raka thao rai]"
        },
        {
          "word": "\u0E41\u0E1E\u0E07\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B",
          "partOfSpeech": "phrase",
          "definition": "Too expensive",
          "englishExample": "[Phaeng koen pai]"
        },
        {
          "word": "\u0E25\u0E14\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21",
          "partOfSpeech": "phrase",
          "definition": "Can you reduce the price?",
          "englishExample": "[Lot dai mai]"
        },
        {
          "word": "\u0E40\u0E2D\u0E32\u0E2D\u0E31\u0E19\u0E19\u0E35\u0E49",
          "partOfSpeech": "phrase",
          "definition": "I will take this one",
          "englishExample": "[Ao an ni]"
        },
        {
          "word": "\u0E21\u0E35\u0E2A\u0E35\u0E2D\u0E37\u0E48\u0E19\u0E44\u0E2B\u0E21",
          "partOfSpeech": "phrase",
          "definition": "Do you have other colors?",
          "englishExample": "[Mi si uen mai]"
        }
      ],
      "quiz": [
        {
          "id": "th-10-q1",
          "question": 'What is the meaning of "\u0E23\u0E32\u0E04\u0E32\u0E40\u0E17\u0E48\u0E32\u0E44\u0E23"?',
          "options": [
            "How much does it cost?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means How much does it cost?"
        }
      ]
    }
  },
  {
    "id": "ko-01",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Hangul: The Korean Alphabet",
    "description": "Learn the logical and elegant Korean writing system",
    "xpReward": 150,
    "estimatedMinutes": 20,
    "targetLang": "korean",
    "content": {
      "introduction": "Hangul was invented in 1443 by King Sejong. It has 14 basic consonants and 10 basic vowels, combined into syllable blocks.",
      "words": [
        {
          "word": "\u3131",
          "partOfSpeech": "phrase",
          "definition": "Basic consonant (giyeok)",
          "englishExample": "[G/K]"
        },
        {
          "word": "\u3134",
          "partOfSpeech": "phrase",
          "definition": "Basic consonant (nieun)",
          "englishExample": "[N]"
        },
        {
          "word": "\u314F",
          "partOfSpeech": "phrase",
          "definition": "Basic vowel (a)",
          "englishExample": "[A]"
        },
        {
          "word": "\uAC00",
          "partOfSpeech": "phrase",
          "definition": "Syllable: consonant + vowel",
          "englishExample": "[Ga]"
        },
        {
          "word": "\uD55C\uAE00",
          "partOfSpeech": "phrase",
          "definition": "The Korean alphabet",
          "englishExample": "[Hangeul]"
        }
      ],
      "quiz": [
        {
          "id": "ko-01-q1",
          "question": 'What is the meaning of "\u3131"?',
          "options": [
            "Basic consonant (giyeok)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Basic consonant (giyeok)"
        }
      ]
    }
  },
  {
    "id": "ko-02",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Basic Greetings",
    "description": "Say hello, goodbye and polite expressions in Korean",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "korean",
    "content": {
      "introduction": "Korean has formal and informal speech levels. Start with formal speech (\uC874\uB313\uB9D0) to be respectful.",
      "words": [
        {
          "word": "\uC548\uB155\uD558\uC138\uC694",
          "partOfSpeech": "phrase",
          "definition": "Hello (formal)",
          "englishExample": "[Annyeonghaseyo]"
        },
        {
          "word": "\uAC10\uC0AC\uD569\uB2C8\uB2E4",
          "partOfSpeech": "phrase",
          "definition": "Thank you (formal)",
          "englishExample": "[Gamsahamnida]"
        },
        {
          "word": "\uC8C4\uC1A1\uD569\uB2C8\uB2E4",
          "partOfSpeech": "phrase",
          "definition": "I am sorry",
          "englishExample": "[Joesonghamnida]"
        },
        {
          "word": "\uC548\uB155\uD788 \uAC00\uC138\uC694",
          "partOfSpeech": "phrase",
          "definition": "Goodbye (to person leaving)",
          "englishExample": "[Annyeonghi gaseyo]"
        },
        {
          "word": "\uB9CC\uB098\uC11C \uBC18\uAC11\uC2B5\uB2C8\uB2E4",
          "partOfSpeech": "phrase",
          "definition": "Nice to meet you",
          "englishExample": "[Mannaseo bangapseumnida]"
        }
      ],
      "quiz": [
        {
          "id": "ko-02-q1",
          "question": 'What is the meaning of "\uC548\uB155\uD558\uC138\uC694"?',
          "options": [
            "Hello (formal)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Hello (formal)"
        }
      ]
    }
  },
  {
    "id": "ko-03",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Numbers: Native & Sino-Korean",
    "description": "Learn both Korean counting systems",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "korean",
    "content": {
      "introduction": "Korean has two number systems: native Korean (\uD558\uB098, \uB458...) and Sino-Korean (\uC77C, \uC774...). Each is used in different contexts.",
      "words": [
        {
          "word": "\uD558\uB098 / \uC77C",
          "partOfSpeech": "phrase",
          "definition": "One (native / sino)",
          "englishExample": "[Hana / Il]"
        },
        {
          "word": "\uB458 / \uC774",
          "partOfSpeech": "phrase",
          "definition": "Two (native / sino)",
          "englishExample": "[Dul / I]"
        },
        {
          "word": "\uC14B / \uC0BC",
          "partOfSpeech": "phrase",
          "definition": "Three (native / sino)",
          "englishExample": "[Set / Sam]"
        },
        {
          "word": "\uC5F4 / \uC2ED",
          "partOfSpeech": "phrase",
          "definition": "Ten (native / sino)",
          "englishExample": "[Yeol / Sip]"
        },
        {
          "word": "\uBC31",
          "partOfSpeech": "phrase",
          "definition": "Hundred (sino only)",
          "englishExample": "[Baek]"
        }
      ],
      "quiz": [
        {
          "id": "ko-03-q1",
          "question": 'What is the meaning of "\uD558\uB098 / \uC77C"?',
          "options": [
            "One (native / sino)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One (native / sino)"
        }
      ]
    }
  },
  {
    "id": "ko-04",
    "category": "conversation",
    "level": "beginner",
    "title": "K-Culture: K-Drama & K-Pop Expressions",
    "description": "Common phrases heard in Korean entertainment",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "korean",
    "content": {
      "introduction": "K-Drama and K-Pop have popularized Korean worldwide. Many fans learn Korean through music and dramas.",
      "words": [
        {
          "word": "\uB300\uBC15",
          "partOfSpeech": "phrase",
          "definition": "Awesome / Amazing",
          "englishExample": "[Daebak]"
        },
        {
          "word": "\uD654\uC774\uD305",
          "partOfSpeech": "phrase",
          "definition": "Fighting! (You can do it!)",
          "englishExample": "[Hwaiting]"
        },
        {
          "word": "\uC624\uBE60",
          "partOfSpeech": "phrase",
          "definition": "Older brother (girl's word for older male)",
          "englishExample": "[Oppa]"
        },
        {
          "word": "\uC544\uC774\uACE0",
          "partOfSpeech": "phrase",
          "definition": "Oh my! / Goodness!",
          "englishExample": "[Aigo]"
        },
        {
          "word": "\uC9C4\uC9DC\uC694?",
          "partOfSpeech": "phrase",
          "definition": "Really? / Seriously?",
          "englishExample": "[Jinjjayo?]"
        }
      ],
      "quiz": [
        {
          "id": "ko-04-q1",
          "question": 'What is the meaning of "\uB300\uBC15"?',
          "options": [
            "Awesome / Amazing",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Awesome / Amazing"
        }
      ]
    }
  },
  {
    "id": "ko-05",
    "category": "grammar",
    "level": "beginner",
    "title": "Sentence Structure: SOV Order",
    "description": "Understanding Korean grammar basics",
    "xpReward": 150,
    "estimatedMinutes": 14,
    "targetLang": "korean",
    "content": {
      "introduction": "Korean follows Subject-Object-Verb order, unlike English. The verb always comes at the end of the sentence.",
      "words": [
        {
          "word": "\uB098\uB294 \uBC25\uC744 \uBA39\uC5B4\uC694",
          "partOfSpeech": "phrase",
          "definition": "I eat rice (I-rice-eat)",
          "englishExample": "[Naneun babeul meogeoyo]"
        },
        {
          "word": "\uADF8\uB294 \uC74C\uC545\uC744 \uC88B\uC544\uD574\uC694",
          "partOfSpeech": "phrase",
          "definition": "He likes music",
          "englishExample": "[Geuneun eumageul joahaeyo]"
        },
        {
          "word": "\uC6B0\uB9AC\uB294 \uD55C\uAD6D\uC5B4\uB97C \uBC30\uC6CC\uC694",
          "partOfSpeech": "phrase",
          "definition": "We learn Korean",
          "englishExample": "[Urineun hangugeo-reul baewoyo]"
        },
        {
          "word": "\uADF8\uB140\uB294 \uCC45\uC744 \uC77D\uC5B4\uC694",
          "partOfSpeech": "phrase",
          "definition": "She reads a book",
          "englishExample": "[Geunyeoneun chaeg-eul ilgeoyo]"
        },
        {
          "word": "\uC800\uB294 \uD559\uC0DD\uC774\uC5D0\uC694",
          "partOfSpeech": "phrase",
          "definition": "I am a student",
          "englishExample": "[Jeoneun haksaengieyo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-05-q1",
          "question": 'What is the meaning of "\uB098\uB294 \uBC25\uC744 \uBA39\uC5B4\uC694"?',
          "options": [
            "I eat rice (I-rice-eat)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I eat rice (I-rice-eat)"
        }
      ]
    }
  },
  {
    "id": "ko-06",
    "category": "conversation",
    "level": "intermediate",
    "title": "At the Restaurant",
    "description": "Order Korean food and interact with servers",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "korean",
    "content": {
      "introduction": "Korean dining culture is unique \u2014 dishes are shared and banchan (side dishes) are served with every meal.",
      "words": [
        {
          "word": "\uC5EC\uAE30\uC694!",
          "partOfSpeech": "phrase",
          "definition": "Excuse me! (calling a server)",
          "englishExample": "[Yeogiyo!]"
        },
        {
          "word": "\uC774\uAC70 \uC8FC\uC138\uC694",
          "partOfSpeech": "phrase",
          "definition": "Give me this please",
          "englishExample": "[Igeo juseyo]"
        },
        {
          "word": "\uB9DB\uC788\uC5B4\uC694",
          "partOfSpeech": "phrase",
          "definition": "It is delicious",
          "englishExample": "[Massisseoyo]"
        },
        {
          "word": "\uBB3C \uD55C \uC794 \uC8FC\uC138\uC694",
          "partOfSpeech": "phrase",
          "definition": "One glass of water please",
          "englishExample": "[Mul han jan juseyo]"
        },
        {
          "word": "\uACC4\uC0B0\uC11C \uC8FC\uC138\uC694",
          "partOfSpeech": "phrase",
          "definition": "Check please",
          "englishExample": "[Gyesanseo juseyo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-06-q1",
          "question": 'What is the meaning of "\uC5EC\uAE30\uC694!"?',
          "options": [
            "Excuse me! (calling a server)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Excuse me! (calling a server)"
        }
      ]
    }
  },
  {
    "id": "ko-07",
    "category": "vocabulary",
    "level": "intermediate",
    "title": "Weather & Seasons",
    "description": "Talk about weather and the four seasons in Korean",
    "xpReward": 150,
    "estimatedMinutes": 11,
    "targetLang": "korean",
    "content": {
      "introduction": "Korea has four distinct seasons, and weather is a common conversation topic.",
      "words": [
        {
          "word": "\uC624\uB298 \uB0A0\uC528\uAC00 \uC5B4\uB54C\uC694?",
          "partOfSpeech": "phrase",
          "definition": "How is the weather today?",
          "englishExample": "[Oneul nalssiga eottaeyo?]"
        },
        {
          "word": "\uB354\uC6CC\uC694",
          "partOfSpeech": "phrase",
          "definition": "It is hot",
          "englishExample": "[Deowoyo]"
        },
        {
          "word": "\uCD94\uC6CC\uC694",
          "partOfSpeech": "phrase",
          "definition": "It is cold",
          "englishExample": "[Chuwoyo]"
        },
        {
          "word": "\uBD04 / \uC5EC\uB984 / \uAC00\uC744 / \uACA8\uC6B8",
          "partOfSpeech": "phrase",
          "definition": "Spring / Summer / Fall / Winter",
          "englishExample": "[Bom / Yeoreum / Gaeul / Gyeoul]"
        },
        {
          "word": "\uBE44\uAC00 \uC640\uC694",
          "partOfSpeech": "phrase",
          "definition": "It is raining",
          "englishExample": "[Biga wayo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-07-q1",
          "question": 'What is the meaning of "\uC624\uB298 \uB0A0\uC528\uAC00 \uC5B4\uB54C\uC694?"?',
          "options": [
            "How is the weather today?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means How is the weather today?"
        }
      ]
    }
  },
  {
    "id": "ko-08",
    "category": "grammar",
    "level": "advanced",
    "title": "Honorifics & Speech Levels",
    "description": "Navigate Korean formal and informal speech",
    "xpReward": 150,
    "estimatedMinutes": 20,
    "targetLang": "korean",
    "content": {
      "introduction": "Korean speech levels (\uACBD\uC5B4\uBC95) are crucial for social harmony. Using the wrong level can be offensive.",
      "words": [
        {
          "word": "\uD569\uC1FC\uCCB4",
          "partOfSpeech": "phrase",
          "definition": "Formal polite (business/strangers)",
          "englishExample": "[Hapshoche]"
        },
        {
          "word": "\uD574\uC694\uCCB4",
          "partOfSpeech": "phrase",
          "definition": "Informal polite (everyday use)",
          "englishExample": "[Haeyoche]"
        },
        {
          "word": "\uD574\uCCB4",
          "partOfSpeech": "phrase",
          "definition": "Informal (close friends, children)",
          "englishExample": "[Haeche]"
        },
        {
          "word": "\uB4DC\uC2DC\uB2E4",
          "partOfSpeech": "phrase",
          "definition": "Eat (honorific form)",
          "englishExample": "[Deushida]"
        },
        {
          "word": "\uB9D0\uC500\uD558\uC2DC\uB2E4",
          "partOfSpeech": "phrase",
          "definition": "Speak (honorific form)",
          "englishExample": "[Malsseum hashida]"
        }
      ],
      "quiz": [
        {
          "id": "ko-08-q1",
          "question": 'What is the meaning of "\uD569\uC1FC\uCCB4"?',
          "options": [
            "Formal polite (business/strangers)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Formal polite (business/strangers)"
        }
      ]
    }
  },
  {
    "id": "ko-09",
    "category": "conversation",
    "level": "intermediate",
    "title": "Travel & Transportation",
    "description": "Navigate buses, subways, and taxis in Korea",
    "xpReward": 150,
    "estimatedMinutes": 13,
    "targetLang": "korean",
    "content": {
      "introduction": "Korea has an excellent public transport system. Knowing key vocabulary makes travel easy and fun.",
      "words": [
        {
          "word": "\uC9C0\uD558\uCCA0\uC5ED\uC774 \uC5B4\uB514\uC5D0\uC694?",
          "partOfSpeech": "phrase",
          "definition": "Where is the subway station?",
          "englishExample": "[Jihacheol-yeogi eodieyo?]"
        },
        {
          "word": "...\uC5D0 \uAC00\uC8FC\uC138\uC694",
          "partOfSpeech": "phrase",
          "definition": "Please take me to...",
          "englishExample": "[...e gajuseyo]"
        },
        {
          "word": "\uC5BC\uB9C8\uC608\uC694?",
          "partOfSpeech": "phrase",
          "definition": "How much is it?",
          "englishExample": "[Eolmayeyo?]"
        },
        {
          "word": "\uB2E4\uC74C \uC815\uB958\uC7A5",
          "partOfSpeech": "phrase",
          "definition": "Next stop",
          "englishExample": "[Daeum jeongnyujang]"
        },
        {
          "word": "\uD45C \uD55C \uC7A5 \uC8FC\uC138\uC694",
          "partOfSpeech": "phrase",
          "definition": "One ticket please",
          "englishExample": "[Pyo han jang juseyo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-09-q1",
          "question": 'What is the meaning of "\uC9C0\uD558\uCCA0\uC5ED\uC774 \uC5B4\uB514\uC5D0\uC694?"?',
          "options": [
            "Where is the subway station?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Where is the subway station?"
        }
      ]
    }
  },
  {
    "id": "ko-10",
    "category": "conversation",
    "level": "beginner",
    "title": "Korean Food Culture",
    "description": "Explore iconic Korean dishes and food etiquette",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "korean",
    "content": {
      "introduction": "Korean food is known for its bold flavors, fermented foods, and communal dining style.",
      "words": [
        {
          "word": "\uAE40\uCE58",
          "partOfSpeech": "phrase",
          "definition": "Fermented spicy cabbage (national dish)",
          "englishExample": "[Kimchi]"
        },
        {
          "word": "\uBD88\uACE0\uAE30",
          "partOfSpeech": "phrase",
          "definition": "Marinated grilled beef",
          "englishExample": "[Bulgogi]"
        },
        {
          "word": "\uBE44\uBE54\uBC25",
          "partOfSpeech": "phrase",
          "definition": "Mixed rice with vegetables",
          "englishExample": "[Bibimbap]"
        },
        {
          "word": "\uC0BC\uACB9\uC0B4",
          "partOfSpeech": "phrase",
          "definition": "Grilled pork belly",
          "englishExample": "[Samgyeopsal]"
        },
        {
          "word": "\uB5A1\uBCF6\uC774",
          "partOfSpeech": "phrase",
          "definition": "Spicy rice cakes",
          "englishExample": "[Tteokbokki]"
        }
      ],
      "quiz": [
        {
          "id": "ko-10-q1",
          "question": 'What is the meaning of "\uAE40\uCE58"?',
          "options": [
            "Fermented spicy cabbage (national dish)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Fermented spicy cabbage (national dish)"
        }
      ]
    }
  },
  {
    "id": "ja-01",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Hiragana: The First Script",
    "description": "Master the 46 hiragana characters",
    "xpReward": 150,
    "estimatedMinutes": 20,
    "targetLang": "japanese",
    "content": {
      "introduction": "Hiragana is the foundational Japanese script. Every Japanese learner starts here. It represents syllables, not individual letters.",
      "words": [
        {
          "word": "\u3042",
          "partOfSpeech": "phrase",
          "definition": 'Vowel: a (as in "father")',
          "englishExample": "[A]"
        },
        {
          "word": "\u3044",
          "partOfSpeech": "phrase",
          "definition": 'Vowel: i (as in "meet")',
          "englishExample": "[I]"
        },
        {
          "word": "\u304B",
          "partOfSpeech": "phrase",
          "definition": "Consonant+vowel combination",
          "englishExample": "[Ka]"
        },
        {
          "word": "\u3055",
          "partOfSpeech": "phrase",
          "definition": "Sa row beginning",
          "englishExample": "[Sa]"
        },
        {
          "word": "\u305F\u3079\u308B",
          "partOfSpeech": "phrase",
          "definition": "To eat (written in hiragana)",
          "englishExample": "[Taberu]"
        }
      ],
      "quiz": [
        {
          "id": "ja-01-q1",
          "question": 'What is the meaning of "\u3042"?',
          "options": [
            'Vowel: a (as in "father")',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means Vowel: a (as in "father")'
        }
      ]
    }
  },
  {
    "id": "ja-02",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Katakana: For Foreign Words",
    "description": "Learn Katakana used for loanwords and emphasis",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "japanese",
    "content": {
      "introduction": "Katakana mirrors hiragana sounds but is used for foreign words, scientific terms, and emphasis.",
      "words": [
        {
          "word": "\u30A2",
          "partOfSpeech": "phrase",
          "definition": "Katakana A",
          "englishExample": "[A]"
        },
        {
          "word": "\u30B3\u30FC\u30D2\u30FC",
          "partOfSpeech": "phrase",
          "definition": "Coffee (loanword from English)",
          "englishExample": "[Koohii]"
        },
        {
          "word": "\u30C6\u30EC\u30D3",
          "partOfSpeech": "phrase",
          "definition": "Television",
          "englishExample": "[Terebi]"
        },
        {
          "word": "\u30A2\u30A4\u30B9\u30AF\u30EA\u30FC\u30E0",
          "partOfSpeech": "phrase",
          "definition": "Ice cream",
          "englishExample": "[Aisu kuriimu]"
        },
        {
          "word": "\u30DE\u30AF\u30C9\u30CA\u30EB\u30C9",
          "partOfSpeech": "phrase",
          "definition": "McDonald's",
          "englishExample": "[Makudonarudo]"
        }
      ],
      "quiz": [
        {
          "id": "ja-02-q1",
          "question": 'What is the meaning of "\u30A2"?',
          "options": [
            "Katakana A",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Katakana A"
        }
      ]
    }
  },
  {
    "id": "ja-03",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Greetings & Politeness",
    "description": "Essential Japanese greetings for all occasions",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "japanese",
    "content": {
      "introduction": "Japanese greetings change based on time of day and formality level. Politeness is central to Japanese culture.",
      "words": [
        {
          "word": "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059",
          "partOfSpeech": "phrase",
          "definition": "Good morning (formal)",
          "englishExample": "[Ohayou gozaimasu]"
        },
        {
          "word": "\u3053\u3093\u306B\u3061\u306F",
          "partOfSpeech": "phrase",
          "definition": "Hello / Good afternoon",
          "englishExample": "[Konnichiwa]"
        },
        {
          "word": "\u3053\u3093\u3070\u3093\u306F",
          "partOfSpeech": "phrase",
          "definition": "Good evening",
          "englishExample": "[Konbanwa]"
        },
        {
          "word": "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059",
          "partOfSpeech": "phrase",
          "definition": "Thank you very much",
          "englishExample": "[Arigatou gozaimasu]"
        },
        {
          "word": "\u3059\u307F\u307E\u305B\u3093",
          "partOfSpeech": "phrase",
          "definition": "Excuse me / I am sorry",
          "englishExample": "[Sumimasen]"
        }
      ],
      "quiz": [
        {
          "id": "ja-03-q1",
          "question": 'What is the meaning of "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059"?',
          "options": [
            "Good morning (formal)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Good morning (formal)"
        }
      ]
    }
  },
  {
    "id": "ja-04",
    "category": "grammar",
    "level": "intermediate",
    "title": "Japanese Particles",
    "description": "Understand wa, ga, wo, ni, de and more",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "japanese",
    "content": {
      "introduction": "Particles are the backbone of Japanese grammar. They attach to words to show their grammatical role.",
      "words": [
        {
          "word": "\u306F (wa)",
          "partOfSpeech": "phrase",
          "definition": 'Topic marker: "as for..."',
          "englishExample": "[wa]"
        },
        {
          "word": "\u304C (ga)",
          "partOfSpeech": "phrase",
          "definition": "Subject marker",
          "englishExample": "[ga]"
        },
        {
          "word": "\u3092 (wo)",
          "partOfSpeech": "phrase",
          "definition": "Object marker",
          "englishExample": "[wo/o]"
        },
        {
          "word": "\u306B (ni)",
          "partOfSpeech": "phrase",
          "definition": "Direction / location / time",
          "englishExample": "[ni]"
        },
        {
          "word": "\u3067 (de)",
          "partOfSpeech": "phrase",
          "definition": "Location of action / by means of",
          "englishExample": "[de]"
        }
      ],
      "quiz": [
        {
          "id": "ja-04-q1",
          "question": 'What is the meaning of "\u306F (wa)"?',
          "options": [
            'Topic marker: "as for..."',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means Topic marker: "as for..."'
        }
      ]
    }
  },
  {
    "id": "ja-05",
    "category": "vocabulary",
    "level": "intermediate",
    "title": "Japanese Numbers & Counters",
    "description": "Count things correctly using Japanese counters",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "japanese",
    "content": {
      "introduction": "Japanese uses different counter words depending on what is being counted (flat objects, long objects, people, etc.).",
      "words": [
        {
          "word": "\u4E00\u3064",
          "partOfSpeech": "phrase",
          "definition": "One (general objects)",
          "englishExample": "[Hitotsu]"
        },
        {
          "word": "\u4E00\u4EBA",
          "partOfSpeech": "phrase",
          "definition": "One person",
          "englishExample": "[Hitori]"
        },
        {
          "word": "\u4E00\u679A",
          "partOfSpeech": "phrase",
          "definition": "One flat object (paper, ticket)",
          "englishExample": "[Ichimai]"
        },
        {
          "word": "\u4E00\u672C",
          "partOfSpeech": "phrase",
          "definition": "One long object (pencil, bottle)",
          "englishExample": "[Ippon]"
        },
        {
          "word": "\u4E00\u5339",
          "partOfSpeech": "phrase",
          "definition": "One small animal",
          "englishExample": "[Ippiki]"
        }
      ],
      "quiz": [
        {
          "id": "ja-05-q1",
          "question": 'What is the meaning of "\u4E00\u3064"?',
          "options": [
            "One (general objects)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One (general objects)"
        }
      ]
    }
  },
  {
    "id": "ja-06",
    "category": "conversation",
    "level": "beginner",
    "title": "Japanese Restaurant Phrases",
    "description": "Dine in Japan with confidence",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "japanese",
    "content": {
      "introduction": "Japan has a profound food culture. Knowing the right phrases will enhance your dining experience.",
      "words": [
        {
          "word": "\u3044\u305F\u3060\u304D\u307E\u3059",
          "partOfSpeech": "phrase",
          "definition": "I humbly receive (said before eating)",
          "englishExample": "[Itadakimasu]"
        },
        {
          "word": "\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F",
          "partOfSpeech": "phrase",
          "definition": "It was a feast (said after eating)",
          "englishExample": "[Gochisousamadeshita]"
        },
        {
          "word": "\u304A\u3059\u3059\u3081\u306F\u4F55\u3067\u3059\u304B",
          "partOfSpeech": "phrase",
          "definition": "What do you recommend?",
          "englishExample": "[Osusume wa nan desu ka]"
        },
        {
          "word": "\u304A\u4F1A\u8A08\u3092\u304A\u9858\u3044\u3057\u307E\u3059",
          "partOfSpeech": "phrase",
          "definition": "Check please",
          "englishExample": "[Okaikei wo onegaishimasu]"
        },
        {
          "word": "\u8F9B\u304F\u306A\u3044\u3082\u306E\u306F\u3042\u308A\u307E\u3059\u304B",
          "partOfSpeech": "phrase",
          "definition": "Do you have anything not spicy?",
          "englishExample": "[Karakunai mono wa arimasu ka]"
        }
      ],
      "quiz": [
        {
          "id": "ja-06-q1",
          "question": 'What is the meaning of "\u3044\u305F\u3060\u304D\u307E\u3059"?',
          "options": [
            "I humbly receive (said before eating)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I humbly receive (said before eating)"
        }
      ]
    }
  },
  {
    "id": "ja-07",
    "category": "vocabulary",
    "level": "intermediate",
    "title": "Kanji Basics: Top 50",
    "description": "Learn the most fundamental kanji characters",
    "xpReward": 150,
    "estimatedMinutes": 25,
    "targetLang": "japanese",
    "content": {
      "introduction": "Kanji are Chinese-derived characters used in Japanese. You need 2,136 j\u014Dy\u014D kanji for literacy.",
      "words": [
        {
          "word": "\u65E5",
          "partOfSpeech": "phrase",
          "definition": "Sun / Day",
          "englishExample": "[Nichi/Hi]"
        },
        {
          "word": "\u6708",
          "partOfSpeech": "phrase",
          "definition": "Moon / Month",
          "englishExample": "[Getsu/Tsuki]"
        },
        {
          "word": "\u6C34",
          "partOfSpeech": "phrase",
          "definition": "Water",
          "englishExample": "[Sui/Mizu]"
        },
        {
          "word": "\u706B",
          "partOfSpeech": "phrase",
          "definition": "Fire",
          "englishExample": "[Ka/Hi]"
        },
        {
          "word": "\u6728",
          "partOfSpeech": "phrase",
          "definition": "Tree / Wood",
          "englishExample": "[Moku/Ki]"
        }
      ],
      "quiz": [
        {
          "id": "ja-07-q1",
          "question": 'What is the meaning of "\u65E5"?',
          "options": [
            "Sun / Day",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Sun / Day"
        }
      ]
    }
  },
  {
    "id": "ja-08",
    "category": "conversation",
    "level": "advanced",
    "title": "Japanese Work Culture",
    "description": "Understand Japanese business etiquette",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "japanese",
    "content": {
      "introduction": "Japan's work culture is known for its dedication, hierarchy, and group harmony (\u548C wa).",
      "words": [
        {
          "word": "\u304A\u75B2\u308C\u69D8\u3067\u3059",
          "partOfSpeech": "phrase",
          "definition": "Thank you for your hard work",
          "englishExample": "[Otsukaresama desu]"
        },
        {
          "word": "\u540D\u523A",
          "partOfSpeech": "phrase",
          "definition": "Business card (exchange with both hands)",
          "englishExample": "[Meishi]"
        },
        {
          "word": "\u4E0A\u53F8",
          "partOfSpeech": "phrase",
          "definition": "Boss / Superior",
          "englishExample": "[Jooshi]"
        },
        {
          "word": "\u4F1A\u8B70",
          "partOfSpeech": "phrase",
          "definition": "Meeting",
          "englishExample": "[Kaigi]"
        },
        {
          "word": "\u6B8B\u696D",
          "partOfSpeech": "phrase",
          "definition": "Overtime work",
          "englishExample": "[Zangyou]"
        }
      ],
      "quiz": [
        {
          "id": "ja-08-q1",
          "question": 'What is the meaning of "\u304A\u75B2\u308C\u69D8\u3067\u3059"?',
          "options": [
            "Thank you for your hard work",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Thank you for your hard work"
        }
      ]
    }
  },
  {
    "id": "ja-09",
    "category": "grammar",
    "level": "advanced",
    "title": "Te-form: Connecting Verbs",
    "description": "Use the te-form to build complex sentences",
    "xpReward": 150,
    "estimatedMinutes": 22,
    "targetLang": "japanese",
    "content": {
      "introduction": "The \u3066-form (te-form) is one of the most important verb forms in Japanese. It is used for sequences, requests, and progressive tenses.",
      "words": [
        {
          "word": "\u98DF\u3079\u3066\u304F\u3060\u3055\u3044",
          "partOfSpeech": "phrase",
          "definition": "Please eat (polite request)",
          "englishExample": "[Tabete kudasai]"
        },
        {
          "word": "\u8D70\u3063\u3066\u3044\u307E\u3059",
          "partOfSpeech": "phrase",
          "definition": "Am running (progressive)",
          "englishExample": "[Hashitte imasu]"
        },
        {
          "word": "\u8D77\u304D\u3066\u3001\u98DF\u3079\u3066\u3001\u884C\u304F",
          "partOfSpeech": "phrase",
          "definition": "Wake up, eat, and go (sequence)",
          "englishExample": "[Okite, tabete, iku]"
        },
        {
          "word": "\u307F\u3066\u3082\u3044\u3044\u3067\u3059\u304B",
          "partOfSpeech": "phrase",
          "definition": "May I look? (permission)",
          "englishExample": "[Mite mo ii desu ka]"
        },
        {
          "word": "\u3057\u3066\u306F\u3044\u3051\u307E\u305B\u3093",
          "partOfSpeech": "phrase",
          "definition": "Must not do (prohibition)",
          "englishExample": "[Shite wa ikemasen]"
        }
      ],
      "quiz": [
        {
          "id": "ja-09-q1",
          "question": 'What is the meaning of "\u98DF\u3079\u3066\u304F\u3060\u3055\u3044"?',
          "options": [
            "Please eat (polite request)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Please eat (polite request)"
        }
      ]
    }
  },
  {
    "id": "ja-10",
    "category": "conversation",
    "level": "beginner",
    "title": "Japanese Pop Culture",
    "description": "Anime, manga, and otaku culture vocabulary",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "japanese",
    "content": {
      "introduction": "Japanese pop culture has global influence. Many people learn Japanese because of anime and manga.",
      "words": [
        {
          "word": "\u30A2\u30CB\u30E1",
          "partOfSpeech": "phrase",
          "definition": "Japanese animation",
          "englishExample": "[Anime]"
        },
        {
          "word": "\u30DE\u30F3\u30AC",
          "partOfSpeech": "phrase",
          "definition": "Japanese comics",
          "englishExample": "[Manga]"
        },
        {
          "word": "\u304B\u308F\u3044\u3044",
          "partOfSpeech": "phrase",
          "definition": "Cute / Adorable",
          "englishExample": "[Kawaii]"
        },
        {
          "word": "\u3059\u3054\u3044",
          "partOfSpeech": "phrase",
          "definition": "Amazing / Wow",
          "englishExample": "[Sugoi]"
        },
        {
          "word": "\u306A\u308B\u307B\u3069",
          "partOfSpeech": "phrase",
          "definition": "I see / Makes sense",
          "englishExample": "[Naruhodo]"
        }
      ],
      "quiz": [
        {
          "id": "ja-10-q1",
          "question": 'What is the meaning of "\u30A2\u30CB\u30E1"?',
          "options": [
            "Japanese animation",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Japanese animation"
        }
      ]
    }
  },
  {
    "id": "fr-01",
    "category": "pronunciation",
    "level": "beginner",
    "title": "French Pronunciation Fundamentals",
    "description": "Master nasal vowels, silent letters and liaison",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "french",
    "content": {
      "introduction": "French pronunciation differs greatly from spelling. Silent letters, nasal sounds, and liaison make it unique.",
      "words": [
        {
          "word": "eau",
          "partOfSpeech": "phrase",
          "definition": '"Water" sound \u2014 like in "oh"',
          "englishExample": "[/o/]"
        },
        {
          "word": "eu",
          "partOfSpeech": "phrase",
          "definition": 'Like "uh" but with rounded lips',
          "englishExample": "[/\xF8/]"
        },
        {
          "word": "en / an / am",
          "partOfSpeech": "phrase",
          "definition": "Nasal vowel sound",
          "englishExample": "[/\u0251\u0303/]"
        },
        {
          "word": "in / ain / ein",
          "partOfSpeech": "phrase",
          "definition": 'Nasal "an" sound',
          "englishExample": "[/\u025B\u0303/]"
        },
        {
          "word": "on / om",
          "partOfSpeech": "phrase",
          "definition": 'Nasal "on" sound',
          "englishExample": "[/\u0254\u0303/]"
        }
      ],
      "quiz": [
        {
          "id": "fr-01-q1",
          "question": 'What is the meaning of "eau"?',
          "options": [
            '"Water" sound \u2014 like in "oh"',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means "Water" sound \u2014 like in "oh"'
        }
      ]
    }
  },
  {
    "id": "fr-02",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Les Salutations",
    "description": "Greetings and introductions in French",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "french",
    "content": {
      "introduction": 'French greetings depend on time of day and formality. "Tu" and "vous" indicate relationship levels.',
      "words": [
        {
          "word": "Bonjour",
          "partOfSpeech": "phrase",
          "definition": "Good morning / Hello",
          "englishExample": "[b\u0254\u0303\u0292u\u0281]"
        },
        {
          "word": "Bonsoir",
          "partOfSpeech": "phrase",
          "definition": "Good evening",
          "englishExample": "[b\u0254\u0303swa\u0281]"
        },
        {
          "word": "Enchant\xE9(e)",
          "partOfSpeech": "phrase",
          "definition": "Pleased to meet you",
          "englishExample": "[\u0251\u0303\u0283\u0251\u0303te]"
        },
        {
          "word": "Comment allez-vous?",
          "partOfSpeech": "phrase",
          "definition": "How are you? (formal)",
          "englishExample": "[k\u0254m\u0251\u0303 ale vu]"
        },
        {
          "word": "Au revoir",
          "partOfSpeech": "phrase",
          "definition": "Goodbye",
          "englishExample": "[o \u0281\u0259vwa\u0281]"
        }
      ],
      "quiz": [
        {
          "id": "fr-02-q1",
          "question": 'What is the meaning of "Bonjour"?',
          "options": [
            "Good morning / Hello",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Good morning / Hello"
        }
      ]
    }
  },
  {
    "id": "fr-03",
    "category": "grammar",
    "level": "beginner",
    "title": "Gender of Nouns",
    "description": "Understand masculine and feminine nouns",
    "xpReward": 150,
    "estimatedMinutes": 14,
    "targetLang": "french",
    "content": {
      "introduction": "Every French noun has a grammatical gender: masculine (le) or feminine (la). This affects all agreeing words.",
      "words": [
        {
          "word": "le livre",
          "partOfSpeech": "phrase",
          "definition": "The book (masculine)",
          "englishExample": "[luh leevr]"
        },
        {
          "word": "la table",
          "partOfSpeech": "phrase",
          "definition": "The table (feminine)",
          "englishExample": "[la tabl]"
        },
        {
          "word": "un chat",
          "partOfSpeech": "phrase",
          "definition": "A cat (masculine)",
          "englishExample": "[uhn sha]"
        },
        {
          "word": "une maison",
          "partOfSpeech": "phrase",
          "definition": "A house (feminine)",
          "englishExample": "[oon mezohn]"
        },
        {
          "word": "les enfants",
          "partOfSpeech": "phrase",
          "definition": "The children (plural)",
          "englishExample": "[lay z\u0251\u0303f\u0251\u0303]"
        }
      ],
      "quiz": [
        {
          "id": "fr-03-q1",
          "question": 'What is the meaning of "le livre"?',
          "options": [
            "The book (masculine)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means The book (masculine)"
        }
      ]
    }
  },
  {
    "id": "fr-04",
    "category": "grammar",
    "level": "intermediate",
    "title": "Present Tense Verbs",
    "description": "Conjugate -er, -ir, and -re verbs",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "french",
    "content": {
      "introduction": "French verbs are grouped into three families by their infinitive endings. Each group has its own conjugation pattern.",
      "words": [
        {
          "word": "parler (je parle)",
          "partOfSpeech": "phrase",
          "definition": "To speak (I speak)",
          "englishExample": "[parle]"
        },
        {
          "word": "finir (je finis)",
          "partOfSpeech": "phrase",
          "definition": "To finish (I finish)",
          "englishExample": "[feeneer]"
        },
        {
          "word": "vendre (je vends)",
          "partOfSpeech": "phrase",
          "definition": "To sell (I sell)",
          "englishExample": "[v\u0251\u0303d\u0281]"
        },
        {
          "word": "\xEAtre (je suis)",
          "partOfSpeech": "phrase",
          "definition": "To be (I am) \u2014 irregular",
          "englishExample": "[etr]"
        },
        {
          "word": "avoir (j'ai)",
          "partOfSpeech": "phrase",
          "definition": "To have (I have) \u2014 irregular",
          "englishExample": "[avwa\u0281]"
        }
      ],
      "quiz": [
        {
          "id": "fr-04-q1",
          "question": 'What is the meaning of "parler (je parle)"?',
          "options": [
            "To speak (I speak)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means To speak (I speak)"
        }
      ]
    }
  },
  {
    "id": "fr-05",
    "category": "conversation",
    "level": "beginner",
    "title": "Au Restaurant",
    "description": "Dining in France: ordering food and drinks",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "french",
    "content": {
      "introduction": "French cuisine is world-famous. Knowing restaurant vocabulary helps you enjoy the full dining experience.",
      "words": [
        {
          "word": "Je voudrais commander",
          "partOfSpeech": "phrase",
          "definition": "I would like to order",
          "englishExample": "[zhuh voodray kom\u0251\u0303de]"
        },
        {
          "word": "L'addition, s'il vous pla\xEEt",
          "partOfSpeech": "phrase",
          "definition": "The bill please",
          "englishExample": "[ladisy\u0254\u0303 sil vu pl\u025B]"
        },
        {
          "word": "C'est d\xE9licieux!",
          "partOfSpeech": "phrase",
          "definition": "It is delicious!",
          "englishExample": "[se delisy\xF8]"
        },
        {
          "word": "Je suis allergique \xE0...",
          "partOfSpeech": "phrase",
          "definition": "I am allergic to...",
          "englishExample": "[zhuh swee al\u025B\u0281\u0292ik a]"
        },
        {
          "word": "Une carafe d'eau",
          "partOfSpeech": "phrase",
          "definition": "A jug of water",
          "englishExample": "[yn ka\u0281af do]"
        }
      ],
      "quiz": [
        {
          "id": "fr-05-q1",
          "question": 'What is the meaning of "Je voudrais commander"?',
          "options": [
            "I would like to order",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I would like to order"
        }
      ]
    }
  },
  {
    "id": "fr-06",
    "category": "grammar",
    "level": "intermediate",
    "title": "French Adjectives & Agreement",
    "description": "Correctly match adjectives with nouns",
    "xpReward": 150,
    "estimatedMinutes": 16,
    "targetLang": "french",
    "content": {
      "introduction": "French adjectives must agree in gender and number with the nouns they modify. This is one of the trickiest aspects for learners.",
      "words": [
        {
          "word": "un petit gar\xE7on",
          "partOfSpeech": "phrase",
          "definition": "A small boy (masc)",
          "englishExample": "[uh puh-tee gar-soh]"
        },
        {
          "word": "une petite fille",
          "partOfSpeech": "phrase",
          "definition": "A small girl (fem)",
          "englishExample": "[oon puh-teet fee]"
        },
        {
          "word": "des livres int\xE9ressants",
          "partOfSpeech": "phrase",
          "definition": "Interesting books (masc pl)",
          "englishExample": "[day leevr \u025B\u0303teres\u0251\u0303]"
        },
        {
          "word": "une belle femme",
          "partOfSpeech": "phrase",
          "definition": "A beautiful woman",
          "englishExample": "[oon bel fam]"
        },
        {
          "word": "un beau jour",
          "partOfSpeech": "phrase",
          "definition": "A beautiful day (masc)",
          "englishExample": "[uh bo zhu\u0281]"
        }
      ],
      "quiz": [
        {
          "id": "fr-06-q1",
          "question": 'What is the meaning of "un petit gar\xE7on"?',
          "options": [
            "A small boy (masc)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means A small boy (masc)"
        }
      ]
    }
  },
  {
    "id": "fr-07",
    "category": "conversation",
    "level": "intermediate",
    "title": "Shopping in France",
    "description": "Buy clothes, food, and souvenirs in French",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "french",
    "content": {
      "introduction": "France is known for fashion, food markets, and luxury goods. Shopping vocabulary is highly practical.",
      "words": [
        {
          "word": "Combien \xE7a co\xFBte?",
          "partOfSpeech": "phrase",
          "definition": "How much does it cost?",
          "englishExample": "[k\u0254\u0303by\u025B\u0303 sa kut]"
        },
        {
          "word": "Je cherche...",
          "partOfSpeech": "phrase",
          "definition": "I am looking for...",
          "englishExample": "[zhuh sh\u025B\u0281sh]"
        },
        {
          "word": "Avez-vous une taille plus grande?",
          "partOfSpeech": "phrase",
          "definition": "Do you have a larger size?",
          "englishExample": "[ave vu yn taj ply g\u0281\u0251\u0303d]"
        },
        {
          "word": "Je peux l'essayer?",
          "partOfSpeech": "phrase",
          "definition": "May I try it on?",
          "englishExample": "[zhuh p\xF8 leseje]"
        },
        {
          "word": "Je le prends",
          "partOfSpeech": "phrase",
          "definition": "I will take it",
          "englishExample": "[zhuh luh p\u0281\u0251\u0303]"
        }
      ],
      "quiz": [
        {
          "id": "fr-07-q1",
          "question": 'What is the meaning of "Combien \xE7a co\xFBte?"?',
          "options": [
            "How much does it cost?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means How much does it cost?"
        }
      ]
    }
  },
  {
    "id": "fr-08",
    "category": "conversation",
    "level": "beginner",
    "title": "French Culture & History",
    "description": "Explore French art, philosophy and way of life",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "french",
    "content": {
      "introduction": "France has one of the richest cultural heritages in the world \u2014 from the Enlightenment to haute cuisine.",
      "words": [
        {
          "word": "Libert\xE9, \xC9galit\xE9, Fraternit\xE9",
          "partOfSpeech": "phrase",
          "definition": "Liberty, Equality, Brotherhood (national motto)",
          "englishExample": "[lib\u025B\u0281te egalite f\u0281at\u025B\u0281nite]"
        },
        {
          "word": "Le Louvre",
          "partOfSpeech": "phrase",
          "definition": "World's largest art museum (Paris)",
          "englishExample": "[luh loov\u0281]"
        },
        {
          "word": "La Tour Eiffel",
          "partOfSpeech": "phrase",
          "definition": "The Eiffel Tower",
          "englishExample": "[la tu\u0281 ef\u025Bl]"
        },
        {
          "word": "le cin\xE9ma",
          "partOfSpeech": "phrase",
          "definition": "Cinema (invented in France)",
          "englishExample": "[luh sinema]"
        },
        {
          "word": "la gastronomie",
          "partOfSpeech": "phrase",
          "definition": "Gastronomy \u2014 French culinary tradition",
          "englishExample": "[la gast\u0281\u0254n\u0254mi]"
        }
      ],
      "quiz": [
        {
          "id": "fr-08-q1",
          "question": 'What is the meaning of "Libert\xE9, \xC9galit\xE9, Fraternit\xE9"?',
          "options": [
            "Liberty, Equality, Brotherhood (national motto)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Liberty, Equality, Brotherhood (national motto)"
        }
      ]
    }
  },
  {
    "id": "fr-09",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Numbers & Time",
    "description": "Count, tell time, and use dates in French",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "french",
    "content": {
      "introduction": "French numbers are mostly regular, except for some tricky ones like 70 (soixante-dix) and 80 (quatre-vingts).",
      "words": [
        {
          "word": "soixante-dix",
          "partOfSpeech": "phrase",
          "definition": '70 (literally "sixty-ten")',
          "englishExample": "[swas\u0251\u0303t dis]"
        },
        {
          "word": "quatre-vingts",
          "partOfSpeech": "phrase",
          "definition": '80 (literally "four-twenties")',
          "englishExample": "[kat\u0281uh v\u025B\u0303]"
        },
        {
          "word": "Quelle heure est-il?",
          "partOfSpeech": "phrase",
          "definition": "What time is it?",
          "englishExample": "[k\u025Bl \u0153\u0281 \u025Btil]"
        },
        {
          "word": "Il est midi",
          "partOfSpeech": "phrase",
          "definition": "It is noon",
          "englishExample": "[il \u025B midi]"
        },
        {
          "word": "Lundi, Mardi, Mercredi",
          "partOfSpeech": "phrase",
          "definition": "Monday, Tuesday, Wednesday",
          "englishExample": "[l\u0153\u0303di ma\u0281di m\u025B\u0281k\u0281\u0259di]"
        }
      ],
      "quiz": [
        {
          "id": "fr-09-q1",
          "question": 'What is the meaning of "soixante-dix"?',
          "options": [
            '70 (literally "sixty-ten")',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means 70 (literally "sixty-ten")'
        }
      ]
    }
  },
  {
    "id": "fr-10",
    "category": "grammar",
    "level": "advanced",
    "title": "Subjunctive Mood",
    "description": "Express doubt, wishes, and emotions in French",
    "xpReward": 150,
    "estimatedMinutes": 22,
    "targetLang": "french",
    "content": {
      "introduction": "The subjunctive (subjonctif) is used after expressions of wish, doubt, necessity, and emotion. It is essential for advanced French.",
      "words": [
        {
          "word": "Il faut que tu viennes",
          "partOfSpeech": "phrase",
          "definition": "It is necessary that you come",
          "englishExample": "[il fo kuh ty vy\u025Bn]"
        },
        {
          "word": "Je veux qu'il fasse beau",
          "partOfSpeech": "phrase",
          "definition": "I want the weather to be nice",
          "englishExample": "[zhuh v\xF8 keel fas bo]"
        },
        {
          "word": "Bien que ce soit difficile",
          "partOfSpeech": "phrase",
          "definition": "Although it is difficult",
          "englishExample": "[by\u025B\u0303 kuh suh swa difisil]"
        },
        {
          "word": "Je doute qu'il sache",
          "partOfSpeech": "phrase",
          "definition": "I doubt that he knows",
          "englishExample": "[zhuh dut keel sash]"
        },
        {
          "word": "Pourvu qu'il arrive",
          "partOfSpeech": "phrase",
          "definition": "Provided that he arrives",
          "englishExample": "[pu\u0281vy keel a\u0281iv]"
        }
      ],
      "quiz": [
        {
          "id": "fr-10-q1",
          "question": 'What is the meaning of "Il faut que tu viennes"?',
          "options": [
            "It is necessary that you come",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means It is necessary that you come"
        }
      ]
    }
  },
  {
    "id": "es-01",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Spanish Alphabet & Sounds",
    "description": "Pronunciation guide for Spanish letters",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish pronunciation is highly consistent \u2014 words are almost always pronounced exactly as they are spelled.",
      "words": [
        {
          "word": "\xF1",
          "partOfSpeech": "phrase",
          "definition": 'Like the "ny" in "canyon"',
          "englishExample": "[ny]"
        },
        {
          "word": "rr",
          "partOfSpeech": "phrase",
          "definition": "A rolled/trilled r sound",
          "englishExample": "[trilled r]"
        },
        {
          "word": "h",
          "partOfSpeech": "phrase",
          "definition": "H is always silent in Spanish",
          "englishExample": "[silent]"
        },
        {
          "word": "ll",
          "partOfSpeech": "phrase",
          "definition": 'Like "y" in most dialects',
          "englishExample": "[y/zh]"
        },
        {
          "word": "j",
          "partOfSpeech": "phrase",
          "definition": 'Like a strong "h" sound',
          "englishExample": "[kh]"
        }
      ],
      "quiz": [
        {
          "id": "es-01-q1",
          "question": 'What is the meaning of "\xF1"?',
          "options": [
            'Like the "ny" in "canyon"',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means Like the "ny" in "canyon"'
        }
      ]
    }
  },
  {
    "id": "es-02",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Hola y M\xE1s: Greetings",
    "description": "Greet people in Spanish at any time of day",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish is warm and expressive. Greetings often include questions about health and family.",
      "words": [
        {
          "word": "\xA1Buenos d\xEDas!",
          "partOfSpeech": "phrase",
          "definition": "Good morning!",
          "englishExample": "[bwenos dias]"
        },
        {
          "word": "\xBFC\xF3mo est\xE1s?",
          "partOfSpeech": "phrase",
          "definition": "How are you? (informal)",
          "englishExample": "[komo estas]"
        },
        {
          "word": "Mucho gusto",
          "partOfSpeech": "phrase",
          "definition": "Nice to meet you",
          "englishExample": "[mut\u0283o gusto]"
        },
        {
          "word": "Hasta luego",
          "partOfSpeech": "phrase",
          "definition": "See you later",
          "englishExample": "[asta lwe\u0261o]"
        },
        {
          "word": "\xBFQu\xE9 tal?",
          "partOfSpeech": "phrase",
          "definition": "What's up? / How's it going?",
          "englishExample": "[ke tal]"
        }
      ],
      "quiz": [
        {
          "id": "es-02-q1",
          "question": 'What is the meaning of "\xA1Buenos d\xEDas!"?',
          "options": [
            "Good morning!",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Good morning!"
        }
      ]
    }
  },
  {
    "id": "es-03",
    "category": "grammar",
    "level": "intermediate",
    "title": "Ser vs Estar",
    "description": 'Master the two Spanish verbs "to be"',
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "spanish",
    "content": {
      "introduction": 'Spanish has two verbs meaning "to be": SER for permanent qualities, ESTAR for temporary states and locations.',
      "words": [
        {
          "word": "Soy estudiante",
          "partOfSpeech": "phrase",
          "definition": "I am a student (SER \u2014 identity)",
          "englishExample": "[soy estud-yante]"
        },
        {
          "word": "Estoy cansado",
          "partOfSpeech": "phrase",
          "definition": "I am tired (ESTAR \u2014 state)",
          "englishExample": "[estoy kan-sado]"
        },
        {
          "word": "La casa es grande",
          "partOfSpeech": "phrase",
          "definition": "The house is large (SER \u2014 characteristic)",
          "englishExample": "[la kasa es \u0261rande]"
        },
        {
          "word": "El caf\xE9 est\xE1 caliente",
          "partOfSpeech": "phrase",
          "definition": "The coffee is hot (ESTAR \u2014 condition)",
          "englishExample": "[el kafe esta kalyente]"
        },
        {
          "word": "Estamos en Madrid",
          "partOfSpeech": "phrase",
          "definition": "We are in Madrid (ESTAR \u2014 location)",
          "englishExample": "[estamos en mad\u027Eid]"
        }
      ],
      "quiz": [
        {
          "id": "es-03-q1",
          "question": 'What is the meaning of "Soy estudiante"?',
          "options": [
            "I am a student (SER \u2014 identity)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I am a student (SER \u2014 identity)"
        }
      ]
    }
  },
  {
    "id": "es-04",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Numbers & Money",
    "description": "Count and handle money in Spanish",
    "xpReward": 150,
    "estimatedMinutes": 11,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish numbers are essential for shopping, telling time, and everyday conversations.",
      "words": [
        {
          "word": "uno, dos, tres",
          "partOfSpeech": "phrase",
          "definition": "One, two, three",
          "englishExample": "[uno dos tres]"
        },
        {
          "word": "veinte",
          "partOfSpeech": "phrase",
          "definition": "Twenty",
          "englishExample": "[beynte]"
        },
        {
          "word": "\xBFCu\xE1nto cuesta?",
          "partOfSpeech": "phrase",
          "definition": "How much does it cost?",
          "englishExample": "[kwanto kwesta]"
        },
        {
          "word": "Es muy caro",
          "partOfSpeech": "phrase",
          "definition": "It is very expensive",
          "englishExample": "[es muy karo]"
        },
        {
          "word": "Quiero pagar",
          "partOfSpeech": "phrase",
          "definition": "I want to pay",
          "englishExample": "[kyero pa\u0261ar]"
        }
      ],
      "quiz": [
        {
          "id": "es-04-q1",
          "question": 'What is the meaning of "uno, dos, tres"?',
          "options": [
            "One, two, three",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One, two, three"
        }
      ]
    }
  },
  {
    "id": "es-05",
    "category": "grammar",
    "level": "intermediate",
    "title": "Present Tense Conjugation",
    "description": "Conjugate Spanish regular and irregular verbs",
    "xpReward": 150,
    "estimatedMinutes": 20,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish verbs end in -ar, -er, or -ir. Regular verbs follow predictable patterns; irregular verbs require memorization.",
      "words": [
        {
          "word": "hablar \u2192 hablo",
          "partOfSpeech": "phrase",
          "definition": "To speak \u2192 I speak (-ar verb)",
          "englishExample": "[abl\u0251r / ablo]"
        },
        {
          "word": "comer \u2192 como",
          "partOfSpeech": "phrase",
          "definition": "To eat \u2192 I eat (-er verb)",
          "englishExample": "[komer / komo]"
        },
        {
          "word": "vivir \u2192 vivo",
          "partOfSpeech": "phrase",
          "definition": "To live \u2192 I live (-ir verb)",
          "englishExample": "[bi\u03B2i\u027E / bi\u03B2o]"
        },
        {
          "word": "ir \u2192 voy",
          "partOfSpeech": "phrase",
          "definition": "To go \u2192 I go (irregular)",
          "englishExample": "[i\u027E / boy]"
        },
        {
          "word": "tener \u2192 tengo",
          "partOfSpeech": "phrase",
          "definition": "To have \u2192 I have (irregular yo form)",
          "englishExample": "[tene\u027E / te\u014B\u0261o]"
        }
      ],
      "quiz": [
        {
          "id": "es-05-q1",
          "question": 'What is the meaning of "hablar \u2192 hablo"?',
          "options": [
            "To speak \u2192 I speak (-ar verb)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means To speak \u2192 I speak (-ar verb)"
        }
      ]
    }
  },
  {
    "id": "es-06",
    "category": "conversation",
    "level": "beginner",
    "title": "Spanish-Speaking World",
    "description": "Explore the diversity of Spanish-speaking countries",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish is the 2nd most spoken language by native speakers worldwide, with 20+ countries speaking it as their official language.",
      "words": [
        {
          "word": "M\xE9xico",
          "partOfSpeech": "phrase",
          "definition": "Most populous Spanish-speaking country",
          "englishExample": "[meksi\u039Ao]"
        },
        {
          "word": "La paella",
          "partOfSpeech": "phrase",
          "definition": "Spain's famous rice dish",
          "englishExample": "[la paeja]"
        },
        {
          "word": "El tango",
          "partOfSpeech": "phrase",
          "definition": "Dance from Argentina",
          "englishExample": "[el ta\u014B\u0261o]"
        },
        {
          "word": "El f\xFAtbol",
          "partOfSpeech": "phrase",
          "definition": "Football (soccer) \u2014 a passion across Latin America",
          "englishExample": "[el futbol]"
        },
        {
          "word": "La siesta",
          "partOfSpeech": "phrase",
          "definition": "Afternoon rest \u2014 traditional in Spain",
          "englishExample": "[la syesta]"
        }
      ],
      "quiz": [
        {
          "id": "es-06-q1",
          "question": 'What is the meaning of "M\xE9xico"?',
          "options": [
            "Most populous Spanish-speaking country",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Most populous Spanish-speaking country"
        }
      ]
    }
  },
  {
    "id": "es-07",
    "category": "grammar",
    "level": "intermediate",
    "title": "Preterite Tense",
    "description": "Talk about completed past actions in Spanish",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "spanish",
    "content": {
      "introduction": "The preterite (pret\xE9rito indefinido) is used for completed actions in the past. It is different from the imperfect tense.",
      "words": [
        {
          "word": "Com\xED pizza ayer",
          "partOfSpeech": "phrase",
          "definition": "I ate pizza yesterday",
          "englishExample": "[komi pitsa ayer]"
        },
        {
          "word": "Fui al mercado",
          "partOfSpeech": "phrase",
          "definition": "I went to the market",
          "englishExample": "[fwi al merkado]"
        },
        {
          "word": "Ella lleg\xF3 tarde",
          "partOfSpeech": "phrase",
          "definition": "She arrived late",
          "englishExample": "[ea \u028Ee\u0261o tarde]"
        },
        {
          "word": "Nosotros hablamos",
          "partOfSpeech": "phrase",
          "definition": "We spoke",
          "englishExample": "[nosotros ablamos]"
        },
        {
          "word": "\xBFQu\xE9 hiciste?",
          "partOfSpeech": "phrase",
          "definition": "What did you do?",
          "englishExample": "[ke i\u03B8iste]"
        }
      ],
      "quiz": [
        {
          "id": "es-07-q1",
          "question": 'What is the meaning of "Com\xED pizza ayer"?',
          "options": [
            "I ate pizza yesterday",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I ate pizza yesterday"
        }
      ]
    }
  },
  {
    "id": "es-08",
    "category": "conversation",
    "level": "advanced",
    "title": "At the Doctor",
    "description": "Describe symptoms and understand medical advice",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "spanish",
    "content": {
      "introduction": "Medical Spanish is important for emergencies and healthcare situations in Spanish-speaking countries.",
      "words": [
        {
          "word": "Me duele la cabeza",
          "partOfSpeech": "phrase",
          "definition": "My head hurts",
          "englishExample": "[me dwele la ka\u03B2e\u03B8a]"
        },
        {
          "word": "Tengo fiebre",
          "partOfSpeech": "phrase",
          "definition": "I have a fever",
          "englishExample": "[te\u014B\u0261o fye\u03B2\u027Ee]"
        },
        {
          "word": "Soy al\xE9rgico/a a...",
          "partOfSpeech": "phrase",
          "definition": "I am allergic to...",
          "englishExample": "[soy alerxiko/a a]"
        },
        {
          "word": "Necesito una receta",
          "partOfSpeech": "phrase",
          "definition": "I need a prescription",
          "englishExample": "[ne\u03B8esito una re\u03B8eta]"
        },
        {
          "word": "\xBFD\xF3nde est\xE1 la farmacia?",
          "partOfSpeech": "phrase",
          "definition": "Where is the pharmacy?",
          "englishExample": "[donde esta la farma\u03B8ya]"
        }
      ],
      "quiz": [
        {
          "id": "es-08-q1",
          "question": 'What is the meaning of "Me duele la cabeza"?',
          "options": [
            "My head hurts",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means My head hurts"
        }
      ]
    }
  },
  {
    "id": "es-09",
    "category": "grammar",
    "level": "advanced",
    "title": "Spanish Subjunctive",
    "description": "Express desires, doubts, and hypotheticals",
    "xpReward": 150,
    "estimatedMinutes": 20,
    "targetLang": "spanish",
    "content": {
      "introduction": "The Spanish subjunctive expresses uncertainty, wishes, emotions, and hypotheticals. It is used very frequently in spoken Spanish.",
      "words": [
        {
          "word": "Quiero que vengas",
          "partOfSpeech": "phrase",
          "definition": "I want you to come",
          "englishExample": "[kyero ke ben\u0261as]"
        },
        {
          "word": "Espero que llueva",
          "partOfSpeech": "phrase",
          "definition": "I hope it rains",
          "englishExample": "[espero ke \u028Ewe\u03B2a]"
        },
        {
          "word": "Dudo que sea verdad",
          "partOfSpeech": "phrase",
          "definition": "I doubt that it is true",
          "englishExample": "[du\u03B4o ke sea ber\u03B4ad]"
        },
        {
          "word": "Es importante que estudies",
          "partOfSpeech": "phrase",
          "definition": "It is important that you study",
          "englishExample": "[es importante ke estu\xF0yes]"
        },
        {
          "word": "Cuando llegues, ll\xE1mame",
          "partOfSpeech": "phrase",
          "definition": "When you arrive, call me",
          "englishExample": "[kwando \u028Ee\u0261es \u028Eamame]"
        }
      ],
      "quiz": [
        {
          "id": "es-09-q1",
          "question": 'What is the meaning of "Quiero que vengas"?',
          "options": [
            "I want you to come",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I want you to come"
        }
      ]
    }
  },
  {
    "id": "es-10",
    "category": "vocabulary",
    "level": "intermediate",
    "title": "Spanish Idioms & Slang",
    "description": "Sound like a native with common expressions",
    "xpReward": 150,
    "estimatedMinutes": 13,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish idioms add color and authenticity to your speech. They vary significantly by region.",
      "words": [
        {
          "word": "No hay mal que por bien no venga",
          "partOfSpeech": "phrase",
          "definition": "Every cloud has a silver lining",
          "englishExample": "[\u2014]"
        },
        {
          "word": "Me cost\xF3 un ojo de la cara",
          "partOfSpeech": "phrase",
          "definition": "It cost me an arm and a leg",
          "englishExample": "[\u2014]"
        },
        {
          "word": "Estar en las nubes",
          "partOfSpeech": "phrase",
          "definition": "To have your head in the clouds",
          "englishExample": "[\u2014]"
        },
        {
          "word": "A quien madruga, Dios le ayuda",
          "partOfSpeech": "phrase",
          "definition": "The early bird catches the worm",
          "englishExample": "[\u2014]"
        },
        {
          "word": "\xA1Qu\xE9 guay!",
          "partOfSpeech": "phrase",
          "definition": "How cool! (Spain)",
          "englishExample": "[Spain slang]"
        }
      ],
      "quiz": [
        {
          "id": "es-10-q1",
          "question": 'What is the meaning of "No hay mal que por bien no venga"?',
          "options": [
            "Every cloud has a silver lining",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Every cloud has a silver lining"
        }
      ]
    }
  },
  {
    "id": "zh-01",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Mandarin Tones",
    "description": "Master the 4 tones plus neutral tone",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "chinese",
    "content": {
      "introduction": "Mandarin Chinese has 4 tones plus a neutral tone. The same syllable with different tones has completely different meanings.",
      "words": [
        {
          "word": "m\u0101 (\u5988)",
          "partOfSpeech": "phrase",
          "definition": "Mother",
          "englishExample": "[1st tone (high level)]"
        },
        {
          "word": "m\xE1 (\u9EBB)",
          "partOfSpeech": "phrase",
          "definition": "Hemp / Numb",
          "englishExample": "[2nd tone (rising)]"
        },
        {
          "word": "m\u01CE (\u9A6C)",
          "partOfSpeech": "phrase",
          "definition": "Horse",
          "englishExample": "[3rd tone (dipping)]"
        },
        {
          "word": "m\xE0 (\u9A82)",
          "partOfSpeech": "phrase",
          "definition": "To scold",
          "englishExample": "[4th tone (falling)]"
        },
        {
          "word": "ma (\u5417)",
          "partOfSpeech": "phrase",
          "definition": "Question particle",
          "englishExample": "[neutral tone]"
        }
      ],
      "quiz": [
        {
          "id": "zh-01-q1",
          "question": 'What is the meaning of "m\u0101 (\u5988)"?',
          "options": [
            "Mother",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Mother"
        }
      ]
    }
  },
  {
    "id": "zh-02",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Pinyin System",
    "description": "Use Romanized pinyin to read Chinese",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "chinese",
    "content": {
      "introduction": "Pinyin is the Romanized system for Mandarin Chinese. It uses letters with tone marks to represent pronunciation.",
      "words": [
        {
          "word": "zh",
          "partOfSpeech": "phrase",
          "definition": 'Chinese consonant "zh"',
          "englishExample": '[like "j" in "judge"]'
        },
        {
          "word": "x",
          "partOfSpeech": "phrase",
          "definition": 'Chinese consonant "x"',
          "englishExample": '[like "sh" but softer]'
        },
        {
          "word": "q",
          "partOfSpeech": "phrase",
          "definition": 'Chinese consonant "q"',
          "englishExample": '[like "ch" but forward]'
        },
        {
          "word": "\xFC",
          "partOfSpeech": "phrase",
          "definition": "Front rounded vowel",
          "englishExample": '[pursed lips "ee"]'
        },
        {
          "word": "r",
          "partOfSpeech": "phrase",
          "definition": "Retroflex consonant in Chinese",
          "englishExample": "[retroflex r]"
        }
      ],
      "quiz": [
        {
          "id": "zh-02-q1",
          "question": 'What is the meaning of "zh"?',
          "options": [
            'Chinese consonant "zh"',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means Chinese consonant "zh"'
        }
      ]
    }
  },
  {
    "id": "zh-03",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Greetings in Mandarin",
    "description": "Say hello and basic expressions in Chinese",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "chinese",
    "content": {
      "introduction": 'Chinese greetings are direct and practical. Asking "have you eaten?" (\u5403\u996D\u4E86\u5417) is a common greeting showing care.',
      "words": [
        {
          "word": "\u4F60\u597D",
          "partOfSpeech": "phrase",
          "definition": "Hello",
          "englishExample": "[N\u01D0 h\u01CEo]"
        },
        {
          "word": "\u8C22\u8C22",
          "partOfSpeech": "phrase",
          "definition": "Thank you",
          "englishExample": "[Xi\xE8xi\xE8]"
        },
        {
          "word": "\u5BF9\u4E0D\u8D77",
          "partOfSpeech": "phrase",
          "definition": "Sorry / Excuse me",
          "englishExample": "[Du\xECbuq\u01D0]"
        },
        {
          "word": "\u518D\u89C1",
          "partOfSpeech": "phrase",
          "definition": "Goodbye",
          "englishExample": "[Z\xE0iji\xE0n]"
        },
        {
          "word": "\u5403\u996D\u4E86\u5417?",
          "partOfSpeech": "phrase",
          "definition": "Have you eaten? (friendly greeting)",
          "englishExample": "[Ch\u012B f\xE0n le ma?]"
        }
      ],
      "quiz": [
        {
          "id": "zh-03-q1",
          "question": 'What is the meaning of "\u4F60\u597D"?',
          "options": [
            "Hello",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Hello"
        }
      ]
    }
  },
  {
    "id": "zh-04",
    "category": "vocabulary",
    "level": "intermediate",
    "title": "Chinese Characters: Radicals",
    "description": "Understand the building blocks of Chinese writing",
    "xpReward": 150,
    "estimatedMinutes": 20,
    "targetLang": "chinese",
    "content": {
      "introduction": "Chinese characters are built from radicals \u2014 component elements that hint at meaning. There are 214 Kangxi radicals.",
      "words": [
        {
          "word": "\u4EBA (r\xE9n)",
          "partOfSpeech": "phrase",
          "definition": "Person radical",
          "englishExample": "[ren]"
        },
        {
          "word": "\u6C34 (shu\u01D0)",
          "partOfSpeech": "phrase",
          "definition": "Water radical",
          "englishExample": "[shui]"
        },
        {
          "word": "\u6728 (m\xF9)",
          "partOfSpeech": "phrase",
          "definition": "Tree/Wood radical",
          "englishExample": "[mu]"
        },
        {
          "word": "\u53E3 (k\u01D2u)",
          "partOfSpeech": "phrase",
          "definition": "Mouth radical",
          "englishExample": "[kou]"
        },
        {
          "word": "\u5FC3 (x\u012Bn)",
          "partOfSpeech": "phrase",
          "definition": "Heart radical",
          "englishExample": "[xin]"
        }
      ],
      "quiz": [
        {
          "id": "zh-04-q1",
          "question": 'What is the meaning of "\u4EBA (r\xE9n)"?',
          "options": [
            "Person radical",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Person radical"
        }
      ]
    }
  },
  {
    "id": "zh-05",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Numbers & Dates",
    "description": "Count and express dates in Mandarin",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "chinese",
    "content": {
      "introduction": "Chinese numbers are logical and easy to learn. Once you know 1-10, you can form most other numbers.",
      "words": [
        {
          "word": "\u4E00\u4E8C\u4E09\u56DB\u4E94",
          "partOfSpeech": "phrase",
          "definition": "One two three four five",
          "englishExample": "[y\u012B \xE8r s\u0101n s\xEC w\u01D4]"
        },
        {
          "word": "\u516D\u4E03\u516B\u4E5D\u5341",
          "partOfSpeech": "phrase",
          "definition": "Six seven eight nine ten",
          "englishExample": "[li\xF9 q\u012B b\u0101 ji\u01D4 sh\xED]"
        },
        {
          "word": "\u4ECA\u5929\u51E0\u6708\u51E0\u53F7?",
          "partOfSpeech": "phrase",
          "definition": "What is today's date?",
          "englishExample": "[J\u012Bnti\u0101n j\u01D0 yu\xE8 j\u01D0 h\xE0o?]"
        },
        {
          "word": "\u661F\u671F\u4E00",
          "partOfSpeech": "phrase",
          "definition": "Monday (Star period one)",
          "englishExample": "[X\u012Bngq\u012By\u012B]"
        },
        {
          "word": "\u5E74/\u6708/\u65E5",
          "partOfSpeech": "phrase",
          "definition": "Year / Month / Day",
          "englishExample": "[ni\xE1n / yu\xE8 / r\xEC]"
        }
      ],
      "quiz": [
        {
          "id": "zh-05-q1",
          "question": 'What is the meaning of "\u4E00\u4E8C\u4E09\u56DB\u4E94"?',
          "options": [
            "One two three four five",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One two three four five"
        }
      ]
    }
  },
  {
    "id": "zh-06",
    "category": "grammar",
    "level": "beginner",
    "title": "Basic Sentence Patterns",
    "description": "Build simple Mandarin sentences",
    "xpReward": 150,
    "estimatedMinutes": 14,
    "targetLang": "chinese",
    "content": {
      "introduction": "Mandarin grammar is simpler than many languages \u2014 no verb conjugation, no tenses with endings, no plurals.",
      "words": [
        {
          "word": "\u6211\u662F\u5B66\u751F",
          "partOfSpeech": "phrase",
          "definition": "I am a student",
          "englishExample": "[W\u01D2 sh\xEC xu\xE9sh\u0113ng]"
        },
        {
          "word": "\u4ED6\u6709\u4E00\u672C\u4E66",
          "partOfSpeech": "phrase",
          "definition": "He has one book",
          "englishExample": "[T\u0101 y\u01D2u y\u012B b\u011Bn sh\u016B]"
        },
        {
          "word": "\u6211\u559C\u6B22\u4E2D\u6587",
          "partOfSpeech": "phrase",
          "definition": "I like Chinese",
          "englishExample": "[W\u01D2 x\u01D0hu\u0101n zh\u014Dngw\xE9n]"
        },
        {
          "word": "\u4ECA\u5929\u5929\u6C14\u5F88\u597D",
          "partOfSpeech": "phrase",
          "definition": "Today's weather is very good",
          "englishExample": "[J\u012Bnti\u0101n ti\u0101nq\xEC h\u011Bn h\u01CEo]"
        },
        {
          "word": "\u4F60\u53BB\u54EA\u91CC?",
          "partOfSpeech": "phrase",
          "definition": "Where are you going?",
          "englishExample": "[N\u01D0 q\xF9 n\u01CEl\u01D0?]"
        }
      ],
      "quiz": [
        {
          "id": "zh-06-q1",
          "question": 'What is the meaning of "\u6211\u662F\u5B66\u751F"?',
          "options": [
            "I am a student",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I am a student"
        }
      ]
    }
  },
  {
    "id": "zh-07",
    "category": "conversation",
    "level": "beginner",
    "title": "Chinese Food Culture",
    "description": "Explore Chinese cuisine and dining customs",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "chinese",
    "content": {
      "introduction": "Chinese cuisine is one of the world's most diverse and sophisticated, with 8 major regional cuisines.",
      "words": [
        {
          "word": "\u5317\u4EAC\u70E4\u9E2D",
          "partOfSpeech": "phrase",
          "definition": "Peking Duck",
          "englishExample": "[B\u011Bij\u012Bng k\u01CEoy\u0101]"
        },
        {
          "word": "\u997A\u5B50",
          "partOfSpeech": "phrase",
          "definition": "Dumplings",
          "englishExample": "[Ji\u01CEozi]"
        },
        {
          "word": "\u706B\u9505",
          "partOfSpeech": "phrase",
          "definition": "Hot Pot",
          "englishExample": "[Hu\u01D2gu\u014D]"
        },
        {
          "word": "\u8BF7\u5BA2",
          "partOfSpeech": "phrase",
          "definition": "Treating others to a meal (common hospitality)",
          "englishExample": "[Q\u01D0ngk\xE8]"
        },
        {
          "word": "\u5E72\u676F!",
          "partOfSpeech": "phrase",
          "definition": "Cheers! (dry cup \u2014 drink all)",
          "englishExample": "[G\u0101nb\u0113i!]"
        }
      ],
      "quiz": [
        {
          "id": "zh-07-q1",
          "question": 'What is the meaning of "\u5317\u4EAC\u70E4\u9E2D"?',
          "options": [
            "Peking Duck",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Peking Duck"
        }
      ]
    }
  },
  {
    "id": "zh-08",
    "category": "grammar",
    "level": "intermediate",
    "title": "Measure Words",
    "description": "Use classifiers/measure words correctly in Chinese",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "chinese",
    "content": {
      "introduction": "Every Chinese noun requires a specific measure word (\u91CF\u8BCD) when used with numbers. There are hundreds, but a few key ones cover most situations.",
      "words": [
        {
          "word": "\u4E00\u4E2A\u4EBA",
          "partOfSpeech": "phrase",
          "definition": "One person (\u4E2A g\xE8 = general)",
          "englishExample": "[y\u012B g\xE8 r\xE9n]"
        },
        {
          "word": "\u4E00\u672C\u4E66",
          "partOfSpeech": "phrase",
          "definition": "One book (\u672C = bound objects)",
          "englishExample": "[y\u012B b\u011Bn sh\u016B]"
        },
        {
          "word": "\u4E00\u5F20\u7EB8",
          "partOfSpeech": "phrase",
          "definition": "One sheet of paper (\u5F20 = flat objects)",
          "englishExample": "[y\u012B zh\u0101ng zh\u01D0]"
        },
        {
          "word": "\u4E00\u6761\u9C7C",
          "partOfSpeech": "phrase",
          "definition": "One fish (\u6761 = long/flexible things)",
          "englishExample": "[y\u012B ti\xE1o y\xFA]"
        },
        {
          "word": "\u4E00\u53EA\u732B",
          "partOfSpeech": "phrase",
          "definition": "One cat (\u53EA = small animals)",
          "englishExample": "[y\u012B zh\u012B m\u0101o]"
        }
      ],
      "quiz": [
        {
          "id": "zh-08-q1",
          "question": 'What is the meaning of "\u4E00\u4E2A\u4EBA"?',
          "options": [
            "One person (\u4E2A g\xE8 = general)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One person (\u4E2A g\xE8 = general)"
        }
      ]
    }
  },
  {
    "id": "zh-09",
    "category": "conversation",
    "level": "beginner",
    "title": "Chinese New Year Traditions",
    "description": "Celebrate Chinese festivals and customs",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "chinese",
    "content": {
      "introduction": "Chinese New Year (\u6625\u8282 Ch\u016Bnji\xE9) is the most important celebration in Chinese culture, lasting 15 days.",
      "words": [
        {
          "word": "\u65B0\u5E74\u5FEB\u4E50",
          "partOfSpeech": "phrase",
          "definition": "Happy New Year",
          "englishExample": "[X\u012Bnni\xE1n ku\xE0il\xE8]"
        },
        {
          "word": "\u606D\u559C\u53D1\u8D22",
          "partOfSpeech": "phrase",
          "definition": "Wishing you prosperity (CNY greeting)",
          "englishExample": "[G\u014Dngx\u01D0 f\u0101c\xE1i]"
        },
        {
          "word": "\u7EA2\u5305",
          "partOfSpeech": "phrase",
          "definition": "Red envelope (money gift)",
          "englishExample": "[H\xF3ngb\u0101o]"
        },
        {
          "word": "\u6625\u8054",
          "partOfSpeech": "phrase",
          "definition": "Spring couplets (door decorations)",
          "englishExample": "[Ch\u016Bnli\xE1n]"
        },
        {
          "word": "\u97AD\u70AE",
          "partOfSpeech": "phrase",
          "definition": "Firecrackers",
          "englishExample": "[Bi\u0101np\xE0o]"
        }
      ],
      "quiz": [
        {
          "id": "zh-09-q1",
          "question": 'What is the meaning of "\u65B0\u5E74\u5FEB\u4E50"?',
          "options": [
            "Happy New Year",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Happy New Year"
        }
      ]
    }
  },
  {
    "id": "zh-10",
    "category": "conversation",
    "level": "intermediate",
    "title": "Shopping & Bargaining",
    "description": "Navigate Chinese markets and negotiate prices",
    "xpReward": 150,
    "estimatedMinutes": 14,
    "targetLang": "chinese",
    "content": {
      "introduction": "Chinese markets like Yiwu and silk markets in Beijing are famous for bargaining. Knowing the phrases gives you an advantage.",
      "words": [
        {
          "word": "\u591A\u5C11\u94B1?",
          "partOfSpeech": "phrase",
          "definition": "How much money?",
          "englishExample": "[Du\u014Dsh\u01CEo qi\xE1n?]"
        },
        {
          "word": "\u592A\u8D35\u4E86",
          "partOfSpeech": "phrase",
          "definition": "Too expensive",
          "englishExample": "[T\xE0i gu\xEC le]"
        },
        {
          "word": "\u4FBF\u5B9C\u4E00\u70B9",
          "partOfSpeech": "phrase",
          "definition": "A little cheaper",
          "englishExample": "[Pi\xE1ny\xED y\u012Bdi\u01CEn]"
        },
        {
          "word": "\u6211\u8981\u8FD9\u4E2A",
          "partOfSpeech": "phrase",
          "definition": "I want this one",
          "englishExample": "[W\u01D2 y\xE0o zh\xE8ge]"
        },
        {
          "word": "\u5237\u5361\u53EF\u4EE5\u5417?",
          "partOfSpeech": "phrase",
          "definition": "Can I pay by card?",
          "englishExample": "[Shu\u0101 k\u01CE k\u011By\u01D0 ma?]"
        }
      ],
      "quiz": [
        {
          "id": "zh-10-q1",
          "question": 'What is the meaning of "\u591A\u5C11\u94B1?"?',
          "options": [
            "How much money?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means How much money?"
        }
      ]
    }
  },
  {
    "id": "vi-01",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Vietnamese Tones (6 Tones)",
    "description": "Master all 6 Vietnamese tones",
    "xpReward": 150,
    "estimatedMinutes": 20,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese is a tonal language with 6 tones. Tone marks are written above or below vowels in Vietnamese script.",
      "words": [
        {
          "word": "ma (kh\xF4ng d\u1EA5u)",
          "partOfSpeech": "phrase",
          "definition": '"Ghost" \u2014 flat mid tone',
          "englishExample": "[level tone]"
        },
        {
          "word": "m\xE1 (s\u1EAFc)",
          "partOfSpeech": "phrase",
          "definition": '"Cheek/Mother" \u2014 rising',
          "englishExample": "[rising tone]"
        },
        {
          "word": "m\xE0 (huy\u1EC1n)",
          "partOfSpeech": "phrase",
          "definition": '"But" \u2014 low falling',
          "englishExample": "[falling tone]"
        },
        {
          "word": "m\u1EA3 (h\u1ECFi)",
          "partOfSpeech": "phrase",
          "definition": '"Grave/tomb" \u2014 dipping-rising',
          "englishExample": "[dipping tone]"
        },
        {
          "word": "m\xE3 (ng\xE3)",
          "partOfSpeech": "phrase",
          "definition": '"Code/sign" \u2014 creaky rising',
          "englishExample": "[broken rising]"
        }
      ],
      "quiz": [
        {
          "id": "vi-01-q1",
          "question": 'What is the meaning of "ma (kh\xF4ng d\u1EA5u)"?',
          "options": [
            '"Ghost" \u2014 flat mid tone',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means "Ghost" \u2014 flat mid tone'
        }
      ]
    }
  },
  {
    "id": "vi-02",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Vietnamese Alphabet (Ch\u1EEF Qu\u1ED1c Ng\u1EEF)",
    "description": "Learn the Latin-based Vietnamese script",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese uses a modified Latin alphabet (Ch\u1EEF Qu\u1ED1c Ng\u1EEF) introduced by Portuguese missionaries. It is easier to learn than most Asian scripts.",
      "words": [
        {
          "word": "\u0103",
          "partOfSpeech": "phrase",
          "definition": 'Short "a" vowel',
          "englishExample": "[short a]"
        },
        {
          "word": "\xE2",
          "partOfSpeech": "phrase",
          "definition": 'Deep throat "a" vowel',
          "englishExample": "[deep a]"
        },
        {
          "word": "\u01A1",
          "partOfSpeech": "phrase",
          "definition": "Unrounded back vowel",
          "englishExample": '[unrounded "er"]'
        },
        {
          "word": "\u01B0",
          "partOfSpeech": "phrase",
          "definition": "High back unrounded vowel",
          "englishExample": "[high back]"
        },
        {
          "word": "\u0111",
          "partOfSpeech": "phrase",
          "definition": "\u0110 \u2014 unique Vietnamese letter",
          "englishExample": "[d (implosive)]"
        }
      ],
      "quiz": [
        {
          "id": "vi-02-q1",
          "question": 'What is the meaning of "\u0103"?',
          "options": [
            'Short "a" vowel',
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": 'It means Short "a" vowel'
        }
      ]
    }
  },
  {
    "id": "vi-03",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Xin Ch\xE0o: Greetings",
    "description": "Essential Vietnamese greetings and etiquette",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese greetings are uniquely tied to social hierarchy \u2014 you use different pronouns based on the age relationship.",
      "words": [
        {
          "word": "Xin ch\xE0o",
          "partOfSpeech": "phrase",
          "definition": "Hello (formal)",
          "englishExample": "[sin chow]"
        },
        {
          "word": "C\u1EA3m \u01A1n",
          "partOfSpeech": "phrase",
          "definition": "Thank you",
          "englishExample": "[kahm uhn]"
        },
        {
          "word": "Xin l\u1ED7i",
          "partOfSpeech": "phrase",
          "definition": "Sorry / Excuse me",
          "englishExample": "[sin loy]"
        },
        {
          "word": "T\u1EA1m bi\u1EC7t",
          "partOfSpeech": "phrase",
          "definition": "Goodbye",
          "englishExample": "[tahm byet]"
        },
        {
          "word": "B\u1EA1n c\xF3 kh\u1ECFe kh\xF4ng?",
          "partOfSpeech": "phrase",
          "definition": "How are you? (to a friend)",
          "englishExample": "[ban co kwe khong]"
        }
      ],
      "quiz": [
        {
          "id": "vi-03-q1",
          "question": 'What is the meaning of "Xin ch\xE0o"?',
          "options": [
            "Hello (formal)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Hello (formal)"
        }
      ]
    }
  },
  {
    "id": "vi-04",
    "category": "conversation",
    "level": "beginner",
    "title": "Vietnamese Food Culture",
    "description": "Explore the rich world of Vietnamese cuisine",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese food is celebrated globally for its fresh ingredients, balance of flavors, and regional diversity.",
      "words": [
        {
          "word": "Ph\u1EDF",
          "partOfSpeech": "phrase",
          "definition": "Beef/chicken noodle soup (national dish)",
          "englishExample": "[Fuh]"
        },
        {
          "word": "B\xE1nh m\xEC",
          "partOfSpeech": "phrase",
          "definition": "Vietnamese baguette sandwich",
          "englishExample": "[Bahn mee]"
        },
        {
          "word": "G\u1ECFi cu\u1ED1n",
          "partOfSpeech": "phrase",
          "definition": "Fresh spring rolls",
          "englishExample": "[goy kwon]"
        },
        {
          "word": "B\xFAn b\xF2 Hu\u1EBF",
          "partOfSpeech": "phrase",
          "definition": "Spicy Hue beef noodle soup",
          "englishExample": "[bun baw hway]"
        },
        {
          "word": "C\xE0 ph\xEA tr\u1EE9ng",
          "partOfSpeech": "phrase",
          "definition": "Egg coffee (Hanoi specialty)",
          "englishExample": "[ka feh chung]"
        }
      ],
      "quiz": [
        {
          "id": "vi-04-q1",
          "question": 'What is the meaning of "Ph\u1EDF"?',
          "options": [
            "Beef/chicken noodle soup (national dish)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Beef/chicken noodle soup (national dish)"
        }
      ]
    }
  },
  {
    "id": "vi-05",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Numbers & Counting",
    "description": "Count in Vietnamese for everyday use",
    "xpReward": 150,
    "estimatedMinutes": 11,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese numbers are fairly straightforward. Once you learn 1-10, you can form larger numbers easily.",
      "words": [
        {
          "word": "m\u1ED9t, hai, ba",
          "partOfSpeech": "phrase",
          "definition": "One, two, three",
          "englishExample": "[moht, hi, ba]"
        },
        {
          "word": "b\u1ED1n, n\u0103m, s\xE1u",
          "partOfSpeech": "phrase",
          "definition": "Four, five, six",
          "englishExample": "[bohn, nam, sau]"
        },
        {
          "word": "b\u1EA3y, t\xE1m, ch\xEDn, m\u01B0\u1EDDi",
          "partOfSpeech": "phrase",
          "definition": "Seven, eight, nine, ten",
          "englishExample": "[bay, tam, chin, muoi]"
        },
        {
          "word": "m\u1ED9t tr\u0103m",
          "partOfSpeech": "phrase",
          "definition": "One hundred",
          "englishExample": "[moht tram]"
        },
        {
          "word": "Bao nhi\xEAu ti\u1EC1n?",
          "partOfSpeech": "phrase",
          "definition": "How much money?",
          "englishExample": "[bow nyew tyen]"
        }
      ],
      "quiz": [
        {
          "id": "vi-05-q1",
          "question": 'What is the meaning of "m\u1ED9t, hai, ba"?',
          "options": [
            "One, two, three",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One, two, three"
        }
      ]
    }
  },
  {
    "id": "vi-06",
    "category": "grammar",
    "level": "beginner",
    "title": "Basic Sentence Structure",
    "description": "Build simple Vietnamese sentences",
    "xpReward": 150,
    "estimatedMinutes": 14,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese follows Subject-Verb-Object order like English. There are no verb conjugations or grammatical gender.",
      "words": [
        {
          "word": "T\xF4i \u0103n c\u01A1m",
          "partOfSpeech": "phrase",
          "definition": "I eat rice",
          "englishExample": "[toy an kum]"
        },
        {
          "word": "Anh \u1EA5y h\u1ECDc ti\u1EBFng Anh",
          "partOfSpeech": "phrase",
          "definition": "He studies English",
          "englishExample": "[anh ay hok tyeng anh]"
        },
        {
          "word": "Ch\xFAng t\xF4i th\xEDch Vi\u1EC7t Nam",
          "partOfSpeech": "phrase",
          "definition": "We like Vietnam",
          "englishExample": "[chung toy thik vyet nam]"
        },
        {
          "word": "C\xF4 \u1EA5y \u0111\u1EB9p l\u1EAFm",
          "partOfSpeech": "phrase",
          "definition": "She is very beautiful",
          "englishExample": "[koh ay dep lam]"
        },
        {
          "word": "T\xF4i kh\xF4ng hi\u1EC3u",
          "partOfSpeech": "phrase",
          "definition": "I do not understand",
          "englishExample": "[toy khong hyew]"
        }
      ],
      "quiz": [
        {
          "id": "vi-06-q1",
          "question": 'What is the meaning of "T\xF4i \u0103n c\u01A1m"?',
          "options": [
            "I eat rice",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I eat rice"
        }
      ]
    }
  },
  {
    "id": "vi-07",
    "category": "conversation",
    "level": "beginner",
    "title": "Vietnamese Festivals",
    "description": "Celebrate T\u1EBFt and major Vietnamese traditions",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "T\u1EBFt Nguy\xEAn \u0110\xE1n (Vietnamese Lunar New Year) is the most important holiday \u2014 a time for family reunion, offerings, and new beginnings.",
      "words": [
        {
          "word": "Ch\xFAc M\u1EEBng N\u0103m M\u1EDBi",
          "partOfSpeech": "phrase",
          "definition": "Happy New Year",
          "englishExample": "[chuk mung nam moy]"
        },
        {
          "word": "B\xE1nh ch\u01B0ng",
          "partOfSpeech": "phrase",
          "definition": "Square sticky rice cake (Tet food)",
          "englishExample": "[banh chung]"
        },
        {
          "word": "L\xEC x\xEC",
          "partOfSpeech": "phrase",
          "definition": "Lucky money in red envelope",
          "englishExample": "[lee see]"
        },
        {
          "word": "H\u1ED9i An",
          "partOfSpeech": "phrase",
          "definition": "Ancient town famous for lantern festival",
          "englishExample": "[Hoy An]"
        },
        {
          "word": "Trung Thu",
          "partOfSpeech": "phrase",
          "definition": "Mid-Autumn Festival (mooncake celebration)",
          "englishExample": "[Chung Too]"
        }
      ],
      "quiz": [
        {
          "id": "vi-07-q1",
          "question": 'What is the meaning of "Ch\xFAc M\u1EEBng N\u0103m M\u1EDBi"?',
          "options": [
            "Happy New Year",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Happy New Year"
        }
      ]
    }
  },
  {
    "id": "vi-08",
    "category": "conversation",
    "level": "intermediate",
    "title": "At the Market (Ch\u1EE3)",
    "description": "Navigate Vietnamese markets with confidence",
    "xpReward": 150,
    "estimatedMinutes": 13,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese wet markets (ch\u1EE3) are lively and colorful. Bargaining is expected in most traditional markets.",
      "words": [
        {
          "word": "C\xE1i n\xE0y gi\xE1 bao nhi\xEAu?",
          "partOfSpeech": "phrase",
          "definition": "How much is this?",
          "englishExample": "[kai nay jah bao nyew]"
        },
        {
          "word": "\u0110\u1EAFt qu\xE1!",
          "partOfSpeech": "phrase",
          "definition": "Too expensive!",
          "englishExample": "[daht kwa]"
        },
        {
          "word": "B\u1EDBt \u0111i m\u1ED9t ch\xFAt",
          "partOfSpeech": "phrase",
          "definition": "Reduce it a little",
          "englishExample": "[bert dee moht chut]"
        },
        {
          "word": "Cho t\xF4i xem",
          "partOfSpeech": "phrase",
          "definition": "Let me see it",
          "englishExample": "[cho toy sem]"
        },
        {
          "word": "T\xF4i mua c\xE1i n\xE0y",
          "partOfSpeech": "phrase",
          "definition": "I will buy this one",
          "englishExample": "[toy mua kai nay]"
        }
      ],
      "quiz": [
        {
          "id": "vi-08-q1",
          "question": 'What is the meaning of "C\xE1i n\xE0y gi\xE1 bao nhi\xEAu?"?',
          "options": [
            "How much is this?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means How much is this?"
        }
      ]
    }
  },
  {
    "id": "vi-09",
    "category": "grammar",
    "level": "intermediate",
    "title": "Vietnamese Classifiers",
    "description": "Use noun classifiers correctly in Vietnamese",
    "xpReward": 150,
    "estimatedMinutes": 15,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Like Chinese, Vietnamese uses classifiers before nouns when counting or specifying. They indicate the category of object.",
      "words": [
        {
          "word": "con ch\xF3",
          "partOfSpeech": "phrase",
          "definition": "Dog (con = living things)",
          "englishExample": "[kon cho]"
        },
        {
          "word": "c\xE1i b\xE0n",
          "partOfSpeech": "phrase",
          "definition": "Table (c\xE1i = inanimate objects)",
          "englishExample": "[kai ban]"
        },
        {
          "word": "quy\u1EC3n s\xE1ch",
          "partOfSpeech": "phrase",
          "definition": "Book (quy\u1EC3n = bound objects)",
          "englishExample": "[kwen sak]"
        },
        {
          "word": "t\u1EDD b\xE1o",
          "partOfSpeech": "phrase",
          "definition": "Newspaper (t\u1EDD = flat sheets)",
          "englishExample": "[tuh bao]"
        },
        {
          "word": "c\u1ED1c n\u01B0\u1EDBc",
          "partOfSpeech": "phrase",
          "definition": "Glass of water (c\u1ED1c = cup-shaped)",
          "englishExample": "[kohk nuok]"
        }
      ],
      "quiz": [
        {
          "id": "vi-09-q1",
          "question": 'What is the meaning of "con ch\xF3"?',
          "options": [
            "Dog (con = living things)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Dog (con = living things)"
        }
      ]
    }
  },
  {
    "id": "vi-10",
    "category": "conversation",
    "level": "intermediate",
    "title": "Travel Phrases in Vietnam",
    "description": "Navigate Vietnam by bus, taxi, and motorbike",
    "xpReward": 150,
    "estimatedMinutes": 13,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnam is increasingly popular with tourists. Knowing transportation phrases makes your travel smoother.",
      "words": [
        {
          "word": "B\u1EBFn xe bu\xFDt \u1EDF \u0111\xE2u?",
          "partOfSpeech": "phrase",
          "definition": "Where is the bus station?",
          "englishExample": "[ben se bweet uh dau]"
        },
        {
          "word": "Cho t\xF4i \u0111\u1EBFn...",
          "partOfSpeech": "phrase",
          "definition": "Take me to... (taxi/xe \xF4m)",
          "englishExample": "[cho toy den]"
        },
        {
          "word": "Bao nhi\xEAu ti\u1EC1n?",
          "partOfSpeech": "phrase",
          "definition": "How much?",
          "englishExample": "[bao nyew tyen]"
        },
        {
          "word": "D\u1EEBng \u1EDF \u0111\xE2y",
          "partOfSpeech": "phrase",
          "definition": "Stop here",
          "englishExample": "[dung uh day]"
        },
        {
          "word": "C\xE1ch \u0111\xE2y bao xa?",
          "partOfSpeech": "phrase",
          "definition": "How far from here?",
          "englishExample": "[kak day bao sa]"
        }
      ],
      "quiz": [
        {
          "id": "vi-10-q1",
          "question": 'What is the meaning of "B\u1EBFn xe bu\xFDt \u1EDF \u0111\xE2u?"?',
          "options": [
            "Where is the bus station?",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Where is the bus station?"
        }
      ]
    }
  }
];

// src/lessonsData.ts
var DEFAULT_LESSONS = [
  ...LANGUAGE_LESSONS,
  // --- GRAMMAR ---
  {
    id: "g-1",
    category: "grammar",
    level: "beginner",
    title: "Present Continuous Tense",
    description: "Learn how to describe actions happening right now at this moment.",
    xpReward: 150,
    estimatedMinutes: 8,
    content: {
      explanation: "The Present Continuous tense is used to describe actions that are in progress right now (at the moment of speaking) or temporary situations.",
      keyRules: [
        "Form: Subject + am/is/are + verb-ing.",
        "Uses: Actions happening now, temporary habits, or current trends.",
        "Negative: Subject + am/is/are + not + verb-ing.",
        "Question: Am/Is/Are + Subject + verb-ing?"
      ],
      examples: [
        {
          english: "I am learning English right now in my study room.",
          structureExplanation: "Subject (I) + am + verb-ing (learning) + time indicator (right now)."
        },
        {
          english: "She is writing an email to her manager.",
          structureExplanation: 'Subject (She) + is + verb-ing (writing). Third-person singular requires "is".'
        },
        {
          english: "They are not watching television; they are reading.",
          structureExplanation: "Negative present continuous (are not watching) followed by affirmative (are reading)."
        }
      ],
      quiz: [
        {
          id: "g1-q1",
          question: 'Complete the sentence: "Listen! The birds ________ in the garden."',
          options: [
            "is singing",
            "are singing",
            "singing",
            "sing"
          ],
          answerIndex: 1,
          explanation: '"Birds" is plural, so we use the auxiliary "are" + "singing".'
        },
        {
          id: "g1-q2",
          question: 'What is the correct negative form of: "He is doing his homework"?',
          options: [
            "He is not do his homework.",
            "He don't doing his homework.",
            "He isn't doing his homework.",
            "He is doing not homework."
          ],
          answerIndex: 2,
          explanation: `To form the negative, insert "not" after the auxiliary verb "is" (is not = isn't).`
        },
        {
          id: "g1-q3",
          question: "Identify the present continuous sentence:",
          options: [
            "I go to school every day.",
            "The sun is shining beautifully today.",
            "We enjoyed our trip to Tokyo last year.",
            "You will pass the English exam easily."
          ],
          answerIndex: 1,
          explanation: '"The sun is shining" fits the [Subject + is + verb-ing] structure describing an action in progress.'
        }
      ]
    }
  },
  {
    id: "g-2",
    category: "grammar",
    level: "intermediate",
    title: "First and Second Conditionals",
    description: "Learn to talk about real possibilities versus imaginary situations in the present and future.",
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      explanation: "Conditionals describe the result of a certain condition. The First Conditional talks about real, possible future events. The Second Conditional talks about imaginary, hypothetical, or highly unlikely situations in the present/future.",
      keyRules: [
        "First Conditional rule: If + Present Simple, will + base verb. (For real/likely situations).",
        "Second Conditional rule: If + Past Simple, would + base verb. (For imaginary/unlikely situations).",
        'Note: In Second Conditional, "were" is preferred for all subjects with the verb "to be" (e.g., If I were you...).'
      ],
      examples: [
        {
          english: "If it rains tomorrow, we will study inside.",
          structureExplanation: "First conditional. Real possibility. If + Present Simple (rains), Main clause + will (will study)."
        },
        {
          english: "If I won the lottery, I would travel around the world.",
          structureExplanation: "Second conditional. Imaginary scenario. If + Past Simple (won), Main clause + would (would travel)."
        },
        {
          english: "If I were a bird, I would fly across the oceans.",
          structureExplanation: 'Second conditional. Impossible situation. Displays the use of "were" with singular subject "I".'
        }
      ],
      quiz: [
        {
          id: "g2-q1",
          question: 'Complete the First Conditional: "If you ________ hard, you will pass your English exam."',
          options: [
            "study",
            "studied",
            "will study",
            "studies"
          ],
          answerIndex: 0,
          explanation: 'In first conditional "if-clauses", we use the Present Simple tense: "If you study...".'
        },
        {
          id: "g2-q2",
          question: 'Choose the correct Second Conditional form: "If she ________ more money, she ________ a sports car."',
          options: [
            "has / will buy",
            "had / will buy",
            "had / would buy",
            "would have / bought"
          ],
          answerIndex: 2,
          explanation: "Second conditional formula is If + Past Simple (had), would + base verb (would buy)."
        },
        {
          id: "g2-q3",
          question: "Which sentence represents an imaginary present advice context?",
          options: [
            "If I have time, I always cook dinner.",
            "If I were you, I would take that online pronunciation class.",
            "If you don't rush, you will miss the train.",
            "I'll call you when I reach Thailand."
          ],
          answerIndex: 1,
          explanation: '"If I were you, I would..." is a classic advice phrase using the imaginary Second Conditional.'
        }
      ]
    }
  },
  {
    id: "g-noun-common-proper",
    category: "grammar",
    level: "beginner",
    title: "Noun Branches: Common vs. Proper Nouns",
    description: "Understand the foundational blocks of nouns and master the difference between common names and specific proper titles.",
    xpReward: 150,
    estimatedMinutes: 6,
    content: {
      explanation: "Nouns are naming words. Nouns represent people, places, things, or abstract ideas. The most fundamental branch of nouns splits general items (Common Nouns) from specific unique identities (Proper Nouns).",
      keyRules: [
        "A Common Noun is a generic name for a person, place, or thing in a class or group (e.g. city, teacher, park). Common nouns are not capitalized unless they start a sentence.",
        "A Proper Noun is the specific, unique name of an individual person, place, or thing (e.g. London, Mr. Harrison, Yellowstone National Park, Monday). Proper nouns always start with a capital letter.",
        "Proper nouns encompass names of people, specific geographic features, days, months, holidays, brands, and titles."
      ],
      examples: [
        {
          english: "The young woman drove a brand-new car into the busy city.",
          structureExplanation: "All nouns in this sentence (woman, car, city) are general common nouns. They do not refer to specific, unique items and thus are uncapitalized."
        },
        {
          english: "Alice drove her Toyota through the streets of Paris.",
          structureExplanation: 'Here, "Alice" (specific person), "Toyota" (specific brand/car), and "Paris" (specific city) are Proper Nouns. They are capitalized, regardless of position.'
        },
        {
          english: "We started our interesting course on Tuesday.",
          structureExplanation: '"course" is a common noun, while "Tuesday" is a proper noun since it represents a specific named day of the week.'
        }
      ],
      quiz: [
        {
          id: "gncp-q1",
          question: 'Identify the proper noun in the following sentence: "We spent the holiday exploring a quiet museum in Tokyo."',
          options: [
            "holiday",
            "museum",
            "Tokyo",
            "quiet"
          ],
          answerIndex: 2,
          explanation: '"Tokyo" is the specific name of a city, making it a proper noun. "Holiday" and "museum" are general categories (common nouns), and "quiet" is an adjective.'
        },
        {
          id: "gncp-q2",
          question: "Find the sentence with correct capitalization:",
          options: [
            "Every Wednesday, my class visits Dr. Peterson at mercy hospital.",
            "Every wednesday, my class visits Dr. Peterson at Mercy Hospital.",
            "Every Wednesday, my class visits Dr. Peterson at Mercy Hospital.",
            "Every wednesday, my Class visits dr. Peterson at mercy hospital."
          ],
          answerIndex: 2,
          explanation: `"Wednesday" (day), "Dr. Peterson" (person's title and name), and "Mercy Hospital" (specific hospital) are all proper nouns requiring capitalization.`
        },
        {
          id: "gncp-q3",
          question: "Which of the following pairs contains one common noun and one proper noun?",
          options: [
            "ocean / river",
            "country / France",
            "Microsoft / Apple",
            "man / building"
          ],
          answerIndex: 1,
          explanation: '"country" is a general common noun; "France" is a specific country name, which makes it a proper noun.'
        }
      ]
    }
  },
  {
    id: "g-noun-concrete-abstract",
    category: "grammar",
    level: "beginner",
    title: "Noun Branches: Concrete vs. Abstract Nouns",
    description: "Learn to classify nouns based on physical experience: those you can touch and perceive vs. ideas, state of being, and concept.",
    xpReward: 150,
    estimatedMinutes: 6,
    content: {
      explanation: "Another distinct branch of nouns deals with physical existence. Concrete Nouns represent things that have a physical presence, while Abstract Nouns represent states, emotions, concepts, or ideas that cannot be perceived by the five senses.",
      keyRules: [
        "Concrete Nouns can be detected by at least one of your five senses (sight, hearing, touch, smell, or taste). Examples: coffee, stone, baby, song, smoke.",
        "Abstract Nouns name ideas, quality traits, emotions, conditions, or concepts that have no physical existence. Examples: love, danger, intelligence, honesty, freedom.",
        "Abstract nouns cannot be touched, held, tasted, or seen, but they are vital for expressing complex thoughts and feelings."
      ],
      examples: [
        {
          english: "The student wrote the answers on the paper using a heavy metal pen.",
          structureExplanation: "All nouns here (student, answers, paper, pen) are concrete because they describe physical entities or written symbols that you can physically look at or touch."
        },
        {
          english: "True friendship is built on mutual trust and absolute honesty.",
          structureExplanation: '"friendship", "trust", and "honesty" are abstract nouns. They represent social structures, feelings, or moral virtues with no physical form.'
        },
        {
          english: "The delicious smell of warm bread filled the small bakery.",
          structureExplanation: '"smell" (sensory perception), "bread" (physical object), and "bakery" (building) are concrete nouns.'
        }
      ],
      quiz: [
        {
          id: "gnca-q1",
          question: "Which of these nouns is an abstract noun denoting a state or emotion?",
          options: [
            "Guitar",
            "Happiness",
            "Perfume",
            "Raindrop"
          ],
          answerIndex: 1,
          explanation: '"Happiness" is an emotional state with no physical substance, making it an abstract noun. Guitar, Perfume, and Raindrop are physical objects.'
        },
        {
          id: "gnca-q2",
          question: 'Identify the concrete noun in this sentence: "Her courage inspired everyone in the courtroom."',
          options: [
            "courage",
            "inspired",
            "everyone",
            "courtroom"
          ],
          answerIndex: 3,
          explanation: '"courtroom" represents a physical room/building (concrete noun). "courage" is an abstract qualities noun.'
        },
        {
          id: "gnca-q3",
          question: "Choose the group containing ONLY abstract nouns:",
          options: [
            "Justice, fear, wisdom",
            "Wind, shadow, ice",
            "Teacher, curriculum, grade",
            "Book, knowledge, alphabet"
          ],
          answerIndex: 0,
          explanation: '"Justice" (concept), "fear" (emotion), and "wisdom" (intellectual property) are entirely abstract with no direct physical form.'
        }
      ]
    }
  },
  {
    id: "g-noun-countable-uncountable",
    category: "grammar",
    level: "intermediate",
    title: "Noun Branches: Countable vs. Uncountable Nouns",
    description: "Master how English separates individual countable units from mass quantities, and learn correct quantifiers.",
    xpReward: 180,
    estimatedMinutes: 8,
    content: {
      explanation: "This noun branch deals with quantification. Countable Nouns are items we can split and count as individual objects. Uncountable Nouns are seen as a whole undivided bulk or general abstract substance that cannot be counted in units without containers or specific measuring words.",
      keyRules: [
        'Countable nouns can have singular or plural forms (e.g. one dog, two dogs). They can take the indefinite articles "a" or "an" when singular.',
        'Uncountable nouns (or Mass nouns) have only one form. They are treated as singular but cannot take "a" or "an". Examples: water, luggage, advice, sand, air, money.',
        'Use "many", "few", "a few", or number counts for countable nouns. Use "much", "little", "a little", or "some" for uncountable nouns.',
        'To count uncountable nouns, append a unit phrase: "a glass of water", "three pieces of luggage", "a bit of advice".'
      ],
      examples: [
        {
          english: "She has three books and a dictionary on her office desk.",
          structureExplanation: '"books", "dictionary", and "desk" are countable nouns. "books" has a plural ending "s" and a numeral "three". "dictionary" uses article "a".'
        },
        {
          english: "We would love some information about the hotel accommodations and luggage storage.",
          structureExplanation: '"information" and "luggage" are uncountable nouns in English. We do not say "an information" or "luggages". We use "some" to denote quantity.'
        },
        {
          english: "He spent too much money buying beautiful new furniture.",
          structureExplanation: 'Both "money" and "furniture" are uncountable. They use "much" instead of "many", and do not terminate in "s".'
        }
      ],
      quiz: [
        {
          id: "gncu-q1",
          question: "Which of the following nouns is UNCOUNTABLE in English?",
          options: [
            "Luggage",
            "Suitcase",
            "Bag",
            "Ticket"
          ],
          answerIndex: 0,
          explanation: '"Luggage" is an uncountable collective mass in English. "Suitcase", "Bag", and "Ticket" are regular countable nouns.'
        },
        {
          id: "gncu-q2",
          question: 'Complete the sentence with the correct quantifier: "We have very ________ time remaining; please hurry!"',
          options: [
            "few",
            "little",
            "many",
            "a few"
          ],
          answerIndex: 1,
          explanation: '"time" (in this general context) is uncountable, so we use "little". "Few" is reserved for countable plurals (e.g., "few minutes").'
        },
        {
          id: "gncu-q3",
          question: "Identify the grammatically correct sentence:",
          options: [
            "Could you give me some advices?",
            "The chef needs much flour to bake the cake.",
            "He bought three furnitures for his living room.",
            "I have many homeworks to do tonight."
          ],
          answerIndex: 1,
          explanation: '"flour" is uncountable and correctly uses "much". Advice, furniture, and homework are uncountable and cannot be pluralized as "advices", "furnitures", or "homeworks".'
        }
      ]
    }
  },
  {
    id: "g-noun-collective-compound",
    category: "grammar",
    level: "intermediate",
    title: "Noun Branches: Collective & Compound Nouns",
    description: "Learn collective nouns that capture a group as a single entity and compound nouns formed by linking words.",
    xpReward: 180,
    estimatedMinutes: 8,
    content: {
      explanation: "These branches specialize in combining entities. Collective Nouns represent single groups of multiple individuals. Compound Nouns merge two or more distinct words to form a completely new conceptual noun.",
      keyRules: [
        "Collective Nouns name groups of people, animals, or objects (e.g., team, family, audience, pack, herd, swarm).",
        'In American English, collective nouns usually govern singular verbs when acting as a unified body ("the team is playing well"). In British English, plural verbs are also common ("the team are arguing among themselves").',
        "Compound Nouns are made of two or more words. They can be written as one closed word (e.g., toothbrush, classroom), separated by a space (e.g., ice cream, post office), or hyphenated (e.g., mother-in-law, well-being)."
      ],
      examples: [
        {
          english: "The noisy crowd was asked to leave the quiet theater immediately.",
          structureExplanation: '"crowd" is a collective noun designating a large group of people. In this sentence, it takes the singular verb form "was".'
        },
        {
          english: "My brother-in-law bought a warm raincoat before visiting the post office.",
          structureExplanation: 'Three compound nouns in action: "brother-in-law" (hyphenated), "raincoat" (closed compound), and "post office" (spaced compound).'
        },
        {
          english: "A small swarm of bees was seen buzzing near the swimming pool.",
          structureExplanation: '"swarm" is a collective noun for bees. "swimming pool" is a spaced compound noun.'
        }
      ],
      quiz: [
        {
          id: "gncc-q1",
          question: "Which word is a collective noun representing a group of experts or decision-makers?",
          options: [
            "Manager",
            "Committee",
            "Worker",
            "Business"
          ],
          answerIndex: 1,
          explanation: '"Committee" is a collective noun representing a formal assembly of multiple individuals acting as a single unit.'
        },
        {
          id: "gncc-q2",
          question: "Identify the compound noun that is written under a hyphenated form:",
          options: [
            "Classroom",
            "Hot dog",
            "Father-in-law",
            "Air conditioner"
          ],
          answerIndex: 2,
          explanation: '"Father-in-law" is a hyphenated compound noun. "Classroom" is closed, and "Hot dog" and "Air conditioner" are spaced.'
        },
        {
          id: "gncc-q3",
          question: 'Choose the correct verb form for collective singular agreement: "The herd of cows ________ grazing in the green meadow."',
          options: [
            "is",
            "are",
            "were",
            "be"
          ],
          answerIndex: 0,
          explanation: '"herd" is a singular collective noun representing the group, so it takes the singular verb "is" in standard formal grammar.'
        }
      ]
    }
  },
  {
    id: "g-noun-possessive-plural",
    category: "grammar",
    level: "intermediate",
    title: "Noun Branches: Possessive & Plural Nouns",
    description: "Learn correct apostrophe and spelling rules for regular plurals, irregular forms, and complex ownership expressions.",
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: "This critical branch explains how nouns alter their spelling to express quantities greater than one (Plurals) and to manifest ownership or relationship (Possessives). Rules differ for regular and irregular forms.",
      keyRules: [
        'Regular Plurals add "-s" (cat -> cats). Nouns ending in -ch, -s, -sh, -x, or -z add "-es" (box -> boxes). Consonant + "y" endings change to "-ies" (baby -> babies).',
        'Irregular Plurals do not follow the "-s" rule (e.g., child -> children, foot -> feet, leaf -> leaves, mouse -> mice, sheep -> sheep).',
        `Singular Possessives: Add apostrophe + s ('s) even if the noun ends in -s (e.g. "my cat's collar", "Charles's book").`,
        `Plural Possessives ending in "s": Just add a lone apostrophe. E.g., "the players' coach". Plural possessives not ending in "s" add 's: "the children's schoolbag".`
      ],
      examples: [
        {
          english: "The children's books are placed on the bottom shelves of the library.",
          structureExplanation: `"children" is an irregular plural (child -> children). We add "'s" to denote ownership by the children. "shelves" is plural (shelf -> shelves).`
        },
        {
          english: "Those three actresses' spectacular dresses were chosen by professional stylists.",
          structureExplanation: `"actresses" is a regular plural ending in "s". To show possession, we append only the apostrophe (') at the very end of the word.`
        },
        {
          english: "Several wolves were chasing sheep outside the local farmer's property.",
          structureExplanation: `"wolves" (plural of wolf) and "sheep" (plural of sheep - identical form). "farmer's" displays singular possession.`
        }
      ],
      quiz: [
        {
          id: "gnpp-q1",
          question: 'What is the correct plural form of the word "Tooth"?',
          options: [
            "Tooths",
            "Teeth",
            "Teeths",
            "Toothes"
          ],
          answerIndex: 1,
          explanation: '"Tooth" has an irregular plural change which replaces the internal vowels: "Teeth".'
        },
        {
          id: "gnpp-q2",
          question: "Choose the correct possessive formulation to denote toys belonging to multiple puppies:",
          options: [
            "The puppies's toy is on the lawn.",
            "The puppies' toys are on the lawn.",
            "The puppy's toys are on the lawn.",
            "The puppies toys are on the lawn."
          ],
          answerIndex: 1,
          explanation: `"puppies" is the plural of puppy. Because it ends in "s", we add only a trailing apostrophe (') to make it plural possessive.`
        },
        {
          id: "gnpp-q3",
          question: 'Complete the sentence: "The main door of the ________ dressing room was locked."',
          options: [
            "womens",
            "women's",
            "womens'",
            "woman's"
          ],
          answerIndex: 1,
          explanation: `"women" is an irregular plural not ending in "s". To form its possessive, we add standard "'s".`
        }
      ]
    }
  },
  {
    id: "g-3",
    category: "grammar",
    level: "intermediate",
    title: "Present Perfect vs. Past Simple",
    description: "Learn when to tie events to the present versus describing finished, distinct historical timeframes.",
    xpReward: 180,
    estimatedMinutes: 10,
    content: {
      explanation: "Modern English distinguishes heavily between completed past actions with an active connection to the present (Present Perfect) and actions locked inside completed historic time (Past Simple).",
      keyRules: [
        "Present Perfect: Subject + have/has + past participle. Used for life experience, duration up to now, or modern results of past actions with NO specific time given.",
        "Past Simple: Subject + past verb. Used for completely completed actions occurring inside restricted, finished past times (yesterday, last year, in 2012).",
        'Time markers differ: "Since", "for", "yet", "already", and "ever" point to Present Perfect. "Yesterday", "ago", "last week", and "when I was small" require Past Simple.'
      ],
      examples: [
        {
          english: "I have visited Rome three times in my life, and I know it well.",
          structureExplanation: "Present Perfect (have visited). Focused on general accumulated life experience up to this moment."
        },
        {
          english: "I visited Rome last May with my college roommate.",
          structureExplanation: 'Past Simple (visited) triggered by the explicit finished timeframe "last May".'
        },
        {
          english: "He has lived here for six years (and still lives here). He moved here in 2018.",
          structureExplanation: "Present perfect indicates an active continuing duration. Second clause uses Past Simple to pin-point the specific move year."
        }
      ],
      quiz: [
        {
          id: "g3-q1",
          question: 'Complete the sentence: "She ________ in this city since she was ten years old."',
          options: [
            "lived",
            "lives",
            "has lived",
            "is living"
          ],
          answerIndex: 2,
          explanation: '"Since" indicates a duration starting in the past and continuing up to now, demanding the Present Perfect "has lived".'
        },
        {
          id: "g3-q2",
          question: "Choose the correct past-pointing sentence:",
          options: [
            "I have seen that movie yesterday afternoon.",
            "I saw that movie yesterday afternoon.",
            "I seen that movie yesterday afternoon.",
            "I am seeing that movie yesterday afternoon."
          ],
          answerIndex: 1,
          explanation: '"Yesterday afternoon" is a fully completed past time, requiring the Past Simple verb "saw".'
        },
        {
          id: "g3-q3",
          question: "What is the question to ask if someone has done something at any point in their life?",
          options: [
            "Did you ever eat sushi?",
            "Have you ever eaten sushi?",
            "Were you eating sushi?",
            "Do you eat sushi last year?"
          ],
          answerIndex: 1,
          explanation: '"Have you ever + past participle?" is the correct Present Perfect pattern to ask about lifetime experience.'
        }
      ]
    }
  },
  {
    id: "g-4",
    category: "grammar",
    level: "intermediate",
    title: "The Passive Voice",
    description: "Learn how to alter sentence focus from the person doing the action to the entity receiving the action.",
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: "The Passive Voice is used when the focus is on the action itself or on the person/thing affected by the action, rather than the agent performing the action.",
      keyRules: [
        'Form of Passive: Subject (receiver) + appropriate form of verb "to be" + Past Participle of the main verb.',
        'If we want to mention the agent (the doer), we introduce them using the preposition "by".',
        "Passive is very common in journalism, scientific reports, and formal business letters to establish neutral, objective tones."
      ],
      examples: [
        {
          english: "The beautiful glass window was broken by the strong wind.",
          structureExplanation: "The window (receiver) + was (past of verb to be) + broken (past participle of break) + by wind (agent)."
        },
        {
          english: "Spanish is spoken in many countries across South America.",
          structureExplanation: "Present passive (is spoken) focusing on the language itself. The actual individuals speaking are omitted as they are obvious."
        },
        {
          english: "The complex software project will be finished next Monday.",
          structureExplanation: 'Future passive voice: "will be" + past participle "finished".'
        }
      ],
      quiz: [
        {
          id: "g4-q1",
          question: 'Change this active sentence to a passive sentence: "My brother painted the kitchen yesterday."',
          options: [
            "The kitchen was painted by my brother yesterday.",
            "The kitchen painted by my brother yesterday.",
            "The kitchen is painted by my brother yesterday.",
            "The kitchen has been painted yesterday by my brother."
          ],
          answerIndex: 0,
          explanation: '"kitchen" is singular, so we use "was" (Past Simple of be) + past participle "painted" + "by my brother".'
        },
        {
          id: "g4-q2",
          question: "Identify the sentence in the passive voice:",
          options: [
            "They are building a modern bridge downtown.",
            "A modern bridge is being built downtown.",
            "A modern bridge was built by active workers.",
            "Both B and C are passive voice sentences."
          ],
          answerIndex: 3,
          explanation: 'Both "is being built" (present continuous passive) and "was built" (past simple passive) are passive-voice structures.'
        },
        {
          id: "g4-q3",
          question: 'Complete the sentence: "Bicycles ________ in this factory since 1995."',
          options: [
            "are made",
            "have been made",
            "made",
            "were made"
          ],
          answerIndex: 1,
          explanation: 'The time indicator "since 1995" requires the Present Perfect Passive: "have been made".'
        }
      ]
    }
  },
  {
    id: "g-5",
    category: "grammar",
    level: "advanced",
    title: "Reported Speech",
    description: "Master backshifting tenses and modifying pronouns to accurately report what another person said.",
    xpReward: 220,
    estimatedMinutes: 11,
    content: {
      explanation: 'Reported speech (or Indirect Speech) is used to tell someone what another person said without repeating their exact words. We use reporting verbs like "say" or "tell" and backshift the original tense into the past.',
      keyRules: [
        "Backshift rule: Shift the tense back into the past when reporting. E.g., Present Simple -> Past Simple; Present Continuous -> Past Continuous; Will -> Would.",
        'Pronouns shift to match the new perspective (e.g., "I like cake" -> "She said she liked cake").',
        'Time clauses adjust: "tomorrow" -> "the next day", "yesterday" -> "the day before", "here" -> "there".',
        'If the original sentence is a question, use "if" or "whether" for yes/no questions, and restore standard affirmative word order (no "do/does/did").'
      ],
      examples: [
        {
          english: "He said that he was studying for his final examinations.",
          structureExplanation: 'Reported. Original direct was: "I am studying for my examinations" (Present continuous shifted to Past Continuous).'
        },
        {
          english: "She told me that she had already visited Spain the year before.",
          structureExplanation: 'Reported. Original direct was: "I already visited Spain last year" (Past simple shifts back to Past Perfect "had visited", and last year backshifts).'
        },
        {
          english: "They asked me if I lived in this neighborhood.",
          structureExplanation: 'Reported question. Original was the yes/no question: "Do you live in this neighborhood?". Standard word order has changed, removing "Do".'
        }
      ],
      quiz: [
        {
          id: "g5-q1",
          question: 'Report the direct quote: "I will call you tomorrow," said Henry to Sarah.',
          options: [
            "Henry said she would call me the next day.",
            "Henry told Sarah that he would call her the next day.",
            "Henry said Sarah that he will call her tomorrow.",
            "Henry told Sarah that he will call her tomorrow."
          ],
          answerIndex: 1,
          explanation: '"will" shifts to "would", "I" shifts to "he", "you" shifts to "her", and "tomorrow" backshifts to "the next day". We use "told" when the listener (Sarah) is named.'
        },
        {
          id: "g5-q2",
          question: 'What is the correct reported speech form of: "Where do you work?" asked Mary.',
          options: [
            "Mary asked me where did I work.",
            "Mary asked me where I worked.",
            "Mary asked me if I worked.",
            "Mary asked me where do I work."
          ],
          answerIndex: 1,
          explanation: '"Where do you work?" is a Wh-question. In reported speech, we drop the auxiliary "do" and restore declarative statement word order: "where I worked".'
        },
        {
          id: "g5-q3",
          question: 'If a direct quote is in the Present Perfect ("I have eaten"), what does it shift to in reported speech?',
          options: [
            'Past Simple ("I ate")',
            'Past Perfect ("He had eaten")',
            'Present Continuous ("He is eating")',
            'Would eat ("He would eat")'
          ],
          answerIndex: 1,
          explanation: 'Present Perfect backshifts directly to Past Perfect ("had eaten") in reported speech.'
        }
      ]
    }
  },
  // --- VOCABULARY ---
  {
    id: "v-1",
    category: "vocabulary",
    level: "beginner",
    title: "Essential Hotel & Travel Phrases",
    description: "Learn the most common words and expressions used when checking into a hotel or traveling.",
    xpReward: 120,
    estimatedMinutes: 6,
    content: {
      introduction: "Traveling to an English-speaking country can be exciting! Here are the core vocabulary words you need to speak with hotel clerks and guide services confidently.",
      words: [
        {
          word: "Reservation",
          partOfSpeech: "noun",
          definition: "An arrangement to secure a room, seat, or table in advance.",
          englishExample: 'I have a reservation under the name "Tanaka".'
        },
        {
          word: "Check-in",
          partOfSpeech: "noun / verb",
          definition: "The process of registering and receiving keys at a hotel or airport.",
          englishExample: "What is the official check-in time of this hotel?"
        },
        {
          word: "Amenities",
          partOfSpeech: "noun",
          definition: "Useful features or facilities of a building, such as a swimming pool, gym, or free Wi-Fi.",
          englishExample: "The hotel amenities include a fitness center, a spa, and complimentary breakfast."
        },
        {
          word: "Shuttle service",
          partOfSpeech: "noun",
          definition: "A passenger vehicle that makes frequent short trips back and forth between two points.",
          englishExample: "Does the resort provide a free shuttle service to the airport?"
        }
      ],
      quiz: [
        {
          id: "v1-q1",
          question: 'What is the word for "an arrangement to secure a room in advance"?',
          options: [
            "Lobby",
            "Reservation",
            "Checkout",
            "Luggage"
          ],
          answerIndex: 1,
          explanation: '"Reservation" means reserving a room or service in advance.'
        },
        {
          id: "v1-q2",
          question: `Complete the request: "Excuse me, I'd like to ________ our keys and verify our check-out time."`,
          options: [
            "shuttle",
            "amenity",
            "return",
            "registering"
          ],
          answerIndex: 2,
          explanation: `"Return" fits best: "I'd like to return our keys...".`
        },
        {
          id: "v1-q3",
          question: "Free gym, swimming pool, and high-speed Wi-Fi are examples of:",
          options: [
            "Amenities",
            "Reservations",
            "Check-ins",
            "Shuttle services"
          ],
          answerIndex: 0,
          explanation: 'These features and physical conveniences are defined as hotel "Amenities".'
        }
      ]
    }
  },
  {
    id: "v-2",
    category: "vocabulary",
    level: "advanced",
    title: "Idiomatic Corporate & Business English",
    description: "Master professional metaphors and business idioms to excel in workspace negotiations and meetings.",
    xpReward: 220,
    estimatedMinutes: 10,
    content: {
      introduction: "Business meetings in global settings are filled with slang and metaphors. To understand colleagues, master these high-frequency corporate idioms.",
      words: [
        {
          word: "On the same page",
          partOfSpeech: "idiom",
          definition: "In agreement; sharing the exact same understanding or plan.",
          englishExample: "Let's review the proposal once more to make sure we are all on the same page."
        },
        {
          word: "Touch base",
          partOfSpeech: "idiom / verb",
          definition: "Briefly make contact with someone to update each other or review progress.",
          englishExample: "I will touch base with you tomorrow afternoon after checking the project budget."
        },
        {
          word: "Think outside the box",
          partOfSpeech: "idiom",
          definition: "Generate creative and unorthodox solutions; step outside normal logic rules.",
          englishExample: "To beat our competitors, our layout designers must start thinking outside the box."
        },
        {
          word: "Keep me in the loop",
          partOfSpeech: "idiom / phrase",
          definition: "Keep someone informed about a plan, updates, or progress.",
          englishExample: "Please keep me in the loop regarding the client's feedback."
        }
      ],
      quiz: [
        {
          id: "v2-q1",
          question: 'Which idiom means "briefly connect with someone to get an update"?',
          options: [
            "Think outside the box",
            "Touch base",
            "On the same page",
            "Move the needle"
          ],
          answerIndex: 1,
          explanation: '"Touch base" is a baseball metaphor meaning to contact/chat with someone briefly.'
        },
        {
          id: "v2-q2",
          question: 'What does "being on the same page" refer to?',
          options: [
            "Reading the identical corporate report",
            "Having the exact same agreement or understanding",
            "Working on paper instead of digital screens",
            "Publishing a document at the same hour"
          ],
          answerIndex: 1,
          explanation: '"On the same page" refers to sharing the same viewpoint or understanding on a project.'
        },
        {
          id: "v2-q3",
          question: 'When a manager asks you to "think outside the box", they want:',
          options: [
            "Unorthodox, creative, innovative solutions",
            "To double check shipping container boxes",
            "Work strictly inside the standard routine rules from the textbook",
            "A basic presentation template"
          ],
          answerIndex: 0,
          explanation: '"Outside the box" designates highly creative and innovative thinking.'
        }
      ]
    }
  },
  // --- LISTENING ---
  {
    id: "l-1",
    category: "listening",
    level: "beginner",
    title: "Ordering Coffee at a Lively Cafe",
    description: "Listen to a natural everyday conversation between a customer and a barista.",
    xpReward: 140,
    estimatedMinutes: 7,
    content: {
      context: 'Sarah walks into "The Daily Grind" cafe to order her morning coffee. Barron is working as the cashier barricaded behind the brewing machine.',
      speakerNames: ["Barista", "Sarah"],
      transcript: [
        { speaker: "Barista", text: "Good morning! Welcome to The Daily Grind. What can I get started for you today?" },
        { speaker: "Sarah", text: "Hi there! Can I please get a medium hot cafe latte?" },
        { speaker: "Barista", text: "Sure thing! Do you have any milk preference? We have whole milk, skim milk, oat milk, or almond milk." },
        { speaker: "Sarah", text: "I would love oat milk, please. Oh, and can you make it half-sweet? I don't want it too sugary." },
        { speaker: "Barista", text: "Got it. One medium oat milk latte, half-sweet. Are we staying here or is that to-go?" },
        { speaker: "Sarah", text: "To-go, please. I also see those blueberry muffins in the display case. Are they freshly baked?" },
        { speaker: "Barista", text: "Yes, they are! Our baker brought them in just an hour ago. They are still warm." },
        { speaker: "Sarah", text: "Perfect! I'll take one blueberry muffin as well." },
        { speaker: "Barista", text: "You got it. That will be one medium oat milk latte and one muffin. Your total is eight dollars and fifty cents." }
      ],
      quiz: [
        {
          id: "l1-q1",
          question: "What kind of beverage did Sarah order?",
          options: [
            "A cold brew coffee",
            "A medium hot cafe latte",
            "An iced green tea",
            "An espresso shot"
          ],
          answerIndex: 1,
          explanation: 'Sarah explicitly says: "Can I please get a medium hot cafe latte?"'
        },
        {
          id: "l1-q2",
          question: "Which milk substitute did Sarah request for her coffee?",
          options: [
            "Whole milk",
            "Almond milk",
            "Oat milk",
            "Skim milk"
          ],
          answerIndex: 2,
          explanation: 'She says: "I would love oat milk, please."'
        },
        {
          id: "l1-q3",
          question: "Why did Sarah decide to buy a blueberry muffin?",
          options: [
            "It was on a 50% discount sale.",
            "They were freshly baked and still warm.",
            "The barista gave it to her for free.",
            "She is gluten-intolerant and needed a snack."
          ],
          answerIndex: 1,
          explanation: `The barista mentions the baker brought them in an hour ago and they are still warm, which prompts Sarah to say "Perfect! I'll take one...".`
        }
      ]
    }
  },
  {
    id: "l-2",
    category: "listening",
    level: "intermediate",
    title: "The Busy Airport Boarding Call",
    description: "Listen to a typical speaker announcement made at an international departure terminal gate.",
    xpReward: 180,
    estimatedMinutes: 9,
    content: {
      context: "A final announcements announcer speaker chimes over terminal 4 gates at Bangkok International Airport during departure hour.",
      speakerNames: ["Gate Announcer"],
      transcript: [
        { speaker: "Gate Announcer", text: "Attention all passengers. This is the pre-boarding announcement for flight TG-679 with service to London Heathrow, currently boarding at Gate forty-two." },
        { speaker: "Gate Announcer", text: "We would like to invite passengers with small children, and those requiring special assistance, to step forward and begin boarding at this time." },
        { speaker: "Gate Announcer", text: "We also request our First Class and Business Class premium club passengers to queue in Lane A." },
        { speaker: "Gate Announcer", text: "Economy class passengers will be called shortly by boarding group numbers. Please check your physical boarding pass for your Group letter: A, B, or C." },
        { speaker: "Gate Announcer", text: "Please ensure your flight cabin luggage bags meet the airline size limits, and have your passport and boarding pass ready for ticket inspection at the podium. Thank you." }
      ],
      quiz: [
        {
          id: "l2-q1",
          question: "What is the flight number and final destination mentioned in the boarding announcement?",
          options: [
            "Flight LA-100 to Los Angeles",
            "Flight TG-679 to London Heathrow",
            "Flight EK-384 to Dubai",
            "Flight Thai-505 to Tokyo Narita"
          ],
          answerIndex: 1,
          explanation: 'The announcer states the flight number is "TG-679 with service to London Heathrow".'
        },
        {
          id: "l2-q2",
          question: "Who is invited to board during the first pre-boarding sequence?",
          options: [
            "Economy class group C passengers",
            "First Class status level flyers",
            "Passengers with small children and individuals requiring special assistance",
            "Flight attendants and administrative airport staff"
          ],
          answerIndex: 2,
          explanation: 'The announcement states: "invite passengers with small children, and those requiring special assistance...".'
        },
        {
          id: "l2-q3",
          question: "Which physical items are passengers requested to prepare for scanning?",
          options: [
            "Passport and visa paperwork printouts",
            "Their carry-on luggage baggage declaration receipt",
            "Their passport and boarding pass",
            "Their cell phone ticket email scan"
          ],
          answerIndex: 2,
          explanation: 'The announcer requests to: "have your passport and boarding pass ready for ticket inspection...".'
        }
      ]
    }
  },
  // --- PRONUNCIATION ---
  {
    id: "p-1",
    category: "pronunciation",
    level: "beginner",
    title: 'The Two English "TH" Sounds',
    description: 'Master the difference between the Voiceless "TH" and Voiced "TH" sounds, which are crucial for clear accent work.',
    xpReward: 160,
    estimatedMinutes: 8,
    content: {
      phoneme: "Voiceless /\u03B8/ vs. Voiced /\xF0/",
      howToProduce: 'To make both "TH" sounds, place the tip of your tongue very slightly between your upper and lower front teeth. Do NOT bite hard. For the Voiceless /\u03B8/ (as in "think"), push only air through without utilizing your throat vocal cords. For the Voiced /\xF0/ (as in "this"), activate your vocal cords to feel a vibration on your tongue.',
      practiceWords: [
        { word: "Think", ipa: "/\u03B8\u026A\u014Bk/", guide: "Voiceless. High air push, no throat vocal tone." },
        { word: "This", ipa: "/\xF0\u026As/", guide: "Voiced. Pronounce with focal vibration in the throat." },
        { word: "Three", ipa: "/\u03B8ri\u02D0/", guide: 'Voiceless. Do not pronounce as "tree" or "free". Keep tongue forward.' },
        { word: "Father", ipa: "/\u02C8f\u0251\u02D0\xF0\u0259/", guide: "Voiced. Warm vocal hum in the middle of the word." }
      ],
      practiceSentences: [
        {
          text: "These three brothers think they are healthy.",
          emphasis: "Combines multiplevoiced (These, brothers) and voiceless (three, think, healthy) sounds in succession."
        },
        {
          text: "Father and mother smoothed the clothing.",
          emphasis: "Fully voiced /\xF0/ sentences. Notice the vibration on mother, father, smoothed, the, clothing."
        }
      ],
      quiz: [
        {
          id: "p1-q1",
          question: "Which of the following words contains the Voiceless /\u03B8/ sound (no throat vibration)?",
          options: [
            "There",
            "Thank you",
            "Though",
            "Other"
          ],
          answerIndex: 1,
          explanation: '"Thank you" uses the voiceless /\u03B8/ sound, whereas There, Though, and Other contain throat vocalization (/\xF0/).'
        },
        {
          id: "p1-q2",
          question: 'Where should your tongue be placed to correctly produce the "TH" sound?',
          options: [
            "Pressed flat against the bottom of your mouth",
            "Touch the hard roof of your mouth",
            "Slightly between your front teeth, pushing air past the gap",
            "Curled backward touching the uvula"
          ],
          answerIndex: 2,
          explanation: "By slightly inserting the tip of the tongue between your upper and lower teeth, you create the narrow channel required for both TH fricatives."
        },
        {
          id: "p1-q3",
          question: 'Choose the word that has a different "TH" sound than the other three: "Thinking, Tooth, Thread, Together"',
          options: [
            "Thinking",
            "Tooth",
            "Thread",
            "Together"
          ],
          answerIndex: 3,
          explanation: "Thinking (/\u03B8/), Tooth (/\u03B8/), and Thread (/\u03B8/) are all voiceless. Together (/\xF0/) is voiced, making it the odd one out."
        }
      ]
    }
  },
  {
    id: "p-2",
    category: "pronunciation",
    level: "intermediate",
    title: "Silent Letters & Word Connection",
    description: "Learn which English letters to drop entirely and how words blend together in natural dialogs.",
    xpReward: 180,
    estimatedMinutes: 9,
    content: {
      phoneme: "Silent B, K, W & Connected Speech",
      howToProduce: 'Many English words contain spelled letters that are never pronounced (e.g., knee, bomb, write). Additionally, when speaking quickly, the final consonant of one word connects with the first vowel of the next word (e.g., "cup of" sounds like "cup-ov").',
      practiceWords: [
        { word: "Knee", ipa: "/ni\u02D0/", guide: "Silent letter K. Only pronounce /ni\u02D0/." },
        { word: "Climb", ipa: "/kla\u026Am/", guide: 'Silent letter B. Never pronounce the final "b". stop at "m".' },
        { word: "Answer", ipa: "/\u02C8\u0251\u02D0ns\u0259/", guide: 'Silent letter W. Do not pronounce "w" sound inside.' },
        { word: "Doubt", ipa: "/da\u028At/", guide: 'Silent letter B. The "b" is not sounded: sounds exactly like "dout".' }
      ],
      practiceSentences: [
        {
          text: "He knows how to climb the mountain without doubt.",
          emphasis: "Contains silent K (knows), silent B (climb, doubt) and silent W (without)."
        },
        {
          text: "She wrote a quick answer to her boss, then walked away.",
          emphasis: 'Connect "wrote a" (/ro\u028A-t\u0259/) and look at silent W (wrote, answer) and silent L (walked).'
        }
      ],
      quiz: [
        {
          id: "p2-q1",
          question: 'In the word "Wednesday", which letter is completely silent?',
          options: [
            'The first "d"',
            'The first "e"',
            'The "s"',
            'The "n"'
          ],
          answerIndex: 0,
          explanation: 'Wednesday is pronounced /\u02C8w\u025Bnzde\u026A/, where the first letter "d" is completely dropped.'
        },
        {
          id: "p2-q2",
          question: 'Choose the word that has a silent "k" at the beginning:',
          options: [
            "Kangaroo",
            "Keyboard",
            "Knowledge",
            "Kingdom"
          ],
          answerIndex: 2,
          explanation: '"Knowledge" is pronounced starting directly with the /n/ sound; the "K" is completely silent.'
        },
        {
          id: "p2-q3",
          question: 'How is "climb to the top" connected in natural speech?',
          options: [
            "By shouting each word with a heavy pause between them",
            'The silent letter "b" in climb remains unpronounced, and the vocal energy flows directly from "clime" to "to"',
            'By pronouncing the letter "b" to make "climb-ba"',
            "By spelling out letters out loud"
          ],
          answerIndex: 1,
          explanation: 'Because B is silent, "climb" ends in the "m" sound, blending seamlessly with the preposition "to".'
        }
      ]
    }
  },
  // === PRESENT SIMPLE TENSE ===
  {
    id: "g-tense-present-simple",
    category: "grammar",
    level: "beginner",
    title: "Present Simple Tense",
    description: "Master the core tense for general truths, daily habits, and permanent states.",
    xpReward: 150,
    estimatedMinutes: 7,
    content: {
      explanation: "The Present Simple tense is the most fundamental building block in English grammar. It is used to talk about facts that are always true, habits, daily routines, or permanent states of being.",
      keyRules: [
        "Affirmative: Subject + verb (add -s or -es for singular third-person: he, she, it).",
        "Negative: Subject + do not (don't) / does not (doesn't) + base verb (no -s).",
        "Interrogative: Do / Does + Subject + base verb?",
        "State verbs: Often used with non-continuous thinking/feeling verbs (know, believe, like, love)."
      ],
      examples: [
        {
          english: "Water boils at 100 degrees Celsius under standard atmospheric pressure.",
          structureExplanation: 'General truth / scientific fact. "Water" is singular (it), so we add "-s" to "boil" -> "boils".'
        },
        {
          english: "He does not drink coffee in the evening, but he always enjoys tea.",
          structureExplanation: 'Negative habit. "Does not" removes the "-s" of the main verb ("drink"). "Enjoys" is the affirmative singular.'
        },
        {
          english: "Do you study English at the university every afternoon?",
          structureExplanation: 'Question pattern. Uses auxiliary "Do" at the front because the subject is "you".'
        }
      ],
      quiz: [
        {
          id: "gps-q1",
          question: "Which of the following sentences represents a correct third-person singular habit?",
          options: [
            "She go to the gym every Saturday morning.",
            "She goes to the gym every Saturday morning.",
            "She going to the gym every Saturday morning.",
            "She don't goes to the gym every Saturday morning."
          ],
          answerIndex: 1,
          explanation: '"She" is third-person singular, which requires the verb ending "-es" (goes).'
        },
        {
          id: "gps-q2",
          question: 'Choose the correct negative form of the sentence: "They like broccoli."',
          options: [
            "They doesn't like broccoli.",
            "They don't likes broccoli.",
            "They like not broccoli.",
            "They don't like broccoli."
          ],
          answerIndex: 3,
          explanation: `"They" is plural, requiring the auxiliary "don't" + the base verb "like".`
        },
        {
          id: "gps-q3",
          question: 'Complete the question: "________ your father work in downtown Chicago?"',
          options: [
            "Do",
            "Does",
            "Is",
            "Has"
          ],
          answerIndex: 1,
          explanation: '"Your father" is he (singular third-person), so we use the helper verb "Does" to initiate the question.'
        }
      ]
    }
  },
  // === PRESENT PERFECT TENSE ===
  {
    id: "g-tense-present-perfect",
    category: "grammar",
    level: "intermediate",
    title: "Present Perfect Simple Tense",
    description: "Learn how to describe lifetime accomplishments, active duration, and past actions with current consequences.",
    xpReward: 160,
    estimatedMinutes: 8,
    content: {
      explanation: "The Present Perfect Connects the present moment with the past. It shows that an action happened at an unspecified time in the past and carries an active relevance or result right now.",
      keyRules: [
        "Form: Subject + have / has + past participle (irregular or ending in -ed).",
        "Life Experiences: Describe what you have or haven't done without specifying a precise date.",
        'Just / Already / Yet: "Just" (very recently), "Already" (earlier than expected), "Yet" (not up to now; used in negatives and questions).',
        'For vs. Since: "For" measures the length of period (e.g. for 5 years). "Since" pinpoints the starting date/hour (e.g. since 2012).'
      ],
      examples: [
        {
          english: "I have already lost my keys, so I cannot enter the classroom.",
          structureExplanation: "Connection to present. The past lost action results in a present inability to get inside."
        },
        {
          english: "She has worked in London for six years and loves her current job.",
          structureExplanation: "An action that started in the past and is still true or ongoing in the present."
        },
        {
          english: "Have they ever ridden a camel in the desert?",
          structureExplanation: "Asking about generic life experience up to the present moment."
        }
      ],
      quiz: [
        {
          id: "gpp-q1",
          question: 'Complete the sentence: "We ________ to Paris twice, but we would love to go again."',
          options: [
            "have been",
            "were",
            "are gone",
            "has been"
          ],
          answerIndex: 0,
          explanation: '"We" takes the auxiliary "have". We use "have been" to describe life experiences of visiting somewhere and returning.'
        },
        {
          id: "gpp-q2",
          question: "What is the correct negative sentence denoting unfinished work?",
          options: [
            "I have finished already my homework yet.",
            "I hasn't finished my homework yet.",
            "I haven't finished my homework yet.",
            "I cleared my homework yet."
          ],
          answerIndex: 2,
          explanation: `"I" is paired with "haven't". Adverb "yet" fits perfectly at the end of negative present perfect clauses.`
        },
        {
          id: "gpp-q3",
          question: 'Choose "for" or "since" correctly: "He has been sick ________ Monday morning."',
          options: [
            "for",
            "since",
            "during",
            "ago"
          ],
          answerIndex: 1,
          explanation: '"Monday morning" is a specific starting time point, so we use "since".'
        }
      ]
    }
  },
  // === PRESENT PERFECT CONTINUOUS TENSE ===
  {
    id: "g-tense-present-perfect-continuous",
    category: "grammar",
    level: "intermediate",
    title: "Present Perfect Continuous Tense",
    description: "Learn to emphasize the ongoing nature, duration, or recent physical consequences of an action starting in the past.",
    xpReward: 170,
    estimatedMinutes: 9,
    content: {
      explanation: "The Present Perfect Continuous focuses on the duration or process of an activity that began in the past and is either still happening now, or has just finished and left highly visible physical signs.",
      keyRules: [
        "Form: Subject + have / has + been + verb-ing.",
        'Emphasize duration: Focused on "how long" we have been doing something.',
        "Temporary duration: Expresses temporary situations (e.g. I have been sleeping on the couch recently).",
        "State verbs exception: Verbs like like, know, believe, belong cannot be used in continuous forms; use Present Perfect Simple instead (e.g., I have known her for years, NOT I have been knowing)."
      ],
      examples: [
        {
          english: "It has been raining continuously for three hours, and the ground is soaked.",
          structureExplanation: "Action began in the past, is still ongoing, and has created visible physical wetness in the present."
        },
        {
          english: "I am exhausted because I have been working in the garden all morning.",
          structureExplanation: "Focus on recent physical exertion. The work may have just completed, but the exhaustion resides key in the present."
        },
        {
          english: "How long have you been studying for your final English test?",
          structureExplanation: "Standard question formula inquiring about continuous time duration up to now."
        }
      ],
      quiz: [
        {
          id: "gppc-q1",
          question: 'Complete the sentence: "Sorry about my dirty hands. I ________ in the soil outside."',
          options: [
            "have been digging",
            "had dug",
            "dig",
            "am dig"
          ],
          answerIndex: 0,
          explanation: 'The present state (dirty hands) is a visible consequence of a recently finished continuous activity. "Have been digging" is correct.'
        },
        {
          id: "gppc-q2",
          question: "Which verb is NOT allowed in the Present Perfect Continuous?",
          options: [
            "Read",
            "Know",
            "Run",
            "Write"
          ],
          answerIndex: 1,
          explanation: '"Know" is a state/stative verb. You cannot say "I have been knowing him." You must say "I have known him."'
        },
        {
          id: "gppc-q3",
          question: 'Choose the correct formulation: "They ________ video games since 9 AM."',
          options: [
            "has been playing",
            "have been playing",
            "have played been",
            "were playing"
          ],
          answerIndex: 1,
          explanation: '"They" is plural, which takes "have been" + the continuous participle form "playing".'
        }
      ]
    }
  },
  // === PAST SIMPLE TENSE ===
  {
    id: "g-tense-past-simple",
    category: "grammar",
    level: "beginner",
    title: "Past Simple Tense",
    description: "Learn the rules for regular and irregular verbs to talk about completed actions in specific past times.",
    xpReward: 140,
    estimatedMinutes: 7,
    content: {
      explanation: "The Past Simple tense is used to describe actions that started and finished in a specific, completed timeframe in the past.",
      keyRules: [
        "Regular verbs form: Add -ed to the base verb (walk -> walked, live -> lived, study -> studied).",
        'Irregular verbs do not follow the "-ed" rule. They completely change form (buy -> bought, go -> went, meet -> met, write -> wrote).',
        "Negative: Subject + did not (didn't) + base verb (no past form on the main verb).",
        "Interrogative: Did + Subject + base verb?",
        'State / Verb to be: Past of "be" is "was" (I/he/she/it) or "were" (we/you/they).'
      ],
      examples: [
        {
          english: "We visited a historic castle and bought delicious pastries yesterday.",
          structureExplanation: 'Completed past actions. "Visited" is regular, while "bought" is the irregular past form of "buy".'
        },
        {
          english: "She did not like the movie that she watched last night.",
          structureExplanation: 'Negative form. "Did not" is followed by the base form "like". The relative clause contains regular past "watched".'
        },
        {
          english: "Did you meet the new manager during the conference in London last week?",
          structureExplanation: 'Questions use auxiliary "Did" + base form "meet" (not did you met).'
        }
      ],
      quiz: [
        {
          id: "gpsim-q1",
          question: 'Identify the irregular past tense of "write" and "buy":',
          options: [
            "writed / buyed",
            "wrote / bought",
            "written / bought",
            "wrote / buyed"
          ],
          answerIndex: 1,
          explanation: '"Write" becomes "wrote" and "buy" becomes "bought" in Past Simple. "Written" is a past participle.'
        },
        {
          id: "gpsim-q2",
          question: "Find the correct past question formulation:",
          options: [
            "Did you went to the store yesterday?",
            "Did you go to the store yesterday?",
            "Were you go to the store yesterday?",
            "Gone you to the store yesterday?"
          ],
          answerIndex: 1,
          explanation: 'To formulate a past simple question, use "Did" + Subject + Base Verb ("Did you go").'
        },
        {
          id: "gpsim-q3",
          question: 'Complete the sentence: "They ________ on the beach because it was extremely cold last night."',
          options: [
            "didn't walk",
            "didn't walked",
            "not walked",
            "wasn't walk"
          ],
          answerIndex: 0,
          explanation: `Past Simple negative requires "didn't" + base verb: "didn't walk".`
        }
      ]
    }
  },
  // === PAST CONTINUOUS TENSE ===
  {
    id: "g-tense-past-continuous",
    category: "grammar",
    level: "intermediate",
    title: "Past Continuous Tense",
    description: "Learn to describe actions that were actively in progress at a specific past point or during interruptions.",
    xpReward: 150,
    estimatedMinutes: 8,
    content: {
      explanation: "The Past Continuous tense describes actions that were in middle of occurring in the past. It is frequently paired with Past Simple to show a longer action interrupted by a shorter action.",
      keyRules: [
        "Form: Subject + was / were + verb-ing.",
        "Uses: Actions in progress at a distinct past time (e.g., At 8 PM, I was reading).",
        'Parallel actions: Two actions happening at the same time in the past using "while" (e.g., I was studying while she was cooking).',
        'Interrupted action: Direct background setting. Use Past Continuous for the long action and Past Simple for the interrupting event introduced by "when".'
      ],
      examples: [
        {
          english: "I was cleaning the living room when the doorbell suddenly rang.",
          structureExplanation: "Background long action (was cleaning) is interrupted by a short, sharp past simple key event (rang)."
        },
        {
          english: "What were you doing at exactly ten o'clock last night when the power went out?",
          structureExplanation: "Interrogative form. Inquiring about progress at a specific time coordinate."
        },
        {
          english: "We were talking about him while they were searching for the files.",
          structureExplanation: "Parallel continuous activities running simultaneously inside past blocks."
        }
      ],
      quiz: [
        {
          id: "gpc-q1",
          question: 'Complete the past situation: "When I walked into the kitchen, my sister ________ a cake."',
          options: [
            "bakes",
            "was baking",
            "baked",
            "were baking"
          ],
          answerIndex: 1,
          explanation: '"My sister" (singular she) takes "was" + "baking". The action was ongoing background when the walk-in interruption occurred.'
        },
        {
          id: "gpc-q2",
          question: "Choose the correct formulation for parallel actions:",
          options: [
            "While my husband was working, I was sleeping.",
            "While my husband worked, I slept background.",
            "My husband was working when I was sleeping.",
            "My husband is working while I slept."
          ],
          answerIndex: 0,
          explanation: 'Parallel past ongoing events are ideally linked with "While" + Past Continuous on both clauses.'
        },
        {
          id: "gpc-q3",
          question: "What is the correct negative past continuous sentence?",
          options: [
            "We was not playing piano.",
            "We was not play piano.",
            "We weren't playing piano.",
            "We didn't playing piano."
          ],
          answerIndex: 2,
          explanation: `"We" takes plural past auxiliary "were", negative is "weren't" + "playing".`
        }
      ]
    }
  },
  // === PAST PERFECT TENSE ===
  {
    id: "g-tense-past-perfect",
    category: "grammar",
    level: "advanced",
    title: "Past Perfect Simple Tense",
    description: "Learn to clearly order historic events by establishing which past action happened before another past action.",
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: 'The Past Perfect (often called the "past of the past") describes an action that happened before another action or point in the past. It establishes clear chronological sequence.',
      keyRules: [
        "Form: Subject + had + past participle.",
        'Sequence establishing: The earlier action is in Past Perfect ("had done"). The later action is in Past Simple ("did").',
        'When / By the time: Frequently introduced by "by the time" or "when" indicating the second benchmark moment.',
        'Never use alone: Use only when needed to clarify order; if chronological sequence is already obvious (using "first", "then"), Past Simple is sufficient.'
      ],
      examples: [
        {
          english: "By the time the train finally arrived, we had waited at the cold station for two hours.",
          structureExplanation: "Arrived is later (Past Simple). Had waited is earlier (Past Perfect)."
        },
        {
          english: "She realized that she had left her flight tickets at home.",
          structureExplanation: "Realized is later (Past Simple). Left tickets is earlier (Past Perfect had left)."
        },
        {
          english: "Had he ever studied Spanish before he immigrated to Argentina?",
          structureExplanation: "Question pattern querying lifetime experience prior to a specific historical event."
        }
      ],
      quiz: [
        {
          id: "gppf-q1",
          question: 'Complete the sequence: "When we arrived at the cinema, the movie ________ already ________."',
          options: [
            "had / started",
            "did / start",
            "was / starting",
            "has / started"
          ],
          answerIndex: 0,
          explanation: 'The starting of the movie occurred BEFORE the arrival at the cinema, requesting Past Perfect: "had started".'
        },
        {
          id: "gppf-q2",
          question: 'Identify the earlier past event: "The team celebrated because they had won the championship."',
          options: [
            "The celebration",
            "Winning the championship",
            "They happened simultaneously",
            "Celebrating happened first"
          ],
          answerIndex: 1,
          explanation: '"had won" is in Past Perfect, which designates it as occurring prior to the celebration (Past Simple).'
        },
        {
          id: "gppf-q3",
          question: "Formulate the correct negative past perfect sentence:",
          options: [
            "I hadn't seen him for ages until we met last Sunday.",
            "I didn't saw him for ages until we met last Sunday.",
            "I haven't seen him for ages until we met last Sunday.",
            "I not had saw him."
          ],
          answerIndex: 0,
          explanation: `"hadn't seen" is the past perfect negative format correct for referencing past prior duration.`
        }
      ]
    }
  },
  // === PAST PERFECT CONTINUOUS TENSE ===
  {
    id: "g-tense-past-perfect-continuous",
    category: "grammar",
    level: "advanced",
    title: "Past Perfect Continuous Tense",
    description: "Describe ongoing durations or physical conditions that occurred prior to another past coordinate.",
    xpReward: 200,
    estimatedMinutes: 10,
    content: {
      explanation: "The Past Perfect Continuous describes an ongoing activity that was happening up until another point in the past, emphasizing its ongoing duration or process.",
      keyRules: [
        "Form: Subject + had + been + verb-ing.",
        "Emphasize past duration: Measures how long an activity had been in progress before a past boundary was reached.",
        "Cause and effect in past: Clear description of why a past state existed (e.g. He was tired because he had been running).",
        "Action vs State: Similar to Present Perfect Continuous, state verbs are prohibited; use Past Perfect Simple instead."
      ],
      examples: [
        {
          english: "The young mechanic was exhausted because he had been repairing car engines all afternoon.",
          structureExplanation: "Exhausted state is past simple. The engine repairing is the previous continuous cause (had been repairing)."
        },
        {
          english: "They had been driving for four hours when their vehicle suddenly ran out of gas.",
          structureExplanation: "Background ongoing duration (had been driving) is interrupted by a Past Simple event (ran out)."
        },
        {
          english: "Had she been singing at the company opera for long before she lost her voice?",
          structureExplanation: "Question pattern inquiring about past continuous duration up to a past event."
        }
      ],
      quiz: [
        {
          id: "gppfc-q1",
          question: 'Complete: "The grass was soaking wet because it ________ all night."',
          options: [
            "had been raining",
            "was raining",
            "rained",
            "has been raining"
          ],
          answerIndex: 0,
          explanation: '"The grass was wet" (Past state description). The prior overnight rain cause requires Past Perfect Continuous: "had been raining".'
        },
        {
          id: "gppfc-q2",
          question: "Identify the sentence in the Past Perfect Continuous:",
          options: [
            "She enjoyed writing letters to him.",
            "We had been hoping for a pay rise for months before the announcement.",
            "They had hoped that we would arrive.",
            "I was studying while he had slept."
          ],
          answerIndex: 1,
          explanation: '"had been hoping" fits [Subject + had + been + verb-ing] indicating prior continuous hope.'
        },
        {
          id: "gppfc-q3",
          question: 'Complete the sentence: "By 2020, I ________ coding for years without any formal certification."',
          options: [
            "had been practicing",
            "was practicing",
            "have been practicing",
            "had practiced been"
          ],
          answerIndex: 0,
          explanation: '"By 2020" sets a past boundary. Prior ongoing duration requires Past Perfect Continuous: "had been practicing".'
        }
      ]
    }
  },
  // === FUTURE SIMPLE TENSE ===
  {
    id: "g-tense-future-simple",
    category: "grammar",
    level: "beginner",
    title: "Future Simple Tense: Will vs. Be Going To",
    description: 'Learn when to use "will" for spontaneous actions and predictions vs. "be going to" for planned futures.',
    xpReward: 140,
    estimatedMinutes: 7,
    content: {
      explanation: 'English employs different structures to talk about the future depending on the level of intent. The two most common are "Will" and "Be Going To".',
      keyRules: [
        "Will rule: Subject + will + base verb. Used for instant spontaneous decisions, general predictions, offers, and promises.",
        "Be Going To rule: Subject + am/is/are + going to + base verb. Used for intentions, firm pre-made plans, and physical evidence predictions.",
        "Negative: Subject + will not (won't) / am/is/are not + going to + base verb.",
        "Interrogative: Will + Subject + base verb? / Am/Is/Are + Subject + going to + base verb?"
      ],
      examples: [
        {
          english: "The phone is ringing. I will answer it for you immediately!",
          structureExplanation: 'Spontaneous decision made at the moment of speaking, demanding the use of "will".'
        },
        {
          english: "We are going to move to our brand-new apartment in Madrid next summer.",
          structureExplanation: 'Pre-existing travel plan / intent. "Be going to" is highly natural since the plan was already made.'
        },
        {
          english: "Look at those heavy black clouds in the sky. It is going to rain.",
          structureExplanation: 'Prediction based on present physical evidence, demanding "is going to rain" rather than generic "will rain".'
        }
      ],
      quiz: [
        {
          id: "gifs-q1",
          question: 'Barista: "What coffee do you want?" Customer: "Hmm... I ________ have the cold brew, please."',
          options: [
            "will",
            "am going to",
            "going to",
            "will be have"
          ],
          answerIndex: 0,
          explanation: 'Since the decision is made spontaneously on the spot, the customer uses "will": "I will have".'
        },
        {
          id: "gifs-q2",
          question: "Which sentence correctly represents an intention backed by a pre-made plane?",
          options: [
            "I will buy a sports car tomorrow at 9 AM, I have already booked it.",
            "I am going to buy a sports car tomorrow, I have already booked it.",
            "I will buying a sports car.",
            "I going to buy a sports car."
          ],
          answerIndex: 1,
          explanation: '"I am going to buy" is the natural pattern for pre-arranged future actions and intentions.'
        },
        {
          id: "gifs-q3",
          question: 'What is the negative prediction form of "will marry"?',
          options: [
            "won't marry",
            "will to not marry",
            "not will marry",
            "goes not to marry"
          ],
          answerIndex: 0,
          explanation: `The negative of "will" is "will not", contracted to "won't".`
        }
      ]
    }
  },
  // === FUTURE CONTINUOUS TENSE ===
  {
    id: "g-tense-future-continuous",
    category: "grammar",
    level: "intermediate",
    title: "Future Continuous Tense",
    description: "Learn to describe activities that will be actively in progress at a specific time in the future.",
    xpReward: 160,
    estimatedMinutes: 8,
    content: {
      explanation: 'The Future Continuous describes an action that will be actively "in the middle of happening" at a specific coordinate of future time.',
      keyRules: [
        "Form: Subject + will + be + verb-ing.",
        "Uses: Actions in progress in the future (e.g. This time tomorrow, I will be flying).",
        "Polite inquiries: Inquiring about future plans without pressure (e.g. Will you be using the printer today?).",
        "Overlapping actions: Long future continuous actions interrupted by short present simple actions (e.g. I will be waiting when you arrive)."
      ],
      examples: [
        {
          english: "At exactly nine o'clock tomorrow morning, we will be boarding our flight to Paris.",
          structureExplanation: "At the future point of 9 AM, the continuous boarding process will be in full progress."
        },
        {
          english: "She will be studying in the library all afternoon, so do not call her.",
          structureExplanation: "Expresses a prolonged future action that spans a distinct duration."
        },
        {
          english: "I will be making coffee when you wake up.",
          structureExplanation: "Future continuous action (will be making) overlaps with a future short event expressed in Present Simple (wake up)."
        }
      ],
      quiz: [
        {
          id: "gfc-q1",
          question: 'Complete: "This time next Saturday, she ________ on a tropical beach in Thailand."',
          options: [
            "will be relaxing",
            "will relaxes",
            "is relaxing",
            "will relax been"
          ],
          answerIndex: 0,
          explanation: '"This time next Saturday" is a specific coordinate in the future, demanding Future Continuous: "will be relaxing".'
        },
        {
          id: "gfc-q2",
          question: "Choose the correct overlapping future clause:",
          options: [
            "I will be sleeping when you will get home.",
            "I will be sleeping when you get home.",
            "I sleep when you are getting home.",
            "I will sleep when you will be getting home."
          ],
          answerIndex: 1,
          explanation: 'When combining a long future action with a short one, use Present Simple ("you get") for the short indicator and Future Continuous ("will be sleeping") for the long background.'
        },
        {
          id: "gfc-q3",
          question: 'Correct the question format: "________ you ________ utilizing the corporate lounge tonight?"',
          options: [
            "Will / be",
            "Do / be",
            "Are / going to",
            "Will / been"
          ],
          answerIndex: 0,
          explanation: '"Will you be utilizing..." is the correct future continuous question schema.'
        }
      ]
    }
  },
  // === FUTURE PERFECT TENSE ===
  {
    id: "g-tense-future-perfect",
    category: "grammar",
    level: "advanced",
    title: "Future Perfect Simple Tense",
    description: "Learn how to describe accomplishments that will be fully completed prior to a future deadline.",
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: "The Future Perfect looks back from a point in the future. It states that an action will be completed before a certain time or deadline in the future.",
      keyRules: [
        "Form: Subject + will + have + past participle.",
        `Deadline indicators: Almost always introduced by "by", "by the time", "by tomorrow", or "in ten years' time".`,
        "Sequence: Action complete first (Future Perfect) before the future benchmark (expressed in Present Simple).",
        "State verbs: Standard participle forms can describe states up to the future coordinate."
      ],
      examples: [
        {
          english: "By the time you finish your university exams, I will have already graduated.",
          structureExplanation: "My graduation will be fully completed BEFORE your future exam finishing."
        },
        {
          english: "In December, they will have been married for exactly thirty years.",
          structureExplanation: "Expresses a duration that will accumulate and be fully completed at a specific future benchmark."
        },
        {
          english: "Will you have written the reports by next Friday afternoon?",
          structureExplanation: "Interrogative form checking if a task is fully accomplished before a deadline."
        }
      ],
      quiz: [
        {
          id: "gfpf-q1",
          question: 'Complete spelling: "By midnight, the engineering crew ________ repairing the tracks."',
          options: [
            "will have finished",
            "will finishes",
            "will be finishing",
            "shall be finish"
          ],
          answerIndex: 0,
          explanation: 'The "by midnight" deadline requires Future Perfect "will have finished" indicating full completion.'
        },
        {
          id: "gfpf-q2",
          question: 'Identify the correct sequence: "By 2030, scientists ________ a vaccine for the disease."',
          options: [
            "will have discovered",
            "discover",
            "are discovering",
            "will have been discover"
          ],
          answerIndex: 0,
          explanation: '"By 2030" indicates a future deadline, requiring the Future Perfect "will have discovered".'
        },
        {
          id: "gfpf-q3",
          question: "What is the correct negative form of the Future Perfect?",
          options: [
            "They won't have arrived by then.",
            "They won't arrived by then.",
            "They will have not arrived by then.",
            "They wouldn't have arrived by then."
          ],
          answerIndex: 0,
          explanation: `The negative is formed by putting "not" after "will" ("will not have" = "won't have").`
        }
      ]
    }
  },
  // === FUTURE PERFECT CONTINUOUS TENSE ===
  {
    id: "g-tense-future-perfect-continuous",
    category: "grammar",
    level: "advanced",
    title: "Future Perfect Continuous Tense",
    description: "Learn to measure the ongoing duration of an action up to a specific timeline in the future.",
    xpReward: 210,
    estimatedMinutes: 10,
    content: {
      explanation: 'The Future Perfect Continuous is used to project ourselves forward in time and look back at the ongoing duration of an action. It measures "how long" an activity will have been running at a future coordinate.',
      keyRules: [
        "Form: Subject + will + have + been + verb-ing.",
        "Uses: Expresses the duration of a future action up to a specific benchmark.",
        'Deadline indicators: Frequently introduced by "by next month", "by the time", with a duration stated using "for".',
        "Result focus: Expresses future continuous cause and effect in the future (e.g. By noon I will be tired because I will have been working)."
      ],
      examples: [
        {
          english: "By ten o'clock tonight, I will have been writing this software code for fourteen continuous hours.",
          structureExplanation: "At the 10 PM future point, 14 hours of continuous coding will have accumulated."
        },
        {
          english: "By next spring, she will have been living in Tokyo for exactly five years.",
          structureExplanation: "Looks back from next spring to measure the duration of her continuous residence in Tokyo."
        },
        {
          english: "Will they have been traveling for over a week by the time we finally meet them?",
          structureExplanation: "Inquires about the total accumulated travel duration reached when our meet-up takes place."
        }
      ],
      quiz: [
        {
          id: "gfpfc-q1",
          question: 'Complete the sentence: "By the time he retires, he ________ at this bank for forty years."',
          options: [
            "will have been working",
            "will be working",
            "will have worked",
            "has been working"
          ],
          answerIndex: 0,
          explanation: 'The deadline ("by the time he retires") paired with a duration ("for forty years") requires the Future Perfect Continuous "will have been working".'
        },
        {
          id: "gfpfc-q2",
          question: "Select the sentence that uses the correct Future Perfect Continuous structure:",
          options: [
            "By next month, I will have been studying English for a year.",
            "By next month, I will be has been studying English.",
            "By next month, I have been studying English.",
            "By next month, I will had been studying English for a year."
          ],
          answerIndex: 0,
          explanation: '"will have been studying" is [will + have + been + verb-ing] which is the correct formula.'
        },
        {
          id: "gfpfc-q3",
          question: "In December, we ________ in Seattle for six years. (Continuous focus)",
          options: [
            "will have been living",
            "will have lived",
            "shall been living",
            "are living"
          ],
          answerIndex: 0,
          explanation: '"will have been living" is the correct choice to emphasize the ongoing nature of our living duration up to that future December date.'
        }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇹🇭  THAI LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "thai-vocab-greetings",
    category: "vocabulary",
    level: "beginner",
    targetLang: "thai",
    title: "Thai Essentials: Greetings & Polite Phrases",
    description: "Learn the most important Thai greetings, polite particles, and everyday expressions used in Thailand.",
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: "Thai is a tonal language spoken by over 60 million people. Politeness is deeply embedded in Thai culture \u2014 every sentence ends with \u0E04\u0E23\u0E31\u0E1A (khrap) for men or \u0E04\u0E48\u0E30 (kha) for women. Mastering greetings will open doors and hearts throughout Thailand.",
      words: [
        { word: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35 (Sawatdee)", partOfSpeech: "greeting", definition: "Hello / Goodbye \u2014 the universal Thai greeting used any time of day.", englishExample: "Sawatdee kha! \u2014 Hello! (said by a woman)" },
        { word: "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob Khun)", partOfSpeech: "phrase", definition: "Thank you \u2014 used to express gratitude in any situation.", englishExample: "Khob khun khrap \u2014 Thank you (said by a man)." },
        { word: "\u0E43\u0E0A\u0E48 / \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48 (Chai / Mai Chai)", partOfSpeech: "adverb", definition: "Yes / No \u2014 the two most fundamental affirmative and negative words.", englishExample: "Chai! Phom chob aahan Thai \u2014 Yes! I like Thai food." },
        { word: "\u0E02\u0E2D\u0E42\u0E17\u0E29 (Kho Thot)", partOfSpeech: "phrase", definition: "Sorry / Excuse me \u2014 used to apologize or get someone's attention politely.", englishExample: "Kho thot khrap, hong nam yoo thi nai? \u2014 Excuse me, where is the bathroom?" },
        { word: "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23 (Mai Pen Rai)", partOfSpeech: "phrase", definition: "Never mind / It's okay \u2014 the iconic Thai expression of relaxed acceptance.", englishExample: "Mai pen rai kha \u2014 No worries at all!" },
        { word: "\u0E0A\u0E37\u0E48\u0E2D (Chue)", partOfSpeech: "noun", definition: "Name \u2014 used when introducing yourself or asking someone's name.", englishExample: "Phom chue Marco \u2014 My name is Marco." },
        { word: "\u0E22\u0E34\u0E19\u0E14\u0E35\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A (Yindee Ton Rap)", partOfSpeech: "phrase", definition: "Welcome \u2014 a formal phrase used to welcome guests or visitors.", englishExample: "Yindee ton rap su prathet Thai \u2014 Welcome to Thailand!" },
        { word: "\u0E2D\u0E23\u0E48\u0E2D\u0E22 (Aroy)", partOfSpeech: "adjective", definition: "Delicious \u2014 the word you will use most at every Thai meal.", englishExample: "Aroy mak! \u2014 Very delicious!" }
      ],
      quiz: [
        { id: "th-gr-q1", question: 'What does "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35 (Sawatdee)" mean?', options: ["Thank you", "Goodbye only", "Hello / Goodbye (universal greeting)", "Excuse me"], answerIndex: 2, explanation: "Sawatdee is used at any time of day for both hello and goodbye." },
        { id: "th-gr-q2", question: "Which polite particle does a woman add at the end of sentences in Thai?", options: ["\u0E04\u0E23\u0E31\u0E1A (Khrap)", "\u0E04\u0E48\u0E30 (Kha)", "\u0E19\u0E30 (Na)", "\u0E14\u0E49\u0E27\u0E22 (Duay)"], answerIndex: 1, explanation: "Women add \u0E04\u0E48\u0E30 (kha) to show politeness; men use \u0E04\u0E23\u0E31\u0E1A (khrap)." },
        { id: "th-gr-q3", question: 'How do you say "Thank you" in Thai?', options: ["\u0E02\u0E2D\u0E42\u0E17\u0E29 (Kho Thot)", "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23 (Mai Pen Rai)", "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob Khun)", "\u0E22\u0E34\u0E19\u0E14\u0E35 (Yindee)"], answerIndex: 2, explanation: "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob Khun) is the standard way to say Thank you." },
        { id: "th-gr-q4", question: 'What is the famous Thai phrase meaning "No worries / Never mind"?', options: ["Sawatdee", "Aroy Mak", "Mai Pen Rai", "Chai Kha"], answerIndex: 2, explanation: `\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23 (Mai Pen Rai) is Thailand's culturally iconic "no worries" expression.` },
        { id: "th-gr-q5", question: 'If you want to say "Excuse me, sorry" in Thai, you say:', options: ["Khob Khun", "Kho Thot", "Yindee Ton Rap", "Chai"], answerIndex: 1, explanation: '\u0E02\u0E2D\u0E42\u0E17\u0E29 (Kho Thot) means both "sorry" and "excuse me" in Thai.' },
        { id: "th-gr-q6", question: 'What does "\u0E2D\u0E23\u0E48\u0E2D\u0E22 (Aroy)" mean?', options: ["Beautiful", "Delicious", "Expensive", "Friendly"], answerIndex: 1, explanation: "Aroy means delicious \u2014 one of the most used words when eating Thai food!" },
        { id: "th-gr-q7", question: 'Complete: "My name is Ana" in Thai structure uses which word?', options: ["\u0E0A\u0E37\u0E48\u0E2D (Chue)", "\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48 (Mai Chai)", "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob Khun)", "\u0E2D\u0E23\u0E48\u0E2D\u0E22 (Aroy)"], answerIndex: 0, explanation: '\u0E0A\u0E37\u0E48\u0E2D (Chue) means "name". The structure is: [Name] + chue + [your name].' },
        { id: "th-gr-q8", question: 'How do you say "Yes" in Thai?', options: ["Mai", "Chai", "Kha", "Aroy"], answerIndex: 1, explanation: '\u0E43\u0E0A\u0E48 (Chai) means Yes. \u0E44\u0E21\u0E48 (Mai) is a negation particle meaning "not".' },
        { id: "th-gr-q9", question: '"\u0E22\u0E34\u0E19\u0E14\u0E35\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A (Yindee Ton Rap)" means:', options: ["See you later", "Congratulations", "Welcome", "Good morning"], answerIndex: 2, explanation: "Yindee Ton Rap is the formal Thai welcome greeting." },
        { id: "th-gr-q10", question: 'A Thai man saying "Thank you" politely would say:', options: ["Khob Khun Kha", "Khob Khun Khrap", "Sawatdee Kha", "Aroy Khrap"], answerIndex: 1, explanation: "Men add \u0E04\u0E23\u0E31\u0E1A (Khrap) as their polite particle, so: Khob Khun Khrap." }
      ]
    }
  },
  {
    id: "thai-conv-market",
    category: "conversation",
    level: "beginner",
    targetLang: "thai",
    title: "Thai Conversations: At the Market (\u0E15\u0E25\u0E32\u0E14)",
    description: "Practice real Thai market dialogues \u2014 bargaining, asking prices, ordering food, and navigating a Thai street market.",
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      context: "You are at a vibrant Thai street market (\u0E15\u0E25\u0E32\u0E14 \u2014 ta-lat). A friendly vendor is selling fresh tropical fruits. You want to buy some mangoes and ask about the prices. This conversation teaches practical market Thai.",
      speakerNames: ["Vendor (\u0E41\u0E21\u0E48\u0E04\u0E49\u0E32)", "Tourist (\u0E19\u0E31\u0E01\u0E17\u0E48\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27)"],
      transcript: [
        { speaker: "Vendor (\u0E41\u0E21\u0E48\u0E04\u0E49\u0E32)", text: "Sawatdee kha! Maa duu khong mai kha? (Hello! Would you like to look at our goods?)" },
        { speaker: "Tourist (\u0E19\u0E31\u0E01\u0E17\u0E48\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27)", text: "Sawatdee khrap! Ma-muang raka thao rai khrap? (Hello! How much are the mangoes?)" },
        { speaker: "Vendor (\u0E41\u0E21\u0E48\u0E04\u0E49\u0E32)", text: "Ma-muang song roi baht per kilo kha. Wan mak loei! (Mangoes are 200 Baht per kilo. Very sweet!)" },
        { speaker: "Tourist (\u0E19\u0E31\u0E01\u0E17\u0E48\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27)", text: "Phaeng pai nit. Lot raka dai mai khrap? (That's a bit expensive. Can you reduce the price?)" },
        { speaker: "Vendor (\u0E41\u0E21\u0E48\u0E04\u0E49\u0E32)", text: "Dai kha! Song kilo song roi ha sip baht kha. Ok mai? (Okay! Two kilos for 250 Baht. Deal?)" },
        { speaker: "Tourist (\u0E19\u0E31\u0E01\u0E17\u0E48\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27)", text: "Ok khrap! Khob khun mak khrap. (Deal! Thank you very much.)" },
        { speaker: "Vendor (\u0E41\u0E21\u0E48\u0E04\u0E49\u0E32)", text: "Yindee hai borikan kha! Chern maa ik na kha. (Happy to serve! Please come again.)" },
        { speaker: "Tourist (\u0E19\u0E31\u0E01\u0E17\u0E48\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27)", text: "Aroy mak khrap! Ma-muang thi ni aroy thi sut. (Delicious! These mangoes are the best.)" }
      ],
      quiz: [
        { id: "th-mkt-q1", question: 'What does "\u0E15\u0E25\u0E32\u0E14 (Ta-Lat)" mean?', options: ["Restaurant", "Market", "Hotel", "Airport"], answerIndex: 1, explanation: "\u0E15\u0E25\u0E32\u0E14 (Ta-Lat) is the Thai word for market." },
        { id: "th-mkt-q2", question: 'How do you ask "How much is it?" in Thai?', options: ["Aroy thao rai?", "Raka thao rai?", "Mee mai?", "Khob khun thao rai?"], answerIndex: 1, explanation: '\u0E23\u0E32\u0E01\u0E32\u0E40\u0E17\u0E48\u0E32\u0E44\u0E2B\u0E23\u0E48? (Raka Thao Rai?) means "How much does it cost?"' },
        { id: "th-mkt-q3", question: 'What phrase means "Can you reduce the price?"', options: ["Maa duu khong mai?", "Lot raka dai mai?", "Chern maa ik na?", "Wan mak loei"], answerIndex: 1, explanation: "\u0E25\u0E14\u0E23\u0E32\u0E04\u0E32\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21? (Lot Raka Dai Mai?) is how you bargain for a lower price." },
        { id: "th-mkt-q4", question: 'What is "\u0E21\u0E30\u0E21\u0E48\u0E27\u0E07 (Ma-Muang)" in English?', options: ["Banana", "Mango", "Papaya", "Pineapple"], answerIndex: 1, explanation: "\u0E21\u0E30\u0E21\u0E48\u0E27\u0E07 (Ma-Muang) means mango in Thai." },
        { id: "th-mkt-q5", question: 'The vendor says "Wan mak loei!" \u2014 what does "wan" mean here?', options: ["Expensive", "Fresh", "Sweet", "Small"], answerIndex: 2, explanation: "\u0E2B\u0E27\u0E32\u0E19 (Wan) means sweet \u2014 a common descriptor for tropical fruits in Thailand." },
        { id: "th-mkt-q6", question: 'How do you say "Deal!" / "Okay!" to accept an offer in Thai market?', options: ["Mai Chai", "Phaeng", "Ok / Dai", "Thao Rai"], answerIndex: 2, explanation: '"Ok" or "Dai" (\u0E44\u0E14\u0E49) both mean okay/deal in Thai bargaining contexts.' },
        { id: "th-mkt-q7", question: 'What does "Chern Maa Ik Na" mean?', options: ["This is expensive", "Please come again", "What is your name?", "Thank you very much"], answerIndex: 1, explanation: '"Chern Maa Ik Na" (\u0E40\u0E0A\u0E34\u0E0D\u0E21\u0E32\u0E2D\u0E35\u0E01\u0E19\u0E30) means "Please come again" \u2014 a common goodbye from Thai vendors.' },
        { id: "th-mkt-q8", question: 'Which word means "expensive" in Thai?', options: ["Aroy", "Phaeng", "Wan", "Saduak"], answerIndex: 1, explanation: "\u0E41\u0E1E\u0E07 (Phaeng) means expensive. \u0E16\u0E39\u0E01 (Thuk) is the opposite \u2014 cheap." },
        { id: "th-mkt-q9", question: "What is the Thai currency used when pricing items at the market?", options: ["Ringgit", "Dong", "Baht", "Peso"], answerIndex: 2, explanation: "Thailand's currency is the Baht (\u0E1A\u0E32\u0E17 \u2014 Baht)." },
        { id: "th-mkt-q10", question: '"Aroy Mak" means:', options: ["Very cheap", "Very delicious", "Very beautiful", "Very polite"], answerIndex: 1, explanation: '\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E21\u0E32\u0E01 (Aroy Mak) = Very delicious. \u0E21\u0E32\u0E01 (Mak) is the Thai intensifier meaning "very".' }
      ]
    }
  },
  {
    id: "thai-vocab-daily",
    category: "vocabulary",
    level: "beginner",
    targetLang: "thai",
    title: "Thai Vocabulary: Numbers, Colors & Daily Life",
    description: "Master Thai numbers 1\u201310, basic colors, and the most useful daily life words to navigate Thailand confidently.",
    xpReward: 180,
    estimatedMinutes: 10,
    content: {
      introduction: "Numbers and colors are foundational in any language. In Thai, numbers follow a logical system, and colors are often named after natural things. These words appear constantly in markets, menus, transportation, and everyday conversations.",
      words: [
        { word: "\u0E2B\u0E19\u0E36\u0E48\u0E07 / \u0E2A\u0E2D\u0E07 / \u0E2A\u0E32\u0E21 (Nueng / Song / Sam)", partOfSpeech: "number", definition: "One / Two / Three \u2014 the first three Thai numbers.", englishExample: "Nueng, Song, Sam \u2014 counting items at a market stall." },
        { word: "\u0E2A\u0E35\u0E48 / \u0E2B\u0E49\u0E32 / \u0E2B\u0E01 (Si / Ha / Hok)", partOfSpeech: "number", definition: "Four / Five / Six \u2014 mid-range numbers used in prices and addresses.", englishExample: "Ha baht \u2014 Five Baht." },
        { word: "\u0E40\u0E08\u0E47\u0E14 / \u0E41\u0E1B\u0E14 / \u0E40\u0E01\u0E49\u0E32 / \u0E2A\u0E34\u0E1A (Jet / Paet / Kao / Sip)", partOfSpeech: "number", definition: "Seven / Eight / Nine / Ten \u2014 completing the first decade of Thai numbers.", englishExample: "Sip baht \u2014 Ten Baht." },
        { word: "\u0E41\u0E14\u0E07 / \u0E19\u0E49\u0E33\u0E40\u0E07\u0E34\u0E19 / \u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E07 (Daeng / Nam Ngoen / Lueang)", partOfSpeech: "adjective", definition: "Red / Blue / Yellow \u2014 three primary Thai color words.", englishExample: "Rot daeng \u2014 red car; Nam ngoen \u2014 blue (lit. water-silver)." },
        { word: "\u0E02\u0E32\u0E27 / \u0E14\u0E33 / \u0E40\u0E02\u0E35\u0E22\u0E27 (Khao / Dam / Khiao)", partOfSpeech: "adjective", definition: "White / Black / Green \u2014 three more essential Thai colors.", englishExample: "Suea khao \u2014 white shirt; Phak khiao \u2014 green vegetable." },
        { word: "\u0E19\u0E49\u0E33 / \u0E02\u0E49\u0E32\u0E27 / \u0E44\u0E01\u0E48 (Nam / Khao / Kai)", partOfSpeech: "noun", definition: "Water / Rice / Chicken \u2014 the three most important food words in Thailand.", englishExample: "Khao Kai \u2014 rice with chicken, a Thai staple dish." },
        { word: "\u0E2B\u0E49\u0E2D\u0E07\u0E19\u0E49\u0E33 (Hong Nam)", partOfSpeech: "noun", definition: 'Bathroom / Toilet \u2014 literally "water room", essential to know when traveling.', englishExample: "Hong nam yoo thi nai? \u2014 Where is the bathroom?" },
        { word: "\u0E23\u0E16\u0E44\u0E1F\u0E1F\u0E49\u0E32 (Rot Fai Faa)", partOfSpeech: "noun", definition: "BTS Skytrain / Electric Train \u2014 Bangkok's iconic elevated rail system.", englishExample: "Pai Rot Fai Faa \u2014 Let's take the Skytrain." }
      ],
      quiz: [
        { id: "th-dl-q1", question: 'What is the Thai word for "Five"?', options: ["Si", "Ha", "Hok", "Nueng"], answerIndex: 1, explanation: "\u0E2B\u0E49\u0E32 (Ha) = Five. Si=4, Hok=6, Nueng=1." },
        { id: "th-dl-q2", question: 'What does "\u0E2A\u0E34\u0E1A (Sip)" mean?', options: ["Seven", "Nine", "Ten", "Eight"], answerIndex: 2, explanation: "\u0E2A\u0E34\u0E1A (Sip) = Ten in Thai." },
        { id: "th-dl-q3", question: 'Which Thai color means "Red"?', options: ["Khiao", "Lueang", "Daeng", "Khao"], answerIndex: 2, explanation: "\u0E41\u0E14\u0E07 (Daeng) = Red. Khiao=Green, Lueang=Yellow, Khao=White." },
        { id: "th-dl-q4", question: 'What do the three words "Nam / Khao / Kai" mean in English?', options: ["Water / Rice / Chicken", "Blue / White / Yellow", "One / Two / Three", "Hot / Cold / Fresh"], answerIndex: 0, explanation: "\u0E19\u0E49\u0E33=Water, \u0E02\u0E49\u0E32\u0E27=Rice, \u0E44\u0E01\u0E48=Kai \u2014 the foundations of Thai cuisine vocabulary." },
        { id: "th-dl-q5", question: '"\u0E2B\u0E49\u0E2D\u0E07\u0E19\u0E49\u0E33 (Hong Nam)" literally means and refers to:', options: ["Water room \u2014 Bathroom", "River place \u2014 Lake", "Blue room \u2014 Kitchen", "Food room \u2014 Cafeteria"], answerIndex: 0, explanation: "Hong=Room, Nam=Water. Hong Nam = Water Room = Bathroom/Toilet." },
        { id: "th-dl-q6", question: 'What color is "\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E07 (Lueang)"?', options: ["Green", "Blue", "Yellow", "Orange"], answerIndex: 2, explanation: "\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E07 (Lueang) = Yellow in Thai." },
        { id: "th-dl-q7", question: 'What is "\u0E23\u0E16\u0E44\u0E1F\u0E1F\u0E49\u0E32 (Rot Fai Faa)"?', options: ["A Thai tuk-tuk", "A river boat", "Bangkok's Skytrain/BTS", "A motorbike taxi"], answerIndex: 2, explanation: 'Rot Fai Faa literally means "electric train" \u2014 referring to the Bangkok BTS Skytrain.' },
        { id: "th-dl-q8", question: 'Count: "\u0E40\u0E08\u0E47\u0E14 (Jet)" equals which number?', options: ["6", "7", "8", "9"], answerIndex: 1, explanation: "\u0E40\u0E08\u0E47\u0E14 (Jet) = Seven in Thai." },
        { id: "th-dl-q9", question: '"\u0E14\u0E33 (Dam)" is which color?', options: ["White", "Brown", "Black", "Grey"], answerIndex: 2, explanation: "\u0E14\u0E33 (Dam) = Black in Thai. \u0E02\u0E32\u0E27 (Khao) = White." },
        { id: "th-dl-q10", question: 'What is the Thai phrase for "Where is the bathroom?"', options: ["Aroy yoo thi nai?", "Hong nam yoo thi nai?", "Raka thao rai?", "Nam mee mai?"], answerIndex: 1, explanation: '"Hong Nam Yoo Thi Nai?" (\u0E2B\u0E49\u0E2D\u0E07\u0E19\u0E49\u0E33\u0E2D\u0E22\u0E39\u0E48\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E19?) = Where is the bathroom?' }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇰🇷  KOREAN LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "korean-vocab-hangeul",
    category: "vocabulary",
    level: "beginner",
    targetLang: "korean",
    title: "Korean Essentials: Hangeul Basics & Greetings",
    description: "Discover the elegant Hangeul alphabet, learn essential Korean greetings, and pick up key polite expressions.",
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: "Korean (\uD55C\uAD6D\uC5B4) is spoken by over 80 million people. Its alphabet, Hangeul (\uD55C\uAE00), was scientifically designed in 1443 and is one of the most logical writing systems in the world. Korean has distinct speech levels \u2014 formal speech is used with elders and strangers, while informal is used with close friends.",
      words: [
        { word: "\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo)", partOfSpeech: "greeting", definition: "Hello \u2014 formal polite greeting used with strangers, elders, and in professional settings.", englishExample: "Annyeonghaseyo! Mannaseo bangapseumnida. \u2014 Hello! Nice to meet you." },
        { word: "\uAC10\uC0AC\uD569\uB2C8\uB2E4 (Gamsahamnida)", partOfSpeech: "phrase", definition: "Thank you \u2014 the formal way to express gratitude in Korean.", englishExample: "Gamsahamnida! Jeongmal gamsahamnida \u2014 Thank you! Thank you very much." },
        { word: "\uC8C4\uC1A1\uD569\uB2C8\uB2E4 (Joesonghamnida)", partOfSpeech: "phrase", definition: 'I am sorry \u2014 formal sincere apology, stronger than "excuse me".', englishExample: "Joesonghamnida, chaja-gessseumnida \u2014 I am sorry, I will find it." },
        { word: "\uC774\uB984 (Ireum)", partOfSpeech: "noun", definition: "Name \u2014 the word for a person's name, used in introductions.", englishExample: "Ireum-i mwoeyo? \u2014 What is your name?" },
        { word: "\uB124 / \uC544\uB2C8\uC694 (Ne / Aniyo)", partOfSpeech: "adverb", definition: "Yes / No \u2014 the formal affirmative and negative responses in Korean.", englishExample: "Ne, algessseumnida \u2014 Yes, I understand." },
        { word: "\uAD1C\uCC2E\uC544\uC694 (Gwaenchanayo)", partOfSpeech: "phrase", definition: "It's okay / Are you okay? \u2014 used to check well-being or to reassure someone.", englishExample: "Gwaenchanayo? \u2014 Are you okay? / Gwaenchanayo! \u2014 It's fine!" },
        { word: "\uBC18\uAC11\uC2B5\uB2C8\uB2E4 (Bangapseumnida)", partOfSpeech: "phrase", definition: "Nice to meet you \u2014 the formal expression for first-time introductions.", englishExample: "Annyeonghaseyo, bangapseumnida \u2014 Hello, nice to meet you." },
        { word: "\uB9DB\uC788\uC5B4\uC694 (Masisseoyo)", partOfSpeech: "adjective", definition: "Delicious / It's tasty \u2014 the word you will say constantly in Korea.", englishExample: "Jinjja masisseoyo! \u2014 It's really delicious!" }
      ],
      quiz: [
        { id: "ko-hg-q1", question: 'What is "\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo)"?', options: ["Thank you", "Formal hello greeting", "Goodbye", "I am sorry"], answerIndex: 1, explanation: 'Annyeonghaseyo is the standard formal "Hello" in Korean.' },
        { id: "ko-hg-q2", question: "Hangeul (\uD55C\uAE00) was created in which year?", options: ["1200", "1443", "1592", "1900"], answerIndex: 1, explanation: "King Sejong the Great created Hangeul in 1443 to improve literacy in Korea." },
        { id: "ko-hg-q3", question: 'How do you formally say "Thank you" in Korean?', options: ["Gwaenchanayo", "Aniyo", "Gamsahamnida", "Joesonghamnida"], answerIndex: 2, explanation: '\uAC10\uC0AC\uD569\uB2C8\uB2E4 (Gamsahamnida) is the formal "Thank you".' },
        { id: "ko-hg-q4", question: 'What does "\uB124 (Ne)" mean?', options: ["No", "Maybe", "Yes", "Hello"], answerIndex: 2, explanation: "\uB124 (Ne) means Yes in formal Korean. \uC544\uB2C8\uC694 (Aniyo) = No." },
        { id: "ko-hg-q5", question: '"\uC8C4\uC1A1\uD569\uB2C8\uB2E4 (Joesonghamnida)" means:', options: ["You're welcome", "Nice to meet you", "Excuse me informally", "I am sincerely sorry"], answerIndex: 3, explanation: "Joesonghamnida is a formal, sincere apology in Korean." },
        { id: "ko-hg-q6", question: 'What does "\uC774\uB984\uC774 \uBB50\uC608\uC694? (Ireum-i mwoeyo?)" mean?', options: ["Where are you from?", "What is your name?", "How old are you?", "What do you like?"], answerIndex: 1, explanation: '"Ireum-i Mwoeyo?" = What is your name? \u2014 \uC774\uB984 means name.' },
        { id: "ko-hg-q7", question: 'Which word means "Delicious" in Korean?', options: ["Gwaenchanayo", "Masisseoyo", "Bangapseumnida", "Annyeong"], answerIndex: 1, explanation: "\uB9DB\uC788\uC5B4\uC694 (Masisseoyo) = Delicious / It's tasty in Korean." },
        { id: "ko-hg-q8", question: '"\uAD1C\uCC2E\uC544\uC694 (Gwaenchanayo)" can mean:', options: ["I'm sorry / Forgive me", "It's okay / Are you alright?", "Welcome / Please come in", "Goodbye / See you"], answerIndex: 1, explanation: "Gwaenchanayo is versatile \u2014 it can be a question (Are you okay?) or a statement (It's okay)." },
        { id: "ko-hg-q9", question: '"\uBC18\uAC11\uC2B5\uB2C8\uB2E4 (Bangapseumnida)" is used when:', options: ["Saying goodbye", "Meeting someone for the first time", "Ordering food", "Asking for directions"], answerIndex: 1, explanation: "Bangapseumnida = Nice to meet you \u2014 used during first-time formal introductions." },
        { id: "ko-hg-q10", question: "Korean speech has different levels. Formal speech is used with:", options: ["Only close friends", "Elders, strangers, and professionals", "Children only", "Only in written Korean"], answerIndex: 1, explanation: "Formal (\uC874\uB313\uB9D0 \u2014 Jondaemal) is used with elders, strangers, and in professional/public settings." }
      ]
    }
  },
  {
    id: "korean-conv-food",
    category: "conversation",
    level: "beginner",
    targetLang: "korean",
    title: "Korean Conversations: Ordering Food (\uC74C\uC2DD \uC8FC\uBB38)",
    description: "Practice real Korean conversations at a Korean restaurant \u2014 ordering dishes, asking about spice levels, and paying the bill.",
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      context: "You are at a popular Korean BBQ restaurant (\uACE0\uAE43\uC9D1 \u2014 Gogitjip) in Seoul. A friendly server comes to take your order. You want to order samgyeopsal (grilled pork belly) and kimchi jjigae (kimchi stew), and ask about the spice level. This dialogue practices essential food-ordering Korean.",
      speakerNames: ["Server (\uC11C\uBC84)", "Customer (\uC190\uB2D8)"],
      transcript: [
        { speaker: "Server (\uC11C\uBC84)", text: "Annyeonghaseyo! Mwol deurigeulkkayo? (Hello! What would you like to have?)" },
        { speaker: "Customer (\uC190\uB2D8)", text: "Samgyeopsal il inbun-gwa kimchi jjigae hana juseyo. (One serving of pork belly and one kimchi stew, please.)" },
        { speaker: "Server (\uC11C\uBC84)", text: "Ne! Maepge hae deurilkkayo? (Yes! Would you like it spicy?)" },
        { speaker: "Customer (\uC190\uB2D8)", text: "Jogeum maepge haejuseyo. Gwaenchanayo? (Please make it a little spicy. Is that okay?)" },
        { speaker: "Server (\uC11C\uBC84)", text: "Ne, mul-ron-ijo! Eumryo-neun mwol deurigeulkkayo? (Of course! What would you like to drink?)" },
        { speaker: "Customer (\uC190\uB2D8)", text: "Mul han jan-gwa maekju han byeong juseyo. (One glass of water and one bottle of beer, please.)" },
        { speaker: "Server (\uC11C\uBC84)", text: "Al-gessseumnida! Jamkkan gidaryeo juseyo. (Understood! Please wait a moment.)" },
        { speaker: "Customer (\uC190\uB2D8)", text: "Gamsahamnida! Gyesan-seo juseyo. Eolmaeyo? (Thank you! The bill please. How much is it?)" }
      ],
      quiz: [
        { id: "ko-fd-q1", question: 'What does "\uC74C\uC2DD \uC8FC\uBB38 (Eumsik Jumun)" mean?', options: ["Restaurant menu", "Food ordering", "Cooking recipe", "Food delivery"], answerIndex: 1, explanation: "\uC74C\uC2DD (Eumsik) = Food, \uC8FC\uBB38 (Jumun) = Order. Together: Food ordering." },
        { id: "ko-fd-q2", question: 'How do you say "Please give me one serving" in Korean?', options: ["Juseyo", "Il Inbun Juseyo", "Mwol Deurigeulkkayo", "Jamkkan Gidaryeo Juseyo"], answerIndex: 1, explanation: '"Il Inbun Juseyo" (\uC77C \uC778\uBD84 \uC8FC\uC138\uC694) = One serving please. Juseyo alone means "please give me."' },
        { id: "ko-fd-q3", question: 'What is "\uC0BC\uACB9\uC0B4 (Samgyeopsal)"?', options: ["Kimchi soup", "Grilled pork belly", "Bibimbap rice bowl", "Spicy noodles"], answerIndex: 1, explanation: "Samgyeopsal (\uC0BC\uACB9\uC0B4) is one of Korea's most beloved dishes \u2014 grilled pork belly." },
        { id: "ko-fd-q4", question: '"\uB9F5\uAC8C (Maepge)" means:', options: ["Sweet", "Salty", "Spicy", "Sour"], answerIndex: 2, explanation: "\uB9F5\uAC8C (Maepge) = Spicy. \uC870\uAE08 \uB9F5\uAC8C (Jogeum Maepge) = A little spicy." },
        { id: "ko-fd-q5", question: 'How do you say "The bill please" in Korean?', options: ["Eumryo Juseyo", "Masisseoyo", "Gyesan-seo Juseyo", "Jamkkan Gidaryeo"], answerIndex: 2, explanation: "\uACC4\uC0B0\uC11C \uC8FC\uC138\uC694 (Gyesan-seo Juseyo) = Please give me the bill." },
        { id: "ko-fd-q6", question: 'What does "\uC7A0\uAE50 \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694 (Jamkkan Gidaryeo Juseyo)" mean?', options: ["Please order now", "Please wait a moment", "Please sit down", "Please come again"], answerIndex: 1, explanation: '"Jamkkan Gidaryeo Juseyo" = Please wait a moment \u2014 used by servers when processing an order.' },
        { id: "ko-fd-q7", question: '"\uC5BC\uB9C8\uC608\uC694? (Eolmaeyo?)" means:', options: ["Is it spicy?", "What is this?", "How much is it?", "Is it delicious?"], answerIndex: 2, explanation: "\uC5BC\uB9C8\uC608\uC694? (Eolmaeyo?) = How much is it? \u2014 essential for shopping and dining in Korea." },
        { id: "ko-fd-q8", question: "Which drink did the customer order?", options: ["Soju and juice", "Water and beer", "Tea and coffee", "Milk and water"], answerIndex: 1, explanation: 'The customer ordered "Mul han jan" (water) and "Maekju han byeong" (one bottle of beer).' },
        { id: "ko-fd-q9", question: '"\uAE40\uCE58\uCC0C\uAC1C (Kimchi Jjigae)" is:', options: ["A Korean BBQ style", "A kimchi stew dish", "A cold noodle dish", "A Korean dessert"], answerIndex: 1, explanation: "Kimchi Jjigae (\uAE40\uCE58\uCC0C\uAC1C) is a popular Korean kimchi stew, one of Korea's most comforting dishes." },
        { id: "ko-fd-q10", question: "To ask for something in Korean restaurants, you end requests with:", options: ["Gamsahamnida", "Juseyo", "Annyeong", "Gwaenchanayo"], answerIndex: 1, explanation: "\uC8FC\uC138\uC694 (Juseyo) = Please give me / Please do. It's attached after the item to make a polite request." }
      ]
    }
  },
  {
    id: "korean-vocab-culture",
    category: "vocabulary",
    level: "intermediate",
    targetLang: "korean",
    title: "Korean Vocabulary: K-Culture, Travel & Daily Life",
    description: "Learn Korean words from K-pop, K-drama, travel, and everyday life \u2014 bridging pop culture with real language learning.",
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: "Korean pop culture (Hallyu \u2014 \uD55C\uB958) has spread Korean language globally through K-pop and K-dramas. Many Hallyu fans already know some Korean intuitively. This lesson connects those cultural touchpoints to core language vocabulary for travel and daily conversations.",
      words: [
        { word: "\uD654\uC774\uD305 (Hwaiting)", partOfSpeech: "exclamation", definition: 'Fighting! / You can do it! \u2014 a motivational cheer borrowed from English "fighting" used in Korean culture.', englishExample: "Gamsahamnida, hwaiting! \u2014 Thank you, you can do it!" },
        { word: "\uC624\uBE60 / \uC5B8\uB2C8 (Oppa / Eonni)", partOfSpeech: "noun", definition: "Older brother (said by females) / Older sister (said by females) \u2014 terms of endearment in Korean social hierarchy.", englishExample: "Oppa, yeogi wa! \u2014 Hey oppa, come here!" },
        { word: "\uC9C0\uD558\uCCA0 (Jihacheol)", partOfSpeech: "noun", definition: "Subway / Metro \u2014 Seoul's extensive underground rail system, one of the world's best.", englishExample: "Jihacheol-eul ta-go Myeongdong-e ga-ja \u2014 Let's take the subway to Myeongdong." },
        { word: "\uD3B8\uC758\uC810 (Pyeonuijeom)", partOfSpeech: "noun", definition: "Convenience store \u2014 South Korea has the most convenient stores per capita; open 24/7.", englishExample: "Pyeonuijeom-e-seo gimbap sa-ja \u2014 Let's buy kimbap at the convenience store." },
        { word: "\uC140\uCE74 (Selka)", partOfSpeech: "noun", definition: "Selfie \u2014 Korea popularized the selfie culture; selka is the Korean adaptation of the word.", englishExample: "Selka jjik-ja! \u2014 Let's take a selfie!" },
        { word: "\uB300\uBC15 (Daebak)", partOfSpeech: "exclamation", definition: "Awesome! / Jackpot! / Amazing! \u2014 a versatile Korean exclamation of surprise and excitement.", englishExample: "Daebak! Jinjja? \u2014 Amazing! Really?" },
        { word: "\uD55C\uB958 (Hallyu)", partOfSpeech: "noun", definition: "Korean Wave \u2014 the global spread of Korean pop culture including K-pop, K-dramas, and Korean food.", englishExample: "Hallyu-ro Hangugeo-reul bae-u-go sipeoyo \u2014 I want to learn Korean because of the Korean Wave." },
        { word: "\uACE0\uB9C8\uC6CC (Gomawo)", partOfSpeech: "phrase", definition: "Thank you \u2014 informal version used with close friends, younger people, or peers.", englishExample: "Gomawo, chingu-ya! \u2014 Thanks, friend!" }
      ],
      quiz: [
        { id: "ko-kc-q1", question: '"\uD654\uC774\uD305 (Hwaiting)" is used to express:', options: ["Anger", "Sadness", "Encouragement / Cheer someone on", "Surprise only"], answerIndex: 2, explanation: 'Hwaiting (\uD654\uC774\uD305) is a cheer meaning "You can do it!" \u2014 extremely common in Korean culture.' },
        { id: "ko-kc-q2", question: 'What does "\uB300\uBC15 (Daebak)" express?', options: ["Disappointment", "Boredom", "Amazing / Awesome / Jackpot", "Fear"], answerIndex: 2, explanation: "Daebak (\uB300\uBC15) is an exclamation for something amazing, awesome, or incredibly lucky." },
        { id: "ko-kc-q3", question: '"\uC624\uBE60 (Oppa)" is a term used by a female for:', options: ["Younger brother", "Older brother or older male", "Male classmate of same age", "Father"], answerIndex: 1, explanation: "\uC624\uBE60 (Oppa) is used by females to refer to an older male (brother, friend, or partner)." },
        { id: "ko-kc-q4", question: '"\uC9C0\uD558\uCCA0 (Jihacheol)" means:', options: ["Bus terminal", "Subway / Metro", "Taxi stand", "Airport"], answerIndex: 1, explanation: "\uC9C0\uD558\uCCA0 (Jihacheol) = Subway/Metro \u2014 Seoul's subway system is world-renowned." },
        { id: "ko-kc-q5", question: 'What is a "\uD3B8\uC758\uC810 (Pyeonuijeom)"?', options: ["Department store", "Night market", "24-hour convenience store", "Traditional market"], answerIndex: 2, explanation: "\uD3B8\uC758\uC810 (Pyeonuijeom) = Convenience store, a staple of Korean daily life, open 24/7." },
        { id: "ko-kc-q6", question: '"\uC140\uCE74 (Selka)" is the Korean word for:', options: ["Mirror", "Camera", "Selfie", "Photo album"], answerIndex: 2, explanation: '\uC140\uCE74 is the Korean adaptation of "selfie" \u2014 Korea is the birthplace of modern selfie culture.' },
        { id: "ko-kc-q7", question: '"\uD55C\uB958 (Hallyu)" refers to:', options: ["Korean traditional food only", "Korean national holidays", "The global Korean cultural wave (K-pop, K-drama)", "Korea's ancient history"], answerIndex: 2, explanation: "Hallyu (\uD55C\uB958) = Korean Wave \u2014 the global spread of Korean pop culture." },
        { id: "ko-kc-q8", question: 'What is the informal way to say "Thank you" to a friend in Korean?', options: ["Gamsahamnida", "Joesonghamnida", "Gomawo", "Annyeong"], answerIndex: 2, explanation: '\uACE0\uB9C8\uC6CC (Gomawo) is the informal "Thank you" used with close friends and peers.' },
        { id: "ko-kc-q9", question: '"\uC5B8\uB2C8 (Eonni)" is used by a female to refer to:', options: ["Her older sister or older female friend", "Her mother", "Her teacher", "A younger girl"], answerIndex: 0, explanation: "\uC5B8\uB2C8 (Eonni) is used by females to refer to an older female \u2014 sister, friend, or mentor." },
        { id: "ko-kc-q10", question: 'K-pop fans worldwide already know "Hwaiting!" \u2014 it originally comes from the English word:', options: ["Faith", "Fighting", "Feeling", "Forward"], answerIndex: 1, explanation: '\uD654\uC774\uD305 (Hwaiting) is derived from the English word "fighting" used as a cheer.' }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇯🇵  JAPANESE LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "japanese-vocab-hiragana",
    category: "vocabulary",
    level: "beginner",
    targetLang: "japanese",
    title: "Japanese Essentials: Hiragana Words & Greetings",
    description: "Start your Japanese journey with the Hiragana writing system, essential greetings, and key polite expressions.",
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: "Japanese (\u65E5\u672C\u8A9E \u2014 Nihongo) has three writing systems: Hiragana (\u3072\u3089\u304C\u306A), Katakana (\u30AB\u30BF\u30AB\u30CA), and Kanji (\u6F22\u5B57). Hiragana is the foundation \u2014 it is a syllabic alphabet with 46 characters that every Japanese learner masters first. Japanese culture deeply values respect and politeness expressed through keigo (\u656C\u8A9E \u2014 formal speech).",
      words: [
        { word: "\u3053\u3093\u306B\u3061\u306F (Konnichiwa)", partOfSpeech: "greeting", definition: "Hello / Good afternoon \u2014 the universal Japanese greeting used from midday onward.", englishExample: "Konnichiwa! Hajimemashite \u2014 Hello! Nice to meet you." },
        { word: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059 (Arigatou Gozaimasu)", partOfSpeech: "phrase", definition: "Thank you very much \u2014 the formal, complete expression of gratitude in Japanese.", englishExample: "Tetsudatte arigatou gozaimasu \u2014 Thank you very much for helping me." },
        { word: "\u3059\u307F\u307E\u305B\u3093 (Sumimasen)", partOfSpeech: "phrase", definition: "Excuse me / I'm sorry \u2014 the most versatile Japanese phrase for getting attention or apologizing lightly.", englishExample: "Sumimasen! Eki wa doko desu ka? \u2014 Excuse me! Where is the station?" },
        { word: "\u306F\u3044 / \u3044\u3044\u3048 (Hai / Iie)", partOfSpeech: "adverb", definition: "Yes / No \u2014 fundamental affirmative and negative responses in Japanese.", englishExample: "Hai, wakarimasita \u2014 Yes, I understood." },
        { word: "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059 (Ohayou Gozaimasu)", partOfSpeech: "greeting", definition: "Good morning \u2014 formal morning greeting used before midday in Japan.", englishExample: "Ohayou gozaimasu, sensei! \u2014 Good morning, teacher!" },
        { word: "\u304A\u3084\u3059\u307F\u306A\u3055\u3044 (Oyasuminasai)", partOfSpeech: "greeting", definition: "Good night \u2014 said when going to sleep or leaving at night.", englishExample: "Oyasuminasai, mata ashita \u2014 Good night, see you tomorrow." },
        { word: "\u3088\u308D\u3057\u304F\u304A\u9858\u3044\u3057\u307E\u3059 (Yoroshiku Onegaishimasu)", partOfSpeech: "phrase", definition: "Please treat me well / Nice to meet you \u2014 a deeply cultural expression used in introductions and requests.", englishExample: "Hajimemashite, Kenji desu. Yoroshiku onegaishimasu \u2014 Nice to meet you, I'm Kenji. Please take care of me." },
        { word: "\u304A\u3044\u3057\u3044 (Oishii)", partOfSpeech: "adjective", definition: "Delicious / Tasty \u2014 the most important food word in Japanese!", englishExample: "Kono ramen wa hontou ni oishii! \u2014 This ramen is really delicious!" }
      ],
      quiz: [
        { id: "ja-hg-q1", question: 'What does "\u3053\u3093\u306B\u3061\u306F (Konnichiwa)" mean?', options: ["Good morning", "Hello / Good afternoon", "Good night", "Goodbye"], answerIndex: 1, explanation: "Konnichiwa is the standard Japanese greeting used from midday until evening." },
        { id: "ja-hg-q2", question: "Japanese has how many base Hiragana characters?", options: ["26", "46", "52", "64"], answerIndex: 1, explanation: "Hiragana has 46 base characters. They are the first writing system Japanese children and learners master." },
        { id: "ja-hg-q3", question: 'How do you say "Thank you very much" formally in Japanese?', options: ["Sumimasen", "Hai", "Arigatou Gozaimasu", "Oyasuminasai"], answerIndex: 2, explanation: '\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059 (Arigatou Gozaimasu) is the formal complete "Thank you very much".' },
        { id: "ja-hg-q4", question: '"\u3059\u307F\u307E\u305B\u3093 (Sumimasen)" is used to:', options: ["Say goodbye", "Say good morning", "Get someone's attention or apologize lightly", "Order food"], answerIndex: 2, explanation: 'Sumimasen is extraordinarily versatile \u2014 excuse me, sorry, and even "thank you" in some contexts.' },
        { id: "ja-hg-q5", question: 'What does "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059 (Ohayou Gozaimasu)" mean?', options: ["Good night", "Good evening", "Goodbye", "Good morning"], answerIndex: 3, explanation: "Ohayou Gozaimasu is the formal Japanese good morning greeting." },
        { id: "ja-hg-q6", question: '"\u3088\u308D\u3057\u304F\u304A\u9858\u3044\u3057\u307E\u3059 (Yoroshiku Onegaishimasu)" is said when:', options: ["Ordering food", "Saying farewell forever", "Meeting someone for the first time or making a request", "Complaining"], answerIndex: 2, explanation: 'Yoroshiku Onegaishimasu is a rich cultural phrase meaning "please treat me well" \u2014 used in introductions and requests.' },
        { id: "ja-hg-q7", question: 'What is "\u306F\u3044 (Hai)" in English?', options: ["No", "Maybe", "Yes", "Please"], answerIndex: 2, explanation: "\u306F\u3044 (Hai) = Yes. \u3044\u3044\u3048 (Iie) = No in Japanese." },
        { id: "ja-hg-q8", question: '"\u304A\u3084\u3059\u307F\u306A\u3055\u3044 (Oyasuminasai)" is said:', options: ["In the morning when waking up", "When going to sleep or parting at night", "Before eating a meal", "When meeting someone new"], answerIndex: 1, explanation: 'Oyasuminasai is the formal Japanese "Good night" said at bedtime or when parting in the evening.' },
        { id: "ja-hg-q9", question: 'What does "\u304A\u3044\u3057\u3044 (Oishii)" mean?', options: ["Beautiful", "Cheap", "Delicious", "Quiet"], answerIndex: 2, explanation: "\u7F8E\u5473\u3057\u3044 (Oishii) = Delicious/Tasty \u2014 the go-to word for complimenting food in Japan." },
        { id: "ja-hg-q10", question: "Japan's three writing systems are:", options: ["Hiragana, Katakana, Romaji", "Hiragana, Katakana, Kanji", "Kanji, Romaji, Katakana", "Hiragana, Kanji, Mandarin"], answerIndex: 1, explanation: "Japanese uses Hiragana (\u3072\u3089\u304C\u306A), Katakana (\u30AB\u30BF\u30AB\u30CA), and Kanji (\u6F22\u5B57) together in written text." }
      ]
    }
  },
  {
    id: "japanese-conv-restaurant",
    category: "conversation",
    level: "beginner",
    targetLang: "japanese",
    title: "Japanese Conversations: At a Restaurant (\u30EC\u30B9\u30C8\u30E9\u30F3)",
    description: "Practice authentic Japanese restaurant dialogues \u2014 being seated, ordering ramen and sushi, and paying the bill.",
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      context: "You have entered a popular traditional ramen restaurant (\u30E9\u30FC\u30E1\u30F3\u5C4B \u2014 Ramen-ya) in Tokyo. The polite server greets you at the entrance. You want to order shoyu ramen (soy sauce ramen) and gyoza (potstickers). This dialogue teaches practical dining Japanese with authentic phrases.",
      speakerNames: ["Server (\u5E97\u54E1)", "Customer (\u304A\u5BA2\u69D8)"],
      transcript: [
        { speaker: "Server (\u5E97\u54E1)", text: "Irasshaimase! Nan-mei sama desu ka? (Welcome! How many people are in your party?)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Hitori desu. (Just one person.)" },
        { speaker: "Server (\u5E97\u54E1)", text: "Kochira e douzo. Go-chuumon wa okimari desu ka? (This way please. Have you decided your order?)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Hai, shoyu ramen to gyouza wo kudasai. (Yes, shoyu ramen and gyoza please.)" },
        { speaker: "Server (\u5E97\u54E1)", text: "Kashikomarimashita! Karai no wa daijoubu desu ka? (Certainly! Is spicy okay for you?)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Hai, daijoubu desu. Mizu mo onegaishimasu. (Yes, that's fine. Water as well please.)" },
        { speaker: "Server (\u5E97\u54E1)", text: "Sukoshi omachi kudasai. (Please wait a moment.)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Oishikatta desu! Okaikei onegaishimasu. Ikura desu ka? (That was delicious! The bill please. How much is it?)" }
      ],
      quiz: [
        { id: "ja-rs-q1", question: 'What does "\u3044\u3089\u3063\u3057\u3083\u3044\u307E\u305B (Irasshaimase)" mean?', options: ["Thank you for coming", "Welcome! (formal greeting to customers)", "Please sit down", "What would you like?"], answerIndex: 1, explanation: "Irasshaimase is the formal welcome phrase used by all Japanese shops and restaurants when a customer enters." },
        { id: "ja-rs-q2", question: '"\u4E00\u4EBA\u3067\u3059 (Hitori Desu)" means:', options: ["Table for two", "Just one person", "I have a reservation", "I am waiting for someone"], answerIndex: 1, explanation: "\u4E00\u4EBA (Hitori) = One person. \u4E8C\u4EBA (Futari) = Two people. \u3067\u3059 (Desu) is the polite copula." },
        { id: "ja-rs-q3", question: 'How do you politely say "Please give me..." in Japanese?', options: ["Sumimasen", "Kudasai / Onegaishimasu", "Daijoubu", "Kashikomarimashita"], answerIndex: 1, explanation: '\u301C\u3092\u304F\u3060\u3055\u3044 (Kudasai) and \u301C\u3092\u304A\u9858\u3044\u3057\u307E\u3059 (Onegaishimasu) both mean "please give me ___".' },
        { id: "ja-rs-q4", question: '"\u304B\u3057\u3053\u307E\u308A\u307E\u3057\u305F (Kashikomarimashita)" is a very formal way servers say:', options: ["Please wait", "Certainly / Understood (very formal)", "Welcome", "Here is your order"], answerIndex: 1, explanation: 'Kashikomarimashita is the most formal "Certainly/Understood" used by service staff in Japan.' },
        { id: "ja-rs-q5", question: 'What is "\u9903\u5B50 (Gyouza)"?', options: ["Tempura shrimp", "Japanese potsticker dumplings", "Grilled skewers", "Miso soup"], answerIndex: 1, explanation: "\u9903\u5B50 (Gyouza/Gyoza) are Japanese-style potsticker dumplings \u2014 a popular side dish with ramen." },
        { id: "ja-rs-q6", question: '"\u5927\u4E08\u592B\u3067\u3059\u304B? (Daijoubu Desu Ka?)" means:', options: ["Is it delicious?", "Is it expensive?", "Are you okay? / Is it alright?", "Is it spicy?"], answerIndex: 2, explanation: "\u5927\u4E08\u592B (Daijoubu) = Okay/Alright. \u5927\u4E08\u592B\u3067\u3059\u304B? = Is that okay? / Are you alright?" },
        { id: "ja-rs-q7", question: 'How do you ask "How much is it?" in Japanese?', options: ["Ikura desu ka?", "Nani desu ka?", "Doko desu ka?", "Itsu desu ka?"], answerIndex: 0, explanation: "\u3044\u304F\u3089\u3067\u3059\u304B? (Ikura Desu Ka?) = How much is it? \u2014 essential for shopping and dining." },
        { id: "ja-rs-q8", question: '"\u304A\u3044\u3057\u304B\u3063\u305F\u3067\u3059 (Oishikatta Desu)" is the past tense meaning:', options: ["It will be delicious", "It is delicious now", "It was delicious", "It is not delicious"], answerIndex: 2, explanation: 'Oishikatta Desu (\u304A\u3044\u3057\u304B\u3063\u305F\u3067\u3059) is the past tense of Oishii \u2014 "It was delicious."' },
        { id: "ja-rs-q9", question: '"\u304A\u4F1A\u8A08\u304A\u9858\u3044\u3057\u307E\u3059 (Okaikei Onegaishimasu)" means:', options: ["Another order please", "The bill please", "More water please", "A takeaway box please"], answerIndex: 1, explanation: '\u304A\u4F1A\u8A08 (Okaikei) = Bill/Check. \u304A\u4F1A\u8A08\u304A\u9858\u3044\u3057\u307E\u3059 = "The bill please" \u2014 the correct way to ask for the check in Japan.' },
        { id: "ja-rs-q10", question: "Japanese restaurants always greet entering customers with:", options: ["Konnichiwa", "Arigatou Gozaimasu", "Irasshaimase", "Sumimasen"], answerIndex: 2, explanation: "\u3044\u3089\u3063\u3057\u3083\u3044\u307E\u305B (Irasshaimase) is the universal formal welcome phrase shouted to every customer who enters a Japanese establishment." }
      ]
    }
  },
  {
    id: "japanese-vocab-culture",
    category: "vocabulary",
    level: "intermediate",
    targetLang: "japanese",
    title: "Japanese Vocabulary: Anime, Culture & Daily Life",
    description: "Connect anime and manga vocabulary to real Japanese \u2014 plus essential daily life words for navigating Japan as a traveler.",
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: "Japanese pop culture (anime, manga, J-pop, and gaming) has introduced millions of learners to Japanese vocabulary. Many anime words are actually real, everyday Japanese expressions. This lesson bridges your cultural knowledge with practical travel and daily life vocabulary.",
      words: [
        { word: "\u304B\u308F\u3044\u3044 (Kawaii)", partOfSpeech: "adjective", definition: "Cute / Adorable \u2014 perhaps the most globally recognized Japanese word, used constantly in daily speech.", englishExample: "Ano neko wa kawaii desu ne \u2014 That cat is so cute, isn't it!" },
        { word: "\u3059\u3054\u3044 (Sugoi)", partOfSpeech: "exclamation", definition: "Amazing! / Wow! / Great! \u2014 a highly versatile expression of admiration or surprise.", englishExample: "Sugoi! Sore wa hontou ni jouzu desu ne \u2014 Amazing! You're really skilled, aren't you!" },
        { word: "\u306A\u308B\u307B\u3069 (Naruhodo)", partOfSpeech: "phrase", definition: "I see / That makes sense / Indeed \u2014 an expression of understanding or realization.", englishExample: "Naruhodo! Sou iu koto desu ne \u2014 I see! So that's how it is." },
        { word: "\u96FB\u8ECA (Densha)", partOfSpeech: "noun", definition: "Train / Electric train \u2014 Japan has one of the world's most punctual and extensive rail networks.", englishExample: "Densha de Shibuya ni ikimashita \u2014 I went to Shibuya by train." },
        { word: "\u30B3\u30F3\u30D3\u30CB (Conbini)", partOfSpeech: "noun", definition: "Convenience store \u2014 Japan's legendary convenience stores (7-Eleven, Lawson, FamilyMart) are open 24/7 and sell hot meals.", englishExample: "Conbini de onigiri katte kita \u2014 I bought an onigiri at the convenience store." },
        { word: "\u6E29\u6CC9 (Onsen)", partOfSpeech: "noun", definition: "Hot spring / Hot spring bath \u2014 a quintessential Japanese cultural experience in natural volcanic hot water.", englishExample: "Onsen ni hairitai desu \u2014 I want to soak in an onsen." },
        { word: "\u9811\u5F35\u3063\u3066 (Ganbatte)", partOfSpeech: "phrase", definition: "Do your best! / Good luck! / Keep going! \u2014 an extremely common Japanese encouragement phrase.", englishExample: "Shiken ganbatte ne! \u2014 Do your best on the exam!" },
        { word: "\u3082\u3063\u305F\u3044\u306A\u3044 (Mottainai)", partOfSpeech: "adjective", definition: "What a waste! / Too good to waste \u2014 a Japanese concept of avoiding waste out of respect for value.", englishExample: "Kore wo suteruno wa mottainai \u2014 It's a waste to throw this away." }
      ],
      quiz: [
        { id: "ja-kc-q1", question: '"\u304B\u308F\u3044\u3044 (Kawaii)" means:', options: ["Scary", "Cool / Stylish", "Cute / Adorable", "Sad"], answerIndex: 2, explanation: "\u304B\u308F\u3044\u3044 (Kawaii) = Cute/Adorable \u2014 one of the most universally recognized Japanese words worldwide." },
        { id: "ja-kc-q2", question: '"\u3059\u3054\u3044 (Sugoi)" is used to express:', options: ["Boredom or disinterest", "Confusion or misunderstanding", "Fear or danger", "Amazement, admiration, or surprise"], answerIndex: 3, explanation: "Sugoi (\u3059\u3054\u3044) = Amazing/Wow! \u2014 one of the most versatile Japanese emotional expressions." },
        { id: "ja-kc-q3", question: '"\u306A\u308B\u307B\u3069 (Naruhodo)" is said when:', options: ["You are angry", "You just understood something", "You are hungry", "You are leaving"], answerIndex: 1, explanation: 'Naruhodo (\u306A\u308B\u307B\u3069) = "I see / That makes sense" \u2014 said when gaining understanding or insight.' },
        { id: "ja-kc-q4", question: 'What does "\u96FB\u8ECA (Densha)" mean?', options: ["Airplane", "Bus", "Train / Electric train", "Bicycle"], answerIndex: 2, explanation: "\u96FB\u8ECA (Densha) = Train. Japan's trains are world-famous for their punctuality and extensive network." },
        { id: "ja-kc-q5", question: '"\u30B3\u30F3\u30D3\u30CB (Conbini)" is short for which English word?', options: ["Continental", "Convenience (store)", "Combination", "Conference"], answerIndex: 1, explanation: `Conbini (\u30B3\u30F3\u30D3\u30CB) is shortened from "Convenience store." Japan's conbini are legendary for their quality and variety.` },
        { id: "ja-kc-q6", question: '"\u6E29\u6CC9 (Onsen)" is:', options: ["A Japanese hot spring bath", "A traditional Japanese garden", "A type of Japanese noodle", "A Japanese tea ceremony"], answerIndex: 0, explanation: "\u6E29\u6CC9 (Onsen) = Hot spring \u2014 a central part of Japanese relaxation and cultural tradition." },
        { id: "ja-kc-q7", question: '"\u9811\u5F35\u3063\u3066 (Ganbatte)" is used to:', options: ["Say goodbye formally", "Encourage someone / Wish them good luck", "Apologize", "Express surprise"], answerIndex: 1, explanation: "Ganbatte (\u9811\u5F35\u3063\u3066) = Do your best! / Keep going! \u2014 one of Japan's most uplifting phrases." },
        { id: "ja-kc-q8", question: '"\u3082\u3063\u305F\u3044\u306A\u3044 (Mottainai)" expresses:', options: ["Excitement about something new", "Regret about wasting something valuable", "Pride in achievement", "Curiosity about something unknown"], answerIndex: 1, explanation: "Mottainai expresses the feeling that something valuable shouldn't be wasted \u2014 a key Japanese cultural value." },
        { id: "ja-kc-q9", question: 'Which Japanese word do anime fans worldwide already know, meaning "cute"?', options: ["Sugoi", "Kawaii", "Naruhodo", "Ganbatte"], answerIndex: 1, explanation: "\u304B\u308F\u3044\u3044 (Kawaii) is globally recognized through anime, manga, and Japanese pop culture." },
        { id: "ja-kc-q10", question: "Japan's convenience stores (\u30B3\u30F3\u30D3\u30CB) are notable for being:", options: ["Expensive luxury shops", "Open only in daytime", "Open 24/7 and selling hot fresh meals", "Only found in airports"], answerIndex: 2, explanation: "Japanese conbini are legendary for being open 24 hours and selling fresh, high-quality food." }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇹🇭  THAI — ADDITIONAL MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "thai-vocab-food",
    category: "vocabulary",
    level: "beginner",
    targetLang: "thai",
    title: "Thai Vocabulary: Food & Thai Cuisine",
    description: "Master the names of iconic Thai dishes, spice levels, and food-related vocabulary to eat like a local.",
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: "Thai cuisine is world-famous for its bold flavors, aromatic herbs, and balance of sweet, sour, salty, and spicy. Learning food vocabulary will help you navigate menus, order confidently, and connect with Thai people through their most beloved cultural tradition \u2014 eating!",
      words: [
        { word: "\u0E1C\u0E31\u0E14\u0E44\u0E17\u0E22 (Pad Thai)", partOfSpeech: "noun", definition: "Stir-fried rice noodles \u2014 Thailand's most famous dish served worldwide.", englishExample: "Khaw Pad Thai song thi \u2014 Please give me two Pad Thai." },
        { word: "\u0E15\u0E49\u0E21\u0E22\u0E33\u0E01\u0E38\u0E49\u0E07 (Tom Yum Goong)", partOfSpeech: "noun", definition: "Spicy shrimp soup \u2014 a signature Thai soup with lemongrass, galangal, and kaffir lime.", englishExample: "Tom Yum Goong aroy mak! \u2014 Tom Yum Goong is very delicious!" },
        { word: "\u0E2A\u0E49\u0E21\u0E15\u0E33 (Som Tum)", partOfSpeech: "noun", definition: "Green papaya salad \u2014 a spicy, tangy salad from northeastern Thailand (Isaan).", englishExample: "Som Tum mai phet \u2014 Som Tum, not spicy please." },
        { word: "\u0E40\u0E1C\u0E47\u0E14 / \u0E44\u0E21\u0E48\u0E40\u0E1C\u0E47\u0E14 (Phet / Mai Phet)", partOfSpeech: "adjective", definition: "Spicy / Not spicy \u2014 the two most important words when ordering Thai food.", englishExample: "Mai phet na khrap \u2014 Not spicy please." },
        { word: "\u0E02\u0E49\u0E32\u0E27\u0E1C\u0E31\u0E14 (Khao Pad)", partOfSpeech: "noun", definition: "Fried rice \u2014 a simple, beloved Thai staple available everywhere at any time.", englishExample: "Khao pad gai \u2014 chicken fried rice." },
        { word: "\u0E41\u0E01\u0E07\u0E40\u0E02\u0E35\u0E22\u0E27\u0E2B\u0E27\u0E32\u0E19 (Kaeng Khiao Wan)", partOfSpeech: "noun", definition: "Green curry \u2014 fragrant coconut-milk curry with green chilies, one of Thailand's most iconic dishes.", englishExample: "Kaeng Khiao Wan nuea \u2014 green curry with beef." },
        { word: "\u0E21\u0E31\u0E07\u0E04\u0E38\u0E14 / \u0E17\u0E38\u0E40\u0E23\u0E35\u0E22\u0E19 (Mangkhut / Thurian)", partOfSpeech: "noun", definition: "Mangosteen / Durian \u2014 two legendary Thai fruits; mangosteen is sweet, durian is pungent.", englishExample: "Thurian king phollamai \u2014 Durian is the king of fruits (in Thai culture)." },
        { word: "\u0E0A\u0E32\u0E19\u0E21\u0E44\u0E02\u0E48\u0E21\u0E38\u0E01 (Cha Nom Khai Muk)", partOfSpeech: "noun", definition: "Bubble tea \u2014 extremely popular milk tea with tapioca pearls, found on every street corner.", englishExample: "Cha nom khai muk yen \u2014 iced bubble milk tea." }
      ],
      quiz: [
        { id: "th-fd-q1", question: 'What is "\u0E1C\u0E31\u0E14\u0E44\u0E17\u0E22 (Pad Thai)"?', options: ["A Thai soup", "Stir-fried rice noodles", "A spicy salad", "Green curry"], answerIndex: 1, explanation: "Pad Thai (\u0E1C\u0E31\u0E14\u0E44\u0E17\u0E22) is Thailand's most internationally famous dish \u2014 stir-fried rice noodles." },
        { id: "th-fd-q2", question: 'How do you say "Not spicy" when ordering in Thailand?', options: ["Phet mak", "Aroy mak", "Mai phet", "Khao pad"], answerIndex: 2, explanation: '"Mai Phet" (\u0E44\u0E21\u0E48\u0E40\u0E1C\u0E47\u0E14) = Not spicy. This is essential to know when ordering Thai food!' },
        { id: "th-fd-q3", question: '"\u0E15\u0E49\u0E21\u0E22\u0E33\u0E01\u0E38\u0E49\u0E07 (Tom Yum Goong)" contains which main protein?', options: ["Chicken", "Beef", "Tofu", "Shrimp (Goong)"], answerIndex: 3, explanation: "Goong (\u0E01\u0E38\u0E49\u0E07) means shrimp in Thai. Tom Yum Goong is shrimp in spicy lemongrass soup." },
        { id: "th-fd-q4", question: '"\u0E2A\u0E49\u0E21\u0E15\u0E33 (Som Tum)" is a salad made from:', options: ["Mango", "Green papaya", "Cucumber", "Banana blossom"], answerIndex: 1, explanation: "Som Tum (\u0E2A\u0E49\u0E21\u0E15\u0E33) = Green papaya salad, originally from Isaan (northeastern Thailand)." },
        { id: "th-fd-q5", question: 'What does "\u0E40\u0E1C\u0E47\u0E14 (Phet)" mean?', options: ["Sweet", "Sour", "Spicy", "Salty"], answerIndex: 2, explanation: "\u0E40\u0E1C\u0E47\u0E14 (Phet) = Spicy. Thai food has 4 main flavors: Wan (sweet), Priaw (sour), Khem (salty), Phet (spicy)." },
        { id: "th-fd-q6", question: '"\u0E41\u0E01\u0E07\u0E40\u0E02\u0E35\u0E22\u0E27\u0E2B\u0E27\u0E32\u0E19 (Kaeng Khiao Wan)" means:', options: ["Red curry", "Yellow curry", "Green curry", "Massaman curry"], answerIndex: 2, explanation: 'Kaeng Khiao Wan (\u0E41\u0E01\u0E07\u0E40\u0E02\u0E35\u0E22\u0E27\u0E2B\u0E27\u0E32\u0E19) literally means "green sweet curry" = Thai green curry.' },
        { id: "th-fd-q7", question: '"\u0E02\u0E49\u0E32\u0E27\u0E1C\u0E31\u0E14 (Khao Pad)" means:', options: ["Steamed rice", "Sticky rice", "Fried rice", "Rice porridge"], answerIndex: 2, explanation: "Khao (\u0E02\u0E49\u0E32\u0E27) = Rice, Pad (\u0E1C\u0E31\u0E14) = Stir-fried/Fried. Khao Pad = Fried rice." },
        { id: "th-fd-q8", question: '"\u0E17\u0E38\u0E40\u0E23\u0E35\u0E22\u0E19 (Thurian)" is known as:', options: ["The king of fruits", "The queen of fruits", "The sweetest fruit", "The rarest fruit"], answerIndex: 0, explanation: 'Durian (\u0E17\u0E38\u0E40\u0E23\u0E35\u0E22\u0E19) is called "the king of fruits" in Southeast Asia \u2014 it has a powerful, pungent aroma.' },
        { id: "th-fd-q9", question: 'What is "\u0E0A\u0E32\u0E19\u0E21\u0E44\u0E02\u0E48\u0E21\u0E38\u0E01 (Cha Nom Khai Muk)"?', options: ["Thai iced coffee", "Bubble milk tea", "Coconut water", "Tamarind juice"], answerIndex: 1, explanation: "Cha Nom Khai Muk (\u0E0A\u0E32\u0E19\u0E21\u0E44\u0E02\u0E48\u0E21\u0E38\u0E01) = Bubble tea / Boba \u2014 extremely popular across Thailand." },
        { id: "th-fd-q10", question: "Which Thai dish is a spicy shrimp soup with lemongrass?", options: ["Pad Thai", "Khao Pad", "Tom Yum Goong", "Som Tum"], answerIndex: 2, explanation: "Tom Yum Goong (\u0E15\u0E49\u0E21\u0E22\u0E33\u0E01\u0E38\u0E49\u0E07) is Thailand's iconic spicy-sour shrimp soup." }
      ]
    }
  },
  {
    id: "thai-conv-hotel",
    category: "conversation",
    level: "beginner",
    targetLang: "thai",
    title: "Thai Conversations: At the Hotel (\u0E42\u0E23\u0E07\u0E41\u0E23\u0E21)",
    description: "Navigate hotel check-in, room requests, and common hotel situations in Thai with confidence.",
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: "You have arrived at a mid-range hotel (\u0E42\u0E23\u0E07\u0E41\u0E23\u0E21 \u2014 Rong Raem) in Chiang Mai after a long journey. You need to check in, confirm your reservation, and ask about breakfast and WiFi. This dialogue covers essential hotel Thai vocabulary.",
      speakerNames: ["Receptionist (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A)", "Guest (\u0E41\u0E02\u0E01)"],
      transcript: [
        { speaker: "Receptionist (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A)", text: "Sawatdee kha! Chern rap borikan. Mee jutmai samrong mai kha? (Hello! Welcome. Do you have a reservation?)" },
        { speaker: "Guest (\u0E41\u0E02\u0E01)", text: "Mee khrap. Chue Somchai. Chan diao, song khuen. (Yes. My name is Somchai. Single room, two nights.)" },
        { speaker: "Receptionist (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A)", text: "Chai loei kha! Hong chan thi ha. Nee is key card kha. (Yes, that's correct! Room number 5. Here is your key card.)" },
        { speaker: "Guest (\u0E41\u0E02\u0E01)", text: "Khob khun khrap. Ahaan chao ruam mai khrap? (Thank you. Is breakfast included?)" },
        { speaker: "Receptionist (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A)", text: "Ruam kha! Ahaan chao tee dining room chan 1 tam wan 7 thueng 10 kha. (Included! Breakfast is in the dining room on floor 1 from 7 to 10 AM.)" },
        { speaker: "Guest (\u0E41\u0E02\u0E01)", text: "Wi-Fi mee mai khrap? Rot pass arai khrap? (Is there WiFi? What is the password?)" },
        { speaker: "Receptionist (\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A)", text: 'Mee kha! Wi-Fi chue "HotelChiangmai" rot pass "welcome2025" kha. (Yes! WiFi name is "HotelChiangmai" and the password is "welcome2025".)' },
        { speaker: "Guest (\u0E41\u0E02\u0E01)", text: "Khob khun mak khrap! Hong yoo chan nai khrap? (Thank you very much! Which floor is the room on?)" }
      ],
      quiz: [
        { id: "th-ht-q1", question: 'What does "\u0E42\u0E23\u0E07\u0E41\u0E23\u0E21 (Rong Raem)" mean?', options: ["Airport", "Hotel", "Hospital", "Restaurant"], answerIndex: 1, explanation: "\u0E42\u0E23\u0E07\u0E41\u0E23\u0E21 (Rong Raem) = Hotel in Thai." },
        { id: "th-ht-q2", question: 'How do you say "I have a reservation" in Thai?', options: ["Mai mee khrap", "Mee jutmai samrong khrap", "Hong mai mee khrap", "Chue arai khrap"], answerIndex: 1, explanation: '"Mee Jutmai Samrong" (\u0E21\u0E35\u0E08\u0E38\u0E14\u0E2B\u0E21\u0E32\u0E22\u0E2A\u0E33\u0E23\u0E2D\u0E07) \u2014 this phrase means "I have a reservation".' },
        { id: "th-ht-q3", question: '"Key card" in a Thai hotel context is called:', options: ["Jutmai", "Bat samrong", "Key card (same)", "Bai arnu yat"], answerIndex: 2, explanation: 'Thai hotels use the English loanword "key card" (pronounced similarly). Many modern English hotel terms are used directly.' },
        { id: "th-ht-q4", question: 'How do you ask "Is breakfast included?" in Thai?', options: ["Ahaan chao ruam mai?", "Wi-Fi mee mai?", "Hong yoo chan nai?", "Mee jutmai mai?"], answerIndex: 0, explanation: '"Ahaan Chao Ruam Mai?" (\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E40\u0E0A\u0E49\u0E32\u0E23\u0E27\u0E21\u0E44\u0E2B\u0E21?) = Is breakfast included? Ruam (\u0E23\u0E27\u0E21) means included.' },
        { id: "th-ht-q5", question: '"\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E40\u0E0A\u0E49\u0E32 (Ahaan Chao)" means:', options: ["Lunch", "Dinner", "Breakfast", "Snack"], answerIndex: 2, explanation: "\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E40\u0E0A\u0E49\u0E32 = Breakfast. \u0E40\u0E0A\u0E49\u0E32 (Chao) = Morning. \u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E01\u0E25\u0E32\u0E07\u0E27\u0E31\u0E19 = Lunch. \u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E40\u0E22\u0E47\u0E19 = Dinner." },
        { id: "th-ht-q6", question: "How do you ask for the WiFi password in Thai?", options: ["Wi-Fi rot pass arai?", "Hong number arai?", "Ahaan mee mai?", "Check-in thi nai?"], answerIndex: 0, explanation: '"Wi-Fi Rot Pass Arai?" = What is the WiFi password? Thai uses English loanwords for tech terms.' },
        { id: "th-ht-q7", question: '"Chan diao" (\u0E2B\u0E49\u0E2D\u0E07\u0E40\u0E14\u0E35\u0E48\u0E22\u0E27) means what type of room?', options: ["Double room", "Suite", "Single room", "Dormitory"], answerIndex: 2, explanation: "Chan Diao (\u0E2B\u0E49\u0E2D\u0E07\u0E40\u0E14\u0E35\u0E48\u0E22\u0E27) = Single room. Chan Khu (\u0E2B\u0E49\u0E2D\u0E07\u0E04\u0E39\u0E48) = Double/Twin room." },
        { id: "th-ht-q8", question: '"\u0E2A\u0E2D\u0E07 \u0E04\u0E37\u0E19 (Song Khuen)" means:', options: ["Second floor", "Two nights", "Two days", "Room 2"], answerIndex: 1, explanation: "Song (\u0E2A\u0E2D\u0E07) = Two. Khuen (\u0E04\u0E37\u0E19) = Night. Song Khuen = Two nights." },
        { id: "th-ht-q9", question: 'The receptionist says breakfast is from 7 to 10 AM. "\u0E15\u0E32\u0E21 \u0E27\u0E31\u0E19" (Tam Wan) means:', options: ["Per person", "Daily / every day", "Per room", "For guests only"], answerIndex: 1, explanation: "\u0E15\u0E32\u0E21\u0E27\u0E31\u0E19 (Tam Wan) = Daily / every day. Wan (\u0E27\u0E31\u0E19) = Day." },
        { id: "th-ht-q10", question: 'How do you ask "Which floor is my room on?" in Thai?', options: ["Hong thi tao rai?", "Chan yoo thi nai?", "Hong yoo chan nai?", "Thi nai mee hong?"], answerIndex: 2, explanation: '"Hong Yoo Chan Nai?" (\u0E2B\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E0A\u0E31\u0E49\u0E19\u0E44\u0E2B\u0E19?) = Which floor is the room on? Chan (\u0E0A\u0E31\u0E49\u0E19) = Floor/Level.' }
      ]
    }
  },
  {
    id: "thai-vocab-directions",
    category: "vocabulary",
    level: "beginner",
    targetLang: "thai",
    title: "Thai Vocabulary: Directions & Transportation",
    description: "Learn how to ask for and understand directions in Thai \u2014 plus key transportation vocabulary for getting around Thailand.",
    xpReward: 190,
    estimatedMinutes: 11,
    content: {
      introduction: "Getting around Thailand requires knowing key direction words and transportation vocabulary. Whether you are hailing a tuk-tuk, taking a songthaew (shared red truck), or navigating Bangkok's BTS, these words will keep you moving in the right direction!",
      words: [
        { word: "\u0E0B\u0E49\u0E32\u0E22 / \u0E02\u0E27\u0E32 (Sai / Khwa)", partOfSpeech: "adverb", definition: "Left / Right \u2014 the two most important direction words in any language.", englishExample: "Liao sai \u2014 Turn left. Liao khwa \u2014 Turn right." },
        { word: "\u0E15\u0E23\u0E07\u0E44\u0E1B (Trong Pai)", partOfSpeech: "adverb", definition: "Go straight ahead \u2014 used when giving or receiving directions.", englishExample: "Trong pai laew liao sai \u2014 Go straight, then turn left." },
        { word: "\u0E43\u0E01\u0E25\u0E49 / \u0E44\u0E01\u0E25 (Klai / Klai)", partOfSpeech: "adjective", definition: "Near / Far \u2014 two opposite adjectives for describing distance (note: different tones!).", englishExample: "Yoo klai mai? \u2014 Is it nearby? Yoo klai mak \u2014 It's very far." },
        { word: "\u0E15\u0E38\u0E4A\u0E01\u0E15\u0E38\u0E4A\u0E01 (Tuk-Tuk)", partOfSpeech: "noun", definition: "Three-wheeled motorized taxi \u2014 the iconic Thai vehicle found in cities and tourist areas.", englishExample: "Tuk-tuk pai Khao San Road thao rai? \u2014 How much is a tuk-tuk to Khao San Road?" },
        { word: "\u0E2A\u0E16\u0E32\u0E19\u0E35 (Sathani)", partOfSpeech: "noun", definition: "Station \u2014 used for bus stations, train stations, and BTS/MRT sky train stops.", englishExample: "BTS Sathani Siam yoo thi nai? \u2014 Where is Siam BTS Station?" },
        { word: "\u0E41\u0E17\u0E47\u0E01\u0E0B\u0E35\u0E48 (Taxi)", partOfSpeech: "noun", definition: 'Taxi \u2014 Bangkok has metered taxis; always ask "Meter na khrap?" to confirm they use the meter.', englishExample: "Taxi meter na khrap \u2014 Please use the meter." },
        { word: "\u0E16\u0E19\u0E19 (Thanon)", partOfSpeech: "noun", definition: "Street / Road \u2014 used in addresses and directions throughout Thailand.", englishExample: "Thanon Sukhumvit \u2014 Sukhumvit Road, Bangkok's famous main artery." },
        { word: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48 (Phaen Thi)", partOfSpeech: "noun", definition: "Map \u2014 useful when you need to show your destination to a driver.", englishExample: "Mee phaen thi mai? \u2014 Do you have a map?" }
      ],
      quiz: [
        { id: "th-dr-q1", question: 'How do you say "Turn left" in Thai?', options: ["Trong pai", "Liao khwa", "Liao sai", "Yoo klai"], answerIndex: 2, explanation: '"Liao Sai" (\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22) = Turn left. Liao (\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27) = Turn, Sai (\u0E0B\u0E49\u0E32\u0E22) = Left.' },
        { id: "th-dr-q2", question: '"\u0E15\u0E23\u0E07\u0E44\u0E1B (Trong Pai)" means:', options: ["Turn around", "Go straight ahead", "Turn right", "Stop here"], answerIndex: 1, explanation: "Trong Pai (\u0E15\u0E23\u0E07\u0E44\u0E1B) = Go straight ahead. Essential for giving and following directions." },
        { id: "th-dr-q3", question: 'What is a "\u0E15\u0E38\u0E4A\u0E01\u0E15\u0E38\u0E4A\u0E01 (Tuk-Tuk)"?', options: ["A river boat", "A train", "A three-wheeled motorized taxi", "A motorbike taxi"], answerIndex: 2, explanation: "The Tuk-Tuk (\u0E15\u0E38\u0E4A\u0E01\u0E15\u0E38\u0E4A\u0E01) is Thailand's iconic 3-wheeled open taxi \u2014 a must-try for tourists!" },
        { id: "th-dr-q4", question: "When getting a Bangkok taxi, you should ask:", options: ["Sabai dee mai?", "Meter na khrap?", "Pai nai khrap?", "Raka thao rai?"], answerIndex: 1, explanation: '"Meter Na Khrap?" = Please use the meter. Always ask this to avoid overcharging.' },
        { id: "th-dr-q5", question: '"\u0E43\u0E01\u0E25\u0E49 (Klai)" and "\u0E44\u0E01\u0E25 (Klai)" are two different words. What is the difference?', options: ["Spelling is different only", "They are the same word", "Different tones \u2014 klai (near) vs klai (far)", "One is formal, one is informal"], answerIndex: 2, explanation: "Thai is a tonal language! \u0E43\u0E01\u0E25\u0E49 = near (falling tone) and \u0E44\u0E01\u0E25 = far (rising tone) \u2014 they sound similar but different tones change meaning entirely." },
        { id: "th-dr-q6", question: '"\u0E16\u0E19\u0E19 (Thanon)" means:', options: ["Bridge", "Street / Road", "Intersection", "Alley"], answerIndex: 1, explanation: "\u0E16\u0E19\u0E19 (Thanon) = Street / Road. You'll see this word in all Thai addresses." },
        { id: "th-dr-q7", question: 'What is "\u0E2A\u0E16\u0E32\u0E19\u0E35 (Sathani)"?', options: ["Hotel", "Market", "Station (bus/train/BTS)", "Hospital"], answerIndex: 2, explanation: "\u0E2A\u0E16\u0E32\u0E19\u0E35 (Sathani) = Station \u2014 used for train stations, bus terminals, and MRT/BTS stops." },
        { id: "th-dr-q8", question: '"\u0E02\u0E27\u0E32 (Khwa)" means:', options: ["Left", "Straight", "Right", "Back"], answerIndex: 2, explanation: "\u0E02\u0E27\u0E32 (Khwa) = Right direction. \u0E0B\u0E49\u0E32\u0E22 (Sai) = Left." },
        { id: "th-dr-q9", question: 'How do you ask "Is it nearby?" in Thai?', options: ["Thanon arai?", "Pai dai mai?", "Yoo klai mai?", "Hong yoo thi nai?"], answerIndex: 2, explanation: '"Yoo Klai Mai?" (\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E01\u0E25\u0E49\u0E44\u0E2B\u0E21?) = Is it nearby? Yoo = Located, Klai = Near, Mai = Question particle.' },
        { id: "th-dr-q10", question: '"\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48 (Phaen Thi)" means:', options: ["Timetable", "Bus stop", "Ticket", "Map"], answerIndex: 3, explanation: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48 (Phaen Thi) = Map. Very useful to show taxi or tuk-tuk drivers where you want to go." }
      ]
    }
  },
  {
    id: "thai-grammar-basics",
    category: "grammar",
    level: "beginner",
    targetLang: "thai",
    title: "Thai Grammar: Basic Sentence Structure",
    description: "Understand how Thai sentences are constructed \u2014 word order, negation, questions, and the role of particles.",
    xpReward: 210,
    estimatedMinutes: 13,
    content: {
      explanation: "Thai grammar is simpler than many languages in some ways \u2014 there are no verb conjugations, no plurals, and no grammatical gender. However, Thai sentence structure and the use of tones and particles are unique. This lesson covers the essential building blocks of Thai sentences.",
      keyRules: [
        'Thai uses Subject-Verb-Object (SVO) word order, similar to English: "Phom kin khao" = "I eat rice"',
        `To make a sentence negative, add "mai" (\u0E44\u0E21\u0E48) before the verb: "Phom mai kin pla" = "I don't eat fish"`,
        'To ask a yes/no question, add "mai" (\u0E44\u0E2B\u0E21) at the end of a statement: "Khun kin khao mai?" = "Do you eat rice?"',
        'Politeness particles: men say "khrap" (\u0E04\u0E23\u0E31\u0E1A), women say "kha" (\u0E04\u0E48\u0E30/\u0E04\u0E23\u0E31\u0E1A) at the end of sentences',
        "There are no articles (a, an, the) and no plural forms in Thai",
        'Classifiers are used when counting nouns: "dog 3 animals" = "ma sam tua" (\u0E2B\u0E21\u0E32\u0E2A\u0E32\u0E21\u0E15\u0E31\u0E27)'
      ],
      examples: [
        { english: "I like Thai food.", structureExplanation: "Phom (I) + chob (like) + aahan Thai (Thai food). No conjugation needed!" },
        { english: "She does not speak English.", structureExplanation: "Khao (She) + mai (not) + phut (speak) + Angrit (English)." },
        { english: "Do you understand?", structureExplanation: 'Khun (you) + khao jai (understand) + mai (?) = "Khun khao jai mai?"' }
      ],
      quiz: [
        { id: "th-gr2-q1", question: "Thai sentence structure follows which word order?", options: ["Object-Subject-Verb", "Verb-Subject-Object", "Subject-Verb-Object (SVO)", "Object-Verb-Subject"], answerIndex: 2, explanation: "Thai uses SVO order like English: Phom (I) + kin (eat) + khao (rice) = I eat rice." },
        { id: "th-gr2-q2", question: 'To make a Thai sentence negative, you add "\u0E44\u0E21\u0E48 (Mai)" where?', options: ["At the end", "Before the noun", "Before the verb", "At the beginning"], answerIndex: 2, explanation: '"Mai" (\u0E44\u0E21\u0E48) is placed before the verb to negate it: "Mai kin" = "do not eat".' },
        { id: "th-gr2-q3", question: 'To turn a statement into a yes/no question in Thai, you add "\u0E44\u0E2B\u0E21 (Mai)" where?', options: ["At the beginning", "Before the verb", "After the subject", "At the end of the sentence"], answerIndex: 3, explanation: 'Question "mai" (\u0E44\u0E2B\u0E21) goes at the END of a statement to make it a yes/no question.' },
        { id: "th-gr2-q4", question: "Which politeness particle does a Thai man use at the end of sentences?", options: ["Kha (\u0E04\u0E48\u0E30)", "Khrap (\u0E04\u0E23\u0E31\u0E1A)", "Na (\u0E19\u0E30)", "Loei (\u0E40\u0E25\u0E22)"], answerIndex: 1, explanation: "Men use \u0E04\u0E23\u0E31\u0E1A (Khrap). Women use \u0E04\u0E48\u0E30/\u0E04\u0E23\u0E31\u0E1A (Kha). These are essential for polite Thai speech." },
        { id: "th-gr2-q5", question: "Does Thai have grammatical gender on nouns?", options: ["Yes, like French", "Yes, but only for animals", "No, Thai has no grammatical gender", "Only in formal writing"], answerIndex: 2, explanation: "Thai has NO grammatical gender on nouns \u2014 a major simplification compared to European languages." },
        { id: "th-gr2-q6", question: "Does Thai have plural forms for nouns?", options: ['Yes, add "-s" like English', "Yes, double the noun", "No, context or numbers indicate plurality", "Only for people"], answerIndex: 2, explanation: "Thai has NO plural forms. Plurality is shown through context or number + classifier." },
        { id: "th-gr2-q7", question: 'What is a "classifier" in Thai?', options: ["A grammar particle for questions", "A word used when counting specific types of nouns", "A word that adds formality", "A verb modifier"], answerIndex: 1, explanation: 'Classifiers are used with numbers + nouns. "Ma song tua" = two dogs. Tua is the classifier for animals.' },
        { id: "th-gr2-q8", question: '"Phom mai phut Angrit" translates to:', options: ["I speak English", "Do you speak English?", "I don't speak English", "He speaks English"], answerIndex: 2, explanation: `Phom = I, Mai = not, Phut = speak, Angrit = English. \u2192 "I don't speak English."` },
        { id: "th-gr2-q9", question: 'How do you say "Do you like Thai food?" in Thai structure?', options: ["Chob aahan Thai phom?", "Khun chob aahan Thai mai?", "Aahan Thai khun chob?", "Mai chob aahan Thai khun?"], answerIndex: 1, explanation: '"Khun Chob Aahan Thai Mai?" = Subject (Khun) + Verb (Chob) + Object (Aahan Thai) + Question particle (Mai?)' },
        { id: "th-gr2-q10", question: "In Thai, verb conjugation changes with:", options: ["Subject (I, you, he)", "Tense (past, present, future)", "Neither \u2014 Thai verbs do not conjugate", "Gender of the speaker"], answerIndex: 2, explanation: 'Thai verbs NEVER conjugate. "Kin" (eat) stays the same regardless of who is eating or when.' }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇰🇷  KOREAN — ADDITIONAL MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "korean-grammar-particles",
    category: "grammar",
    level: "beginner",
    targetLang: "korean",
    title: "Korean Grammar: Essential Particles (\uC870\uC0AC)",
    description: "Master Korean particles \u2014 the small words attached to nouns that tell you who does what in a sentence.",
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      explanation: "Korean is a Subject-Object-Verb (SOV) language, and particles (\uC870\uC0AC \u2014 Josa) are attached directly to nouns to mark their grammatical role. Unlike English prepositions, Korean particles come AFTER the noun. Mastering particles is the single most important step in Korean grammar.",
      keyRules: [
        '\uC740/\uB294 (Eun/Neun): Topic marker \u2014 highlights what the sentence is ABOUT. "Naneun haksaeng" = "I am a student" (As for me, I am a student)',
        "\uC774/\uAC00 (I/Ga): Subject marker \u2014 marks the grammatical SUBJECT performing an action",
        "\uC744/\uB97C (Eul/Reul): Object marker \u2014 marks the direct OBJECT receiving the action",
        '\uC5D0 (E): Location/direction marker \u2014 "where" something is or "where" you go to',
        '\uC5D0\uC11C (Eseo): Action location marker \u2014 "where" an action takes place',
        '\uC640/\uACFC or \uD558\uACE0 (Wa/Gwa / Hago): "And" conjunction \u2014 connects nouns (like English "and")'
      ],
      examples: [
        { english: "I eat rice.", structureExplanation: "Naneun (I-topic) + bap-eul (rice-object) + meokeoyo (eat). \u2192 \uB098\uB294 \uBC25\uC744 \uBA39\uC5B4\uC694." },
        { english: "I go to school.", structureExplanation: "Naneun (I-topic) + hakgyo-e (school-direction) + ga-yo (go). \u2192 \uB098\uB294 \uD559\uAD50\uC5D0 \uAC00\uC694." },
        { english: "I study at the library.", structureExplanation: "Naneun (I) + doseogwan-eseo (library-action location) + gongbu-haeyo (study). \u2192 \uB098\uB294 \uB3C4\uC11C\uAD00\uC5D0\uC11C \uACF5\uBD80\uD574\uC694." }
      ],
      quiz: [
        { id: "ko-gp-q1", question: "Korean sentence structure follows which word order?", options: ["SVO like English", "SOV \u2014 Subject-Object-Verb", "VSO", "OVS"], answerIndex: 1, explanation: 'Korean is SOV: "Naneun bap-eul meokeoyo" = I (S) rice (O) eat (V). The verb always comes LAST.' },
        { id: "ko-gp-q2", question: '"\uC740/\uB294 (Eun/Neun)" is used as:', options: ["The object marker", "The topic marker", "The location marker", "The possessive marker"], answerIndex: 1, explanation: 'Eun/Neun (\uC740/\uB294) marks the TOPIC of the sentence \u2014 what the sentence is "about".' },
        { id: "ko-gp-q3", question: '"\uC744/\uB97C (Eul/Reul)" marks the:', options: ["Subject", "Topic", "Direction", "Direct object"], answerIndex: 3, explanation: "Eul/Reul (\uC744/\uB97C) is the OBJECT particle \u2014 it marks what is receiving the action of the verb." },
        { id: "ko-gp-q4", question: '"\uC5D0 (E)" is used to show:', options: ["The person doing an action", 'Where an action takes place (like "in" for ongoing actions)', "Location/destination or direction", "Possession"], answerIndex: 2, explanation: '\uC5D0 (E) marks location or direction: "hakgyo-e ga-yo" = go TO school; "bang-e isseoyo" = is IN the room.' },
        { id: "ko-gp-q5", question: 'What is the difference between "\uC5D0 (E)" and "\uC5D0\uC11C (Eseo)"?', options: ["No difference", "E = static location/destination; Eseo = where an action happens", "E is formal; Eseo is informal", "E is for places; Eseo is for people"], answerIndex: 1, explanation: '"E" (\uC5D0) = where you ARE or GO TO. "Eseo" (\uC5D0\uC11C) = where an action HAPPENS: "doseogwan-eseo gongbu" = study AT the library.' },
        { id: "ko-gp-q6", question: 'How do you say "I eat rice" in Korean?', options: ["Bap-eul naneun meokeoyo", "Meokeoyo naneun bap-eul", "Naneun bap-eul meokeoyo", "Bap naneun meokeoyo-eul"], answerIndex: 2, explanation: "SOV order: Naneun (I-topic) + bap-eul (rice-object) + meokeoyo (eat). \u2192 \uB098\uB294 \uBC25\uC744 \uBA39\uC5B4\uC694." },
        { id: "ko-gp-q7", question: '"\uC774/\uAC00 (I/Ga)" marks the:', options: ["Topic", "Object", "Subject", "Time"], answerIndex: 2, explanation: "I/Ga (\uC774/\uAC00) is the SUBJECT marker \u2014 it marks who is doing the action. \uC774 after a consonant, \uAC00 after a vowel." },
        { id: "ko-gp-q8", question: 'To say "at school" (where action happens), you use:', options: ["\uD559\uAD50\uC5D0 (Hakgyo-e)", "\uD559\uAD50\uC5D0\uC11C (Hakgyo-eseo)", "\uD559\uAD50\uB97C (Hakgyo-reul)", "\uD559\uAD50\uB294 (Hakgyo-neun)"], answerIndex: 1, explanation: '"Hakgyo-eseo" (\uD559\uAD50\uC5D0\uC11C) = at school (where something is done). \uC5D0\uC11C marks the location of an action.' },
        { id: "ko-gp-q9", question: "Korean particles are placed:", options: ["Before the noun", "After the noun", "Before the verb", "At the start of the sentence"], answerIndex: 1, explanation: "Korean particles are always ATTACHED AFTER the noun they modify \u2014 this is opposite to English prepositions." },
        { id: "ko-gp-q10", question: '"\uD558\uACE0 (Hago)" is used to mean:', options: ["Because", "But", "And (connecting nouns)", "Or"], answerIndex: 2, explanation: '"Hago" (\uD558\uACE0) = And \u2014 used to connect nouns. "Bap hago kimchi" = rice and kimchi.' }
      ]
    }
  },
  {
    id: "korean-vocab-family",
    category: "vocabulary",
    level: "beginner",
    targetLang: "korean",
    title: "Korean Vocabulary: Family Members & Relationships",
    description: "Learn Korean family terms \u2014 which are unique because they differ depending on whether YOU are male or female.",
    xpReward: 190,
    estimatedMinutes: 11,
    content: {
      introduction: "Korean family vocabulary is fascinating because many terms differ depending on YOUR gender and whether you are speaking TO the person or ABOUT them. This reflects Korea's deeply Confucian family hierarchy. Learning these terms will help you understand K-dramas much better!",
      words: [
        { word: "\uC544\uBC84\uC9C0 / \uC544\uBE60 (Abeoji / Appa)", partOfSpeech: "noun", definition: "Father (formal) / Dad (informal) \u2014 formal used in polite speech, appa is the affectionate everyday term.", englishExample: "Abeoji, annyeonghaseyo \u2014 Hello, Father." },
        { word: "\uC5B4\uBA38\uB2C8 / \uC5C4\uB9C8 (Eomeoni / Eomma)", partOfSpeech: "noun", definition: "Mother (formal) / Mom (informal) \u2014 eomma is the warm, everyday word for mom.", englishExample: "Eomma, bap meogeoyo! \u2014 Mom, let's eat!" },
        { word: "\uD615 / \uC624\uBE60 (Hyeong / Oppa)", partOfSpeech: "noun", definition: "Older brother \u2014 Hyeong used by males, Oppa used by females when addressing an older male.", englishExample: "Hyeong, gati ga-ja \u2014 Bro, let's go together." },
        { word: "\uB204\uB098 / \uC5B8\uB2C8 (Nuna / Eonni)", partOfSpeech: "noun", definition: "Older sister \u2014 Nuna used by males, Eonni used by females when addressing an older female.", englishExample: "Nuna, bab meokeoyo \u2014 Nuna, come eat." },
        { word: "\uB0A8\uB3D9\uC0DD / \uC5EC\uB3D9\uC0DD (Namdongsaeng / Yeodongsaeng)", partOfSpeech: "noun", definition: "Younger brother / Younger sister \u2014 dongsaeng means younger sibling, nam=male, yeo=female.", englishExample: "Nae namdongsaeng eun yeoseol sal \u2014 My younger brother is 6 years old." },
        { word: "\uD560\uBA38\uB2C8 / \uD560\uC544\uBC84\uC9C0 (Halmeoni / Harabeoji)", partOfSpeech: "noun", definition: "Grandmother / Grandfather \u2014 respectful terms for grandparents.", englishExample: "Halmeoni, annyeonghaseyo \u2014 Hello, Grandmother." },
        { word: "\uB0A8\uC790\uCE5C\uAD6C / \uC5EC\uC790\uCE5C\uAD6C (Namjachingu / Yeojachingu)", partOfSpeech: "noun", definition: "Boyfriend / Girlfriend \u2014 Nam-ja = male, Yeo-ja = female, Chingu = friend.", englishExample: "Nae namjachingu-neun K-pop star \u2014 My boyfriend is a K-pop star." },
        { word: "\uAC00\uC871 (Gajok)", partOfSpeech: "noun", definition: "Family \u2014 the collective word for family, deeply central to Korean culture.", englishExample: "Uri gajok-eun daseot myeong \u2014 Our family has five people." }
      ],
      quiz: [
        { id: "ko-fm-q1", question: '"\uC544\uBE60 (Appa)" means:', options: ["Grandfather", "Uncle", "Dad (informal)", "Older brother"], answerIndex: 2, explanation: "\uC544\uBE60 (Appa) is the informal, affectionate word for Dad. \uC544\uBC84\uC9C0 (Abeoji) is the formal version." },
        { id: "ko-fm-q2", question: "A FEMALE speaker would call her older brother:", options: ["Hyeong (\uD615)", "Nuna (\uB204\uB098)", "Eonni (\uC5B8\uB2C8)", "Oppa (\uC624\uBE60)"], answerIndex: 3, explanation: "Oppa (\uC624\uBE60) is used by FEMALES to refer to an older male (brother, or close older male friend/partner)." },
        { id: "ko-fm-q3", question: "A MALE speaker would call his older sister:", options: ["Eonni (\uC5B8\uB2C8)", "Nuna (\uB204\uB098)", "Oppa (\uC624\uBE60)", "Hyeong (\uD615)"], answerIndex: 1, explanation: "Nuna (\uB204\uB098) is used by MALES to refer to an older female (sister or close older female friend)." },
        { id: "ko-fm-q4", question: '"\uC5EC\uB3D9\uC0DD (Yeodongsaeng)" means:', options: ["Younger brother", "Older sister", "Younger sister", "Older brother"], answerIndex: 2, explanation: "Yeo (\uC5EC) = female. Dongsaeng = younger sibling. So Yeodongsaeng = younger sister." },
        { id: "ko-fm-q5", question: '"\uD560\uBA38\uB2C8 (Halmeoni)" means:', options: ["Aunt", "Mother", "Grandmother", "Older sister"], answerIndex: 2, explanation: "\uD560\uBA38\uB2C8 (Halmeoni) = Grandmother. \uD560\uC544\uBC84\uC9C0 (Harabeoji) = Grandfather." },
        { id: "ko-fm-q6", question: '"\uAC00\uC871 (Gajok)" means:', options: ["Home", "Neighborhood", "Family", "Relatives"], answerIndex: 2, explanation: "\uAC00\uC871 (Gajok) = Family \u2014 a deeply important concept in Korean Confucian culture." },
        { id: "ko-fm-q7", question: "In Korean, many family terms differ based on:", options: ["Age only", "The speaker's gender and relationship", "Whether the person is married", "The region of Korea"], answerIndex: 1, explanation: "Korean family terms change based on YOUR gender (speaker) and the relationship \u2014 a key feature of Korean social hierarchy." },
        { id: "ko-fm-q8", question: '"\uB0A8\uC790\uCE5C\uAD6C (Namjachingu)" means:', options: ["Male friend (general)", "Boyfriend", "Husband", "Brother"], answerIndex: 1, explanation: "Nam-ja (\uB0A8\uC790) = male/man. Chingu (\uCE5C\uAD6C) = friend. Together = Boyfriend." },
        { id: "ko-fm-q9", question: '"\uC5C4\uB9C8 (Eomma)" is:', options: ["The formal word for mother", "The informal/affectionate word for mom", "The word for grandmother", "Used only by adults"], answerIndex: 1, explanation: "\uC5C4\uB9C8 (Eomma) is the warm, everyday word for Mom. \uC5B4\uBA38\uB2C8 (Eomeoni) is the formal version." },
        { id: "ko-fm-q10", question: '"\uD615 (Hyeong)" is used by a MALE speaker to refer to:', options: ["Younger brother", "Older brother", "Father", "Friend"], answerIndex: 1, explanation: "\uD615 (Hyeong) is used EXCLUSIVELY by males to refer to their older brother or close older male friend." }
      ]
    }
  },
  {
    id: "korean-vocab-emotions",
    category: "vocabulary",
    level: "intermediate",
    targetLang: "korean",
    title: "Korean Vocabulary: K-Drama Emotions & Expressions",
    description: "Learn the rich emotional vocabulary from K-dramas \u2014 expressions of love, heartbreak, anger, and joy used in everyday Korean.",
    xpReward: 230,
    estimatedMinutes: 13,
    content: {
      introduction: "K-dramas are famous for their emotional intensity and dramatic expressions. The good news is that most of these emotional phrases are real, everyday Korean! From confessing love to expressing frustration, this lesson covers the emotional vocabulary that K-drama fans already recognize.",
      words: [
        { word: "\uC0AC\uB791\uD574 (Saranghae)", partOfSpeech: "phrase", definition: "I love you (informal) \u2014 the most famous Korean phrase, used with close family and romantic partners.", englishExample: "Saranghae! \u2014 I love you! (used between lovers or family)" },
        { word: "\uBCF4\uACE0 \uC2F6\uC5B4 (Bogo Sipeo)", partOfSpeech: "phrase", definition: 'I miss you \u2014 literally "I want to see you", one of the most commonly heard K-drama phrases.', englishExample: "Bogo sipeo, jagiya \u2014 I miss you, sweetheart." },
        { word: "\uBBF8\uC548\uD574 (Mianhae)", partOfSpeech: "phrase", definition: "I'm sorry (informal) \u2014 the casual apology used with friends and family in K-dramas.", englishExample: "Mianhae, nae jalit-ya \u2014 I'm sorry, it's my fault." },
        { word: "\uD589\uBCF5\uD574 (Haengbokhae)", partOfSpeech: "adjective", definition: "I am happy \u2014 expressing personal happiness, a core emotion word.", englishExample: "Neol man-na-seo haengbokhae \u2014 I'm happy that I met you." },
        { word: "\uC2AC\uD37C (Seulpeo)", partOfSpeech: "adjective", definition: "I am sad \u2014 the most common word for sadness in Korean.", englishExample: "Wae irae? Seulpeo? \u2014 Why are you like this? Are you sad?" },
        { word: "\uD654\uB0AC\uC5B4 (Hwanasseo)", partOfSpeech: "phrase", definition: "I am angry \u2014 used to express frustration or anger, very common in K-drama conflict scenes.", englishExample: "Nae-ga hwa-nasseo! \u2014 I am angry!" },
        { word: "\uC124\uB808\uB2E4 (Seolleda)", partOfSpeech: "verb", definition: "To feel excited/fluttery \u2014 the unique Korean word for the excited, fluttery feeling of a new crush or anticipation.", englishExample: "Neol bolttae maeum-i seolleo \u2014 My heart flutters when I see you." },
        { word: "\uC678\uB85C\uC6CC (Oeorowo)", partOfSpeech: "adjective", definition: "I am lonely \u2014 expressing loneliness, a deeply resonant emotion in K-drama storytelling.", englishExample: "Honja isseo-seo oeorowo \u2014 I'm lonely because I'm alone." }
      ],
      quiz: [
        { id: "ko-em-q1", question: '"\uC0AC\uB791\uD574 (Saranghae)" means:', options: ["I miss you", "I'm sorry", "I love you (informal)", "Thank you"], answerIndex: 2, explanation: "\uC0AC\uB791\uD574 (Saranghae) = I love you \u2014 informal, used between close people. \uC0AC\uB791\uD569\uB2C8\uB2E4 is the formal version." },
        { id: "ko-em-q2", question: '"\uBCF4\uACE0 \uC2F6\uC5B4 (Bogo Sipeo)" literally means:', options: ["I want to talk to you", "I want to see you (= I miss you)", "I am looking for you", "I think about you"], answerIndex: 1, explanation: 'Bogo (\uBCF4\uACE0) = see + Sipeo (\uC2F6\uC5B4) = want to. "I want to see you" = I miss you in Korean.' },
        { id: "ko-em-q3", question: '"\uBBF8\uC548\uD574 (Mianhae)" is:', options: ["A formal apology", `An informal "I'm sorry" used with close people`, "A way to say excuse me to strangers", "A way to say thank you"], answerIndex: 1, explanation: "\uBBF8\uC548\uD574 (Mianhae) is the informal apology. \uC8C4\uC1A1\uD569\uB2C8\uB2E4 (Joesonghamnida) is the formal, sincere apology." },
        { id: "ko-em-q4", question: "Which word describes the fluttery, excited feeling of a new crush?", options: ["\uD589\uBCF5\uD574 (Haengbokhae)", "\uC124\uB808\uB2E4 (Seolleda)", "\uC0AC\uB791\uD574 (Saranghae)", "\uC678\uB85C\uC6CC (Oeorowo)"], answerIndex: 1, explanation: "\uC124\uB808\uB2E4 (Seolleda) is a uniquely Korean word for the heart-fluttering excitement of anticipation or a new crush." },
        { id: "ko-em-q5", question: '"\uC2AC\uD37C (Seulpeo)" means:', options: ["Angry", "Lonely", "Sad", "Nervous"], answerIndex: 2, explanation: "\uC2AC\uD37C (Seulpeo) = Sad. Used when expressing sadness or empathizing with someone who is sad." },
        { id: "ko-em-q6", question: '"\uD589\uBCF5\uD574 (Haengbokhae)" means:', options: ["I am happy", "I am tired", "I am excited", "I am grateful"], answerIndex: 0, explanation: "\uD589\uBCF5\uD574 (Haengbokhae) = I am happy. \uD589\uBCF5 (Haengbok) = happiness." },
        { id: "ko-em-q7", question: '"\uD654\uB0AC\uC5B4 (Hwanasseo)" expresses:', options: ["Happiness", "Anger", "Surprise", "Sadness"], answerIndex: 1, explanation: "\uD654\uB0AC\uC5B4 (Hwanasseo) = I am angry. \uD654 (Hwa) = anger. Common in K-drama conflict scenes." },
        { id: "ko-em-q8", question: '"\uC678\uB85C\uC6CC (Oeorowo)" means:', options: ["I am bored", "I am lonely", "I am tired", "I am confused"], answerIndex: 1, explanation: "\uC678\uB85C\uC6CC (Oeorowo) = I am lonely. \uC678\uB85C\uC6C0 (Oerouem) = loneliness \u2014 a very common K-drama theme." },
        { id: "ko-em-q9", question: 'The informal "I love you" in Korean is:', options: ["\uC0AC\uB791\uD569\uB2C8\uB2E4 (Saranghamnida)", "\uC0AC\uB791\uD574 (Saranghae)", "\uC88B\uC544\uD574 (Joahae)", "\uBCF4\uACE0 \uC2F6\uC5B4 (Bogo Sipeo)"], answerIndex: 1, explanation: '\uC0AC\uB791\uD574 (Saranghae) is informal. \uC0AC\uB791\uD569\uB2C8\uB2E4 is formal. \uC88B\uC544\uD574 means "I like you" (a step before love).' },
        { id: "ko-em-q10", question: "Before saying \uC0AC\uB791\uD574 (Saranghae), Koreans might first say:", options: ["\uBBF8\uC548\uD574 (Mianhae)", "\uD589\uBCF5\uD574 (Haengbokhae)", "\uC88B\uC544\uD574 (Joahae \u2014 I like you)", "\uD654\uB0AC\uC5B4 (Hwanasseo)"], answerIndex: 2, explanation: "\uC88B\uC544\uD574 (Joahae) = I like you \u2014 the step before confessing \uC0AC\uB791\uD574 (I love you) in Korean dating culture." }
      ]
    }
  },
  {
    id: "korean-conv-hospital",
    category: "conversation",
    level: "intermediate",
    targetLang: "korean",
    title: "Korean Conversations: At the Hospital (\uBCD1\uC6D0)",
    description: "Learn essential Korean medical vocabulary and practice hospital conversations for describing symptoms and getting help.",
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      context: "You are feeling unwell in Seoul and visit a local clinic (\uBCD1\uC6D0 \u2014 Byeongwon). The receptionist registers you and the doctor examines you. This dialogue covers essential medical Korean for describing symptoms, understanding diagnoses, and getting prescriptions.",
      speakerNames: ["Doctor/Receptionist (\uC758\uC0AC/\uC811\uC218)", "Patient (\uD658\uC790)"],
      transcript: [
        { speaker: "Receptionist (\uC811\uC218)", text: "Annyeonghaseyo! Yeoyak-i isseoyo? (Hello! Do you have an appointment?)" },
        { speaker: "Patient (\uD658\uC790)", text: "Aniyo, yeoyak-eun eopseoyo. Momi an joeayo. (No, I don't have an appointment. I don't feel well.)" },
        { speaker: "Receptionist (\uC811\uC218)", text: "Eotdeun-ga deuryeolkkayo? Ireumi mwoeyo? (What seems to be the problem? What is your name?)" },
        { speaker: "Patient (\uD658\uC790)", text: "Gideungi apa-yo. Yeollo isseo-yo. (My throat hurts. I have a fever.)" },
        { speaker: "Doctor (\uC758\uC0AC)", text: "Eotge dwaesseo-yo? Eonje buteo apa-yo? (How did this happen? Since when have you been in pain?)" },
        { speaker: "Patient (\uD658\uC790)", text: "Eo-je buteo apa-sseoyo. Ipmaeg-do eopta-go bae-do apa-yo. (It started yesterday. I also have no appetite and my stomach hurts.)" },
        { speaker: "Doctor (\uC758\uC0AC)", text: "Gamgi-ye-yo. Yak-eul cheobang-hae deurigeyo. Haru se beon deuseyo. (It's a cold. I will prescribe some medicine. Take it 3 times a day.)" },
        { speaker: "Patient (\uD658\uC790)", text: "Gamsahamnida! Eolmana janya-ji-nayo? (Thank you! How long will it take to get better?)" }
      ],
      quiz: [
        { id: "ko-hp-q1", question: '"\uBCD1\uC6D0 (Byeongwon)" means:', options: ["Pharmacy", "Hospital / Clinic", "Health center", "Emergency room only"], answerIndex: 1, explanation: "\uBCD1\uC6D0 (Byeongwon) = Hospital or clinic. \uC57D\uAD6D (Yakguk) = Pharmacy." },
        { id: "ko-hp-q2", question: '"\uBAB8\uC774 \uC548 \uC88B\uC544\uC694 (Momi an joeayo)" means:', options: ["My body is strong", "I feel great", "I don't feel well", "I have an allergy"], answerIndex: 2, explanation: `"Momi An Joeayo" = I don't feel well/I'm not feeling good. Momi = body, An = not, Joeayo = good.` },
        { id: "ko-hp-q3", question: '"\uAE30\uB369\uC774 \uC544\uD30C\uC694 (Gideungi Apa-yo)" means:', options: ["My head hurts", "My stomach hurts", "My throat hurts", "My leg hurts"], answerIndex: 2, explanation: "\uAE30\uB369\uC774 (Gideungi) = Throat. \uC544\uD30C\uC694 (Apa-yo) = hurts/is in pain. \u2192 My throat hurts." },
        { id: "ko-hp-q4", question: '"\uC5F4\uC774 \uC788\uC5B4\uC694 (Yeollo Isseo-yo)" means:', options: ["I have a cough", "I have a fever", "I have a headache", "I feel dizzy"], answerIndex: 1, explanation: "\uC5F4 (Yeol) = Fever/heat. \uC788\uC5B4\uC694 = I have. \u2192 I have a fever." },
        { id: "ko-hp-q5", question: '"\uC5B4\uC81C\uBD80\uD130 \uC544\uD320\uC5B4\uC694 (Eolje Buteo Apa-sseoyo)" means:', options: ["I've been sick for a week", "It hurts only sometimes", "The pain started yesterday", "I've always had this pain"], answerIndex: 2, explanation: '\uC5B4\uC81C (Eolje) = Yesterday. \uBD80\uD130 (Buteo) = Since/from. \u2192 "It started hurting since yesterday."' },
        { id: "ko-hp-q6", question: '"\uAC10\uAE30\uC608\uC694 (Gamgi-ye-yo)" means:', options: ["It's serious", "It's an allergy", "It's a cold", "You need surgery"], answerIndex: 2, explanation: "\uAC10\uAE30 (Gamgi) = Cold (illness). \uAC10\uAE30\uC608\uC694 = It's a cold. \uB3C5\uAC10 (Dokgam) = Flu." },
        { id: "ko-hp-q7", question: '"\uC57D\uC744 \uCC98\uBC29\uD574 \uB4DC\uB9AC\uAC8C\uC694 (Yak-eul Cheobang-hae Deurigeyo)" means:', options: ["You need to rest", "I'll prescribe medicine for you", "Take this pill now", "Go to the pharmacy first"], answerIndex: 1, explanation: '\uC57D (Yak) = Medicine/pills. \uCC98\uBC29\uD558\uB2E4 (Cheobang-hada) = To prescribe. \u2192 "I will prescribe medicine."' },
        { id: "ko-hp-q8", question: '"\uD558\uB8E8 \uC138 \uBC88 (Haru Se Beon)" means:', options: ["Once a day", "Twice a day", "Three times a day", "Every 8 hours"], answerIndex: 2, explanation: "\uD558\uB8E8 = One day. \uC138 = Three. \uBC88 = Times. \u2192 Three times a day." },
        { id: "ko-hp-q9", question: '"\uC608\uC57D (Yeoyak)" means:', options: ["Insurance", "Appointment / Reservation", "Payment", "Medical record"], answerIndex: 1, explanation: "\uC608\uC57D (Yeoyak) = Appointment or reservation \u2014 used for both medical appointments and restaurant bookings." },
        { id: "ko-hp-q10", question: `How do you say "I don't have an appetite" in Korean?`, options: ["Bae apa-yo", "Ipmaeg-i eopsseoyo", "Meogeun-go sipeo-yo", "Sokyi an joeayo"], answerIndex: 1, explanation: "\uC785\uB9DB\uC774 \uC5C6\uC5B4\uC694 (Ipmaeg-i Eopsseoyo) = I have no appetite. Ipmaeg = appetite, Eopsseoyo = don't have." }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇯🇵  JAPANESE — ADDITIONAL MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "japanese-grammar-verbs",
    category: "grammar",
    level: "beginner",
    targetLang: "japanese",
    title: "Japanese Grammar: Verb Forms (\u307E\u3059/\u3067\u3059)",
    description: "Learn the polite -masu and -desu verb forms that are the foundation of all polite Japanese conversation.",
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      explanation: "Japanese has two main politeness levels \u2014 polite (\u4E01\u5BE7\u8A9E \u2014 Teinei-go) and plain/casual. All beginners should learn polite speech first. The two most important endings are: \uFF5E\u307E\u3059 (-masu) for verbs and \uFF5E\u3067\u3059 (-desu) for nouns and adjectives. This lesson covers how to use them correctly.",
      keyRules: [
        '\u307E\u3059 (-masu): The polite present/future verb form. "Tabemasu" = I eat / I will eat',
        `\u307E\u305B\u3093 (-masen): The polite NEGATIVE verb form. "Tabemasen" = I don't eat / I won't eat`,
        '\u307E\u3057\u305F (-mashita): The polite PAST verb form. "Tabemashita" = I ate',
        `\u307E\u305B\u3093\u3067\u3057\u305F (-masen deshita): The polite NEGATIVE PAST. "Tabemasen deshita" = I didn't eat`,
        '\u3067\u3059 (-desu): Polite copula for nouns/adjectives. "Gakusei desu" = I am a student',
        '\u3067\u306F/\u3058\u3083\u3042\u308A\u307E\u305B\u3093 (-de wa arimasen): Negative of desu. "Gakusei de wa arimasen" = I am not a student'
      ],
      examples: [
        { english: "I eat sushi every day.", structureExplanation: "Mainichi (everyday) + sushi-o (sushi-object) + tabemasu (eat-polite). \u2192 \u6BCE\u65E5\u3059\u3057\u3092\u98DF\u3079\u307E\u3059." },
        { english: "I did not go to school yesterday.", structureExplanation: "Kin\u014D (yesterday) + gakk\u014D-ni (school-direction) + ikimasen deshita (did not go). \u2192 \u6628\u65E5\u5B66\u6821\u306B\u884C\u304D\u307E\u305B\u3093\u3067\u3057\u305F." },
        { english: "This is a book.", structureExplanation: "Kore-wa (this-topic) + hon (book) + desu (is). \u2192 \u3053\u308C\u306F\u672C\u3067\u3059." }
      ],
      quiz: [
        { id: "ja-gv-q1", question: "The polite present tense verb ending in Japanese is:", options: ["-te", "-masu", "-nai", "-ta"], answerIndex: 1, explanation: '\uFF5E\u307E\u3059 (-masu) is the polite present/future verb form. "Ikimasu" = I go / I will go.' },
        { id: "ja-gv-q2", question: '"\u98DF\u3079\u307E\u305B\u3093 (Tabemasen)" means:', options: ["I ate", "I eat", "I don't eat / I won't eat", "I am eating"], answerIndex: 2, explanation: "Tabemasen (\u98DF\u3079\u307E\u305B\u3093) = The polite NEGATIVE present/future. \uFF5E\u307E\u305B\u3093 = don't/won't + verb." },
        { id: "ja-gv-q3", question: '"\u884C\u304D\u307E\u3057\u305F (Ikimashita)" is the:', options: ["Present positive", "Present negative", "Past positive", "Past negative"], answerIndex: 2, explanation: "\uFF5E\u307E\u3057\u305F (-mashita) is the polite PAST POSITIVE form. Ikimashita = I went." },
        { id: "ja-gv-q4", question: '"\u3067\u3059 (Desu)" is used after:', options: ["Verbs only", "Nouns and adjectives", "Question words only", "Numbers only"], answerIndex: 1, explanation: '\u3067\u3059 (Desu) follows NOUNS and ADJECTIVES to make polite statements: "Gakusei desu" = I am a student.' },
        { id: "ja-gv-q5", question: '"\u5B66\u751F\u3067\u306F\u3042\u308A\u307E\u305B\u3093 (Gakusei de wa arimasen)" means:', options: ["I am a student", "Are you a student?", "I am not a student", "He was a student"], answerIndex: 2, explanation: "\u3067\u306F/\u3058\u3083\u3042\u308A\u307E\u305B\u3093 = negative of \u3067\u3059. Gakusei de wa arimasen = I am NOT a student." },
        { id: "ja-gv-q6", question: "Japanese sentence structure is:", options: ["SVO like English", "SOV \u2014 the verb always comes LAST", "VSO", "Flexible \u2014 any order"], answerIndex: 1, explanation: 'Japanese is SOV: "Watashi-wa sushi-o tabemasu" = I (S) sushi (O) eat (V). The verb always ends the sentence.' },
        { id: "ja-gv-q7", question: 'How do you say "I did not eat" politely in Japanese?', options: ["Tabemasu", "Tabemasen", "Tabemashita", "Tabemasen deshita"], answerIndex: 3, explanation: "Tabemasen deshita (\u98DF\u3079\u307E\u305B\u3093\u3067\u3057\u305F) = I did not eat. \uFF5E\u307E\u305B\u3093\u3067\u3057\u305F = polite negative PAST." },
        { id: "ja-gv-q8", question: '"\u6BCE\u65E5 (Mainichi)" means:', options: ["Yesterday", "Tomorrow", "Every day", "Last week"], answerIndex: 2, explanation: "\u6BCE\u65E5 (Mainichi) = Every day. \u6BCE (Mai) = every, \u65E5 (Nichi) = day." },
        { id: "ja-gv-q9", question: 'The topic marker "\u306F (Wa)" is used to:', options: ["Mark the object", "Mark the subject", "Mark the topic of the sentence", "Show direction"], answerIndex: 2, explanation: '\u306F (Wa) marks the TOPIC \u2014 what the sentence is about. "Watashi-wa" = As for me / Speaking of me.' },
        { id: "ja-gv-q10", question: '"\u3053\u308C\u306F\u672C\u3067\u3059 (Kore-wa hon desu)" means:', options: ["Is this a book?", "This is not a book", "This is a book", "I read books"], answerIndex: 2, explanation: 'Kore-wa (this-topic) + hon (book) + desu (is/am/are) = "This is a book."' }
      ]
    }
  },
  {
    id: "japanese-conv-shopping",
    category: "conversation",
    level: "beginner",
    targetLang: "japanese",
    title: "Japanese Conversations: Shopping (\u8CB7\u3044\u7269)",
    description: "Practice Japanese shopping dialogues \u2014 finding sizes, asking prices, trying on clothes, and making purchases.",
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: "You are shopping at a popular Japanese clothing store (\u670D\u5C4B \u2014 Fukuya) in Harajuku, Tokyo. You want to buy a blue jacket and need help finding your size. This dialogue covers essential Japanese retail shopping vocabulary.",
      speakerNames: ["Staff (\u5E97\u54E1)", "Customer (\u304A\u5BA2\u69D8)"],
      transcript: [
        { speaker: "Staff (\u5E97\u54E1)", text: "Irasshaimase! Nanika o osagashi desu ka? (Welcome! Are you looking for something?)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Hai, ano aoi jaketto o mite iru n desu ga. (Yes, I'm looking at that blue jacket over there.)" },
        { speaker: "Staff (\u5E97\u54E1)", text: "Saizu wa dono kurai desu ka? (What size would you like?)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Futsuu saizu desu. Shichaku dekimasu ka? (Medium size please. Can I try it on?)" },
        { speaker: "Staff (\u5E97\u54E1)", text: "Mochiron desu! Shichakushitsu wa asoko desu. (Of course! The fitting room is over there.)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Kore, totemo ii desu ne! Ikura desu ka? (This is really nice! How much is it?)" },
        { speaker: "Staff (\u5E97\u54E1)", text: "Go-sen en de gozaimasu. Okaikei wa kashira de yoroshii desu ka? (It's 5,000 yen. Will cash payment be okay?)" },
        { speaker: "Customer (\u304A\u5BA2\u69D8)", text: "Hai, daijoubu desu. Kurejitto kaado mo tsukaemasuka? (Yes, that's fine. Can I also use a credit card?)" }
      ],
      quiz: [
        { id: "ja-sh-q1", question: '"\u8CB7\u3044\u7269 (Kaimono)" means:', options: ["Cooking", "Shopping", "Cooking shopping", "Restaurant"], answerIndex: 1, explanation: "\u8CB7\u3044\u7269 (Kaimono) = Shopping. \u8CB7\u3046 (Kau) = to buy, \u7269 (Mono) = thing/stuff." },
        { id: "ja-sh-q2", question: '"\u4F55\u304B\u304A\u63A2\u3057\u3067\u3059\u304B? (Nanika o osagashi desu ka?)" means:', options: ["Can I help you pay?", "Are you looking for something?", "What is your size?", "Would you like a bag?"], answerIndex: 1, explanation: '"Nanika o Osagashi Desu Ka?" = "Are you looking for something?" \u2014 the standard Japanese retail greeting.' },
        { id: "ja-sh-q3", question: '"\u8A66\u7740\u3067\u304D\u307E\u3059\u304B? (Shichaku Dekimasu Ka?)" means:', options: ["Can I return this?", "Is this my size?", "Can I try this on?", "Is there a discount?"], answerIndex: 2, explanation: '\u8A66\u7740 (Shichaku) = Trying on clothes. \u3067\u304D\u307E\u3059\u304B = Can I/Is it possible? \u2192 "Can I try this on?"' },
        { id: "ja-sh-q4", question: '"\u8A66\u7740\u5BA4 (Shichakushitsu)" is:', options: ["Cash register", "Storage room", "Fitting/changing room", "Staff room"], answerIndex: 2, explanation: "\u8A66\u7740\u5BA4 (Shichakushitsu) = Fitting room / Changing room \u2014 \u8A66\u7740 (try on) + \u5BA4 (room)." },
        { id: "ja-sh-q5", question: '"\u666E\u901A\u30B5\u30A4\u30BA (Futsuu Saizu)" means:', options: ["Large size", "Small size", "Extra large", "Medium size"], answerIndex: 3, explanation: "\u666E\u901A (Futsuu) = Normal/ordinary = Medium size. Small = \u5C0F (Shou), Large = \u5927 (Dai)." },
        { id: "ja-sh-q6", question: '"5,000\u5186 (Go-sen En)" is:', options: ["500 yen", "5,000 yen", "50,000 yen", "5 yen"], answerIndex: 1, explanation: "Go (\u4E94) = 5, Sen (\u5343) = 1,000, En (\u5186) = Yen. \u4E94\u5343\u5186 = 5,000 Yen." },
        { id: "ja-sh-q7", question: '"\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9 (Kurejitto Kaado)" is:', options: ["Cash", "Gift card", "Credit card", "Receipt"], answerIndex: 2, explanation: '\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9 is the Japanese katakana loanword for "credit card" (from English).' },
        { id: "ja-sh-q8", question: '"\u3082\u3061\u308D\u3093\u3067\u3059 (Mochiron Desu)" means:', options: ["I'm not sure", "No problem", "Of course!", "Please wait"], answerIndex: 2, explanation: "\u3082\u3061\u308D\u3093\u3067\u3059 (Mochiron Desu) = Of course! \u2014 an enthusiastic confirmation." },
        { id: "ja-sh-q9", question: '"\u9752\u3044 (Aoi)" means which color?', options: ["Red", "Green", "Yellow", "Blue"], answerIndex: 3, explanation: "\u9752\u3044 (Aoi) = Blue. \u8D64\u3044 (Akai) = Red. \u7DD1 (Midori) = Green. \u9EC4\u8272\u3044 (Kiiroi) = Yellow." },
        { id: "ja-sh-q10", question: `Japan's currency, the "\u5186 (En)", is also known in English as:`, options: ["Won", "Yuan", "Yen", "Bath"], answerIndex: 2, explanation: `\u5186 (En) is romanized and known internationally as "Yen" \u2014 Japan's official currency.` }
      ]
    }
  },
  {
    id: "japanese-vocab-katakana",
    category: "vocabulary",
    level: "beginner",
    targetLang: "japanese",
    title: "Japanese Vocabulary: Katakana Loanwords",
    description: "Discover how English and foreign words are adapted into Japanese Katakana \u2014 and instantly expand your Japanese vocabulary!",
    xpReward: 200,
    estimatedMinutes: 11,
    content: {
      introduction: "Katakana (\u30AB\u30BF\u30AB\u30CA) is the Japanese syllabic alphabet used primarily for loanwords from foreign languages \u2014 especially English. The amazing secret: if you know English, you already know THOUSANDS of Japanese words! They just sound a bit different due to Japanese phonology. This lesson teaches the pattern.",
      words: [
        { word: "\u30B3\u30FC\u30D2\u30FC (Koohii)", partOfSpeech: "noun", definition: `Coffee \u2014 from English "coffee". One of Japan's most loved beverages.`, englishExample: "Koohii o kudasai \u2014 Please give me a coffee." },
        { word: "\u30EC\u30B9\u30C8\u30E9\u30F3 (Resutoran)", partOfSpeech: "noun", definition: 'Restaurant \u2014 from French "restaurant", used in Japanese for Western-style restaurants.', englishExample: "Ii resutoran o shitte imasu ka? \u2014 Do you know a good restaurant?" },
        { word: "\u30B9\u30DE\u30DB (Sumaho)", partOfSpeech: "noun", definition: 'Smartphone \u2014 shortened from "sumaato fon" (smart phone). Japanese loves abbreviating loanwords!', englishExample: "Sumaho no juuden ga kireta \u2014 My smartphone battery died." },
        { word: "\u30A2\u30A4\u30B9\u30AF\u30EA\u30FC\u30E0 (Aisu Kuriimu)", partOfSpeech: "noun", definition: 'Ice cream \u2014 from English "ice cream". A hugely popular treat across Japan.', englishExample: "Aisu kuriimu wa nani ga suki desu ka? \u2014 What flavor of ice cream do you like?" },
        { word: "\u30D1\u30B9\u30DD\u30FC\u30C8 (Pasupooto)", partOfSpeech: "noun", definition: 'Passport \u2014 from English "passport". Essential travel vocabulary in Katakana.', englishExample: "Pasupooto o misete kudasai \u2014 Please show me your passport." },
        { word: "\u30A8\u30A2\u30B3\u30F3 (Eakon)", partOfSpeech: "noun", definition: 'Air conditioner \u2014 shortened from "air conditioner". Abbreviated loanwords are called "wasei-eigo".', englishExample: "Eakon o tsukete kudasai \u2014 Please turn on the air conditioner." },
        { word: "\u30C7\u30D1\u30FC\u30C8 (Depaato)", partOfSpeech: "noun", definition: 'Department store \u2014 from "department" store. Japanese abbreviated it to "depaato".', englishExample: "Depaato de kaimono shita \u2014 I shopped at the department store." },
        { word: "\u30B2\u30FC\u30E0 (Geemu)", partOfSpeech: "noun", definition: `Game \u2014 from English "game". Japan is the world's leading video game country, so this word is everywhere.`, englishExample: "Geemu o shite mo ii desu ka? \u2014 Is it okay to play games?" }
      ],
      quiz: [
        { id: "ja-kt-q1", question: '"\u30B3\u30FC\u30D2\u30FC (Koohii)" comes from which English word?', options: ["Cookie", "Copy", "Coffee", "Cocoa"], answerIndex: 2, explanation: '\u30B3\u30FC\u30D2\u30FC (Koohii) is the Japanese Katakana rendering of "coffee".' },
        { id: "ja-kt-q2", question: "Katakana (\u30AB\u30BF\u30AB\u30CA) is primarily used for:", options: ["Japanese native words", "Grammar particles", "Loanwords from foreign languages", "Formal writing"], answerIndex: 2, explanation: "Katakana is used for foreign loanwords, foreign names, and some technical/scientific terms." },
        { id: "ja-kt-q3", question: '"\u30B9\u30DE\u30DB (Sumaho)" is a shortened form of:', options: ["Sumaato Fon (Smartphone)", "Smart Machine", "Sumaho (original Japanese word)", "Samsung Mobile"], answerIndex: 0, explanation: 'Sumaho (\u30B9\u30DE\u30DB) = shortened from "Sumaato Fon" (\u30B9\u30DE\u30FC\u30C8\u30D5\u30A9\u30F3 = Smart Phone). Japan loves shorting loanwords!' },
        { id: "ja-kt-q4", question: '"\u30D1\u30B9\u30DD\u30FC\u30C8 (Pasupooto)" means:', options: ["Password", "Passport", "Package", "Post office"], answerIndex: 1, explanation: "\u30D1\u30B9\u30DD\u30FC\u30C8 (Pasupooto) = Passport \u2014 directly borrowed from English with Japanese phonological adaptation." },
        { id: "ja-kt-q5", question: '"\u30A8\u30A2\u30B3\u30F3 (Eakon)" is shortened from:', options: ["Air conditioner", "Airplane connection", "Air communication", "Economy class"], answerIndex: 0, explanation: "\u30A8\u30A2\u30B3\u30F3 (Eakon) = Air conditioner, shortened from \u30A8\u30A2\u30FC\u30B3\u30F3\u30C7\u30A3\u30B7\u30E7\u30CA\u30FC. Japan abbreviates English words regularly." },
        { id: "ja-kt-q6", question: '"\u30C7\u30D1\u30FC\u30C8 (Depaato)" means:', options: ["Departure gate", "Department store", "Departure time", "Deposit"], answerIndex: 1, explanation: '\u30C7\u30D1\u30FC\u30C8 (Depaato) = Department store \u2014 from the English word "department".' },
        { id: "ja-kt-q7", question: '"\u30B2\u30FC\u30E0 (Geemu)" comes from the English word:', options: ["Gym", "Game", "Gem", "Gamer"], answerIndex: 1, explanation: "\u30B2\u30FC\u30E0 (Geemu) = Game \u2014 Japan is the birthplace of many beloved video game franchises." },
        { id: "ja-kt-q8", question: "Japanese loanwords that combine English words in new ways unique to Japan are called:", options: ["Romaji", "Furigana", "Wasei-eigo", "Keigo"], answerIndex: 2, explanation: '"Wasei-eigo" (\u548C\u88FD\u82F1\u8A9E) = Japanese-made English \u2014 words coined in Japan using English parts, like "salaryman".' },
        { id: "ja-kt-q9", question: '"\u30A2\u30A4\u30B9\u30AF\u30EA\u30FC\u30E0 (Aisu Kuriimu)" is:', options: ["Iced coffee", "Ice cream", "Iced tea", "Ice water"], answerIndex: 1, explanation: "\u30A2\u30A4\u30B9\u30AF\u30EA\u30FC\u30E0 (Aisu Kuriimu) = Ice cream \u2014 one of Japan's most beloved sweet treats." },
        { id: "ja-kt-q10", question: "If you know English well, learning Katakana vocabulary is:", options: ["Very difficult \u2014 the words are completely different", "Impossible for non-Japanese speakers", "Surprisingly easy \u2014 many are recognizable English words", "Only useful for tourists"], answerIndex: 2, explanation: "Knowing English gives you an instant head-start with Japanese \u2014 thousands of Katakana words are English loanwords!" }
      ]
    }
  },
  {
    id: "japanese-vocab-festivals",
    category: "vocabulary",
    level: "intermediate",
    targetLang: "japanese",
    title: "Japanese Vocabulary: Seasons, Nature & Traditional Festivals",
    description: "Explore Japanese seasonal vocabulary, nature words, and the beautiful traditional festivals (matsuri) that define Japanese culture.",
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: "Japan has four distinct seasons (\u56DB\u5B63 \u2014 Shiki), and seasonal change is deeply embedded in Japanese culture, art, and language. Traditional festivals (\u796D\u308A \u2014 Matsuri) are held throughout the year celebrating harvests, spirits, and the beauty of nature. This vocabulary brings Japanese cultural life to life.",
      words: [
        { word: "\u685C (Sakura)", partOfSpeech: "noun", definition: "Cherry blossom \u2014 Japan's national flower, celebrated every spring with hanami (flower-viewing) parties.", englishExample: "Sakura ga kirei desu ne \u2014 The cherry blossoms are beautiful, aren't they!" },
        { word: "\u304A\u796D\u308A (Omatsuri)", partOfSpeech: "noun", definition: "Festival \u2014 traditional Japanese festivals featuring food stalls, fireworks, yukata, and dances.", englishExample: "Natsu matsuri ni ikimashou! \u2014 Let's go to the summer festival!" },
        { word: "\u6D74\u8863 (Yukata)", partOfSpeech: "noun", definition: "Light summer kimono \u2014 worn to summer festivals and fireworks events, more casual than a formal kimono.", englishExample: "Yukata o kite matsuri ni itta \u2014 I wore a yukata to the festival." },
        { word: "\u82B1\u706B (Hanabi)", partOfSpeech: "noun", definition: 'Fireworks \u2014 literally "flower fire", Japan has world-class fireworks festivals (hanabi taikai) every summer.', englishExample: "Hanabi ga kirei! \u2014 The fireworks are beautiful!" },
        { word: "\u7D05\u8449 (Momiji / Kouyou)", partOfSpeech: "noun", definition: "Autumn leaves / Maple leaves \u2014 the red and orange autumn foliage celebrated across Japan in fall.", englishExample: "Kyoto no kouyou wa subarashii \u2014 The autumn leaves in Kyoto are magnificent." },
        { word: "\u96EA (Yuki)", partOfSpeech: "noun", definition: "Snow \u2014 Japan gets heavy snowfall in many regions; Hokkaido's snow festivals are world-famous.", englishExample: "Yuki ga futte iru \u2014 It's snowing!" },
        { word: "\u521D\u8A63 (Hatsumoude)", partOfSpeech: "noun", definition: "First shrine/temple visit of the New Year \u2014 millions of Japanese people visit shrines during the first three days of January.", englishExample: "Gantan ni hatsumoude ni ikimashou \u2014 Let's do the first shrine visit on New Year's Day." },
        { word: "\u3082\u3063\u305F\u3044\u306A\u3044 (Mottainai)", partOfSpeech: "concept", definition: "What a waste \u2014 a deep Japanese cultural concept of not wasting anything of value, including seasonal beauty.", englishExample: "Sakura wo minai no wa mottainai \u2014 It would be a waste not to see the cherry blossoms." }
      ],
      quiz: [
        { id: "ja-fs-q1", question: '"\u685C (Sakura)" is:', options: ["Japan's national bird", "Japan's national flower \u2014 cherry blossom", "A type of Japanese tea", "A traditional instrument"], answerIndex: 1, explanation: "\u685C (Sakura) = Cherry blossom \u2014 Japan's national flower, celebrated every spring with hanami parties." },
        { id: "ja-fs-q2", question: '"\u82B1\u706B (Hanabi)" literally means:', options: ["Fire dance", "Flower fire (= Fireworks)", "Night flower", "Summer celebration"], answerIndex: 1, explanation: '\u82B1 (Hana) = Flower + \u706B (Hi/Bi) = Fire. \u82B1\u706B (Hanabi) = Fireworks \u2014 literally "flower fire".' },
        { id: "ja-fs-q3", question: '"\u6D74\u8863 (Yukata)" is:', options: ["A formal kimono for weddings", "A light summer kimono worn at festivals", "A type of traditional footwear", "Traditional Japanese armor"], answerIndex: 1, explanation: "\u6D74\u8863 (Yukata) is a casual summer kimono worn at festivals, fireworks events, and hot spring resorts." },
        { id: "ja-fs-q4", question: '"\u304A\u796D\u308A (Omatsuri)" means:', options: ["Prayer", "Festival", "Shrine", "Parade"], answerIndex: 1, explanation: "\u304A\u796D\u308A (Omatsuri) = Traditional Japanese festival \u2014 a cornerstone of Japanese community life." },
        { id: "ja-fs-q5", question: '"\u7D05\u8449 (Kouyou / Momiji)" refers to:', options: ["Cherry blossoms in spring", "Summer sunflowers", "Autumn red leaves", "Winter snow"], answerIndex: 2, explanation: "\u7D05\u8449 (Kouyou/Momiji) = Autumn leaves \u2014 Japan's colorful fall foliage is a major cultural event." },
        { id: "ja-fs-q6", question: '"\u96EA (Yuki)" means:', options: ["Rain", "Wind", "Snow", "Ice"], answerIndex: 2, explanation: "\u96EA (Yuki) = Snow. Japan has a rich snow culture, especially in Hokkaido which hosts famous snow festivals." },
        { id: "ja-fs-q7", question: '"\u521D\u8A63 (Hatsumoude)" is done:', options: ["At the end of the year (December 31)", "During the first days of the New Year", "At the start of spring", "On a person's birthday"], answerIndex: 1, explanation: "\u521D\u8A63 (Hatsumoude) = First shrine visit of the New Year \u2014 a major tradition for millions of Japanese on Jan 1-3." },
        { id: "ja-fs-q8", question: '"\u82B1\u898B (Hanami)" means:', options: ["Flower arranging", "Cherry blossom viewing parties", "Planting flowers", "Selling flowers"], answerIndex: 1, explanation: "\u82B1\u898B (Hanami) = Flower viewing \u2014 specifically the beloved Japanese tradition of picnicking under cherry blossoms." },
        { id: "ja-fs-q9", question: "Japan has how many distinct seasons?", options: ["Two (dry and wet)", "Three (spring, summer, winter)", "Four (spring, summer, autumn, winter)", "Five"], answerIndex: 2, explanation: "Japan has four distinct seasons (\u56DB\u5B63 \u2014 Shiki), and seasonal change deeply influences Japanese culture and vocabulary." },
        { id: "ja-fs-q10", question: "The Sapporo Snow Festival (Yuki Matsuri) is held in which region of Japan?", options: ["Tokyo", "Kyoto", "Okinawa", "Hokkaido"], answerIndex: 3, explanation: "Hokkaido \u2014 Japan's northernmost island \u2014 hosts the world-famous Sapporo Snow Festival, drawing millions of visitors." }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇫🇷  FRENCH LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "french-vocab-greetings",
    category: "vocabulary",
    level: "beginner",
    targetLang: "french",
    title: "French Essentials: Bonjour & Core Phrases",
    description: "Learn the essential French greetings, polite phrases, and the basics of formal (vous) vs informal (tu) speech.",
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: `French (Fran\xE7ais) is spoken by over 300 million people across 5 continents and is an official language of the United Nations. Known as "la langue de l'amour" (the language of love), French is famous for its elegance and cultural richness. One key feature: French distinguishes between formal "vous" and informal "tu" when addressing people.`,
      words: [
        { word: "Bonjour / Bonsoir", partOfSpeech: "greeting", definition: "Good morning/afternoon / Good evening \u2014 Bonjour is used until evening, then Bonsoir.", englishExample: "Bonjour! Comment allez-vous? \u2014 Good morning! How are you?" },
        { word: "Merci (beaucoup)", partOfSpeech: "phrase", definition: 'Thank you (very much) \u2014 Merci alone is "thank you", beaucoup adds "very much".', englishExample: "Merci beaucoup pour votre aide \u2014 Thank you very much for your help." },
        { word: "S'il vous pla\xEEt / S'il te pla\xEEt", partOfSpeech: "phrase", definition: 'Please (formal) / Please (informal) \u2014 the French word for "please" changes with formality.', englishExample: "Un caf\xE9, s'il vous pla\xEEt \u2014 A coffee, please." },
        { word: "Excusez-moi / Pardon", partOfSpeech: "phrase", definition: "Excuse me / Pardon \u2014 Excusez-moi to get attention, Pardon when bumping into someone.", englishExample: "Excusez-moi, o\xF9 est la gare? \u2014 Excuse me, where is the train station?" },
        { word: "Je m'appelle...", partOfSpeech: "phrase", definition: 'My name is... \u2014 literally "I call myself..." The standard French self-introduction.', englishExample: "Je m'appelle Sophie. Et vous? \u2014 My name is Sophie. And you?" },
        { word: "Vous (formal) / Tu (informal)", partOfSpeech: "pronoun", definition: '"You" formal vs informal \u2014 a key French cultural distinction. Always use "vous" with strangers and elders.', englishExample: "Comment vous appelez-vous? (formal) vs Comment tu t'appelles? (informal) \u2014 What's your name?" },
        { word: "De rien / Je vous en prie", partOfSpeech: "phrase", definition: "You're welcome \u2014 De rien is casual, Je vous en prie is formal. Both respond to Merci.", englishExample: "Merci! \u2014 De rien! \u2014 Thank you! \u2014 You're welcome!" },
        { word: "Au revoir / \xC0 bient\xF4t", partOfSpeech: "phrase", definition: "Goodbye (formal) / See you soon \u2014 Au revoir is the standard goodbye; \xC0 bient\xF4t suggests you'll meet again.", englishExample: "Au revoir! Bonne journ\xE9e! \u2014 Goodbye! Have a good day!" }
      ],
      quiz: [
        { id: "fr-gr-q1", question: '"Bonjour" is used when?', options: ["Only in the morning", "During the day until evening", "Only at night", "Only in formal settings"], answerIndex: 1, explanation: 'Bonjour is used from morning until evening. After sunset, French speakers switch to "Bonsoir".' },
        { id: "fr-gr-q2", question: '"Merci beaucoup" means:', options: ["Thank you a little", "Thank you very much", "Thanks anyway", "Thanks for nothing"], answerIndex: 1, explanation: "Merci = Thank you. Beaucoup = a lot/very much. Together: Thank you very much." },
        { id: "fr-gr-q3", question: 'In French, "vous" is used when speaking to:', options: ["Close friends", "Children", "Strangers, elders, and in formal situations", "Pets"], answerIndex: 2, explanation: '"Vous" is the formal/plural "you" \u2014 used with strangers, elders, authority figures, and in professional settings.' },
        { id: "fr-gr-q4", question: `"S'il vous pla\xEEt" is:`, options: ["You're welcome (formal)", "Please (formal)", "Excuse me (formal)", "Goodbye (formal)"], answerIndex: 1, explanation: `"S'il vous pla\xEEt" = Please (formal). "S'il te pla\xEEt" = Please (informal).` },
        { id: "fr-gr-q5", question: `"Je m'appelle..." means:`, options: ["I live in...", "I am from...", "My name is...", "I speak..."], answerIndex: 2, explanation: `"Je m'appelle" literally = "I call myself" = My name is... Standard French introduction.` },
        { id: "fr-gr-q6", question: '"Au revoir" means:', options: ["Hello", "See you soon", "Goodbye", "Good night"], answerIndex: 2, explanation: '"Au revoir" = Goodbye. Literally "until we see each other again". The standard formal farewell.' },
        { id: "fr-gr-q7", question: '"De rien" is a response to:', options: ["Bonjour", "Merci", "Excusez-moi", "Au revoir"], answerIndex: 1, explanation: `"De rien" = You're welcome \u2014 said in response to "Merci" (Thank you).` },
        { id: "fr-gr-q8", question: "French is an official language of how many countries?", options: ["5", "10", "20+", "29+"], answerIndex: 3, explanation: "French is an official language in 29 countries across 5 continents, making it one of the world's most widespread languages." },
        { id: "fr-gr-q9", question: '"Bonsoir" is used:', options: ["At noon", "In the morning only", "In the evening/at night", "When leaving"], answerIndex: 2, explanation: '"Bonsoir" = Good evening \u2014 used from evening onwards as a greeting. "Bonne nuit" = Good night (when going to sleep).' },
        { id: "fr-gr-q10", question: '"\xC0 bient\xF4t!" means:', options: ["Goodbye forever", "See you soon", "Good luck", "Take care"], answerIndex: 1, explanation: '"\xC0 bient\xF4t" = See you soon! Bient\xF4t = soon. It implies you expect to see the person again.' }
      ]
    }
  },
  {
    id: "french-conv-cafe",
    category: "conversation",
    level: "beginner",
    targetLang: "french",
    title: "French Conversations: At a Caf\xE9 (Au Caf\xE9)",
    description: "Experience the quintessential French caf\xE9 culture \u2014 ordering coffee, pastries, and meals with authentic French dialogue.",
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: "You are sitting at a charming Parisian caf\xE9 (un caf\xE9 parisien) on a sunny afternoon. A friendly waiter comes to take your order. You want to order an espresso, a croissant, and ask about the plat du jour (dish of the day). French caf\xE9 culture is an art form!",
      speakerNames: ["Waiter (Serveur)", "Customer (Client)"],
      transcript: [
        { speaker: "Waiter (Serveur)", text: "Bonjour! Vous avez choisi? (Hello! Have you chosen?)" },
        { speaker: "Customer (Client)", text: "Oui, je voudrais un caf\xE9 et un croissant, s'il vous pla\xEEt. (Yes, I would like a coffee and a croissant, please.)" },
        { speaker: "Waiter (Serveur)", text: "Tr\xE8s bien! Et comme boisson? Un caf\xE9 noisette ou un expresso? (Very good! And as a drink? A coffee with a drop of milk or an espresso?)" },
        { speaker: "Customer (Client)", text: "Un expresso, s'il vous pla\xEEt. C'est quoi le plat du jour? (An espresso, please. What is the dish of the day?)" },
        { speaker: "Waiter (Serveur)", text: "Aujourd'hui c'est le coq au vin avec des l\xE9gumes. Tr\xE8s populaire! (Today it's coq au vin with vegetables. Very popular!)" },
        { speaker: "Customer (Client)", text: "Parfait! Je prends aussi le plat du jour. (Perfect! I'll also have the dish of the day.)" },
        { speaker: "Waiter (Serveur)", text: "Excellente choice! Je reviens dans un instant. (Excellent choice! I'll be back in a moment.)" },
        { speaker: "Customer (Client)", text: "L'addition, s'il vous pla\xEEt. C'est combien? (The bill please. How much is it?)" }
      ],
      quiz: [
        { id: "fr-cf-q1", question: '"Vous avez choisi?" means:', options: ["Are you ready to order?", "Have you chosen / Are you ready?", "What would you like?", "Can I bring the menu?"], answerIndex: 1, explanation: '"Vous avez choisi?" = Have you chosen? \u2014 the common French waiter phrase meaning "Are you ready to order?"' },
        { id: "fr-cf-q2", question: '"Je voudrais..." means:', options: ["I have...", "I want... (aggressive)", "I would like... (polite)", "I need..."], answerIndex: 2, explanation: '"Je voudrais" = I would like... \u2014 the polite conditional form of "vouloir" (to want). Always use this in French restaurants.' },
        { id: "fr-cf-q3", question: '"Le plat du jour" means:', options: ["The dessert menu", "The dish of the day", "The daily soup", "The chef's special"], answerIndex: 1, explanation: '"Le plat du jour" = The dish of the day \u2014 a staple of French restaurant culture, usually a set special.' },
        { id: "fr-cf-q4", question: `"L'addition, s'il vous pla\xEEt" means:`, options: ["More bread please", "Another drink please", "The bill/check please", "The menu please"], answerIndex: 2, explanation: `"L'addition" = The bill/check. "L'addition, s'il vous pla\xEEt" is how you ask for the check in France.` },
        { id: "fr-cf-q5", question: `"C'est combien?" means:`, options: ["What is this?", "How much is it?", "Is it expensive?", "What time is it?"], answerIndex: 1, explanation: `"C'est combien?" = How much is it? \u2014 the simple, standard way to ask for the price in French.` },
        { id: "fr-cf-q6", question: '"Un croissant" is:', options: ["A type of French cheese", "A crescent-shaped buttery pastry", "A French omelet", "A type of baguette"], answerIndex: 1, explanation: `A croissant (from French "crescent") is a flaky, buttery pastry \u2014 one of France's most iconic foods.` },
        { id: "fr-cf-q7", question: '"Parfait!" means:', options: ["Excuse me!", "Not bad!", "Perfect!", "Interesting!"], answerIndex: 2, explanation: '"Parfait!" = Perfect! \u2014 commonly used to express approval or satisfaction in French.' },
        { id: "fr-cf-q8", question: '"Je prends aussi..." means:', options: ["I don't want...", "I'll also have / I'll also take...", "Can I take away...?", "I prefer..."], answerIndex: 1, explanation: `"Je prends" = I take/I'll have. "Aussi" = also/too. Together: "I'll also have..." \u2014 another way to order.` },
        { id: "fr-cf-q9", question: 'What is "Coq au Vin"?', options: ["Fish with white wine sauce", "Chicken braised in red wine", "Duck with orange sauce", "Beef stew with vegetables"], answerIndex: 1, explanation: '"Coq au Vin" = Chicken (Coq) in wine (Vin) \u2014 a classic French country dish braised in red wine.' },
        { id: "fr-cf-q10", question: '"Un expresso" in French caf\xE9 culture refers to:', options: ["A large milky coffee", "A small strong black espresso coffee", "An iced coffee", "A coffee with whipped cream"], answerIndex: 1, explanation: '"Un expresso" (or espresso) = A small, concentrated black coffee shot \u2014 the standard coffee in a French caf\xE9.' }
      ]
    }
  },
  {
    id: "french-vocab-culture",
    category: "vocabulary",
    level: "intermediate",
    targetLang: "french",
    title: "French Vocabulary: Fashion, Food & French Culture",
    description: "Dive into French cultural vocabulary \u2014 fashion terms, gourmet food words, and the cultural concepts that define French identity.",
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: "France is synonymous with fashion, gastronomy, and art de vivre (art of living). French cultural vocabulary has heavily influenced global fashion, cooking, and lifestyle language \u2014 many words you already know are French! This lesson explores the rich cultural vocabulary that makes French culture unique.",
      words: [
        { word: "La Mode", partOfSpeech: "noun", definition: 'Fashion \u2014 France is the global capital of haute couture (high fashion). "\xC0 la mode" = fashionable/in style.', englishExample: "Paris est la capitale de la mode \u2014 Paris is the fashion capital." },
        { word: "La Gastronomie", partOfSpeech: "noun", definition: "Gastronomy / Fine cuisine \u2014 French cuisine is UNESCO heritage. France takes food more seriously than almost any other culture.", englishExample: "La gastronomie fran\xE7aise est renomm\xE9e dans le monde entier \u2014 French gastronomy is renowned worldwide." },
        { word: "Joie de Vivre", partOfSpeech: "concept", definition: "Joy of living \u2014 one of France's most famous cultural expressions, meaning a cheerful enjoyment of life.", englishExample: "Les Fran\xE7ais ont la joie de vivre \u2014 The French have the joy of living." },
        { word: "Un Baguette", partOfSpeech: "noun", definition: "A long French bread loaf \u2014 baguettes are baked fresh daily; it's a cultural icon and UNESCO heritage.", englishExample: "Je vais chercher une baguette \xE0 la boulangerie \u2014 I'm going to get a baguette from the bakery." },
        { word: "Le Mus\xE9e / L'Art", partOfSpeech: "noun", definition: "Museum / Art \u2014 France hosts the world's most visited museum (The Louvre) and has shaped Western art history.", englishExample: "Le Louvre est le mus\xE9e le plus c\xE9l\xE8bre du monde \u2014 The Louvre is the most famous museum in the world." },
        { word: "Bon App\xE9tit", partOfSpeech: "phrase", definition: "Enjoy your meal \u2014 said before eating a meal in French culture. It's an expression of warmth and social bonding.", englishExample: "Bon app\xE9tit! \u2014 Enjoy your meal!" },
        { word: "La Politesse", partOfSpeech: "noun", definition: "Politeness / Manners \u2014 French culture places enormous value on politeness, especially in greetings and formal settings.", englishExample: "La politesse est tr\xE8s importante en France \u2014 Politeness is very important in France." },
        { word: "Le Cin\xE9ma", partOfSpeech: "noun", definition: "Cinema \u2014 France invented cinema (the Lumi\xE8re brothers, 1895) and the Cannes Film Festival is the world's most prestigious.", englishExample: "J'adore le cin\xE9ma fran\xE7ais \u2014 I love French cinema." }
      ],
      quiz: [
        { id: "fr-cu-q1", question: '"La Mode" means:', options: ["Food", "Fashion", "Music", "Art"], answerIndex: 1, explanation: '"La Mode" = Fashion. "\xC0 la mode" in French means fashionable/in style (in the US it also means "with ice cream"!).' },
        { id: "fr-cu-q2", question: '"Joie de Vivre" means:', options: ["Fear of life", "Joy of living", "Art of cooking", "Love of travel"], answerIndex: 1, explanation: '"Joie de Vivre" = Joy of living/life \u2014 a famous French cultural concept of enthusiastically enjoying life.' },
        { id: "fr-cu-q3", question: '"Bon App\xE9tit" is said:', options: ["After finishing a meal", "Before starting a meal", "When ordering food", "When paying the bill"], answerIndex: 1, explanation: `"Bon App\xE9tit" = Enjoy your meal \u2014 said before or at the start of eating. It's a French social custom.` },
        { id: "fr-cu-q4", question: '"Une Boulangerie" is:', options: ["A cheese shop", "A restaurant", "A bakery (sells bread and pastries)", "A wine shop"], answerIndex: 2, explanation: '"Une Boulangerie" = A bakery \u2014 where fresh baguettes, croissants, and pastries are sold daily in France.' },
        { id: "fr-cu-q5", question: "France invented cinema in which year?", options: ["1850", "1895", "1910", "1920"], answerIndex: 1, explanation: "The Lumi\xE8re brothers held the world's first public film screening in Paris in 1895 \u2014 inventing cinema!" },
        { id: "fr-cu-q6", question: '"La Gastronomie Fran\xE7aise" is recognized as:', options: ["A French cooking technique", "A UNESCO Intangible Cultural Heritage", "A French restaurant style", "A school of cooking"], answerIndex: 1, explanation: "French gastronomy was inscribed on UNESCO's Intangible Cultural Heritage list in 2010." },
        { id: "fr-cu-q7", question: `The world's most visited museum, "Le Louvre", is in:`, options: ["Lyon", "Nice", "Paris", "Bordeaux"], answerIndex: 2, explanation: "The Louvre (Le Louvre) in Paris is the world's most visited museum, home to the Mona Lisa." },
        { id: "fr-cu-q8", question: '"La Politesse" emphasizes that in France:', options: ["Speed of service is most important", "Greetings and manners are culturally very important", "Silence is golden", "Directness is valued above all"], answerIndex: 1, explanation: 'La politesse (politeness) is central to French culture \u2014 always say "Bonjour" when entering any shop, and formal greetings matter.' },
        { id: "fr-cu-q9", question: '"Haute Couture" means:', options: ["Street fashion", "High fashion / luxury handmade clothing", "Vintage clothing", "Ready-to-wear fashion"], answerIndex: 1, explanation: '"Haute Couture" (High Sewing) refers to exclusive, custom luxury fashion \u2014 Paris is its world capital.' },
        { id: "fr-cu-q10", question: `The world's most prestigious film festival, "Le Festival de Cannes", is held in:`, options: ["Paris", "Lyon", "Cannes (French Riviera)", "Bordeaux"], answerIndex: 2, explanation: "The Cannes Film Festival (Festival de Cannes) is held annually in Cannes on the French Riviera \u2014 cinema's most prestigious event." }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇪🇸  SPANISH LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "spanish-vocab-greetings",
    category: "vocabulary",
    level: "beginner",
    targetLang: "spanish",
    title: "Spanish Essentials: Hola & Core Phrases",
    description: "Learn the most important Spanish greetings, polite expressions, and self-introduction phrases spoken across 20+ countries.",
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: "Spanish (Espa\xF1ol) is the world's second most spoken native language with over 485 million speakers across 20+ countries. From Spain to Mexico to Argentina, Spanish opens doors across two continents. It's famous for its warm, expressive character and its strong connection to music, food, and family culture.",
      words: [
        { word: "Hola / Buenos d\xEDas", partOfSpeech: "greeting", definition: "Hi / Good morning \u2014 Hola is the universal casual greeting; Buenos d\xEDas is the formal morning version.", englishExample: "Hola! \xBFC\xF3mo est\xE1s? \u2014 Hi! How are you?" },
        { word: "Gracias / De nada", partOfSpeech: "phrase", definition: "Thank you / You're welcome \u2014 the most important exchange of gratitude in Spanish.", englishExample: "Muchas gracias! \u2014 De nada \u2014 Thank you very much! \u2014 You're welcome." },
        { word: "Por favor", partOfSpeech: "phrase", definition: "Please \u2014 the indispensable polite word, used in requests and orders across Spanish-speaking countries.", englishExample: "Un agua, por favor \u2014 A water, please." },
        { word: "Perd\xF3n / Disculpe", partOfSpeech: "phrase", definition: "Sorry / Excuse me \u2014 Perd\xF3n for apologizing, Disculpe for getting someone's attention politely.", englishExample: "Disculpe, \xBFd\xF3nde est\xE1 el ba\xF1o? \u2014 Excuse me, where is the bathroom?" },
        { word: "Me llamo...", partOfSpeech: "phrase", definition: 'My name is... \u2014 literally "I call myself..." \u2014 the standard Spanish self-introduction.', englishExample: "Me llamo Carlos. \xBFY t\xFA? \u2014 My name is Carlos. And you?" },
        { word: "\xBFC\xF3mo est\xE1s? / Bien, gracias", partOfSpeech: "phrase", definition: "How are you? / Fine, thank you \u2014 the most common Spanish social exchange.", englishExample: "Hola! \xBFC\xF3mo est\xE1s? \u2014 Bien, gracias. \xBFY t\xFA? \u2014 Hi! How are you? \u2014 Fine, thanks. And you?" },
        { word: "Lo siento", partOfSpeech: "phrase", definition: `I'm sorry (sincere apology) \u2014 used for sincere apologies, stronger than "perd\xF3n".`, englishExample: "Lo siento mucho, fue mi culpa \u2014 I'm very sorry, it was my fault." },
        { word: "Hasta luego / Adi\xF3s", partOfSpeech: "phrase", definition: "See you later / Goodbye \u2014 Hasta luego implies seeing each other again; Adi\xF3s is a final farewell.", englishExample: "Hasta luego! Que te vaya bien! \u2014 See you later! Hope it goes well!" }
      ],
      quiz: [
        { id: "es-gr-q1", question: '"Buenos d\xEDas" is used:', options: ["In the evening", "At night", "In the morning (good morning)", "On weekends only"], answerIndex: 2, explanation: '"Buenos d\xEDas" = Good morning. Buenas tardes = Good afternoon. Buenas noches = Good evening/night.' },
        { id: "es-gr-q2", question: '"Muchas gracias" means:', options: ["Thank you a little", "Thank you very much", "No thank you", "Thanks anyway"], answerIndex: 1, explanation: '"Muchas gracias" = Thank you very much. Muchas = many/much, Gracias = thank you.' },
        { id: "es-gr-q3", question: '"Por favor" is:', options: ["Goodbye", "You're welcome", "Please", "Excuse me"], answerIndex: 2, explanation: '"Por favor" = Please \u2014 essential for polite requests in Spanish.' },
        { id: "es-gr-q4", question: '"Me llamo..." is used to:', options: ["Ask someone's name", "Say your name / introduce yourself", "Say where you're from", "Ask someone's age"], answerIndex: 1, explanation: '"Me llamo..." = My name is... \u2014 literally "I call myself..." \u2014 the standard Spanish introduction.' },
        { id: "es-gr-q5", question: 'How do you say "How are you?" informally in Spanish?', options: ["\xBFC\xF3mo se llama?", "\xBFD\xF3nde est\xE1?", "\xBFC\xF3mo est\xE1s?", "\xBFCu\xE1nto cuesta?"], answerIndex: 2, explanation: '"\xBFC\xF3mo est\xE1s?" = How are you? (informal). "\xBFC\xF3mo est\xE1 usted?" = How are you? (formal).' },
        { id: "es-gr-q6", question: '"Lo siento" is used when:', options: ["Greeting someone", "Thanking someone", "Making a sincere apology", "Ordering food"], answerIndex: 2, explanation: `"Lo siento" = I'm sorry (sincere). It's stronger than "perd\xF3n" and used for genuine apologies.` },
        { id: "es-gr-q7", question: '"Hasta luego" means:', options: ["Goodbye forever", "See you later", "Good night", "Hello again"], answerIndex: 1, explanation: '"Hasta luego" = See you later. Hasta = until, Luego = later/soon. Implies another meeting.' },
        { id: "es-gr-q8", question: "Spanish is spoken natively in how many countries?", options: ["5", "10", "20+", "50+"], answerIndex: 2, explanation: "Spanish is the official language in 20+ countries across Spain, Latin America, and is widely spoken in the US." },
        { id: "es-gr-q9", question: '"De nada" is the response to:', options: ["Hola", "Gracias", "Lo siento", "Buenos d\xEDas"], answerIndex: 1, explanation: `"De nada" = You're welcome \u2014 literally "it's nothing". Said in response to "Gracias".` },
        { id: "es-gr-q10", question: '"Disculpe" is used to:', options: ["Apologize sincerely", "Get someone's attention politely", "Say goodbye", "Ask for directions"], answerIndex: 1, explanation: `"Disculpe" = Excuse me \u2014 used to politely get someone's attention. "Perd\xF3n" is more for bumping into someone.` }
      ]
    }
  },
  {
    id: "spanish-conv-market",
    category: "conversation",
    level: "beginner",
    targetLang: "spanish",
    title: "Spanish Conversations: At the Market (En el Mercado)",
    description: "Practice real Spanish market conversations \u2014 asking for prices, bargaining, and buying fresh produce.",
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: "You are at a vibrant Mexican mercado (market) in Oaxaca. A friendly vendor is selling fresh tropical fruits and local chiles. You want to buy some avocados and ask about the specialties. This dialogue teaches practical market Spanish.",
      speakerNames: ["Vendor (Vendedor/a)", "Customer (Cliente)"],
      transcript: [
        { speaker: "Vendor (Vendedor/a)", text: "\xA1Buenos d\xEDas! \xBFQu\xE9 le doy? (Good morning! What can I give you?)" },
        { speaker: "Customer (Cliente)", text: "Buenos d\xEDas. \xBFCu\xE1nto cuestan los aguacates? (Good morning. How much do the avocados cost?)" },
        { speaker: "Vendor (Vendedor/a)", text: "Est\xE1n a veinte pesos el kilo. \xA1Son fresqu\xEDsimos! (They're 20 pesos per kilo. They are very fresh!)" },
        { speaker: "Customer (Cliente)", text: "Me da dos kilos, por favor. \xBFTiene chiles tambi\xE9n? (Give me two kilos, please. Do you also have chiles?)" },
        { speaker: "Vendor (Vendedor/a)", text: "S\xED, tengo chile habanero, jalape\xF1o y ancho. \xBFCu\xE1l prefiere? (Yes, I have habanero, jalape\xF1o and ancho chiles. Which do you prefer?)" },
        { speaker: "Customer (Cliente)", text: "Jalape\xF1o, por favor. No muy picante. (Jalape\xF1o please. Not too spicy.)" },
        { speaker: "Vendor (Vendedor/a)", text: "\xA1Perfecto! Todo junto son cincuenta pesos. (Perfect! Everything together is 50 pesos.)" },
        { speaker: "Customer (Cliente)", text: "Aqu\xED tiene. Muchas gracias, \xA1que tenga buen d\xEDa! (Here you go. Thank you very much, have a good day!)" }
      ],
      quiz: [
        { id: "es-mk-q1", question: '"\xBFCu\xE1nto cuesta?" means:', options: ["What is this?", "How much does it cost?", "Is it fresh?", "Do you have it?"], answerIndex: 1, explanation: '"\xBFCu\xE1nto cuesta?" = How much does it cost? Essential for all Spanish shopping situations.' },
        { id: "es-mk-q2", question: `"\xBFQu\xE9 le doy?" is a vendor's way of saying:`, options: ["Are you leaving?", "What can I give you? / What would you like?", "Do you have change?", "What is your name?"], answerIndex: 1, explanation: '"\xBFQu\xE9 le doy?" = What can I give you? \u2014 a common market vendor greeting offering help.' },
        { id: "es-mk-q3", question: '"El aguacate" is:', options: ["A type of chile", "Avocado", "Mango", "Tomato"], answerIndex: 1, explanation: `"El aguacate" = Avocado \u2014 one of Mexico's most iconic products and central to guacamole.` },
        { id: "es-mk-q4", question: '"Fresqu\xEDsimos" means:', options: ["Very cheap", "Very fresh (superlative)", "Very colorful", "Very spicy"], answerIndex: 1, explanation: '"Fresqu\xEDsimos" = Very very fresh. Adding -\xEDsimo/a to adjectives creates the superlative form in Spanish.' },
        { id: "es-mk-q5", question: '"No muy picante" means:', options: ["Not very sweet", "Not very expensive", "Not too spicy", "Not very ripe"], answerIndex: 2, explanation: '"No muy picante" = Not too spicy. Picante = spicy in Spanish.' },
        { id: "es-mk-q6", question: '"Me da dos kilos, por favor" means:', options: ["I want to see two kilos", "Give me two kilos, please", "I have two kilos", "Two kilos is too much"], answerIndex: 1, explanation: '"Me da..." = Give me / Can you give me... Used to make purchases or requests.' },
        { id: "es-mk-q7", question: '"\xBFTiene...?" is used to ask:', options: ["How much?", "Do you have...?", "What is...?", "Where is...?"], answerIndex: 1, explanation: '"\xBFTiene...?" = Do you have...? From "tener" (to have). "\xBFTiene jalape\xF1os?" = Do you have jalape\xF1os?' },
        { id: "es-mk-q8", question: '"Cincuenta pesos" means:', options: ["15 pesos", "50 pesos", "500 pesos", "5 pesos"], answerIndex: 1, explanation: "Cincuenta = 50. El peso = the currency of Mexico and several other Latin American countries." },
        { id: "es-mk-q9", question: '"\xA1Que tenga buen d\xEDa!" means:', options: ["See you tomorrow!", "Come back soon!", "Have a good day!", "Thank you very much!"], answerIndex: 2, explanation: '"\xA1Que tenga buen d\xEDa!" = Have a good day! A warm farewell common in Latin American markets.' },
        { id: "es-mk-q10", question: "Which chile is generally the mildest of these options?", options: ["Habanero", "Ghost pepper", "Jalape\xF1o", "Scotch bonnet"], answerIndex: 2, explanation: "Jalape\xF1o is the mildest of these options. Habanero is much hotter. Chile knowledge is cultural knowledge in Mexico!" }
      ]
    }
  },
  {
    id: "spanish-vocab-culture",
    category: "vocabulary",
    level: "intermediate",
    targetLang: "spanish",
    title: "Spanish Vocabulary: Travel, Food & Fiesta Culture",
    description: "Explore Spanish and Latin American cultural vocabulary \u2014 travel words, food terms, music, and the vibrant fiesta culture.",
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: "The Spanish-speaking world is richly diverse \u2014 from flamenco in Spain to salsa in Colombia, from tacos in Mexico to asado in Argentina. This lesson dives into the cultural vocabulary that makes Spanish-speaking cultures so vibrant, joyful, and beloved worldwide.",
      words: [
        { word: "La Fiesta", partOfSpeech: "noun", definition: "Party / Festival / Celebration \u2014 central to Spanish and Latin American culture, fiestas are joyful communal celebrations.", englishExample: "La fiesta de San Ferm\xEDn es muy famosa \u2014 The San Ferm\xEDn festival is very famous." },
        { word: "El F\xFAtbol", partOfSpeech: "noun", definition: "Football/Soccer \u2014 the most popular sport in the Spanish-speaking world. Passion for f\xFAtbol unites the culture.", englishExample: "El f\xFAtbol es la pasi\xF3n de los latinoamericanos \u2014 Football is the passion of Latin Americans." },
        { word: "La M\xFAsica", partOfSpeech: "noun", definition: "Music \u2014 Spanish musical genres (flamenco, salsa, reggaeton, tango, mariachi) are globally influential.", englishExample: "Me encanta la m\xFAsica latina \u2014 I love Latin music." },
        { word: "El Mercado", partOfSpeech: "noun", definition: "Market \u2014 traditional markets are the heart of Spanish and Latin American community life.", englishExample: "El mercado es el coraz\xF3n de la ciudad \u2014 The market is the heart of the city." },
        { word: "La Sobremesa", partOfSpeech: "concept", definition: "Post-meal conversation \u2014 the Spanish cultural tradition of lingering at the table after eating to talk. No rushing allowed!", englishExample: "La sobremesa es sagrada en Espa\xF1a \u2014 The after-meal conversation is sacred in Spain." },
        { word: "Siesta", partOfSpeech: "noun", definition: "Afternoon nap \u2014 the Spanish tradition of a midday rest, though now mainly in smaller towns and older generations.", englishExample: "En verano, mucha gente hace la siesta \u2014 In summer, many people take a siesta." },
        { word: "El Tapeo / Las Tapas", partOfSpeech: "noun", definition: "Tapas culture \u2014 the Spanish tradition of eating small dishes while socializing. One of Spain's greatest gifts to the world.", englishExample: "Vamos de tapas esta noche \u2014 Let's go for tapas tonight." },
        { word: "Mi casa es tu casa", partOfSpeech: "phrase", definition: "My house is your house \u2014 a famous Spanish hospitality expression showing warmth and generosity to guests.", englishExample: "Bienvenido! Mi casa es tu casa \u2014 Welcome! My house is your house." }
      ],
      quiz: [
        { id: "es-cu-q1", question: '"La Fiesta" in Spanish culture means:', options: ["A political gathering", "A joyful party/festival/celebration", "A religious ceremony only", "A sports event"], answerIndex: 1, explanation: '"La Fiesta" = Party / Festival / Celebration \u2014 the word and concept are central to Spanish-speaking cultures.' },
        { id: "es-cu-q2", question: '"La Sobremesa" is the Spanish tradition of:', options: ["Cooking together", "Eating quickly", "Lingering at the table after a meal to talk", "Napping after lunch"], answerIndex: 2, explanation: '"La Sobremesa" (literally "over the table") = the post-meal conversation \u2014 a sacred Spanish social custom.' },
        { id: "es-cu-q3", question: '"Las Tapas" are:', options: ["A type of Spanish dessert", "Small plates of food shared while socializing", "A type of Spanish hat", "Full-course meals"], answerIndex: 1, explanation: `"Las Tapas" = Small Spanish dishes shared during socializing \u2014 one of Spain's greatest culinary gifts to the world.` },
        { id: "es-cu-q4", question: '"Mi casa es tu casa" means:', options: ["My house is private", "You can buy my house", "My house is your house (gesture of hospitality)", "Our houses are different"], answerIndex: 2, explanation: '"Mi casa es tu casa" = My house is your house \u2014 a famous expression of warm Latin hospitality and welcome.' },
        { id: "es-cu-q5", question: '"La Siesta" is traditionally taken:', options: ["After dinner", "At midnight", "In the early afternoon after lunch", "Before breakfast"], answerIndex: 2, explanation: "La Siesta is a traditional midday/early afternoon nap, especially common in hot Mediterranean and Latin climates." },
        { id: "es-cu-q6", question: "Which musical genre is from Argentina?", options: ["Flamenco", "Salsa", "Mariachi", "Tango"], answerIndex: 3, explanation: "Tango originated in Buenos Aires, Argentina (and Montevideo, Uruguay) in the late 19th century." },
        { id: "es-cu-q7", question: "Flamenco, the passionate music and dance form, originated in:", options: ["Mexico", "Cuba", "Southern Spain (Andalusia)", "Colombia"], answerIndex: 2, explanation: "Flamenco originated in Andalusia, southern Spain \u2014 it's a UNESCO Intangible Cultural Heritage." },
        { id: "es-cu-q8", question: '"El F\xFAtbol" occupies what place in Spanish and Latin American culture?', options: ["A minor hobby", "Only popular with young men", "Central passion and community identity", "Declining in interest"], answerIndex: 2, explanation: "F\xFAtbol is the defining passion of most Spanish-speaking countries \u2014 uniting communities across all social classes." },
        { id: "es-cu-q9", question: 'The famous "Running of the Bulls" festival (Fiesta de San Ferm\xEDn) is held in:', options: ["Madrid", "Barcelona", "Pamplona", "Seville"], answerIndex: 2, explanation: `San Ferm\xEDn is held in Pamplona, Navarra, Spain \u2014 immortalized by Ernest Hemingway's "The Sun Also Rises".` },
        { id: "es-cu-q10", question: '"Me encanta" means:', options: ["I like it", "I hate it", "I love it (I'm enchanted by it)", "I'm not sure about it"], answerIndex: 2, explanation: '"Me encanta" = I love it! \u2014 stronger than "me gusta" (I like it). From "encantar" = to enchant.' }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇨🇳  MANDARIN CHINESE LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "chinese-vocab-greetings",
    category: "vocabulary",
    level: "beginner",
    targetLang: "chinese",
    title: "Mandarin Essentials: N\u01D0 h\u01CEo & Tones Basics",
    description: "Begin your Mandarin journey with essential greetings, the revolutionary concept of tones, and the Pinyin romanization system.",
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      introduction: "Mandarin Chinese (\u666E\u901A\u8BDD \u2014 P\u01D4t\u014Dnghu\xE0) is spoken by over 1 billion people and is the world's most spoken language by native speakers. Its most unique feature is TONES \u2014 the same syllable spoken in 4 different tones creates 4 completely different words! Pinyin is the romanization system that shows pronunciation. This lesson is your foundation.",
      words: [
        { word: "\u4F60\u597D (N\u01D0 h\u01CEo)", partOfSpeech: "greeting", definition: 'Hello \u2014 literally "you good". The universal Mandarin greeting for any time of day.', englishExample: "N\u01D0 h\u01CEo! N\u01D0 ji\xE0o sh\xE9nme m\xEDngz\xEC? \u2014 Hello! What is your name?" },
        { word: "\u8C22\u8C22 (Xi\xE8xi\xE8)", partOfSpeech: "phrase", definition: "Thank you \u2014 said with two falling tones. One of the first words every Chinese learner masters.", englishExample: "Xi\xE8xi\xE8 n\u01D0 de b\u0101ngzh\xF9! \u2014 Thank you for your help!" },
        { word: "\u5BF9\u4E0D\u8D77 (Du\xECbuq\u01D0)", partOfSpeech: "phrase", definition: "I'm sorry / Excuse me \u2014 used for apologies and when apologizing for an inconvenience.", englishExample: "Du\xECbuq\u01D0, w\u01D2 b\xF9 m\xEDngb\xE1i \u2014 I'm sorry, I don't understand." },
        { word: "\u4E0D\u5BA2\u6C14 (B\xFA k\xE8qi)", partOfSpeech: "phrase", definition: `You're welcome \u2014 literally "don't be polite/formal". The standard response to Xi\xE8xi\xE8.`, englishExample: "Xi\xE8xi\xE8! \u2014 B\xFA k\xE8qi! \u2014 Thank you! \u2014 You're welcome!" },
        { word: "\u6211\u53EB... (W\u01D2 ji\xE0o...)", partOfSpeech: "phrase", definition: 'My name is... \u2014 literally "I am called..." The standard Mandarin self-introduction.', englishExample: "W\u01D2 ji\xE0o L\u01D0 W\u011Bi. N\u01D0 ne? \u2014 My name is Li Wei. And you?" },
        { word: "The 4 Tones", partOfSpeech: "concept", definition: "1st (m\u0101-flat), 2nd (m\xE1-rising), 3rd (m\u01CE-dip), 4th (m\xE0-falling). Same spelling, 4 different meanings!", englishExample: "m\u0101=mother, m\xE1=hemp, m\u01CE=horse, m\xE0=scold \u2014 four words from one sound with different tones!" },
        { word: "\u518D\u89C1 (Z\xE0iji\xE0n)", partOfSpeech: "phrase", definition: 'Goodbye \u2014 literally "see again". The standard Mandarin farewell.', englishExample: "Z\xE0iji\xE0n! M\xEDngti\u0101n ji\xE0n! \u2014 Goodbye! See you tomorrow!" },
        { word: "\u8BF7 (Q\u01D0ng)", partOfSpeech: "phrase", definition: "Please / Please go ahead \u2014 a versatile politeness word used in requests and invitations.", englishExample: "Q\u01D0ng zu\xF2! \u2014 Please sit down! Q\u01D0ng w\xE8n... \u2014 May I ask..." }
      ],
      quiz: [
        { id: "zh-gr-q1", question: '"\u4F60\u597D (N\u01D0 h\u01CEo)" literally means:', options: ["Good morning", "How are you", "You are good / Hello", "Nice to meet you"], answerIndex: 2, explanation: '"N\u01D0 h\u01CEo" = You (N\u01D0) + Good (H\u01CEo) = literally "you good" \u2014 the universal Mandarin hello.' },
        { id: "zh-gr-q2", question: "Mandarin Chinese has how many tones?", options: ["2 tones", "3 tones", "4 tones (+ a neutral)", "6 tones"], answerIndex: 2, explanation: "Standard Mandarin has 4 tones plus a neutral/5th tone. Different tones on the same syllable = completely different words!" },
        { id: "zh-gr-q3", question: 'The word "m\u0101, m\xE1, m\u01CE, m\xE0" demonstrates that:', options: ["Spelling determines meaning", "The same syllable in 4 different tones means 4 different things", "Mandarin has no consistent rules", "These are all the same word"], answerIndex: 1, explanation: "m\u0101=mother, m\xE1=hemp, m\u01CE=horse, m\xE0=scold \u2014 4 completely different meanings from the same sound with different tones." },
        { id: "zh-gr-q4", question: '"\u8C22\u8C22 (Xi\xE8xi\xE8)" means:', options: ["Hello", "Goodbye", "Thank you", "Please"], answerIndex: 2, explanation: "\u8C22\u8C22 (Xi\xE8xi\xE8) = Thank you \u2014 one of the most important and recognizable Mandarin phrases." },
        { id: "zh-gr-q5", question: '"Pinyin" is:', options: ["A Chinese dialect", "The romanization system for Mandarin pronunciation", "A type of Chinese writing", "A grammar rule"], answerIndex: 1, explanation: "Pinyin (\u62FC\u97F3) is the official romanization system that shows how Mandarin is pronounced using Latin letters and tone marks." },
        { id: "zh-gr-q6", question: '"\u4E0D\u5BA2\u6C14 (B\xFA k\xE8qi)" is said in response to:', options: ["N\u01D0 h\u01CEo", "Z\xE0iji\xE0n", "Xi\xE8xi\xE8", "Du\xECbuq\u01D0"], answerIndex: 2, explanation: `"B\xFA k\xE8qi" = You're welcome \u2014 literally "don't be polite". Said in response to "Xi\xE8xi\xE8" (thank you).` },
        { id: "zh-gr-q7", question: '"\u518D\u89C1 (Z\xE0iji\xE0n)" literally means:', options: ["Good night", "See again (= Goodbye)", "Take care", "Until next time"], answerIndex: 1, explanation: '"Z\xE0i" = again, "Ji\xE0n" = see. \u518D\u89C1 = See again = Goodbye \u2014 a beautiful farewell.' },
        { id: "zh-gr-q8", question: '"\u6211\u53EB... (W\u01D2 ji\xE0o...)" is used to:', options: ["Ask someone's name", "Say where you're from", "Introduce yourself (My name is...)", "Express what you like"], answerIndex: 2, explanation: '"W\u01D2 ji\xE0o..." = My name is... (I am called...). "W\u01D2" = I/me, "ji\xE0o" = called/named.' },
        { id: "zh-gr-q9", question: '"\u8BF7 (Q\u01D0ng)" can mean:', options: ["Please / Please go ahead (versatile polite word)", "Thank you", "Excuse me only", "I'm sorry"], answerIndex: 0, explanation: '"\u8BF7" (Q\u01D0ng) = Please \u2014 used in requests "q\u01D0ng..." and invitations "q\u01D0ng zu\xF2" (please sit).' },
        { id: "zh-gr-q10", question: "Mandarin is the native language of approximately how many people?", options: ["100 million", "500 million", "1 billion+", "2 billion"], answerIndex: 2, explanation: "Mandarin Chinese has over 1 billion native speakers \u2014 making it the world's most spoken language by native speakers." }
      ]
    }
  },
  {
    id: "chinese-conv-restaurant",
    category: "conversation",
    level: "beginner",
    targetLang: "chinese",
    title: "Mandarin Conversations: Ordering at a Restaurant (\u70B9\u83DC)",
    description: "Practice ordering food, asking for recommendations, and paying the bill in Mandarin at a Chinese restaurant.",
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: "You are at a popular local Chinese restaurant (\u9910\u5385 \u2014 C\u0101nt\u012Bng) in Beijing. A friendly server comes to your table. You want to order kung pao chicken, dumplings, and tea. This conversation teaches practical restaurant Mandarin used daily across China.",
      speakerNames: ["Server (\u670D\u52A1\u5458)", "Customer (\u987E\u5BA2)"],
      transcript: [
        { speaker: "Server (\u670D\u52A1\u5458)", text: "N\xEDn h\u01CEo! N\xEDn y\xE0o di\u01CEn sh\xE9nme? (Hello! What would you like to order?)" },
        { speaker: "Customer (\u987E\u5BA2)", text: "N\u01D0 h\u01CEo! W\u01D2 y\xE0o g\u014Dngb\u01CEo j\u012Bd\u012Bng h\xE9 ji\u01CEozi. (Hello! I would like kung pao chicken and dumplings.)" },
        { speaker: "Server (\u670D\u52A1\u5458)", text: "H\u01CEo de! H\u0113 di\u01CEn sh\xE9nme? Ch\xE1 h\xE1ish\xEC p\xEDji\u01D4? (Good! What would you like to drink? Tea or beer?)" },
        { speaker: "Customer (\u987E\u5BA2)", text: "L\u01DCch\xE1, q\u01D0ng. Zh\xE8 d\xE0o c\xE0i l\xE0 ma? (Green tea, please. Is this dish spicy?)" },
        { speaker: "Server (\u670D\u52A1\u5458)", text: "G\u014Dngb\u01CEo j\u012Bd\u012Bng y\u01D2u y\u012Bdi\u01CEn l\xE0. K\u011By\u01D0 b\xF9 l\xE0 ma? (Kung pao chicken is a little spicy. Can I make it not spicy?)" },
        { speaker: "Customer (\u987E\u5BA2)", text: "B\xFA y\xE0o t\xE0i l\xE0. Xi\xE8xi\xE8! (Not too spicy. Thank you!)" },
        { speaker: "Server (\u670D\u52A1\u5458)", text: "M\xE9i w\xE8nt\xED! Q\u01D0ng sh\u0101o d\u011Bng. (No problem! Please wait a moment.)" },
        { speaker: "Customer (\u987E\u5BA2)", text: "M\xE1fan n\xEDn, m\u01CEid\u0101n! Du\u014Dsh\u01CEo qi\xE1n? (Excuse me, the bill please! How much is it?)" }
      ],
      quiz: [
        { id: "zh-rs-q1", question: '"\u9910\u5385 (C\u0101nt\u012Bng)" means:', options: ["Kitchen", "Restaurant", "Food market", "Canteen only"], answerIndex: 1, explanation: "\u9910\u5385 (C\u0101nt\u012Bng) = Restaurant. \u996D\u9986 (F\xE0ngu\u01CEn) is another word for restaurant (more casual)." },
        { id: "zh-rs-q2", question: '"\u60A8\u8981\u70B9\u4EC0\u4E48? (N\xEDn y\xE0o di\u01CEn sh\xE9nme?)" means:', options: ["Are you ready?", "What would you like to order?", "How many people?", "Do you have a reservation?"], answerIndex: 1, explanation: '"N\xEDn y\xE0o di\u01CEn sh\xE9nme?" = What would you like to order? \u70B9 (di\u01CEn) = to order (food).' },
        { id: "zh-rs-q3", question: '"\u5BAB\u4FDD\u9E21\u4E01 (G\u014Dngb\u01CEo J\u012Bd\u012Bng)" is:', options: ["Peking Duck", "Kung Pao Chicken", "Mapo Tofu", "Sweet and Sour Pork"], answerIndex: 1, explanation: "\u5BAB\u4FDD\u9E21\u4E01 (G\u014Dngb\u01CEo J\u012Bd\u012Bng) = Kung Pao Chicken \u2014 one of China's most internationally famous dishes." },
        { id: "zh-rs-q4", question: '"\u8FA3 (L\xE0)" means:', options: ["Sweet", "Salty", "Spicy", "Sour"], answerIndex: 2, explanation: "\u8FA3 (L\xE0) = Spicy/Hot. \u4E0D\u8981\u592A\u8FA3 = Don't make it too spicy. An important word when eating Sichuan food!" },
        { id: "zh-rs-q5", question: '"\u997A\u5B50 (Ji\u01CEozi)" are:', options: ["Spring rolls", "Chinese dumplings", "Fried rice", "Noodle soup"], answerIndex: 1, explanation: "\u997A\u5B50 (Ji\u01CEozi) = Chinese dumplings \u2014 a beloved staple eaten especially during Chinese New Year." },
        { id: "zh-rs-q6", question: '"\u6CA1\u95EE\u9898 (M\xE9i W\xE8nt\xED)" means:', options: ["What's the problem?", "No problem!", "I don't understand", "One moment please"], answerIndex: 1, explanation: '"M\xE9i W\xE8nt\xED" = No problem! \u2014 \u6CA1 (M\xE9i) = not/no, \u95EE\u9898 (W\xE8nt\xED) = problem/question.' },
        { id: "zh-rs-q7", question: '"\u4E70\u5355 (M\u01CEid\u0101n)" means:', options: ["Menu", "Discount", "The bill/check", "Receipt"], answerIndex: 2, explanation: "\u4E70\u5355 (M\u01CEid\u0101n) = The bill/check \u2014 how you ask for the check in a Chinese restaurant." },
        { id: "zh-rs-q8", question: '"\u591A\u5C11\u94B1? (Du\u014Dsh\u01CEo Qi\xE1n?)" means:', options: ["What time is it?", "How many people?", "How much money / How much does it cost?", "What is this?"], answerIndex: 2, explanation: '"Du\u014Dsh\u01CEo Qi\xE1n?" = How much money? = How much does it cost? Essential for all shopping in China.' },
        { id: "zh-rs-q9", question: '"\u7EFF\u8336 (L\u01DCch\xE1)" means:', options: ["Black tea", "Oolong tea", "Jasmine tea", "Green tea"], answerIndex: 3, explanation: "\u7EFF\u8336 (L\u01DCch\xE1) = Green tea. \u7EA2\u8336 (H\xF3ngch\xE1) = Red tea (= black tea in Western terms). \u8309\u8389\u82B1\u8336 = Jasmine tea." },
        { id: "zh-rs-q10", question: '"\u8BF7\u7A0D\u7B49 (Q\u01D0ng Sh\u0101o D\u011Bng)" means:', options: ["Come this way", "Enjoy your meal", "Please wait a moment", "You're welcome"], answerIndex: 2, explanation: '"Q\u01D0ng sh\u0101o d\u011Bng" = Please wait a moment. \u8BF7 = please, \u7A0D = a little, \u7B49 = wait.' }
      ]
    }
  },
  {
    id: "chinese-vocab-daily",
    category: "vocabulary",
    level: "beginner",
    targetLang: "chinese",
    title: "Mandarin Vocabulary: Numbers, Colors & Daily Life",
    description: "Master Mandarin numbers 1-10, essential colors, and everyday vocabulary for navigating life in China.",
    xpReward: 190,
    estimatedMinutes: 11,
    content: {
      introduction: "Numbers in Mandarin are beautifully logical \u2014 once you learn 1-10, you can count to 99 with simple combinations. Colors are also intuitive, many linked to nature. These words appear in every transaction, every conversation, and every aspect of daily life in Chinese-speaking countries.",
      words: [
        { word: "\u4E00\u4E8C\u4E09\u56DB\u4E94 (Y\u012B \xC8r S\u0101n S\xEC W\u01D4)", partOfSpeech: "number", definition: "One / Two / Three / Four / Five \u2014 the first five Mandarin numbers.", englishExample: 'W\u01D2 y\xE0o li\u01CEng g\xE8 \u2014 I want two (items). Note: "li\u01CEng" is used for "two" before measure words.' },
        { word: "\u516D\u4E03\u516B\u4E5D\u5341 (Li\xF9 Q\u012B B\u0101 Ji\u01D4 Sh\xED)", partOfSpeech: "number", definition: "Six / Seven / Eight / Nine / Ten \u2014 completing the first decade.", englishExample: "Sh\xED = ten, Sh\xED y\u012B = eleven, Sh\xED \xE8r = twelve. Chinese numbers follow a logical pattern!" },
        { word: "\u7EA2/\u84DD/\u9EC4 (H\xF3ng / L\xE1n / Hu\xE1ng)", partOfSpeech: "adjective", definition: "Red / Blue / Yellow \u2014 three core Chinese colors. Red (\u7EA2) is the luckiest color in Chinese culture.", englishExample: "H\xF3ng s\xE8 sh\xEC zh\u014Dnggu\xF3 de x\xECngy\xF9n y\xE1ns\xE8 \u2014 Red is China's lucky color." },
        { word: "\u767D/\u9ED1/\u7EFF (B\xE1i / H\u0113i / L\u01DC)", partOfSpeech: "adjective", definition: "White / Black / Green \u2014 three more essential Chinese color words.", englishExample: "W\u01D2 x\u01D0hu\u0101n l\u01DC ch\xE1 \u2014 I like green tea." },
        { word: "\u6C34/\u7C73\u996D/\u9E21\u86CB (Shu\u01D0 / M\u01D0f\xE0n / J\u012Bd\xE0n)", partOfSpeech: "noun", definition: "Water / Steamed rice / Egg \u2014 three essential Chinese food words used daily.", englishExample: "W\u01D2 y\xE0o m\u01D0f\xE0n \u2014 I want rice. J\u012Bd\xE0n ch\u01CEof\xE0n \u2014 Egg fried rice." },
        { word: "\u8D85\u5E02 (Ch\u0101osh\xEC)", partOfSpeech: "noun", definition: 'Supermarket \u2014 from "super" + "market". Modern supermarkets are everywhere in Chinese cities.', englishExample: "W\u01D2 q\xF9 ch\u0101osh\xEC m\u01CEi d\u014Dngxi \u2014 I'm going to the supermarket to buy things." },
        { word: "\u624B\u673A (Sh\u01D2uj\u012B)", partOfSpeech: "noun", definition: `Mobile phone \u2014 literally "hand machine". China is the world's largest smartphone market.`, englishExample: "N\u01D0 de sh\u01D2uj\u012B h\xE0o sh\xEC du\u014Dsh\u01CEo? \u2014 What is your mobile phone number?" },
        { word: "\u4EBA\u6C11\u5E01 (R\xE9nm\xEDnb\xEC) / \u5143 (Yu\xE1n)", partOfSpeech: "noun", definition: 'Chinese currency \u2014 Renminbi (RMB) is the official name; Yuan is the basic unit. Colloquially called "ku\xE0i".', englishExample: "Zh\xE8ge du\u014Dsh\u01CEo yu\xE1n? \u2014 How many yuan is this?" }
      ],
      quiz: [
        { id: "zh-dl-q1", question: 'What is the Mandarin word for "Ten"?', options: ["Ji\u01D4", "Sh\xED", "B\u0101", "Q\u012B"], answerIndex: 1, explanation: "\u5341 (Sh\xED) = Ten. Nine = Ji\u01D4 (\u4E5D), Eight = B\u0101 (\u516B), Seven = Q\u012B (\u4E03)." },
        { id: "zh-dl-q2", question: 'In Mandarin, "eleven" is expressed as:', options: ["Sh\xED y\u012B (10+1)", "Y\u012B y\u012B (1+1)", "Y\u012B sh\xED (1\xD710)", "Sh\xED y\u012B is a unique word"], answerIndex: 0, explanation: '"Sh\xED y\u012B" (\u5341\u4E00) = 10 + 1 = Eleven. Mandarin uses a logical additive system: 12 = Sh\xED \xE8r, 20 = \xC8r sh\xED, etc.' },
        { id: "zh-dl-q3", question: '"\u7EA2\u8272 (H\xF3ng s\xE8)" is which color?', options: ["Blue", "Yellow", "Red", "Green"], answerIndex: 2, explanation: "\u7EA2 (H\xF3ng) = Red. Red (\u7EA2) is the luckiest and most auspicious color in Chinese culture." },
        { id: "zh-dl-q4", question: '"\u7C73\u996D (M\u01D0f\xE0n)" means:', options: ["Noodles", "Bread", "Steamed rice", "Fried rice"], answerIndex: 2, explanation: "\u7C73\u996D (M\u01D0f\xE0n) = Steamed rice \u2014 the staple of Chinese cuisine. \u7C73 = uncooked rice, \u996D = cooked food/rice." },
        { id: "zh-dl-q5", question: '"\u624B\u673A (Sh\u01D2uj\u012B)" literally means:', options: ["Computer", "Hand machine (= Mobile phone)", "Watch", "Camera"], answerIndex: 1, explanation: "\u624B (Sh\u01D2u) = Hand + \u673A (J\u012B) = Machine. \u624B\u673A = Hand machine = Mobile phone. A wonderfully descriptive word!" },
        { id: "zh-dl-q6", question: "In Chinese culture, which color is considered the luckiest?", options: ["White", "Blue", "Red (\u7EA2)", "Gold only"], answerIndex: 2, explanation: "Red (\u7EA2\u8272 \u2014 H\xF3ng s\xE8) is the luckiest color in Chinese culture \u2014 used at weddings, New Year celebrations, and for good luck." },
        { id: "zh-dl-q7", question: '"\u8D85\u5E02 (Ch\u0101osh\xEC)" means:', options: ["Night market", "Street food stall", "Supermarket", "Shopping mall"], answerIndex: 2, explanation: "\u8D85\u5E02 (Ch\u0101osh\xEC) = Supermarket \u2014 from \u8D85 (super) + \u5E02 (market/city)." },
        { id: "zh-dl-q8", question: "China's currency is officially called:", options: ["Yuan only", "Renminbi (RMB)", "Kuai", "Jiao"], answerIndex: 1, explanation: `The official name is \u4EBA\u6C11\u5E01 (R\xE9nm\xEDnb\xEC = People's Currency), abbreviated RMB. The basic unit is \u5143 (Yu\xE1n). Colloquially "ku\xE0i" (\u5757).` },
        { id: "zh-dl-q9", question: '"\u7EFF (L\u01DC)" is which color?', options: ["Yellow", "Green", "Blue", "Black"], answerIndex: 1, explanation: "\u7EFF (L\u01DC) = Green. \u84DD (L\xE1n) = Blue. \u9EC4 (Hu\xE1ng) = Yellow. \u9ED1 (H\u0113i) = Black." },
        { id: "zh-dl-q10", question: '"\u4E94 (W\u01D4)" is which number?', options: ["3", "4", "5", "6"], answerIndex: 2, explanation: "\u4E94 (W\u01D4) = Five. The sequence: \u4E00(1) \u4E8C(2) \u4E09(3) \u56DB(4) \u4E94(5)." }
      ]
    }
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // 🇻🇳  VIETNAMESE LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "vietnamese-vocab-greetings",
    category: "vocabulary",
    level: "beginner",
    targetLang: "vietnamese",
    title: "Vietnamese Essentials: Xin ch\xE0o & Tonal Greetings",
    description: "Begin your Vietnamese journey with essential greetings, the 6-tone system, and polite address terms that are unique to Vietnamese culture.",
    xpReward: 210,
    estimatedMinutes: 13,
    content: {
      introduction: `Vietnamese (Ti\u1EBFng Vi\u1EC7t) is spoken by over 95 million people. It uses a romanized script (ch\u1EEF Qu\u1ED1c ng\u1EEF) with accent marks \u2014 making it more readable for beginners than Chinese or Japanese. However, Vietnamese has 6 tones, making it one of the world's most tonal languages! A unique feature: Vietnamese uses different words for "I" and "you" based on relative age and relationship.`,
      words: [
        { word: "Xin ch\xE0o!", partOfSpeech: "greeting", definition: "Hello! \u2014 the formal, universal Vietnamese greeting. Xin (please/respectful) + ch\xE0o (greeting).", englishExample: "Xin ch\xE0o! B\u1EA1n kh\u1ECFe kh\xF4ng? \u2014 Hello! How are you?" },
        { word: "C\u1EA3m \u01A1n / Kh\xF4ng c\xF3 g\xEC", partOfSpeech: "phrase", definition: "Thank you / You're welcome \u2014 the fundamental exchange of gratitude in Vietnamese.", englishExample: "C\u1EA3m \u01A1n b\u1EA1n r\u1EA5t nhi\u1EC1u! \u2014 Thank you very much!" },
        { word: "Xin l\u1ED7i", partOfSpeech: "phrase", definition: "Sorry / Excuse me \u2014 used for both apologies and getting someone's attention.", englishExample: "Xin l\u1ED7i, nh\xE0 v\u1EC7 sinh \u1EDF \u0111\xE2u? \u2014 Excuse me, where is the bathroom?" },
        { word: "T\xF4i / B\u1EA1n / Anh / Ch\u1ECB", partOfSpeech: "pronoun", definition: "I / You (peer) / You (older male) / You (older female) \u2014 Vietnamese pronouns reflect social relationships.", englishExample: "Anh t\xEAn l\xE0 g\xEC? \u2014 What is your name? (to an older male)" },
        { word: "T\xEAn t\xF4i l\xE0...", partOfSpeech: "phrase", definition: "My name is... \u2014 T\xEAn (name) + t\xF4i (I/my) + l\xE0 (is/am).", englishExample: "T\xEAn t\xF4i l\xE0 Minh. C\xF2n b\u1EA1n? \u2014 My name is Minh. And you?" },
        { word: "6 Tones (6 Thanh \u0110i\u1EC7u)", partOfSpeech: "concept", definition: "Vietnamese has 6 tones: flat, falling, rising, questioning, heavy, tumbling. Each changes the word's meaning completely.", englishExample: "Ma (ghost), M\xE1 (mother), M\xE0 (but), M\u1EA3 (tomb), M\xE3 (code), M\u1EA1 (rice seedling) \u2014 6 different words, one sound!" },
        { word: "V\xE2ng / Kh\xF4ng", partOfSpeech: "adverb", definition: "Yes (respectful) / No \u2014 V\xE2ng is used with elders as a sign of respect; D\u1EA1 is even more formal.", englishExample: "V\xE2ng, t\xF4i hi\u1EC3u. \u2014 Yes, I understand. Kh\xF4ng, c\u1EA3m \u01A1n. \u2014 No, thank you." },
        { word: "T\u1EA1m bi\u1EC7t", partOfSpeech: "phrase", definition: 'Goodbye \u2014 the standard Vietnamese farewell. Literally "temporary separation".', englishExample: "T\u1EA1m bi\u1EC7t! H\u1EB9n g\u1EB7p l\u1EA1i! \u2014 Goodbye! See you again!" }
      ],
      quiz: [
        { id: "vi-gr-q1", question: '"Xin ch\xE0o" is:', options: ["Goodbye", "Thank you", "Hello (universal greeting)", "Sorry"], answerIndex: 2, explanation: '"Xin ch\xE0o" = Hello \u2014 the universal Vietnamese greeting. "Xin" adds a respectful/polite tone.' },
        { id: "vi-gr-q2", question: "Vietnamese has how many tones?", options: ["2", "4", "6", "8"], answerIndex: 2, explanation: "Vietnamese has 6 tones (6 thanh \u0111i\u1EC7u), making it one of the world's most tonal languages." },
        { id: "vi-gr-q3", question: '"C\u1EA3m \u01A1n" means:', options: ["Excuse me", "Thank you", "You're welcome", "Hello"], answerIndex: 1, explanation: '"C\u1EA3m \u01A1n" = Thank you. "C\u1EA3m \u01A1n r\u1EA5t nhi\u1EC1u" = Thank you very much.' },
        { id: "vi-gr-q4", question: 'In Vietnamese, "Anh" is used to address:', options: ["A younger person", "A peer of the same age", "An older male", "An older female"], answerIndex: 2, explanation: '"Anh" is used to respectfully address an older male. "Ch\u1ECB" = older female. "B\u1EA1n" = peer/friend.' },
        { id: "vi-gr-q5", question: 'The word "Ma" spoken in 6 different Vietnamese tones creates:', options: ["The same word 6 times", 'Variations of the word "ghost"', "6 completely different words", "Formal and informal versions"], answerIndex: 2, explanation: "Ma/M\xE1/M\xE0/M\u1EA3/M\xE3/M\u1EA1 \u2014 6 different words (ghost/mother/but/tomb/code/rice seedling) from one syllable in different tones!" },
        { id: "vi-gr-q6", question: '"Xin l\u1ED7i" is used for:', options: ["Thanking someone", "Greeting someone", "Apologizing or getting attention", "Saying goodbye"], answerIndex: 2, explanation: `"Xin l\u1ED7i" = Sorry / Excuse me \u2014 used for both apologies and getting someone's attention politely.` },
        { id: "vi-gr-q7", question: '"T\u1EA1m bi\u1EC7t" means:', options: ["Hello again", "See you soon", "Goodbye", "Good night"], answerIndex: 2, explanation: '"T\u1EA1m bi\u1EC7t" = Goodbye \u2014 literally means "temporary separation". The standard farewell.' },
        { id: "vi-gr-q8", question: "Vietnamese uses which writing script?", options: ["Chinese characters", "Its own unique alphabet", "Romanized script with accent marks (ch\u1EEF Qu\u1ED1c ng\u1EEF)", "Arabic script"], answerIndex: 2, explanation: "Vietnamese uses romanized Latin script with diacritical marks for tones \u2014 making it more accessible for beginners than other Asian languages." },
        { id: "vi-gr-q9", question: '"V\xE2ng" is a respectful way to say:', options: ["No", "Maybe", "Yes (used with elders)", "Please"], answerIndex: 2, explanation: '"V\xE2ng" = Yes (respectful), used when speaking to elders or people of higher status. "D\u1EA1" is even more formal.' },
        { id: "vi-gr-q10", question: "Vietnamese is spoken by approximately how many people?", options: ["20 million", "50 million", "95+ million", "200 million"], answerIndex: 2, explanation: "Vietnamese is spoken by over 95 million people \u2014 primarily in Vietnam but also by diaspora communities worldwide." }
      ]
    }
  },
  {
    id: "vietnamese-conv-streetfood",
    category: "conversation",
    level: "beginner",
    targetLang: "vietnamese",
    title: "Vietnamese Conversations: At a Street Food Stall",
    description: "Practice ordering Vietnam's incredible street food \u2014 ph\u1EDF, b\xE1nh m\xEC, b\xFAn b\xF2 \u2014 and navigating a Vietnamese food stall with real dialogue.",
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: "You are at a bustling street food stall (qu\xE1n \u0103n v\u1EC9a h\xE8) in Hanoi's Old Quarter. A friendly vendor is selling fresh bowls of ph\u1EDF (beef noodle soup). You want to order, customize your bowl, and ask about other dishes. Vietnamese street food culture is one of the world's finest!",
      speakerNames: ["Vendor (Ch\u1EE7 qu\xE1n)", "Customer (Kh\xE1ch)"],
      transcript: [
        { speaker: "Vendor (Ch\u1EE7 qu\xE1n)", text: "Ch\xE0o b\u1EA1n! B\u1EA1n mu\u1ED1n \u0103n g\xEC? (Hello! What would you like to eat?)" },
        { speaker: "Customer (Kh\xE1ch)", text: "Cho t\xF4i m\u1ED9t t\xF4 ph\u1EDF b\xF2, xin c\u1EA3m \u01A1n! (Please give me one bowl of beef ph\u1EDF, thank you!)" },
        { speaker: "Vendor (Ch\u1EE7 qu\xE1n)", text: "T\xE1i hay ch\xEDn? Ph\u1EDF b\xF2 t\xE1i hay ch\xEDn b\u1EA1n? (Rare or well-done? Rare or well-done beef ph\u1EDF?)" },
        { speaker: "Customer (Kh\xE1ch)", text: "Ch\xEDn, c\u1EA3m \u01A1n. Cay kh\xF4ng? (Well-done, thank you. Is it spicy?)" },
        { speaker: "Vendor (Ch\u1EE7 qu\xE1n)", text: "Kh\xF4ng cay. B\u1EA1n c\xF3 th\u1EC3 th\xEAm \u1EDBt n\u1EBFu mu\u1ED1n. (Not spicy. You can add chili if you want.)" },
        { speaker: "Customer (Kh\xE1ch)", text: "T\xF4i mu\u1ED1n kh\xF4ng cay. Bao nhi\xEAu ti\u1EC1n m\u1ED9t t\xF4? (I want no spice. How much is one bowl?)" },
        { speaker: "Vendor (Ch\u1EE7 qu\xE1n)", text: "N\u0103m m\u01B0\u01A1i ngh\xECn \u0111\u1ED3ng m\u1ED9t t\xF4. R\u1EBB l\u1EAFm! (Fifty thousand dong per bowl. Very cheap!)" },
        { speaker: "Customer (Kh\xE1ch)", text: "Ngon qu\xE1! T\xF4i mu\u1ED1n th\xEAm m\u1ED9t t\xF4 n\u1EEFa. (So delicious! I want one more bowl.)" }
      ],
      quiz: [
        { id: "vi-sf-q1", question: '"Ph\u1EDF (Ph\u1EDF B\xF2)" is:', options: ["Grilled pork with noodles", "Vietnamese beef noodle soup", "A Vietnamese sandwich", "Fried rice dish"], answerIndex: 1, explanation: "Ph\u1EDF B\xF2 (ph\u1EDF = noodle soup, b\xF2 = beef) is Vietnam's most iconic dish \u2014 a fragrant beef noodle soup." },
        { id: "vi-sf-q2", question: '"B\u1EA1n mu\u1ED1n \u0103n g\xEC?" means:', options: ["Are you hungry?", "What did you eat?", "What would you like to eat?", "Is the food ready?"], answerIndex: 2, explanation: '"B\u1EA1n mu\u1ED1n \u0103n g\xEC?" = What would you like to eat? Mu\u1ED1n = want, \u0102n = eat, G\xEC = what.' },
        { id: "vi-sf-q3", question: '"Cho t\xF4i..." is used to:', options: ["Ask a question", "Say thank you", "Ask someone to give you something / order", "Refuse something"], answerIndex: 2, explanation: `"Cho t\xF4i..." = Please give me / I'd like... \u2014 the standard way to order in Vietnamese.` },
        { id: "vi-sf-q4", question: '"T\xE1i" means what type of beef in ph\u1EDF?', options: ["Well-done", "Rare (barely cooked)", "Medium", "Grilled"], answerIndex: 1, explanation: '"T\xE1i" = Rare beef, added raw and cooked by the hot soup. "Ch\xEDn" = well-done beef.' },
        { id: "vi-sf-q5", question: '"Cay kh\xF4ng?" means:', options: ["Is it cheap?", "Is it fresh?", "Is it spicy?", "Is it delicious?"], answerIndex: 2, explanation: '"Cay kh\xF4ng?" = Is it spicy? Cay = spicy in Vietnamese. Not (kh\xF4ng) + spicy (cay) = kh\xF4ng cay = not spicy.' },
        { id: "vi-sf-q6", question: '"Bao nhi\xEAu ti\u1EC1n?" means:', options: ["How many people?", "How much money / How much does it cost?", "What time is it?", "How far is it?"], answerIndex: 1, explanation: '"Bao nhi\xEAu ti\u1EC1n?" = How much money? = How much does it cost? Essential for Vietnamese shopping and dining.' },
        { id: "vi-sf-q7", question: "Vietnamese currency is called:", options: ["Baht", "Dong (\u0110\u1ED3ng)", "Ringgit", "Peso"], answerIndex: 1, explanation: `Vietnam's currency is the \u0110\u1ED3ng (\u20AB). "N\u0103m m\u01B0\u01A1i ngh\xECn \u0111\u1ED3ng" = 50,000 dong (approximately $2 USD).` },
        { id: "vi-sf-q8", question: '"Ngon qu\xE1!" means:', options: ["Too spicy!", "Very expensive!", "So delicious!", "Very cheap!"], answerIndex: 2, explanation: '"Ngon qu\xE1!" = So delicious! Ngon = delicious/tasty, Qu\xE1 = very/too. Perfect for complimenting Vietnamese food.' },
        { id: "vi-sf-q9", question: '"Th\xEAm m\u1ED9t t\xF4 n\u1EEFa" means:', options: ["The bill please", "Another bowl please", "A smaller bowl please", "No more please"], answerIndex: 1, explanation: '"Th\xEAm" = more/add. "M\u1ED9t t\xF4 n\u1EEFa" = one more bowl. \u2192 Another bowl please.' },
        { id: "vi-sf-q10", question: "Vietnamese street food is recognized for being:", options: ["Mostly desserts", "Expensive and exclusive", "Among the world's finest and most flavorful affordable cuisines", "Simple and bland"], answerIndex: 2, explanation: "Vietnamese street food (especially ph\u1EDF, b\xE1nh m\xEC, b\xFAn b\xF2) is internationally celebrated as some of the world's best and most accessible cuisine." }
      ]
    }
  },
  {
    id: "vietnamese-vocab-culture",
    category: "vocabulary",
    level: "intermediate",
    targetLang: "vietnamese",
    title: "Vietnamese Vocabulary: Food, Culture & Daily Life",
    description: "Explore Vietnamese cultural vocabulary \u2014 iconic foods, cultural values, festivals, and daily life words that reflect Vietnam's rich heritage.",
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: "Vietnam is a country of extraordinary natural beauty, rich history, and vibrant culture. From the ancient town of H\u1ED9i An to the limestone karsts of H\u1EA1 Long Bay, Vietnamese culture blends Confucian values, Buddhist traditions, French colonial influence, and indigenous creativity. This vocabulary connects you to the heart of Vietnamese life.",
      words: [
        { word: "B\xE1nh m\xEC", partOfSpeech: "noun", definition: "Vietnamese sandwich \u2014 a fusion baguette from French colonial influence, filled with Vietnamese ingredients. UNESCO-recognized street food.", englishExample: "B\xE1nh m\xEC th\u1ECBt n\u01B0\u1EDBng ngon l\u1EAFm! \u2014 Grilled pork b\xE1nh m\xEC is so delicious!" },
        { word: "T\u1EBFt Nguy\xEAn \u0110\xE1n", partOfSpeech: "noun", definition: "Vietnamese Lunar New Year \u2014 the most important Vietnamese festival, celebrating family reunion, luck, and new beginnings.", englishExample: "Ch\xFAc m\u1EEBng n\u0103m m\u1EDBi! \u2014 Happy New Year! (Said during T\u1EBFt)" },
        { word: "Gia \u0111\xECnh", partOfSpeech: "noun", definition: "Family \u2014 the cornerstone of Vietnamese society. Confucian values place enormous emphasis on family loyalty and filial piety.", englishExample: "Gia \u0111\xECnh l\xE0 quan tr\u1ECDng nh\u1EA5t \u2014 Family is the most important thing." },
        { word: "N\xF3n l\xE1", partOfSpeech: "noun", definition: "Conical hat \u2014 the iconic Vietnamese palm-leaf hat, a symbol of Vietnamese identity and women's grace.", englishExample: "N\xF3n l\xE1 l\xE0 bi\u1EC3u t\u01B0\u1EE3ng c\u1EE7a Vi\u1EC7t Nam \u2014 The conical hat is a symbol of Vietnam." },
        { word: "\xC1o d\xE0i", partOfSpeech: "noun", definition: "Traditional Vietnamese dress \u2014 the national costume, a fitted silk tunic worn over trousers. Elegant and iconic.", englishExample: "\xC1o d\xE0i r\u1EA5t \u0111\u1EB9p \u2014 The \xE1o d\xE0i is very beautiful." },
        { word: "C\xE0 ph\xEA tr\u1EE9ng", partOfSpeech: "noun", definition: "Egg coffee \u2014 a uniquely Vietnamese specialty from Hanoi: strong coffee topped with creamy, sweetened egg yolk foam.", englishExample: "C\xE0 ph\xEA tr\u1EE9ng H\xE0 N\u1ED9i n\u1ED5i ti\u1EBFng th\u1EBF gi\u1EDBi \u2014 Hanoi's egg coffee is world-famous." },
        { word: "H\u1ED9i An", partOfSpeech: "noun", definition: "A UNESCO World Heritage ancient town \u2014 famous for its well-preserved trading port architecture, lanterns, and tailors.", englishExample: "H\u1ED9i An r\u1EA5t \u0111\u1EB9p v\xE0o ban \u0111\xEAm \u2014 H\u1ED9i An is very beautiful at night." },
        { word: "Ch\xFAc m\u1EEBng!", partOfSpeech: "phrase", definition: "Congratulations! \u2014 used for birthdays, new year, achievements, and celebrations.", englishExample: "Ch\xFAc m\u1EEBng sinh nh\u1EADt! \u2014 Happy Birthday! / Congratulations on your birthday!" }
      ],
      quiz: [
        { id: "vi-cu-q1", question: '"B\xE1nh m\xEC" is a Vietnamese sandwich that shows which cultural influence?', options: ["Chinese influence", "American influence", "French colonial influence (baguette)", "Japanese influence"], answerIndex: 2, explanation: "B\xE1nh m\xEC uses a French baguette (from French colonial era) filled with Vietnamese ingredients \u2014 a delicious cultural fusion." },
        { id: "vi-cu-q2", question: '"T\u1EBFt Nguy\xEAn \u0110\xE1n" is:', options: ["Vietnam's Independence Day", "The Lunar New Year \u2014 Vietnam's most important festival", "A harvest festival", "A Buddhist holiday only"], answerIndex: 1, explanation: "T\u1EBFt Nguy\xEAn \u0110\xE1n = Vietnamese Lunar New Year \u2014 the most significant national celebration, emphasizing family, luck, and new beginnings." },
        { id: "vi-cu-q3", question: '"\xC1o d\xE0i" is:', options: ["A traditional Vietnamese hat", "A Vietnamese musical instrument", "Vietnam's national traditional dress (fitted silk tunic)", "A type of Vietnamese noodle"], answerIndex: 2, explanation: "\xC1o d\xE0i (Long shirt) = Vietnam's beautiful national dress \u2014 a fitted silk tunic worn over trousers, especially by women." },
        { id: "vi-cu-q4", question: '"Gia \u0111\xECnh" means:', options: ["Village", "Community", "Family", "Ancestors"], answerIndex: 2, explanation: '"Gia \u0111\xECnh" = Family \u2014 the foundation of Vietnamese society, rooted in Confucian values of family loyalty.' },
        { id: "vi-cu-q5", question: '"Ch\xFAc m\u1EEBng sinh nh\u1EADt!" means:', options: ["Happy New Year", "Happy Birthday / Congratulations on your birthday", "Congratulations on your wedding", "Welcome home"], answerIndex: 1, explanation: '"Ch\xFAc m\u1EEBng sinh nh\u1EADt!" = Happy Birthday! Ch\xFAc m\u1EEBng = Congratulations/Happy, Sinh nh\u1EADt = Birthday.' },
        { id: "vi-cu-q6", question: '"N\xF3n l\xE1" is:', options: ["A Vietnamese drum", "The iconic conical palm-leaf hat", "A traditional Vietnamese dance", "A type of Vietnamese fabric"], answerIndex: 1, explanation: '"N\xF3n l\xE1" = Conical hat \u2014 the iconic Vietnamese palm-leaf hat, a recognized symbol of Vietnamese identity and femininity.' },
        { id: "vi-cu-q7", question: '"C\xE0 ph\xEA tr\u1EE9ng" is a specialty from which Vietnamese city?', options: ["Ho Chi Minh City", "Da Nang", "Hanoi (H\xE0 N\u1ED9i)", "H\u1ED9i An"], answerIndex: 2, explanation: '"C\xE0 ph\xEA tr\u1EE9ng" (egg coffee) originated in Hanoi (H\xE0 N\u1ED9i) in the 1940s and is now world-famous.' },
        { id: "vi-cu-q8", question: '"H\u1ED9i An" is recognized as:', options: ["Vietnam's capital city", "A UNESCO World Heritage ancient trading town", "Vietnam's largest market", "A modern Vietnamese city"], answerIndex: 1, explanation: "H\u1ED9i An (\u53E4\u6703\u5B89) is a beautifully preserved UNESCO World Heritage ancient town famous for its lanterns, history, and tailors." },
        { id: "vi-cu-q9", question: "Vietnamese culture is primarily influenced by:", options: ["Only French colonial history", "Confucian values, Buddhist traditions, and indigenous heritage", "Only Chinese culture", "Western culture primarily"], answerIndex: 1, explanation: "Vietnamese culture blends Confucian values, Buddhist traditions, indigenous cultures, and French colonial influence into a unique identity." },
        { id: "vi-cu-q10", question: '"Ch\xFAc m\u1EEBng n\u0103m m\u1EDBi!" means:', options: ["Goodbye for the year", "Happy New Year! (T\u1EBFt greeting)", "Welcome to Vietnam", "Best wishes always"], answerIndex: 1, explanation: '"Ch\xFAc m\u1EEBng n\u0103m m\u1EDBi!" = Happy New Year! \u2014 the most important T\u1EBFt greeting exchanged between family and friends.' }
      ]
    }
  }
];

// src/examsData.ts
var EXAM_QUESTIONS = [
  // --- GRAMMAR (1-10) ---
  {
    id: "ex-1",
    question: "She has ________ in London since she graduated from university in 2018.",
    options: ["lived", "lives", "living", "been lived"],
    answerIndex: 0,
    explanation: 'The present perfect tense (has + past participle "lived") is used here because the action started in the past (2018) and continues to the present, signaled by the word "since".'
  },
  {
    id: "ex-2",
    question: "If I had known about the traffic delays, I ________ a different route.",
    options: ["will take", "took", "would have taken", "take"],
    answerIndex: 2,
    explanation: "This is a third conditional sentence, which refers to an imaginary situation in the past. The structure is [If + Past Perfect (had known)], [would have + Past Participle (would have taken)]."
  },
  {
    id: "ex-3",
    question: "The new environmental protection laws ________ by the government next month.",
    options: ["will introduce", "will be introduced", "are introducing", "introduced"],
    answerIndex: 1,
    explanation: "The sentence requires the future passive voice because the subject (the laws) receives the action of being introduced by the agent (the government). The formula is [will be + past participle]."
  },
  {
    id: "ex-4",
    question: "Henry asked me ________ I had finished the quarterly report.",
    options: ["that", "weather", "if", "what"],
    answerIndex: 2,
    explanation: 'In reported questions for yes/no questions, we use "if" or "whether" (spelled "whether", not "weather") to introduce the reported clause.'
  },
  {
    id: "ex-5",
    question: "Our manager suggested ________ the deadline to allow for thorough testing.",
    options: ["postpone", "postponing", "to postpone", "postponed"],
    answerIndex: 1,
    explanation: 'The verb "suggest" is followed by a gerund (verb-ing) when there is no direct object pronoun or "that" clause: "suggested postponing".'
  },
  {
    id: "ex-6",
    question: "The group of students, along with their teacher, ________ visiting the museum today.",
    options: ["is", "are", "were", "be"],
    answerIndex: 0,
    explanation: 'The subject of the sentence is "The group" (singular collective noun). Phrases like "along with their teacher" do not change the number of the subject. Therefore, the singular verb "is" is correct.'
  },
  {
    id: "ex-7",
    question: "You ________ submit the project proposal today; the director extended the deadline to Friday.",
    options: ["must not", "need not", "should", "ought to"],
    answerIndex: 1,
    explanation: `"Need not" (or "don't have to") expresses lack of obligation or necessity. Since the deadline was extended, submitting it today is not necessary.`
  },
  {
    id: "ex-8",
    question: "The company ________ logo is a blue bird has recently rebranded.",
    options: ["which", "who", "whom", "whose"],
    answerIndex: 3,
    explanation: 'The relative pronoun "whose" is possessive and shows that the logo belongs to the company.'
  },
  {
    id: "ex-9",
    question: "________ she worked incredibly hard, she was not promoted this quarter.",
    options: ["Despite", "Although", "However", "In spite of"],
    answerIndex: 1,
    explanation: '"Although" is a conjunction used to introduce a clause of concession (subject + verb: "she worked"). "Despite" and "In spite of" require a noun or gerund.'
  },
  {
    id: "ex-10",
    question: "By the time the guest speaker arrives, we ________ the auditorium.",
    options: ["will prepare", "prepared", "will have prepared", "are preparing"],
    answerIndex: 2,
    explanation: "The future perfect tense (will have prepared) is used to describe an action that will be completed before a specific point in the future (the arrival of the speaker)."
  },
  // --- VOCABULARY (11-20) ---
  {
    id: "ex-11",
    question: "If you want to reach an agreement, both sides need to meet each other ________.",
    options: ["in the middle", "halfway", "at the table", "on the corner"],
    answerIndex: 1,
    explanation: 'The idiom "meet someone halfway" means to make a compromise or reach an agreement by making concessions on both sides.'
  },
  {
    id: "ex-12",
    question: "Our project proposal was rejected, so we had to go back to the ________.",
    options: ["first page", "drawing board", "square one", "starting gate"],
    answerIndex: 1,
    explanation: 'The idiom "go back to the drawing board" means to start planning a failed project or idea again from the very beginning with a new approach.'
  },
  {
    id: "ex-13",
    question: "The company decided to ________ the opportunity to expand into the Asian market.",
    options: ["seize", "catch", "hold", "lock"],
    answerIndex: 0,
    explanation: '"Seize the opportunity" is a strong collocation meaning to eagerly take advantage of a favorable situation immediately.'
  },
  {
    id: "ex-14",
    question: "Let's touch ________ next Monday to review the client feedback.",
    options: ["base", "point", "ground", "line"],
    answerIndex: 0,
    explanation: 'The business idiom "touch base" means to briefly make contact with someone to update each other on progress.'
  },
  {
    id: "ex-15",
    question: "Which word is a synonym for 'ephemeral'?",
    options: ["permanent", "temporary", "fleeting", "insignificant"],
    answerIndex: 2,
    explanation: '"Ephemeral" means lasting for a very short time. "Fleeting" is a direct synonym describing something passing quickly.'
  },
  {
    id: "ex-16",
    question: "What does 'on the same page' mean in a business context?",
    options: ["Reading the same document", "In agreement with the plan", "Working at the same desk", "Having the same work shifts"],
    answerIndex: 1,
    explanation: 'Being "on the same page" is a corporate metaphor meaning to have the same understanding, ideas, or agreement on a plan.'
  },
  {
    id: "ex-17",
    question: "We need to look at the big ________, rather than focusing purely on minor details.",
    options: ["map", "picture", "frame", "canvas"],
    answerIndex: 1,
    explanation: 'The expression "the big picture" refers to the entire perspective, overall situation, or long-term plan rather than isolated details.'
  },
  {
    id: "ex-18",
    question: "She is highly qualified ________ the post, with ten years of leadership experience.",
    options: ["for", "at", "to", "with"],
    answerIndex: 0,
    explanation: 'The adjective "qualified" is followed by the preposition "for" when specifying a job, role, or position.'
  },
  {
    id: "ex-19",
    question: "The board decided to ________ the annual meeting until next quarter due to travel restrictions.",
    options: ["put off", "put out", "call off", "call out"],
    answerIndex: 0,
    explanation: 'The phrasal verb "put off" means to postpone an event. "Call off" means to cancel it completely.'
  },
  {
    id: "ex-20",
    question: "The manager praised the team's ________ effort in resolving the customer crisis.",
    options: ["collaborative", "collateral", "compulsory", "complacent"],
    answerIndex: 0,
    explanation: '"Collaborative" refers to cooperative joint action by multiple people working together toward a common goal.'
  },
  // --- LISTENING & DIALOGUE (21-25) ---
  {
    id: "ex-21",
    question: "Speaker A: 'Do you mind if I close the window?' Speaker B: '________, please go ahead. It is getting chilly.'",
    options: ["Yes, I do", "Not at all", "Of course", "Yes, please"],
    answerIndex: 1,
    explanation: '"Do you mind" asks if closing the window would bother someone. "Not at all" means "I do not mind; it is fine for you to close it".'
  },
  {
    id: "ex-22",
    question: "If someone says 'Let's call it a day', what do they mean?",
    options: ["Let's write down the date", "Let's stop working for today", "Let's schedule a meeting", "Let's celebrate the day"],
    answerIndex: 1,
    explanation: 'To "call it a day" is an idiom meaning to stop what you are doing (usually work) because you have done enough for the day.'
  },
  {
    id: "ex-23",
    question: "Speaker A: 'Could you give me a hand with this suitcase?' Speaker B: '________. It looks very heavy.'",
    options: ["Sure, no problem", "No, I can't", "You are welcome", "Thanks a lot"],
    answerIndex: 0,
    explanation: '"Sure, no problem" is a polite, helpful way to accept a request to assist someone.'
  },
  {
    id: "ex-24",
    question: "When checking into a hotel, which phrase is most natural to inquire if breakfast is free?",
    options: ["Is breakfast included in the room rate?", "How is the breakfast today?", "Do you feed us breakfast?", "Where do I eat breakfast?"],
    answerIndex: 0,
    explanation: '"Is breakfast included in the room rate?" is the standard polite formulation to ask if breakfast is covered by the payment.'
  },
  {
    id: "ex-25",
    question: "Speaker A: 'I'm sorry, I've misplaced your notebook.' Speaker B: '________. I have plenty of others.'",
    options: ["No problem", "Don't mention it", "Never mind", "Both A and C are correct"],
    answerIndex: 3,
    explanation: 'Both "No problem" and "Never mind" are appropriate friendly responses to a minor apology, reassuring the speaker that it is fine.'
  },
  // --- PRONUNCIATION (26-30) ---
  {
    id: "ex-26",
    question: "Which word has the same short /\xE6/ vowel sound as 'cat'?",
    options: ["car", "cake", "stamp", "saw"],
    answerIndex: 2,
    explanation: '"Stamp" contains the short /\xE6/ sound. "Car" has /\u0251:/, "Cake" has /e\u026A/, and "Saw" has /\u0254:/.'
  },
  {
    id: "ex-27",
    question: "Which word contains the long /i:/ sound as in the word 'sleep'?",
    options: ["slip", "beach", "bread", "friend"],
    answerIndex: 1,
    explanation: '"Beach" is pronounced with the long /i:/ sound. "Slip" has the short /\u026A/, "Bread" has the short /e/, and "Friend" has the short /e/.'
  },
  {
    id: "ex-28",
    question: "Which word has a silent letter 'b'?",
    options: ["climb", "double", "timber", "rabbit"],
    answerIndex: 0,
    explanation: 'In the word "climb", the final letter "b" is silent, so the word is pronounced /kla\u026Am/.'
  },
  {
    id: "ex-29",
    question: "How many syllables are in the word 'pronunciation'?",
    options: ["4", "5", "6", "7"],
    answerIndex: 2,
    explanation: 'The word "pronunciation" has six syllables: pro-nun-ci-a-tion (/pr\u0259-n\u028Cn-si-e\u026A-\u0283n/).'
  },
  {
    id: "ex-30",
    question: "Which syllable is stressed in the noun form of 'contract' (e.g. a business agreement)?",
    options: ["First syllable ('con')", "Second syllable ('tract')", "Both syllables equally", "It depends on the speaker's accent"],
    answerIndex: 0,
    explanation: 'For the noun "contract", the stress is placed on the first syllable: /\u02C8k\u0252ntr\xE6kt/. (Note: the verb form "contract" is stressed on the second syllable: /k\u0259n\u02C8tr\xE6kt/).'
  }
];

// src/data/languageModules.ts
var languageModules = [
  {
    id: "english",
    language: "English",
    flag: "\u{1F1EC}\u{1F1E7}",
    color: "#1e3a8a",
    gradient: "from-blue-700 to-indigo-600",
    lessons: [
      {
        id: "en-01",
        title: "Mastering English Verb Tenses: Present vs. Past",
        description: "Understand the essential mechanics of Simple Present, Present Continuous, and Past Simple",
        type: "grammar",
        difficulty: "beginner",
        duration: "15 min",
        content: {
          intro: "English verb tenses allow speakers to place actions clearly in time. Learn when to use simple present habits versus ongoing present actions and completed past events.",
          keyPhrases: [
            { native: "I work at a tech company in London.", romanized: "Present Simple", english: "Expresses permanent routine or fact" },
            { native: "She is currently developing a new application.", romanized: "Present Continuous", english: "Describes an action happening right now" },
            { native: "We completed the presentation yesterday afternoon.", romanized: "Past Simple", english: "Refers to a finished event in the past" },
            { native: "Have you ever travelled to Southeast Asia?", romanized: "Present Perfect", english: "Asks about life experience at an unspecified time" }
          ],
          tips: [
            "Use Present Simple for daily routines, permanent states, and universal truths.",
            'Use Present Continuous with time signals like "right now", "currently", or "at the moment".',
            "Regular past verbs add -ed, while irregular verbs change forms entirely (e.g. go -> went)."
          ],
          practice: "Write 3 sentences describing what you do every day, what you are doing right now, and what you accomplished yesterday."
        }
      },
      {
        id: "en-02",
        title: "Modal Verbs & Polite Requests (Could, Would, Should)",
        description: "Sound natural and diplomatic using English modal auxiliary verbs",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Modal verbs alter the tone of your message from direct to courteous, helpful, and diplomatic. Mastering them is essential for natural English communication.",
          keyPhrases: [
            { native: "Could you please send over the latest financial report?", romanized: "Polite Request", english: "Could you please send over the latest financial report?" },
            { native: "Would you mind if I opened the window?", romanized: "Courteous Inquiry", english: "Would you mind if I opened the window?" },
            { native: "You should double-check the figures before submission.", romanized: "Constructive Advice", english: "You should double-check the figures before submission." },
            { native: "I would be delighted to assist you with the project.", romanized: "Willingness / Offer", english: "I would be delighted to assist you with the project." }
          ],
          tips: [
            '"Could you" and "Would you mind" are significantly more polite in business settings than "Can you".',
            '"Would you mind" is always followed by a gerund verb (-ing form): "Would you mind helping me?"',
            "Never add an -s to a modal verb (he should, never he shoulds)."
          ],
          practice: 'Transform 3 direct demands into polite requests using "Could you please..." and "Would you mind...".'
        }
      },
      {
        id: "en-03",
        title: "Conditional Clauses: Real vs. Hypothetical Situations",
        description: "Master First, Second, and Third Conditionals for discussing possibilities and outcomes",
        type: "grammar",
        difficulty: "advanced",
        duration: "20 min",
        content: {
          intro: "Conditionals express cause-and-effect relationships. Learn how native speakers shift tenses to convey realistic future outcomes versus imaginary hypothetical scenarios.",
          keyPhrases: [
            { native: "If we launch next week, we will capture early market demand.", romanized: "First Conditional (Real)", english: "Real possibility in the present or future" },
            { native: "If I had more resources, I would expand our research team.", romanized: "Second Conditional (Unreal)", english: "Hypothetical or unlikely present situation" },
            { native: "If we had booked earlier, we would have saved twenty percent.", romanized: "Third Conditional (Past Regret)", english: "Impossible change to a past event" },
            { native: "Unless we receive approval today, the deadline will slip.", romanized: "Negative Condition", english: '"Unless" equals "if not"' }
          ],
          tips: [
            'Never place "will" or "would" inside the "if" clause itself.',
            'In Second Conditional, formal English uses "were" for all subjects: "If I were you..."',
            'Use "unless" to emphasize that an outcome will only occur if a condition is met.'
          ],
          practice: "Formulate one realistic plan using First Conditional and one hypothetical wish using Second Conditional."
        }
      },
      {
        id: "en-04",
        title: "Passive Voice in Corporate & Academic Writing",
        description: "Shift focus from the actor to the action in formal English documentation",
        type: "grammar",
        difficulty: "advanced",
        duration: "18 min",
        content: {
          intro: "The passive voice is widely used in scientific papers, corporate audits, and news broadcasts when the action itself is more significant than who performed it.",
          keyPhrases: [
            { native: "The quarterly audit was conducted by an external consultancy.", romanized: "Passive with Agent", english: "Focuses on the audit rather than the auditors" },
            { native: "Significant progress has been made toward our sustainability targets.", romanized: "Present Perfect Passive", english: "Highlights ongoing achievements" },
            { native: "All confidential files must be encrypted before transmission.", romanized: "Modal Passive", english: "Establishes general compliance protocol" },
            { native: "It is widely believed that artificial intelligence will transform logistics.", romanized: "Impersonal Passive", english: "Reports collective perspective objectively" }
          ],
          tips: [
            'Structure: Form of "to be" + Past Participle (V3).',
            "Use the passive voice when the agent is unknown, obvious, or intentionally anonymous.",
            "Avoid overusing passive voice in casual dialogue; keep it for reports, policies, and formal articles."
          ],
          practice: "Convert 3 active sentences into polished formal passive statements."
        }
      },
      {
        id: "en-05",
        title: "Essential Workplace & Professional Vocabulary",
        description: "High-frequency corporate terms, project milestones, and business idioms",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Communicate smoothly in corporate meetings, emails, and presentations with these fundamental business English terms.",
          keyPhrases: [
            { native: "Deliverables", romanized: "[d\u026A\u02C8l\u026Av.\u0259r.\u0259.b\u0259lz]", english: "Tangible products or completed outcomes of a project" },
            { native: "Bandwidth", romanized: "[\u02C8b\xE6nd.w\u026At\u03B8]", english: "Available time or capacity to handle work" },
            { native: "Leverage", romanized: "[\u02C8li\u02D0.v\u0259r.\u026Ad\u0292]", english: "To utilize an existing asset or skill for maximum advantage" },
            { native: "Bottleneck", romanized: "[\u02C8b\u0252t.\u0259l.nek]", english: "A stage that slows down the entire workflow" },
            { native: "Touch base", romanized: "[t\u028Ct\u0283 be\u026As]", english: "Briefly contact or reconnect to discuss status" }
          ],
          tips: [
            '"Deliverables" is commonly used during project sprint reviews and contract specifications.',
            '"Bandwidth" originally referred to data transmission but is now standard for personal workload.',
            `Combine "touch base" with timeframes: "Let's touch base on Friday afternoon."`
          ],
          practice: 'Write an email paragraph updating a colleague using "deliverables", "touch base", and "bandwidth".'
        }
      },
      {
        id: "en-06",
        title: "Top 30 English Phrasal Verbs in Context",
        description: "Master multi-word verbs like figure out, look forward to, and bring up",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "16 min",
        content: {
          intro: "Phrasal verbs are combinations of verbs with prepositions or adverbs that create completely new meanings. They are central to sounding natural in everyday spoken English.",
          keyPhrases: [
            { native: "Figure out", romanized: "To solve or understand", english: "We need to figure out why the system crashed." },
            { native: "Bring up", romanized: "To mention a topic", english: "I will bring up the budget proposal in tomorrow's meeting." },
            { native: "Look forward to", romanized: "To anticipate with pleasure", english: "I really look forward to collaborating with your team." },
            { native: "Call off", romanized: "To cancel an event", english: "They had to call off the outdoor conference due to the storm." },
            { native: "Put off", romanized: "To postpone or delay", english: "Never put off until tomorrow what you can finish today." }
          ],
          tips: [
            '"Look forward to" must be followed by a noun or -ing verb: "I look forward to meeting you."',
            'Separable phrasal verbs can sandwich a pronoun: "Turn it on", not "Turn on it".',
            "Learn phrasal verbs in real context sentences rather than memorizing isolated lists."
          ],
          practice: 'Create 3 dialogue lines using "figure out", "look forward to", and "call off".'
        }
      },
      {
        id: "en-07",
        title: "Academic & Formal Linking Connectors",
        description: "Enhance writing coherence with transition words like furthermore, nevertheless, and consequently",
        type: "vocabulary",
        difficulty: "advanced",
        duration: "16 min",
        content: {
          intro: "Transition words guide your reader through complex reasoning and arguments. Discover how to contrast ideas, add supporting evidence, and conclude persuasively.",
          keyPhrases: [
            { native: "Furthermore", romanized: "In addition / moreover", english: "The strategy reduces overhead; furthermore, it speeds delivery." },
            { native: "Nevertheless", romanized: "Despite that / however", english: "The experiment was risky; nevertheless, it yielded breakthroughs." },
            { native: "Consequently", romanized: "As a result", english: "Interest rates rose; consequently, borrowing slowed down." },
            { native: "In light of", romanized: "Considering that", english: "In light of recent user feedback, we are refining the user interface." }
          ],
          tips: [
            'Place a semicolon before "furthermore" or "consequently" and a comma immediately after when linking clauses.',
            '"Nevertheless" introduces an unexpected contrast despite prior evidence.',
            'Use "in light of" followed by a noun phrase to justify managerial or design decisions.'
          ],
          practice: 'Draft a short persuasive summary linking 3 points with "furthermore", "nevertheless", and "consequently".'
        }
      },
      {
        id: "en-08",
        title: "Everyday Idiomatic Expressions & Casual Slang",
        description: "Sound like a native speaker with colorful daily conversational idioms",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Idioms are figurative expressions whose meanings cannot be understood from individual words alone. Learn these widely used daily English phrases.",
          keyPhrases: [
            { native: "Piece of cake", romanized: "Extremely easy", english: "The certification exam was a piece of cake once I studied." },
            { native: "Bite the bullet", romanized: "Face a tough situation bravely", english: "I have to bite the bullet and apologize to the client." },
            { native: "Under the weather", romanized: "Feeling slightly ill", english: "I stayed home today because I felt under the weather." },
            { native: "Hit the nail on the head", romanized: "Describe exactly what is true", english: "Her analysis hit the nail on the head." }
          ],
          tips: [
            "Idioms make conversation colorful and friendly when used in informal settings.",
            "Avoid translating idioms word-for-word into your native language; memorize them as complete mental units.",
            '"Bite the bullet" originates from military surgery before modern anesthesia.'
          ],
          practice: 'Write a message to a friend explaining why you took a day off using "under the weather".'
        }
      },
      {
        id: "en-09",
        title: "Silent Letters & Tricky English Spellings",
        description: "Demystify silent K, B, W, G, and H in common English words",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "14 min",
        content: {
          intro: "English spelling preserves centuries of historical roots, resulting in silent letters that are written but never pronounced. Master these high-frequency patterns.",
          keyPhrases: [
            { native: "Knight, Knee, Knife", romanized: "[na\u026At], [ni\u02D0], [na\u026Af]", english: 'Silent initial "K" before "N"' },
            { native: "Doubt, Subtle, Debt", romanized: "[da\u028At], [\u02C8s\u028Ct.\u0259l], [det]", english: 'Silent "B" following vowels or preceding "T"' },
            { native: "Write, Wrong, Wrist", romanized: "[ra\u026At], [r\u0252\u014B], [r\u026Ast]", english: 'Silent initial "W" before "R"' },
            { native: "Hour, Honest, Honor", romanized: "[a\u028A\u0259r], [\u02C8\u0252n.\u026Ast], [\u02C8\u0252n.\u0259r]", english: 'Silent initial "H" in French-origin words' }
          ],
          tips: [
            'Notice that silent "K" words always begin with "kn-".',
            'In "hour" and "honest", use "an" instead of "a": "an hour", "an honest mistake".',
            "Listen carefully to native voice playback and mirror the mouth movement."
          ],
          practice: 'Read aloud: "The honest knight knew the subtle knife was wrong."'
        }
      },
      {
        id: "en-10",
        title: "Vowel Sounds & The Elusive Schwa [\u0259]",
        description: "Master the most frequent vowel sound in spoken English for effortless rhythm",
        type: "pronunciation",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: 'The "Schwa" sound [\u0259] appears in unstressed syllables in almost every multi-syllable English word. Mastering the schwa transforms robotic speech into relaxed native flow.',
          keyPhrases: [
            { native: "About, Around, Again", romanized: "[\u0259\u02C8ba\u028At], [\u0259\u02C8ra\u028And], [\u0259\u02C8\u0261en]", english: "Unstressed initial vowel reduces to schwa" },
            { native: "Banana, Canada, Camera", romanized: "[b\u0259\u02C8n\u0251\u02D0.n\u0259], [\u02C8k\xE6n.\u0259.d\u0259], [\u02C8k\xE6m.r\u0259]", english: "Unstressed inner vowels become relaxed schwa" },
            { native: "Doctor, Water, Father", romanized: "[\u02C8d\u0252k.t\u0259r], [\u02C8w\u0254\u02D0.t\u0259r], [\u02C8f\u0251\u02D0.\xF0\u0259r]", english: "Unstressed ending syllables" },
            { native: "Cup of coffee, Piece of cake", romanized: "[k\u028Cp \u0259v \u02C8k\u0252f.i], [pi\u02D0s \u0259v ke\u026Ak]", english: '"Of" reduces to [\u0259v] in continuous speech' }
          ],
          tips: [
            "To pronounce the schwa: keep your tongue and lips completely relaxed in the center of your mouth.",
            "Never stress a schwa vowel; let it glide past quickly without extra volume.",
            "English is a stress-timed language: stressed words get full vowels, unstressed words get reduced."
          ],
          practice: `Say: "I bought a cup of coffee around seven o'clock" with relaxed schwas.`
        }
      },
      {
        id: "en-11",
        title: "Intonation & Word Stress for Clear Speech",
        description: "Understand rising vs. falling pitch, sentence emphasis, and semantic shifts",
        type: "pronunciation",
        difficulty: "intermediate",
        duration: "16 min",
        content: {
          intro: "Changing which word you emphasize completely changes the implied meaning of an English sentence. Learn how to use vocal pitch to sound confident and unambiguous.",
          keyPhrases: [
            { native: "I didn't SAY you were late.", romanized: 'Pitch on "say"', english: "Implies: I might have written or thought it, but didn't say it" },
            { native: "I didn't say YOU were late.", romanized: 'Pitch on "you"', english: "Implies: Someone else was late, not you" },
            { native: "Could you give me a hand with this?", romanized: "Rising intonation (?)", english: "Yes/No questions end with rising pitch" },
            { native: "Where did you put the report?", romanized: "Falling intonation (.)", english: "Wh- questions end with falling pitch" }
          ],
          tips: [
            "Yes/No questions naturally rise in pitch at the end.",
            "Wh- questions (Who, What, Where, Why, How) rise early and fall firmly at the end.",
            "Content words (nouns, main verbs, adjectives) carry stress; function words (to, a, in) are weak."
          ],
          practice: `Record yourself saying "I didn't take your phone" placing emphasis on 4 different words.`
        }
      },
      {
        id: "en-12",
        title: "Connected Speech: Blending & Contractions",
        description: "Learn how native speakers link consonant to vowel and swallow sounds",
        type: "pronunciation",
        difficulty: "advanced",
        duration: "18 min",
        content: {
          intro: "Native speakers do not pronounce words in isolation. They blend sounds across word boundaries through linking, elision, and assimilation for fluid speech.",
          keyPhrases: [
            { native: "Hold on a second", romanized: "[h\u0259\u028Ald-\u0252n-\u0259-sek.\u0259nd]", english: "Consonant links smoothly to vowel (Hold-on-a)" },
            { native: "What are you going to do?", romanized: "[w\u028Ct\u0283\u0259 \u0261\u0259n\u0259 du\u02D0]", english: 'Reduces to "Whatcha gonna do?" in fast speech' },
            { native: "Don't you know?", romanized: "[d\u0259\u028Ant-ju\u02D0 -> d\u0259\u028Ant\u0283u\u02D0]", english: 'T + Y blends into "ch" sound [t\u0283]' },
            { native: "Next door, Last night", romanized: "[neks-d\u0254\u02D0r], [l\u0251\u02D0s-na\u026At]", english: 'Final "t" sound is dropped before another consonant' }
          ],
          tips: [
            "Linking occurs whenever a word ends in a consonant and the next begins with a vowel.",
            "You do not have to speak with extreme slang, but recognizing connected speech dramatically improves listening comprehension.",
            "Practice continuous shadow-reading along with audio."
          ],
          practice: 'Listen to the audio clip and practice smooth linking: "Tell-him-about-it".'
        }
      },
      {
        id: "en-13",
        title: "Small Talk, Networking & Breaking the Ice",
        description: "Initiate polite, engaging conversations at social gatherings and business events",
        type: "conversation",
        difficulty: "beginner",
        duration: "15 min",
        content: {
          intro: "Small talk is the universal bridge to building professional rapport and friendships. Learn open-ended questions, active listening cues, and graceful exits.",
          keyPhrases: [
            { native: "Have you been to one of these summits before?", romanized: "Icebreaker Question", english: "Easy entry question to initiate conversation" },
            { native: "What brings you to our city this week?", romanized: "Open Inquiry", english: "Invites the other person to share background" },
            { native: "That sounds fascinating! How did you get into that field?", romanized: "Active Listening", english: "Demonstrates genuine engagement" },
            { native: "It was great chatting with you; let's exchange cards before we head out.", romanized: "Graceful Closing", english: "Polite conclusion with follow-up action" }
          ],
          tips: [
            'Use the "FORM" formula for small talk topics: Family, Occupation, Recreation, Motivation.',
            'Ask open-ended questions starting with "What" or "How" rather than yes/no questions.',
            "Offer your own brief detail before asking, so the conversation feels reciprocal."
          ],
          practice: "Roleplay introducing yourself to a foreign colleague at a coffee break."
        }
      },
      {
        id: "en-14",
        title: "Job Interview Dialogue & Confident Responses",
        description: "Answer behavioral interview questions using the STAR framework",
        type: "conversation",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: "Excel in international job interviews with structured, persuasive answers that highlight your strengths, problem-solving abilities, and culture fit.",
          keyPhrases: [
            { native: "Could you walk me through your background and key achievements?", romanized: "Interviewer Prompt", english: "Common opening request" },
            { native: "In my previous position, I spearheaded a team that increased retention by 25%.", romanized: "Candidate Statement", english: "Action verb + quantified result" },
            { native: "When faced with tight deadlines, I prioritize high-impact deliverables.", romanized: "Behavioral Answer", english: "Shows structured problem-solving" },
            { native: "What does success look like for this role in the first six months?", romanized: "Candidate Question", english: "Demonstrates proactive foresight" }
          ],
          tips: [
            "Use the STAR method: Situation, Task, Action, Result.",
            'Use strong action verbs: "spearheaded", "orchestrated", "optimized", "streamlined".',
            "Always prepare 2-3 thoughtful questions to ask the interviewer at the end."
          ],
          practice: 'Prepare a 60-second answer to "Tell me about a time you handled a difficult project."'
        }
      },
      {
        id: "en-15",
        title: "Negotiating & Diplomatically Expressing Disagreement",
        description: "Reach win-win agreements while preserving professional relationships",
        type: "conversation",
        difficulty: "advanced",
        duration: "20 min",
        content: {
          intro: "Professional disagreement requires diplomacy and tact. Learn how native speakers soften criticisms, propose alternatives, and steer discussions toward consensus.",
          keyPhrases: [
            { native: "I see your point, but from an operational perspective, we should reconsider.", romanized: "Diplomatic Pivot", english: "Acknowledges first before presenting contrast" },
            { native: "With respect, I have reservations about committing to that timeline.", romanized: "Courteous Hesitation", english: "Polite expression of concern" },
            { native: "Could we meet halfway on the licensing terms?", romanized: "Compromise Proposal", english: "Suggests a balanced middle ground" },
            { native: "If you can expedite shipment, we can agree to the suggested price.", romanized: "Conditional Concession", english: "Gives something only in return for value" }
          ],
          tips: [
            `Start by validating the other party's intention: "I understand the goal..."`,
            'Replace "You are wrong" with "I see it somewhat differently based on our latest data."',
            "Never make a concession without asking for an equivalent benefit in return."
          ],
          practice: "Draft a diplomatic response to a vendor requesting a 15% price increase."
        }
      }
    ]
  },
  {
    id: "thai",
    language: "Thai",
    flag: "\u{1F1F9}\u{1F1ED}",
    color: "#1a56db",
    gradient: "from-blue-600 to-red-500",
    lessons: [
      {
        id: "th-01",
        title: "Thai Alphabet Basics",
        description: "Learn the foundation of Thai consonants and vowels",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "15 min",
        content: {
          intro: "Thai uses its own unique script with 44 consonants and 15 vowel symbols. Understanding the basics opens up the world of Thai reading.",
          keyPhrases: [
            { native: "\u0E01", romanized: "K", english: "Chicken (base consonant)" },
            { native: "\u0E02", romanized: "Kh", english: "Egg (high class consonant)" },
            { native: "\u0E07", romanized: "Ng", english: "Snake (low class)" },
            { native: "\u0E08", romanized: "J", english: "Plate (mid class)" },
            { native: "\u0E14", romanized: "D", english: "Child (mid class)" }
          ],
          tips: ["Thai has 5 tones: mid, low, falling, high, rising", "Practice writing strokes from top to bottom", "Use mnemonic pictures to remember each letter"],
          practice: "Write each consonant 5 times and practice saying its name aloud."
        }
      },
      {
        id: "th-01b",
        title: "Thai Alphabet Intermediate: Vowels & Classes",
        description: "Master the 3 consonant classes (Mid, High, Low) and essential short/long vowel pairs",
        type: "pronunciation",
        difficulty: "intermediate",
        duration: "20 min",
        content: {
          intro: "Thai consonants are divided into 3 classes: Middle, High, and Low. When combined with short or long vowels, these classes dictate the innate tone of every syllable.",
          keyPhrases: [
            { native: "\u0E15", romanized: "T (Tao - Turtle)", english: "Mid Class Consonant" },
            { native: "\u0E1A", romanized: "B (Baimai - Leaf)", english: "Mid Class Consonant" },
            { native: "\u0E1B", romanized: "P (Pla - Fish)", english: "Mid Class Consonant" },
            { native: "\u0E2D", romanized: "O (Ang - Basin)", english: "Mid Class Consonant / Vowel Carrier" },
            { native: "\u0E09", romanized: "Ch (Ching - Cymbals)", english: "High Class Consonant" },
            { native: "\u0E16", romanized: "Th (Thung - Bag)", english: "High Class Consonant" },
            { native: "\u0E1C", romanized: "Ph (Phueng - Bee)", english: "High Class Consonant" },
            { native: "\u0E2A", romanized: "S (Sua - Tiger)", english: "High Class Consonant" },
            { native: "\u0E2B", romanized: "H (Hip - Chest)", english: "High Class Consonant" },
            { native: "\u0E04", romanized: "Kh (Khwai - Buffalo)", english: "Low Class Consonant" },
            { native: "\u0E21", romanized: "M (Ma - Horse)", english: "Low Class Sonorant Consonant" },
            { native: "\u0E19", romanized: "N (Nu - Mouse)", english: "Low Class Sonorant Consonant" },
            { native: "\u0E23", romanized: "R (Rua - Boat)", english: "Low Class Sonorant Consonant" },
            { native: "\u0E27", romanized: "W (Waen - Ring)", english: "Low Class Sonorant Consonant" },
            { native: "\u0E30", romanized: "Sara A", english: "Short Vowel sound (as in cup)" },
            { native: "\u0E32", romanized: "Sara Aa", english: "Long Vowel sound (as in father)" },
            { native: "\u0E34", romanized: "Sara I", english: "Short Vowel sound (as in sit)" },
            { native: "\u0E35", romanized: "Sara Ee", english: "Long Vowel sound (as in see)" },
            { native: "\u0E38", romanized: "Sara U", english: "Short Vowel sound (as in put)" },
            { native: "\u0E39", romanized: "Sara Oo", english: "Long Vowel sound (as in moon)" }
          ],
          tips: [
            "Middle class consonants (\u0E01 \u0E08 \u0E14 \u0E15 \u0E0E \u0E0F \u0E1A \u0E1B \u0E2D) are the most predictable: they can produce all 5 tones with tone marks.",
            "High class consonants start with a rising tone when unmarked in live syllables.",
            "Vowel length matters: short vowels create dead syllables (abrupt stops), while long vowels create live syllables."
          ],
          practice: "Say each consonant paired with Sara Aa (e.g. \u0E01\u0E32, \u0E02\u0E32, \u0E04\u0E32) and listen for how consonant class changes the base tone."
        }
      },
      {
        id: "th-01c",
        title: "Thai Alphabet Pro: 44 Consonants & Tone Mastery",
        description: "Complete unabridged masterclass: all 44 consonants, tone marks (\u0E48 \u0E49 \u0E4A \u0E4B), silent markers, and tone calculation matrices",
        type: "pronunciation",
        difficulty: "advanced",
        duration: "30 min",
        content: {
          intro: "Complete Thai script mastery. Learn the complete inventory of all 44 consonants, the 4 tonal accent marks, the silent Karan marker (\u0E4C), and the algorithmic tone calculation matrix.",
          keyPhrases: [
            { native: "\u0E01 \u0E02 \u0E03 \u0E04 \u0E05 \u0E06 \u0E07", romanized: "K, Kh, Kh, Kh, Kh, Kh, Ng", english: "Guttural & Velar Series (\u0E01-\u0E07)" },
            { native: "\u0E08 \u0E09 \u0E0A \u0E0B \u0E0C \u0E0D", romanized: "J, Ch, Ch, S, Ch, Y", english: "Palatal Series (\u0E08-\u0E0D)" },
            { native: "\u0E0E \u0E0F \u0E10 \u0E11 \u0E12 \u0E13", romanized: "D, T, Th, Th, Th, N", english: "Retroflex Series (Formal loanwords \u0E0E-\u0E13)" },
            { native: "\u0E14 \u0E15 \u0E16 \u0E17 \u0E18 \u0E19", romanized: "D, T, Th, Th, Th, N", english: "Dental Series (\u0E14-\u0E19)" },
            { native: "\u0E1A \u0E1B \u0E1C \u0E1D \u0E1E \u0E1F \u0E20 \u0E21", romanized: "B, P, Ph, F, Ph, F, Ph, M", english: "Labial Series (\u0E1A-\u0E21)" },
            { native: "\u0E22 \u0E23 \u0E25 \u0E27", romanized: "Y, R, L, W", english: "Semivowels & Liquids (\u0E22-\u0E27)" },
            { native: "\u0E28 \u0E29 \u0E2A \u0E2B \u0E2C \u0E2D \u0E2E", romanized: "S, S, S, H, L, O, H", english: "Sibilants & Glottals (\u0E28-\u0E2E)" },
            { native: "\u0E44\u0E21\u0E49\u0E40\u0E2D\u0E01 ( -\u0E48 )", romanized: "Mai Ek", english: "Tone Mark 1: Produces Low tone (Mid/High class) or Falling tone (Low class)" },
            { native: "\u0E44\u0E21\u0E49\u0E42\u0E17 ( -\u0E49 )", romanized: "Mai Tho", english: "Tone Mark 2: Produces Falling tone (Mid/High class) or High tone (Low class)" },
            { native: "\u0E44\u0E21\u0E49\u0E15\u0E23\u0E35 ( -\u0E4A )", romanized: "Mai Tri", english: "Tone Mark 3: Produces High tone (Exclusive to Mid class)" },
            { native: "\u0E44\u0E21\u0E49\u0E08\u0E31\u0E15\u0E27\u0E32 ( -\u0E4B )", romanized: "Mai Chattawa", english: "Tone Mark 4: Produces Rising tone (Exclusive to Mid class)" },
            { native: "\u0E01\u0E32\u0E23\u0E31\u0E19\u0E15\u0E4C ( -\u0E4C )", romanized: "Thanthakhat / Karan", english: "Silent Marker: Silences the consonant over which it sits" },
            { native: "\u0E2B \u0E19\u0E33", romanized: "Ho Nam", english: "Silent Leading H: Converts low class consonants to high class tone behavior" },
            { native: "\u0E04\u0E33\u0E40\u0E1B\u0E47\u0E19 (Live)", romanized: "Kham Pen", english: "Live Syllables: End in long vowels or sonorants (-m, -n, -ng, -w, -y)" },
            { native: "\u0E04\u0E33\u0E15\u0E32\u0E22 (Dead)", romanized: "Kham Tai", english: "Dead Syllables: End in short vowels or stop consonants (-k, -t, -p)" }
          ],
          tips: [
            "There are 44 consonants total: 9 Middle class, 11 High class, and 24 Low class (split into 14 paired and 10 single sonorants).",
            "Tone calculation formula: [Consonant Class] + [Syllable Type: Live vs Dead] + [Vowel Length: Short vs Long] + [Tone Mark if present].",
            "\u0E03 (Khor Khuat) and \u0E05 (Khor Khon) are obsolete in modern typography but preserved in the traditional 44 alphabet alphabetarium."
          ],
          practice: "Practice deciphering tone rules on sample words: \u0E02\u0E49\u0E32\u0E27 (High class + Mai Tho = Falling tone), \u0E21\u0E32 (Low class + Live = Mid tone), \u0E21\u0E32\u0E01 (Low class + Dead long = Falling tone)."
        }
      },
      {
        id: "th-02",
        title: "Greetings & Politeness",
        description: "Essential Thai greetings and polite expressions",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: 'Thai culture places great emphasis on politeness. "Wai" (the prayer-like gesture) accompanies many greetings.',
          keyPhrases: [
            { native: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35", romanized: "Sawasdee", english: "Hello / Goodbye" },
            { native: "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13", romanized: "Khob Khun", english: "Thank you" },
            { native: "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23", romanized: "Mai pen rai", english: "It's okay / No problem" },
            { native: "\u0E42\u0E17\u0E29\u0E17\u0E35", romanized: "Thot thee", english: "Excuse me / Sorry" },
            { native: "\u0E22\u0E34\u0E19\u0E14\u0E35\u0E17\u0E35\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01", romanized: "Yin dee thi roo jak", english: "Nice to meet you" }
          ],
          tips: ['Add "krap" (male) or "ka" (female) at the end to be polite', "Smile when greeting \u2014 it is part of Thai culture", "Lower your head slightly as a sign of respect"],
          practice: "Practice greeting a partner using the Wai gesture with each phrase."
        }
      },
      {
        id: "th-03",
        title: "Numbers 1\u2013100",
        description: "Count in Thai from one to one hundred",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Thai numbers are fairly straightforward once you learn the base numbers. They follow a logical pattern.",
          keyPhrases: [
            { native: "\u0E2B\u0E19\u0E36\u0E48\u0E07", romanized: "Nueng", english: "One (1)" },
            { native: "\u0E2A\u0E2D\u0E07", romanized: "Song", english: "Two (2)" },
            { native: "\u0E2A\u0E32\u0E21", romanized: "Sam", english: "Three (3)" },
            { native: "\u0E2A\u0E34\u0E1A", romanized: "Sip", english: "Ten (10)" },
            { native: "\u0E23\u0E49\u0E2D\u0E22", romanized: "Roi", english: "Hundred (100)" }
          ],
          tips: ['Numbers 11\u201319 use "sip" + unit number', "Thai also has its own numeral script (\u0E51,\u0E52,\u0E53...)", "Learn Thai numerals to read prices in markets"],
          practice: "Count aloud from 1 to 20 using Thai numbers."
        }
      },
      {
        id: "th-04",
        title: "Food & Ordering at a Restaurant",
        description: "Order food and drinks like a local",
        type: "conversation",
        difficulty: "beginner",
        duration: "14 min",
        content: {
          intro: "Thailand is famous for its cuisine. Knowing how to order food is one of the most practical skills for travelers.",
          keyPhrases: [
            { native: "\u0E02\u0E2D\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E19\u0E48\u0E2D\u0E22\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21", romanized: "Kho menu noi dai mai", english: "Can I have the menu please?" },
            { native: "\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E21\u0E32\u0E01", romanized: "Aroi mak", english: "Very delicious!" },
            { native: "\u0E40\u0E1C\u0E47\u0E14\u0E19\u0E49\u0E2D\u0E22\u0E46", romanized: "Phet noi noi", english: "A little bit spicy" },
            { native: "\u0E40\u0E0A\u0E47\u0E04\u0E1A\u0E34\u0E25\u0E14\u0E49\u0E27\u0E22", romanized: "Check bin duai", english: "Bill please" },
            { native: "\u0E44\u0E21\u0E48\u0E43\u0E2A\u0E48\u0E1C\u0E31\u0E01\u0E0A\u0E35", romanized: "Mai sai phak chi", english: "No coriander please" }
          ],
          tips: ["Point to menu items if you are unsure", "Thai restaurants often have picture menus", 'Use "aroi mak" as a compliment to the chef'],
          practice: "Role-play a restaurant conversation with a partner."
        }
      },
      {
        id: "th-05",
        title: "Getting Around: Directions",
        description: "Ask for and give directions in Thai",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Navigating Thai cities requires knowing direction words and transportation vocabulary.",
          keyPhrases: [
            { native: "\u0E44\u0E1B\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E19", romanized: "Pai thi nai", english: "Where are you going?" },
            { native: "\u0E15\u0E23\u0E07\u0E44\u0E1B", romanized: "Trong pai", english: "Go straight" },
            { native: "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22", romanized: "Liao sai", english: "Turn left" },
            { native: "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E02\u0E27\u0E32", romanized: "Liao kwa", english: "Turn right" },
            { native: "\u0E2D\u0E22\u0E39\u0E48\u0E44\u0E01\u0E25\u0E44\u0E2B\u0E21", romanized: "Yu klai mai", english: "Is it far?" }
          ],
          tips: ["Tuk-tuks and motorbike taxis are common in Bangkok", "Show your destination on a map if words fail", "Use Google Maps with Thai labels for practice"],
          practice: "Draw a simple map and practice giving directions to a landmark."
        }
      },
      {
        id: "th-06",
        title: "Tones in Thai",
        description: "Master the 5 Thai tones with practice exercises",
        type: "pronunciation",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: "Thai is a tonal language. The same syllable can have completely different meanings depending on the tone used.",
          keyPhrases: [
            { native: "\u0E21\u0E32", romanized: "Maa (mid)", english: "To come" },
            { native: "\u0E21\u0E49\u0E32", romanized: "M\xE1a (rising)", english: "Horse" },
            { native: "\u0E2B\u0E21\u0E32", romanized: "M\u01CEa (falling)", english: "Dog" },
            { native: "\u0E2B\u0E21\u0E49\u0E32", romanized: "M\xE0 (low)", english: "Widow" },
            { native: "\u0E2B\u0E21\u0E32\u0E01", romanized: "M\xE2a (high)", english: "Betel nut" }
          ],
          tips: ["Use a tone marker chart as a reference", "Record yourself and compare to native speakers", "Focus on mid and rising tones first as they are most common"],
          practice: "Say each tone five times slowly then speed up gradually."
        }
      },
      {
        id: "th-07",
        title: "Thai Family & Relationships",
        description: "Vocabulary for family members and social relationships",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Thai family terms are specific \u2014 different words exist depending on whether a family member is older or younger.",
          keyPhrases: [
            { native: "\u0E1E\u0E48\u0E2D", romanized: "Pho", english: "Father" },
            { native: "\u0E41\u0E21\u0E48", romanized: "Mae", english: "Mother" },
            { native: "\u0E1E\u0E35\u0E48", romanized: "Phi", english: "Older sibling" },
            { native: "\u0E19\u0E49\u0E2D\u0E07", romanized: "Nong", english: "Younger sibling" },
            { native: "\u0E25\u0E39\u0E01", romanized: "Luk", english: "Child / Son / Daughter" }
          ],
          tips: ['Thai uses "Phi" and "Nong" as social honorifics too, not just family', "Grandparents have specific gender-based terms", "Family is central to Thai society \u2014 learn these first"],
          practice: "Draw your family tree and label each member in Thai."
        }
      },
      {
        id: "th-08",
        title: "Thai Festivals & Traditions",
        description: "Explore Thai culture through its major festivals",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Thailand has many rich festivals that reflect Buddhist traditions and local customs.",
          keyPhrases: [
            { native: "\u0E2A\u0E07\u0E01\u0E23\u0E32\u0E19\u0E15\u0E4C", romanized: "Songkran", english: "Thai New Year Water Festival" },
            { native: "\u0E25\u0E2D\u0E22\u0E01\u0E23\u0E30\u0E17\u0E07", romanized: "Loy Krathong", english: "Lantern Festival" },
            { native: "\u0E27\u0E31\u0E19\u0E1E\u0E23\u0E30", romanized: "Wan Phra", english: "Buddhist holy day" },
            { native: "\u0E27\u0E31\u0E14\u0E1E\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27", romanized: "Wat Phra Kaew", english: "Temple of the Emerald Buddha" },
            { native: "\u0E16\u0E27\u0E32\u0E22\u0E17\u0E32\u0E19", romanized: "Thawai than", english: "Making merit / offerings" }
          ],
          tips: ["Dress modestly when entering temples", "Participate respectfully in Songkran \u2014 it is a joyful event", "Buy a krathong to float during Loy Krathong"],
          practice: "Research one Thai festival and write 3 sentences about it in English."
        }
      },
      {
        id: "th-09",
        title: "Present Tense Sentences",
        description: "Build simple present tense Thai sentences",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Thai grammar is simpler than English in some ways \u2014 there is no verb conjugation or plurals, but word order is important.",
          keyPhrases: [
            { native: "\u0E09\u0E31\u0E19\u0E01\u0E34\u0E19\u0E02\u0E49\u0E32\u0E27", romanized: "Chan gin khao", english: "I eat rice" },
            { native: "\u0E40\u0E02\u0E32\u0E17\u0E33\u0E07\u0E32\u0E19", romanized: "Khao tham ngan", english: "He works" },
            { native: "\u0E40\u0E23\u0E32\u0E40\u0E23\u0E35\u0E22\u0E19\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22", romanized: "Rao rian phasa thai", english: "We study Thai language" },
            { native: "\u0E40\u0E18\u0E2D\u0E0A\u0E2D\u0E1A\u0E40\u0E1E\u0E25\u0E07", romanized: "Thoe chop phleng", english: "She likes music" },
            { native: "\u0E1E\u0E27\u0E01\u0E40\u0E02\u0E32\u0E27\u0E34\u0E48\u0E07", romanized: "Phuak khao wing", english: "They run" }
          ],
          tips: ["Thai sentence structure: Subject + Verb + Object", "No need to change verbs for tense \u2014 use time words instead", 'Add "yang" before verb to indicate ongoing action'],
          practice: "Write 5 sentences about your daily routine in Thai."
        }
      },
      {
        id: "th-10",
        title: "Shopping Vocabulary",
        description: "Bargain and shop at Thai markets",
        type: "conversation",
        difficulty: "intermediate",
        duration: "13 min",
        content: {
          intro: "Shopping at Thai markets (talaat) is an experience. Bargaining is expected at most street markets.",
          keyPhrases: [
            { native: "\u0E23\u0E32\u0E04\u0E32\u0E40\u0E17\u0E48\u0E32\u0E44\u0E23", romanized: "Raka thao rai", english: "How much does it cost?" },
            { native: "\u0E41\u0E1E\u0E07\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B", romanized: "Phaeng koen pai", english: "Too expensive" },
            { native: "\u0E25\u0E14\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21", romanized: "Lot dai mai", english: "Can you reduce the price?" },
            { native: "\u0E40\u0E2D\u0E32\u0E2D\u0E31\u0E19\u0E19\u0E35\u0E49", romanized: "Ao an ni", english: "I will take this one" },
            { native: "\u0E21\u0E35\u0E2A\u0E35\u0E2D\u0E37\u0E48\u0E19\u0E44\u0E2B\u0E21", romanized: "Mi si uen mai", english: "Do you have other colors?" }
          ],
          tips: ["Start bargaining at 50-60% of the asking price", "Smile and be friendly while negotiating", "Fixed price shops (\u0E23\u0E32\u0E04\u0E32\u0E15\u0E32\u0E22\u0E15\u0E31\u0E27) do not bargain"],
          practice: "Role-play a market bargaining scene with a classmate."
        }
      },
      {
        id: "th-11",
        title: "Weather & Seasons",
        description: "Talk about the weather and climate in Thailand",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Thailand has a tropical climate. Knowing weather words helps you discuss the weather in daily conversation.",
          keyPhrases: [
            { native: "\u0E23\u0E49\u0E2D\u0E19", romanized: "Ron", english: "Hot" },
            { native: "\u0E1D\u0E19\u0E15\u0E01", romanized: "Fon tok", english: "Raining" },
            { native: "\u0E2B\u0E19\u0E32\u0E27", romanized: "Nao", english: "Cold / Cool" },
            { native: "\u0E24\u0E14\u0E39\u0E1D\u0E19", romanized: "Ruedoo fon", english: "Rainy season" },
            { native: "\u0E1E\u0E32\u0E22\u0E38", romanized: "Phayu", english: "Storm" }
          ],
          tips: ["Thailand has three distinct seasons: hot, rainy, and cool", 'Use "mak" (very) to emphasize, e.g., "Ron mak" (very hot)', "The cool season is from November to February"],
          practice: "Describe today's weather in Thai to a friend."
        }
      },
      {
        id: "th-12",
        title: "Temple Etiquette",
        description: "Learn key customs when visiting a Buddhist temple",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Buddhist temples (Wat) are sacred spaces. Behaving respectfully is essential when visiting.",
          keyPhrases: [
            { native: "\u0E27\u0E31\u0E14", romanized: "Wat", english: "Temple" },
            { native: "\u0E1E\u0E23\u0E30", romanized: "Phra", english: "Monk" },
            { native: "\u0E16\u0E2D\u0E14\u0E23\u0E2D\u0E07\u0E40\u0E17\u0E49\u0E32", romanized: "Thot rong thao", english: "Take off shoes" },
            { native: "\u0E2B\u0E49\u0E32\u0E21\u0E16\u0E48\u0E32\u0E22\u0E23\u0E39\u0E1B", romanized: "Ham thai roop", english: "Do not take photos" },
            { native: "\u0E17\u0E33\u0E1A\u0E38\u0E0D", romanized: "Tham bun", english: "To make merit" }
          ],
          tips: ["Dress politely: cover shoulders and knees", "Remove your shoes before entering the main temple building", "Avoid pointing your feet at a monk or Buddha image"],
          practice: "List 3 rules you must follow when visiting a Thai temple."
        }
      },
      {
        id: "th-13",
        title: "Directions: Taking a Taxi",
        description: "Interact with taxi drivers and navigate routes",
        type: "conversation",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Get to destinations by taxi or rideshare using direct conversational phrases.",
          keyPhrases: [
            { native: "\u0E44\u0E1B\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25", romanized: "Pai rong phayaban", english: "Go to the hospital" },
            { native: "\u0E44\u0E1B\u0E42\u0E23\u0E07\u0E41\u0E23\u0E21", romanized: "Pai rong raem", english: "Go to the hotel" },
            { native: "\u0E08\u0E2D\u0E14\u0E15\u0E23\u0E07\u0E19\u0E35\u0E49", romanized: "Chot trong ni", english: "Park / stop here" },
            { native: "\u0E40\u0E1B\u0E34\u0E14\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E14\u0E49\u0E27\u0E22", romanized: "Poet meter duai", english: "Please turn on the meter" },
            { native: "\u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E17\u0E2D\u0E19", romanized: "Mai tong thon", english: "Keep the change" },
            { native: "\u0E02\u0E36\u0E49\u0E19\u0E17\u0E32\u0E07\u0E14\u0E48\u0E27\u0E19\u0E44\u0E2B\u0E21", romanized: "Khun thang duan mai", english: "Take the tollway?" },
            { native: "\u0E15\u0E23\u0E07\u0E44\u0E1B\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E22\u0E46", romanized: "Trong pai reuay reuay", english: "Keep going straight" },
            { native: "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22\u0E02\u0E49\u0E32\u0E07\u0E2B\u0E19\u0E49\u0E32", romanized: "Liao sai khang na", english: "Turn left ahead" },
            { native: "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E02\u0E27\u0E32\u0E17\u0E35\u0E48\u0E44\u0E1F\u0E41\u0E14\u0E07", romanized: "Liao kwa thi fai daeng", english: "Turn right at the red light" },
            { native: "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13\u0E04\u0E23\u0E31\u0E1A/\u0E04\u0E48\u0E30", romanized: "Khob khun krap/ka", english: "Thank you (polite)" }
          ],
          tips: ['Always ask to turn on the meter ("Poet meter duai")', "Ridesharing apps like Grab are highly popular and safe"],
          practice: "Simulate a taxi ride asking to go to the airport and requesting the meter."
        }
      },
      {
        id: "th-14",
        title: "Thai Body Language & Respect",
        description: "Learn social gestures and taboos in Thailand",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Body language in Thailand carries cultural values. Read about the head, feet, and general posturing.",
          keyPhrases: [
            { native: "\u0E44\u0E2B\u0E27\u0E49", romanized: "Wai", english: "Polite greeting gesture" },
            { native: "\u0E2B\u0E31\u0E27", romanized: "Hua", english: "Head (sacred part of the body)" },
            { native: "\u0E40\u0E17\u0E49\u0E32", romanized: "Thao", english: "Feet (lowest / unclean part)" },
            { native: "\u0E01\u0E49\u0E21\u0E2B\u0E31\u0E27", romanized: "Kom hua", english: "Lower your head when passing elders" },
            { native: "\u0E22\u0E34\u0E49\u0E21", romanized: "Yim", english: "Smile (conveys multiple emotions)" },
            { native: "\u0E40\u0E01\u0E23\u0E07\u0E43\u0E08", romanized: "Kreng jai", english: "Considerateness / not wanting to burden" },
            { native: "\u0E2A\u0E38\u0E20\u0E32\u0E1E", romanized: "Suphap", english: "Polite / soft-spoken" },
            { native: "\u0E44\u0E21\u0E48\u0E2A\u0E38\u0E20\u0E32\u0E1E", romanized: "Mai suphap", english: "Impolite" },
            { native: "\u0E43\u0E2B\u0E49\u0E40\u0E01\u0E35\u0E22\u0E23ti", romanized: "Hai kiat", english: "Show respect / give honor" },
            { native: "\u0E0A\u0E35\u0E49", romanized: "Chi", english: "Pointing (avoid pointing feet at objects)" }
          ],
          tips: ["Never touch anyone on the head", "Avoid pointing your foot at people or objects"],
          practice: "Practice walking past a colleague while slightly lowering your head as a sign of respect."
        }
      },
      {
        id: "th-15",
        title: "Simple Past & Future Tenses",
        description: "Express timing using tense markers",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Understand past and future timeline structures using indicator particles.",
          keyPhrases: [
            { native: "\u0E41\u0E25\u0E49\u0E27", romanized: "Laeo", english: "Already (past marker)" },
            { native: "\u0E08\u0E30", romanized: "Cha", english: "Will (future marker)" },
            { native: "\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E27\u0E32\u0E19\u0E19\u0E35\u0E49", romanized: "Muea wan ni", english: "Yesterday" },
            { native: "\u0E1E\u0E23\u0E38\u0E48\u0E07\u0E19\u0E35\u0E49", romanized: "Phrung ni", english: "Tomorrow" },
            { native: "\u0E01\u0E34\u0E19\u0E02\u0E49\u0E32\u0E27\u0E41\u0E25\u0E49\u0E27", romanized: "Gin khao laeo", english: "Ate rice already" },
            { native: "\u0E08\u0E30\u0E44\u0E1B\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E2F", romanized: "Cha pai krung-thep", english: "Will go to Bangkok" },
            { native: "\u0E40\u0E04\u0E22", romanized: "Khoey", english: "Used to / Ever" },
            { native: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49", romanized: "Yang mai dai", english: "Not yet" },
            { native: "\u0E1B\u0E35\u0E17\u0E35\u0E48\u0E41\u0E25\u0E49\u0E27", romanized: "Pee thi laeo", english: "Last year" },
            { native: "\u0E1B\u0E35\u0E2B\u0E19\u0E49\u0E32", romanized: "Pee na", english: "Next year" }
          ],
          tips: ['"Laeo" goes at the end of the sentence to show completion', '"Cha" goes before the verb to show intent/future'],
          practice: 'Translate "I will eat pad thai tomorrow" and "I visited Chiang Mai last year".'
        }
      },
      {
        id: "th-16",
        title: "Thai Idioms & Slang",
        description: "Learn colorful expressions and slang used in daily Thai conversations",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Thai slang is widely used in informal settings. Master these popular terms.",
          keyPhrases: [
            { native: "\u0E01\u0E25\u0E49\u0E27\u0E22\u0E46", romanized: "Kluai kluai", english: "Piece of cake / Very easy" },
            { native: "\u0E40\u0E17\u0E19\u0E49\u0E33\u0E40\u0E17\u0E17\u0E48\u0E32", romanized: "The nam the tha", english: "Selling like hot cakes" },
            { native: "\u0E0A\u0E34\u0E27\u0E46", romanized: "Chill chill", english: "Relaxed / Taking it easy" },
            { native: "\u0E07\u0E32\u0E19\u0E40\u0E02\u0E49\u0E32", romanized: "Ngan khao", english: "In trouble / Work has entered" },
            { native: "\u0E17\u0E32\u0E07\u0E43\u0E04\u0E23\u0E17\u0E32\u0E07\u0E21\u0E31\u0E19", romanized: "Thang khrai thang man", english: "Go our separate ways" }
          ],
          tips: ["Doubling a word often intensifies or makes it casual", '"Ngan khao" is very common when unexpected trouble happens'],
          practice: 'Use "Chill chill" and "Ngan khao" in a short role-play.'
        }
      },
      {
        id: "th-17",
        title: "Thai Proverbs & Sayings",
        description: "Explore traditional Thai proverbs and wise sayings",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Thai proverbs reflect Buddhist values, agricultural history, and social rules.",
          keyPhrases: [
            { native: "\u0E19\u0E49\u0E33\u0E02\u0E36\u0E49\u0E19\u0E43\u0E2B\u0E49\u0E23\u0E35\u0E1A\u0E15\u0E31\u0E01", romanized: "Nam khun hai reep tak", english: "Strike while the iron is hot" },
            { native: "\u0E0A\u0E49\u0E32\u0E07\u0E15\u0E32\u0E22\u0E17\u0E31\u0E49\u0E07\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E32\u0E43\u0E1A\u0E1A\u0E31\u0E27\u0E1B\u0E34\u0E14", romanized: "Chang tai tang tua ao bai bua pit", english: "You cannot hide a massive misdeed with a small cover-up" },
            { native: "\u0E02\u0E49\u0E32\u0E27\u0E43\u0E2B\u0E21\u0E48\u0E1B\u0E25\u0E32\u0E21\u0E31\u0E19", romanized: "Khao mai pla man", english: "Honeymoon period / New love" },
            { native: "\u0E2B\u0E31\u0E27\u0E25\u0E49\u0E32\u0E19\u0E44\u0E14\u0E49\u0E2B\u0E27\u0E35", romanized: "Hua lan dai wee", english: "Getting a gift you cannot use" },
            { native: "\u0E23\u0E31\u0E01\u0E27\u0E31\u0E27\u0E43\u0E2B\u0E49\u0E1C\u0E39\u0E01\u0E23\u0E31\u0E01\u0E25\u0E39\u0E01\u0E43\u0E2B\u0E49\u0E15\u0E35", romanized: "Rak wua hai phuk rak luk hai tee", english: "Spare the rod, spoil the child" }
          ],
          tips: ["Proverbs often rhyme in Thai", "Many refer to animals like elephants, cows, and fish"],
          practice: 'Explain the meaning of "Nam khun hai reep tak" in your own words.'
        }
      }
    ]
  },
  {
    id: "korean",
    language: "Korean",
    flag: "\u{1F1F0}\u{1F1F7}",
    color: "#0284c7",
    gradient: "from-blue-500 to-red-400",
    lessons: [
      {
        id: "ko-01",
        title: "Hangul: The Korean Alphabet",
        description: "Learn the logical and elegant Korean writing system",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "20 min",
        content: {
          intro: "Hangul was invented in 1443 by King Sejong. It has 14 basic consonants and 10 basic vowels, combined into syllable blocks.",
          keyPhrases: [
            { native: "\u3131", romanized: "G/K", english: "Basic consonant (giyeok)" },
            { native: "\u3134", romanized: "N", english: "Basic consonant (nieun)" },
            { native: "\u314F", romanized: "A", english: "Basic vowel (a)" },
            { native: "\uAC00", romanized: "Ga", english: "Syllable: consonant + vowel" },
            { native: "\uD55C\uAE00", romanized: "Hangeul", english: "The Korean alphabet" }
          ],
          tips: ["Each syllable block has 2-4 components", "Learn vowels first, then add consonants", "Hangul can be learned in a few hours \u2014 it is very systematic"],
          practice: "Write your name in Hangul using an online converter."
        }
      },
      {
        id: "ko-02",
        title: "Basic Greetings",
        description: "Say hello, goodbye and polite expressions in Korean",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Korean has formal and informal speech levels. Start with formal speech (\uC874\uB313\uB9D0) to be respectful.",
          keyPhrases: [
            { native: "\uC548\uB155\uD558\uC138\uC694", romanized: "Annyeonghaseyo", english: "Hello (formal)" },
            { native: "\uAC10\uC0AC\uD569\uB2C8\uB2E4", romanized: "Gamsahamnida", english: "Thank you (formal)" },
            { native: "\uC8C4\uC1A1\uD569\uB2C8\uB2E4", romanized: "Joesonghamnida", english: "I am sorry" },
            { native: "\uC548\uB155\uD788 \uAC00\uC138\uC694", romanized: "Annyeonghi gaseyo", english: "Goodbye (to person leaving)" },
            { native: "\uB9CC\uB098\uC11C \uBC18\uAC11\uC2B5\uB2C8\uB2E4", romanized: "Mannaseo bangapseumnida", english: "Nice to meet you" }
          ],
          tips: ["Bow slightly when greeting \u2014 deeper bows show more respect", "Use informal speech (\uBC18\uB9D0) only with close friends or younger people", "Add -\uC694 at the end for polite informal speech"],
          practice: "Greet three people using Korean formal speech today."
        }
      },
      {
        id: "ko-03",
        title: "Numbers: Native & Sino-Korean",
        description: "Learn both Korean counting systems",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "15 min",
        content: {
          intro: "Korean has two number systems: native Korean (\uD558\uB098, \uB458...) and Sino-Korean (\uC77C, \uC774...). Each is used in different contexts.",
          keyPhrases: [
            { native: "\uD558\uB098 / \uC77C", romanized: "Hana / Il", english: "One (native / sino)" },
            { native: "\uB458 / \uC774", romanized: "Dul / I", english: "Two (native / sino)" },
            { native: "\uC14B / \uC0BC", romanized: "Set / Sam", english: "Three (native / sino)" },
            { native: "\uC5F4 / \uC2ED", romanized: "Yeol / Sip", english: "Ten (native / sino)" },
            { native: "\uBC31", romanized: "Baek", english: "Hundred (sino only)" }
          ],
          tips: ["Use native Korean for counting objects and age", "Use Sino-Korean for money, phone numbers, and dates", "Sino-Korean is based on Chinese characters"],
          practice: "Say your age in native Korean and the current year in Sino-Korean."
        }
      },
      {
        id: "ko-04",
        title: "K-Culture: K-Drama & K-Pop Expressions",
        description: "Common phrases heard in Korean entertainment",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "K-Drama and K-Pop have popularized Korean worldwide. Many fans learn Korean through music and dramas.",
          keyPhrases: [
            { native: "\uB300\uBC15", romanized: "Daebak", english: "Awesome / Amazing" },
            { native: "\uD654\uC774\uD305", romanized: "Hwaiting", english: "Fighting! (You can do it!)" },
            { native: "\uC624\uBE60", romanized: "Oppa", english: "Older brother (girl's word for older male)" },
            { native: "\uC544\uC774\uACE0", romanized: "Aigo", english: "Oh my! / Goodness!" },
            { native: "\uC9C4\uC9DC\uC694?", romanized: "Jinjjayo?", english: "Really? / Seriously?" }
          ],
          tips: ["K-Drama is a great resource for learning natural speech patterns", "Listen to K-Pop lyrics and try to identify words you know", "Watch with Korean subtitles (\uD55C\uAD6D\uC5B4 \uC790\uB9C9) for best learning"],
          practice: "Watch a 5-minute K-Drama clip and note 3 phrases you recognize."
        }
      },
      {
        id: "ko-05",
        title: "Sentence Structure: SOV Order",
        description: "Understanding Korean grammar basics",
        type: "grammar",
        difficulty: "beginner",
        duration: "14 min",
        content: {
          intro: "Korean follows Subject-Object-Verb order, unlike English. The verb always comes at the end of the sentence.",
          keyPhrases: [
            { native: "\uB098\uB294 \uBC25\uC744 \uBA39\uC5B4\uC694", romanized: "Naneun babeul meogeoyo", english: "I eat rice (I-rice-eat)" },
            { native: "\uADF8\uB294 \uC74C\uC545\uC744 \uC88B\uC544\uD574\uC694", romanized: "Geuneun eumageul joahaeyo", english: "He likes music" },
            { native: "\uC6B0\uB9AC\uB294 \uD55C\uAD6D\uC5B4\uB97C \uBC30\uC6CC\uC694", romanized: "Urineun hangugeo-reul baewoyo", english: "We learn Korean" },
            { native: "\uADF8\uB140\uB294 \uCC45\uC744 \uC77D\uC5B4\uC694", romanized: "Geunyeoneun chaeg-eul ilgeoyo", english: "She reads a book" },
            { native: "\uC800\uB294 \uD559\uC0DD\uC774\uC5D0\uC694", romanized: "Jeoneun haksaengieyo", english: "I am a student" }
          ],
          tips: ["Topic markers: \uC740/\uB294 | Subject markers: \uC774/\uAC00 | Object markers: \uC744/\uB97C", "The verb ending changes based on formality level", "Practice building sentences by swapping nouns"],
          practice: "Translate 5 English sentences into Korean word order."
        }
      },
      {
        id: "ko-06",
        title: "At the Restaurant",
        description: "Order Korean food and interact with servers",
        type: "conversation",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Korean dining culture is unique \u2014 dishes are shared and banchan (side dishes) are served with every meal.",
          keyPhrases: [
            { native: "\uC5EC\uAE30\uC694!", romanized: "Yeogiyo!", english: "Excuse me! (calling a server)" },
            { native: "\uC774\uAC70 \uC8FC\uC138\uC694", romanized: "Igeo juseyo", english: "Give me this please" },
            { native: "\uB9DB\uC788\uC5B4\uC694", romanized: "Massisseoyo", english: "It is delicious" },
            { native: "\uBB3C \uD55C \uC794 \uC8FC\uC138\uC694", romanized: "Mul han jan juseyo", english: "One glass of water please" },
            { native: "\uACC4\uC0B0\uC11C \uC8FC\uC138\uC694", romanized: "Gyesanseo juseyo", english: "Check please" }
          ],
          tips: ['Koreans say "jal meokkessseumnida" before eating (like bon app\xE9tit)', "Elders eat first in Korean culture", "Never tip in Korean restaurants \u2014 it can be considered rude"],
          practice: "Create a Korean restaurant order dialogue with 6 exchanges."
        }
      },
      {
        id: "ko-07",
        title: "Weather & Seasons",
        description: "Talk about weather and the four seasons in Korean",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "11 min",
        content: {
          intro: "Korea has four distinct seasons, and weather is a common conversation topic.",
          keyPhrases: [
            { native: "\uC624\uB298 \uB0A0\uC528\uAC00 \uC5B4\uB54C\uC694?", romanized: "Oneul nalssiga eottaeyo?", english: "How is the weather today?" },
            { native: "\uB354\uC6CC\uC694", romanized: "Deowoyo", english: "It is hot" },
            { native: "\uCD94\uC6CC\uC694", romanized: "Chuwoyo", english: "It is cold" },
            { native: "\uBD04 / \uC5EC\uB984 / \uAC00\uC744 / \uACA8\uC6B8", romanized: "Bom / Yeoreum / Gaeul / Gyeoul", english: "Spring / Summer / Fall / Winter" },
            { native: "\uBE44\uAC00 \uC640\uC694", romanized: "Biga wayo", english: "It is raining" }
          ],
          tips: ["Korea has a rainy season (\uC7A5\uB9C8\uCCA0) in summer", "Winter in Seoul can drop below -10\xB0C", "Spring (\uBD04) is cherry blossom season \u2014 very famous"],
          practice: "Describe today's weather in Korean using at least 3 vocabulary words."
        }
      },
      {
        id: "ko-08",
        title: "Honorifics & Speech Levels",
        description: "Navigate Korean formal and informal speech",
        type: "grammar",
        difficulty: "advanced",
        duration: "20 min",
        content: {
          intro: "Korean speech levels (\uACBD\uC5B4\uBC95) are crucial for social harmony. Using the wrong level can be offensive.",
          keyPhrases: [
            { native: "\uD569\uC1FC\uCCB4", romanized: "Hapshoche", english: "Formal polite (business/strangers)" },
            { native: "\uD574\uC694\uCCB4", romanized: "Haeyoche", english: "Informal polite (everyday use)" },
            { native: "\uD574\uCCB4", romanized: "Haeche", english: "Informal (close friends, children)" },
            { native: "\uB4DC\uC2DC\uB2E4", romanized: "Deushida", english: "Eat (honorific form)" },
            { native: "\uB9D0\uC500\uD558\uC2DC\uB2E4", romanized: "Malsseum hashida", english: "Speak (honorific form)" }
          ],
          tips: ["When in doubt, use \uD574\uC694\uCCB4 \u2014 it is safe and natural", "Elderly Koreans appreciate extra formal speech", "Using \uBC18\uB9D0 with a stranger can cause offense"],
          practice: "Rewrite 3 sentences from informal to formal speech levels."
        }
      },
      {
        id: "ko-09",
        title: "Travel & Transportation",
        description: "Navigate buses, subways, and taxis in Korea",
        type: "conversation",
        difficulty: "intermediate",
        duration: "13 min",
        content: {
          intro: "Korea has an excellent public transport system. Knowing key vocabulary makes travel easy and fun.",
          keyPhrases: [
            { native: "\uC9C0\uD558\uCCA0\uC5ED\uC774 \uC5B4\uB514\uC5D0\uC694?", romanized: "Jihacheol-yeogi eodieyo?", english: "Where is the subway station?" },
            { native: "...\uC5D0 \uAC00\uC8FC\uC138\uC694", romanized: "...e gajuseyo", english: "Please take me to..." },
            { native: "\uC5BC\uB9C8\uC608\uC694?", romanized: "Eolmayeyo?", english: "How much is it?" },
            { native: "\uB2E4\uC74C \uC815\uB958\uC7A5", romanized: "Daeum jeongnyujang", english: "Next stop" },
            { native: "\uD45C \uD55C \uC7A5 \uC8FC\uC138\uC694", romanized: "Pyo han jang juseyo", english: "One ticket please" }
          ],
          tips: ["T-money card works on all Seoul public transport", "Taxis in Korea are generally honest and metered", "KTX is Korea's high-speed train connecting major cities"],
          practice: "Plan a route from one Korean city to another using vocabulary learned."
        }
      },
      {
        id: "ko-10",
        title: "Korean Food Culture",
        description: "Explore iconic Korean dishes and food etiquette",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Korean food is known for its bold flavors, fermented foods, and communal dining style.",
          keyPhrases: [
            { native: "\uAE40\uCE58", romanized: "Kimchi", english: "Fermented spicy cabbage (national dish)" },
            { native: "\uBD88\uACE0\uAE30", romanized: "Bulgogi", english: "Marinated grilled beef" },
            { native: "\uBE44\uBE54\uBC25", romanized: "Bibimbap", english: "Mixed rice with vegetables" },
            { native: "\uC0BC\uACB9\uC0B4", romanized: "Samgyeopsal", english: "Grilled pork belly" },
            { native: "\uB5A1\uBCF6\uC774", romanized: "Tteokbokki", english: "Spicy rice cakes" }
          ],
          tips: ["Never stick chopsticks upright in rice \u2014 this is associated with funerals", "Wait for the eldest to eat first", "It is polite to refill others' glasses before your own"],
          practice: "Research the recipe for bibimbap and learn the ingredient names in Korean."
        }
      },
      {
        id: "ko-11",
        title: "Korean Hobbies & Activities",
        description: "Talk about popular pastimes in South Korea",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "South Koreans enjoy a variety of active and indoor hobbies. Sharing hobbies is a common way to build connections.",
          keyPhrases: [
            { native: "\uB4F1\uC0B0", romanized: "Deungsan", english: "Hiking" },
            { native: "\uB178\uB798\uBC29", romanized: "Noraebang", english: "Karaoke" },
            { native: "PC\uBC29", romanized: "PC bang", english: "Internet cafe" },
            { native: "\uC601\uD654", romanized: "Yeonghwa", english: "Movie" },
            { native: "\uC1FC\uD551", romanized: "Syoping", english: "Shopping" }
          ],
          tips: ["Noraebang (song room) is very popular for group outings", "Hiking (Deungsan) is a national weekend pastime", "PC bangs offer ultra-fast internet and gaming setups"],
          practice: "List three hobbies you enjoy using Korean vocabulary."
        }
      },
      {
        id: "ko-12",
        title: "K-Food: Street Food",
        description: "Discover the delicious street food of Korea",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Korea has a vibrant street food culture, particularly around traditional markets and nightlife hubs.",
          keyPhrases: [
            { native: "\uC624\uB385", romanized: "Odeng", english: "Fish cakes" },
            { native: "\uAE40\uBC25", romanized: "Gimbap", english: "Seaweed rice rolls" },
            { native: "\uC21C\uB300", romanized: "Sundae", english: "Blood sausage" },
            { native: "\uD280\uAE40", romanized: "Twigim", english: "Fried food" },
            { native: "\uD3EC\uC7A5\uB9C8\uCC28", romanized: "Pojangmacha", english: "Street food stall / tent" }
          ],
          tips: ["Street foods are usually cheap and served with hot broth (odeng guk) for free", "Pojangmacha are street tents that also serve alcohol", "Gimbap is a popular lunchbox picnic food"],
          practice: "Imagine you are ordering food at a Pojangmacha. List your choices."
        }
      },
      {
        id: "ko-13",
        title: "Asking for Help & Directions",
        description: "Request help and clarify locations",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Ask for assistance in public settings or ask passersby for directory help.",
          keyPhrases: [
            { native: "\uB3C4\uC640\uC8FC\uC138\uC694", romanized: "Dowajuseyo", english: "Please help me" },
            { native: "\uAE38\uC744 \uC783\uC5C8\uC5B4\uC694", romanized: "Gireul ireosseoyo", english: "I am lost" },
            { native: "\uD654\uC7A5\uC2E4\uC774 \uC5B4\uB514\uC608\uC694?", romanized: "Hwajangsiri eodiyeyo?", english: "Where is the restroom?" },
            { native: "\uC5EC\uAE30\uAC00 \uC5B4\uB514\uC608\uC694?", romanized: "Yeogiga eodiyeyo?", english: "Where is this place?" },
            { native: "\uB2E4\uC2DC \uB9D0\uC500\uD574 \uC8FC\uC138\uC694", romanized: "Dasi malsseumhae juseyo", english: "Please say it again" },
            { native: "\uCC9C\uCC9C\uD788 \uB9D0\uD574 \uC8FC\uC138\uC694", romanized: "Cheoncheonhi malhae juseyo", english: "Please speak slowly" },
            { native: "\uC601\uC5B4\uB97C \uD560 \uC218 \uC788\uC5B4\uC694?", romanized: "Yeongheoreul hal su isseyo?", english: "Can you speak English?" },
            { native: "\uACBD\uCC30\uC11C", romanized: "Gyeongchalseo", english: "Police station" },
            { native: "\uBCD1\uC6D0", romanized: "Byeongwon", english: "Hospital" },
            { native: "\uB3C4\uC640\uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4", romanized: "Dowajusyeoseo gamsahamnida", english: "Thank you for helping" }
          ],
          tips: ['If you need assistance, politely approach someone and say "Sillyehamnida" first'],
          practice: "Practice telling someone you are lost and asking for the restroom."
        }
      },
      {
        id: "ko-14",
        title: "Korean Bowing & Gift Etiquette",
        description: "Social manners and gifting customs",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Study bowing, receiving items with two hands, and housewarming gifts.",
          keyPhrases: [
            { native: "\uC808", romanized: "Jeol", english: "Traditional deep bow" },
            { native: "\uB450 \uC190\uC73C\uB85C", romanized: "Du soneuro", english: "With both hands" },
            { native: "\uC120\uBB3C", romanized: "Seonmul", english: "Gift / Present" },
            { native: "\uC9D1\uB4E4\uC774", romanized: "Jipdeuri", english: "Housewarming party" },
            { native: "\uC138\uC81C / \uD654\uC7A5\uC9C0", romanized: "Seje / Hwajangji", english: "Detergent / Toilet paper" },
            { native: "\uC608\uC758", romanized: "Yeeui", english: "Manners / Etiquette" },
            { native: "\uC778\uC0AC", romanized: "Insa", english: "Greeting / Bowing" },
            { native: "\uC874\uC911", romanized: "Jonjung", english: "Respect" },
            { native: "\uAC70\uC808\uD558\uB2E4", romanized: "Geojeolhada", english: "To decline (politely)" },
            { native: "\uAC10\uC0AC", romanized: "Gamsa", english: "Gratitude" }
          ],
          tips: ["Always pass and receive drinks, business cards, or gifts with two hands"],
          practice: "Simulate handing a package to an elder using both hands."
        }
      },
      {
        id: "ko-15",
        title: "Past Tense Sentences",
        description: "Conjugate verbs into past tense timelines",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Learn how to form past tense statements ending in -asseoyo / -eosseoyo.",
          keyPhrases: [
            { native: "\uAC14\uC5B4\uC694", romanized: "Gasseoyo", english: "Went (past of \uAC00\uB2E4)" },
            { native: "\uBA39\uC5C8\uC5B4\uC694", romanized: "Meogeosseoyo", english: "Ate (past of \uBA39\uB2E4)" },
            { native: "\uACF5\uBD80\uD588\uC5B4\uC694", romanized: "Gongbuhaesseoyo", english: "Studied (past of \uACF5\uBD80\uD558\uB2E4)" },
            { native: "\uC5B4\uC81C", romanized: "Eoje", english: "Yesterday" },
            { native: "\uC9C0\uB09C\uC8FC", romanized: "Jinanju", english: "Last week" },
            { native: "\uBC1B\uC558\uC5B4\uC694", romanized: "Badasseoyo", english: "Received (past of \uBC1B\uB2E4)" },
            { native: "\uBD24\uC5B4\uC694", romanized: "Bwasseoyo", english: "Saw / Watched (past of \uBCF4\uB2E4)" },
            { native: "\uD588\uC5B4\uC694", romanized: "Haesseoyo", english: "Did (past of \uD558\uB2E4)" },
            { native: "\uC7AC\uBBF8\uC788\uC5C8\uC5B4\uC694", romanized: "Jaemi-isseosseoyo", english: "It was fun" },
            { native: "\uC5B4\uC81C \uC601\uD654\uB97C \uBD24\uC5B4\uC694", romanized: "Eoje yeonghwareul bwasseoyo", english: "I watched a movie yesterday" }
          ],
          tips: ['Verb roots with "\u314F" or "\u3157" add "-\uC558\uC5B4\uC694", others add "-\uC5C8\uC5B4\uC694"; "-\uD558\uB2E4" verbs become "-\uD588\uC5B4\uC694"'],
          practice: 'Change the sentence "\uAE40\uCE58\uB97C \uBA39\uC5B4\uC694" (I eat kimchi) to past tense.'
        }
      },
      {
        id: "ko-16",
        title: "Korean Idioms & Slang",
        description: "Learn popular idiomatic expressions and modern slang in South Korea",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Korean idioms (Gwanyonggu) and modern slangs reflect daily life, food, and feelings.",
          keyPhrases: [
            { native: "\uC2DD\uC740 \uC8FD \uBA39\uAE30", romanized: "Sigeun juk meokgi", english: "Piece of cake (lit. eating cold porridge)" },
            { native: "\uB204\uC6CC\uC11C \uB5A1 \uBA39\uAE30", romanized: "Nuwoseo tteok meokgi", english: "Extremely easy (lit. eating rice cakes while lying down)" },
            { native: "\uC2EC\uCFF5", romanized: "Simkung", english: "Heartthrob / Heart skip a beat" },
            { native: "\uBC00\uB2F9", romanized: "Mildang", english: "Push and pull in relationships" },
            { native: "\uD53C\uAC00 \uB418\uACE0 \uC0B4\uC774 \uB41C\uB2E4", romanized: "Piga doego sari doenda", english: "Highly beneficial (lit. becomes blood and flesh)" }
          ],
          tips: ["Food-related metaphors are extremely common in Korean expressions", '"Simkung" is widely used by younger generations'],
          practice: 'Create a sentence about a test or chore using "\uC2DD\uC740 \uC8FD \uBA39\uAE30".'
        }
      },
      {
        id: "ko-17",
        title: "Korean Proverbs (Sokdam)",
        description: "Understand traditional Korean wisdom and cultural proverbs",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Proverbs (Sokdam) offer a glimpse into traditional Korean lifestyles and advice.",
          keyPhrases: [
            { native: "\uD2F0\uB04C \uBAA8\uC544 \uD0DC\uC0B0", romanized: "Tiggle moa taesan", english: "Dust gathered becomes a mountain" },
            { native: "\uC2DC\uC791\uC774 \uBC18\uC774\uB2E4", romanized: "Sijagi banida", english: "Starting is half the battle" },
            { native: "\uAE08\uAC15\uC0B0\uB3C4 \uC2DD\uD6C4\uACBD", romanized: "Geumgangsando sikhugyeong", english: "Even at Mt. Geumgang, eat first" },
            { native: "\uC6D0\uC22D\uC774\uB3C4 \uB098\uBB34\uC5D0\uC11C \uB5A8\uC5B4\uC9C4\uB2E4", romanized: "Wonsungido namueseo tteoreojinda", english: "Even monkeys fall from trees (experts make mistakes)" },
            { native: "\uBC31\uC9C0\uC7A5\uB3C4 \uB9DE\uB4E4\uBA74 \uB0AB\uB2E4", romanized: "Baekjijangdo matdeulmyeon natda", english: "Two heads are better than one" }
          ],
          tips: ['"Geumgangsando sikhugyeong" highlights the importance of eating before doing activities', "Many proverbs emphasize diligence and cooperation"],
          practice: 'Explain the meaning of "\uC2DC\uC791\uC774 \uBC18\uC774\uB2E4" in English.'
        }
      }
    ]
  },
  {
    id: "japanese",
    language: "Japanese",
    flag: "\u{1F1EF}\u{1F1F5}",
    color: "#dc2626",
    gradient: "from-red-500 to-pink-400",
    lessons: [
      {
        id: "ja-01",
        title: "Hiragana: The First Script",
        description: "Master the 46 hiragana characters",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "20 min",
        content: {
          intro: "Hiragana is the foundational Japanese script. Every Japanese learner starts here. It represents syllables, not individual letters.",
          keyPhrases: [
            { native: "\u3042", romanized: "A", english: 'Vowel: a (as in "father")' },
            { native: "\u3044", romanized: "I", english: 'Vowel: i (as in "meet")' },
            { native: "\u304B", romanized: "Ka", english: "Consonant+vowel combination" },
            { native: "\u3055", romanized: "Sa", english: "Sa row beginning" },
            { native: "\u305F\u3079\u308B", romanized: "Taberu", english: "To eat (written in hiragana)" }
          ],
          tips: ["Learn in the a-i-u-e-o vowel row order", "Use mnemonics and flashcards", "Practice writing \u2014 muscle memory helps retention"],
          practice: "Write the entire hiragana chart from memory."
        }
      },
      {
        id: "ja-02",
        title: "Katakana: For Foreign Words",
        description: "Learn Katakana used for loanwords and emphasis",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "18 min",
        content: {
          intro: "Katakana mirrors hiragana sounds but is used for foreign words, scientific terms, and emphasis.",
          keyPhrases: [
            { native: "\u30A2", romanized: "A", english: "Katakana A" },
            { native: "\u30B3\u30FC\u30D2\u30FC", romanized: "Koohii", english: "Coffee (loanword from English)" },
            { native: "\u30C6\u30EC\u30D3", romanized: "Terebi", english: "Television" },
            { native: "\u30A2\u30A4\u30B9\u30AF\u30EA\u30FC\u30E0", romanized: "Aisu kuriimu", english: "Ice cream" },
            { native: "\u30DE\u30AF\u30C9\u30CA\u30EB\u30C9", romanized: "Makudonarudo", english: "McDonald's" }
          ],
          tips: ["Guess English loanwords from Katakana \u2014 many are recognizable", "Katakana has more angular strokes than hiragana", "Essential for menus, signs, and modern vocabulary"],
          practice: "Write 10 English words in Katakana."
        }
      },
      {
        id: "ja-03",
        title: "Greetings & Politeness",
        description: "Essential Japanese greetings for all occasions",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Japanese greetings change based on time of day and formality level. Politeness is central to Japanese culture.",
          keyPhrases: [
            { native: "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059", romanized: "Ohayou gozaimasu", english: "Good morning (formal)" },
            { native: "\u3053\u3093\u306B\u3061\u306F", romanized: "Konnichiwa", english: "Hello / Good afternoon" },
            { native: "\u3053\u3093\u3070\u3093\u306F", romanized: "Konbanwa", english: "Good evening" },
            { native: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059", romanized: "Arigatou gozaimasu", english: "Thank you very much" },
            { native: "\u3059\u307F\u307E\u305B\u3093", romanized: "Sumimasen", english: "Excuse me / I am sorry" }
          ],
          tips: ["Bowing is the main form of greeting in Japan", "Depth of bow shows level of respect", "Use polite forms with strangers and elders always"],
          practice: "Practice using different greetings at the right time of day."
        }
      },
      {
        id: "ja-04",
        title: "Japanese Particles",
        description: "Understand wa, ga, wo, ni, de and more",
        type: "grammar",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: "Particles are the backbone of Japanese grammar. They attach to words to show their grammatical role.",
          keyPhrases: [
            { native: "\u306F (wa)", romanized: "wa", english: 'Topic marker: "as for..."' },
            { native: "\u304C (ga)", romanized: "ga", english: "Subject marker" },
            { native: "\u3092 (wo)", romanized: "wo/o", english: "Object marker" },
            { native: "\u306B (ni)", romanized: "ni", english: "Direction / location / time" },
            { native: "\u3067 (de)", romanized: "de", english: "Location of action / by means of" }
          ],
          tips: ["\u306F marks what you are talking about; \u304C marks who does the action", "\u3067 indicates the place where action happens", "Practice by labeling sentences and identifying each particle"],
          practice: "Write 5 sentences using a different particle in each."
        }
      },
      {
        id: "ja-05",
        title: "Japanese Numbers & Counters",
        description: "Count things correctly using Japanese counters",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Japanese uses different counter words depending on what is being counted (flat objects, long objects, people, etc.).",
          keyPhrases: [
            { native: "\u4E00\u3064", romanized: "Hitotsu", english: "One (general objects)" },
            { native: "\u4E00\u4EBA", romanized: "Hitori", english: "One person" },
            { native: "\u4E00\u679A", romanized: "Ichimai", english: "One flat object (paper, ticket)" },
            { native: "\u4E00\u672C", romanized: "Ippon", english: "One long object (pencil, bottle)" },
            { native: "\u4E00\u5339", romanized: "Ippiki", english: "One small animal" }
          ],
          tips: ["Learn the most common counters first (tsu, hitori, mai, hon)", "Irregular readings exist for 1, 6, 8, and 10", "Use generic \u3064 counters when unsure"],
          practice: "Count 5 different items in the room using the correct counter."
        }
      },
      {
        id: "ja-06",
        title: "Japanese Restaurant Phrases",
        description: "Dine in Japan with confidence",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Japan has a profound food culture. Knowing the right phrases will enhance your dining experience.",
          keyPhrases: [
            { native: "\u3044\u305F\u3060\u304D\u307E\u3059", romanized: "Itadakimasu", english: "I humbly receive (said before eating)" },
            { native: "\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F", romanized: "Gochisousamadeshita", english: "It was a feast (said after eating)" },
            { native: "\u304A\u3059\u3059\u3081\u306F\u4F55\u3067\u3059\u304B", romanized: "Osusume wa nan desu ka", english: "What do you recommend?" },
            { native: "\u304A\u4F1A\u8A08\u3092\u304A\u9858\u3044\u3057\u307E\u3059", romanized: "Okaikei wo onegaishimasu", english: "Check please" },
            { native: "\u8F9B\u304F\u306A\u3044\u3082\u306E\u306F\u3042\u308A\u307E\u3059\u304B", romanized: "Karakunai mono wa arimasu ka", english: "Do you have anything not spicy?" }
          ],
          tips: ["Water is free in Japanese restaurants", "Many restaurants have plastic food displays outside", "Slurping noodles is acceptable and complimentary"],
          practice: "Role-play ordering a full meal in Japanese with a partner."
        }
      },
      {
        id: "ja-07",
        title: "Kanji Basics: Top 50",
        description: "Learn the most fundamental kanji characters",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "25 min",
        content: {
          intro: "Kanji are Chinese-derived characters used in Japanese. You need 2,136 j\u014Dy\u014D kanji for literacy.",
          keyPhrases: [
            { native: "\u65E5", romanized: "Nichi/Hi", english: "Sun / Day" },
            { native: "\u6708", romanized: "Getsu/Tsuki", english: "Moon / Month" },
            { native: "\u6C34", romanized: "Sui/Mizu", english: "Water" },
            { native: "\u706B", romanized: "Ka/Hi", english: "Fire" },
            { native: "\u6728", romanized: "Moku/Ki", english: "Tree / Wood" }
          ],
          tips: ["Learn kanji in context \u2014 with vocabulary and sentences", "Use spaced repetition software (Anki) for memorization", "Days of the week use elemental kanji: \u6708\u706B\u6C34\u6728\u91D1\u571F\u65E5"],
          practice: "Write the 5 kanji today and create a sentence with each."
        }
      },
      {
        id: "ja-08",
        title: "Japanese Work Culture",
        description: "Understand Japanese business etiquette",
        type: "culture",
        difficulty: "advanced",
        duration: "15 min",
        content: {
          intro: "Japan's work culture is known for its dedication, hierarchy, and group harmony (\u548C wa).",
          keyPhrases: [
            { native: "\u304A\u75B2\u308C\u69D8\u3067\u3059", romanized: "Otsukaresama desu", english: "Thank you for your hard work" },
            { native: "\u540D\u523A", romanized: "Meishi", english: "Business card (exchange with both hands)" },
            { native: "\u4E0A\u53F8", romanized: "Jooshi", english: "Boss / Superior" },
            { native: "\u4F1A\u8B70", romanized: "Kaigi", english: "Meeting" },
            { native: "\u6B8B\u696D", romanized: "Zangyou", english: "Overtime work" }
          ],
          tips: ["Business cards are treated with great respect in Japan", "Never write on a business card received from someone", "Consensus-building (\u6839\u56DE\u3057 nemawashi) is valued over individual decisions"],
          practice: "Research 3 rules of Japanese business card etiquette."
        }
      },
      {
        id: "ja-09",
        title: "Te-form: Connecting Verbs",
        description: "Use the te-form to build complex sentences",
        type: "grammar",
        difficulty: "advanced",
        duration: "22 min",
        content: {
          intro: "The \u3066-form (te-form) is one of the most important verb forms in Japanese. It is used for sequences, requests, and progressive tenses.",
          keyPhrases: [
            { native: "\u98DF\u3079\u3066\u304F\u3060\u3055\u3044", romanized: "Tabete kudasai", english: "Please eat (polite request)" },
            { native: "\u8D70\u3063\u3066\u3044\u307E\u3059", romanized: "Hashitte imasu", english: "Am running (progressive)" },
            { native: "\u8D77\u304D\u3066\u3001\u98DF\u3079\u3066\u3001\u884C\u304F", romanized: "Okite, tabete, iku", english: "Wake up, eat, and go (sequence)" },
            { native: "\u307F\u3066\u3082\u3044\u3044\u3067\u3059\u304B", romanized: "Mite mo ii desu ka", english: "May I look? (permission)" },
            { native: "\u3057\u3066\u306F\u3044\u3051\u307E\u305B\u3093", romanized: "Shite wa ikemasen", english: "Must not do (prohibition)" }
          ],
          tips: ["Group 1 verbs: replace u ending with \u3063\u3066 or \u3063\u3066", "Group 2 verbs: replace \u308B with \u3066", "Irregular: \u3059\u308B\u2192\u3057\u3066, \u304F\u308B\u2192\u304D\u3066"],
          practice: "Convert 10 verbs into their te-form and use each in a sentence."
        }
      },
      {
        id: "ja-10",
        title: "Japanese Pop Culture",
        description: "Anime, manga, and otaku culture vocabulary",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Japanese pop culture has global influence. Many people learn Japanese because of anime and manga.",
          keyPhrases: [
            { native: "\u30A2\u30CB\u30E1", romanized: "Anime", english: "Japanese animation" },
            { native: "\u30DE\u30F3\u30AC", romanized: "Manga", english: "Japanese comics" },
            { native: "\u304B\u308F\u3044\u3044", romanized: "Kawaii", english: "Cute / Adorable" },
            { native: "\u3059\u3054\u3044", romanized: "Sugoi", english: "Amazing / Wow" },
            { native: "\u306A\u308B\u307B\u3069", romanized: "Naruhodo", english: "I see / Makes sense" }
          ],
          tips: ["Anime often uses informal speech \u2014 supplement with formal study", "Manga reading helps with kanji recognition", "Join Japanese learning communities inspired by shared interests"],
          practice: "Watch 5 minutes of anime with Japanese subtitles and note new words."
        }
      },
      {
        id: "ja-11",
        title: "Weather & Seasons",
        description: "Discuss Japan's weather and four seasons",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Japan has four distinct and highly celebrated seasons (Shiki). Knowing weather words is great for small talk.",
          keyPhrases: [
            { native: "\u6674\u308C", romanized: "Hare", english: "Sunny" },
            { native: "\u96E8", romanized: "Ame", english: "Rainy" },
            { native: "\u6691\u3044", romanized: "Atsui", english: "Hot" },
            { native: "\u5BD2\u3044", romanized: "Samui", english: "Cold" },
            { native: "\u685C", romanized: "Sakura", english: "Cherry blossom" }
          ],
          tips: ["Hanami (cherry blossom viewing) happens in Spring (Haru)", "Koyo (autumn leaves viewing) occurs in Fall (Aki)", 'Use "desu" to make weather statements polite, e.g. "Ame desu"'],
          practice: "State the current weather of your location in Japanese."
        }
      },
      {
        id: "ja-12",
        title: "Japanese Onsen Culture",
        description: "Learn the rules of visiting a hot spring",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Onsens are natural hot springs essential to Japanese relaxation. Respecting the bathing rules is mandatory.",
          keyPhrases: [
            { native: "\u6E29\u6CC9", romanized: "Onsen", english: "Hot spring" },
            { native: "\u6E6F", romanized: "Yu", english: "Hot water" },
            { native: "\u6D74\u8863", romanized: "Yukata", english: "Light kimono" },
            { native: "\u8131\u8863\u6240", romanized: "Datsuijo", english: "Changing room" },
            { native: "\u6D17\u3046", romanized: "Arau", english: "To wash" }
          ],
          tips: ["Wash your body completely before entering the bathwater", "Do not put towels or hair into the hot spring water", "Check the tattoo policy before booking, as some onsens forbid them"],
          practice: "List three steps you should follow when visiting an Onsen."
        }
      },
      {
        id: "ja-13",
        title: "Asking for Directions in Tokyo",
        description: "Navigate Tokyo stations and streets",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Get lost and find landmarks in metropolitan Tokyo with confidence.",
          keyPhrases: [
            { native: "\u99C5\u306F\u3069\u3053\u3067\u3059\u304B", romanized: "Eki wa doko desu ka", english: "Where is the station?" },
            { native: "\u307E\u3063\u3059\u3050\u884C\u3063\u3066\u304F\u3060\u3055\u3044", romanized: "Massugu itte kudasai", english: "Please go straight" },
            { native: "\u5DE6\u306B\u66F2\u304C\u3063\u3066\u304F\u3060\u3055\u3044", romanized: "Hidari ni magatte kudasai", english: "Please turn left" },
            { native: "\u53F3\u306B\u66F2\u304C\u3063\u3066\u304F\u3060\u3055\u3044", romanized: "Migi ni magatte kudasai", english: "Please turn right" },
            { native: "\u4EA4\u756A", romanized: "Kooban", english: "Police box" },
            { native: "\u5207\u7B26\u58F2\u308A\u5834", romanized: "Kippu uriba", english: "Ticket office" },
            { native: "\u6539\u672D\u53E3", romanized: "Kaisatsuguchi", english: "Ticket gate" },
            { native: "\u51FA\u53E3 / \u5165\u53E3", romanized: "Deguchi / Iriguchi", english: "Exit / Entrance" },
            { native: "\u3053\u3053\u304B\u3089\u9060\u3044\u3067\u3059\u304B", romanized: "Koko kara tooi desu ka", english: "Is it far from here?" },
            { native: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059", romanized: "Arigatou gozaimasu", english: "Thank you very much" }
          ],
          tips: ['Find the nearest "Kooban" (police box) if you get completely lost'],
          practice: 'Ask someone where Shinjuku station is: "Shinjuku eki wa doko desu ka?".'
        }
      },
      {
        id: "ja-14",
        title: "Gift Giving & Omiyage",
        description: "Learn Japanese gifting culture and etiquette",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Learn about Omiyage (souvenirs) and how to give/receive gifts.",
          keyPhrases: [
            { native: "\u304A\u571F\u7523", romanized: "Omiyage", english: "Souvenir / regional gift" },
            { native: "\u3064\u307E\u3089\u306A\u3044\u3082\u306E\u3067\u3059\u304C", romanized: "Tsumaranai mono desu ga", english: "It's nothing special, but... (humble)" },
            { native: "\u3069\u3046\u305E", romanized: "Douzo", english: "Here you go" },
            { native: "\u624B\u571F\u7523", romanized: "Temiyage", english: "Thank-you gift brought to a house visit" },
            { native: "\u71A8\u6597", romanized: "Noshi", english: "Decorative gift wrapping paper" },
            { native: "\u304A\u8FD4\u3057", romanized: "Okaeshi", english: "Return gift (obligatory thank-you gift)" },
            { native: "\u9060\u616E", romanized: "Enryo", english: "Hesitation / polite declining" },
            { native: "\u8D08\u308A\u7269", romanized: "Okurimono", english: "Gift / Present" },
            { native: "\u4E21\u624B\u3067\u6E21\u3059", romanized: "Ryoute de watasu", english: "Hand over with both hands" },
            { native: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3057\u305F", romanized: "Arigatou gozaimashita", english: "Thank you for what you did" }
          ],
          tips: ["Never open a gift immediately after receiving it unless invited to do so"],
          practice: 'Simulate presenting a gift saying "Douzo" with both hands.'
        }
      },
      {
        id: "ja-15",
        title: "Past Tense: Ta-form",
        description: "Conjugate verbs into past tense forms",
        type: "grammar",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: "Convert verbs into past tense using the Ta-form (informal past).",
          keyPhrases: [
            { native: "\u98DF\u3079\u305F", romanized: "Tabeta", english: "Ate (past of taberu)" },
            { native: "\u884C\u3063\u305F", romanized: "Itta", english: "Went (past of iku)" },
            { native: "\u8AAD\u3093\u3060", romanized: "Yonda", english: "Read (past of yomu)" },
            { native: "\u3057\u307E\u3057\u305F", romanized: "Shimashita", english: "Did (formal past of suru)" },
            { native: "\u98DF\u3079\u307E\u3057\u305F", romanized: "Tabemashita", english: "Ate (formal past of taberu)" },
            { native: "\u6628\u65E5", romanized: "Kinou", english: "Yesterday" },
            { native: "\u5148\u9031", romanized: "Senshuu", english: "Last week" },
            { native: "\u8CB7\u3063\u305F", romanized: "Katta", english: "Bought (past of kau)" },
            { native: "\u898B\u305F", romanized: "Mita", english: "Saw / Watched (past of miru)" },
            { native: "\u6620\u753B\u3092\u898B\u305F", romanized: "Eiga wo mita", english: "I watched a movie" }
          ],
          tips: ['Ta-form conjugates exactly like Te-form, just substitute "ta/da" for "te/de"'],
          practice: 'Convert "hon wo yomimasu" (I read a book) into formal past tense.'
        }
      },
      {
        id: "ja-16",
        title: "Japanese Idioms & Colloquialisms",
        description: "Learn everyday idiomatic phrases and popular colloquial Japanese",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Japanese colloquialisms add natural flavor to your speech. Study these common idioms.",
          keyPhrases: [
            { native: "\u671D\u98EF\u524D", romanized: "Asameshimae", english: "Piece of cake (lit. before breakfast)" },
            { native: "\u732B\u306E\u624B\u3082\u501F\u308A\u305F\u3044", romanized: "Neko no te mo karitai", english: "Extremely busy (lit. wanting to borrow even a cat's paw)" },
            { native: "\u76F8\u69CC\u3092\u6253\u3064", romanized: "Aiduchi wo utsu", english: "Nodding in agreement (backchanneling)" },
            { native: "\u53E3\u304C\u8EFD\u3044", romanized: "Kuchi ga karui", english: "Having a loose tongue (cannot keep secrets)" },
            { native: "\u8179\u304C\u7ACB\u3064", romanized: "Hara ga tatsu", english: "To get angry (lit. stomach stands up)" }
          ],
          tips: ['Conversational backchannels ("Aiduchi") like "Un", "Hee", or "Soudesu ne" show active listening', "Many idioms refer to body parts (stomach, mouth, eyes)"],
          practice: 'Describe a busy schedule using "Neko no te mo karitai".'
        }
      },
      {
        id: "ja-17",
        title: "Japanese Kotowaza (Proverbs)",
        description: "Learn traditional Japanese proverbs and life advice",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Proverbs (Kotowaza) embody centuries of Japanese philosophies on life, nature, and resilience.",
          keyPhrases: [
            { native: "\u733F\u3082\u6728\u304B\u3089\u843D\u3061\u308B", romanized: "Saru mo ki kara ochiru", english: "Even monkeys fall from trees (experts make mistakes)" },
            { native: "\u4E03\u8EE2\u3073\u516B\u8D77\u304D", romanized: "Nanakorobi yaoki", english: "Fall seven times, stand up eight (resilience)" },
            { native: "\u4E00\u671F\u4E00\u4F1A", romanized: "Ichigo ichie", english: "Once-in-a-lifetime encounter" },
            { native: "\u3061\u308A\u3082\u7A4D\u3082\u308C\u3070\u5C71\u3068\u306A\u308B", romanized: "Chiri mo tsumoreba yama to naru", english: "Dust piled up becomes a mountain (every bit counts)" },
            { native: "\u4E95\u306E\u4E2D\u306E\u86D9\u5927\u6D77\u3092\u77E5\u3089\u305A", romanized: "I no naka no kawazu taikai wo shirazu", english: "A frog in a well knows nothing of the great ocean" }
          ],
          tips: ['Four-character idioms (Yojijukugo) like "Ichigo ichie" are highly valued', '"Nanakorobi yaoki" is a core tenet of Japanese perseverance'],
          practice: 'Explain the meaning of "Ichigo ichie" in your own words.'
        }
      }
    ]
  },
  {
    id: "french",
    language: "French",
    flag: "\u{1F1EB}\u{1F1F7}",
    color: "#1d4ed8",
    gradient: "from-blue-700 to-red-500",
    lessons: [
      {
        id: "fr-01",
        title: "French Pronunciation Fundamentals",
        description: "Master nasal vowels, silent letters and liaison",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "15 min",
        content: {
          intro: "French pronunciation differs greatly from spelling. Silent letters, nasal sounds, and liaison make it unique.",
          keyPhrases: [
            { native: "eau", romanized: "/o/", english: '"Water" sound \u2014 like in "oh"' },
            { native: "eu", romanized: "/\xF8/", english: 'Like "uh" but with rounded lips' },
            { native: "en / an / am", romanized: "/\u0251\u0303/", english: "Nasal vowel sound" },
            { native: "in / ain / ein", romanized: "/\u025B\u0303/", english: 'Nasal "an" sound' },
            { native: "on / om", romanized: "/\u0254\u0303/", english: 'Nasal "on" sound' }
          ],
          tips: ["Final consonants are usually silent in French", "Liaison links final consonant to next vowel-starting word", "Practice with tongue twisters (virelangues)"],
          practice: "Record yourself reading 3 French sentences and identify liaison points."
        }
      },
      {
        id: "fr-02",
        title: "Les Salutations",
        description: "Greetings and introductions in French",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: 'French greetings depend on time of day and formality. "Tu" and "vous" indicate relationship levels.',
          keyPhrases: [
            { native: "Bonjour", romanized: "b\u0254\u0303\u0292u\u0281", english: "Good morning / Hello" },
            { native: "Bonsoir", romanized: "b\u0254\u0303swa\u0281", english: "Good evening" },
            { native: "Enchant\xE9(e)", romanized: "\u0251\u0303\u0283\u0251\u0303te", english: "Pleased to meet you" },
            { native: "Comment allez-vous?", romanized: "k\u0254m\u0251\u0303 ale vu", english: "How are you? (formal)" },
            { native: "Au revoir", romanized: "o \u0281\u0259vwa\u0281", english: "Goodbye" }
          ],
          tips: ["La bise (cheek kiss) is a common greeting in France", 'Use "vous" for strangers and formal situations', '"Tu" is reserved for friends, family, and children'],
          practice: "Introduce yourself formally and informally in French."
        }
      },
      {
        id: "fr-03",
        title: "Gender of Nouns",
        description: "Understand masculine and feminine nouns",
        type: "grammar",
        difficulty: "beginner",
        duration: "14 min",
        content: {
          intro: "Every French noun has a grammatical gender: masculine (le) or feminine (la). This affects all agreeing words.",
          keyPhrases: [
            { native: "le livre", romanized: "luh leevr", english: "The book (masculine)" },
            { native: "la table", romanized: "la tabl", english: "The table (feminine)" },
            { native: "un chat", romanized: "uhn sha", english: "A cat (masculine)" },
            { native: "une maison", romanized: "oon mezohn", english: "A house (feminine)" },
            { native: "les enfants", romanized: "lay z\u0251\u0303f\u0251\u0303", english: "The children (plural)" }
          ],
          tips: ["Words ending in -tion, -sion are usually feminine", "Words ending in -eau, -ment are usually masculine", "Always learn nouns with their articles"],
          practice: "List 10 French nouns and correctly assign le or la to each."
        }
      },
      {
        id: "fr-04",
        title: "Present Tense Verbs",
        description: "Conjugate -er, -ir, and -re verbs",
        type: "grammar",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: "French verbs are grouped into three families by their infinitive endings. Each group has its own conjugation pattern.",
          keyPhrases: [
            { native: "parler (je parle)", romanized: "parle", english: "To speak (I speak)" },
            { native: "finir (je finis)", romanized: "feeneer", english: "To finish (I finish)" },
            { native: "vendre (je vends)", romanized: "v\u0251\u0303d\u0281", english: "To sell (I sell)" },
            { native: "\xEAtre (je suis)", romanized: "etr", english: "To be (I am) \u2014 irregular" },
            { native: "avoir (j'ai)", romanized: "avwa\u0281", english: "To have (I have) \u2014 irregular" }
          ],
          tips: ["\xCAtre and avoir are irregular but essential \u2014 memorize them first", "Most verbs are -er; learn this group thoroughly", "Use BAGS adjectives rule: Beauty, Age, Goodness, Size come before noun"],
          practice: "Conjugate parler, finir, and vendre for all persons."
        }
      },
      {
        id: "fr-05",
        title: "Au Restaurant",
        description: "Dining in France: ordering food and drinks",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "French cuisine is world-famous. Knowing restaurant vocabulary helps you enjoy the full dining experience.",
          keyPhrases: [
            { native: "Je voudrais commander", romanized: "zhuh voodray kom\u0251\u0303de", english: "I would like to order" },
            { native: "L'addition, s'il vous pla\xEEt", romanized: "ladisy\u0254\u0303 sil vu pl\u025B", english: "The bill please" },
            { native: "C'est d\xE9licieux!", romanized: "se delisy\xF8", english: "It is delicious!" },
            { native: "Je suis allergique \xE0...", romanized: "zhuh swee al\u025B\u0281\u0292ik a", english: "I am allergic to..." },
            { native: "Une carafe d'eau", romanized: "yn ka\u0281af do", english: "A jug of water" }
          ],
          tips: ["Tap water (une carafe d'eau) is free by law in French restaurants", "Service charge is included in French bills", "Bread is typically provided free of charge"],
          practice: "Write a full 3-course French dinner order dialogue."
        }
      },
      {
        id: "fr-06",
        title: "French Adjectives & Agreement",
        description: "Correctly match adjectives with nouns",
        type: "grammar",
        difficulty: "intermediate",
        duration: "16 min",
        content: {
          intro: "French adjectives must agree in gender and number with the nouns they modify. This is one of the trickiest aspects for learners.",
          keyPhrases: [
            { native: "un petit gar\xE7on", romanized: "uh puh-tee gar-soh", english: "A small boy (masc)" },
            { native: "une petite fille", romanized: "oon puh-teet fee", english: "A small girl (fem)" },
            { native: "des livres int\xE9ressants", romanized: "day leevr \u025B\u0303teres\u0251\u0303", english: "Interesting books (masc pl)" },
            { native: "une belle femme", romanized: "oon bel fam", english: "A beautiful woman" },
            { native: "un beau jour", romanized: "uh bo zhu\u0281", english: "A beautiful day (masc)" }
          ],
          tips: ["Add -e to make most adjectives feminine", "Add -s to make adjectives plural", "Irregular adjectives: beau/belle, vieux/vieille, bon/bonne"],
          practice: "Write a description of your bedroom using 5 French adjectives."
        }
      },
      {
        id: "fr-07",
        title: "Shopping in France",
        description: "Buy clothes, food, and souvenirs in French",
        type: "conversation",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "France is known for fashion, food markets, and luxury goods. Shopping vocabulary is highly practical.",
          keyPhrases: [
            { native: "Combien \xE7a co\xFBte?", romanized: "k\u0254\u0303by\u025B\u0303 sa kut", english: "How much does it cost?" },
            { native: "Je cherche...", romanized: "zhuh sh\u025B\u0281sh", english: "I am looking for..." },
            { native: "Avez-vous une taille plus grande?", romanized: "ave vu yn taj ply g\u0281\u0251\u0303d", english: "Do you have a larger size?" },
            { native: "Je peux l'essayer?", romanized: "zhuh p\xF8 leseje", english: "May I try it on?" },
            { native: "Je le prends", romanized: "zhuh luh p\u0281\u0251\u0303", english: "I will take it" }
          ],
          tips: ["French sales (Soldes) happen twice yearly in January and July", "Most stores close on Sundays in smaller towns", 'Discount stores are called "solderie" or "d\xE9griff\xE9"'],
          practice: "Role-play buying a shirt in a French boutique."
        }
      },
      {
        id: "fr-08",
        title: "French Culture & History",
        description: "Explore French art, philosophy and way of life",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "France has one of the richest cultural heritages in the world \u2014 from the Enlightenment to haute cuisine.",
          keyPhrases: [
            { native: "Libert\xE9, \xC9galit\xE9, Fraternit\xE9", romanized: "lib\u025B\u0281te egalite f\u0281at\u025B\u0281nite", english: "Liberty, Equality, Brotherhood (national motto)" },
            { native: "Le Louvre", romanized: "luh loov\u0281", english: "World's largest art museum (Paris)" },
            { native: "La Tour Eiffel", romanized: "la tu\u0281 ef\u025Bl", english: "The Eiffel Tower" },
            { native: "le cin\xE9ma", romanized: "luh sinema", english: "Cinema (invented in France)" },
            { native: "la gastronomie", romanized: "la gast\u0281\u0254n\u0254mi", english: "Gastronomy \u2014 French culinary tradition" }
          ],
          tips: ["France receives the most tourists of any country annually", "The French language is spoken on 5 continents", "French philosophers like Descartes and Sartre shaped modern thought"],
          practice: "Research one French artist or philosopher and summarize their contribution."
        }
      },
      {
        id: "fr-09",
        title: "Numbers & Time",
        description: "Count, tell time, and use dates in French",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "French numbers are mostly regular, except for some tricky ones like 70 (soixante-dix) and 80 (quatre-vingts).",
          keyPhrases: [
            { native: "soixante-dix", romanized: "swas\u0251\u0303t dis", english: '70 (literally "sixty-ten")' },
            { native: "quatre-vingts", romanized: "kat\u0281uh v\u025B\u0303", english: '80 (literally "four-twenties")' },
            { native: "Quelle heure est-il?", romanized: "k\u025Bl \u0153\u0281 \u025Btil", english: "What time is it?" },
            { native: "Il est midi", romanized: "il \u025B midi", english: "It is noon" },
            { native: "Lundi, Mardi, Mercredi", romanized: "l\u0153\u0303di ma\u0281di m\u025B\u0281k\u0281\u0259di", english: "Monday, Tuesday, Wednesday" }
          ],
          tips: ["French uses 24-hour clock in formal contexts", "Months and days are NOT capitalized in French", "Belgium and Switzerland use different words for 70 and 90"],
          practice: "Write out today's full date and your daily schedule in French."
        }
      },
      {
        id: "fr-10",
        title: "Subjunctive Mood",
        description: "Express doubt, wishes, and emotions in French",
        type: "grammar",
        difficulty: "advanced",
        duration: "22 min",
        content: {
          intro: "The subjunctive (subjonctif) is used after expressions of wish, doubt, necessity, and emotion. It is essential for advanced French.",
          keyPhrases: [
            { native: "Il faut que tu viennes", romanized: "il fo kuh ty vy\u025Bn", english: "It is necessary that you come" },
            { native: "Je veux qu'il fasse beau", romanized: "zhuh v\xF8 keel fas bo", english: "I want the weather to be nice" },
            { native: "Bien que ce soit difficile", romanized: "by\u025B\u0303 kuh suh swa difisil", english: "Although it is difficult" },
            { native: "Je doute qu'il sache", romanized: "zhuh dut keel sash", english: "I doubt that he knows" },
            { native: "Pourvu qu'il arrive", romanized: "pu\u0281vy keel a\u0281iv", english: "Provided that he arrives" }
          ],
          tips: ['Subjunctive is triggered by "que" after key expressions', "Common irregular subjunctive: \xEAtre (soit), avoir (ait)", "Practice by transforming sentences with wish/doubt verbs"],
          practice: "Write 5 subjunctive sentences expressing your wishes for the future."
        }
      },
      {
        id: "fr-11",
        title: "Le Climat (Weather)",
        description: "Describe weather conditions and seasons",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Describing the weather is a great way to engage in conversations in France.",
          keyPhrases: [
            { native: "Il fait beau", romanized: "il fe bo", english: "It is nice weather" },
            { native: "Il pleut", romanized: "il pl\xF8", english: "It is raining" },
            { native: "Chaud", romanized: "sho", english: "Hot" },
            { native: "Froid", romanized: "f\u0281wa", english: "Cold" },
            { native: "Le soleil", romanized: "luh s\u0254l\u025Bj", english: "The sun" }
          ],
          tips: ['French uses "il fait" (literally: it makes) to describe weather, e.g. "Il fait froid"', 'To say it is snowing, use "Il neige"', "Seasons are masculine: le printemps (spring), l'\xE9t\xE9 (summer), l'automne (fall), l'hiver (winter)"],
          practice: "Write a short message to a friend about the weather forecast this weekend."
        }
      },
      {
        id: "fr-12",
        title: "French Cafe Culture",
        description: "Order coffee and experience Parisian cafe life",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Cafes are the heartbeat of French social life, serving as places to chat, read, and watch the world go by.",
          keyPhrases: [
            { native: "Un caf\xE9", romanized: "\u0153\u0303 kafe", english: "An espresso" },
            { native: "Un croissant", romanized: "\u0153\u0303 k\u0281was\u0251\u0303", english: "A croissant" },
            { native: "L'addition", romanized: "ladisj\u0254\u0303", english: "The bill / check" },
            { native: "Terrasse", romanized: "t\u025B\u0281as", english: "Outdoor seating area" },
            { native: "S'il vous pla\xEEt", romanized: "sil vu ple", english: "Please (formal)" }
          ],
          tips: ['Ordering "un caf\xE9" in France gets you a small, strong black espresso', 'Always start your order with "Bonjour" to be polite', 'Waiters are called "Monsieur", do not shout "Gar\xE7on"'],
          practice: "Create a short roleplay dialogue ordering a coffee and croissant."
        }
      },
      {
        id: "fr-13",
        title: "Directions: Asking on the Street",
        description: "Navigate Parisian neighborhoods",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Locate monuments and train stations using standard navigational phrasing.",
          keyPhrases: [
            { native: "O\xF9 est la station de m\xE9tro?", romanized: "\u2014", english: "Where is the subway station?" },
            { native: "Tournez \xE0 gauche", romanized: "\u2014", english: "Turn left" },
            { native: "Tournez \xE0 droite", romanized: "\u2014", english: "Turn right" },
            { native: "Allez tout droit", romanized: "\u2014", english: "Go straight ahead" },
            { native: "C'est pr\xE8s d'ici?", romanized: "\u2014", english: "Is it near here?" },
            { native: "C'est loin?", romanized: "\u2014", english: "Is it far?" },
            { native: "Le plan", romanized: "\u2014", english: "The map" },
            { native: "Pardon, je cherche...", romanized: "\u2014", english: "Excuse me, I am looking for..." },
            { native: "O\xF9 se trouve...?", romanized: "\u2014", english: "Where is [located]...?" },
            { native: "Merci beaucoup", romanized: "\u2014", english: "Thank you very much" }
          ],
          tips: ['Start street questions with "Pardon" (excuse me) to show courtesy'],
          practice: "Practice asking for the Louvre museum and asking if it is far."
        }
      },
      {
        id: "fr-14",
        title: "French Social Manners & dinner",
        description: "Master social customs and dining protocol",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Study French social rules, checking cheek kisses, and hosting manners.",
          keyPhrases: [
            { native: "La bise", romanized: "\u2014", english: "Greeting cheek kisses" },
            { native: "Bon app\xE9tit", romanized: "\u2014", english: "Enjoy your meal" },
            { native: "Sant\xE9 !", romanized: "sahn-tay", english: "Cheers! (Health)" },
            { native: "Madame / Monsieur", romanized: "\u2014", english: "Mrs. / Mr. (essential titles)" },
            { native: "Chaleureux", romanized: "\u2014", english: "Warm / welcoming" },
            { native: "Le d\xEEner", romanized: "\u2014", english: "Dinner" },
            { native: "Le pain", romanized: "\u2014", english: "Bread (served with all dinners)" },
            { native: "Politesse", romanized: "\u2014", english: "Politeness" },
            { native: "Inviter", romanized: "\u2014", english: "To invite / host" },
            { native: "Faire la bise", romanized: "\u2014", english: "Perform cheek kisses" }
          ],
          tips: ['Always wait for the host to say "Bon app\xE9tit" before starting to eat'],
          practice: "List key differences between greetings in France vs. your native country."
        }
      },
      {
        id: "fr-15",
        title: "Future Tense: Futur Proche",
        description: "Express future actions with aller",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: 'Form near future timelines using the verb "aller" plus an infinitive verb.',
          keyPhrases: [
            { native: "Je vais manger", romanized: "\u2014", english: "I am going to eat" },
            { native: "Tu vas faire", romanized: "\u2014", english: "You are going to do" },
            { native: "Il va partir", romanized: "\u2014", english: "He is going to leave" },
            { native: "Nous allons voyager", romanized: "\u2014", english: "We are going to travel" },
            { native: "Vous allez voir", romanized: "\u2014", english: "You all are going to see" },
            { native: "Ils vont acheter", romanized: "\u2014", english: "They are going to buy" },
            { native: "Demain", romanized: "deh-m\u025B\u0303", english: "Tomorrow" },
            { native: "Ce soir", romanized: "suh swahr", english: "Tonight" },
            { native: "Bient\xF4t", romanized: "\u2014", english: "Soon" },
            { native: "Je vais \xE9tudier le fran\xE7ais", romanized: "\u2014", english: "I am going to study French" }
          ],
          tips: ["Futur Proche is highly common in spoken French for plan actions"],
          practice: 'Translate "I am going to order a croissant tonight" into French.'
        }
      },
      {
        id: "fr-16",
        title: "French Slang & Idioms",
        description: "Master colloquial expressions and common French idioms",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Informal French is filled with colorful expressions. Master these widely-used slangs.",
          keyPhrases: [
            { native: "Les doigts dans le nez", romanized: "\u2014", english: "Piece of cake (lit. fingers in the nose)" },
            { native: "Tomber dans les pommes", romanized: "\u2014", english: "To faint (lit. to fall in the apples)" },
            { native: "C'est simple comme bonjour", romanized: "\u2014", english: "Very simple (lit. simple as hello)" },
            { native: "Avoir le cafard", romanized: "\u2014", english: "To feel blue / depressed (lit. to have the cockroach)" },
            { native: "Raconter des salades", romanized: "\u2014", english: "To tell lies / tall stories (lit. to tell salads)" }
          ],
          tips: ['French slang features "Verlan" (syllable inversion), e.g., "louche" becomes "chelou"', '"Avoir le cafard" is used casually to express sadness'],
          practice: 'Write a sentence describing a test you found extremely easy using "Les doigts dans le nez".'
        }
      },
      {
        id: "fr-17",
        title: "French Proverbs & Wisdom",
        description: "Explore traditional French sayings and cultural wisdom",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "French proverbs offer insights into patience, life observations, and history.",
          keyPhrases: [
            { native: "Petit \xE0 petit, l'oiseau fait son nid", romanized: "\u2014", english: "Little by little, the bird builds its nest" },
            { native: "Qui vivra verra", romanized: "\u2014", english: "Time will tell (lit. he who lives will see)" },
            { native: "Mieux vaut tard que jamais", romanized: "\u2014", english: "Better late than never" },
            { native: "Apr\xE8s la pluie, le beau temps", romanized: "\u2014", english: "Every cloud has a silver lining (lit. after rain, good weather)" },
            { native: "Rien ne sert de courir; il faut partir \xE0 point", romanized: "\u2014", english: "Slow and steady wins the race" }
          ],
          tips: ["Many French proverbs focus on nature, animals, and agricultural timelines", '"Qui vivra verra" is used when the outcome of a situation is uncertain'],
          practice: `Translate "Petit \xE0 petit, l'oiseau fait son nid" and explain its moral meaning.`
        }
      }
    ]
  },
  {
    id: "spanish",
    language: "Spanish",
    flag: "\u{1F1EA}\u{1F1F8}",
    color: "#d97706",
    gradient: "from-yellow-500 to-red-500",
    lessons: [
      {
        id: "es-01",
        title: "Spanish Alphabet & Sounds",
        description: "Pronunciation guide for Spanish letters",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Spanish pronunciation is highly consistent \u2014 words are almost always pronounced exactly as they are spelled.",
          keyPhrases: [
            { native: "\xF1", romanized: "ny", english: 'Like the "ny" in "canyon"' },
            { native: "rr", romanized: "trilled r", english: "A rolled/trilled r sound" },
            { native: "h", romanized: "silent", english: "H is always silent in Spanish" },
            { native: "ll", romanized: "y/zh", english: 'Like "y" in most dialects' },
            { native: "j", romanized: "kh", english: 'Like a strong "h" sound' }
          ],
          tips: ["Spanish vowels (a, e, i, o, u) always have one consistent sound", "Regional accents affect pronunciation (Spain vs Latin America)", 'Practice the trilled "rr" by saying "butter" fast'],
          practice: "Read a Spanish paragraph aloud, focusing on vowel sounds."
        }
      },
      {
        id: "es-02",
        title: "Hola y M\xE1s: Greetings",
        description: "Greet people in Spanish at any time of day",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Spanish is warm and expressive. Greetings often include questions about health and family.",
          keyPhrases: [
            { native: "\xA1Buenos d\xEDas!", romanized: "bwenos dias", english: "Good morning!" },
            { native: "\xBFC\xF3mo est\xE1s?", romanized: "komo estas", english: "How are you? (informal)" },
            { native: "Mucho gusto", romanized: "mut\u0283o gusto", english: "Nice to meet you" },
            { native: "Hasta luego", romanized: "asta lwe\u0261o", english: "See you later" },
            { native: "\xBFQu\xE9 tal?", romanized: "ke tal", english: "What's up? / How's it going?" }
          ],
          tips: ["Use \xA1 and \xBF at the start of exclamations and questions", '"T\xFA" is informal, "Usted" is formal second person', "Greet everyone when entering a room in Spanish culture"],
          practice: "Write a short dialogue between two people meeting for the first time."
        }
      },
      {
        id: "es-03",
        title: "Ser vs Estar",
        description: 'Master the two Spanish verbs "to be"',
        type: "grammar",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: 'Spanish has two verbs meaning "to be": SER for permanent qualities, ESTAR for temporary states and locations.',
          keyPhrases: [
            { native: "Soy estudiante", romanized: "soy estud-yante", english: "I am a student (SER \u2014 identity)" },
            { native: "Estoy cansado", romanized: "estoy kan-sado", english: "I am tired (ESTAR \u2014 state)" },
            { native: "La casa es grande", romanized: "la kasa es \u0261rande", english: "The house is large (SER \u2014 characteristic)" },
            { native: "El caf\xE9 est\xE1 caliente", romanized: "el kafe esta kalyente", english: "The coffee is hot (ESTAR \u2014 condition)" },
            { native: "Estamos en Madrid", romanized: "estamos en mad\u027Eid", english: "We are in Madrid (ESTAR \u2014 location)" }
          ],
          tips: ["SER: nationality, occupation, personality, relationships, origin", "ESTAR: feelings, health, location, progressive actions", "Some adjectives change meaning depending on ser/estar"],
          practice: "Write 10 sentences about yourself using both ser and estar."
        }
      },
      {
        id: "es-04",
        title: "Numbers & Money",
        description: "Count and handle money in Spanish",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "11 min",
        content: {
          intro: "Spanish numbers are essential for shopping, telling time, and everyday conversations.",
          keyPhrases: [
            { native: "uno, dos, tres", romanized: "uno dos tres", english: "One, two, three" },
            { native: "veinte", romanized: "beynte", english: "Twenty" },
            { native: "\xBFCu\xE1nto cuesta?", romanized: "kwanto kwesta", english: "How much does it cost?" },
            { native: "Es muy caro", romanized: "es muy karo", english: "It is very expensive" },
            { native: "Quiero pagar", romanized: "kyero pa\u0261ar", english: "I want to pay" }
          ],
          tips: ['Note: "uno" becomes "un" before masculine nouns', '"Un mill\xF3n" (million) but "dos millones" (plural)', 'Prices are read as "X euros con Y c\xE9ntimos"'],
          practice: "Practice saying prices of 5 common items in your local currency in Spanish."
        }
      },
      {
        id: "es-05",
        title: "Present Tense Conjugation",
        description: "Conjugate Spanish regular and irregular verbs",
        type: "grammar",
        difficulty: "intermediate",
        duration: "20 min",
        content: {
          intro: "Spanish verbs end in -ar, -er, or -ir. Regular verbs follow predictable patterns; irregular verbs require memorization.",
          keyPhrases: [
            { native: "hablar \u2192 hablo", romanized: "abl\u0251r / ablo", english: "To speak \u2192 I speak (-ar verb)" },
            { native: "comer \u2192 como", romanized: "komer / komo", english: "To eat \u2192 I eat (-er verb)" },
            { native: "vivir \u2192 vivo", romanized: "bi\u03B2i\u027E / bi\u03B2o", english: "To live \u2192 I live (-ir verb)" },
            { native: "ir \u2192 voy", romanized: "i\u027E / boy", english: "To go \u2192 I go (irregular)" },
            { native: "tener \u2192 tengo", romanized: "tene\u027E / te\u014B\u0261o", english: "To have \u2192 I have (irregular yo form)" }
          ],
          tips: ['Yo-go verbs (tener, venir, hacer) are irregular only in "yo" form', "Stem-changing verbs change e\u2192ie, o\u2192ue, e\u2192i", "Practice conjugation tables daily \u2014 repetition is key"],
          practice: "Conjugate hablar, comer, and tener in all 6 persons."
        }
      },
      {
        id: "es-06",
        title: "Spanish-Speaking World",
        description: "Explore the diversity of Spanish-speaking countries",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Spanish is the 2nd most spoken language by native speakers worldwide, with 20+ countries speaking it as their official language.",
          keyPhrases: [
            { native: "M\xE9xico", romanized: "meksi\u039Ao", english: "Most populous Spanish-speaking country" },
            { native: "La paella", romanized: "la paeja", english: "Spain's famous rice dish" },
            { native: "El tango", romanized: "el ta\u014B\u0261o", english: "Dance from Argentina" },
            { native: "El f\xFAtbol", romanized: "el futbol", english: "Football (soccer) \u2014 a passion across Latin America" },
            { native: "La siesta", romanized: "la syesta", english: "Afternoon rest \u2014 traditional in Spain" }
          ],
          tips: ["Spanish varies by region \u2014 vocabulary and accents differ", "Latin American Spanish is generally easier for beginners", 'Spain uses "vosotros" \u2014 Latin America uses "ustedes" instead'],
          practice: "Research one Spanish-speaking country and prepare a 2-minute presentation."
        }
      },
      {
        id: "es-07",
        title: "Preterite Tense",
        description: "Talk about completed past actions in Spanish",
        type: "grammar",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: "The preterite (pret\xE9rito indefinido) is used for completed actions in the past. It is different from the imperfect tense.",
          keyPhrases: [
            { native: "Com\xED pizza ayer", romanized: "komi pitsa ayer", english: "I ate pizza yesterday" },
            { native: "Fui al mercado", romanized: "fwi al merkado", english: "I went to the market" },
            { native: "Ella lleg\xF3 tarde", romanized: "ea \u028Ee\u0261o tarde", english: "She arrived late" },
            { native: "Nosotros hablamos", romanized: "nosotros ablamos", english: "We spoke" },
            { native: "\xBFQu\xE9 hiciste?", romanized: "ke i\u03B8iste", english: "What did you do?" }
          ],
          tips: ["Use preterite for specific completed events", "Irregular preterites: ser/ir (fui), tener (tuve), hacer (hice)", "Time markers: ayer, anoche, la semana pasada"],
          practice: "Write a paragraph about what you did last weekend using the preterite."
        }
      },
      {
        id: "es-08",
        title: "At the Doctor",
        description: "Describe symptoms and understand medical advice",
        type: "conversation",
        difficulty: "advanced",
        duration: "15 min",
        content: {
          intro: "Medical Spanish is important for emergencies and healthcare situations in Spanish-speaking countries.",
          keyPhrases: [
            { native: "Me duele la cabeza", romanized: "me dwele la ka\u03B2e\u03B8a", english: "My head hurts" },
            { native: "Tengo fiebre", romanized: "te\u014B\u0261o fye\u03B2\u027Ee", english: "I have a fever" },
            { native: "Soy al\xE9rgico/a a...", romanized: "soy alerxiko/a a", english: "I am allergic to..." },
            { native: "Necesito una receta", romanized: "ne\u03B8esito una re\u03B8eta", english: "I need a prescription" },
            { native: "\xBFD\xF3nde est\xE1 la farmacia?", romanized: "donde esta la farma\u03B8ya", english: "Where is the pharmacy?" }
          ],
          tips: ["Carry a medical phrasebook when traveling", "IMSS is Mexico's public health system", "Spain has universal healthcare for residents"],
          practice: "Write a doctor-patient dialogue describing symptoms and receiving advice."
        }
      },
      {
        id: "es-09",
        title: "Spanish Subjunctive",
        description: "Express desires, doubts, and hypotheticals",
        type: "grammar",
        difficulty: "advanced",
        duration: "20 min",
        content: {
          intro: "The Spanish subjunctive expresses uncertainty, wishes, emotions, and hypotheticals. It is used very frequently in spoken Spanish.",
          keyPhrases: [
            { native: "Quiero que vengas", romanized: "kyero ke ben\u0261as", english: "I want you to come" },
            { native: "Espero que llueva", romanized: "espero ke \u028Ewe\u03B2a", english: "I hope it rains" },
            { native: "Dudo que sea verdad", romanized: "du\u03B4o ke sea ber\u03B4ad", english: "I doubt that it is true" },
            { native: "Es importante que estudies", romanized: "es importante ke estu\xF0yes", english: "It is important that you study" },
            { native: "Cuando llegues, ll\xE1mame", romanized: "kwando \u028Ee\u0261es \u028Eamame", english: "When you arrive, call me" }
          ],
          tips: ["Trigger phrases: querer que, esperar que, es necesario que, dudar que", "When subject is the same in both clauses, use infinitive instead", "Subjunctive endings: -AR \u2192 -e, -ER/-IR \u2192 -a"],
          practice: "Write 5 subjunctive sentences about things you hope or wish for."
        }
      },
      {
        id: "es-10",
        title: "Spanish Idioms & Slang",
        description: "Sound like a native with common expressions",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "13 min",
        content: {
          intro: "Spanish idioms add color and authenticity to your speech. They vary significantly by region.",
          keyPhrases: [
            { native: "No hay mal que por bien no venga", romanized: "\u2014", english: "Every cloud has a silver lining" },
            { native: "Me cost\xF3 un ojo de la cara", romanized: "\u2014", english: "It cost me an arm and a leg" },
            { native: "Estar en las nubes", romanized: "\u2014", english: "To have your head in the clouds" },
            { native: "A quien madruga, Dios le ayuda", romanized: "\u2014", english: "The early bird catches the worm" },
            { native: "\xA1Qu\xE9 guay!", romanized: "Spain slang", english: "How cool! (Spain)" }
          ],
          tips: ["Idioms cannot be translated literally \u2014 learn them as fixed phrases", "Regional slang varies wildly \u2014 specify which Spanish you want to learn", "Use idioms sparingly until you are confident with usage"],
          practice: "Learn 3 Spanish idioms and use each in a creative sentence."
        }
      },
      {
        id: "es-11",
        title: "El Clima (Weather)",
        description: "Talk about weather and seasons in Spanish",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Describing weather conditions is highly practical for planning outdoor trips and simple daily conversations.",
          keyPhrases: [
            { native: "Hace calor", romanized: "ase kalor", english: "It is hot" },
            { native: "Hace fr\xEDo", romanized: "ase frio", english: "It is cold" },
            { native: "Llueve", romanized: "\u028Ewe\u03B2e", english: "It is raining" },
            { native: "El sol", romanized: "el sol", english: "The sun" },
            { native: "Hace buen tiempo", romanized: "ase \u03B2wen tjempo", english: "The weather is good" }
          ],
          tips: ['Spanish uses the verb "hacer" (to do/make) for most weather statements, e.g. "Hace viento"', 'To say it is snowing, use "Nieva"', 'Use "mucho" instead of "muy" to qualify weather, e.g. "Hace mucho calor"'],
          practice: "Describe the weather forecast for tomorrow in Spanish."
        }
      },
      {
        id: "es-12",
        title: "Tapas Culture in Spain",
        description: "Order small sharing plates in Spanish restaurants",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Tapas are small plates of food shared among friends, representing a highly social dining culture in Spain.",
          keyPhrases: [
            { native: "Una tapa", romanized: "una tapa", english: "A small snack / appetizer" },
            { native: "Compartir", romanized: "kompa\u027Eti\u027E", english: "To share" },
            { native: "Una raci\xF3n", romanized: "una \u027Easjon", english: "A larger portion size" },
            { native: "Jam\xF3n ib\xE9rico", romanized: "xamon i\u03B2e\u027Eiko", english: "Iberian cured ham" },
            { native: "Patatas bravas", romanized: "patatas \u03B2\u027Ea\u03B2as", english: "Spicy potatoes" }
          ],
          tips: ["Tapas are often served free with a drink in cities like Granada and Salamanca", '"Ir de tapas" means hopping from bar to bar to sample different dishes', 'Order "una raci\xF3n" if dining with a larger group'],
          practice: "Create a list of 3 tapas dishes you would order in a Spanish bar."
        }
      },
      {
        id: "es-13",
        title: "Directions: Taking a Bus",
        description: "Navigate bus routes and ticket payments",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Interact with bus drivers and find bus stops in cities.",
          keyPhrases: [
            { native: "\xBFD\xF3nde est\xE1 la parada de autob\xFAs?", romanized: "\u2014", english: "Where is the bus stop?" },
            { native: "\xBFEste autob\xFAs va a...?", romanized: "\u2014", english: "Does this bus go to...?" },
            { native: "Un billete, por favor", romanized: "\u2014", english: "One ticket, please" },
            { native: "\xBFTengo que transbordar?", romanized: "\u2014", english: "Do I have to transfer?" },
            { native: "Bajar en la pr\xF3xima", romanized: "\u2014", english: "Get off at the next one" },
            { native: "El conductor", romanized: "\u2014", english: "The driver" },
            { native: "\xBFCu\xE1nto cuesta el pasaje?", romanized: "\u2014", english: "How much is the fare?" },
            { native: "\xBFCu\xE1l es la l\xEDnea...?", romanized: "\u2014", english: "Which line is...?" },
            { native: "\xBFD\xF3nde me bajo?", romanized: "\u2014", english: "Where do I get off?" },
            { native: "\xA1Gracias por su ayuda!", romanized: "\u2014", english: "Thanks for your help!" }
          ],
          tips: ["Tickets are usually bought from the driver or validated inside using a card"],
          practice: 'Ask if the bus goes to the center: "\xBFEste autob\xFAs va al centro?".'
        }
      },
      {
        id: "es-14",
        title: "Spanish Festivals & Traditions",
        description: "Explore celebrations in Spanish countries",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Study historical celebrations like La Tomatina, San Ferm\xEDn, and Semana Santa.",
          keyPhrases: [
            { native: "La Tomatina", romanized: "\u2014", english: "Tomato throwing festival in Bu\xF1ol" },
            { native: "San Ferm\xEDn", romanized: "\u2014", english: "Running of the bulls in Pamplona" },
            { native: "Semana Santa", romanized: "\u2014", english: "Holy Week" },
            { native: "Fiesta", romanized: "\u2014", english: "Celebration / Party" },
            { native: "Los Reyes Magos", romanized: "\u2014", english: "The Three Wise Men (Jan 6th gift day)" },
            { native: "Las Fallas", romanized: "\u2014", english: "Valencian puppet burning festival" },
            { native: "El carnaval", romanized: "\u2014", english: "Carnival" },
            { native: "Fuegos artificiales", romanized: "\u2014", english: "Fireworks" },
            { native: "Tradici\xF3n", romanized: "\u2014", english: "Tradition" },
            { native: "Feliz Navidad", romanized: "\u2014", english: "Merry Christmas" }
          ],
          tips: ["Children in Spanish countries traditionally get gifts on Three Kings Day (Jan 6) instead of Christmas"],
          practice: "List 3 details about your favorite Spanish cultural tradition."
        }
      },
      {
        id: "es-15",
        title: "Future Tense: Ir + a + Infinitive",
        description: "Talk about future plans simply",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: 'Form future plans easily using "ir" (conjugation) + a + infinitive verb.',
          keyPhrases: [
            { native: "Voy a comer", romanized: "\u2014", english: "I am going to eat" },
            { native: "Vas a viajar", romanized: "\u2014", english: "You are going to travel" },
            { native: "Va a estudiar", romanized: "\u2014", english: "He is going to study" },
            { native: "Vamos a salir", romanized: "\u2014", english: "We are going to go out" },
            { native: "Vais a comprar", romanized: "\u2014", english: "You all are going to buy" },
            { native: "Van a jugar", romanized: "\u2014", english: "They are going to play" },
            { native: "Ma\xF1ana", romanized: "man-yana", english: "Tomorrow" },
            { native: "Esta noche", romanized: "\u2014", english: "Tonight" },
            { native: "El a\xF1o que viene", romanized: "\u2014", english: "Next year" },
            { native: "Voy a hablar espa\xF1ol", romanized: "\u2014", english: "I am going to speak Spanish" }
          ],
          tips: ['"Ir + a + Infinitive" is highly conversational; conjugate "ir" for person and leave the second verb unchanged'],
          practice: 'Translate "We are going to eat tapas tomorrow" into Spanish.'
        }
      },
      {
        id: "es-16",
        title: "Spanish Idioms & Expressions",
        description: "Learn colorful idioms and common colloquial phrases in Spanish",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Spaniards and Latin Americans use unique idioms daily. Learn these essential expressions.",
          keyPhrases: [
            { native: "Pan comido", romanized: "\u2014", english: "Piece of cake (lit. eaten bread)" },
            { native: "Tomar el pelo", romanized: "\u2014", english: "To pull someone's leg / kid (lit. to take the hair)" },
            { native: "Estar en las nubes", romanized: "\u2014", english: "To be daydreaming (lit. to be in the clouds)" },
            { native: "Echar agua al mar", romanized: "\u2014", english: "To do something pointless (lit. to throw water into the sea)" },
            { native: "Ponerse las pilas", romanized: "\u2014", english: "To get organized / work hard (lit. to put in the batteries)" }
          ],
          tips: ['"Pan comido" describes tasks, not food', 'Use "tomar el pelo" when a friend tells a joke that sounds serious'],
          practice: 'Write a sentence telling a classmate to study using "ponerte las pilas".'
        }
      },
      {
        id: "es-17",
        title: "Spanish Refranes (Proverbs)",
        description: "Explore traditional Spanish proverbs and sayings",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Proverbs (Refranes) are highly valued in Spanish culture for conveying life lessons.",
          keyPhrases: [
            { native: "M\xE1s vale tarde que nunca", romanized: "\u2014", english: "Better late than never" },
            { native: "A mal tiempo, buena cara", romanized: "\u2014", english: "In bad times, stay positive (lit. to bad weather, a good face)" },
            { native: "No por mucho madrugar amanece m\xE1s temprano", romanized: "\u2014", english: "Things take their own time (lit. rising early won't make dawn come faster)" },
            { native: "Dime con qui\xE9n andas, y te dir\xE9 qui\xE9n eres", romanized: "\u2014", english: "You are judged by the company you keep" },
            { native: "Perro que ladra no muerde", romanized: "\u2014", english: "His bark is worse than his bite (lit. dog that barks doesn't bite)" }
          ],
          tips: ["Proverbs often feature animals, weather, and agricultural schedules", '"A mal tiempo, buena cara" is used to motivate others during setbacks'],
          practice: 'Explain the moral meaning of "M\xE1s vale tarde que nunca" in Spanish.'
        }
      }
    ]
  },
  {
    id: "chinese",
    language: "Chinese",
    flag: "\u{1F1E8}\u{1F1F3}",
    color: "#dc2626",
    gradient: "from-red-600 to-yellow-500",
    lessons: [
      {
        id: "zh-01",
        title: "Mandarin Tones",
        description: "Master the 4 tones plus neutral tone",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "18 min",
        content: {
          intro: "Mandarin Chinese has 4 tones plus a neutral tone. The same syllable with different tones has completely different meanings.",
          keyPhrases: [
            { native: "m\u0101 (\u5988)", romanized: "1st tone (high level)", english: "Mother" },
            { native: "m\xE1 (\u9EBB)", romanized: "2nd tone (rising)", english: "Hemp / Numb" },
            { native: "m\u01CE (\u9A6C)", romanized: "3rd tone (dipping)", english: "Horse" },
            { native: "m\xE0 (\u9A82)", romanized: "4th tone (falling)", english: "To scold" },
            { native: "ma (\u5417)", romanized: "neutral tone", english: "Question particle" }
          ],
          tips: ["Use your hand to gesture tone shapes while practicing", "Record yourself and compare to native speakers", "Tone errors cause misunderstandings \u2014 prioritize from the start"],
          practice: "Practice all 4 tones on the syllables: ba, bi, bo, bu."
        }
      },
      {
        id: "zh-02",
        title: "Pinyin System",
        description: "Use Romanized pinyin to read Chinese",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "15 min",
        content: {
          intro: "Pinyin is the Romanized system for Mandarin Chinese. It uses letters with tone marks to represent pronunciation.",
          keyPhrases: [
            { native: "zh", romanized: 'like "j" in "judge"', english: 'Chinese consonant "zh"' },
            { native: "x", romanized: 'like "sh" but softer', english: 'Chinese consonant "x"' },
            { native: "q", romanized: 'like "ch" but forward', english: 'Chinese consonant "q"' },
            { native: "\xFC", romanized: 'pursed lips "ee"', english: "Front rounded vowel" },
            { native: "r", romanized: "retroflex r", english: "Retroflex consonant in Chinese" }
          ],
          tips: ["Pinyin is not perfect English \u2014 the sounds differ significantly", "Learn initials (consonants) and finals (vowels) separately", "Pinyin is used on Chinese keyboards for typing"],
          practice: "Write out the pinyin for 10 Chinese characters you know."
        }
      },
      {
        id: "zh-03",
        title: "Greetings in Mandarin",
        description: "Say hello and basic expressions in Chinese",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: 'Chinese greetings are direct and practical. Asking "have you eaten?" (\u5403\u996D\u4E86\u5417) is a common greeting showing care.',
          keyPhrases: [
            { native: "\u4F60\u597D", romanized: "N\u01D0 h\u01CEo", english: "Hello" },
            { native: "\u8C22\u8C22", romanized: "Xi\xE8xi\xE8", english: "Thank you" },
            { native: "\u5BF9\u4E0D\u8D77", romanized: "Du\xECbuq\u01D0", english: "Sorry / Excuse me" },
            { native: "\u518D\u89C1", romanized: "Z\xE0iji\xE0n", english: "Goodbye" },
            { native: "\u5403\u996D\u4E86\u5417?", romanized: "Ch\u012B f\xE0n le ma?", english: "Have you eaten? (friendly greeting)" }
          ],
          tips: ["Handshakes are common in modern China; bowing is less common than in Japan/Korea", '"N\u01D0 h\u01CEo" uses the 3rd tone twice \u2014 the first becomes 2nd tone by tone sandhi rule', 'Say "N\u01D0 h\u01CEo ma?" to ask how someone is doing'],
          practice: "Practice greeting 5 people using different Chinese expressions."
        }
      },
      {
        id: "zh-04",
        title: "Chinese Characters: Radicals",
        description: "Understand the building blocks of Chinese writing",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "20 min",
        content: {
          intro: "Chinese characters are built from radicals \u2014 component elements that hint at meaning. There are 214 Kangxi radicals.",
          keyPhrases: [
            { native: "\u4EBA (r\xE9n)", romanized: "ren", english: "Person radical" },
            { native: "\u6C34 (shu\u01D0)", romanized: "shui", english: "Water radical" },
            { native: "\u6728 (m\xF9)", romanized: "mu", english: "Tree/Wood radical" },
            { native: "\u53E3 (k\u01D2u)", romanized: "kou", english: "Mouth radical" },
            { native: "\u5FC3 (x\u012Bn)", romanized: "xin", english: "Heart radical" }
          ],
          tips: ["Knowing radicals helps you guess character meaning", "Start with the 30 most common radicals", "Use radical-based flashcard sets (Remembering Hanzi by Heisig)"],
          practice: "Find 3 characters containing the water radical (\u6C35) and write their meanings."
        }
      },
      {
        id: "zh-05",
        title: "Numbers & Dates",
        description: "Count and express dates in Mandarin",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Chinese numbers are logical and easy to learn. Once you know 1-10, you can form most other numbers.",
          keyPhrases: [
            { native: "\u4E00\u4E8C\u4E09\u56DB\u4E94", romanized: "y\u012B \xE8r s\u0101n s\xEC w\u01D4", english: "One two three four five" },
            { native: "\u516D\u4E03\u516B\u4E5D\u5341", romanized: "li\xF9 q\u012B b\u0101 ji\u01D4 sh\xED", english: "Six seven eight nine ten" },
            { native: "\u4ECA\u5929\u51E0\u6708\u51E0\u53F7?", romanized: "J\u012Bnti\u0101n j\u01D0 yu\xE8 j\u01D0 h\xE0o?", english: "What is today's date?" },
            { native: "\u661F\u671F\u4E00", romanized: "X\u012Bngq\u012By\u012B", english: "Monday (Star period one)" },
            { native: "\u5E74/\u6708/\u65E5", romanized: "ni\xE1n / yu\xE8 / r\xEC", english: "Year / Month / Day" }
          ],
          tips: ["Chinese dates go: Year \u2192 Month \u2192 Day (opposite of Western format)", "Days of the week use numbers: \u661F\u671F\u4E00 (Mon) through \u661F\u671F\u65E5 (Sun)", 'Special number: \u4E24 (li\u01CEng) is used for "two" when counting objects'],
          practice: "Write today's date in Chinese and say it aloud."
        }
      },
      {
        id: "zh-06",
        title: "Basic Sentence Patterns",
        description: "Build simple Mandarin sentences",
        type: "grammar",
        difficulty: "beginner",
        duration: "14 min",
        content: {
          intro: "Mandarin grammar is simpler than many languages \u2014 no verb conjugation, no tenses with endings, no plurals.",
          keyPhrases: [
            { native: "\u6211\u662F\u5B66\u751F", romanized: "W\u01D2 sh\xEC xu\xE9sh\u0113ng", english: "I am a student" },
            { native: "\u4ED6\u6709\u4E00\u672C\u4E66", romanized: "T\u0101 y\u01D2u y\u012B b\u011Bn sh\u016B", english: "He has one book" },
            { native: "\u6211\u559C\u6B22\u4E2D\u6587", romanized: "W\u01D2 x\u01D0hu\u0101n zh\u014Dngw\xE9n", english: "I like Chinese" },
            { native: "\u4ECA\u5929\u5929\u6C14\u5F88\u597D", romanized: "J\u012Bnti\u0101n ti\u0101nq\xEC h\u011Bn h\u01CEo", english: "Today's weather is very good" },
            { native: "\u4F60\u53BB\u54EA\u91CC?", romanized: "N\u01D0 q\xF9 n\u01CEl\u01D0?", english: "Where are you going?" }
          ],
          tips: ["Time expressions come before the verb in Chinese", "Questions use question words or the particle \u5417", "Negation uses \u4E0D (b\xF9) before verbs or \u6CA1 (m\xE9i) for past negation"],
          practice: "Write 5 sentences about your daily routine in Mandarin."
        }
      },
      {
        id: "zh-07",
        title: "Chinese Food Culture",
        description: "Explore Chinese cuisine and dining customs",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Chinese cuisine is one of the world's most diverse and sophisticated, with 8 major regional cuisines.",
          keyPhrases: [
            { native: "\u5317\u4EAC\u70E4\u9E2D", romanized: "B\u011Bij\u012Bng k\u01CEoy\u0101", english: "Peking Duck" },
            { native: "\u997A\u5B50", romanized: "Ji\u01CEozi", english: "Dumplings" },
            { native: "\u706B\u9505", romanized: "Hu\u01D2gu\u014D", english: "Hot Pot" },
            { native: "\u8BF7\u5BA2", romanized: "Q\u01D0ngk\xE8", english: "Treating others to a meal (common hospitality)" },
            { native: "\u5E72\u676F!", romanized: "G\u0101nb\u0113i!", english: "Cheers! (dry cup \u2014 drink all)" }
          ],
          tips: ["The host pays the bill in China \u2014 splitting is uncommon in traditional culture", "Never flip fish over at the table (bad omen for fishermen)", "Slurping soup is acceptable and shows appreciation"],
          practice: "Research Sichuan cuisine and describe 3 dishes in English."
        }
      },
      {
        id: "zh-08",
        title: "Measure Words",
        description: "Use classifiers/measure words correctly in Chinese",
        type: "grammar",
        difficulty: "intermediate",
        duration: "18 min",
        content: {
          intro: "Every Chinese noun requires a specific measure word (\u91CF\u8BCD) when used with numbers. There are hundreds, but a few key ones cover most situations.",
          keyPhrases: [
            { native: "\u4E00\u4E2A\u4EBA", romanized: "y\u012B g\xE8 r\xE9n", english: "One person (\u4E2A g\xE8 = general)" },
            { native: "\u4E00\u672C\u4E66", romanized: "y\u012B b\u011Bn sh\u016B", english: "One book (\u672C = bound objects)" },
            { native: "\u4E00\u5F20\u7EB8", romanized: "y\u012B zh\u0101ng zh\u01D0", english: "One sheet of paper (\u5F20 = flat objects)" },
            { native: "\u4E00\u6761\u9C7C", romanized: "y\u012B ti\xE1o y\xFA", english: "One fish (\u6761 = long/flexible things)" },
            { native: "\u4E00\u53EA\u732B", romanized: "y\u012B zh\u012B m\u0101o", english: "One cat (\u53EA = small animals)" }
          ],
          tips: ["\u4E2A (g\xE8) works as a general measure word when unsure", "Measure word errors rarely cause confusion \u2014 context helps", "Learn measure words with the noun: \u4E00\u672C\u4E66, not just \u4E66"],
          practice: "Match 10 nouns with their correct measure words."
        }
      },
      {
        id: "zh-09",
        title: "Chinese New Year Traditions",
        description: "Celebrate Chinese festivals and customs",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Chinese New Year (\u6625\u8282 Ch\u016Bnji\xE9) is the most important celebration in Chinese culture, lasting 15 days.",
          keyPhrases: [
            { native: "\u65B0\u5E74\u5FEB\u4E50", romanized: "X\u012Bnni\xE1n ku\xE0il\xE8", english: "Happy New Year" },
            { native: "\u606D\u559C\u53D1\u8D22", romanized: "G\u014Dngx\u01D0 f\u0101c\xE1i", english: "Wishing you prosperity (CNY greeting)" },
            { native: "\u7EA2\u5305", romanized: "H\xF3ngb\u0101o", english: "Red envelope (money gift)" },
            { native: "\u6625\u8054", romanized: "Ch\u016Bnli\xE1n", english: "Spring couplets (door decorations)" },
            { native: "\u97AD\u70AE", romanized: "Bi\u0101np\xE0o", english: "Firecrackers" }
          ],
          tips: ["Give red envelopes with even amounts (odd amounts are for funerals)", "Avoid sweeping on New Year's Day \u2014 you sweep away luck", "Wear red to attract good luck during the New Year"],
          practice: "Write a New Year greeting card message in Chinese."
        }
      },
      {
        id: "zh-10",
        title: "Shopping & Bargaining",
        description: "Navigate Chinese markets and negotiate prices",
        type: "conversation",
        difficulty: "intermediate",
        duration: "14 min",
        content: {
          intro: "Chinese markets like Yiwu and silk markets in Beijing are famous for bargaining. Knowing the phrases gives you an advantage.",
          keyPhrases: [
            { native: "\u591A\u5C11\u94B1?", romanized: "Du\u014Dsh\u01CEo qi\xE1n?", english: "How much money?" },
            { native: "\u592A\u8D35\u4E86", romanized: "T\xE0i gu\xEC le", english: "Too expensive" },
            { native: "\u4FBF\u5B9C\u4E00\u70B9", romanized: "Pi\xE1ny\xED y\u012Bdi\u01CEn", english: "A little cheaper" },
            { native: "\u6211\u8981\u8FD9\u4E2A", romanized: "W\u01D2 y\xE0o zh\xE8ge", english: "I want this one" },
            { native: "\u5237\u5361\u53EF\u4EE5\u5417?", romanized: "Shu\u0101 k\u01CE k\u011By\u01D0 ma?", english: "Can I pay by card?" }
          ],
          tips: ["Start at 30-40% of the asking price in tourist markets", "Walking away often prompts the seller to drop the price", "Fixed price shops (\u660E\u7801\u5B9E\u4EF7) do not negotiate"],
          practice: "Practice a bargaining dialogue aiming to halve the original price."
        }
      },
      {
        id: "zh-11",
        title: "Weather & Seasons",
        description: "Describe weather and seasons in Chinese",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Describing weather conditions is highly helpful for daily conversations and planning travel in China.",
          keyPhrases: [
            { native: "\u4E0B\u96E8", romanized: "Xi\xE0 y\u01D4", english: "To rain" },
            { native: "\u6674\u5929", romanized: "Q\xEDngti\u0101n", english: "Sunny day" },
            { native: "\u70ED", romanized: "R\xE8", english: "Hot" },
            { native: "\u51B7", romanized: "L\u011Bng", english: "Cold" },
            { native: "\u56DB\u5B63", romanized: "S\xECj\xEC", english: "Four seasons" }
          ],
          tips: ["The particle \u4E86 (le) is often used to show a change in weather, e.g. \u4E0B\u96E8\u4E86 (It started to rain)", "To describe snow, say \u4E0B\u96EA (Xi\xE0 xu\u011B)", "Windy is \u522E\u98CE (Gu\u0101 f\u0113ng)"],
          practice: "State today's weather in your city in Chinese."
        }
      },
      {
        id: "zh-12",
        title: "Chinese Tea Culture",
        description: "Understand tea categories and teahouse etiquette",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Tea has a rich history in China and is central to welcoming guests and social meetings.",
          keyPhrases: [
            { native: "\u8336", romanized: "Ch\xE1", english: "Tea" },
            { native: "\u7EFF\u8336", romanized: "L\u01DCch\xE1", english: "Green tea" },
            { native: "\u6CE1\u8336", romanized: "P\xE0o ch\xE1", english: "To brew tea" },
            { native: "\u8336\u9986", romanized: "Ch\xE1gu\u01CEn", english: "Teahouse" },
            { native: "\u8C22\u8C22", romanized: "Xi\xE8xi\xE8", english: "Thank you" }
          ],
          tips: ["Tap two fingers on the table to show gratitude when someone pours tea for you (finger kowtow)", "The first brew of tea is often poured away to wash the leaves", "Never point the spout of the teapot towards guests"],
          practice: "List three types of Chinese tea and describe the finger tapping custom."
        }
      },
      {
        id: "zh-13",
        title: "Directions: Subway Navigation",
        description: "Navigate metropolitan subway lines",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Travel on China's subway networks using key location vocabulary.",
          keyPhrases: [
            { native: "\u5730\u94C1\u7AD9\u5728\u54EA\u91CC?", romanized: "D\xECti\u011B zh\xE0n z\xE0i n\u01CEl\u01D0?", english: "Where is the subway station?" },
            { native: "\u6211\u8981\u4E70\u7968", romanized: "W\u01D2 y\xE0o m\u01CEi pi\xE0o", english: "I want to buy a ticket" },
            { native: "\u51E0\u53F7\u7EBF?", romanized: "J\u01D0 h\xE0o xi\xE0n?", english: "Which line number?" },
            { native: "\u6362\u4E58", romanized: "Hu\xE0nch\xE9ng", english: "Transfer lines" },
            { native: "\u51FA\u53E3", romanized: "Ch\u016Bk\u01D2u", english: "Exit" },
            { native: "\u5165\u53E3", romanized: "R\xF9k\u01D2u", english: "Entrance" },
            { native: "\u5355\u7A0B\u7968", romanized: "D\u0101nch\xE9ngpi\xE0o", english: "One-way ticket" },
            { native: "\u4E58\u8F66\u5361", romanized: "Ch\xE9ngch\u0113k\u01CE", english: "Transit card" },
            { native: "\u4E0B\u4E00\u7AD9", romanized: "Xi\xE0 y\xED zh\xE0n", english: "Next stop" },
            { native: "\u5B89\u68C0", romanized: "\u0100nji\u01CEn", english: "Security check" }
          ],
          tips: ["All Chinese subways require passing bags through security scanners (\u5B89\u68C0) before entering"],
          practice: 'Simulate asking for subway Line 1 ("\u4E00\u53F7\u7EBF") and looking for Exit A ("A\u51FA\u53E3").'
        }
      },
      {
        id: "zh-14",
        title: "Chinese Table Manners & Banquets",
        description: "Understand dinner seating and protocol",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Study seating orders, guest positions, and toast procedures at banquets.",
          keyPhrases: [
            { native: "\u4E3B\u4EBA", romanized: "Zh\u01D4r\xE9n", english: "Host" },
            { native: "\u4E3B\u5BBE", romanized: "Zh\u01D4b\u012Bn", english: "Guest of honor" },
            { native: "\u8F6C\u76D8", romanized: "Zhu\xE0np\xE1n", english: "Lazy Susan (spinning center glass)" },
            { native: "\u656C\u9152", romanized: "J\xECngji\u01D4", english: "To toast" },
            { native: "\u957F\u8F88", romanized: "Zh\u01CEngb\xE8i", english: "Elders" },
            { native: "\u5BA2\u6C14", romanized: "K\xE8q\xEC", english: "Polite / courteous" },
            { native: "\u5EA7\u6B21", romanized: "Zu\xF2c\xEC", english: "Seating order" },
            { native: "\u516C\u7B77", romanized: "G\u014Dngku\xE0i", english: "Serving chopsticks" },
            { native: "\u5012\u9152", romanized: "d\xE0o ji\u01D4", english: "Pour wine / alcohol" },
            { native: "\u5E72\u676F", romanized: "G\u0101nb\u0113i", english: "Cheers / empty glass" }
          ],
          tips: ["Keep your glass lower than that of elders/superiors when clinking glasses to toast"],
          practice: "List two rules regarding serving chopsticks and toasting elders."
        }
      },
      {
        id: "zh-15",
        title: "Past Actions with le (\u4E86)",
        description: "Indicate completed actions simply",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: 'Learn how to place the particle "\u4E86" (le) to show that an action is finished.',
          keyPhrases: [
            { native: "\u6211\u5403\u4E86\u996D", romanized: "W\u01D2 ch\u012B le f\xE0n", english: "I ate rice (ate meal)" },
            { native: "\u4ED6\u53BB\u4E86\u5317\u4EAC", romanized: "T\u0101 q\xF9 le B\u011Bij\u012Bng", english: "He went to Beijing" },
            { native: "\u6211\u4EEC\u4E70\u4E86\u7968", romanized: "W\u01D2men m\u01CEi le pi\xE0o", english: "We bought tickets" },
            { native: "\u5979\u5B66\u4E86\u4E2D\u6587", romanized: "T\u0101 xu\xE9 le Zh\u014Dngw\xE9n", english: "She studied Chinese" },
            { native: "\u6211\u770B\u89C1\u4E86\u4ED6", romanized: "W\u01D2 k\xE0nji\xE0n le t\u0101", english: "I saw him" },
            { native: "\u6628\u5929", romanized: "Zu\xF3ti\u0101n", english: "Yesterday" },
            { native: "\u53BB\u5E74", romanized: "Q\xF9ni\xE1n", english: "Last year" },
            { native: "\u5DF2\u7ECF", romanized: "Y\u01D0j\u012Bng", english: "Already" },
            { native: "\u8FD8\u6CA1", romanized: "h\xE1i m\xE9i", english: "Not yet" },
            { native: "\u6211\u770B\u89C1\u4E86", romanized: "W\u01D2 k\xE0nji\xE0n le", english: "I saw it" }
          ],
          tips: ['"\u4E86" goes directly after the verb to emphasize completion, or at the end for a change of status'],
          practice: 'Convert "\u6211\u559D\u8336" (I drink tea) into past completion: "I drank tea".'
        }
      },
      {
        id: "zh-16",
        title: "Chinese Chengyu & Idioms",
        description: "Learn the rich 4-character idioms (Chengyu) and modern expressions",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Chengyu are classical four-character idioms that reflect history and philosophical lessons.",
          keyPhrases: [
            { native: "\u9A6C\u9A6C\u864E\u864E", romanized: "M\u01CEmah\u01D4h\u01D4", english: "So-so / Careless (lit. horse horse tiger tiger)" },
            { native: "\u4E03\u4E0A\u516B\u4E0B", romanized: "Q\u012Bsh\xE0ngb\u0101xi\xE0", english: "Feeling anxious / unsettled (lit. seven up eight down)" },
            { native: "\u753B\u86C7\u6DFB\u8DB3", romanized: "Hu\xE0sh\xE9ti\u0101nz\xFA", english: "Overdoing it (lit. drawing legs on a snake)" },
            { native: "\u4E71\u4E03\u516B\u7CDF", romanized: "Lu\xE0nq\u012Bb\u0101z\u0101o", english: "In a mess / chaotic (lit. messy seven eight chaotic)" },
            { native: "\u5BF9\u725B\u5F39\u7434", romanized: "Du\xECni\xFAt\xE1nq\xEDn", english: "Addressing the wrong audience (lit. playing lute to a cow)" }
          ],
          tips: ['"M\u01CEmah\u01D4h\u01D4" can describe work or feelings, meaning average or careless', "Chengyu are frequently used in Chinese writing to show education"],
          practice: 'Write down a scenario where someone did a task "M\u01CEmah\u01D4h\u01D4".'
        }
      },
      {
        id: "zh-17",
        title: "Chinese Proverbs (Yanyu)",
        description: "Understand traditional Chinese wisdom and common proverbs",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Chinese proverbs (Yanyu) provide timeless guidance on learning, perseverance, and relationships.",
          keyPhrases: [
            { native: "\u5931\u8D25\u662F\u6210\u529F\u4E4B\u6BCD", romanized: "Sh\u012Bb\xE0i sh\xEC ch\xE9ngg\u014Dng zh\u012B m\u01D4", english: "Failure is the mother of success" },
            { native: "\u5343\u91CC\u4E4B\u884C\uFF0C\u59CB\u4E8E\u8DB3\u4E0B", romanized: "Qi\u0101nl\u01D0 zh\u012B x\xEDng, sh\u01D0 y\xFA z\xFA xi\xE0", english: "A journey of a thousand miles begins with a single step" },
            { native: "\u8BFB\u4E66\u7834\u4E07\u5377\uFF0C\u4E0B\u7B14\u5982\u6709\u795E", romanized: "D\xFAsh\u016B p\xF2 w\xE0n ju\xE0n, xi\xE0b\u01D0 r\xFA y\u01D2u sh\xE9n", english: "Reading widely makes writing powerful" },
            { native: "\u51B0\u51BB\u4E09\u5C3A\uFF0C\u975E\u4E00\u65E5\u4E4B\u5BD2", romanized: "B\u012Bngd\xF2ng s\u0101n ch\u01D0, f\u0113i y\u012B r\xEC zh\u012B h\xE1n", english: "Rome wasn't built in a day (lit. three feet of ice doesn't freeze in a day)" },
            { native: "\u5165\u4E61\u968F\u4FD7", romanized: "R\xF9xi\u0101ngsu\xEDs\xFA", english: "When in Rome, do as the Romans do" }
          ],
          tips: ["Many Chinese proverbs encourage continuous self-cultivation and persistence", `"R\xF9xi\u0101ngsu\xEDs\xFA" is essential advice when traveling across China's regions`],
          practice: 'Translate "\u5931\u8D25\u662F\u6210\u529F\u4E4B\u6BCD" and explain its value to a student.'
        }
      }
    ]
  },
  {
    id: "vietnamese",
    language: "Vietnamese",
    flag: "\u{1F1FB}\u{1F1F3}",
    color: "#dc2626",
    gradient: "from-red-600 to-yellow-400",
    lessons: [
      {
        id: "vi-01",
        title: "Vietnamese Tones (6 Tones)",
        description: "Master all 6 Vietnamese tones",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "20 min",
        content: {
          intro: "Vietnamese is a tonal language with 6 tones. Tone marks are written above or below vowels in Vietnamese script.",
          keyPhrases: [
            { native: "ma (kh\xF4ng d\u1EA5u)", romanized: "level tone", english: '"Ghost" \u2014 flat mid tone' },
            { native: "m\xE1 (s\u1EAFc)", romanized: "rising tone", english: '"Cheek/Mother" \u2014 rising' },
            { native: "m\xE0 (huy\u1EC1n)", romanized: "falling tone", english: '"But" \u2014 low falling' },
            { native: "m\u1EA3 (h\u1ECFi)", romanized: "dipping tone", english: '"Grave/tomb" \u2014 dipping-rising' },
            { native: "m\xE3 (ng\xE3)", romanized: "broken rising", english: '"Code/sign" \u2014 creaky rising' }
          ],
          tips: ["Southern Vietnamese (Saigon) has fewer distinct tones than Northern (Hanoi)", "Use your hand to trace the tone shape while practicing", "Tones are indicated by diacritics \u2014 learn the 5 diacritic marks"],
          practice: 'Practice each tone on the syllable "ma" five times.'
        }
      },
      {
        id: "vi-02",
        title: "Vietnamese Alphabet (Ch\u1EEF Qu\u1ED1c Ng\u1EEF)",
        description: "Learn the Latin-based Vietnamese script",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Vietnamese uses a modified Latin alphabet (Ch\u1EEF Qu\u1ED1c Ng\u1EEF) introduced by Portuguese missionaries. It is easier to learn than most Asian scripts.",
          keyPhrases: [
            { native: "\u0103", romanized: "short a", english: 'Short "a" vowel' },
            { native: "\xE2", romanized: "deep a", english: 'Deep throat "a" vowel' },
            { native: "\u01A1", romanized: 'unrounded "er"', english: "Unrounded back vowel" },
            { native: "\u01B0", romanized: "high back", english: "High back unrounded vowel" },
            { native: "\u0111", romanized: "d (implosive)", english: "\u0110 \u2014 unique Vietnamese letter" }
          ],
          tips: ["Vietnamese has 29 letters (12 vowels, 17 consonants)", "Some letters do not appear in standard Vietnamese (f, j, w, z)", "Tone marks are placed on the main vowel of each syllable"],
          practice: "Write your name using Vietnamese letters and diacritics."
        }
      },
      {
        id: "vi-03",
        title: "Xin Ch\xE0o: Greetings",
        description: "Essential Vietnamese greetings and etiquette",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Vietnamese greetings are uniquely tied to social hierarchy \u2014 you use different pronouns based on the age relationship.",
          keyPhrases: [
            { native: "Xin ch\xE0o", romanized: "sin chow", english: "Hello (formal)" },
            { native: "C\u1EA3m \u01A1n", romanized: "kahm uhn", english: "Thank you" },
            { native: "Xin l\u1ED7i", romanized: "sin loy", english: "Sorry / Excuse me" },
            { native: "T\u1EA1m bi\u1EC7t", romanized: "tahm byet", english: "Goodbye" },
            { native: "B\u1EA1n c\xF3 kh\u1ECFe kh\xF4ng?", romanized: "ban co kwe khong", english: "How are you? (to a friend)" }
          ],
          tips: ["Em (younger), Anh (older brother), Ch\u1ECB (older sister), \xD4ng/B\xE0 (grandparent) change pronouns", "A slight bow shows respect to elders", "Vietnamese people show affection through caring questions about meals"],
          practice: "Greet someone older and younger than you using the correct pronouns."
        }
      },
      {
        id: "vi-04",
        title: "Vietnamese Food Culture",
        description: "Explore the rich world of Vietnamese cuisine",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Vietnamese food is celebrated globally for its fresh ingredients, balance of flavors, and regional diversity.",
          keyPhrases: [
            { native: "Ph\u1EDF", romanized: "Fuh", english: "Beef/chicken noodle soup (national dish)" },
            { native: "B\xE1nh m\xEC", romanized: "Bahn mee", english: "Vietnamese baguette sandwich" },
            { native: "G\u1ECFi cu\u1ED1n", romanized: "goy kwon", english: "Fresh spring rolls" },
            { native: "B\xFAn b\xF2 Hu\u1EBF", romanized: "bun baw hway", english: "Spicy Hue beef noodle soup" },
            { native: "C\xE0 ph\xEA tr\u1EE9ng", romanized: "ka feh chung", english: "Egg coffee (Hanoi specialty)" }
          ],
          tips: ["Vietnamese food varies by region \u2014 Hanoi, Hue, and Saigon have distinct styles", "Fresh herbs are served with almost every dish", "Street food is safe and delicious \u2014 look for busy stalls"],
          practice: "Research the difference between Northern and Southern Vietnamese Ph\u1EDF."
        }
      },
      {
        id: "vi-05",
        title: "Numbers & Counting",
        description: "Count in Vietnamese for everyday use",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "11 min",
        content: {
          intro: "Vietnamese numbers are fairly straightforward. Once you learn 1-10, you can form larger numbers easily.",
          keyPhrases: [
            { native: "m\u1ED9t, hai, ba", romanized: "moht, hi, ba", english: "One, two, three" },
            { native: "b\u1ED1n, n\u0103m, s\xE1u", romanized: "bohn, nam, sau", english: "Four, five, six" },
            { native: "b\u1EA3y, t\xE1m, ch\xEDn, m\u01B0\u1EDDi", romanized: "bay, tam, chin, muoi", english: "Seven, eight, nine, ten" },
            { native: "m\u1ED9t tr\u0103m", romanized: "moht tram", english: "One hundred" },
            { native: "Bao nhi\xEAu ti\u1EC1n?", romanized: "bow nyew tyen", english: "How much money?" }
          ],
          tips: ['Note: "l\u0103m" replaces "n\u0103m" when in the units position', '"Ngh\xECn" or "ng\xE0n" both mean "thousand" (regional variation)', "Vietnamese currency is \u0110\u1ED3ng (VND) \u2014 prices can be in millions"],
          practice: "Practice saying prices of items in Vietnamese Dong."
        }
      },
      {
        id: "vi-06",
        title: "Basic Sentence Structure",
        description: "Build simple Vietnamese sentences",
        type: "grammar",
        difficulty: "beginner",
        duration: "14 min",
        content: {
          intro: "Vietnamese follows Subject-Verb-Object order like English. There are no verb conjugations or grammatical gender.",
          keyPhrases: [
            { native: "T\xF4i \u0103n c\u01A1m", romanized: "toy an kum", english: "I eat rice" },
            { native: "Anh \u1EA5y h\u1ECDc ti\u1EBFng Anh", romanized: "anh ay hok tyeng anh", english: "He studies English" },
            { native: "Ch\xFAng t\xF4i th\xEDch Vi\u1EC7t Nam", romanized: "chung toy thik vyet nam", english: "We like Vietnam" },
            { native: "C\xF4 \u1EA5y \u0111\u1EB9p l\u1EAFm", romanized: "koh ay dep lam", english: "She is very beautiful" },
            { native: "T\xF4i kh\xF4ng hi\u1EC3u", romanized: "toy khong hyew", english: "I do not understand" }
          ],
          tips: ['Negation uses "kh\xF4ng" before verbs', 'Questions are formed by adding "kh\xF4ng?" or "\xE0?" at the end', "Time words come before or after the subject, not after the verb"],
          practice: "Write 5 sentences about yourself in Vietnamese."
        }
      },
      {
        id: "vi-07",
        title: "Vietnamese Festivals",
        description: "Celebrate T\u1EBFt and major Vietnamese traditions",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "T\u1EBFt Nguy\xEAn \u0110\xE1n (Vietnamese Lunar New Year) is the most important holiday \u2014 a time for family reunion, offerings, and new beginnings.",
          keyPhrases: [
            { native: "Ch\xFAc M\u1EEBng N\u0103m M\u1EDBi", romanized: "chuk mung nam moy", english: "Happy New Year" },
            { native: "B\xE1nh ch\u01B0ng", romanized: "banh chung", english: "Square sticky rice cake (Tet food)" },
            { native: "L\xEC x\xEC", romanized: "lee see", english: "Lucky money in red envelope" },
            { native: "H\u1ED9i An", romanized: "Hoy An", english: "Ancient town famous for lantern festival" },
            { native: "Trung Thu", romanized: "Chung Too", english: "Mid-Autumn Festival (mooncake celebration)" }
          ],
          tips: ["Clean your house before T\u1EBFt \u2014 never on New Year's Day itself", "Wear red or new clothes on T\u1EBFt for good luck", "The first visitor to a home on New Year's Day brings fortune or misfortune"],
          practice: "Write a T\u1EBFt greeting card in Vietnamese."
        }
      },
      {
        id: "vi-08",
        title: "At the Market (Ch\u1EE3)",
        description: "Navigate Vietnamese markets with confidence",
        type: "conversation",
        difficulty: "intermediate",
        duration: "13 min",
        content: {
          intro: "Vietnamese wet markets (ch\u1EE3) are lively and colorful. Bargaining is expected in most traditional markets.",
          keyPhrases: [
            { native: "C\xE1i n\xE0y gi\xE1 bao nhi\xEAu?", romanized: "kai nay jah bao nyew", english: "How much is this?" },
            { native: "\u0110\u1EAFt qu\xE1!", romanized: "daht kwa", english: "Too expensive!" },
            { native: "B\u1EDBt \u0111i m\u1ED9t ch\xFAt", romanized: "bert dee moht chut", english: "Reduce it a little" },
            { native: "Cho t\xF4i xem", romanized: "cho toy sem", english: "Let me see it" },
            { native: "T\xF4i mua c\xE1i n\xE0y", romanized: "toy mua kai nay", english: "I will buy this one" }
          ],
          tips: ["Always smile when bargaining \u2014 confrontation is culturally inappropriate", "Start at half the asking price in tourist areas", "Supermarkets (si\xEAu th\u1ECB) have fixed prices"],
          practice: "Role-play buying fruit at a Vietnamese market with a partner."
        }
      },
      {
        id: "vi-09",
        title: "Vietnamese Classifiers",
        description: "Use noun classifiers correctly in Vietnamese",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Like Chinese, Vietnamese uses classifiers before nouns when counting or specifying. They indicate the category of object.",
          keyPhrases: [
            { native: "con ch\xF3", romanized: "kon cho", english: "Dog (con = living things)" },
            { native: "c\xE1i b\xE0n", romanized: "kai ban", english: "Table (c\xE1i = inanimate objects)" },
            { native: "quy\u1EC3n s\xE1ch", romanized: "kwen sak", english: "Book (quy\u1EC3n = bound objects)" },
            { native: "t\u1EDD b\xE1o", romanized: "tuh bao", english: "Newspaper (t\u1EDD = flat sheets)" },
            { native: "c\u1ED1c n\u01B0\u1EDBc", romanized: "kohk nuok", english: "Glass of water (c\u1ED1c = cup-shaped)" }
          ],
          tips: ["C\xE1i is the most common general classifier \u2014 use when unsure", "Con is used for animals and some other objects", "Classifiers also change meaning slightly (chi\u1EBFc vs c\xE1i for shoes)"],
          practice: "List 10 objects and assign the correct Vietnamese classifier to each."
        }
      },
      {
        id: "vi-10",
        title: "Travel Phrases in Vietnam",
        description: "Navigate Vietnam by bus, taxi, and motorbike",
        type: "conversation",
        difficulty: "intermediate",
        duration: "13 min",
        content: {
          intro: "Vietnam is increasingly popular with tourists. Knowing transportation phrases makes your travel smoother.",
          keyPhrases: [
            { native: "B\u1EBFn xe bu\xFDt \u1EDF \u0111\xE2u?", romanized: "ben se bweet uh dau", english: "Where is the bus station?" },
            { native: "Cho t\xF4i \u0111\u1EBFn...", romanized: "cho toy den", english: "Take me to... (taxi/xe \xF4m)" },
            { native: "Bao nhi\xEAu ti\u1EC1n?", romanized: "bao nyew tyen", english: "How much?" },
            { native: "D\u1EEBng \u1EDF \u0111\xE2y", romanized: "dung uh day", english: "Stop here" },
            { native: "C\xE1ch \u0111\xE2y bao xa?", romanized: "kak day bao sa", english: "How far from here?" }
          ],
          tips: ["Grab (SE Asian Uber) is widely used in Vietnam for fair prices", "Negotiate xe \xF4m (motorbike taxi) price before getting on", "Long-distance travel: sleeper buses are comfortable and cheap"],
          practice: "Plan a 3-city Vietnam trip itinerary using transportation vocabulary."
        }
      },
      {
        id: "vi-11",
        title: "Th\u1EDDi ti\u1EBFt (Weather)",
        description: "Describe weather and climates in Vietnamese",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Vietnam has distinct regional climates. Discussing the weather is very common in daily greetings.",
          keyPhrases: [
            { native: "N\xF3ng", romanized: "Nong", english: "Hot" },
            { native: "L\u1EA1nh", romanized: "Lanh", english: "Cold" },
            { native: "M\u01B0a", romanized: "Mua", english: "Rain" },
            { native: "N\u0103ng", romanized: "Nang", english: "Sunny" },
            { native: "Th\u1EDDi ti\u1EBFt", romanized: "Thoi tiet", english: "Weather" }
          ],
          tips: ["Southern Vietnam has two seasons (wet and dry)", "Northern Vietnam has four seasons (spring, summer, autumn, winter)", 'Use "tr\u1EDDi" (sky/heaven) before weather, e.g. "Tr\u1EDDi n\xF3ng" (It is hot)'],
          practice: "Write a sentence in Vietnamese describing the weather today."
        }
      },
      {
        id: "vi-12",
        title: "Vietnamese Coffee Culture",
        description: "Explore coffee brewing and types in Vietnam",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Vietnam is the second-largest exporter of coffee and has a world-famous coffee lifestyle.",
          keyPhrases: [
            { native: "C\xE0 ph\xEA s\u1EEFa \u0111\xE1", romanized: "Ca phe sua da", english: "Iced coffee with condensed milk" },
            { native: "Phin", romanized: "Phin", english: "Traditional coffee filter" },
            { native: "\u0110\u1EAFng", romanized: "Dang", english: "Bitter" },
            { native: "Ng\u1ECDt", romanized: "Ngot", english: "Sweet" },
            { native: "Qu\xE1n c\xE0 ph\xEA", romanized: "Quan ca phe", english: "Coffee shop" }
          ],
          tips: ["Vietnamese coffee is made with robusta beans, giving it a strong flavor", "Condensed milk is used instead of fresh milk", "Coffee is brewed slowly through a metal Phin filter"],
          practice: "List the key ingredients and filter name for standard Vietnamese iced coffee."
        }
      },
      {
        id: "vi-13",
        title: "Directions: Riding a Xe Om",
        description: "Communicate with motorbike taxi drivers",
        type: "conversation",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Use motorbikes to navigate traffic. Study keys directions and warnings.",
          keyPhrases: [
            { native: "Cho t\xF4i \u0111i \u0111\u1EBFn ch\u1EE3", romanized: "\u2014", english: "Please take me to the market" },
            { native: "\u0110\u1ED9i m\u0169 b\u1EA3o hi\u1EC3m", romanized: "doy mu bao hyem", english: "Wear a helmet" },
            { native: "B\u1EADt b\u1EA3n \u0111\u1ED3 l\xEAn", romanized: "\u2014", english: "Turn on the map" },
            { native: "Ng\xE3 t\u01B0", romanized: "nga tu", english: "Intersection / crossroad" },
            { native: "\u0110\xE8n \u0111\u1ECF", romanized: "den do", english: "Red light" },
            { native: "C\u1EA9n th\u1EADn !", romanized: "can than", english: "Be careful!" },
            { native: "D\u1EEBng l\u1EA1i \u1EDF \u0111\xE2y", romanized: "\u2014", english: "Stop here" },
            { native: "\u0110i l\u1ED1i n\xE0y", romanized: "\u2014", english: "Go this way" },
            { native: "Bao nhi\xEAu m\u1ED9t l\u01B0\u1EE3t?", romanized: "\u2014", english: "How much for a ride?" },
            { native: "C\u1EA3m \u01A1n b\xE1c", romanized: "\u2014", english: "Thank you, uncle (driver)" }
          ],
          tips: ["Always check that you are wearing a strapped helmet when boarding a Xe Om"],
          practice: "Simulate putting on a helmet, giving direction to the driver, and telling them to stop."
        }
      },
      {
        id: "vi-14",
        title: "Vietnamese Ao Dai & Dress",
        description: "Understand traditional garments and symbols",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Ao Dai is the national garment worn on formal occasions. Study its history.",
          keyPhrases: [
            { native: "\xC1o d\xE0i", romanized: "ow zai", english: "National tunic garment" },
            { native: "N\xF3n l\xE1", romanized: "nohn la", english: "Conical palm-leaf hat" },
            { native: "L\u1EE5a", romanized: "lua", english: "Silk fabric" },
            { native: "Trang ph\u1EE5c truy\u1EC1n th\u1ED1ng", romanized: "\u2014", english: "Traditional costume" },
            { native: "T\xE0 \xE1o", romanized: "\u2014", english: "Dress panels" },
            { native: "Qu\u1EA7n", romanized: "kwan", english: "Trousers / pants" },
            { native: "\u0110\xE1m c\u01B0\u1EDBi", romanized: "\u2014", english: "Wedding ceremony" },
            { native: "L\u1EC5 h\u1ED9i", romanized: "\u2014", english: "Festival" },
            { native: "May \u0111o", romanized: "\u2014", english: "Custom tailored" },
            { native: "K\xEDn \u0111\xE1o", romanized: "\u2014", english: "Modest / elegant design" }
          ],
          tips: ['Ao Dai literally translates to "Long Shirt", split into two side flaps worn over trousers'],
          practice: "List two events where Vietnamese citizens traditionally wear the Ao Dai."
        }
      },
      {
        id: "vi-15",
        title: "Past & Future Tenses: \u0110\xE3/S\u1EBD",
        description: "Express timelines using simple markers",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: 'Place tense particles "\u0111\xE3" (past) and "s\u1EBD" (future) before main verbs.',
          keyPhrases: [
            { native: "T\xF4i \u0111\xE3 \u0103n", romanized: "\u2014", english: "I ate (already)" },
            { native: "T\xF4i s\u1EBD \u0111i", romanized: "\u2014", english: "I will go" },
            { native: "H\xF4m qua", romanized: "hom kwa", english: "Yesterday" },
            { native: "Ng\xE0y mai", romanized: "ngay mai", english: "Tomorrow" },
            { native: "\u0110\xE3 ho\xE0n th\xE0nh", romanized: "\u2014", english: "Finished / Completed" },
            { native: "\u0110ang l\xE0m", romanized: "dang lam", english: "Doing (ongoing)" },
            { native: "Th\xE1ng tr\u01B0\u1EDBc", romanized: "\u2014", english: "Last month" },
            { native: "Th\xE1ng sau", romanized: "\u2014", english: "Next month" },
            { native: "S\u1EBD g\u1EB7p l\u1EA1i", romanized: "\u2014", english: "Will meet again" },
            { native: "T\xF4i \u0111\xE3 h\u1ECDc ti\u1EBFng Vi\u1EC7t", romanized: "\u2014", english: "I studied Vietnamese" }
          ],
          tips: ["Tense particles are optional if context time-words (e.g. yesterday) clarify the timeframe"],
          practice: 'Translate "I will eat Pho tomorrow" and "I studied Vietnamese last month" into Vietnamese.'
        }
      },
      {
        id: "vi-16",
        title: "Vietnamese Idioms & Slang",
        description: "Learn standard idioms and colloquial expressions in Vietnamese",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Vietnamese slang and idioms make your conversation sound natural. Learn these key terms.",
          keyPhrases: [
            { native: "D\u1EC5 nh\u01B0 \u0103n k\u1EB9o", romanized: "\u2014", english: "Extremely easy (lit. as easy as eating candy)" },
            { native: "Ch\xE9m gi\xF3", romanized: "\u2014", english: "To boast / chat casually (lit. slashing the wind)" },
            { native: "V\u1EBD \u0111\u01B0\u1EDDng cho h\u01B0\u01A1u ch\u1EA1y", romanized: "\u2014", english: "Encouraging bad behavior (lit. drawing a path for deer to run)" },
            { native: "\u0102n ch\xE1o \u0111\xE1 b\xE1t", romanized: "\u2014", english: "Being ungrateful (lit. eating porridge and kicking the bowl)" },
            { native: "Th\u1EA3 th\xEDnh", romanized: "\u2014", english: "Flirting (lit. throwing roasted rice bran / bait)" }
          ],
          tips: ['"Ch\xE9m gi\xF3" is very common among friends in cafes', '"Th\u1EA3 th\xEDnh" is used extensively in social media contexts'],
          practice: 'Describe a fun hangout session using "ch\xE9m gi\xF3".'
        }
      },
      {
        id: "vi-17",
        title: "Vietnamese Proverbs (T\u1EE5c Ng\u1EEF)",
        description: "Explore traditional Vietnamese proverbs and wisdom",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Vietnamese proverbs reflect centuries of agricultural lifestyle, moral advice, and family values.",
          keyPhrases: [
            { native: "C\xF3 c\xF4ng m\xE0i s\u1EAFt, c\xF3 ng\xE0y n\xEAn kim", romanized: "\u2014", english: "Persistence pays off (lit. with effort grinding iron, it becomes a needle)" },
            { native: "G\u1EA7n m\u1EF1c th\xEC \u0111en, g\u1EA7n \u0111\xE8n th\xEC r\u1EA1ng", romanized: "\u2014", english: "Environment influences character (lit. near ink black, near lamp bright)" },
            { native: "\u0102n qu\u1EA3 nh\u1EDB k\u1EBB tr\u1ED3ng c\xE2y", romanized: "\u2014", english: "Gratitude (lit. eat fruit, remember the planter)" },
            { native: "M\u1ED9t c\xE2y l\xE0m ch\u1EB3ng n\xEAn non", romanized: "\u2014", english: "Unity makes strength (lit. one tree doesn't make a mountain)" },
            { native: "\u0110i m\u1ED9t ng\xE0y \u0111\xE0ng, h\u1ECDc m\u1ED9t s\xE0ng kh\xF4n", romanized: "\u2014", english: "Travel broadens the mind" }
          ],
          tips: ["Rhyme is heavily used in Vietnamese t\u1EE5c ng\u1EEF", '"\u0102n qu\u1EA3 nh\u1EDB k\u1EBB tr\u1ED3ng c\xE2y" is a cornerstone of Vietnamese moral values'],
          practice: 'Explain the meaning of "C\xF3 c\xF4ng m\xE0i s\u1EAFt, c\xF3 ng\xE0y n\xEAn kim" in English.'
        }
      }
    ]
  },
  {
    id: "german",
    language: "German",
    flag: "\u{1F1E9}\u{1F1EA}",
    color: "#000000",
    gradient: "from-yellow-400 via-red-500 to-black",
    lessons: [
      {
        id: "de-01",
        title: "German Alphabet & Sounds",
        description: "Learn standard German letters and special characters",
        type: "pronunciation",
        difficulty: "beginner",
        duration: "15 min",
        content: {
          intro: "German pronunciation is mostly regular, but has umlauts (\xE4, \xF6, \xFC) and the ligature \xDF.",
          keyPhrases: [
            { native: "\xC4 / \xE4", romanized: "umlaut a", english: 'Sounds like "e" in "bet"' },
            { native: "\xD6 / \xF6", romanized: "umlaut o", english: 'Sounds like "i" in "bird"' },
            { native: "\xDC / \xFC", romanized: "umlaut u", english: 'No English equivalent; shape lips for "oo" but say "ee"' },
            { native: "\xDF", romanized: "Eszett / sharp s", english: "Sounds like a double s" },
            { native: "w", romanized: "Sounds like v", english: "The German letter W is pronounced like V" }
          ],
          tips: ["German has 26 alphabet letters plus 3 umlauts and 1 sharp S", "Pronounce every consonant clearly", "The letter V is often pronounced like F, e.g. Vater"],
          practice: "Practice pronouncing the umlauts \xE4, \xF6, and \xFC aloud."
        }
      },
      {
        id: "de-02",
        title: "Greetings & Polite Phrases",
        description: "Essential German greetings and polite expressions",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Politeness is highly valued in German-speaking countries. Learn standard greeting etiquette.",
          keyPhrases: [
            { native: "Guten Tag", romanized: "\u2014", english: "Good day / Hello" },
            { native: "Bitte", romanized: "\u2014", english: "Please / You're welcome" },
            { native: "Danke", romanized: "\u2014", english: "Thank you" },
            { native: "Es tut mir leid", romanized: "\u2014", english: "I am sorry" },
            { native: "Auf Wiedersehen", romanized: "\u2014", english: "Goodbye (formal)" }
          ],
          tips: ['Use "Sie" (formal) when speaking to strangers and "du" (informal) for friends', "Shake hands firmly when greeting someone", 'Saying "Bitte" is extremely versatile \u2014 it also means "pardon?" and "here you go"'],
          practice: "Practice greeting a partner formally and informally."
        }
      },
      {
        id: "de-03",
        title: "Numbers 1\u2013100",
        description: "Count in German from one to one hundred",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: 'German numbers are logical but have one twist: units are spoken before tens (e.g. 21 is "one and twenty").',
          keyPhrases: [
            { native: "eins, zwei, drei", romanized: "\u2014", english: "One, two, three" },
            { native: "zehn", romanized: "\u2014", english: "Ten" },
            { native: "einundzwanzig", romanized: "\u2014", english: "Twenty-one" },
            { native: "hundert", romanized: "\u2014", english: "Hundred" },
            { native: "Wie viel kostet das?", romanized: "\u2014", english: "How much does that cost?" }
          ],
          tips: ['The unit is linked to the ten with "und" (and), e.g., "zweiunddrei\xDFig" (two and thirty = 32)', 'Zwei is sometimes pronounced "zwo" on the phone to avoid confusion with drei', "Germany uses Euros (\u20AC)"],
          practice: "Count aloud from 1 to 30 in German."
        }
      },
      {
        id: "de-04",
        title: "Food & Ordering",
        description: "Order food and drinks at German restaurants",
        type: "conversation",
        difficulty: "beginner",
        duration: "13 min",
        content: {
          intro: "German cuisine includes regional specialties. Knowing how to order makes dining out enjoyable.",
          keyPhrases: [
            { native: "Ich m\xF6chte bestellen, bitte", romanized: "\u2014", english: "I would like to order, please" },
            { native: "Ein Wasser, bitte", romanized: "\u2014", english: "A water, please" },
            { native: "Guten Appetit", romanized: "\u2014", english: "Enjoy your meal" },
            { native: "Die Rechnung, bitte", romanized: "\u2014", english: "The bill, please" },
            { native: "Zahlen, bitte", romanized: "\u2014", english: "Pay, please" }
          ],
          tips: ['Tap water is not commonly served in restaurants \u2014 you must order bottled water ("mit Kohlens\xE4ure" for sparkling, "ohne" for still)', 'Say "Guten Appetit" before eating', "Tipping is around 5-10% \u2014 round up the bill"],
          practice: "Roleplay ordering a drink and requesting the bill."
        }
      },
      {
        id: "de-05",
        title: "Directions & Transport",
        description: "Ask for directions and use German transit",
        type: "conversation",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "German public transit (\xD6PNV) is highly efficient. Learn to read maps and ask for train platforms.",
          keyPhrases: [
            { native: "Wo ist der Bahnhof?", romanized: "\u2014", english: "Where is the train station?" },
            { native: "Geradeaus", romanized: "\u2014", english: "Straight ahead" },
            { native: "Links / Rechts", romanized: "\u2014", english: "Left / Right" },
            { native: "Gleis", romanized: "\u2014", english: "Platform" },
            { native: "Fahrkarte", romanized: "\u2014", english: "Ticket" }
          ],
          tips: ["U-Bahn is the subway; S-Bahn is the suburban commuter train", "Always validate (entwerten) your paper ticket before boarding", "P\xFCnktlichkeit (punctuality) is highly valued in German transit"],
          practice: "Draw a simple map and practice giving directions in German."
        }
      },
      {
        id: "de-06",
        title: "Noun Genders (Der, Die, Das)",
        description: "Master masculine, feminine, and neuter nouns",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "German nouns have three genders: masculine (der), feminine (die), and neuter (das). Gender is grammatical, not logical.",
          keyPhrases: [
            { native: "der Tisch", romanized: "\u2014", english: "The table (masculine)" },
            { native: "die T\xFCr", romanized: "\u2014", english: "The door (feminine)" },
            { native: "das Buch", romanized: "\u2014", english: "The book (neuter)" },
            { native: "die B\xFCcher", romanized: "\u2014", english: "The books (all plurals use die)" },
            { native: "kein", romanized: "\u2014", english: "No / None (negative article)" }
          ],
          tips: ["Always memorize the article (der/die/das) together with the noun", 'Nouns ending in "-ung", "-heit", "-keit", "-schaft" are always feminine', "All German nouns are capitalized, regardless of their position in the sentence"],
          practice: "Categorize 15 daily items into masculine, feminine, and neuter lists."
        }
      },
      {
        id: "de-07",
        title: "Family & Social Relations",
        description: "Talk about family members in German",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "11 min",
        content: {
          intro: "Describe your family tree and talk about your family members in German.",
          keyPhrases: [
            { native: "Vater / Mutter", romanized: "\u2014", english: "Father / Mother" },
            { native: "Sohn / Tochter", romanized: "\u2014", english: "Son / Daughter" },
            { native: "Bruder / Schwester", romanized: "\u2014", english: "Brother / Sister" },
            { native: "Gro\xDFeltern", romanized: "\u2014", english: "Grandparents" },
            { native: "Geschwister", romanized: "\u2014", english: "Siblings" }
          ],
          tips: ["German family terms are similar to English due to shared Germanic roots", '"Geschwister" is a single word for siblings', 'Possessive pronouns change with gender: "mein Vater" vs "meine Mutter"'],
          practice: "Describe your family structure in three sentences using German vocabulary."
        }
      },
      {
        id: "de-08",
        title: "Festivals & Traditions",
        description: "Explore German culture through Oktoberfest and holidays",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Germany is rich in cultural festivals, blending traditional folk roots with modern celebrations.",
          keyPhrases: [
            { native: "Oktoberfest", romanized: "\u2014", english: "Bavarian beer festival in Munich" },
            { native: "Weihnachtsmarkt", romanized: "\u2014", english: "Christmas market" },
            { native: "Karneval", romanized: "\u2014", english: "Carnival / Fasching" },
            { native: "Prost!", romanized: "\u2014", english: "Cheers!" },
            { native: "Frohe Weihnachten", romanized: "\u2014", english: "Merry Christmas" }
          ],
          tips: ["Oktoberfest actually begins in September", "Clink glasses with eye contact \u2014 failing to do so is considered bad luck", "Christmas markets are famous for Gl\xFChwein (mulled wine) and gingerbread"],
          practice: "Write a short invitation to a friend to attend a local German festival."
        }
      },
      {
        id: "de-09",
        title: "Simple Present Tense",
        description: "Conjugate standard German verbs in the present",
        type: "grammar",
        difficulty: "intermediate",
        duration: "14 min",
        content: {
          intro: "German verbs conjugate based on the subject pronoun in the present tense.",
          keyPhrases: [
            { native: "ich lerne / du lernst", romanized: "\u2014", english: "I learn / you learn" },
            { native: "er lernt / sie lernt", romanized: "\u2014", english: "He learns / she learns" },
            { native: "wir lernen", romanized: "\u2014", english: "We learn" },
            { native: "ihr lernt", romanized: "\u2014", english: "You all learn" },
            { native: "sie lernen", romanized: "\u2014", english: "They learn / You (formal) learn" }
          ],
          tips: ['Most regular verbs end in "-en" in the infinitive (e.g. spielen, lernen)', "Conjugation endings: -e, -st, -t, -en, -t, -en", "The verb always takes the second position in a standard main clause"],
          practice: 'Conjugate the verb "spielen" (to play) for all subject pronouns.'
        }
      },
      {
        id: "de-10",
        title: "Shopping Vocabulary",
        description: "Shop and purchase items in German cities",
        type: "conversation",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Navigate clothing shops, supermarkets, and cashier queues in German-speaking countries.",
          keyPhrases: [
            { native: "Ich schaue nur, danke", romanized: "\u2014", english: "I am just looking, thank you" },
            { native: "Haben Sie das in Gr\xF6\xDFe...?", romanized: "\u2014", english: "Do you have this in size...?" },
            { native: "Mit Karte, bitte", romanized: "\u2014", english: "By card, please" },
            { native: "Kassenzettel", romanized: "\u2014", english: "Receipt" },
            { native: "T\xFCte", romanized: "\u2014", english: "Shopping bag" }
          ],
          tips: ["Supermarkets expect you to bring your own bags or purchase them at the register", "Cashiers scan items extremely fast \u2014 pack quickly", "Sunday shopping is generally forbidden (Laden\xF6ffnungszeiten)"],
          practice: "Roleplay paying for groceries at a checkout counter."
        }
      },
      {
        id: "de-11",
        title: "German Hobbies & Free Time",
        description: "Talk about sports, hobbies, and leisure",
        type: "vocabulary",
        difficulty: "beginner",
        duration: "11 min",
        content: {
          intro: "Germans value work-life balance (Feierabend) and participate actively in clubs and sports.",
          keyPhrases: [
            { native: "Fu\xDFball spielen", romanized: "\u2014", english: "To play soccer" },
            { native: "Rad fahren", romanized: "\u2014", english: "To ride a bike" },
            { native: "Wandern", romanized: "\u2014", english: "Hiking" },
            { native: "Freizeit", romanized: "\u2014", english: "Free time" },
            { native: "Verein", romanized: "\u2014", english: "Club / Association" }
          ],
          tips: ['Many German hobbies revolve around a "Verein" (sports club, music club, etc.)', "Soccer (Fu\xDFball) is the most popular national sport", "Wandern (hiking) in the Black Forest or Alps is highly popular"],
          practice: "Describe your favorite weekend activity in German."
        }
      },
      {
        id: "de-12",
        title: "German Cafe Culture",
        description: "Order coffee and understand German bakeries",
        type: "culture",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "German bakeries (B\xE4ckerei) and cafes are world-famous for their high-quality bread and cakes.",
          keyPhrases: [
            { native: "Ein Kaffee und ein St\xFCck Kuchen", romanized: "\u2014", english: "A coffee and a slice of cake" },
            { native: "Br\xF6tchen", romanized: "\u2014", english: "Bread rolls" },
            { native: "Kaffee und Kuchen", romanized: "\u2014", english: "Coffee and cake tradition" },
            { native: "Schwarzbrot", romanized: "\u2014", english: "Black rye bread" },
            { native: "Zum Mitnehmen / Hier essen", romanized: "\u2014", english: "To go / Dine in" }
          ],
          tips: ['"Kaffee und Kuchen" is a traditional Sunday afternoon social ritual', "German bakeries offer dozens of varieties of fresh bread and rolls every morning", 'Specify "Zum Mitnehmen" if you want your pastry to go'],
          practice: "Write a dialogue ordering breakfast at a German bakery."
        }
      },
      {
        id: "de-13",
        title: "Directions: Asking for Platform",
        description: "Find platform locations and check transit plans",
        type: "conversation",
        difficulty: "beginner",
        duration: "12 min",
        content: {
          intro: "Navigate German central stations (Hauptbahnhof) using train vocab.",
          keyPhrases: [
            { native: "Entschuldigung, wo ist Gleis 3?", romanized: "\u2014", english: "Excuse me, where is platform 3?" },
            { native: "Fahrplan", romanized: "\u2014", english: "Time table / schedule" },
            { native: "Versp\xE4tung", romanized: "\u2014", english: "Delay" },
            { native: "Der Zug", romanized: "\u2014", english: "The train" },
            { native: "Abfahrt / Ankunft", romanized: "\u2014", english: "Departure / Arrival" },
            { native: "Auf welchem Gleis?", romanized: "\u2014", english: "On which platform?" },
            { native: "Fahrkartenautomat", romanized: "\u2014", english: "Ticket machine" },
            { native: "Sitzplatzreservierung", romanized: "\u2014", english: "Seat reservation" },
            { native: "Gute Reise !", romanized: "\u2014", english: "Have a good trip!" },
            { native: "Der Anschlusszug", romanized: "\u2014", english: "Connecting train" }
          ],
          tips: ['Check the "Fahrplan" board for "Versp\xE4tung" notices showing train delays'],
          practice: 'Simulate asking: "Wo f\xE4hrt der Zug nach Berlin ab?" (Where does the train to Berlin depart?).'
        }
      },
      {
        id: "de-14",
        title: "German Punctuality & Rules",
        description: "Social etiquette and recycling procedures",
        type: "culture",
        difficulty: "beginner",
        duration: "10 min",
        content: {
          intro: "Study German community standards, focusing on punctuality and recycling categories.",
          keyPhrases: [
            { native: "P\xFCnktlichkeit", romanized: "\u2014", english: "Punctuality (arriving exactly on time)" },
            { native: "M\xFClltrennung", romanized: "\u2014", english: "Waste sorting / recycling" },
            { native: "Pfandflasche", romanized: "\u2014", english: "Returnable bottle with deposit" },
            { native: "Ruhezeit", romanized: "\u2014", english: "Quiet hours (Sundays/nights)" },
            { native: "Ordnung", romanized: "\u2014", english: "Order / neatness" },
            { native: "Altpapier", romanized: "\u2014", english: "Recycled paper bin" },
            { native: "Biom\xFCll", romanized: "\u2014", english: "Organic waste" },
            { native: "Restm\xFCll", romanized: "\u2014", english: "General non-recyclable waste" },
            { native: "Pfandautomat", romanized: "\u2014", english: "Bottle return machine" },
            { native: "P\xFCnktlich sein", romanized: "\u2014", english: "Be on time" }
          ],
          tips: ["Quiet hours (Ruhezeit) are legally enforced on Sundays; do not run loud machines"],
          practice: 'List the 4 main recycling categories and describe "Pfand" bottle return.'
        }
      },
      {
        id: "de-15",
        title: "Simple Past Tense: Pr\xE4teritum",
        description: "Talk about past times using simple forms",
        type: "grammar",
        difficulty: "intermediate",
        duration: "15 min",
        content: {
          intro: "Learn simple past forms (Pr\xE4teritum) for auxiliary verbs (haben, sein).",
          keyPhrases: [
            { native: "ich war / du warst", romanized: "\u2014", english: "I was / you were (sein past)" },
            { native: "er war / wir waren", romanized: "\u2014", english: "he was / we were" },
            { native: "ich hatte / du hattest", romanized: "\u2014", english: "I had / you had (haben past)" },
            { native: "er hatte / wir hatten", romanized: "\u2014", english: "he had / we had" },
            { native: "gestern", romanized: "ges-tern", english: "yesterday" },
            { native: "letztes Jahr", romanized: "\u2014", english: "last year" },
            { native: "Es war einmal", romanized: "\u2014", english: "Once upon a time" },
            { native: "Ich hatte keine Zeit", romanized: "\u2014", english: "I had no time" },
            { native: "Wo warst du gestern?", romanized: "\u2014", english: "Where were you yesterday?" },
            { native: "Wir hatten ein Auto", romanized: "\u2014", english: "We had a car" }
          ],
          tips: ['Pr\xE4teritum is primarily used in written stories and reports, but "war" and "hatte" are common in speech'],
          practice: 'Translate "I was tired yesterday and I had no time" into German.'
        }
      },
      {
        id: "de-16",
        title: "German Idioms & Colloquialisms",
        description: "Learn common colloquial phrases and funny German idioms",
        type: "vocabulary",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "German idioms add color to your spoken language. Learn these widely used expressions.",
          keyPhrases: [
            { native: "Das ist ein Kinderspiel", romanized: "\u2014", english: "Child's play / Piece of cake" },
            { native: "Tomaten auf den Augen haben", romanized: "\u2014", english: "Being oblivious (lit. having tomatoes on one's eyes)" },
            { native: "Jemandem die Daumen dr\xFCcken", romanized: "\u2014", english: "To wish someone luck (lit. to press the thumbs for someone)" },
            { native: "Die Kirche im Dorf lassen", romanized: "\u2014", english: "To not get carried away (lit. to leave the church in the village)" },
            { native: "Um den hei\xDFen Brei herumreden", romanized: "\u2014", english: "To beat around the bush (lit. to talk around hot porridge)" }
          ],
          tips: ['Instead of crossing fingers, Germans "press thumbs" (Daumen dr\xFCcken) for luck', '"Kinderspiel" is used to describe easy tests or tasks'],
          practice: 'Write a sentence wishing a friend luck using "Daumen dr\xFCcken".'
        }
      },
      {
        id: "de-17",
        title: "German Proverbs (Sprichw\xF6rter)",
        description: "Understand traditional German proverbs and wisdom",
        type: "culture",
        difficulty: "intermediate",
        duration: "12 min",
        content: {
          intro: "Proverbs (Sprichw\xF6rter) are common in German literature and reflect historical wisdom.",
          keyPhrases: [
            { native: "\xDCbung macht den Meister", romanized: "\u2014", english: "Practice makes perfect" },
            { native: "Wer rastet, der rostet", romanized: "\u2014", english: "He who rests, rusts (stay active)" },
            { native: "Ohne Flei\xDF kein Preis", romanized: "\u2014", english: "No pain, no gain (lit. without diligence, no prize)" },
            { native: "Aller Anfang ist schwer", romanized: "\u2014", english: "Every beginning is hard" },
            { native: "Morgenstund hat Gold im Mund", romanized: "\u2014", english: "The early bird catches the worm (lit. morning hour has gold in mouth)" }
          ],
          tips: ["Many German proverbs focus on discipline, hard work, and persistence", '"\xDCbung macht den Meister" is commonly used to motivate learners'],
          practice: 'Translate "\xDCbung macht den Meister" and explain its value to a language learner.'
        }
      }
    ]
  }
];

// src/data/languageExams.ts
var languageExams = {
  thai: [
    {
      id: "th-ex-01",
      question: "How many base consonants are there in the Thai alphabet?",
      options: ["32", "44", "21", "15"],
      answerIndex: 1,
      explanation: "Thai alphabet contains 44 base consonants divided into high, mid, and low classes."
    },
    {
      id: "th-ex-02",
      question: "How many tones exist in the spoken Thai language?",
      options: ["3 tones", "4 tones", "5 tones", "6 tones"],
      answerIndex: 2,
      explanation: "Thai has 5 tones: mid, low, falling, high, and rising."
    },
    {
      id: "th-ex-03",
      question: 'Which of the following is the Thai base consonant for "Chicken"?',
      options: ["\u0E02 (Kh)", "\u0E07 (Ng)", "\u0E01 (K)", "\u0E14 (D)"],
      answerIndex: 2,
      explanation: '\u0E01 (Ko Kai) is the first consonant and represents "chicken".'
    },
    {
      id: "th-ex-04",
      question: 'Which consonant represents "Snake" and belongs to the low-class consonants?',
      options: ["\u0E08 (J)", "\u0E02 (Kh)", "\u0E07 (Ng)", "\u0E01 (K)"],
      answerIndex: 2,
      explanation: '\u0E07 (Ngo Ngu) represents "snake" and is a low-class consonant.'
    },
    {
      id: "th-ex-05",
      question: 'Which consonant represents "Child" and is a mid-class consonant?',
      options: ["\u0E14 (D)", "\u0E02 (Kh)", "\u0E07 (Ng)", "\u0E01 (K)"],
      answerIndex: 0,
      explanation: '\u0E14 (Do Dek) represents "child" and is a mid-class consonant.'
    },
    {
      id: "th-ex-06",
      question: 'How do you say "Hello" or "Goodbye" in Thai?',
      options: ["\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob khun)", "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35 (Sawasdee)", "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23 (Mai pen rai)", "\u0E02\u0E2D\u0E42\u0E17\u0E29 (Kho thot)"],
      answerIndex: 1,
      explanation: "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35 (Sawasdee) is used for both Hello and Goodbye."
    },
    {
      id: "th-ex-07",
      question: "What is the polite particle used at the end of a sentence by a male speaker?",
      options: ["\u0E04\u0E48\u0E30 (Ka)", "\u0E19\u0E30 (Na)", "\u0E04\u0E23\u0E31\u0E1A (Krap)", "\u0E08\u0E49\u0E32 (Ja)"],
      answerIndex: 2,
      explanation: "\u0E04\u0E23\u0E31\u0E1A (Krap) is the polite particle used by male speakers."
    },
    {
      id: "th-ex-08",
      question: "What is the polite particle used by a female speaker in Thai?",
      options: ["\u0E04\u0E48\u0E30 / \u0E04\u0E30 (Ka / Kha)", "\u0E04\u0E23\u0E31\u0E1A (Krap)", "\u0E08\u0E49\u0E30 (Ja)", "\u0E19\u0E30 (Na)"],
      answerIndex: 0,
      explanation: "Female speakers use \u0E04\u0E48\u0E30 (Ka) for statements and \u0E04\u0E30 (Kha) for questions."
    },
    {
      id: "th-ex-09",
      question: 'How do you say "Thank you" in Thai?',
      options: ["\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35 (Sawasdee)", "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23 (Mai pen rai)", "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob khun)", "\u0E22\u0E34\u0E19\u0E14\u0E35 (Yin dee)"],
      answerIndex: 2,
      explanation: '\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob khun) means "Thank you".'
    },
    {
      id: "th-ex-10",
      question: 'What does "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23" (Mai pen rai) mean in Thai?',
      options: ["Hello", "No problem / It is okay", "Thank you", "Excuse me"],
      answerIndex: 1,
      explanation: `\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23 (Mai pen rai) translates to "It is okay", "No problem", or "Don't mention it".`
    },
    {
      id: "th-ex-11",
      question: 'What is the Thai word for the number "One" (1)?',
      options: ["\u0E2A\u0E2D\u0E07 (Song)", "\u0E2A\u0E32\u0E21 (Sam)", "\u0E2B\u0E19\u0E36\u0E48\u0E07 (Nueng)", "\u0E2A\u0E34\u0E1A (Sip)"],
      answerIndex: 2,
      explanation: "\u0E2B\u0E19\u0E36\u0E48\u0E07 (Nueng) is the number 1."
    },
    {
      id: "th-ex-12",
      question: 'How do you say the number "Ten" (10) in Thai?',
      options: ["\u0E2A\u0E34\u0E1A (Sip)", "\u0E23\u0E49\u0E2D\u0E22 (Roi)", "\u0E2B\u0E19\u0E36\u0E48\u0E07 (Nueng)", "\u0E2A\u0E2D\u0E07 (Song)"],
      answerIndex: 0,
      explanation: "\u0E2A\u0E34\u0E1A (Sip) represents the number 10."
    },
    {
      id: "th-ex-13",
      question: 'How do you say the number "One hundred" (100) in Thai?',
      options: ["\u0E2A\u0E34\u0E1A (Sip)", "\u0E23\u0E49\u0E2D\u0E22 (Roi)", "\u0E1E\u0E31\u0E19 (Phan)", "\u0E2B\u0E21\u0E37\u0E48\u0E19 (Muen)"],
      answerIndex: 1,
      explanation: "\u0E23\u0E49\u0E2D\u0E22 (Roi) means hundred."
    },
    {
      id: "th-ex-14",
      question: 'How do you say "Twenty" (20) in Thai?',
      options: ["\u0E2A\u0E2D\u0E07\u0E2A\u0E34\u0E1A (Song sip)", "\u0E22\u0E35\u0E48\u0E2A\u0E34\u0E1A (Yee sip)", "\u0E2A\u0E34\u0E1A\u0E2A\u0E2D\u0E07 (Sip song)", "\u0E23\u0E49\u0E2D\u0E22\u0E2A\u0E2D\u0E07 (Roi song)"],
      answerIndex: 1,
      explanation: "Twenty is irregularly pronounced as \u0E22\u0E35\u0E48\u0E2A\u0E34\u0E1A (Yee sip) rather than \u0E2A\u0E2D\u0E07\u0E2A\u0E34\u0E1A (Song sip)."
    },
    {
      id: "th-ex-15",
      question: 'What is the Thai word for the number "Three" (3)?',
      options: ["\u0E2A\u0E35\u0E48 (See)", "\u0E2B\u0E49\u0E32 (Ha)", "\u0E2A\u0E32\u0E21 (Sam)", "\u0E2A\u0E2D\u0E07 (Song)"],
      answerIndex: 2,
      explanation: "\u0E2A\u0E32\u0E21 (Sam) represents the number 3."
    },
    {
      id: "th-ex-16",
      question: "How do you politely ask for the menu in a Thai restaurant?",
      options: ["\u0E40\u0E0A\u0E47\u0E04\u0E1A\u0E34\u0E25\u0E14\u0E49\u0E27\u0E22 (Check bin duai)", "\u0E02\u0E2D\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E19\u0E48\u0E2D\u0E22\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21 (Kho menu noi dai mai)", "\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E21\u0E32\u0E01 (Aroi mak)", "\u0E40\u0E1C\u0E47\u0E14\u0E19\u0E49\u0E2D\u0E22 (Phet noi)"],
      answerIndex: 1,
      explanation: '\u0E02\u0E2D\u0E40\u0E21\u0E19\u0E39\u0E2B\u0E19\u0E48\u0E2D\u0E22\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21 (Kho menu noi dai mai) means "Can I have the menu please?".'
    },
    {
      id: "th-ex-17",
      question: 'How do you describe food as "Very delicious" in Thai?',
      options: ["\u0E40\u0E1C\u0E47\u0E14\u0E21\u0E32\u0E01 (Phet mak)", "\u0E44\u0E21\u0E48\u0E43\u0E2A\u0E48\u0E1C\u0E31\u0E01\u0E0A\u0E35 (Mai sai phak chi)", "\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E21\u0E32\u0E01 (Aroi mak)", "\u0E40\u0E0A\u0E47\u0E04\u0E1A\u0E34\u0E25 (Check bin)"],
      answerIndex: 2,
      explanation: '\u0E2D\u0E23\u0E48\u0E2D\u0E22\u0E21\u0E32\u0E01 (Aroi mak) translates to "Very delicious".'
    },
    {
      id: "th-ex-18",
      question: 'How do you say "A little bit spicy" in Thai?',
      options: ["\u0E44\u0E21\u0E48\u0E40\u0E1C\u0E47\u0E14 (Mai phet)", "\u0E40\u0E1C\u0E47\u0E14\u0E21\u0E32\u0E01 (Phet mak)", "\u0E40\u0E1C\u0E47\u0E14\u0E19\u0E49\u0E2D\u0E22\u0E46 (Phet noi noi)", "\u0E43\u0E2A\u0E48\u0E1E\u0E23\u0E34\u0E01 (Sai phrik)"],
      answerIndex: 2,
      explanation: '\u0E40\u0E1C\u0E47\u0E14\u0E19\u0E49\u0E2D\u0E22\u0E46 (Phet noi noi) means "A little bit spicy".'
    },
    {
      id: "th-ex-19",
      question: "How do you ask for the bill at a Thai restaurant?",
      options: ["\u0E40\u0E0A\u0E47\u0E04\u0E1A\u0E34\u0E25\u0E14\u0E49\u0E27\u0E22 / \u0E40\u0E01\u0E47\u0E1A\u0E40\u0E07\u0E34\u0E19\u0E14\u0E49\u0E27\u0E22 (Check bin duai / Kep ngoen duai)", "\u0E02\u0E2D\u0E40\u0E21\u0E19\u0E39 (Kho menu)", "\u0E02\u0E2D\u0E0A\u0E49\u0E2D\u0E19\u0E2B\u0E19\u0E48\u0E2D\u0E22 (Kho chon noi)", "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13 (Khob khun)"],
      answerIndex: 0,
      explanation: "\u0E40\u0E0A\u0E47\u0E04\u0E1A\u0E34\u0E25\u0E14\u0E49\u0E27\u0E22 (Check bin duai) or \u0E40\u0E01\u0E47\u0E1A\u0E40\u0E07\u0E34\u0E19\u0E14\u0E49\u0E27\u0E22 (Kep ngoen duai) is used to call for the bill."
    },
    {
      id: "th-ex-20",
      question: 'What does "\u0E44\u0E21\u0E48\u0E43\u0E2A\u0E48\u0E1C\u0E31\u0E01\u0E0A\u0E35" (Mai sai phak chi) mean?',
      options: ["No spicy please", "No MSG please", "No coriander please", "No sugar please"],
      answerIndex: 2,
      explanation: `\u0E1C\u0E31\u0E01\u0E0A\u0E35 (Phak chi) is coriander/cilantro; "\u0E44\u0E21\u0E48\u0E43\u0E2A\u0E48" (Mai sai) means "don't put in".`
    },
    {
      id: "th-ex-21",
      question: 'What is the Thai phrase for "Go straight"?',
      options: ["\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22 (Liao sai)", "\u0E15\u0E23\u0E07\u0E44\u0E1B (Trong pai)", "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E02\u0E27\u0E32 (Liao kwa)", "\u0E2D\u0E22\u0E39\u0E48\u0E44\u0E01\u0E25\u0E44\u0E2B\u0E21 (Yu klai mai)"],
      answerIndex: 1,
      explanation: '\u0E15\u0E23\u0E07\u0E44\u0E1B (Trong pai) means "Go straight".'
    },
    {
      id: "th-ex-22",
      question: 'How do you say "Turn left" in Thai?',
      options: ["\u0E15\u0E23\u0E07\u0E44\u0E1B (Trong pai)", "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22 (Liao sai)", "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E02\u0E27\u0E32 (Liao kwa)", "\u0E16\u0E2D\u0E22\u0E2B\u0E25\u0E31\u0E07 (Thoi lang)"],
      answerIndex: 1,
      explanation: '\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22 (Liao sai) translates to "Turn left".'
    },
    {
      id: "th-ex-23",
      question: 'How do you say "Turn right" in Thai?',
      options: ["\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E02\u0E27\u0E32 (Liao kwa)", "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E0B\u0E49\u0E32\u0E22 (Liao sai)", "\u0E15\u0E23\u0E07\u0E44\u0E1B (Trong pai)", "\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E01\u0E25\u0E31\u0E1A (Liao klap)"],
      answerIndex: 0,
      explanation: '\u0E40\u0E25\u0E35\u0E49\u0E22\u0E27\u0E02\u0E27\u0E32 (Liao kwa) translates to "Turn right".'
    },
    {
      id: "th-ex-24",
      question: 'What does "\u0E44\u0E1B\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E19" (Pai thi nai) mean?',
      options: ["Where are you going?", "How are you?", "Where is it?", "When do we go?"],
      answerIndex: 0,
      explanation: '\u0E44\u0E1B\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E19 (Pai thi nai) literally means "Go where?" or "Where are you going?".'
    },
    {
      id: "th-ex-25",
      question: 'What does "\u0E2D\u0E22\u0E39\u0E48\u0E44\u0E01\u0E25\u0E44\u0E2B\u0E21" (Yu klai mai) mean?',
      options: ["Is it close?", "Is it far?", "How much is it?", "Can we walk?"],
      answerIndex: 1,
      explanation: '\u0E44\u0E01\u0E25 (Klai) with a flat tone means "far". So "\u0E2D\u0E22\u0E39\u0E48\u0E44\u0E01\u0E25\u0E44\u0E2B\u0E21" means "Is it far?".'
    },
    {
      id: "th-ex-26",
      question: 'What is the Thai word for "Raining"?',
      options: ["\u0E23\u0E49\u0E2D\u0E19 (Ron)", "\u0E1D\u0646\u0E15\u0E01 (Fon tok)", "\u0E2B\u0E19\u0E32\u0E27 (Nao)", "\u0E1E\u0E32\u0E22\u0E38 (Phayu)"],
      answerIndex: 1,
      explanation: '\u0E1D\u0E19\u0E15\u0E01 (Fon tok) means "raining" in Thai; \u0E23\u0E49\u0E2D\u0E19 (Ron) is hot; \u0E2B\u0E19\u0E32\u0E27 (Nao) is cold.'
    },
    {
      id: "th-ex-27",
      question: 'What is the Thai word for "Temple"?',
      options: ["\u0E27\u0E31\u0E14 (Wat)", "\u0E1E\u0E23\u0E30 (Phra)", "\u0E16\u0E2D\u0E14\u0E23\u0E2D\u0E07\u0E40\u0E17\u0E49\u0E32 (Thot rong thao)", "\u0E17\u0E33\u0E1A\u0E38\u0E0D (Tham bun)"],
      answerIndex: 0,
      explanation: "\u0E27\u0E31\u0E14 (Wat) is temple in Thai."
    },
    {
      id: "th-ex-28",
      question: "Which famous water festival celebrates the traditional Thai New Year?",
      options: ["\u0E25\u0E2D\u0E22\u0E01\u0E23\u0E30\u0E17\u0E07 (Loy Krathong)", "\u0E2A\u0E07\u0E01\u0E23\u0E32\u0E19\u0E15\u0E4C (Songkran)", "\u0E27\u0E31\u0E19\u0E2A\u0E33\u0E04\u0E31\u0E0D (Wan samkhan)", "\u0E27\u0E31\u0E19\u0E40\u0E02\u0E49\u0E32\u0E1E\u0E23\u0E23\u0E29\u0E32 (Wan khao phansa)"],
      answerIndex: 1,
      explanation: "\u0E2A\u0E07\u0E01\u0E23\u0E32\u0E19\u0E15\u0E4C (Songkran) is the water splashing festival marking the traditional Thai New Year."
    },
    {
      id: "th-ex-29",
      question: 'How do you ask "How much is it?" while shopping in a Thai market?',
      options: ["\u0E23\u0E32\u0E04\u0E32\u0E40\u0E17\u0E48\u0E32\u0E44\u0E23 (Raka thao rai)", "\u0E25\u0E14\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21 (Lot dai mai)", "\u0E41\u0E1E\u0E07\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B (Phaeng koen pai)", "\u0E40\u0E2D\u0E32\u0E2D\u0E31\u0E19\u0E19\u0E35\u0E49 (Ao an ni)"],
      answerIndex: 0,
      explanation: '\u0E23\u0E32\u0E04\u0E32\u0E40\u0E17\u0E48\u0E32\u0E44\u0E23 (Raka thao rai) means "How much does it cost?".'
    },
    {
      id: "th-ex-30",
      question: 'How do you say "Can you discount / reduce the price?" in Thai?',
      options: ["\u0E41\u0E1E\u0E07\u0E44\u0E1B (Phaeng pai)", "\u0E23\u0E32\u0E04\u0E32\u0E40\u0E17\u0E48\u0E32\u0E44\u0E23 (Raka thao rai)", "\u0E25\u0E14\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21 (Lot dai mai)", "\u0E21\u0E35\u0E2A\u0E35\u0E2D\u0E37\u0E48\u0E19\u0E44\u0E2B\u0E21 (Mi si uen mai)"],
      answerIndex: 2,
      explanation: '\u0E25\u0E14\u0E44\u0E14\u0E49\u0E44\u0E2B\u0E21 (Lot dai mai) literally translates to "Reduce can?" or "Can you discount?".'
    },
    {
      id: "th-ex-31",
      question: "What does the slang '\u0E01\u0E25\u0E49\u0E27\u0E22\u0E46' (Kluai kluai) mean?",
      options: ["Very easy / Piece of cake", "Very spicy", "Expensive", "Slowly"],
      answerIndex: 0,
      explanation: "\u0E01\u0E25\u0E49\u0E27\u0E22\u0E46 (Kluai kluai) literally means 'bananas' but is used as slang for 'piece of cake' or 'very easy'."
    },
    {
      id: "th-ex-32",
      question: "Which Thai slang is used when you are in trouble or unexpected work piles up?",
      options: ["\u0E0A\u0E34\u0E27\u0E46 (Chill chill)", "\u0E07\u0E32\u0E19\u0E40\u0E02\u0E49\u0E32 (Ngan khao)", "\u0E44\u0E1B\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27 (Pai thiao)", "\u0E2A\u0E1A\u0E32\u0E22\u0E14\u0E35 (Sabai dee)"],
      answerIndex: 1,
      explanation: "\u0E07\u0E32\u0E19\u0E40\u0E02\u0E49\u0E32 (Ngan khao) literally means 'work enters' but is slang for 'in trouble' or having unexpected problems."
    },
    {
      id: "th-ex-33",
      question: "What is the meaning of the proverb '\u0E19\u0E49\u0E33\u0E02\u0E36\u0E49\u0E19\u0E43\u0E2B\u0E49\u0E23\u0E35\u0E1A\u0E15\u0E31\u0E01' (Nam khun hai reep tak)?",
      options: ["Save water for dry season", "Strike while the iron is hot", "Do not catch a big fish", "Respect your parents"],
      answerIndex: 1,
      explanation: "\u0E19\u0E49\u0E33\u0E02\u0E36\u0E49\u0E19\u0E43\u0E2B\u0E49\u0E23\u0E35\u0E1A\u0E15\u0E31\u0E01 translates to 'when the water rises, quickly scoop it up', meaning to seize opportunities / strike while the iron is hot."
    },
    {
      id: "th-ex-34",
      question: "What does the proverb '\u0E2B\u0E31\u0E27\u0E25\u0E49\u0E32\u0E19\u0E44\u0E14\u0E49\u0E2B\u0E27\u0E35' (Hua lan dai wee) refer to?",
      options: ["A very useful tool", "Getting a gift you cannot use", "Being wise and smart", "A hairy person"],
      answerIndex: 1,
      explanation: "\u0E2B\u0E31\u0E27\u0E25\u0E49\u0E32\u0E19\u0E44\u0E14\u0E49\u0E2B\u0E27\u0E35 means 'a bald person getting a comb', which refers to receiving a gift that is of no use to you."
    },
    {
      id: "th-ex-35",
      question: "In a business context, how do you say 'meeting' or 'conference' in Thai?",
      options: ["\u0E2A\u0E31\u0E0D\u0E0D\u0E32 (Sanya)", "\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E38\u0E21 (Kan prachum)", "\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D (Tit tor)", "\u0E1C\u0E39\u0E49\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23 (Phu chat kan)"],
      answerIndex: 1,
      explanation: "\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E38\u0E21 (Kan prachum) means 'meeting' or 'conference' in Thai."
    },
    {
      id: "th-ex-36",
      question: "What is the formal closing phrase in a Thai business email/letter meaning 'Respectfully yours'?",
      options: ["\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35\u0E04\u0E23\u0E31\u0E1A (Sawasdee krap)", "\u0E02\u0E2D\u0E41\u0E2A\u0E14\u0E07\u0E04\u0E27\u0E32\u0E21\u0E19\u0E31\u0E1A\u0E16\u0E37\u0E2D (Kho sadaeng khwam nap thue)", "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13\u0E21\u0E32\u0E01 (Khob khun mak)", "\u0E22\u0E34\u0E19\u0E14\u0E35\u0E14\u0E49\u0E27\u0E22 (Yin dee duai)"],
      answerIndex: 1,
      explanation: "\u0E02\u0E2D\u0E41\u0E2A\u0E14\u0E07\u0E04\u0E27\u0E32\u0E21\u0E19\u0E31\u0E1A\u0E16\u0E37\u0E2D is the standard formal sign-off equivalent to 'Respectfully yours' or 'Sincerely'."
    },
    {
      id: "th-ex-37",
      question: "What does '\u0E08\u0E2D\u0E07\u0E2B\u0E49\u0E2D\u0E07\u0E1E\u0E31\u0E01' (Chong hong phak) mean in travel?",
      options: ["Book a room", "Buy a ticket", "Find a guide", "Order food"],
      answerIndex: 0,
      explanation: "\u0E08\u0E2D\u0E07\u0E2B\u0E49\u0E2D\u0E07\u0E1E\u0E31\u0E01 (Chong hong phak) means 'to book/reserve a room' in Thai."
    },
    {
      id: "th-ex-38",
      question: "What is the Thai word for 'map'?",
      options: ["\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48 (Phaenthi)", "\u0E1C\u0E39\u0E49\u0E19\u0E33\u0E40\u0E17\u0E35\u0E48\u0E22\u0E27 (Phu nam thiao)", "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25 (Rong phayaban)", "\u0E2A\u0E31\u0E0D\u0E0D\u0E32 (Sanya)"],
      answerIndex: 0,
      explanation: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48 (Phaenthi) is the Thai word for 'map'."
    },
    {
      id: "th-ex-39",
      question: "How do you shout 'Help!' in an emergency in Thailand?",
      options: ["\u0E02\u0E2D\u0E42\u0E17\u0E29 (Kho thot)", "\u0E0A\u0E48\u0E27\u0E22\u0E14\u0E49\u0E27\u0E22 (Chuai duai)", "\u0E2B\u0E32\u0E2B\u0E21\u0E2D (Ha mor)", "\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E23 (Mai pen rai)"],
      answerIndex: 1,
      explanation: "\u0E0A\u0E48\u0E27\u0E22\u0E14\u0E49\u0E27\u0E22 (Chuai duai) means 'Help!' or 'Help me!' and is used in emergencies."
    },
    {
      id: "th-ex-40",
      question: "What does '\u0E40\u0E08\u0E47\u0E1A\u0E15\u0E23\u0E07\u0E19\u0E35\u0E49' (Chep trong ni) mean in a medical context?",
      options: ["It is far away", "It hurts here", "I need medicine", "Call the police"],
      answerIndex: 1,
      explanation: "\u0E40\u0E08\u0E47\u0E1A\u0E15\u0E23\u0E07\u0E19\u0E35\u0E49 (Chep trong ni) translates to 'it hurts here'."
    }
  ],
  korean: [
    {
      id: "ko-ex-01",
      question: "Who is credited with the invention of Hangeul (the Korean alphabet) in 1443?",
      options: ["King Sejong the Great", "King Gojong", "General Yi Sun-sin", "King Taejo"],
      answerIndex: 0,
      explanation: "King Sejong the Great created Hangeul to increase literacy among the common people."
    },
    {
      id: "ko-ex-02",
      question: 'What is the basic Hangeul consonant for the "N" sound?',
      options: ["\u3131", "\u3134", "\u3137", "\u3139"],
      answerIndex: 1,
      explanation: '\u3134 is called "nieun" and represents the N sound.'
    },
    {
      id: "ko-ex-03",
      question: 'Which vowel matches the "A" sound in Korean Hangul?',
      options: ["\u3153", "\u3157", "\u314F", "\u315C"],
      answerIndex: 2,
      explanation: '\u314F represents the vowel sound "a" (as in "father").'
    },
    {
      id: "ko-ex-04",
      question: "How is Hangeul written?",
      options: ["In a continuous line of letters", "In syllable blocks containing 2 to 4 characters", "Only vertically from right to left", "Using purely pictographic symbols"],
      answerIndex: 1,
      explanation: "Korean letters are grouped together into syllable blocks (consonant + vowel + optional final consonant)."
    },
    {
      id: "ko-ex-05",
      question: "What is the Korean word for the Korean writing system itself?",
      options: ["Hanja", "Hangeul", "Kanji", "Kana"],
      answerIndex: 1,
      explanation: "\uD55C\uAE00 (Hangeul) is the native name of the Korean alphabet."
    },
    {
      id: "ko-ex-06",
      question: 'What is the standard, polite way to say "Hello" in Korean?',
      options: ["\uC548\uB155 (Annyeong)", "\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo)", "\uAC10\uC0AC\uD569\uB2C8\uB2E4 (Gamsahamnida)", "\uC8C4\uC1A1\uD569\uB2C8\uB2E4 (Joesonghamnida)"],
      answerIndex: 1,
      explanation: "\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo) is the polite, standard greeting."
    },
    {
      id: "ko-ex-07",
      question: 'How do you say "Thank you" politely in Korean?',
      options: ["\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo)", "\uC8C4\uC1A1\uD569\uB2C8\uB2E4 (Joesonghamnida)", "\uBC18\uAC11\uC2B5\uB2C8\uB2E4 (Bangapseumnida)", "\uAC10\uC0AC\uD569\uB2C8\uB2E4 (Gamsahamnida)"],
      answerIndex: 3,
      explanation: '\uAC10\uC0AC\uD569\uB2C8\uB2E4 (Gamsahamnida) means "Thank you" in polite/formal speech.'
    },
    {
      id: "ko-ex-08",
      question: 'What does "\uC8C4\uC1A1\uD569\uB2C8\uB2E4" (Joesonghamnida) mean in Korean?',
      options: ["Hello", "I am sorry", "Thank you", "Goodbye"],
      answerIndex: 1,
      explanation: '\uC8C4\uC1A1\uD569\uB2C8\uB2E4 (Joesonghamnida) means "I am sorry".'
    },
    {
      id: "ko-ex-09",
      question: 'How do you say "Goodbye" to someone who is leaving while you are staying?',
      options: ["\uC548\uB155\uD788 \uAC00\uC138\uC694 (Annyeonghi gaseyo)", "\uC548\uB155\uD788 \uACC4\uC138\uC694 (Annyeonghi gyeseyo)", "\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo)", "\uBC18\uAC11\uC2B5\uB2C8\uB2E4 (Bangapseumnida)"],
      answerIndex: 0,
      explanation: '\uC548\uB155\uD788 \uAC00\uC138\uC694 (Annyeonghi gaseyo) means "Go in peace" (to someone leaving).'
    },
    {
      id: "ko-ex-10",
      question: "Which speech level ending is most commonly used to remain polite but conversational in everyday life?",
      options: ["\uD574\uCCB4 (Haeche)", "\uD569\uC1FC\uCCB4 (Hapshoche)", "\uD574\uC694\uCCB4 (Haeyoche)", "\uBC18\uB9D0 (Banmal)"],
      answerIndex: 2,
      explanation: '\uD574\uC694\uCCB4 (Haeyoche) ending with "-\uC694" is the standard informal polite speech level.'
    },
    {
      id: "ko-ex-11",
      question: 'What is the Native Korean number for "One" (1)?',
      options: ["\uC77C (Il)", "\uC774 (I)", "\uD558\uB098 (Hana)", "\uB458 (Dul)"],
      answerIndex: 2,
      explanation: "\uD558\uB098 (Hana) is the Native Korean number for 1."
    },
    {
      id: "ko-ex-12",
      question: 'What is the Sino-Korean number for "One" (1)?',
      options: ["\uC77C (Il)", "\uC774 (I)", "\uD558\uB098 (Hana)", "\uB458 (Dul)"],
      answerIndex: 0,
      explanation: "\uC77C (Il) is the Sino-Korean number for 1."
    },
    {
      id: "ko-ex-13",
      question: "Which number system should you use when counting currency (Won) or expressing phone numbers?",
      options: ["Native Korean", "Sino-Korean", "Hanja numbers", "English numbers"],
      answerIndex: 1,
      explanation: "Sino-Korean numbers (\uC77C, \uC774, \uC0BC...) are used for money, phone numbers, dates, and minutes."
    },
    {
      id: "ko-ex-14",
      question: "Which number system is used for counting physical items or expressing age?",
      options: ["Sino-Korean", "Native Korean", "English numbers", "Arabic numbers"],
      answerIndex: 1,
      explanation: "Native Korean numbers (\uD558\uB098, \uB458, \uC14B...) are used for counting general items, age, and hours."
    },
    {
      id: "ko-ex-15",
      question: 'What is the Sino-Korean word for "Hundred" (100)?',
      options: ["\uC2ED (Sip)", "\uBC31 (Baek)", "\uCC9C (Cheon)", "\uB9CC (Man)"],
      answerIndex: 1,
      explanation: "\uBC31 (Baek) is the Sino-Korean number for 100."
    },
    {
      id: "ko-ex-16",
      question: 'What does the popular slang "\uB300\uBC15" (Daebak) mean?',
      options: ["I am tired", "Awesome / Big win / Jack-pot", "Help me", "Please wait"],
      answerIndex: 1,
      explanation: '\uB300\uBC15 (Daebak) means "Awesome", "Great", or "Jackpot".'
    },
    {
      id: "ko-ex-17",
      question: 'Which phrase is used as a cheer of encouragement (meaning "Fighting!" or "You can do it!")?',
      options: ["\uD654\uC774\uD305 (Hwaiting)", "\uC544\uC774\uACE0 (Aigo)", "\uC9C4\uC9DC\uC694 (Jinjjayo)", "\uB300\uBC15 (Daebak)"],
      answerIndex: 0,
      explanation: "\uD654\uC774\uD305 (Hwaiting) or \uD30C\uC774\uD305 is the ubiquitous cheering expression."
    },
    {
      id: "ko-ex-18",
      question: "What is the grammatical sentence structure of Korean?",
      options: ["Subject-Verb-Object (SVO)", "Subject-Object-Verb (SOV)", "Verb-Subject-Object (VSO)", "Object-Subject-Verb (OSV)"],
      answerIndex: 1,
      explanation: "Korean sentences end with the verb, following the SOV order."
    },
    {
      id: "ko-ex-19",
      question: "Which grammatical particle marks the object of a verb in Korean?",
      options: ["\uC740 / \uB294 (eun/neun)", "\uC774 / \uAC00 (i/ga)", "\uC744 / \uB97C (eul/reul)", "\uC5D0 (e)"],
      answerIndex: 2,
      explanation: "\uC744/\uB97C (eul/reul) is the direct object marker."
    },
    {
      id: "ko-ex-20",
      question: "Which particle is the topic marker in Korean?",
      options: ["\uC740 / \uB294 (eun/neun)", "\uC774 / \uAC00 (i/ga)", "\uC744 / \uB97C (eul/reul)", "\uB85C / \uC73C\uB85C (ro/euro)"],
      answerIndex: 0,
      explanation: '\uC740/\uB294 (eun/neun) acts as the topic marker, often meaning "as for...".'
    },
    {
      id: "ko-ex-21",
      question: "How do you call a server at a restaurant in Korea politely?",
      options: ["\uB300\uBC15 (Daebak)", "\uC5EC\uAE30\uC694 (Yeogiyo)", "\uBB3C \uC8FC\uC138\uC694 (Mul juseyo)", "\uC624\uBE60 (Oppa)"],
      answerIndex: 1,
      explanation: '\uC5EC\uAE30\uC694 (Yeogiyo) literally means "over here" and is used to call servers.'
    },
    {
      id: "ko-ex-22",
      question: 'How do you say "Give me this please" in Korean?',
      options: ["\uC774\uAC70 \uC8FC\uC138\uC694 (Igeo juseyo)", "\uB9DB\uC788\uC5B4\uC694 (Massisseoyo)", "\uACC4\uC0B0\uC11C \uC8FC\uC138\uC694 (Gyesanseo juseyo)", "\uC5EC\uAE30\uC694 (Yeogiyo)"],
      answerIndex: 0,
      explanation: '\uC774\uAC70 (Igeo) means "this" and \uC8FC\uC138\uC694 (juseyo) means "please give".'
    },
    {
      id: "ko-ex-23",
      question: 'What is the Korean word for "Delicious"?',
      options: ["\uB9DB\uC788\uC5B4\uC694 (Massisseoyo)", "\uB354\uC6CC\uC694 (Deowoyo)", "\uCD94\uC6CC\uC694 (Chuwoyo)", "\uC9C4\uC9DC\uC694 (Jinjjayo)"],
      answerIndex: 0,
      explanation: '\uB9DB\uC788\uC5B4\uC694 (Massisseoyo) means "It is delicious".'
    },
    {
      id: "ko-ex-24",
      question: 'What is the Korean word for "Weather"?',
      options: ["\uB0A0\uC528 (Nalssi)", "\uACC4\uC808 (Gyejeol)", "\uD558\uB298 (Haneul)", "\uBC14\uB78C (Baram)"],
      answerIndex: 0,
      explanation: '\uB0A0\uC528 (Nalssi) translates to "weather".'
    },
    {
      id: "ko-ex-25",
      question: "What is the Korean national dish of spicy fermented cabbage?",
      options: ["\uBE44\uBE54\uBC25 (Bibimbap)", "\uAE40\uCE58 (Kimchi)", "\uBD88\uACE0\uAE30 (Bulgogi)", "\uB5A1\uBCF6\uC774 (Tteokbokki)"],
      answerIndex: 1,
      explanation: "\uAE40\uCE58 (Kimchi) is the world-famous Korean fermented side dish."
    },
    {
      id: "ko-ex-26",
      question: "Which Korean word refers to Karaoke rooms?",
      options: ["\uB4F1\uC0B0 (Deungsan)", "\uB178\uB798\uBC29 (Noraebang)", "PC\uBC29 (PC bang)", "\uC601\uD654 (Yeonghwa)"],
      answerIndex: 1,
      explanation: "\uB178\uB798\uBC29 (Noraebang) is a Karaoke singing room."
    },
    {
      id: "ko-ex-27",
      question: "Which Korean street food refers to seaweed rice rolls?",
      options: ["\uB5A1\uBCF6\uC774 (Tteokbokki)", "\uC624\uB385 (Odeng)", "\uAE40\uBC25 (Gimbap)", "\uC21C\uB300 (Sundae)"],
      answerIndex: 2,
      explanation: "\uAE40\uBC25 (Gimbap) is seaweed rice rolls."
    },
    {
      id: "ko-ex-28",
      question: 'What does "\uC9C0\uD558\uCCA0" (Jihacheol) mean?',
      options: ["Bus", "Taxi", "Subway", "Train"],
      answerIndex: 2,
      explanation: "\uC9C0\uD558\uCCA0 (Jihacheol) means Subway."
    },
    {
      id: "ko-ex-29",
      question: 'Which season is called "\uACA8\uC6B8" (Gyeoul) in Korean?',
      options: ["Spring", "Summer", "Autumn", "Winter"],
      answerIndex: 3,
      explanation: "\uACA8\uC6B8 (Gyeoul) means Winter; \uBD04 (Bom) is Spring."
    },
    {
      id: "ko-ex-30",
      question: "What is the traditional Korean dish of rice mixed with various vegetables, meat, and red chili paste?",
      options: ["\uAE40\uCE58 (Kimchi)", "\uBE44\uBE54\uBC25 (Bibimbap)", "\uC0BC\uACB9\uC0B4 (Samgyeopsal)", "\uBD88\uACE0\uAE30 (Bulgogi)"],
      answerIndex: 1,
      explanation: '\uBE44\uBE54\uBC25 (Bibimbap) translates literally to "mixed rice".'
    },
    {
      id: "ko-ex-31",
      question: "What does the idiom '\uC2DD\uC740 \uC8FD \uBA39\uAE30' (Sigeun juk meokgi) translate to in English?",
      options: ["Piece of cake", "Spill the beans", "Barking up the wrong tree", "Once in a blue moon"],
      answerIndex: 0,
      explanation: "\uC2DD\uC740 \uC8FD \uBA39\uAE30 literally means 'eating cold porridge', which is the Korean idiom for 'a piece of cake' or 'extremely easy'."
    },
    {
      id: "ko-ex-32",
      question: "What does the slang '\uC2EC\uCFF5' (Simkung) mean?",
      options: ["Heartthrob / Heart skip a beat", "Headache", "Very boring", "Stomachache"],
      answerIndex: 0,
      explanation: "\uC2EC\uCFF5 (Simkung) is a blend of 'simjang' (heart) and 'kung' (thud), meaning heartthrob or making one's heart skip a beat."
    },
    {
      id: "ko-ex-33",
      question: "What is the meaning of the proverb '\uC2DC\uC791\uC774 \uBC18\uC774\uB2E4' (Sijagi banida)?",
      options: ["Starting is half the battle", "A bad workman blames his tools", "Money cannot buy happiness", "Honesty is the best policy"],
      answerIndex: 0,
      explanation: "\uC2DC\uC791\uC774 \uBC18\uC774\uB2E4 translates to 'starting is half', meaning starting a task is already half of the accomplishment."
    },
    {
      id: "ko-ex-34",
      question: "Which proverb highlights that even experts make mistakes by referring to an animal falling from a tree?",
      options: ["\uAE08\uAC15\uC0B0\uB3C4 \uC2DD\uD6C4\uACBD", "\uC6D0\uC22D\uC774\uB3C4 \uB098\uBB34\uC5D0\uC11C \uB5A8\uC5B4\uC9C4\uB2E4", "\uD2F0\uB04C \uBAA8\uC544 \uD0DC\uC0B0", "\uBC31\uC9C0\uC7A5\uB3C4 \uB9DE\uB4E4\uBA74 \uB0AB\uB2E4"],
      answerIndex: 1,
      explanation: "\uC6D0\uC22D\uC774\uB3C4 \uB098\uBB34\uC5D0\uC11C \uB5A8\uC5B4\uC9C4\uB2E4 means 'even monkeys fall from trees', meaning even experts make mistakes."
    },
    {
      id: "ko-ex-35",
      question: "When leaving work before your colleagues, what is the polite phrase to say?",
      options: ["\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo)", "\uC218\uACE0\uD558\uC168\uC2B5\uB2C8\uB2E4 (Sugohashyeosseumnida)", "\uC8C4\uC1A1\uD569\uB2C8\uB2E4 (Joesonghamnida)", "\uAD1C\uCC2E\uC544\uC694 (Gwenchanayo)"],
      answerIndex: 1,
      explanation: "\uC218\uACE0\uD558\uC168\uC2B5\uB2C8\uB2E4 (Sugohashyeosseumnida) means 'Thank you for your hard work/effort'."
    },
    {
      id: "ko-ex-36",
      question: "What does '\uBD80\uC7A5\uB2D8' (Bujangnim) mean in a Korean corporate setting?",
      options: ["Intern", "Department Manager", "CEO", "Client"],
      answerIndex: 1,
      explanation: "\uBD80\uC7A5\uB2D8 (Bujangnim) means Department Manager/Director in Korean workplaces."
    },
    {
      id: "ko-ex-37",
      question: "How do you say 'Please recommend' in Korean?",
      options: ["\uC608\uC57D\uD588\uC2B5\uB2C8\uB2E4 (Yeyakhaesseumnida)", "\uCD94\uCC9C\uD574 \uC8FC\uC138\uC694 (Chucheonhae juseyo)", "\uCCB4\uD06C\uC778 (Chekeuin)", "\uC9C0\uB3C4 (Jido)"],
      answerIndex: 1,
      explanation: "\uCD94\uCC9C\uD574 \uC8FC\uC138\uC694 (Chucheonhae juseyo) means 'Please recommend'."
    },
    {
      id: "ko-ex-38",
      question: "What is the Korean word for 'Tourist attraction'?",
      options: ["\uAD00\uAD11\uC9C0 (Gwangwangji)", "\uBCD1\uC6D0 (Byeongwon)", "\uC57D\uAD6D (Yakguk)", "\uC9C0\uB3C4 (Jido)"],
      answerIndex: 0,
      explanation: "\uAD00\uAD11\uC9C0 (Gwangwangji) means tourist attraction or sightseeing spot."
    },
    {
      id: "ko-ex-39",
      question: "How do you shout 'Help!' in Korean?",
      options: ["\uC544\uD30C\uC694 (Apayo)", "\uB3C4\uC640\uC8FC\uC138\uC694! (Dowajuseyo!)", "\uC548\uB155\uD558\uC138\uC694 (Annyeonghaseyo)", "\uC2E4\uB840\uD569\uB2C8\uB2E4 (Sillyehamnida)"],
      answerIndex: 1,
      explanation: "\uB3C4\uC640\uC8FC\uC138\uC694! (Dowajuseyo!) means 'Help me/please help!'."
    },
    {
      id: "ko-ex-40",
      question: "What does '\uC544\uD30C\uC694' (Apayo) mean in a medical context?",
      options: ["I am hungry", "It hurts / I am sick", "Call the police", "I am lost"],
      answerIndex: 1,
      explanation: "\uC544\uD30C\uC694 (Apayo) means 'it hurts' or 'I am sick/painful'."
    }
  ],
  japanese: [
    {
      id: "ja-ex-01",
      question: "How many base Hiragana characters are there in standard Japanese?",
      options: ["26", "46", "50", "36"],
      answerIndex: 1,
      explanation: "The standard Hiragana syllabary has exactly 46 basic characters."
    },
    {
      id: "ja-ex-02",
      question: "Which Japanese script is primarily used to write foreign loanwords, names, and scientific terms?",
      options: ["Hiragana", "Kanji", "Katakana", "Romaji"],
      answerIndex: 2,
      explanation: "Katakana (\u30AB\u30BF\u30AB\u30CA) is used for loanwords (e.g. coffee, television) and foreign names."
    },
    {
      id: "ja-ex-03",
      question: 'What is the Katakana representation of "Coffee"?',
      options: ["\u304A\u8336 (Ocha)", "\u30B3\u30FC\u30D2\u30FC (Koohii)", "\u30C6\u30EC\u30D3 (Terebi)", "\u30D3\u30FC\u30EB (Biiru)"],
      answerIndex: 1,
      explanation: "\u30B3\u30FC\u30D2\u30FC (Koohii) is the Katakana loanword for Coffee."
    },
    {
      id: "ja-ex-04",
      question: 'What does the Katakana "\u30C6\u30EC\u30D3" (Terebi) mean?',
      options: ["Radio", "Telephone", "Television", "Computer"],
      answerIndex: 2,
      explanation: "\u30C6\u30EC\u30D3 (Terebi) is a shortened loanword meaning Television."
    },
    {
      id: "ja-ex-05",
      question: 'What is the formal way to say "Good morning" in Japanese?',
      options: ["\u3053\u3093\u306B\u3061\u306F (Konnichiwa)", "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059 (Ohayou gozaimasu)", "\u3053\u3093\u3070\u3093\u306F (Konbanwa)", "\u3055\u3088\u3046\u306A\u3089 (Sayounara)"],
      answerIndex: 1,
      explanation: "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059 (Ohayou gozaimasu) is the polite morning greeting."
    },
    {
      id: "ja-ex-06",
      question: 'What is the multi-purpose Japanese greeting "\u3053\u3093\u306B\u3061\u306F" (Konnichiwa) used for?',
      options: ["Good morning", "Hello / Good afternoon", "Good evening", "Goodbye"],
      answerIndex: 1,
      explanation: '\u3053\u3093\u306B\u3061\u306F (Konnichiwa) is used as "Hello" during daylight hours.'
    },
    {
      id: "ja-ex-07",
      question: 'How do you politely say "Thank you very much" in Japanese?',
      options: ["\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059 (Arigatou gozaimasu)", "\u3059\u307F\u307E\u305B\u3093 (Sumimasen)", "\u3069\u3046\u3044\u305F\u3057\u307E\u3057\u3066 (Douitashimashite)", "\u306F\u3058\u3081\u307E\u3057\u3066 (Hajimemashite)"],
      answerIndex: 0,
      explanation: '\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059 (Arigatou gozaimasu) means "Thank you very much".'
    },
    {
      id: "ja-ex-08",
      question: 'What does "\u3059\u307F\u307E\u305B\u3093" (Sumimasen) mean in Japanese?',
      options: ["Hello", "Excuse me / Sorry", "Goodbye", "Good night"],
      answerIndex: 1,
      explanation: 'Sumimasen is used for "Excuse me" (getting attention) or "Sorry" (mild apology).'
    },
    {
      id: "ja-ex-09",
      question: "Which particle marks the topic of a Japanese sentence?",
      options: ["\u306F (wa)", "\u304C (ga)", "\u3092 (o)", "\u306B (ni)"],
      answerIndex: 0,
      explanation: "\u306F (written as ha, pronounced wa) is the topic marker."
    },
    {
      id: "ja-ex-10",
      question: "Which particle marks the direct object of a verb in Japanese?",
      options: ["\u306F (wa)", "\u304C (ga)", "\u3092 (o)", "\u3067 (de)"],
      answerIndex: 2,
      explanation: "\u3092 (written as wo, pronounced o) indicates the direct object."
    },
    {
      id: "ja-ex-11",
      question: 'Which particle indicates the location of an action (i.e. "at" or "in" a place)?',
      options: ["\u306B (ni)", "\u3067 (de)", "\u3078 (he)", "\u306F (wa)"],
      answerIndex: 1,
      explanation: "\u3067 (de) is used to mark the location where an action takes place."
    },
    {
      id: "ja-ex-12",
      question: 'What is the Japanese word for the general counter "One object"?',
      options: ["\u4E00\u4EBA (Hitori)", "\u4E00\u3064 (Hitotsu)", "\u4E00\u672C (Ippon)", "\u4E00\u679A (Ichimai)"],
      answerIndex: 1,
      explanation: "\u4E00\u3064 (Hitotsu) is the general counter for one object."
    },
    {
      id: "ja-ex-13",
      question: "What counter is used when counting people?",
      options: ["\u3064 (tsu)", "\u679A (mai)", "\u4EBA (nin / ri)", "\u672C (hon)"],
      answerIndex: 2,
      explanation: "\u4EBA (nin, or ri for 1 and 2 people) is the counter for humans."
    },
    {
      id: "ja-ex-14",
      question: "Which counter is used for flat, thin items like sheets of paper or tickets?",
      options: ["\u672C (hon)", "\u679A (mai)", "\u53F0 (dai)", "\u500B (ko)"],
      answerIndex: 1,
      explanation: "\u679A (mai) is the counter for flat objects."
    },
    {
      id: "ja-ex-15",
      question: "What phrase do Japanese people say before eating a meal to express gratitude?",
      options: ["\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F (Gochisousamadeshita)", "\u3044\u305F\u3060\u304D\u307E\u3059 (Itadakimasu)", "\u304A\u3044\u3057\u3044\u3067\u3059 (Oishii desu)", "\u3059\u307F\u307E\u305B\u3093 (Sumimasen)"],
      answerIndex: 1,
      explanation: '\u3044\u305F\u3060\u304D\u307E\u3059 (Itadakimasu) means "I humbly receive" and is said before eating.'
    },
    {
      id: "ja-ex-16",
      question: "What is said after finishing a meal to thank the host/chef?",
      options: ["\u3044\u305F\u3060\u304D\u307E\u3059 (Itadakimasu)", "\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F (Gochisousamadeshita)", "\u304A\u3044\u3057\u304B\u3063\u305F\u3067\u3059 (Oishikatta desu)", "\u304A\u4F1A\u8A08\u304A\u9858\u3044\u3057\u307E\u3059 (Okaikei onegaishimasu)"],
      answerIndex: 1,
      explanation: '\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F (Gochisousamadeshita) means "It was a feast / Thank you for the meal".'
    },
    {
      id: "ja-ex-17",
      question: 'What does "\u304A\u3059\u3059\u3081\u306F\u4F55\u3067\u3059\u304B" (Osusume wa nan desu ka) mean?',
      options: ["How much is it?", "What do you recommend?", "Where is the restroom?", "Is this spicy?"],
      answerIndex: 1,
      explanation: "\u304A\u3059\u3059\u3081 (Osusume) means recommendation."
    },
    {
      id: "ja-ex-18",
      question: 'Which Kanji represents "Sun" or "Day"?',
      options: ["\u6708", "\u6C34", "\u706B", "\u65E5"],
      answerIndex: 3,
      explanation: "\u65E5 (Nichi/Hi) is Sun or Day."
    },
    {
      id: "ja-ex-19",
      question: 'Which Kanji represents "Water"?',
      options: ["\u6728", "\u6C34", "\u91D1", "\u571F"],
      answerIndex: 1,
      explanation: "\u6C34 (Mizu/Sui) represents Water."
    },
    {
      id: "ja-ex-20",
      question: 'What is the common business phrase meaning "Thank you for your hard work"?',
      options: ["\u306F\u3058\u3081\u307E\u3057\u3066 (Hajimemashite)", "\u304A\u75B2\u308C\u69D8\u3067\u3059 (Otsukaresama desu)", "\u3059\u307F\u307E\u305B\u3093 (Sumimasen)", "\u5931\u793C\u3057\u307E\u3059 (Shitsurei shimasu)"],
      answerIndex: 1,
      explanation: "\u304A\u75B2\u308C\u69D8\u3067\u3059 (Otsukaresama desu) is the fundamental workplace greeting."
    },
    {
      id: "ja-ex-21",
      question: "Which verb form is used to connect multiple actions in a sequence or make polite requests?",
      options: ["Dictionary form", "Te-form (\u3066\u5F62)", "Masu-form", "Nai-form"],
      answerIndex: 1,
      explanation: 'The te-form (e.g. okite, tabete) connects verbs or links to "kudasai" for requests.'
    },
    {
      id: "ja-ex-22",
      question: 'What does "\u304B\u308F\u3044\u3044" (Kawaii) mean?',
      options: ["Scary", "Cute / Adorable", "Delicious", "Amazing"],
      answerIndex: 1,
      explanation: '\u304B\u308F\u3044\u3044 (Kawaii) translates to "Cute" or "Pretty".'
    },
    {
      id: "ja-ex-23",
      question: 'What does "\u3059\u3054\u3044" (Sugoi) mean?',
      options: ["Terrible", "Cute", "Awesome / Amazing / Great", "Boring"],
      answerIndex: 2,
      explanation: '\u3059\u3054\u3044 (Sugoi) means "Amazing", "Awesome", or "Wow".'
    },
    {
      id: "ja-ex-24",
      question: 'What does "\u4E0A\u53F8" (Jooshi) mean in Japanese work culture?',
      options: ["Colleague", "Boss / Superior", "Client", "Secretary"],
      answerIndex: 1,
      explanation: "\u4E0A\u53F8 (Jooshi) means Boss or Superior."
    },
    {
      id: "ja-ex-25",
      question: 'What does "\u6B8B\u696D" (Zangyou) mean?',
      options: ["Paid leave", "Business trip", "Overtime work", "Retirement"],
      answerIndex: 2,
      explanation: "\u6B8B\u696D (Zangyou) refers to overtime work."
    },
    {
      id: "ja-ex-26",
      question: "What is the Japanese word for cherry blossoms?",
      options: ["\u6674\u308C (Hare)", "\u96E8 (Ame)", "\u6691\u3044 (Atsui)", "\u685C (Sakura)"],
      answerIndex: 3,
      explanation: "\u685C (Sakura) is cherry blossom in Japanese."
    },
    {
      id: "ja-ex-27",
      question: "What is the Japanese word for the hot spring changing room?",
      options: ["\u6E29\u6CC9 (Onsen)", "\u6E6F (Yu)", "\u6D74\u8863 (Yukata)", "\u8131\u8863\u6240 (Datsuijo)"],
      answerIndex: 3,
      explanation: "\u8131\u8863\u6240 (Datsuijo) is the changing room at an Onsen."
    },
    {
      id: "ja-ex-28",
      question: `How is "McDonald's" pronounced in Katakana?`,
      options: ["\u30DE\u30AF\u30C9\u30CA\u30EB\u30C9 (Makudonarudo)", "\u30B3\u30FC\u30D2\u30FC (Koohii)", "\u30C6\u30EC\u30D3 (Terebi)", "\u30D1\u30BD\u30B3\u30F3 (Pasokon)"],
      answerIndex: 0,
      explanation: "\u30DE\u30AF\u30C9\u30CA\u30EB\u30C9 (Makudonarudo) is the Japanese loanword phonetics for McDonald's."
    },
    {
      id: "ja-ex-29",
      question: "What does the general bowing of the head signify in Japan?",
      options: ["Anger", "Respect, greetings, and apologies", "Sleepiness", "Refusal"],
      answerIndex: 1,
      explanation: "Bowing represents respect, greetings, and showing polite apologies/gratitude."
    },
    {
      id: "ja-ex-30",
      question: "Which script represents Chinese characters adapted for Japanese spelling?",
      options: ["Katakana", "Hiragana", "Kanji", "Romaji"],
      answerIndex: 2,
      explanation: "Kanji (\u6F22\u5B57) are the logographic Chinese characters used in Japanese."
    },
    {
      id: "ja-ex-31",
      question: "What does the idiom '\u671D\u98EF\u524D' (Asameshimae) mean?",
      options: ["Before breakfast", "Piece of cake", "Very early", "Eating sushi"],
      answerIndex: 1,
      explanation: "\u671D\u98EF\u524D (Asameshimae) literally means 'before breakfast', which is the idiom for 'a piece of cake' or 'very easy'."
    },
    {
      id: "ja-ex-32",
      question: "Which Japanese expression is used when you are extremely busy and need any help you can get?",
      options: ["\u53E3\u304C\u8EFD\u3044 (Kuchi ga karui)", "\u732B\u306E\u624B\u3082\u501F\u308A\u305F\u3044 (Neko no te mo karitai)", "\u8179\u304C\u7ACB\u3064 (Hara ga tatsu)", "\u76F8\u69CC\u3092\u6253\u3064 (Aiduchi wo utsu)"],
      answerIndex: 1,
      explanation: "\u732B\u306E\u624B\u3082\u501F\u308A\u305F\u3044 literally means 'wanting to borrow even a cat's paw', referring to being extremely busy."
    },
    {
      id: "ja-ex-33",
      question: "What is the meaning of the proverb '\u4E03\u8EE2\u3073\u516B\u8D77\u304D' (Nanakorobi yaoki)?",
      options: ["Fall seven times, stand up eight (resilience)", "Monkeys are good at climbing", "A frog in a well knows nothing", "Every little bit counts"],
      answerIndex: 0,
      explanation: "\u4E03\u8EE2\u3073\u516B\u8D77\u304D means 'falling seven times, standing up eight', which represents resilience and perseverance."
    },
    {
      id: "ja-ex-34",
      question: "What does '\u4E00\u671F\u4E00\u4F1A' (Ichigo ichie) translate to?",
      options: ["Once-in-a-lifetime encounter", "Strawberries are delicious", "A mountain of dust", "A meeting of enemies"],
      answerIndex: 0,
      explanation: "\u4E00\u671F\u4E00\u4F1A (Ichigo ichie) translates to a 'once-in-a-lifetime encounter/experience'."
    },
    {
      id: "ja-ex-35",
      question: "In Japanese business culture, how do you refer to 'our company' humbly?",
      options: ["\u5FA1\u793E (Onsha)", "\u5F0A\u793E (Heisha)", "\u304A\u4E16\u8A71 (Osewa)", "\u627F\u77E5 (Shouchi)"],
      answerIndex: 1,
      explanation: "\u5F0A\u793E (Heisha) is the humble term used to refer to one's own company in Japanese business."
    },
    {
      id: "ja-ex-36",
      question: "What does '\u627F\u77E5\u3044\u305F\u3057\u307E\u3057\u305F' (Shouchi itashimashita) mean in business contexts?",
      options: ["Humbly requesting your favor", "Thank you for your support", "Understood / I have understood", "Excuse me"],
      answerIndex: 2,
      explanation: "\u627F\u77E5\u3044\u305F\u3057\u307E\u3057\u305F (Shouchi itashimashita) is a formal business phrase meaning 'I have understood' or 'Understood'."
    },
    {
      id: "ja-ex-37",
      question: "How do you say 'I have a reservation' in Japanese?",
      options: ["\u5730\u56F3 (Chizu)", "\u304A\u3059\u3059\u3081 (Osusume)", "\u4E88\u7D04\u3057\u3066\u3044\u307E\u3059 (Yoyaku shite imasu)", "\u5207\u7B26 (Kippu)"],
      answerIndex: 2,
      explanation: "\u4E88\u7D04\u3057\u3066\u3044\u307E\u3059 (Yoyaku shite imasu) means 'I have a reservation'."
    },
    {
      id: "ja-ex-38",
      question: "What is the Japanese word for 'Map'?",
      options: ["\u89B3\u5149\u5730 (Kankouchi)", "\u5207\u7B26 (Kippu)", "\u5730\u56F3 (Chizu)", "\u304A\u3059\u3059\u3081 (Osusume)"],
      answerIndex: 2,
      explanation: "\u5730\u56F3 (Chizu) is the Japanese word for map."
    },
    {
      id: "ja-ex-39",
      question: "How do you say 'Help me please!' in Japanese?",
      options: ["\u75DB\u3044\u3067\u3059 (Itai desu)", "\u52A9\u3051\u3066\u304F\u3060\u3055\u3044\uFF01 (Tasukete kudasai!)", "\u6551\u6025\u8ECA (Kyuukyuusha)", "\u75C5\u9662 (Byouin)"],
      answerIndex: 1,
      explanation: "\u52A9\u3051\u3066\u304F\u3060\u3055\u3044\uFF01 (Tasukete kudasai!) means 'Help me, please!'."
    },
    {
      id: "ja-ex-40",
      question: "What does '\u6551\u6025\u8ECA\uB97C\u547C\u3093\u3067\u304F\u3060\u3055\u3044' (Kyuukyuusha wo yonde kudasai) mean?",
      options: ["Where is the hospital?", "Please call an ambulance", "Please bring medicine", "Please take me home"],
      answerIndex: 1,
      explanation: "\u6551\u6025\u8ECA\uB97C\u547C\u3093\u3067\u304F\u3060\u3055\u3044 means 'Please call an ambulance' in Japanese."
    }
  ],
  french: [
    {
      id: "fr-ex-01",
      question: 'What does the French vowel combination "eau" sound like?',
      options: ["/oo/ as in spoon", "/o/ as in oh", "/ow/ as in cow", "/uh/ as in run"],
      answerIndex: 1,
      explanation: '"eau" (and "au") is pronounced as a closed /o/ sound (like the letter "o" in English).'
    },
    {
      id: "fr-ex-02",
      question: "Which vowel sound is nasal in French?",
      options: ["ou", "en / an", "oi", "ai"],
      answerIndex: 1,
      explanation: '"en" and "an" are pronounced as nasalized vowels.'
    },
    {
      id: "fr-ex-03",
      question: 'What is standard French telephone/door greeting meaning "Hello"?',
      options: ["Au revoir", "Bonjour", "Bonsoir", "Enchant\xE9"],
      answerIndex: 1,
      explanation: "Bonjour is standard for Hello/Good day."
    },
    {
      id: "fr-ex-04",
      question: 'Which pronoun represents "you" in formal or plural situations in French?',
      options: ["tu", "il", "vous", "nous"],
      answerIndex: 2,
      explanation: 'vous is the formal singular "you" and the plural "you".'
    },
    {
      id: "fr-ex-05",
      question: 'What does "Enchant\xE9(e)" mean?',
      options: ["Goodbye", "Pleased to meet you", "How are you?", "Thank you"],
      answerIndex: 1,
      explanation: 'Enchant\xE9(e) means "delighted" or "pleased to meet you".'
    },
    {
      id: "fr-ex-06",
      question: 'What is the grammatical gender of the noun "livre" (book)?',
      options: ["Feminine", "Masculine", "Neutral", "Plural only"],
      answerIndex: 1,
      explanation: 'Book is masculine: "le livre" or "un livre".'
    },
    {
      id: "fr-ex-07",
      question: 'What is the grammatical gender of the noun "maison" (house)?',
      options: ["Masculine", "Feminine", "Neutral", "Dynamic"],
      answerIndex: 1,
      explanation: 'House is feminine: "la maison" or "une maison".'
    },
    {
      id: "fr-ex-08",
      question: 'How do you say "I speak" in French present tense?',
      options: ["Je parlons", "Je parle", "Tu parles", "Il parle"],
      answerIndex: 1,
      explanation: 'Je conjugation for -er verbs ends in -e: "Je parle".'
    },
    {
      id: "fr-ex-09",
      question: 'What is the irregular French verb for "to be"?',
      options: ["avoir", "faire", "\xEAtre", "aller"],
      answerIndex: 2,
      explanation: '\xEAtre is "to be"; avoir is "to have".'
    },
    {
      id: "fr-ex-10",
      question: 'How do you say "I have" in French?',
      options: ["Je suis", "J'ai", "Tu as", "Nous avons"],
      answerIndex: 1,
      explanation: "avoir conjugations: J'ai (I have)."
    },
    {
      id: "fr-ex-11",
      question: "How do you politely ask for the check/bill in a French restaurant?",
      options: ["Je voudrais commander", "L'addition, s'il vous pla\xEEt", "La carte, s'il vous pla\xEEt", "Une carafe d'eau"],
      answerIndex: 1,
      explanation: `L'addition means the bill; "L'addition s'il vous pla\xEEt" asks for the bill.`
    },
    {
      id: "fr-ex-12",
      question: `What does "une carafe d'eau" mean?`,
      options: ["A bottle of wine", "A jug of tap water", "A cup of coffee", "A sparkling water"],
      answerIndex: 1,
      explanation: "A carafe d'eau is a jug of tap water, which is free in French restaurants."
    },
    {
      id: "fr-ex-13",
      question: 'What is the feminine form of the adjective "petit" (small)?',
      options: ["petits", "petite", "petites", "petit"],
      answerIndex: 1,
      explanation: 'We add a silent -e to make "petit" feminine: "petite".'
    },
    {
      id: "fr-ex-14",
      question: 'What is the plural form of the masculine adjective "int\xE9ressant" (interesting)?',
      options: ["int\xE9ressante", "int\xE9ressantes", "int\xE9ressants", "int\xE9ressant"],
      answerIndex: 2,
      explanation: 'We add -s to the masculine base: "int\xE9ressants".'
    },
    {
      id: "fr-ex-15",
      question: 'What is the feminine form of the adjective "beau" (beautiful)?',
      options: ["beaux", "belle", "belles", "bon"],
      answerIndex: 1,
      explanation: 'The adjective "beau" has an irregular feminine form: "belle".'
    },
    {
      id: "fr-ex-16",
      question: 'How do you ask "How much does it cost?" in French?',
      options: ["O\xF9 est le magasin?", "Combien \xE7a co\xFBte?", "C'est cher", "Je cherche..."],
      answerIndex: 1,
      explanation: 'Combien \xE7a co\xFBte? translates to "How much does it cost?".'
    },
    {
      id: "fr-ex-17",
      question: 'What does "Je cherche..." mean?',
      options: ["I am buying", "I am looking for...", "I am paying", "I am returning"],
      answerIndex: 1,
      explanation: 'Je cherche means "I am looking for" or "I search".'
    },
    {
      id: "fr-ex-18",
      question: "What is the national motto of France?",
      options: ["Veni, vidi, vici", "Libert\xE9, \xC9galit\xE9, Fraternit\xE9", "Carpe Diem", "E Pluribus Unum"],
      answerIndex: 1,
      explanation: "Libert\xE9, \xC9galit\xE9, Fraternit\xE9 (Liberty, Equality, Fraternity) is the official motto."
    },
    {
      id: "fr-ex-19",
      question: "What is the name of the famous, massive art museum in Paris?",
      options: ["Orsay", "Le Louvre", "Pompidou", "Versailles"],
      answerIndex: 1,
      explanation: "Le Louvre is the world's largest art museum and a historic monument in Paris."
    },
    {
      id: "fr-ex-20",
      question: 'What is the French number "Eighty" (80) literally translated as?',
      options: ["Eighty", "Four twenties (quatre-vingts)", "Sixty-ten", "Eight tens"],
      answerIndex: 1,
      explanation: '80 in French is "quatre-vingts" which literally means "four-twenties" (4 x 20).'
    },
    {
      id: "fr-ex-21",
      question: "Which mood is used in French to express doubt, wishes, necessity, or subjective emotions?",
      options: ["Indicative", "Conditional", "Subjunctive (Subjonctif)", "Imperative"],
      answerIndex: 2,
      explanation: "The Subjunctive mood expresses subjective emotions, desires, doubts, or necessities."
    },
    {
      id: "fr-ex-22",
      question: 'How do you say "It is delicious" in French?',
      options: ["C'est mauvais", "C'est d\xE9licieux!", "C'est cher", "S'il vous pla\xEEt"],
      answerIndex: 1,
      explanation: `C'est d\xE9licieux translates to "It is delicious".`
    },
    {
      id: "fr-ex-23",
      question: "What is the informal cheek kissing greeting in France called?",
      options: ["Le baiser", "La bise", "Liaison", "Salutation"],
      answerIndex: 1,
      explanation: "La bise is the traditional custom of greeting with light cheek touches/kisses."
    },
    {
      id: "fr-ex-24",
      question: 'Which pronoun represents "we" in French?',
      options: ["ils", "je", "vous", "nous"],
      answerIndex: 3,
      explanation: 'nous means "we".'
    },
    {
      id: "fr-ex-25",
      question: 'How do you write "a beautiful day" in French?',
      options: ["un beau jour", "une belle jour", "un bon jour", "un vieux jour"],
      answerIndex: 0,
      explanation: '"jour" is masculine; requires "beau".'
    },
    {
      id: "fr-ex-26",
      question: 'How do you say "It is raining" in French?',
      options: ["Il fait beau", "Il pleut", "Chaud", "Froid"],
      answerIndex: 1,
      explanation: 'Il pleut means "It is raining" in French.'
    },
    {
      id: "fr-ex-27",
      question: "What is the French word for the restaurant bill/check?",
      options: ["Un caf\xE9", "Un croissant", "L'addition", "Terrasse"],
      answerIndex: 2,
      explanation: "L'addition is the restaurant bill in French."
    },
    {
      id: "fr-ex-28",
      question: 'How do you say "Goodbye" in French?',
      options: ["Bonjour", "Bonsoir", "Au revoir", "Merci"],
      answerIndex: 2,
      explanation: 'Au revoir is the standard way to say "Goodbye".'
    },
    {
      id: "fr-ex-29",
      question: "What represents the French word for water?",
      options: ["lait", "vin", "eau", "pain"],
      answerIndex: 2,
      explanation: "eau translates to water."
    },
    {
      id: "fr-ex-30",
      question: 'Which ending represents the regular verb class containing "parler"?',
      options: ["-ir", "-re", "-er", "-oir"],
      answerIndex: 2,
      explanation: "parler is a regular -er verb class."
    },
    {
      id: "fr-ex-31",
      question: "What does the French idiom 'Les doigts dans le nez' translate to in English?",
      options: ["Fingers in the nose", "Piece of cake", "Very dirty", "Never mind"],
      answerIndex: 1,
      explanation: "Les doigts dans le nez literally means 'fingers in the nose', which is the idiom for 'a piece of cake' or 'very easy'."
    },
    {
      id: "fr-ex-32",
      question: "What is the meaning of 'Tomber dans les pommes'?",
      options: ["To fall in the apples", "To eat too much", "To faint", "To be happy"],
      answerIndex: 2,
      explanation: "Tomber dans les pommes literally means 'to fall in the apples', which means to faint."
    },
    {
      id: "fr-ex-33",
      question: "What is the meaning of the proverb 'Petit \xE0 petit, l\\'oiseau fait son nid'?",
      options: ["Little by little, the bird builds its nest", "A bird in the hand is worth two in the bush", "Birds of a feather flock together", "Do not count your chickens"],
      answerIndex: 0,
      explanation: "Petit \xE0 petit, l'oiseau fait son nid means 'little by little, the bird builds its nest', showing that persistence and patience lead to success."
    },
    {
      id: "fr-ex-34",
      question: "Translate 'Mieux vaut tard que jamais'.",
      options: ["Time will tell", "Every cloud has a silver lining", "Better late than never", "Slow and steady wins the race"],
      answerIndex: 2,
      explanation: "Mieux vaut tard que jamais translates to 'better late than never'."
    },
    {
      id: "fr-ex-35",
      question: "In a professional French email, which sign-off means 'Cordial regards' or 'Sincerely'?",
      options: ["Veuillez agr\xE9er", "Cordialement", "Pardon", "Bon app\xE9tit"],
      answerIndex: 1,
      explanation: "Cordialement is a common formal/semi-formal email closing meaning 'Cordial regards' or 'Sincerely'."
    },
    {
      id: "fr-ex-36",
      question: "What does 'Pi\xE8ce jointe' refer to in business emails?",
      options: ["Meeting room", "Contract signature", "Attachment / attached document", "Manager"],
      answerIndex: 2,
      explanation: "Pi\xE8ce jointe is the French term for email attachment or attached document."
    },
    {
      id: "fr-ex-37",
      question: "How do you say 'I have a reservation' in French?",
      options: ["J'ai une r\xE9servation", "O\xF9 est le m\xE9tro?", "Billet de train", "Plan de la ville"],
      answerIndex: 0,
      explanation: "J'ai une r\xE9servation means 'I have a reservation'."
    },
    {
      id: "fr-ex-38",
      question: "What is the French word for 'Train ticket'?",
      options: ["Office de tourisme", "Billet de train", "Plan de la ville", "Recommander"],
      answerIndex: 1,
      explanation: "Billet de train is a train ticket in French."
    },
    {
      id: "fr-ex-39",
      question: "How do you shout 'Help!' in French?",
      options: ["Au secours!", "J'ai mal ici", "H\xF4pital", "Appelez un m\xE9decin"],
      answerIndex: 0,
      explanation: "Au secours! is the standard cry for 'Help!' in French."
    },
    {
      id: "fr-ex-40",
      question: "What does 'J'ai mal ici' mean?",
      options: ["I am lost", "It hurts here", "I need medicine", "Call the doctor"],
      answerIndex: 1,
      explanation: "J'ai mal ici translates to 'It hurts here'."
    }
  ],
  spanish: [
    {
      id: "es-ex-01",
      question: 'How is the double "LL" generally pronounced in standard Spanish?',
      options: ['Like "L"', 'Like "Y" or "J"', 'Like "H"', "It is silent"],
      answerIndex: 1,
      explanation: 'In standard Spanish, "LL" sounds like the English "Y" sound (e.g. calle = kah-yeh).'
    },
    {
      id: "es-ex-02",
      question: 'What sound does the letter "\xF1" make in Spanish?',
      options: ['Like "N"', 'Like "NY" in canyon', 'Like "NG"', 'Like "M"'],
      answerIndex: 1,
      explanation: 'The tilde letter \xF1 represents the palatal nasal sound, similar to "ny" in English.'
    },
    {
      id: "es-ex-03",
      question: 'Is the letter "H" pronounced in Spanish words?',
      options: ["Yes, like English H", "No, it is always silent", "Only at the beginning of words", "Only between vowels"],
      answerIndex: 1,
      explanation: "The letter H is completely silent in Spanish (e.g. hola is pronounced oh-lah)."
    },
    {
      id: "es-ex-04",
      question: 'What is the basic greeting meaning "Hello" in Spanish?',
      options: ["Adi\xF3s", "Hola", "Gracias", "De nada"],
      answerIndex: 1,
      explanation: "Hola is Hello."
    },
    {
      id: "es-ex-05",
      question: 'How do you say "Good morning" in Spanish?',
      options: ["Buenas noches", "Buenas tardes", "Buenos d\xEDas", "Hola"],
      answerIndex: 2,
      explanation: "Buenos d\xEDas is Good morning."
    },
    {
      id: "es-ex-06",
      question: 'Which verb "to be" is used for permanent characteristics, origin, and professions?',
      options: ["estar", "ser", "haber", "tener"],
      answerIndex: 1,
      explanation: "ser is used for DOCTOR (Description, Occupation, Characteristic, Time, Origin, Relation)."
    },
    {
      id: "es-ex-07",
      question: 'Which verb "to be" is used for temporary states, emotions, and geographic location?',
      options: ["ser", "estar", "hacer", "ir"],
      answerIndex: 1,
      explanation: "estar is used for PLACE (Position, Location, Action, Condition, Emotion)."
    },
    {
      id: "es-ex-08",
      question: 'How do you express "I am tired" in Spanish?',
      options: ["Soy cansado", "Estoy cansado", "Tengo cansado", "Hago cansado"],
      answerIndex: 1,
      explanation: 'Tiredness is a temporary condition, so we use estar: "Estoy cansado".'
    },
    {
      id: "es-ex-09",
      question: 'How do you express "I am from Spain" in Spanish?',
      options: ["Estoy de Espa\xF1a", "Soy de Espa\xF1a", "Tengo de Espa\xF1a", "Vivo de Espa\xF1a"],
      answerIndex: 1,
      explanation: 'Origin uses the verb ser: "Soy de Espa\xF1a".'
    },
    {
      id: "es-ex-10",
      question: 'What is the Spanish word for "One" (1)?',
      options: ["dos", "tres", "uno", "cuatro"],
      answerIndex: 2,
      explanation: "uno is 1."
    },
    {
      id: "es-ex-11",
      question: 'What is the Spanish word for "One hundred" (100)?',
      options: ["diez", "cien", "mil", "mill\xF3n"],
      answerIndex: 1,
      explanation: "cien is 100."
    },
    {
      id: "es-ex-12",
      question: 'What is the present tense "Yo" (I) conjugation for the regular verb "hablar" (to speak)?',
      options: ["hablas", "hablo", "habla", "hablan"],
      answerIndex: 1,
      explanation: 'Yo conjugation of hablar is "hablo".'
    },
    {
      id: "es-ex-13",
      question: 'What is the present tense "Yo" (I) conjugation for the regular verb "comer" (to eat)?',
      options: ["comes", "como", "come", "comemos"],
      answerIndex: 1,
      explanation: 'Yo conjugation of comer is "como".'
    },
    {
      id: "es-ex-14",
      question: 'What is the present tense "Yo" (I) conjugation for the regular verb "vivir" (to live)?',
      options: ["vives", "vivo", "vive", "vivimos"],
      answerIndex: 1,
      explanation: 'Yo conjugation of vivir is "vivo".'
    },
    {
      id: "es-ex-15",
      question: "Which Spanish past tense is used for completed actions in the past with a specific time frame?",
      options: ["Imperfect", "Preterite (Pret\xE9rito Indefinido)", "Present Perfect", "Pluperfect"],
      answerIndex: 1,
      explanation: "The Preterite tense is used to describe actions completed at a specific point in the past."
    },
    {
      id: "es-ex-16",
      question: 'How do you say "I spoke" in the preterite tense?',
      options: ["hablaba", "habl\xE9", "hablo", "habl\xE9is"],
      answerIndex: 1,
      explanation: 'Yo preterite conjugation of hablar is "habl\xE9".'
    },
    {
      id: "es-ex-17",
      question: "Approximately how many countries have Spanish as their official language?",
      options: ["5", "10", "Over 20", "Over 50"],
      answerIndex: 2,
      explanation: "Spanish is the official language of 21 countries across Europe, Africa, and the Americas."
    },
    {
      id: "es-ex-18",
      question: 'What is the Spanish word for "Doctor" or "Physician"?',
      options: ["m\xE9dico / doctor", "maestro", "abogado", "ingeniero"],
      answerIndex: 0,
      explanation: "m\xE9dico or doctor is the word for physician."
    },
    {
      id: "es-ex-19",
      question: 'What is the Spanish word for the body part "Head"?',
      options: ["brazo", "cabeza", "pierna", "mano"],
      answerIndex: 1,
      explanation: "cabeza means head."
    },
    {
      id: "es-ex-20",
      question: "Which mood is triggered in Spanish by verbs of doubt, desire, emotion, or recommendation in a dependent clause?",
      options: ["Indicativo", "Subjuntivo (Subjunctive)", "Imperativo", "Condicional"],
      answerIndex: 1,
      explanation: "The Subjunctive mood expresses uncertainty, desire, emotion, and hypothetical scenarios."
    },
    {
      id: "es-ex-21",
      question: 'What is the meaning of the common Spanish idiom "tomar el pelo"?',
      options: ["To wash hair", "To pull someone's leg / tease", "To cut hair", "To have a headache"],
      answerIndex: 1,
      explanation: `"tomar el pelo" means to tease or pull someone's leg.`
    },
    {
      id: "es-ex-22",
      question: "How do you politely ask for the check at a Spanish restaurant?",
      options: ["La cuenta, por favor", "Hola, quiero comer", "Gracias por la comida", "Adi\xF3s, me voy"],
      answerIndex: 0,
      explanation: '"La cuenta, por favor" translates to "The bill/check, please".'
    },
    {
      id: "es-ex-23",
      question: 'What is the Spanish word for "Friend"?',
      options: ["enemigo", "amigo", "hermano", "padre"],
      answerIndex: 1,
      explanation: "amigo is Friend."
    },
    {
      id: "es-ex-24",
      question: 'How do you say "Thank you" in Spanish?',
      options: ["Hola", "Adi\xF3s", "Gracias", "Por favor"],
      answerIndex: 2,
      explanation: "Gracias is Thank you."
    },
    {
      id: "es-ex-25",
      question: 'How do you say "Goodbye" in Spanish?',
      options: ["Adi\xF3s", "Hola", "Por favor", "Buenos d\xEDas"],
      answerIndex: 0,
      explanation: "Adi\xF3s is Goodbye."
    },
    {
      id: "es-ex-26",
      question: 'How do you say "It is hot" in Spanish?',
      options: ["Hace fr\xEDo", "Llueve", "Hace calor", "Hace buen tiempo"],
      answerIndex: 2,
      explanation: 'Hace calor means "It is hot" in Spanish.'
    },
    {
      id: "es-ex-27",
      question: "What are the small sharing plates of food called in Spain?",
      options: ["Una raci\xF3n", "Una tapa", "Jam\xF3n ib\xE9rico", "Patatas bravas"],
      answerIndex: 1,
      explanation: "Una tapa (or tapas) are the famous small sharing plates of food in Spain."
    },
    {
      id: "es-ex-28",
      question: 'What represents the number "two" in Spanish?',
      options: ["uno", "dos", "tres", "cuatro"],
      answerIndex: 1,
      explanation: "dos is 2."
    },
    {
      id: "es-ex-29",
      question: 'What is the translation of "cabeza"?',
      options: ["arm", "leg", "head", "hand"],
      answerIndex: 2,
      explanation: "cabeza is head."
    },
    {
      id: "es-ex-30",
      question: 'How do you conjugate "comer" in present tense for "yo" (I)?',
      options: ["como", "comes", "come", "comemos"],
      answerIndex: 0,
      explanation: "Yo conjugation of comer is como."
    },
    {
      id: "es-ex-31",
      question: "What does the Spanish idiom 'Pan comido' translate to in English?",
      options: ["Eaten bread", "Piece of cake", "Very poor", "Never mind"],
      answerIndex: 1,
      explanation: "Pan comido literally means 'eaten bread', which is the idiom for 'a piece of cake' or 'extremely easy'."
    },
    {
      id: "es-ex-32",
      question: "What does 'Ponerse las pilas' mean?",
      options: ["To buy batteries", "To get organized / work hard", "To go to sleep", "To be angry"],
      answerIndex: 1,
      explanation: "Ponerse las pilas literally means 'to put in the batteries', meaning to get organized or work hard."
    },
    {
      id: "es-ex-33",
      question: "What is the meaning of the proverb 'A mal tiempo, buena cara'?",
      options: ["In bad times, stay positive", "Time heals all wounds", "Better safe than sorry", "Every dog has its day"],
      answerIndex: 0,
      explanation: "A mal tiempo, buena cara means 'to bad weather, a good face', encouraging a positive attitude during difficult times."
    },
    {
      id: "es-ex-34",
      question: "Translate 'M\xE1s vale tarde que nunca'.",
      options: ["Better late than never", "Slow and steady", "Like father like son", "Out of sight, out of mind"],
      answerIndex: 0,
      explanation: "M\xE1s vale tarde que nunca translates to 'better late than never'."
    },
    {
      id: "es-ex-35",
      question: "In formal business Spanish emails, which sign-off means 'Sincerely' or 'Yours faithfully'?",
      options: ["Atentamente", "Estimado", "Adjunto", "Gracias"],
      answerIndex: 0,
      explanation: "Atentamente is a standard professional Spanish sign-off for emails and letters."
    },
    {
      id: "es-ex-36",
      question: "What does 'Quedo a su disposici\xF3n' mean?",
      options: ["I remain at your disposal", "I am leaving now", "Please sign the contract", "I attach the document"],
      answerIndex: 0,
      explanation: "Quedo a su disposici\xF3n means 'I remain at your disposal' or 'I am at your service'."
    },
    {
      id: "es-ex-37",
      question: "How do you say 'I have a reservation' in Spanish?",
      options: ["Tengo una reserva", "\xBFD\xF3nde est\xE1 la parada?", "Boleto por favor", "Mapa de la ciudad"],
      answerIndex: 0,
      explanation: "Tengo una reserva means 'I have a reservation' in Spanish."
    },
    {
      id: "es-ex-38",
      question: "What is the Spanish word for 'Ticket'?",
      options: ["Atracci\xF3n", "Boleto / Billete", "Mapa", "Reserva"],
      answerIndex: 1,
      explanation: "Boleto or Billete means ticket in Spanish."
    },
    {
      id: "es-ex-39",
      question: "How do you shout 'Help!' in Spanish?",
      options: ["\xA1Ayuda! / \xA1Auxilio!", "Farmacia", "Hospital", "Me duele aqu\xED"],
      answerIndex: 0,
      explanation: "\xA1Ayuda! or \xA1Auxilio! means 'Help!' in Spanish."
    },
    {
      id: "es-ex-40",
      question: "What does 'Me duele aqu\xED' mean?",
      options: ["I am lost", "It hurts here", "Call a doctor", "Give me medicine"],
      answerIndex: 1,
      explanation: "Me duele aqu\xED translates to 'It hurts here'."
    }
  ],
  chinese: [
    {
      id: "zh-ex-01",
      question: "How many main spoken tones are there in standard Mandarin Chinese?",
      options: ["3 tones", "4 tones plus a neutral tone", "5 spoken tones plus high tone", "6 distinct tones"],
      answerIndex: 1,
      explanation: "Mandarin has 4 main tones (flat, rising, falling-rising, falling) and one neutral tone."
    },
    {
      id: "zh-ex-02",
      question: "What is the name of the official Romanization system used to write Chinese characters phonetically?",
      options: ["Hanyu Pinyin", "Hanja", "Kanji", "Romaji"],
      answerIndex: 0,
      explanation: "Pinyin (\u62FC\u97F3) is the standardized system of Romanized Chinese pronunciation."
    },
    {
      id: "zh-ex-03",
      question: 'How do you write the basic greeting "Hello" in Chinese Pinyin?',
      options: ["Xi\xE8xie", "N\u01D0 h\u01CEo", "Z\xE0iji\xE0n", "M\u011Bil\xEC"],
      answerIndex: 1,
      explanation: "N\u01D0 h\u01CEo (\u4F60\u597D) translates to Hello."
    },
    {
      id: "zh-ex-04",
      question: 'How do you say "Thank you" in Mandarin Chinese?',
      options: ["N\u01D0 h\u01CEo", "Xi\xE8xie", "Z\xE0iji\xE0n", "B\xF9 k\xE8qi"],
      answerIndex: 1,
      explanation: "Xi\xE8xie (\u8C22\u8C22) means Thank you."
    },
    {
      id: "zh-ex-05",
      question: 'What is the correct flat, first tone for the pinyin syllable "ma" when it means "Mother"?',
      options: ["m\u0101", "m\xE1", "m\u01CE", "m\xE0"],
      answerIndex: 0,
      explanation: "m\u0101 (first tone) is Mother; m\xE1 is hemp; m\u01CE is horse; m\xE0 is scold."
    },
    {
      id: "zh-ex-06",
      question: "What are the semantic building blocks of Chinese characters called?",
      options: ["Pinyin initials", "Strokes", "Radicals (\u90E8\u9996)", "Tones"],
      answerIndex: 2,
      explanation: "Radicals indicate the general meaning category of a Chinese character."
    },
    {
      id: "zh-ex-07",
      question: 'Which radical representing "Water" is commonly written as three dots (\u6C35) on the left side of a character?',
      options: ["\u706B (Fire)", "\u4EBA (Person)", "\u6C35(Water)", "\u6728 (Wood)"],
      answerIndex: 2,
      explanation: "The three-dots radical (\u6C35) represents water (e.g. in river, lake)."
    },
    {
      id: "zh-ex-08",
      question: 'What does the radical "\u706B" represent?',
      options: ["Water", "Wood", "Fire", "Metal"],
      answerIndex: 2,
      explanation: "\u706B (hu\u01D2) represents Fire."
    },
    {
      id: "zh-ex-09",
      question: 'What does the radical "\u4EBA" represent?',
      options: ["Mouth", "Person / Human", "Earth", "Sun"],
      answerIndex: 1,
      explanation: "\u4EBA (r\xE9n) represents Person or Human."
    },
    {
      id: "zh-ex-10",
      question: 'What is the Mandarin word for the number "One" (1)?',
      options: ["y\u012B (\u4E00)", "\xE8r (\u4E8C)", "s\u0101n (\u4E09)", "sh\xED (\u5341)"],
      answerIndex: 0,
      explanation: "y\u012B is one."
    },
    {
      id: "zh-ex-11",
      question: 'What is the Mandarin word for the number "Ten" (10)?',
      options: ["\xE8r (\u4E8C)", "sh\xED (\u5341)", "b\u01CEi (\u767E)", "y\u012B (\u4E00)"],
      answerIndex: 1,
      explanation: "sh\xED is ten."
    },
    {
      id: "zh-ex-12",
      question: 'What is the Mandarin word for "Hundred" (100)?',
      options: ["sh\xED (\u5341)", "b\u01CEi (\u767E)", "qi\u0101n (\u5343)", "w\xE0n (\u4E07)"],
      answerIndex: 1,
      explanation: "b\u01CEi means hundred."
    },
    {
      id: "zh-ex-13",
      question: 'How do you say the date "January 1st" in Chinese?',
      options: ["y\u012B yu\xE8 y\u012B r\xEC (\u4E00\u6708\u4E00\u65E5)", "sh\xED yu\xE8 y\u012B r\xEC", "\xE8r yu\xE8 \xE8r r\xEC", "y\u012B ni\xE1n y\u012B yu\xE8"],
      answerIndex: 0,
      explanation: "Dates follow the order: Year + Month (yu\xE8) + Day (r\xEC/h\xE0o). So Jan 1st is y\u012B yu\xE8 y\u012B r\xEC."
    },
    {
      id: "zh-ex-14",
      question: 'What is the Chinese word for "Today"?',
      options: ["m\xEDngti\u0101n", "j\u012Bnti\u0101n (\u4ECA\u5929)", "zu\xF3ti\u0101n", "qi\xE1nti\u0101n"],
      answerIndex: 1,
      explanation: "j\u012Bnti\u0101n means today; m\xEDngti\u0101n means tomorrow."
    },
    {
      id: "zh-ex-15",
      question: "What is the basic sentence word order of Mandarin Chinese?",
      options: ["Subject-Object-Verb (SOV)", "Subject-Verb-Object (SVO)", "Verb-Subject-Object (VSO)", "Object-Subject-Verb (OSV)"],
      answerIndex: 1,
      explanation: "Chinese follows the Subject-Verb-Object (SVO) order, similar to English."
    },
    {
      id: "zh-ex-16",
      question: "What grammatical category is required in Chinese when counting nouns (acting as classifiers)?",
      options: ["Particles", "Measure Words (\u91CF\u8BCD)", "Auxiliary verbs", "Conjunctions"],
      answerIndex: 1,
      explanation: "Chinese requires measure words (\u91CF\u8BCD) between a number and a noun."
    },
    {
      id: "zh-ex-17",
      question: "What is the most common, general measure word used in Chinese?",
      options: ["g\xE8 (\u4E2A)", "b\u011Bn (\u672C)", "zh\u012B (\u53EA)", "ji\u0101n (\u95F4)"],
      answerIndex: 0,
      explanation: "g\xE8 (\u4E2A) is the most widely used general measure word."
    },
    {
      id: "zh-ex-18",
      question: "Which measure word is specifically used for books or bound documents?",
      options: ["g\xE8 (\u4E2A)", "b\u011Bn (\u672C)", "zh\u012B (\u53EA)", "ti\xE1o (\u6761)"],
      answerIndex: 1,
      explanation: "b\u011Bn (\u672C) is the classifier for books (e.g. y\u012B b\u011Bn sh\u016B = one book)."
    },
    {
      id: "zh-ex-19",
      question: 'How do you say "This" in Mandarin?',
      options: ["zh\xE8 (\u8FD9)", "n\xE0 (\u90A3)", "sh\xED (\u5341)", "y\u012B (\u4E00)"],
      answerIndex: 0,
      explanation: "zh\xE8 means this; n\xE0 means that."
    },
    {
      id: "zh-ex-20",
      question: 'How do you say "That" in Mandarin?',
      options: ["zh\xE8 (\u8FD9)", "n\xE0 (\u90A3)", "g\xE8 (\u4E2A)", "sh\xED (\u5341)"],
      answerIndex: 1,
      explanation: "n\xE0 means that."
    },
    {
      id: "zh-ex-21",
      question: "What are the red envelopes containing money given during Chinese New Year called?",
      options: ["Ji\u01CEozi", "H\xF3ngb\u0101o (\u7EA2\u5305)", "Ch\xE1", "Ch\u016Bn\u8282"],
      answerIndex: 1,
      explanation: "h\xF3ngb\u0101o (\u7EA2\u5305) are red packets containing gift money."
    },
    {
      id: "zh-ex-22",
      question: "What is the Chinese New Year festival officially known as?",
      options: ["Lantern Festival", "Spring Festival (\u6625\u8282)", "Mid-Autumn Festival", "Dragon Boat Festival"],
      answerIndex: 1,
      explanation: "Chinese New Year is officially called the Spring Festival (\u6625\u8282 Ch\u016Bnji\xE9)."
    },
    {
      id: "zh-ex-23",
      question: "What is the Chinese word for traditional dumplings?",
      options: ["ji\u01CEozi (\u997A\u5B50)", "b\u0101ozi", "mi\xE0nti\xE1o", "m\u01D0f\xE0n"],
      answerIndex: 0,
      explanation: "ji\u01CEozi represents dumplings, traditionally eaten during Spring Festival."
    },
    {
      id: "zh-ex-24",
      question: 'What is the Chinese word for "Tea"?',
      options: ["k\u0101f\u0113i", "ch\xE1 (\u8336)", "sh\u01D4i", "ji\u01D4"],
      answerIndex: 1,
      explanation: "ch\xE1 is tea."
    },
    {
      id: "zh-ex-25",
      question: 'How do you ask "How much money?" in a Chinese market?',
      options: ["du\u014Dsh\u01CEo qi\xE1n? (\u591A\u5C11\u94B1)", "t\xE0i gu\xEC le", "pi\xE1nyi y\u012Bdi\u01CEn", "m\u01CEid\u0101n"],
      answerIndex: 0,
      explanation: "du\u014Dsh\u01CEo (how much) + qi\xE1n (money) asks for the price."
    },
    {
      id: "zh-ex-26",
      question: 'What is the Chinese word for "To rain"?',
      options: ["\u6674\u5929 (Q\xEDngti\u0101n)", "\u4E0B\u96E8 (Xi\xE0 y\u01D4)", "\u70ED (R\xE8)", "\u51B7 (L\u011Bng)"],
      answerIndex: 1,
      explanation: '\u4E0B\u96E8 (Xi\xE0 y\u01D4) is "to rain" in Chinese.'
    },
    {
      id: "zh-ex-27",
      question: 'What is the Chinese word for "Tea"?',
      options: ["\u8336 (Ch\xE1)", "\u7EFF\u8336 (L\u01DCch\xE1)", "\u6CE1\u8336 (P\xE0o ch\xE1)", "\u8C22\u8C22 (Xi\xE8xi\xE8)"],
      answerIndex: 0,
      explanation: "\u8336 (Ch\xE1) is tea in Chinese."
    },
    {
      id: "zh-ex-28",
      question: "How do you call for the check/bill in a restaurant in China?",
      options: ["m\u01CEid\u0101n (\u4E70\u5355)", "hu\u0101ny\xEDng", "xi\xE8xie", "n\u01D0 h\u01CEo"],
      answerIndex: 0,
      explanation: "m\u01CEid\u0101n is the phrase used to ask for the bill."
    },
    {
      id: "zh-ex-29",
      question: 'How do you say "Welcome" in Mandarin?',
      options: ["hu\u0101ny\xEDng (\u6B22\u8FCE)", "z\xE0iji\xE0n", "xie xie", "b\xF9 k\xE8qi"],
      answerIndex: 0,
      explanation: "hu\u0101ny\xEDng translates to Welcome."
    },
    {
      id: "zh-ex-30",
      question: 'What does the wood radical "\u6728" represent?',
      options: ["Water", "Fire", "Wood / Tree", "Metal"],
      answerIndex: 2,
      explanation: "\u6728 (m\xF9) represents wood or tree."
    },
    {
      id: "zh-ex-31",
      question: "What does the Chengyu '\u9A6C\u9A6C\u864E\u864E' (M\u01CEmah\u01D4h\u01D4) mean?",
      options: ["So-so / Careless", "Very busy", "Extremely angry", "Fast as a horse"],
      answerIndex: 0,
      explanation: "\u9A6C\u9A6C\u864E\u864E (M\u01CEmah\u01D4h\u01D4) literally means 'horse horse tiger tiger', meaning 'so-so' or 'careless'."
    },
    {
      id: "zh-ex-32",
      question: "Which Chengyu translates to 'drawing legs on a snake' (overdoing it)?",
      options: ["\u4E03\u4E0A\u516B\u4E0B", "\u5BF9\u725B\u5F39\u7434", "\u753B\u86C7\u6DFB\u8DB3", "\u4E71\u4E03\u516B\u7CDF"],
      answerIndex: 2,
      explanation: "\u753B\u86C7\u6DFB\u8DB3 (Hu\xE0sh\xE9ti\u0101nz\xFA) literally means 'draw legs on a snake', which means overdoing something or ruining it by adding unnecessary details."
    },
    {
      id: "zh-ex-33",
      question: "What is the meaning of the proverb '\u5931\u8D25\u662F\u6210\u529F\u4E4B\u6BCD' (Sh\u012Bb\xE0i sh\xEC ch\xE9ngg\u014Dng zh\u012B m\u01D4)?",
      options: ["Failure is the mother of success", "Time will tell", "Patience is a virtue", "Rome wasn't built in a day"],
      answerIndex: 0,
      explanation: "\u5931\u8D25\u662F\u6210\u529F\u4E4B\u6BCD means 'failure is the mother of success', emphasizing that we learn from failures to achieve success."
    },
    {
      id: "zh-ex-34",
      question: "Translate '\u5165\u4E61\u968F\u4FD7' (R\xF9xi\u0101ngsu\xEDs\xFA).",
      options: ["Failure is success", "Rome wasn't built in a day", "When in Rome, do as the Romans do", "A journey of a thousand miles"],
      answerIndex: 2,
      explanation: "\u5165\u4E61\u968F\u4FD7 (R\xF9xi\u0101ngsu\xEDs\xFA) means 'enter village, follow customs', which is the Chinese equivalent of 'When in Rome, do as the Romans do'."
    },
    {
      id: "zh-ex-35",
      question: "In Chinese business communication, how do you politely refer to 'your company'?",
      options: ["\u8D35\u516C\u53F8 (Gu\xEC g\u014Dngs\u012B)", "\u7ECF\u7406 (J\u012Bngl\u01D0)", "\u5408\u4F5C (H\xE9zu\xF2)", "\u9644\u4EF6 (F\xF9ji\xE0n)"],
      answerIndex: 0,
      explanation: "\u8D35\u516C\u53F8 (Gu\xEC g\u014Dngs\u012B) is the polite formal term for 'your company' in Chinese business."
    },
    {
      id: "zh-ex-36",
      question: "What does '\u8BF7\u67E5\u6536\u9644\u4EF6' (Q\u01D0ng ch\xE1sh\u014Du f\xF9ji\xE0n) mean in business emails?",
      options: ["Please check the attachment", "I look forward to working with you", "Please sign the agreement", "Where is the manager?"],
      answerIndex: 0,
      explanation: "\u8BF7\u67E5\u6536\u9644\u4EF6 (Q\u01D0ng ch\xE1sh\u014Du f\xF9ji\xE0n) means 'Please find/check the attachment'."
    },
    {
      id: "zh-ex-37",
      question: "How do you say 'I booked a room' in Chinese?",
      options: ["\u6211\u9884\u8BA2\u4E86\u623F\u95F4 (W\u01D2 y\xF9d\xECng le f\xE1ngji\u0101n)", "\u6211\u8981\u4E70\u7968 (W\u01D2 y\xE0o m\u01CEi pi\xE0o)", "\u5730\u94C1\u7AD9\u5728\u54EA\u91CC?", "\u63A8\u8350 (Tu\u012Bji\xE0n)"],
      answerIndex: 0,
      explanation: "\u6211\u9884\u8BA2\u4E86\u623F\u95F4 (W\u01D2 y\xF9d\xECng le f\xE1ngji\u0101n) means 'I have booked/reserved a room'."
    },
    {
      id: "zh-ex-38",
      question: "What is the Chinese word for 'Map'?",
      options: ["\u95E8\u7968 (M\xE9npi\xE0o)", "\u5730\u56FE (D\xECt\xFA)", "\u623F\u95F4 (F\xE1ngji\u0101n)", "\u666F\u70B9 (J\u01D0ngdi\u01CEn)"],
      answerIndex: 1,
      explanation: "\u5730\u56FE (D\xECt\xFA) is the Chinese word for map."
    },
    {
      id: "zh-ex-39",
      question: "How do you shout 'Help!' in Chinese?",
      options: ["\u6551\u547D\uFF01 (Ji\xF9m\xECng!)", "\u8BF7\u53EB\u533B\u751F (Q\u01D0ng ji\xE0o y\u012Bsh\u0113ng)", "\u6211\u8FD9\u91CC\u75BC (W\u01D2 zh\xE8l\u01D0 t\xE9ng)", "\u533B\u9662 (Y\u012Byu\xE0n)"],
      answerIndex: 0,
      explanation: "\u6551\u547D\uFF01 (Ji\xF9m\xECng!) is the urgent cry for 'Help!' or 'Save life!' in Chinese."
    },
    {
      id: "zh-ex-40",
      question: "What does '\u6211\u8FD9\u91CC\u75BC' (W\u01D2 zh\xE8l\u01D0 t\xE9ng) mean?",
      options: ["I am lost", "It hurts here", "Call the doctor", "I need medicine"],
      answerIndex: 1,
      explanation: "\u6211\u8FD9\u91CC\u75BC (W\u01D2 zh\xE8l\u01D0 t\xE9ng) translates to 'It hurts here' in Chinese."
    }
  ],
  vietnamese: [
    {
      id: "vi-ex-01",
      question: "How many spoken tones are there in the Vietnamese language?",
      options: ["4 tones", "5 tones", "6 tones", "8 tones"],
      answerIndex: 2,
      explanation: "Vietnamese is a highly tonal language with exactly 6 tones."
    },
    {
      id: "vi-ex-02",
      question: "What is the name of the Latin-based script used for modern written Vietnamese?",
      options: ["Ch\u1EEF N\xF4m", "Ch\u1EEF Qu\u1ED1c Ng\u1EEF", "H\xE1n t\u1EF1", "Romaji"],
      answerIndex: 1,
      explanation: "Ch\u1EEF Qu\u1ED1c Ng\u1EEF is the Latin script with diacritics created by missionaries and popularized in the 20th century."
    },
    {
      id: "vi-ex-03",
      question: 'What is the standard, polite way to say "Hello" in Vietnamese?',
      options: ["T\u1EA1m bi\u1EC7t", "Xin ch\xE0o", "C\xE1m \u01A1n", "Kh\xF4ng c\xF3 g\xEC"],
      answerIndex: 1,
      explanation: "Xin ch\xE0o is the general greeting for Hello."
    },
    {
      id: "vi-ex-04",
      question: 'How do you say "Thank you" in Vietnamese?',
      options: ["Xin ch\xE0o", "C\xE1m \u01A1n", "Xin l\u1ED7i", "Kh\xF4ng c\xF3 g\xEC"],
      answerIndex: 1,
      explanation: "C\xE1m \u01A1n translates to Thank you."
    },
    {
      id: "vi-ex-05",
      question: `What is the Vietnamese phrase for "You're welcome" or "No problem"?`,
      options: ["Xin ch\xE0o", "C\xE1m \u01A1n", "Kh\xF4ng c\xF3 g\xEC", "T\u1EA1m bi\u1EC7t"],
      answerIndex: 2,
      explanation: `Kh\xF4ng c\xF3 g\xEC literally means "Nothing at all" or "You're welcome".`
    },
    {
      id: "vi-ex-06",
      question: "What is the famous national Vietnamese noodle soup?",
      options: ["Ph\u1EDF", "B\xE1nh m\xEC", "C\xE0 ph\xEA", "B\xFAn ch\u1EA3"],
      answerIndex: 0,
      explanation: "Ph\u1EDF is the famous Vietnamese noodle soup served with beef (ph\u1EDF b\xF2) or chicken (ph\u1EDF g\xE0)."
    },
    {
      id: "vi-ex-07",
      question: 'What does "B\xE1nh m\xEC" mean?',
      options: ["Noodle salad", "Vietnamese sandwich / bread", "Spring roll", "Rice cake"],
      answerIndex: 1,
      explanation: "B\xE1nh m\xEC is the iconic Vietnamese baguette sandwich."
    },
    {
      id: "vi-ex-08",
      question: "What is the Vietnamese word for Coffee?",
      options: ["Tr\xE0", "C\xE0 ph\xEA", "N\u01B0\u1EDBc", "S\u1EEFa"],
      answerIndex: 1,
      explanation: "C\xE0 ph\xEA is Coffee."
    },
    {
      id: "vi-ex-09",
      question: "How do you politely call a server younger than you in a Vietnamese restaurant?",
      options: ["Em \u01A1i!", "Anh \u01A1i!", "Ch\u1ECB \u01A1i!", "B\u1EA1n \u01A1i!"],
      answerIndex: 0,
      explanation: "Em \u01A1i is used to call servers who are younger (male or female)."
    },
    {
      id: "vi-ex-10",
      question: 'What is the Vietnamese word for the number "One" (1)?',
      options: ["hai", "ba", "m\u1ED9t", "m\u01B0\u1EDDi"],
      answerIndex: 2,
      explanation: "m\u1ED9t is 1."
    },
    {
      id: "vi-ex-11",
      question: 'What is the Vietnamese word for the number "Ten" (10)?',
      options: ["m\u1ED9t", "m\u01B0\u1EDDi", "tr\u0103m", "hai"],
      answerIndex: 1,
      explanation: "m\u01B0\u1EDDi is 10."
    },
    {
      id: "vi-ex-12",
      question: 'What is the Vietnamese word for "Hundred" (100)?',
      options: ["m\u01B0\u1EDDi", "tr\u0103m", "ng\xE0n", "tri\u1EC7u"],
      answerIndex: 1,
      explanation: "tr\u0103m is hundred."
    },
    {
      id: "vi-ex-13",
      question: "What is the basic word order of a Vietnamese sentence?",
      options: ["Subject-Object-Verb (SOV)", "Subject-Verb-Object (SVO)", "Verb-Subject-Object (VSO)", "Object-Subject-Verb (OSV)"],
      answerIndex: 1,
      explanation: "Like English, Vietnamese sentences follow the SVO structure."
    },
    {
      id: "vi-ex-14",
      question: "What is the Vietnamese word for Student?",
      options: ["H\u1ECDc sinh / Sinh vi\xEAn", "Gi\xE1o vi\xEAn", "B\xE1c s\u0129", "K\u1EF9 s\u01B0"],
      answerIndex: 0,
      explanation: "H\u1ECDc sinh (school student) or Sinh vi\xEAn (university student) means student."
    },
    {
      id: "vi-ex-15",
      question: "What is the major Vietnamese Lunar New Year festival called?",
      options: ["T\u1EBFt (T\u1EBFt Nguy\xEAn \u0110\xE1n)", "Trung Thu", "L\u1EC5 Ph\u1EADt \u0110\u1EA3n", "Gi\xE1ng Sinh"],
      answerIndex: 0,
      explanation: "T\u1EBFt is the most important national holiday celebrating the Lunar New Year."
    },
    {
      id: "vi-ex-16",
      question: 'What is the Vietnamese word for "Market"?',
      options: ["Ch\xF9a", "Ch\u1EE3", "Nh\xE0", "\u0110\u01B0\u1EDDng"],
      answerIndex: 1,
      explanation: "Ch\u1EE3 translates to Market."
    },
    {
      id: "vi-ex-17",
      question: 'How do you ask "How much money?" / "How much does it cost?" in Vietnamese?',
      options: ["Bao nhi\xEAu ti\u1EC1n?", "\u0110\u1EAFt qu\xE1!", "Gi\u1EA3m gi\xE1 \u0111i!", "C\xE1i n\xE0y g\xEC?"],
      answerIndex: 0,
      explanation: "Bao nhi\xEAu (how much) + ti\u1EC1n (money) is the question for cost."
    },
    {
      id: "vi-ex-18",
      question: 'How do you say "Too expensive!" in Vietnamese?',
      options: ["R\u1EBB qu\xE1!", "Bao nhi\xEAu ti\u1EC1n", "\u0110\u1EAFt qu\xE1! / M\u1EAFc qu\xE1!", "Kh\xF4ng mua"],
      answerIndex: 2,
      explanation: '\u0110\u1EAFt qu\xE1 or M\u1EAFc qu\xE1 translates to "Too expensive!".'
    },
    {
      id: "vi-ex-19",
      question: 'How do you ask for a discount ("Reduce price please") in Vietnamese?',
      options: ["B\u1EDBt \u0111i / Gi\u1EA3m gi\xE1 \u0111i!", "Bao nhi\xEAu", "\u0110\u1EAFt qu\xE1", "C\xE1m \u01A1n"],
      answerIndex: 0,
      explanation: "B\u1EDBt \u0111i or Gi\u1EA3m gi\xE1 \u0111i asks the merchant to lower the price."
    },
    {
      id: "vi-ex-20",
      question: "Which noun classifier is used in Vietnamese for most animals?",
      options: ["c\xE1i", "ng\u01B0\u1EDDi", "con", "qu\u1EA3"],
      answerIndex: 2,
      explanation: "con is the classifier for animals (e.g. con ch\xF3 = the dog)."
    },
    {
      id: "vi-ex-21",
      question: "Which noun classifier is used for inanimate physical objects?",
      options: ["con", "c\xE1i", "ng\u01B0\u1EDDi", "cu\u1ED1n"],
      answerIndex: 1,
      explanation: "c\xE1i is the general classifier for inanimate objects (e.g. c\xE1i b\xE0n = the table)."
    },
    {
      id: "vi-ex-22",
      question: "Which classifier is used for people or professions?",
      options: ["c\xE1i", "con", "ng\u01B0\u1EDDi", "t\u1EDD"],
      answerIndex: 2,
      explanation: "ng\u01B0\u1EDDi is the classifier for humans (e.g. ng\u01B0\u1EDDi h\u1ECDc sinh = the student)."
    },
    {
      id: "vi-ex-23",
      question: 'What does "\u0111i th\u1EB3ng" mean?',
      options: ["Turn left", "Turn right", "Go straight", "Stop"],
      answerIndex: 2,
      explanation: '\u0111i th\u1EB3ng means "Go straight".'
    },
    {
      id: "vi-ex-24",
      question: 'What does "r\u1EBD tr\xE1i" mean?',
      options: ["Go straight", "Turn left", "Turn right", "U-turn"],
      answerIndex: 1,
      explanation: 'r\u1EBD tr\xE1i means "Turn left".'
    },
    {
      id: "vi-ex-25",
      question: 'What does "r\u1EBD ph\u1EA3i" mean?',
      options: ["Turn right", "Turn left", "Go straight", "Go back"],
      answerIndex: 0,
      explanation: 'r\u1EBD ph\u1EA3i means "Turn right".'
    },
    {
      id: "vi-ex-26",
      question: 'How do you say "Hot" in Vietnamese?',
      options: ["L\u1EA1nh", "M\u01B0a", "N\xF3ng", "N\u1EAFng"],
      answerIndex: 2,
      explanation: "N\xF3ng is hot in Vietnamese."
    },
    {
      id: "vi-ex-27",
      question: "What is the traditional filter used to brew Vietnamese coffee?",
      options: ["C\xE0 ph\xEA s\u1EEFa \u0111\xE1", "Phin", "\u0110\u1EAFng", "Ng\u1ECDt"],
      answerIndex: 1,
      explanation: "Phin is the traditional metal drip filter for Vietnamese coffee."
    },
    {
      id: "vi-ex-28",
      question: 'What is the word meaning "delicious" in Vietnamese?',
      options: ["d\u1EDF", "ngon", "n\xF3ng", "l\u1EA1nh"],
      answerIndex: 1,
      explanation: "ngon means delicious."
    },
    {
      id: "vi-ex-29",
      question: "Which classifier is used for fruits or spherical objects?",
      options: ["con", "c\xE1i", "ng\u01B0\u1EDDi", "qu\u1EA3 / tr\xE1i"],
      answerIndex: 3,
      explanation: "qu\u1EA3 or tr\xE1i is used to count fruits."
    },
    {
      id: "vi-ex-30",
      question: 'What is the Vietnamese translation of "Thank you"?',
      options: ["Xin ch\xE0o", "C\xE1m \u01A1n", "T\u1EA1m bi\u1EC7t", "Xin l\u1ED7i"],
      answerIndex: 1,
      explanation: 'C\xE1m \u01A1n means "Thank you".'
    },
    {
      id: "vi-ex-31",
      question: "What does the slang 'D\u1EC5 nh\u01B0 \u0103n k\u1EB9o' mean?",
      options: ["As easy as eating candy / Extremely easy", "Too spicy to eat", "Very expensive", "Slow down"],
      answerIndex: 0,
      explanation: "D\u1EC5 nh\u01B0 \u0103n k\u1EB9o literally means 'as easy as eating candy', representing something very easy."
    },
    {
      id: "vi-ex-32",
      question: "What is the meaning of the colloquial term 'Ch\xE9m gi\xF3'?",
      options: ["Slashing the wind / Boasting / Chatting casually", "Cutting paper", "Going to bed", "Being angry"],
      answerIndex: 0,
      explanation: "Ch\xE9m gi\xF3 literally means 'slashing the wind', used colloquially to mean boasting or chatting casually with friends."
    },
    {
      id: "vi-ex-33",
      question: "What is the meaning of the proverb '\u0102n qu\u1EA3 nh\u1EDB k\u1EBB tr\u1ED3ng c\xE2y'?",
      options: ["Gratitude (Eat fruit, remember the planter)", "Unity makes strength", "Rome wasn't built in a day", "Environment influences character"],
      answerIndex: 0,
      explanation: "\u0102n qu\u1EA3 nh\u1EDB k\u1EBB tr\u1ED3ng c\xE2y means 'eat fruit, remember the planter', which emphasizes gratitude."
    },
    {
      id: "vi-ex-34",
      question: "Translate the proverb 'C\xF3 c\xF4ng m\xE0i s\u1EAFt, c\xF3 ng\xE0y n\xEAn kim'.",
      options: ["Persistence pays off", "Time will tell", "Slow and steady", "Every cloud has a silver lining"],
      answerIndex: 0,
      explanation: "C\xF3 c\xF4ng m\xE0i s\u1EAFt, c\xF3 ng\xE0y n\xEAn kim means 'with effort grinding iron, it will become a needle', representing persistence pays off."
    },
    {
      id: "vi-ex-35",
      question: "In formal Vietnamese business correspondence, which opening phrase is used for 'Dear'?",
      options: ["K\xEDnh g\u1EEDi", "Tr\xE2n tr\u1ECDng", "V\u1EC1 vi\u1EC7c", "H\u1EE3p t\xE1c"],
      answerIndex: 0,
      explanation: "K\xEDnh g\u1EEDi is the standard formal opening salutation for letters or emails."
    },
    {
      id: "vi-ex-36",
      question: "What does 'Vui l\xF2ng ki\u1EC3m tra file \u0111\xEDnh k\xE8m' mean?",
      options: ["Please check the attached file", "I am writing to you", "Thank you for cooperating", "Where is the manager?"],
      answerIndex: 0,
      explanation: "Vui l\xF2ng ki\u1EC3m tra file \u0111\xEDnh k\xE8m translates to 'Please check the attached file' in Vietnamese."
    },
    {
      id: "vi-ex-37",
      question: "How do you say 'I have a room reservation' in Vietnamese?",
      options: ["T\xF4i \u0111\xE3 \u0111\u1EB7t ph\xF2ng", "\u0110i\u1EC3m du l\u1ECBch", "B\u1EA3n \u0111\u1ED3", "V\xE9"],
      answerIndex: 0,
      explanation: "T\xF4i \u0111\xE3 \u0111\u1EB7t ph\xF2ng means 'I have booked/reserved a room'."
    },
    {
      id: "vi-ex-38",
      question: "What is the Vietnamese word for 'Ticket'?",
      options: ["V\xE9", "B\u1EA3n \u0111\u1ED3", "\u0110i\u1EC3m", "Khuy\xEAn"],
      answerIndex: 0,
      explanation: "V\xE9 is the Vietnamese word for ticket."
    },
    {
      id: "vi-ex-39",
      question: "How do you shout 'Help me!' in Vietnamese?",
      options: ["C\u1EE9u t\xF4i v\u1EDBi!", "T\xF4i b\u1ECB \u0111au \u1EDF \u0111\xE2y", "B\u1EC7nh vi\u1EC7n", "Hi\u1EC7u thu\u1ED1c"],
      answerIndex: 0,
      explanation: "C\u1EE9u t\xF4i v\u1EDBi! means 'Help me!' or 'Rescue me!' in Vietnamese."
    },
    {
      id: "vi-ex-40",
      question: "What does 'T\xF4i b\u1ECB \u0111au \u1EDF \u0111\xE2y' mean?",
      options: ["I am lost", "I hurt here", "Call a doctor", "Give me medicine"],
      answerIndex: 1,
      explanation: "T\xF4i b\u1ECB \u0111au \u1EDF \u0111\xE2y means 'I hurt here' or 'I have pain here'."
    }
  ],
  german: [
    {
      id: "de-ex-01",
      question: 'Which vowel sounds like "e" in the English word "bet"?',
      options: ["\xE4", "\xF6", "\xFC", "\xDF"],
      answerIndex: 0,
      explanation: '\xE4 (Amlaut) typically sounds like the short "e" in "bet" in standard German pronunciation.'
    },
    {
      id: "de-ex-02",
      question: 'Which special character represents a sharp/double "s" in German?',
      options: ["\xF6", "\xFC", "\xE4", "\xDF"],
      answerIndex: 3,
      explanation: "\xDF (Eszett) represents a sharp s sound, pronounced like double s."
    },
    {
      id: "de-ex-03",
      question: 'How is the German letter "W" pronounced?',
      options: ['Like English "W"', 'Like English "V"', 'Like English "F"', 'Like English "H"'],
      answerIndex: 1,
      explanation: 'The German letter W is pronounced like English "V" (e.g., Wasser).'
    },
    {
      id: "de-ex-04",
      question: 'How do you say "Hello" or "Good day" in German?',
      options: ["Bitte", "Danke", "Guten Tag", "Auf Wiedersehen"],
      answerIndex: 2,
      explanation: 'Guten Tag is the standard German greeting for "Good day" or "Hello".'
    },
    {
      id: "de-ex-05",
      question: 'What is the formal pronoun for "You" in German?',
      options: ["du", "ihr", "Sie", "wir"],
      answerIndex: 2,
      explanation: "Sie (capitalized) is the formal second-person pronoun used for strangers and polite address."
    },
    {
      id: "de-ex-06",
      question: 'How do you say "Goodbye" formally in German?',
      options: ["Hallo", "Bitte", "Auf Wiedersehen", "Tsch\xFCss"],
      answerIndex: 2,
      explanation: 'Auf Wiedersehen is the formal expression for "Goodbye".'
    },
    {
      id: "de-ex-07",
      question: 'What does the word "Bitte" mean?',
      options: ["Please", "You're welcome", "Pardon?", "All of the above"],
      answerIndex: 3,
      explanation: "Bitte is highly versatile and means Please, You're welcome, and Pardon? depending on context."
    },
    {
      id: "de-ex-08",
      question: 'How do you say the number "Ten" (10) in German?',
      options: ["eins", "zwei", "zehn", "hundert"],
      answerIndex: 2,
      explanation: "zehn is 10; eins is 1; zwei is 2; hundert is 100."
    },
    {
      id: "de-ex-09",
      question: 'How do you say the number "Twenty-one" (21) in German?',
      options: ["zwanzigeins", "einundzwanzig", "einszwanzig", "zehnundzwanzig"],
      answerIndex: 1,
      explanation: "German speaks units before tens: einundzwanzig (one and twenty = 21)."
    },
    {
      id: "de-ex-10",
      question: 'Which word represents "Hundred" (100) in German?',
      options: ["tausend", "zehn", "hundert", "eins"],
      answerIndex: 2,
      explanation: "hundert is 100."
    },
    {
      id: "de-ex-11",
      question: 'How do you politely ask "How much does that cost?" in German?',
      options: ["Wie viel kostet das?", "Zahlen, bitte", "Die Rechnung, bitte", "Guten Appetit"],
      answerIndex: 0,
      explanation: '"Wie viel kostet das?" translates to "How much does that cost?".'
    },
    {
      id: "de-ex-12",
      question: "How do you politely ask for the bill/check in a German restaurant?",
      options: ["Zahlen, bitte", "Die Rechnung, bitte", "Guten Appetit", "Ich m\xF6chte bestellen"],
      answerIndex: 1,
      explanation: '"Die Rechnung, bitte" means "The bill, please".'
    },
    {
      id: "de-ex-13",
      question: "What is the polite phrase said to others before beginning to eat a meal?",
      options: ["Prost!", "Guten Appetit", "Danke", "Bitte"],
      answerIndex: 1,
      explanation: 'Guten Appetit means "Enjoy your meal".'
    },
    {
      id: "de-ex-14",
      question: 'What is the German word for "Train station"?',
      options: ["Gleis", "Bahnhof", "U-Bahn", "Fahrkarte"],
      answerIndex: 1,
      explanation: "Bahnhof means train station; Gleis is platform; Fahrkarte is ticket."
    },
    {
      id: "de-ex-15",
      question: "Which of the following refers to a subway in Germany?",
      options: ["S-Bahn", "U-Bahn", "Autobahn", "Bahnhof"],
      answerIndex: 1,
      explanation: "U-Bahn (Untergrundbahn) refers to the subway system."
    },
    {
      id: "de-ex-16",
      question: "What must you do before boarding public transit with a paper ticket in Germany?",
      options: ["Nothing", "Sign your name", "Validate / stamp it (entwerten)", "Show it to the driver"],
      answerIndex: 2,
      explanation: "You must validate/stamp (entwerten) paper tickets in validation machines before boarding."
    },
    {
      id: "de-ex-17",
      question: "How many grammatical noun genders are there in German?",
      options: ["One", "Two", "Three", "Four"],
      answerIndex: 2,
      explanation: "German has three genders: masculine (der), feminine (die), and neuter (das)."
    },
    {
      id: "de-ex-18",
      question: "Which article corresponds to the neuter gender in German?",
      options: ["der", "die", "das", "den"],
      answerIndex: 2,
      explanation: "das is the neuter definite article."
    },
    {
      id: "de-ex-19",
      question: "Which definite article is used for all plural nouns in the nominative case?",
      options: ["der", "die", "das", "den"],
      answerIndex: 1,
      explanation: "die is used for all plural nouns regardless of gender."
    },
    {
      id: "de-ex-20",
      question: 'What is the German word for "Father"?',
      options: ["Mutter", "Vater", "Sohn", "Bruder"],
      answerIndex: 1,
      explanation: "Vater is Father; Mutter is Mother; Sohn is Son; Bruder is Brother."
    },
    {
      id: "de-ex-21",
      question: 'What does the collective German word "Geschwister" mean?',
      options: ["Parents", "Grandparents", "Siblings", "Children"],
      answerIndex: 2,
      explanation: "Geschwister means siblings."
    },
    {
      id: "de-ex-22",
      question: "Which famous Bavarian beer festival is held in Munich starting in September?",
      options: ["Karneval", "Fasching", "Oktoberfest", "Weihnachtsmarkt"],
      answerIndex: 2,
      explanation: "Oktoberfest is Munich's famous beer festival that starts in late September."
    },
    {
      id: "de-ex-23",
      question: 'What is the standard German word for "Cheers!" when clinking glasses?',
      options: ["Frohe Weihnachten", "Prost!", "Guten Appetit", "Tsch\xFCss"],
      answerIndex: 1,
      explanation: "Prost! is the German word for Cheers!."
    },
    {
      id: "de-ex-24",
      question: 'What is the correct present conjugation of "lernen" for the pronoun "er" (he)?',
      options: ["lerne", "lernst", "lernt", "lernen"],
      answerIndex: 2,
      explanation: "The singular 3rd person ending is -t, so: er lernt."
    },
    {
      id: "de-ex-25",
      question: "What position does the verb take in standard German declarative main clauses?",
      options: ["1st position", "2nd position", "Last position", "Variable position"],
      answerIndex: 1,
      explanation: "In a standard declarative main clause, the conjugated verb always takes the 2nd position."
    },
    {
      id: "de-ex-26",
      question: 'How do you say "By card, please" at a checkout counter?',
      options: ["Mit Karte, bitte", "Bar zahlen", "Kassenzettel", "T\xFCte"],
      answerIndex: 0,
      explanation: 'Mit Karte, bitte means "By card, please".'
    },
    {
      id: "de-ex-27",
      question: "What is the German word for a shopping bag?",
      options: ["Kassenzettel", "Gr\xF6\xDFe", "T\xFCte", "Karte"],
      answerIndex: 2,
      explanation: "T\xFCte is a shopping bag; Kassenzettel is a receipt."
    },
    {
      id: "de-ex-28",
      question: "What is the German word for the popular national sport, soccer?",
      options: ["Fu\xDFball", "Handball", "Wandern", "Rad fahren"],
      answerIndex: 0,
      explanation: "Fu\xDFball is soccer."
    },
    {
      id: "de-ex-29",
      question: 'What does "Wandern" mean?',
      options: ["To bike", "To swim", "To hike", "To run"],
      answerIndex: 2,
      explanation: "Wandern is hiking."
    },
    {
      id: "de-ex-30",
      question: "What is the traditional German social custom of having coffee and cake on Sunday afternoons called?",
      options: ["Kaffee und Kuchen", "B\xE4ckerei", "Schwarzbrot", "Br\xF6tchen"],
      answerIndex: 0,
      explanation: "Kaffee und Kuchen (coffee and cake) is a traditional Sunday afternoon social ritual."
    },
    {
      id: "de-ex-31",
      question: "What does the German idiom 'Das ist ein Kinderspiel' translate to?",
      options: ["That is a child's play / Piece of cake", "That is dangerous", "That is a bad game", "That is too expensive"],
      answerIndex: 0,
      explanation: "Kinderspiel literally means 'child's play', which represents something extremely easy or a piece of cake."
    },
    {
      id: "de-ex-32",
      question: "What is the meaning of 'Jemandem die Daumen dr\xFCcken'?",
      options: ["To wish someone luck (press thumbs)", "To hurt someone's hands", "To get angry", "To do something pointless"],
      answerIndex: 0,
      explanation: "Daumen dr\xFCcken literally means 'to press thumbs', which is the German gesture/expression for wishing someone good luck."
    },
    {
      id: "de-ex-33",
      question: "What is the meaning of the proverb '\xDCbung macht den Meister'?",
      options: ["Practice makes perfect", "Time will tell", "Every cloud has a silver lining", "Better late than never"],
      answerIndex: 0,
      explanation: "\xDCbung macht den Meister translates to 'practice makes the master', which is the equivalent of 'Practice makes perfect'."
    },
    {
      id: "de-ex-34",
      question: "Translate 'Aller Anfang ist schwer'.",
      options: ["Every beginning is hard", "Practice makes perfect", "No pain, no gain", "Better late than never"],
      answerIndex: 0,
      explanation: "Aller Anfang ist schwer translates to 'every beginning is difficult'."
    },
    {
      id: "de-ex-35",
      question: "In a professional German business email, which greeting means 'Dear Sir or Madam'?",
      options: ["Sehr geehrte Damen und Herren", "Mit freundlichen Gr\xFC\xDFen", "Bezugnehmend auf", "Anhang"],
      answerIndex: 0,
      explanation: "Sehr geehrte Damen und Herren is the standard formal salutation for 'Dear Sir or Madam'."
    },
    {
      id: "de-ex-36",
      question: "What does 'Mit freundlichen Gr\xFC\xDFen' mean?",
      options: ["Sincerely / With friendly greetings", "Refering to", "I look forward to your reply", "Please check attachment"],
      answerIndex: 0,
      explanation: "Mit freundlichen Gr\xFC\xDFen is the formal German closing corresponding to 'Sincerely' or 'Kind regards'."
    },
    {
      id: "de-ex-37",
      question: "How do you say 'I have a reservation' in German?",
      options: ["Ich habe eine Reservierung", "Sehensw\xFCrdigkeit", "Fahrkarte", "Stadtplan"],
      answerIndex: 0,
      explanation: "Ich habe eine Reservierung means 'I have a reservation'."
    },
    {
      id: "de-ex-38",
      question: "What is the German word for 'Train ticket'?",
      options: ["Sehensw\xFCrdigkeit", "Fahrkarte", "Stadtplan", "Reservierung"],
      answerIndex: 1,
      explanation: "Fahrkarte is the German word for travel ticket (train/bus)."
    },
    {
      id: "de-ex-39",
      question: "How do you shout 'Help!' in German?",
      options: ["Hilfe!", "Apotheke", "Es tut hier weh", "Krankenhaus"],
      answerIndex: 0,
      explanation: "Hilfe! is the German word for 'Help!'."
    },
    {
      id: "de-ex-40",
      question: "What does 'Es tut hier weh' mean?",
      options: ["I am lost", "It hurts here", "Call a doctor", "Give me medicine"],
      answerIndex: 1,
      explanation: "Es tut hier weh translates to 'It hurts here'."
    }
  ],
  english: [
    {
      "id": "en-ex-01",
      "question": "She has ________ in London since she graduated from university in 2018.",
      "options": [
        "lived",
        "lives",
        "living",
        "been lived"
      ],
      "answerIndex": 0,
      "explanation": 'The present perfect tense (has + past participle "lived") is used here because the action started in the past (2018) and continues to the present, signaled by the word "since".'
    },
    {
      "id": "en-ex-02",
      "question": "If I had known about the traffic delays, I ________ a different route.",
      "options": [
        "will take",
        "took",
        "would have taken",
        "take"
      ],
      "answerIndex": 2,
      "explanation": "This is a third conditional sentence, which refers to an imaginary situation in the past. The structure is [If + Past Perfect (had known)], [would have + Past Participle (would have taken)]."
    },
    {
      "id": "en-ex-03",
      "question": "The new environmental protection laws ________ by the government next month.",
      "options": [
        "will introduce",
        "will be introduced",
        "are introducing",
        "introduced"
      ],
      "answerIndex": 1,
      "explanation": "The sentence requires the future passive voice because the subject (the laws) receives the action of being introduced by the agent (the government). The formula is [will be + past participle]."
    },
    {
      "id": "en-ex-04",
      "question": "Henry asked me ________ I had finished the quarterly report.",
      "options": [
        "that",
        "weather",
        "if",
        "what"
      ],
      "answerIndex": 2,
      "explanation": 'In reported questions for yes/no questions, we use "if" or "whether" (spelled "whether", not "weather") to introduce the reported clause.'
    },
    {
      "id": "en-ex-05",
      "question": "Our manager suggested ________ the deadline to allow for thorough testing.",
      "options": [
        "postpone",
        "postponing",
        "to postpone",
        "postponed"
      ],
      "answerIndex": 1,
      "explanation": 'The verb "suggest" is followed by a gerund (verb-ing) when there is no direct object pronoun or "that" clause: "suggested postponing".'
    },
    {
      "id": "en-ex-06",
      "question": "The group of students, along with their teacher, ________ visiting the museum today.",
      "options": [
        "is",
        "are",
        "were",
        "be"
      ],
      "answerIndex": 0,
      "explanation": 'The subject of the sentence is "The group" (singular collective noun). Phrases like "along with their teacher" do not change the number of the subject. Therefore, the singular verb "is" is correct.'
    },
    {
      "id": "en-ex-07",
      "question": "You ________ submit the project proposal today; the director extended the deadline to Friday.",
      "options": [
        "must not",
        "need not",
        "should",
        "ought to"
      ],
      "answerIndex": 1,
      "explanation": `"Need not" (or "don't have to") expresses lack of obligation or necessity. Since the deadline was extended, submitting it today is not necessary.`
    },
    {
      "id": "en-ex-08",
      "question": "The company ________ logo is a blue bird has recently rebranded.",
      "options": [
        "which",
        "who",
        "whom",
        "whose"
      ],
      "answerIndex": 3,
      "explanation": 'The relative pronoun "whose" is possessive and shows that the logo belongs to the company.'
    },
    {
      "id": "en-ex-09",
      "question": "________ she worked incredibly hard, she was not promoted this quarter.",
      "options": [
        "Despite",
        "Although",
        "However",
        "In spite of"
      ],
      "answerIndex": 1,
      "explanation": '"Although" is a conjunction used to introduce a clause of concession (subject + verb: "she worked"). "Despite" and "In spite of" require a noun or gerund.'
    },
    {
      "id": "en-ex-10",
      "question": "By the time the guest speaker arrives, we ________ the auditorium.",
      "options": [
        "will prepare",
        "prepared",
        "will have prepared",
        "are preparing"
      ],
      "answerIndex": 2,
      "explanation": "The future perfect tense (will have prepared) is used to describe an action that will be completed before a specific point in the future (the arrival of the speaker)."
    },
    {
      "id": "en-ex-11",
      "question": "If you want to reach an agreement, both sides need to meet each other ________.",
      "options": [
        "in the middle",
        "halfway",
        "at the table",
        "on the corner"
      ],
      "answerIndex": 1,
      "explanation": 'The idiom "meet someone halfway" means to make a compromise or reach an agreement by making concessions on both sides.'
    },
    {
      "id": "en-ex-12",
      "question": "Our project proposal was rejected, so we had to go back to the ________.",
      "options": [
        "first page",
        "drawing board",
        "square one",
        "starting gate"
      ],
      "answerIndex": 1,
      "explanation": 'The idiom "go back to the drawing board" means to start planning a failed project or idea again from the very beginning with a new approach.'
    },
    {
      "id": "en-ex-13",
      "question": "The company decided to ________ the opportunity to expand into the Asian market.",
      "options": [
        "seize",
        "catch",
        "hold",
        "lock"
      ],
      "answerIndex": 0,
      "explanation": '"Seize the opportunity" is a strong collocation meaning to eagerly take advantage of a favorable situation immediately.'
    },
    {
      "id": "en-ex-14",
      "question": "Let's touch ________ next Monday to review the client feedback.",
      "options": [
        "base",
        "point",
        "ground",
        "line"
      ],
      "answerIndex": 0,
      "explanation": 'The business idiom "touch base" means to briefly make contact with someone to update each other on progress.'
    },
    {
      "id": "en-ex-15",
      "question": "Which word is a synonym for 'ephemeral'?",
      "options": [
        "permanent",
        "temporary",
        "fleeting",
        "insignificant"
      ],
      "answerIndex": 2,
      "explanation": '"Ephemeral" means lasting for a very short time. "Fleeting" is a direct synonym describing something passing quickly.'
    },
    {
      "id": "en-ex-16",
      "question": "What does 'on the same page' mean in a business context?",
      "options": [
        "Reading the same document",
        "In agreement with the plan",
        "Working at the same desk",
        "Having the same work shifts"
      ],
      "answerIndex": 1,
      "explanation": 'Being "on the same page" is a corporate metaphor meaning to have the same understanding, ideas, or agreement on a plan.'
    },
    {
      "id": "en-ex-17",
      "question": "We need to look at the big ________, rather than focusing purely on minor details.",
      "options": [
        "map",
        "picture",
        "frame",
        "canvas"
      ],
      "answerIndex": 1,
      "explanation": 'The expression "the big picture" refers to the entire perspective, overall situation, or long-term plan rather than isolated details.'
    },
    {
      "id": "en-ex-18",
      "question": "She is highly qualified ________ the post, with ten years of leadership experience.",
      "options": [
        "for",
        "at",
        "to",
        "with"
      ],
      "answerIndex": 0,
      "explanation": 'The adjective "qualified" is followed by the preposition "for" when specifying a job, role, or position.'
    },
    {
      "id": "en-ex-19",
      "question": "The board decided to ________ the annual meeting until next quarter due to travel restrictions.",
      "options": [
        "put off",
        "put out",
        "call off",
        "call out"
      ],
      "answerIndex": 0,
      "explanation": 'The phrasal verb "put off" means to postpone an event. "Call off" means to cancel it completely.'
    },
    {
      "id": "en-ex-20",
      "question": "The manager praised the team's ________ effort in resolving the customer crisis.",
      "options": [
        "collaborative",
        "collateral",
        "compulsory",
        "complacent"
      ],
      "answerIndex": 0,
      "explanation": '"Collaborative" refers to cooperative joint action by multiple people working together toward a common goal.'
    },
    {
      "id": "en-ex-21",
      "question": "Speaker A: 'Do you mind if I close the window?' Speaker B: '________, please go ahead. It is getting chilly.'",
      "options": [
        "Yes, I do",
        "Not at all",
        "Of course",
        "Yes, please"
      ],
      "answerIndex": 1,
      "explanation": '"Do you mind" asks if closing the window would bother someone. "Not at all" means "I do not mind; it is fine for you to close it".'
    },
    {
      "id": "en-ex-22",
      "question": "If someone says 'Let's call it a day', what do they mean?",
      "options": [
        "Let's write down the date",
        "Let's stop working for today",
        "Let's schedule a meeting",
        "Let's celebrate the day"
      ],
      "answerIndex": 1,
      "explanation": 'To "call it a day" is an idiom meaning to stop what you are doing (usually work) because you have done enough for the day.'
    },
    {
      "id": "en-ex-23",
      "question": "Speaker A: 'Could you give me a hand with this suitcase?' Speaker B: '________. It looks very heavy.'",
      "options": [
        "Sure, no problem",
        "No, I can't",
        "You are welcome",
        "Thanks a lot"
      ],
      "answerIndex": 0,
      "explanation": '"Sure, no problem" is a polite, helpful way to accept a request to assist someone.'
    },
    {
      "id": "en-ex-24",
      "question": "When checking into a hotel, which phrase is most natural to inquire if breakfast is free?",
      "options": [
        "Is breakfast included in the room rate?",
        "How is the breakfast today?",
        "Do you feed us breakfast?",
        "Where do I eat breakfast?"
      ],
      "answerIndex": 0,
      "explanation": '"Is breakfast included in the room rate?" is the standard polite formulation to ask if breakfast is covered by the payment.'
    },
    {
      "id": "en-ex-25",
      "question": "Speaker A: 'I'm sorry, I've misplaced your notebook.' Speaker B: '________. I have plenty of others.'",
      "options": [
        "No problem",
        "Don't mention it",
        "Never mind",
        "Both A and C are correct"
      ],
      "answerIndex": 3,
      "explanation": 'Both "No problem" and "Never mind" are appropriate friendly responses to a minor apology, reassuring the speaker that it is fine.'
    },
    {
      "id": "en-ex-26",
      "question": "Which word has the same short /\xE6/ vowel sound as 'cat'?",
      "options": [
        "car",
        "cake",
        "stamp",
        "saw"
      ],
      "answerIndex": 2,
      "explanation": '"Stamp" contains the short /\xE6/ sound. "Car" has /\u0251:/, "Cake" has /e\u026A/, and "Saw" has /\u0254:/.'
    },
    {
      "id": "en-ex-27",
      "question": "Which word contains the long /i:/ sound as in the word 'sleep'?",
      "options": [
        "slip",
        "beach",
        "bread",
        "friend"
      ],
      "answerIndex": 1,
      "explanation": '"Beach" is pronounced with the long /i:/ sound. "Slip" has the short /\u026A/, "Bread" has the short /e/, and "Friend" has the short /e/.'
    },
    {
      "id": "en-ex-28",
      "question": "Which word has a silent letter 'b'?",
      "options": [
        "climb",
        "double",
        "timber",
        "rabbit"
      ],
      "answerIndex": 0,
      "explanation": 'In the word "climb", the final letter "b" is silent, so the word is pronounced /kla\u026Am/.'
    },
    {
      "id": "en-ex-29",
      "question": "How many syllables are in the word 'pronunciation'?",
      "options": [
        "4",
        "5",
        "6",
        "7"
      ],
      "answerIndex": 2,
      "explanation": 'The word "pronunciation" has six syllables: pro-nun-ci-a-tion (/pr\u0259-n\u028Cn-si-e\u026A-\u0283n/).'
    },
    {
      "id": "en-ex-30",
      "question": "Which syllable is stressed in the noun form of 'contract' (e.g. a business agreement)?",
      "options": [
        "First syllable ('con')",
        "Second syllable ('tract')",
        "Both syllables equally",
        "It depends on the speaker's accent"
      ],
      "answerIndex": 0,
      "explanation": 'For the noun "contract", the stress is placed on the first syllable: /\u02C8k\u0252ntr\xE6kt/. (Note: the verb form "contract" is stressed on the second syllable: /k\u0259n\u02C8tr\xE6kt/).'
    },
    {
      "id": "en-ex-31",
      "question": "Choose the sentence with the correct subjunctive mood usage:",
      "options": [
        "The board demanded that he resigns immediately.",
        "The board demanded that he resign immediately.",
        "The board demanded that he resigned immediately.",
        "The board demanded that he would resign immediately."
      ],
      "answerIndex": 1,
      "explanation": "The mandative subjunctive uses the base form of the verb (resign, be) in that-clauses after verbs of demand, recommendation, or urgency."
    },
    {
      "id": "en-ex-32",
      "question": 'What does the idiom "to bite the bullet" mean?',
      "options": [
        "To engage in combat",
        "To endure a painful or difficult situation with fortitude",
        "To speak hastily without thinking",
        "To invest recklessly in the stock market"
      ],
      "answerIndex": 1,
      "explanation": '"To bite the bullet" means facing an inevitable unpleasant or painful situation with courage.'
    },
    {
      "id": "en-ex-33",
      "question": "Which word contains the diphthong /a\u026A/?",
      "options": [
        "Bait",
        "Boat",
        "Bite",
        "Beat"
      ],
      "answerIndex": 2,
      "explanation": 'The word "Bite" is pronounced /ba\u026At/, which contains the diphthong /a\u026A/.'
    },
    {
      "id": "en-ex-34",
      "question": '"Scarcely had we arrived at the airport ________ the announcement was broadcast." Choose the correct conjunction:',
      "options": [
        "than",
        "when",
        "then",
        "that"
      ],
      "answerIndex": 1,
      "explanation": 'Inverted correlative structures pair "Scarcely / Hardly ... when" and "No sooner ... than".'
    },
    {
      "id": "en-ex-35",
      "question": 'What does the word "ephemeral" mean?',
      "options": [
        "Lasting for a very short time",
        "Extremely huge or monumental",
        "Spiritual or celestial",
        "Repeated regularly"
      ],
      "answerIndex": 0,
      "explanation": "Ephemeral means lasting for only a very brief, transitory period of time."
    },
    {
      "id": "en-ex-36",
      "question": "Which of the following sentences has NO dangling or misplaced modifier?",
      "options": [
        "Walking down the street, the monument caught my eye.",
        "While driving through the blizzard, my windshield froze over.",
        "Walking down the street, I noticed the monument on my right.",
        "Having finished the presentation, the audience applauded loudly."
      ],
      "answerIndex": 2,
      "explanation": 'In "Walking down the street, I noticed the monument", the subject "I" is properly the agent of "walking".'
    },
    {
      "id": "en-ex-37",
      "question": 'What is the function of "notwithstanding" in: "Notwithstanding the inclement weather, the flight landed on schedule"?',
      "options": [
        "Coordinating conjunction",
        "Preposition meaning in spite of",
        "Adverb of degree",
        "Subordinating modal"
      ],
      "answerIndex": 1,
      "explanation": '"Notwithstanding" functions as a formal preposition meaning "despite" or "in spite of".'
    },
    {
      "id": "en-ex-38",
      "question": "Which phrase is an example of an oxymoron?",
      "options": [
        "Deafening silence",
        "Cold ice",
        "Running swiftly",
        "Bright sunshine"
      ],
      "answerIndex": 0,
      "explanation": "An oxymoron pairs contradictory terms together for rhetorical effect (e.g., deafening silence)."
    },
    {
      "id": "en-ex-39",
      "question": 'What does the idiom "burn the midnight oil" mean?',
      "options": [
        "To waste electricity unnecessarily",
        "To stay up late working or studying diligently",
        "To cause a kitchen fire accidentally",
        "To travel overnight"
      ],
      "answerIndex": 1,
      "explanation": '"Burn the midnight oil" refers to working or studying late into the night.'
    },
    {
      "id": "en-ex-40",
      "question": "Which sentence demonstrates correct parallel structure?",
      "options": [
        "She enjoys hiking, to read novels, and culinary experiments.",
        "She enjoys hiking, reading novels, and experimenting in the kitchen.",
        "She enjoys to hike, reading novels, and she cooks.",
        "She enjoys hiking, novels, and to cook delicious meals."
      ],
      "answerIndex": 1,
      "explanation": "Parallel structure requires parallel grammatical forms: hiking, reading, experimenting (all gerunds)."
    }
  ]
};

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors *"
  );
  next();
});
var PORT = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
var ai = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return ai;
}
var STATS_FILE = import_path.default.join(process.cwd(), "data", "stats.json");
var TRANSLATION_DIR = import_path.default.join(process.cwd(), "data", "translations");
function ensureDirectories() {
  const dataDir = import_path.default.dirname(STATS_FILE);
  if (!import_fs.default.existsSync(dataDir)) {
    import_fs.default.mkdirSync(dataDir, { recursive: true });
  }
  if (!import_fs.default.existsSync(TRANSLATION_DIR)) {
    import_fs.default.mkdirSync(TRANSLATION_DIR, { recursive: true });
  }
}
function readStats() {
  ensureDirectories();
  const defaults = {
    completedLessons: [],
    streakCount: 0,
    lastActiveDate: "",
    points: 0,
    timeSpentMinutes: 0,
    history: [],
    passedExams: [],
    examAttempts: {}
  };
  try {
    if (import_fs.default.existsSync(STATS_FILE)) {
      const raw = import_fs.default.readFileSync(STATS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (err) {
    console.error("Error reading stats, returning defaults:", err);
  }
  return defaults;
}
function saveStats(stats) {
  ensureDirectories();
  try {
    import_fs.default.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing stats:", err);
  }
}
app.get("/api/lessons", (req, res) => {
  const langCode = req.query.lang || "all";
  const codeMap = {
    en: "english",
    th: "thai",
    ko: "korean",
    ja: "japanese",
    es: "spanish",
    fr: "french",
    vi: "vietnamese",
    zh: "chinese",
    de: "german"
  };
  const modulesToMap = langCode === "all" ? languageModules : languageModules.filter((m) => m.id === (codeMap[langCode] || langCode));
  if (!modulesToMap.length) {
    return res.json([]);
  }
  const shuffle = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const allMappedLessons = modulesToMap.flatMap((moduleData) => {
    const langId = moduleData.id;
    return moduleData.lessons.map((lesson) => {
      const categoryMap = {
        vocabulary: "vocabulary",
        grammar: "grammar",
        conversation: "conversation",
        culture: "vocabulary",
        pronunciation: "pronunciation"
      };
      const category = categoryMap[lesson.type] || "vocabulary";
      const durationMatch = lesson.duration.match(/\d+/);
      const estimatedMinutes = durationMatch ? parseInt(durationMatch[0]) : 10;
      const quiz = [];
      const phrases = lesson.content.keyPhrases || [];
      if (phrases.length >= 2) {
        const q1Phrase = phrases[0];
        let q1Opts = [q1Phrase.english];
        phrases.slice(1).forEach((p) => {
          if (!q1Opts.includes(p.english)) q1Opts.push(p.english);
        });
        while (q1Opts.length < 4 && q1Opts.length < phrases.length) {
          q1Opts.push("None of the above");
        }
        q1Opts = q1Opts.slice(0, 4);
        const shuffledQ1Opts = shuffle(q1Opts);
        const q1CorrectIdx = shuffledQ1Opts.indexOf(q1Phrase.english);
        quiz.push({
          id: `${lesson.id}-q1`,
          question: `What is the correct English translation of: "${q1Phrase.native}"?`,
          options: shuffledQ1Opts,
          answerIndex: q1CorrectIdx,
          explanation: `"${q1Phrase.native}" means "${q1Phrase.english}" in English.`
        });
        const q2Phrase = phrases[Math.min(1, phrases.length - 1)];
        let q2Opts = [q2Phrase.native];
        phrases.forEach((p) => {
          if (p.native !== q2Phrase.native && !q2Opts.includes(p.native)) q2Opts.push(p.native);
        });
        while (q2Opts.length < 4 && q2Opts.length < phrases.length) {
          q2Opts.push("N/A");
        }
        q2Opts = q2Opts.slice(0, 4);
        const shuffledQ2Opts = shuffle(q2Opts);
        const q2CorrectIdx = shuffledQ2Opts.indexOf(q2Phrase.native);
        quiz.push({
          id: `${lesson.id}-q2`,
          question: `How do you say "${q2Phrase.english}" in ${moduleData.language}?`,
          options: shuffledQ2Opts,
          answerIndex: q2CorrectIdx,
          explanation: `"${q2Phrase.native}" is the translation for "${q2Phrase.english}".`
        });
        const q3Phrase = phrases[phrases.length - 1];
        if (q3Phrase.romanized && q3Phrase.romanized !== "\u2014") {
          let q3Opts = [q3Phrase.romanized];
          phrases.forEach((p) => {
            if (p.romanized && p.romanized !== "\u2014" && p.romanized !== q3Phrase.romanized && !q3Opts.includes(p.romanized)) {
              q3Opts.push(p.romanized);
            }
          });
          while (q3Opts.length < 4) {
            q3Opts.push("N/A");
          }
          q3Opts = q3Opts.slice(0, 4);
          const shuffledQ3Opts = shuffle(q3Opts);
          const q3CorrectIdx = shuffledQ3Opts.indexOf(q3Phrase.romanized);
          quiz.push({
            id: `${lesson.id}-q3`,
            question: `What is the correct pronunciation / romanization of "${q3Phrase.native}"?`,
            options: shuffledQ3Opts,
            answerIndex: q3CorrectIdx,
            explanation: `"${q3Phrase.native}" is romanized as "${q3Phrase.romanized}".`
          });
        } else {
          const q3FallbackPhrase = phrases[Math.min(2, phrases.length - 1)];
          let q3Opts = [q3FallbackPhrase.english];
          phrases.forEach((p) => {
            if (p.english !== q3FallbackPhrase.english && !q3Opts.includes(p.english)) q3Opts.push(p.english);
          });
          while (q3Opts.length < 4) {
            q3Opts.push("N/A");
          }
          q3Opts = q3Opts.slice(0, 4);
          const shuffledQ3Opts = shuffle(q3Opts);
          const q3CorrectIdx = shuffledQ3Opts.indexOf(q3FallbackPhrase.english);
          quiz.push({
            id: `${lesson.id}-q3`,
            question: `What is the correct meaning of "${q3FallbackPhrase.native}"?`,
            options: shuffledQ3Opts,
            answerIndex: q3CorrectIdx,
            explanation: `"${q3FallbackPhrase.native}" means "${q3FallbackPhrase.english}".`
          });
        }
      } else {
        quiz.push({
          id: `${lesson.id}-q1`,
          question: `Is this lesson about ${moduleData.language}?`,
          options: ["Yes", "No"],
          answerIndex: 0,
          explanation: "Yes, this is part of the language learning module."
        });
      }
      const content = {
        explanation: lesson.content.intro,
        introduction: lesson.content.intro,
        context: lesson.content.intro,
        howToProduce: lesson.content.intro,
        keyRules: lesson.content.tips || [],
        quiz
      };
      if (category === "grammar") {
        content.examples = phrases.map((p) => ({
          english: p.english,
          structureExplanation: p.romanized && p.romanized !== "\u2014" ? `${p.native} [${p.romanized}]` : p.native
        }));
      } else if (category === "vocabulary") {
        content.words = phrases.map((p) => ({
          word: p.native,
          partOfSpeech: p.romanized && p.romanized !== "\u2014" ? `[${p.romanized}]` : "phrase",
          definition: p.english,
          englishExample: ""
        }));
      } else if (category === "conversation" || category === "listening") {
        content.speakerNames = ["A", "B"];
        content.transcript = phrases.map((p, idx) => ({
          speaker: idx % 2 === 0 ? "A" : "B",
          text: p.romanized && p.romanized !== "\u2014" ? `${p.native} (${p.romanized}) \u2014 ${p.english}` : `${p.native} \u2014 ${p.english}`
        }));
      } else if (category === "pronunciation") {
        content.phoneme = lesson.title;
        content.practiceWords = phrases.map((p) => ({
          word: p.native,
          ipa: p.romanized && p.romanized !== "\u2014" ? p.romanized : "",
          guide: p.english
        }));
        content.practiceSentences = phrases.map((p) => ({
          text: p.romanized && p.romanized !== "\u2014" ? `${p.native} (${p.romanized})` : p.native,
          emphasis: p.english
        }));
      }
      return {
        id: lesson.id,
        category,
        level: lesson.difficulty,
        title: lesson.title,
        description: lesson.description,
        xpReward: lesson.difficulty === "advanced" ? 200 : lesson.difficulty === "intermediate" ? 185 : 150,
        estimatedMinutes,
        targetLang: langId === "english" ? void 0 : langId,
        content
      };
    });
  });
  res.json(allMappedLessons);
});
app.post("/api/progress/reset", (req, res) => {
  const defaultStats = {
    completedLessons: [],
    streakCount: 0,
    lastActiveDate: "",
    points: 0,
    timeSpentMinutes: 0,
    history: [],
    passedExams: [],
    examAttempts: {}
  };
  saveStats(defaultStats);
  res.json(defaultStats);
});
app.get("/api/progress", (req, res) => {
  const stats = readStats();
  res.json(stats);
});
app.post("/api/progress/complete", (req, res) => {
  const { lessonId, score, xpEarned, timeSpent } = req.body;
  if (!lessonId) {
    return res.status(400).json({ error: "Missing lessonId" });
  }
  const stats = readStats();
  if (!stats.completedLessons.includes(lessonId)) {
    stats.completedLessons.push(lessonId);
  }
  stats.points += xpEarned || 100;
  stats.timeSpentMinutes += timeSpent || 5;
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const lastActiveStr = stats.lastActiveDate;
  if (lastActiveStr === "") {
    stats.streakCount = 1;
  } else if (lastActiveStr !== todayStr) {
    const lastActive = new Date(lastActiveStr);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.streakCount += 1;
    } else if (diffDays > 1) {
      stats.streakCount = 1;
    }
  }
  stats.lastActiveDate = todayStr;
  stats.history.push({
    lessonId,
    completedAt: (/* @__PURE__ */ new Date()).toISOString(),
    score: score || 100,
    xpEarned: xpEarned || 100
  });
  saveStats(stats);
  res.json(stats);
});
app.post("/api/progress/complete-exam", (req, res) => {
  const { langCode, score, passed } = req.body;
  if (!langCode || score === void 0 || passed === void 0) {
    return res.status(400).json({ error: "Missing langCode, score, or passed status" });
  }
  const stats = readStats();
  if (!stats.passedExams) stats.passedExams = [];
  if (!stats.examAttempts) stats.examAttempts = {};
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const prevAttempt = stats.examAttempts[langCode];
  if (!prevAttempt || score > prevAttempt.score) {
    stats.examAttempts[langCode] = {
      score,
      passed,
      date: todayStr
    };
  }
  if (passed && !stats.passedExams.includes(langCode)) {
    stats.passedExams.push(langCode);
    stats.points += 500;
  }
  stats.timeSpentMinutes += 30;
  stats.lastActiveDate = todayStr;
  saveStats(stats);
  res.json(stats);
});
app.post("/api/translate-exam", async (req, res) => {
  try {
    const { targetLang, targetLangName } = req.body;
    if (!targetLang) {
      return res.status(400).json({ error: "Missing targetLang" });
    }
    const codeMap = {
      th: "thai",
      ko: "korean",
      ja: "japanese",
      es: "spanish",
      fr: "french",
      vi: "vietnamese",
      zh: "chinese",
      de: "german"
    };
    const examKey = codeMap[targetLang] || "thai";
    const questions = languageExams[examKey];
    if (questions) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const sliced = shuffled.slice(0, 30);
      const formatted = sliced.map((q) => ({
        question: q.question,
        options: q.options,
        explanation: q.explanation,
        answerIndex: q.answerIndex
      }));
      return res.json(formatted);
    }
    const cachePath = import_path.default.join(TRANSLATION_DIR, `exam_${targetLang}.json`);
    ensureDirectories();
    if (import_fs.default.existsSync(cachePath)) {
      try {
        const cachedContent = import_fs.default.readFileSync(cachePath, "utf-8");
        return res.json(JSON.parse(cachedContent));
      } catch (e) {
        console.warn(`Failed reading cached translation for exam_${targetLang}, falling back to generation:`, e);
      }
    }
    const client = getGeminiClient();
    if (!client) {
      console.info("Gemini client not configured. Generating draft fallback translation for exam.");
      const fallbackTranslation = EXAM_QUESTIONS.map((q) => ({
        question: `[${targetLangName}] ${q.question}`,
        options: q.options.map((opt) => `${opt} (${targetLangName})`),
        explanation: `[${targetLangName} Explanation] ${q.explanation}`,
        answerIndex: q.answerIndex
      }));
      import_fs.default.writeFileSync(cachePath, JSON.stringify(fallbackTranslation, null, 2), "utf-8");
      return res.json(fallbackTranslation);
    }
    const prompt = `You are a professional language localization editor for lingolandverse.com.
Translate all the 30 multiple-choice questions, options, and feedback explanations of this English proficiency exam into "${targetLangName}" (Code: "${targetLang}").
Translate the meanings accurately while preserving pedagogical nuance.

Questions to translate:
${JSON.stringify(EXAM_QUESTIONS.map((q) => ({ question: q.question, options: q.options, explanation: q.explanation })))}

Output constraints:
- Return the list in the exact matching index order.
- Options array must have the same length.
- Return ONLY the required JSON list shape. Do NOT add markdown wrappers or generic formatting notes outside the JSON block.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a translation bot returning clean, strict JSON array matching standard objects.",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              question: { type: import_genai.Type.STRING },
              options: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              explanation: { type: import_genai.Type.STRING }
            },
            required: ["question", "options", "explanation"]
          }
        }
      }
    });
    const text = response.text || "[]";
    const parsedTranslation = JSON.parse(text).map((item, idx) => ({
      ...item,
      answerIndex: EXAM_QUESTIONS[idx]?.answerIndex || 0
    }));
    import_fs.default.writeFileSync(cachePath, JSON.stringify(parsedTranslation, null, 2), "utf-8");
    return res.json(parsedTranslation);
  } catch (err) {
    console.error("Exam translation generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate exam translation" });
  }
});
app.post("/api/translate-lesson", async (req, res) => {
  try {
    const { lessonId, targetLang, targetLangName } = req.body;
    if (!lessonId || !targetLang) {
      return res.status(400).json({ error: "Missing lessonId or targetLang" });
    }
    const cachePath = import_path.default.join(TRANSLATION_DIR, `${lessonId}_${targetLang}.json`);
    ensureDirectories();
    if (lessonId.includes("-") && !lessonId.startsWith("g-")) {
      return res.json({
        title: "",
        description: "",
        explanation: "",
        introduction: "",
        context: "",
        howToProduce: "",
        keyRules: [],
        words: [],
        transcript: [],
        quiz: [],
        practiceSentences: []
      });
    }
    let cacheFileToCheck = cachePath;
    const projectTranslationPath = import_path.default.join(process.cwd(), "data", "translations", `${lessonId}_${targetLang}.json`);
    if (import_fs.default.existsSync(projectTranslationPath)) {
      cacheFileToCheck = projectTranslationPath;
    }
    if (import_fs.default.existsSync(cacheFileToCheck)) {
      try {
        const cachedContent = import_fs.default.readFileSync(cacheFileToCheck, "utf-8");
        return res.json(JSON.parse(cachedContent));
      } catch (e) {
        console.warn(`Failed reading cached translation for ${lessonId}_${targetLang}, falling back to generation:`, e);
      }
    }
    const lesson = DEFAULT_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const client = getGeminiClient();
    if (!client) {
      console.info("Gemini client not configured. Generating draft fallback translation.");
      const fallbackTranslation = {
        title: `${lesson.title} (${targetLangName})`,
        description: `[Preview] This content was translated statically to ${targetLangName}.`,
        explanation: lesson.content.explanation ? `[Auto Translate Demo] ${lesson.content.explanation} (This represents side-by-side localized content: ${targetLangName})` : void 0,
        introduction: lesson.content.introduction ? `[Auto Translate Demo] ${lesson.content.introduction} (This vocabulary is wrapped for native comprehension in: ${targetLangName})` : void 0,
        context: lesson.content.context ? `[Context in ${targetLangName}] ${lesson.content.context}` : void 0,
        howToProduce: lesson.content.howToProduce ? `[Pronunciation Guide in ${targetLangName}] ${lesson.content.howToProduce}` : void 0,
        keyRules: lesson.content.keyRules?.map((r) => `\u2022 ${r} (${targetLangName} Guide)`),
        words: lesson.content.words?.map((w) => `${w.word}: [${targetLangName} Definition] ${w.definition}`),
        transcript: lesson.content.transcript?.map((t) => `${t.speaker}: [Speaking in ${targetLangName}] "${t.text}"`),
        practiceSentences: lesson.content.practiceSentences?.map((s) => `${s.text} (${targetLangName} literal approximation)`),
        quiz: lesson.content.quiz.map((q) => ({
          question: `[${targetLangName}] ${q.question}`,
          options: q.options.map((opt) => `${opt} (${targetLangName})`),
          explanation: `[${targetLangName} Explanation] ${q.explanation}`
        }))
      };
      import_fs.default.writeFileSync(cachePath, JSON.stringify(fallbackTranslation, null, 2), "utf-8");
      return res.json(fallbackTranslation);
    }
    const prompt = `You are a professional language localization editor for lingolandverse.com.
Translate all texts, questions, explanations, rules, and vocabulary entries of this English lesson into "${targetLangName}" (Code: "${targetLang}").
Translate the meanings accurately while preserving pedagogical nuance.

Original Lesson Content for context:
- Title: "${lesson.title}"
- Description: "${lesson.description}"
${lesson.content.explanation ? `- Explanation: "${lesson.content.explanation}"` : ""}
${lesson.content.introduction ? `- Introduction: "${lesson.content.introduction}"` : ""}
${lesson.content.context ? `- Context: "${lesson.content.context}"` : ""}
${lesson.content.howToProduce ? `- How to produce sound: "${lesson.content.howToProduce}"` : ""}

${lesson.content.keyRules ? `- Bullet Grammar Rules: ${JSON.stringify(lesson.content.keyRules)}` : ""}
${lesson.content.words ? `- Words and Definitions: ${JSON.stringify(lesson.content.words.map((w) => ({ word: w.word, definition: w.definition })))}- ONLY translate the DEFINITIONS. Leave the English word intact.` : ""}
${lesson.content.transcript ? `- Dialogue lines to translate (without speakers): ${JSON.stringify(lesson.content.transcript.map((t) => t.text))}` : ""}
${lesson.content.practiceSentences ? `- Practice sentences to translate: ${JSON.stringify(lesson.content.practiceSentences.map((s) => s.text))}` : ""}

- Interactive Quiz questions to translate (Questions, Answers, and Explanations):
${JSON.stringify(lesson.content.quiz.map((q) => ({ question: q.question, options: q.options, explanation: q.explanation })))}

Output constraints:
- Words: Provide string translation items corresponding to definitions, e.g. "Traducido..."
- Dialogue lines: Provide direct translations in exact matching array indexing order.
- Quiz: Translate question string, keep options length the SAME, and translate the feedback explanation.
- Return ONLY the required JSON shape. Do NOT add markdown wrappers or generic formatting notes outside the JSON block.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a translation bot returning clean, strict JSON matching standard objects.",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING },
            description: { type: import_genai.Type.STRING },
            explanation: { type: import_genai.Type.STRING },
            introduction: { type: import_genai.Type.STRING },
            context: { type: import_genai.Type.STRING },
            howToProduce: { type: import_genai.Type.STRING },
            keyRules: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            words: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            transcript: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            practiceSentences: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            quiz: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  question: { type: import_genai.Type.STRING },
                  options: {
                    type: import_genai.Type.ARRAY,
                    items: { type: import_genai.Type.STRING }
                  },
                  explanation: { type: import_genai.Type.STRING }
                },
                required: ["question", "options", "explanation"]
              }
            }
          },
          required: ["title", "description", "quiz"]
        }
      }
    });
    const text = response.text || "{}";
    const parsedTranslation = JSON.parse(text);
    import_fs.default.writeFileSync(cachePath, JSON.stringify(parsedTranslation, null, 2), "utf-8");
    return res.json(parsedTranslation);
  } catch (err) {
    console.error("Translation generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate translation" });
  }
});
app.post("/api/tts", async (req, res) => {
  try {
    const { text, speakerName } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }
    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({ error: "Gemini API key is not configured for TTS." });
    }
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly in a natural conversational speed: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: speakerName || "Kore" }
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio });
    } else {
      return res.status(500).json({ error: "No voice generated from the model" });
    }
  } catch (err) {
    console.error("Gemini TTS Failed:", err);
    res.status(500).json({ error: err.message || "TTS speaking error" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath, { setHeaders: (res) => {
      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Security-Policy", "frame-ancestors *");
    } }));
    app.get("*", (req, res) => {
      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Security-Policy", "frame-ancestors *");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Room backend running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

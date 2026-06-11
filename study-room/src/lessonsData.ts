import { Lesson } from './types';

export const DEFAULT_LESSONS: Lesson[] = [
  // --- GRAMMAR ---
  {
    id: 'g-1',
    category: 'grammar',
    level: 'beginner',
    title: 'Present Continuous Tense',
    description: 'Learn how to describe actions happening right now at this moment.',
    xpReward: 150,
    estimatedMinutes: 8,
    content: {
      explanation: 'The Present Continuous tense is used to describe actions that are in progress right now (at the moment of speaking) or temporary situations.',
      keyRules: [
        'Form: Subject + am/is/are + verb-ing.',
        'Uses: Actions happening now, temporary habits, or current trends.',
        'Negative: Subject + am/is/are + not + verb-ing.',
        'Question: Am/Is/Are + Subject + verb-ing?'
      ],
      examples: [
        {
          english: 'I am learning English right now in my study room.',
          structureExplanation: 'Subject (I) + am + verb-ing (learning) + time indicator (right now).'
        },
        {
          english: 'She is writing an email to her manager.',
          structureExplanation: 'Subject (She) + is + verb-ing (writing). Third-person singular requires "is".'
        },
        {
          english: 'They are not watching television; they are reading.',
          structureExplanation: 'Negative present continuous (are not watching) followed by affirmative (are reading).'
        }
      ],
      quiz: [
        {
          id: 'g1-q1',
          question: 'Complete the sentence: "Listen! The birds ________ in the garden."',
          options: [
            'is singing',
            'are singing',
            'singing',
            'sing'
          ],
          answerIndex: 1,
          explanation: '"Birds" is plural, so we use the auxiliary "are" + "singing".'
        },
        {
          id: 'g1-q2',
          question: 'What is the correct negative form of: "He is doing his homework"?',
          options: [
            'He is not do his homework.',
            'He don\'t doing his homework.',
            'He isn\'t doing his homework.',
            'He is doing not homework.'
          ],
          answerIndex: 2,
          explanation: 'To form the negative, insert "not" after the auxiliary verb "is" (is not = isn\'t).'
        },
        {
          id: 'g1-q3',
          question: 'Identify the present continuous sentence:',
          options: [
            'I go to school every day.',
            'The sun is shining beautifully today.',
            'We enjoyed our trip to Tokyo last year.',
            'You will pass the English exam easily.'
          ],
          answerIndex: 1,
          explanation: '"The sun is shining" fits the [Subject + is + verb-ing] structure describing an action in progress.'
        }
      ]
    }
  },
  {
    id: 'g-2',
    category: 'grammar',
    level: 'intermediate',
    title: 'First and Second Conditionals',
    description: 'Learn to talk about real possibilities versus imaginary situations in the present and future.',
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      explanation: 'Conditionals describe the result of a certain condition. The First Conditional talks about real, possible future events. The Second Conditional talks about imaginary, hypothetical, or highly unlikely situations in the present/future.',
      keyRules: [
        'First Conditional rule: If + Present Simple, will + base verb. (For real/likely situations).',
        'Second Conditional rule: If + Past Simple, would + base verb. (For imaginary/unlikely situations).',
        'Note: In Second Conditional, "were" is preferred for all subjects with the verb "to be" (e.g., If I were you...).'
      ],
      examples: [
        {
          english: 'If it rains tomorrow, we will study inside.',
          structureExplanation: 'First conditional. Real possibility. If + Present Simple (rains), Main clause + will (will study).'
        },
        {
          english: 'If I won the lottery, I would travel around the world.',
          structureExplanation: 'Second conditional. Imaginary scenario. If + Past Simple (won), Main clause + would (would travel).'
        },
        {
          english: 'If I were a bird, I would fly across the oceans.',
          structureExplanation: 'Second conditional. Impossible situation. Displays the use of "were" with singular subject "I".'
        }
      ],
      quiz: [
        {
          id: 'g2-q1',
          question: 'Complete the First Conditional: "If you ________ hard, you will pass your English exam."',
          options: [
            'study',
            'studied',
            'will study',
            'studies'
          ],
          answerIndex: 0,
          explanation: 'In first conditional "if-clauses", we use the Present Simple tense: "If you study...".'
        },
        {
          id: 'g2-q2',
          question: 'Choose the correct Second Conditional form: "If she ________ more money, she ________ a sports car."',
          options: [
            'has / will buy',
            'had / will buy',
            'had / would buy',
            'would have / bought'
          ],
          answerIndex: 2,
          explanation: 'Second conditional formula is If + Past Simple (had), would + base verb (would buy).'
        },
        {
          id: 'g2-q3',
          question: 'Which sentence represents an imaginary present advice context?',
          options: [
            'If I have time, I always cook dinner.',
            'If I were you, I would take that online pronunciation class.',
            'If you don\'t rush, you will miss the train.',
            'I\'ll call you when I reach Thailand.'
          ],
          answerIndex: 1,
          explanation: '"If I were you, I would..." is a classic advice phrase using the imaginary Second Conditional.'
        }
      ]
    }
  },
  {
    id: 'g-noun-common-proper',
    category: 'grammar',
    level: 'beginner',
    title: 'Noun Branches: Common vs. Proper Nouns',
    description: 'Understand the foundational blocks of nouns and master the difference between common names and specific proper titles.',
    xpReward: 150,
    estimatedMinutes: 6,
    content: {
      explanation: 'Nouns are naming words. Nouns represent people, places, things, or abstract ideas. The most fundamental branch of nouns splits general items (Common Nouns) from specific unique identities (Proper Nouns).',
      keyRules: [
        'A Common Noun is a generic name for a person, place, or thing in a class or group (e.g. city, teacher, park). Common nouns are not capitalized unless they start a sentence.',
        'A Proper Noun is the specific, unique name of an individual person, place, or thing (e.g. London, Mr. Harrison, Yellowstone National Park, Monday). Proper nouns always start with a capital letter.',
        'Proper nouns encompass names of people, specific geographic features, days, months, holidays, brands, and titles.'
      ],
      examples: [
        {
          english: 'The young woman drove a brand-new car into the busy city.',
          structureExplanation: 'All nouns in this sentence (woman, car, city) are general common nouns. They do not refer to specific, unique items and thus are uncapitalized.'
        },
        {
          english: 'Alice drove her Toyota through the streets of Paris.',
          structureExplanation: 'Here, "Alice" (specific person), "Toyota" (specific brand/car), and "Paris" (specific city) are Proper Nouns. They are capitalized, regardless of position.'
        },
        {
          english: 'We started our interesting course on Tuesday.',
          structureExplanation: '"course" is a common noun, while "Tuesday" is a proper noun since it represents a specific named day of the week.'
        }
      ],
      quiz: [
        {
          id: 'gncp-q1',
          question: 'Identify the proper noun in the following sentence: "We spent the holiday exploring a quiet museum in Tokyo."',
          options: [
            'holiday',
            'museum',
            'Tokyo',
            'quiet'
          ],
          answerIndex: 2,
          explanation: '"Tokyo" is the specific name of a city, making it a proper noun. "Holiday" and "museum" are general categories (common nouns), and "quiet" is an adjective.'
        },
        {
          id: 'gncp-q2',
          question: 'Find the sentence with correct capitalization:',
          options: [
            'Every Wednesday, my class visits Dr. Peterson at mercy hospital.',
            'Every wednesday, my class visits Dr. Peterson at Mercy Hospital.',
            'Every Wednesday, my class visits Dr. Peterson at Mercy Hospital.',
            'Every wednesday, my Class visits dr. Peterson at mercy hospital.'
          ],
          answerIndex: 2,
          explanation: '"Wednesday" (day), "Dr. Peterson" (person\'s title and name), and "Mercy Hospital" (specific hospital) are all proper nouns requiring capitalization.'
        },
        {
          id: 'gncp-q3',
          question: 'Which of the following pairs contains one common noun and one proper noun?',
          options: [
            'ocean / river',
            'country / France',
            'Microsoft / Apple',
            'man / building'
          ],
          answerIndex: 1,
          explanation: '"country" is a general common noun; "France" is a specific country name, which makes it a proper noun.'
        }
      ]
    }
  },
  {
    id: 'g-noun-concrete-abstract',
    category: 'grammar',
    level: 'beginner',
    title: 'Noun Branches: Concrete vs. Abstract Nouns',
    description: 'Learn to classify nouns based on physical experience: those you can touch and perceive vs. ideas, state of being, and concept.',
    xpReward: 150,
    estimatedMinutes: 6,
    content: {
      explanation: 'Another distinct branch of nouns deals with physical existence. Concrete Nouns represent things that have a physical presence, while Abstract Nouns represent states, emotions, concepts, or ideas that cannot be perceived by the five senses.',
      keyRules: [
        'Concrete Nouns can be detected by at least one of your five senses (sight, hearing, touch, smell, or taste). Examples: coffee, stone, baby, song, smoke.',
        'Abstract Nouns name ideas, quality traits, emotions, conditions, or concepts that have no physical existence. Examples: love, danger, intelligence, honesty, freedom.',
        'Abstract nouns cannot be touched, held, tasted, or seen, but they are vital for expressing complex thoughts and feelings.'
      ],
      examples: [
        {
          english: 'The student wrote the answers on the paper using a heavy metal pen.',
          structureExplanation: 'All nouns here (student, answers, paper, pen) are concrete because they describe physical entities or written symbols that you can physically look at or touch.'
        },
        {
          english: 'True friendship is built on mutual trust and absolute honesty.',
          structureExplanation: '"friendship", "trust", and "honesty" are abstract nouns. They represent social structures, feelings, or moral virtues with no physical form.'
        },
        {
          english: 'The delicious smell of warm bread filled the small bakery.',
          structureExplanation: '"smell" (sensory perception), "bread" (physical object), and "bakery" (building) are concrete nouns.'
        }
      ],
      quiz: [
        {
          id: 'gnca-q1',
          question: 'Which of these nouns is an abstract noun denoting a state or emotion?',
          options: [
            'Guitar',
            'Happiness',
            'Perfume',
            'Raindrop'
          ],
          answerIndex: 1,
          explanation: '"Happiness" is an emotional state with no physical substance, making it an abstract noun. Guitar, Perfume, and Raindrop are physical objects.'
        },
        {
          id: 'gnca-q2',
          question: 'Identify the concrete noun in this sentence: "Her courage inspired everyone in the courtroom."',
          options: [
            'courage',
            'inspired',
            'everyone',
            'courtroom'
          ],
          answerIndex: 3,
          explanation: '"courtroom" represents a physical room/building (concrete noun). "courage" is an abstract qualities noun.'
        },
        {
          id: 'gnca-q3',
          question: 'Choose the group containing ONLY abstract nouns:',
          options: [
            'Justice, fear, wisdom',
            'Wind, shadow, ice',
            'Teacher, curriculum, grade',
            'Book, knowledge, alphabet'
          ],
          answerIndex: 0,
          explanation: '"Justice" (concept), "fear" (emotion), and "wisdom" (intellectual property) are entirely abstract with no direct physical form.'
        }
      ]
    }
  },
  {
    id: 'g-noun-countable-uncountable',
    category: 'grammar',
    level: 'intermediate',
    title: 'Noun Branches: Countable vs. Uncountable Nouns',
    description: 'Master how English separates individual countable units from mass quantities, and learn correct quantifiers.',
    xpReward: 180,
    estimatedMinutes: 8,
    content: {
      explanation: 'This noun branch deals with quantification. Countable Nouns are items we can split and count as individual objects. Uncountable Nouns are seen as a whole undivided bulk or general abstract substance that cannot be counted in units without containers or specific measuring words.',
      keyRules: [
        'Countable nouns can have singular or plural forms (e.g. one dog, two dogs). They can take the indefinite articles "a" or "an" when singular.',
        'Uncountable nouns (or Mass nouns) have only one form. They are treated as singular but cannot take "a" or "an". Examples: water, luggage, advice, sand, air, money.',
        'Use "many", "few", "a few", or number counts for countable nouns. Use "much", "little", "a little", or "some" for uncountable nouns.',
        'To count uncountable nouns, append a unit phrase: "a glass of water", "three pieces of luggage", "a bit of advice".'
      ],
      examples: [
        {
          english: 'She has three books and a dictionary on her office desk.',
          structureExplanation: '"books", "dictionary", and "desk" are countable nouns. "books" has a plural ending "s" and a numeral "three". "dictionary" uses article "a".'
        },
        {
          english: 'We would love some information about the hotel accommodations and luggage storage.',
          structureExplanation: '"information" and "luggage" are uncountable nouns in English. We do not say "an information" or "luggages". We use "some" to denote quantity.'
        },
        {
          english: 'He spent too much money buying beautiful new furniture.',
          structureExplanation: 'Both "money" and "furniture" are uncountable. They use "much" instead of "many", and do not terminate in "s".'
        }
      ],
      quiz: [
        {
          id: 'gncu-q1',
          question: 'Which of the following nouns is UNCOUNTABLE in English?',
          options: [
            'Luggage',
            'Suitcase',
            'Bag',
            'Ticket'
          ],
          answerIndex: 0,
          explanation: '"Luggage" is an uncountable collective mass in English. "Suitcase", "Bag", and "Ticket" are regular countable nouns.'
        },
        {
          id: 'gncu-q2',
          question: 'Complete the sentence with the correct quantifier: "We have very ________ time remaining; please hurry!"',
          options: [
            'few',
            'little',
            'many',
            'a few'
          ],
          answerIndex: 1,
          explanation: '"time" (in this general context) is uncountable, so we use "little". "Few" is reserved for countable plurals (e.g., "few minutes").'
        },
        {
          id: 'gncu-q3',
          question: 'Identify the grammatically correct sentence:',
          options: [
            'Could you give me some advices?',
            'The chef needs much flour to bake the cake.',
            'He bought three furnitures for his living room.',
            'I have many homeworks to do tonight.'
          ],
          answerIndex: 1,
          explanation: '"flour" is uncountable and correctly uses "much". Advice, furniture, and homework are uncountable and cannot be pluralized as "advices", "furnitures", or "homeworks".'
        }
      ]
    }
  },
  {
    id: 'g-noun-collective-compound',
    category: 'grammar',
    level: 'intermediate',
    title: 'Noun Branches: Collective & Compound Nouns',
    description: 'Learn collective nouns that capture a group as a single entity and compound nouns formed by linking words.',
    xpReward: 180,
    estimatedMinutes: 8,
    content: {
      explanation: 'These branches specialize in combining entities. Collective Nouns represent single groups of multiple individuals. Compound Nouns merge two or more distinct words to form a completely new conceptual noun.',
      keyRules: [
        'Collective Nouns name groups of people, animals, or objects (e.g., team, family, audience, pack, herd, swarm).',
        'In American English, collective nouns usually govern singular verbs when acting as a unified body ("the team is playing well"). In British English, plural verbs are also common ("the team are arguing among themselves").',
        'Compound Nouns are made of two or more words. They can be written as one closed word (e.g., toothbrush, classroom), separated by a space (e.g., ice cream, post office), or hyphenated (e.g., mother-in-law, well-being).'
      ],
      examples: [
        {
          english: 'The noisy crowd was asked to leave the quiet theater immediately.',
          structureExplanation: '"crowd" is a collective noun designating a large group of people. In this sentence, it takes the singular verb form "was".'
        },
        {
          english: 'My brother-in-law bought a warm raincoat before visiting the post office.',
          structureExplanation: 'Three compound nouns in action: "brother-in-law" (hyphenated), "raincoat" (closed compound), and "post office" (spaced compound).'
        },
        {
          english: 'A small swarm of bees was seen buzzing near the swimming pool.',
          structureExplanation: '"swarm" is a collective noun for bees. "swimming pool" is a spaced compound noun.'
        }
      ],
      quiz: [
        {
          id: 'gncc-q1',
          question: 'Which word is a collective noun representing a group of experts or decision-makers?',
          options: [
            'Manager',
            'Committee',
            'Worker',
            'Business'
          ],
          answerIndex: 1,
          explanation: '"Committee" is a collective noun representing a formal assembly of multiple individuals acting as a single unit.'
        },
        {
          id: 'gncc-q2',
          question: 'Identify the compound noun that is written under a hyphenated form:',
          options: [
            'Classroom',
            'Hot dog',
            'Father-in-law',
            'Air conditioner'
          ],
          answerIndex: 2,
          explanation: '"Father-in-law" is a hyphenated compound noun. "Classroom" is closed, and "Hot dog" and "Air conditioner" are spaced.'
        },
        {
          id: 'gncc-q3',
          question: 'Choose the correct verb form for collective singular agreement: "The herd of cows ________ grazing in the green meadow."',
          options: [
            'is',
            'are',
            'were',
            'be'
          ],
          answerIndex: 0,
          explanation: '"herd" is a singular collective noun representing the group, so it takes the singular verb "is" in standard formal grammar.'
        }
      ]
    }
  },
  {
    id: 'g-noun-possessive-plural',
    category: 'grammar',
    level: 'intermediate',
    title: 'Noun Branches: Possessive & Plural Nouns',
    description: 'Learn correct apostrophe and spelling rules for regular plurals, irregular forms, and complex ownership expressions.',
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: 'This critical branch explains how nouns alter their spelling to express quantities greater than one (Plurals) and to manifest ownership or relationship (Possessives). Rules differ for regular and irregular forms.',
      keyRules: [
        'Regular Plurals add "-s" (cat -> cats). Nouns ending in -ch, -s, -sh, -x, or -z add "-es" (box -> boxes). Consonant + "y" endings change to "-ies" (baby -> babies).',
        'Irregular Plurals do not follow the "-s" rule (e.g., child -> children, foot -> feet, leaf -> leaves, mouse -> mice, sheep -> sheep).',
        'Singular Possessives: Add apostrophe + s (\'s) even if the noun ends in -s (e.g. "my cat\'s collar", "Charles\'s book").',
        'Plural Possessives ending in "s": Just add a lone apostrophe. E.g., "the players\' coach". Plural possessives not ending in "s" add \'s: "the children\'s schoolbag".'
      ],
      examples: [
        {
          english: 'The children\'s books are placed on the bottom shelves of the library.',
          structureExplanation: '"children" is an irregular plural (child -> children). We add "\'s" to denote ownership by the children. "shelves" is plural (shelf -> shelves).'
        },
        {
          english: 'Those three actresses\' spectacular dresses were chosen by professional stylists.',
          structureExplanation: '"actresses" is a regular plural ending in "s". To show possession, we append only the apostrophe (\') at the very end of the word.'
        },
        {
          english: 'Several wolves were chasing sheep outside the local farmer\'s property.',
          structureExplanation: '"wolves" (plural of wolf) and "sheep" (plural of sheep - identical form). "farmer\'s" displays singular possession.'
        }
      ],
      quiz: [
        {
          id: 'gnpp-q1',
          question: 'What is the correct plural form of the word "Tooth"?',
          options: [
            'Tooths',
            'Teeth',
            'Teeths',
            'Toothes'
          ],
          answerIndex: 1,
          explanation: '"Tooth" has an irregular plural change which replaces the internal vowels: "Teeth".'
        },
        {
          id: 'gnpp-q2',
          question: 'Choose the correct possessive formulation to denote toys belonging to multiple puppies:',
          options: [
            'The puppies\'s toy is on the lawn.',
            'The puppies\' toys are on the lawn.',
            'The puppy\'s toys are on the lawn.',
            'The puppies toys are on the lawn.'
          ],
          answerIndex: 1,
          explanation: '"puppies" is the plural of puppy. Because it ends in "s", we add only a trailing apostrophe (\') to make it plural possessive.'
        },
        {
          id: 'gnpp-q3',
          question: 'Complete the sentence: "The main door of the ________ dressing room was locked."',
          options: [
            'womens',
            'women\'s',
            'womens\'',
            'woman\'s'
          ],
          answerIndex: 1,
          explanation: '"women" is an irregular plural not ending in "s". To form its possessive, we add standard "\'s".'
        }
      ]
    }
  },
  {
    id: 'g-3',
    category: 'grammar',
    level: 'intermediate',
    title: 'Present Perfect vs. Past Simple',
    description: 'Learn when to tie events to the present versus describing finished, distinct historical timeframes.',
    xpReward: 180,
    estimatedMinutes: 10,
    content: {
      explanation: 'Modern English distinguishes heavily between completed past actions with an active connection to the present (Present Perfect) and actions locked inside completed historic time (Past Simple).',
      keyRules: [
        'Present Perfect: Subject + have/has + past participle. Used for life experience, duration up to now, or modern results of past actions with NO specific time given.',
        'Past Simple: Subject + past verb. Used for completely completed actions occurring inside restricted, finished past times (yesterday, last year, in 2012).',
        'Time markers differ: "Since", "for", "yet", "already", and "ever" point to Present Perfect. "Yesterday", "ago", "last week", and "when I was small" require Past Simple.'
      ],
      examples: [
        {
          english: 'I have visited Rome three times in my life, and I know it well.',
          structureExplanation: 'Present Perfect (have visited). Focused on general accumulated life experience up to this moment.'
        },
        {
          english: 'I visited Rome last May with my college roommate.',
          structureExplanation: 'Past Simple (visited) triggered by the explicit finished timeframe "last May".'
        },
        {
          english: 'He has lived here for six years (and still lives here). He moved here in 2018.',
          structureExplanation: 'Present perfect indicates an active continuing duration. Second clause uses Past Simple to pin-point the specific move year.'
        }
      ],
      quiz: [
        {
          id: 'g3-q1',
          question: 'Complete the sentence: "She ________ in this city since she was ten years old."',
          options: [
            'lived',
            'lives',
            'has lived',
            'is living'
          ],
          answerIndex: 2,
          explanation: '"Since" indicates a duration starting in the past and continuing up to now, demanding the Present Perfect "has lived".'
        },
        {
          id: 'g3-q2',
          question: 'Choose the correct past-pointing sentence:',
          options: [
            'I have seen that movie yesterday afternoon.',
            'I saw that movie yesterday afternoon.',
            'I seen that movie yesterday afternoon.',
            'I am seeing that movie yesterday afternoon.'
          ],
          answerIndex: 1,
          explanation: '"Yesterday afternoon" is a fully completed past time, requiring the Past Simple verb "saw".'
        },
        {
          id: 'g3-q3',
          question: 'What is the question to ask if someone has done something at any point in their life?',
          options: [
            'Did you ever eat sushi?',
            'Have you ever eaten sushi?',
            'Were you eating sushi?',
            'Do you eat sushi last year?'
          ],
          answerIndex: 1,
          explanation: '"Have you ever + past participle?" is the correct Present Perfect pattern to ask about lifetime experience.'
        }
      ]
    }
  },
  {
    id: 'g-4',
    category: 'grammar',
    level: 'intermediate',
    title: 'The Passive Voice',
    description: 'Learn how to alter sentence focus from the person doing the action to the entity receiving the action.',
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: 'The Passive Voice is used when the focus is on the action itself or on the person/thing affected by the action, rather than the agent performing the action.',
      keyRules: [
        'Form of Passive: Subject (receiver) + appropriate form of verb "to be" + Past Participle of the main verb.',
        'If we want to mention the agent (the doer), we introduce them using the preposition "by".',
        'Passive is very common in journalism, scientific reports, and formal business letters to establish neutral, objective tones.'
      ],
      examples: [
        {
          english: 'The beautiful glass window was broken by the strong wind.',
          structureExplanation: 'The window (receiver) + was (past of verb to be) + broken (past participle of break) + by wind (agent).'
        },
        {
          english: 'Spanish is spoken in many countries across South America.',
          structureExplanation: 'Present passive (is spoken) focusing on the language itself. The actual individuals speaking are omitted as they are obvious.'
        },
        {
          english: 'The complex software project will be finished next Monday.',
          structureExplanation: 'Future passive voice: "will be" + past participle "finished".'
        }
      ],
      quiz: [
        {
          id: 'g4-q1',
          question: 'Change this active sentence to a passive sentence: "My brother painted the kitchen yesterday."',
          options: [
            'The kitchen was painted by my brother yesterday.',
            'The kitchen painted by my brother yesterday.',
            'The kitchen is painted by my brother yesterday.',
            'The kitchen has been painted yesterday by my brother.'
          ],
          answerIndex: 0,
          explanation: '"kitchen" is singular, so we use "was" (Past Simple of be) + past participle "painted" + "by my brother".'
        },
        {
          id: 'g4-q2',
          question: 'Identify the sentence in the passive voice:',
          options: [
            'They are building a modern bridge downtown.',
            'A modern bridge is being built downtown.',
            'A modern bridge was built by active workers.',
            'Both B and C are passive voice sentences.'
          ],
          answerIndex: 3,
          explanation: 'Both "is being built" (present continuous passive) and "was built" (past simple passive) are passive-voice structures.'
        },
        {
          id: 'g4-q3',
          question: 'Complete the sentence: "Bicycles ________ in this factory since 1995."',
          options: [
            'are made',
            'have been made',
            'made',
            'were made'
          ],
          answerIndex: 1,
          explanation: 'The time indicator "since 1995" requires the Present Perfect Passive: "have been made".'
        }
      ]
    }
  },
  {
    id: 'g-5',
    category: 'grammar',
    level: 'advanced',
    title: 'Reported Speech',
    description: 'Master backshifting tenses and modifying pronouns to accurately report what another person said.',
    xpReward: 220,
    estimatedMinutes: 11,
    content: {
      explanation: 'Reported speech (or Indirect Speech) is used to tell someone what another person said without repeating their exact words. We use reporting verbs like "say" or "tell" and backshift the original tense into the past.',
      keyRules: [
        'Backshift rule: Shift the tense back into the past when reporting. E.g., Present Simple -> Past Simple; Present Continuous -> Past Continuous; Will -> Would.',
        'Pronouns shift to match the new perspective (e.g., "I like cake" -> "She said she liked cake").',
        'Time clauses adjust: "tomorrow" -> "the next day", "yesterday" -> "the day before", "here" -> "there".',
        'If the original sentence is a question, use "if" or "whether" for yes/no questions, and restore standard affirmative word order (no "do/does/did").'
      ],
      examples: [
        {
          english: 'He said that he was studying for his final examinations.',
          structureExplanation: 'Reported. Original direct was: "I am studying for my examinations" (Present continuous shifted to Past Continuous).'
        },
        {
          english: 'She told me that she had already visited Spain the year before.',
          structureExplanation: 'Reported. Original direct was: "I already visited Spain last year" (Past simple shifts back to Past Perfect "had visited", and last year backshifts).'
        },
        {
          english: 'They asked me if I lived in this neighborhood.',
          structureExplanation: 'Reported question. Original was the yes/no question: "Do you live in this neighborhood?". Standard word order has changed, removing "Do".'
        }
      ],
      quiz: [
        {
          id: 'g5-q1',
          question: 'Report the direct quote: "I will call you tomorrow," said Henry to Sarah.',
          options: [
            'Henry said she would call me the next day.',
            'Henry told Sarah that he would call her the next day.',
            'Henry said Sarah that he will call her tomorrow.',
            'Henry told Sarah that he will call her tomorrow.'
          ],
          answerIndex: 1,
          explanation: '"will" shifts to "would", "I" shifts to "he", "you" shifts to "her", and "tomorrow" backshifts to "the next day". We use "told" when the listener (Sarah) is named.'
        },
        {
          id: 'g5-q2',
          question: 'What is the correct reported speech form of: "Where do you work?" asked Mary.',
          options: [
            'Mary asked me where did I work.',
            'Mary asked me where I worked.',
            'Mary asked me if I worked.',
            'Mary asked me where do I work.'
          ],
          answerIndex: 1,
          explanation: '"Where do you work?" is a Wh-question. In reported speech, we drop the auxiliary "do" and restore declarative statement word order: "where I worked".'
        },
        {
          id: 'g5-q3',
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
    id: 'v-1',
    category: 'vocabulary',
    level: 'beginner',
    title: 'Essential Hotel & Travel Phrases',
    description: 'Learn the most common words and expressions used when checking into a hotel or traveling.',
    xpReward: 120,
    estimatedMinutes: 6,
    content: {
      introduction: 'Traveling to an English-speaking country can be exciting! Here are the core vocabulary words you need to speak with hotel clerks and guide services confidently.',
      words: [
        {
          word: 'Reservation',
          partOfSpeech: 'noun',
          definition: 'An arrangement to secure a room, seat, or table in advance.',
          englishExample: 'I have a reservation under the name "Tanaka".'
        },
        {
          word: 'Check-in',
          partOfSpeech: 'noun / verb',
          definition: 'The process of registering and receiving keys at a hotel or airport.',
          englishExample: 'What is the official check-in time of this hotel?'
        },
        {
          word: 'Amenities',
          partOfSpeech: 'noun',
          definition: 'Useful features or facilities of a building, such as a swimming pool, gym, or free Wi-Fi.',
          englishExample: 'The hotel amenities include a fitness center, a spa, and complimentary breakfast.'
        },
        {
          word: 'Shuttle service',
          partOfSpeech: 'noun',
          definition: 'A passenger vehicle that makes frequent short trips back and forth between two points.',
          englishExample: 'Does the resort provide a free shuttle service to the airport?'
        }
      ],
      quiz: [
        {
          id: 'v1-q1',
          question: 'What is the word for "an arrangement to secure a room in advance"?',
          options: [
            'Lobby',
            'Reservation',
            'Checkout',
            'Luggage'
          ],
          answerIndex: 1,
          explanation: '"Reservation" means reserving a room or service in advance.'
        },
        {
          id: 'v1-q2',
          question: 'Complete the request: "Excuse me, I\'d like to ________ our keys and verify our check-out time."',
          options: [
            'shuttle',
            'amenity',
            'return',
            'registering'
          ],
          answerIndex: 2,
          explanation: '"Return" fits best: "I\'d like to return our keys...".'
        },
        {
          id: 'v1-q3',
          question: 'Free gym, swimming pool, and high-speed Wi-Fi are examples of:',
          options: [
            'Amenities',
            'Reservations',
            'Check-ins',
            'Shuttle services'
          ],
          answerIndex: 0,
          explanation: 'These features and physical conveniences are defined as hotel "Amenities".'
        }
      ]
    }
  },
  {
    id: 'v-2',
    category: 'vocabulary',
    level: 'advanced',
    title: 'Idiomatic Corporate & Business English',
    description: 'Master professional metaphors and business idioms to excel in workspace negotiations and meetings.',
    xpReward: 220,
    estimatedMinutes: 10,
    content: {
      introduction: 'Business meetings in global settings are filled with slang and metaphors. To understand colleagues, master these high-frequency corporate idioms.',
      words: [
        {
          word: 'On the same page',
          partOfSpeech: 'idiom',
          definition: 'In agreement; sharing the exact same understanding or plan.',
          englishExample: 'Let\'s review the proposal once more to make sure we are all on the same page.'
        },
        {
          word: 'Touch base',
          partOfSpeech: 'idiom / verb',
          definition: 'Briefly make contact with someone to update each other or review progress.',
          englishExample: 'I will touch base with you tomorrow afternoon after checking the project budget.'
        },
        {
          word: 'Think outside the box',
          partOfSpeech: 'idiom',
          definition: 'Generate creative and unorthodox solutions; step outside normal logic rules.',
          englishExample: 'To beat our competitors, our layout designers must start thinking outside the box.'
        },
        {
          word: 'Keep me in the loop',
          partOfSpeech: 'idiom / phrase',
          definition: 'Keep someone informed about a plan, updates, or progress.',
          englishExample: 'Please keep me in the loop regarding the client\'s feedback.'
        }
      ],
      quiz: [
        {
          id: 'v2-q1',
          question: 'Which idiom means "briefly connect with someone to get an update"?',
          options: [
            'Think outside the box',
            'Touch base',
            'On the same page',
            'Move the needle'
          ],
          answerIndex: 1,
          explanation: '"Touch base" is a baseball metaphor meaning to contact/chat with someone briefly.'
        },
        {
          id: 'v2-q2',
          question: 'What does "being on the same page" refer to?',
          options: [
            'Reading the identical corporate report',
            'Having the exact same agreement or understanding',
            'Working on paper instead of digital screens',
            'Publishing a document at the same hour'
          ],
          answerIndex: 1,
          explanation: '"On the same page" refers to sharing the same viewpoint or understanding on a project.'
        },
        {
          id: 'v2-q3',
          question: 'When a manager asks you to "think outside the box", they want:',
          options: [
            'Unorthodox, creative, innovative solutions',
            'To double check shipping container boxes',
            'Work strictly inside the standard routine rules from the textbook',
            'A basic presentation template'
          ],
          answerIndex: 0,
          explanation: '"Outside the box" designates highly creative and innovative thinking.'
        }
      ]
    }
  },

  // --- LISTENING ---
  {
    id: 'l-1',
    category: 'listening',
    level: 'beginner',
    title: 'Ordering Coffee at a Lively Cafe',
    description: 'Listen to a natural everyday conversation between a customer and a barista.',
    xpReward: 140,
    estimatedMinutes: 7,
    content: {
      context: 'Sarah walks into "The Daily Grind" cafe to order her morning coffee. Barron is working as the cashier barricaded behind the brewing machine.',
      speakerNames: ['Barista', 'Sarah'],
      transcript: [
        { speaker: 'Barista', text: 'Good morning! Welcome to The Daily Grind. What can I get started for you today?' },
        { speaker: 'Sarah', text: 'Hi there! Can I please get a medium hot cafe latte?' },
        { speaker: 'Barista', text: 'Sure thing! Do you have any milk preference? We have whole milk, skim milk, oat milk, or almond milk.' },
        { speaker: 'Sarah', text: 'I would love oat milk, please. Oh, and can you make it half-sweet? I don\'t want it too sugary.' },
        { speaker: 'Barista', text: 'Got it. One medium oat milk latte, half-sweet. Are we staying here or is that to-go?' },
        { speaker: 'Sarah', text: 'To-go, please. I also see those blueberry muffins in the display case. Are they freshly baked?' },
        { speaker: 'Barista', text: 'Yes, they are! Our baker brought them in just an hour ago. They are still warm.' },
        { speaker: 'Sarah', text: 'Perfect! I\'ll take one blueberry muffin as well.' },
        { speaker: 'Barista', text: 'You got it. That will be one medium oat milk latte and one muffin. Your total is eight dollars and fifty cents.' }
      ],
      quiz: [
        {
          id: 'l1-q1',
          question: 'What kind of beverage did Sarah order?',
          options: [
            'A cold brew coffee',
            'A medium hot cafe latte',
            'An iced green tea',
            'An espresso shot'
          ],
          answerIndex: 1,
          explanation: 'Sarah explicitly says: "Can I please get a medium hot cafe latte?"'
        },
        {
          id: 'l1-q2',
          question: 'Which milk substitute did Sarah request for her coffee?',
          options: [
            'Whole milk',
            'Almond milk',
            'Oat milk',
            'Skim milk'
          ],
          answerIndex: 2,
          explanation: 'She says: "I would love oat milk, please."'
        },
        {
          id: 'l1-q3',
          question: 'Why did Sarah decide to buy a blueberry muffin?',
          options: [
            'It was on a 50% discount sale.',
            'They were freshly baked and still warm.',
            'The barista gave it to her for free.',
            'She is gluten-intolerant and needed a snack.'
          ],
          answerIndex: 1,
          explanation: 'The barista mentions the baker brought them in an hour ago and they are still warm, which prompts Sarah to say "Perfect! I\'ll take one...".'
        }
      ]
    }
  },
  {
    id: 'l-2',
    category: 'listening',
    level: 'intermediate',
    title: 'The Busy Airport Boarding Call',
    description: 'Listen to a typical speaker announcement made at an international departure terminal gate.',
    xpReward: 180,
    estimatedMinutes: 9,
    content: {
      context: 'A final announcements announcer speaker chimes over terminal 4 gates at Bangkok International Airport during departure hour.',
      speakerNames: ['Gate Announcer'],
      transcript: [
        { speaker: 'Gate Announcer', text: 'Attention all passengers. This is the pre-boarding announcement for flight TG-679 with service to London Heathrow, currently boarding at Gate forty-two.' },
        { speaker: 'Gate Announcer', text: 'We would like to invite passengers with small children, and those requiring special assistance, to step forward and begin boarding at this time.' },
        { speaker: 'Gate Announcer', text: 'We also request our First Class and Business Class premium club passengers to queue in Lane A.' },
        { speaker: 'Gate Announcer', text: 'Economy class passengers will be called shortly by boarding group numbers. Please check your physical boarding pass for your Group letter: A, B, or C.' },
        { speaker: 'Gate Announcer', text: 'Please ensure your flight cabin luggage bags meet the airline size limits, and have your passport and boarding pass ready for ticket inspection at the podium. Thank you.' }
      ],
      quiz: [
        {
          id: 'l2-q1',
          question: 'What is the flight number and final destination mentioned in the boarding announcement?',
          options: [
            'Flight LA-100 to Los Angeles',
            'Flight TG-679 to London Heathrow',
            'Flight EK-384 to Dubai',
            'Flight Thai-505 to Tokyo Narita'
          ],
          answerIndex: 1,
          explanation: 'The announcer states the flight number is "TG-679 with service to London Heathrow".'
        },
        {
          id: 'l2-q2',
          question: 'Who is invited to board during the first pre-boarding sequence?',
          options: [
            'Economy class group C passengers',
            'First Class status level flyers',
            'Passengers with small children and individuals requiring special assistance',
            'Flight attendants and administrative airport staff'
          ],
          answerIndex: 2,
          explanation: 'The announcement states: "invite passengers with small children, and those requiring special assistance...".'
        },
        {
          id: 'l2-q3',
          question: 'Which physical items are passengers requested to prepare for scanning?',
          options: [
            'Passport and visa paperwork printouts',
            'Their carry-on luggage baggage declaration receipt',
            'Their passport and boarding pass',
            'Their cell phone ticket email scan'
          ],
          answerIndex: 2,
          explanation: 'The announcer requests to: "have your passport and boarding pass ready for ticket inspection...".'
        }
      ]
    }
  },

  // --- PRONUNCIATION ---
  {
    id: 'p-1',
    category: 'pronunciation',
    level: 'beginner',
    title: 'The Two English "TH" Sounds',
    description: 'Master the difference between the Voiceless "TH" and Voiced "TH" sounds, which are crucial for clear accent work.',
    xpReward: 160,
    estimatedMinutes: 8,
    content: {
      phoneme: 'Voiceless /θ/ vs. Voiced /ð/',
      howToProduce: 'To make both "TH" sounds, place the tip of your tongue very slightly between your upper and lower front teeth. Do NOT bite hard. For the Voiceless /θ/ (as in "think"), push only air through without utilizing your throat vocal cords. For the Voiced /ð/ (as in "this"), activate your vocal cords to feel a vibration on your tongue.',
      practiceWords: [
        { word: 'Think', ipa: '/θɪŋk/', guide: 'Voiceless. High air push, no throat vocal tone.' },
        { word: 'This', ipa: '/ðɪs/', guide: 'Voiced. Pronounce with focal vibration in the throat.' },
        { word: 'Three', ipa: '/θriː/', guide: 'Voiceless. Do not pronounce as "tree" or "free". Keep tongue forward.' },
        { word: 'Father', ipa: '/ˈfɑːðə/', guide: 'Voiced. Warm vocal hum in the middle of the word.' }
      ],
      practiceSentences: [
        {
          text: 'These three brothers think they are healthy.',
          emphasis: 'Combines multiplevoiced (These, brothers) and voiceless (three, think, healthy) sounds in succession.'
        },
        {
          text: 'Father and mother smoothed the clothing.',
          emphasis: 'Fully voiced /ð/ sentences. Notice the vibration on mother, father, smoothed, the, clothing.'
        }
      ],
      quiz: [
        {
          id: 'p1-q1',
          question: 'Which of the following words contains the Voiceless /θ/ sound (no throat vibration)?',
          options: [
            'There',
            'Thank you',
            'Though',
            'Other'
          ],
          answerIndex: 1,
          explanation: '"Thank you" uses the voiceless /θ/ sound, whereas There, Though, and Other contain throat vocalization (/ð/).'
        },
        {
          id: 'p1-q2',
          question: 'Where should your tongue be placed to correctly produce the "TH" sound?',
          options: [
            'Pressed flat against the bottom of your mouth',
            'Touch the hard roof of your mouth',
            'Slightly between your front teeth, pushing air past the gap',
            'Curled backward touching the uvula'
          ],
          answerIndex: 2,
          explanation: 'By slightly inserting the tip of the tongue between your upper and lower teeth, you create the narrow channel required for both TH fricatives.'
        },
        {
          id: 'p1-q3',
          question: 'Choose the word that has a different "TH" sound than the other three: "Thinking, Tooth, Thread, Together"',
          options: [
            'Thinking',
            'Tooth',
            'Thread',
            'Together'
          ],
          answerIndex: 3,
          explanation: 'Thinking (/θ/), Tooth (/θ/), and Thread (/θ/) are all voiceless. Together (/ð/) is voiced, making it the odd one out.'
        }
      ]
    }
  },
  {
    id: 'p-2',
    category: 'pronunciation',
    level: 'intermediate',
    title: 'Silent Letters & Word Connection',
    description: 'Learn which English letters to drop entirely and how words blend together in natural dialogs.',
    xpReward: 180,
    estimatedMinutes: 9,
    content: {
      phoneme: 'Silent B, K, W & Connected Speech',
      howToProduce: 'Many English words contain spelled letters that are never pronounced (e.g., knee, bomb, write). Additionally, when speaking quickly, the final consonant of one word connects with the first vowel of the next word (e.g., "cup of" sounds like "cup-ov").',
      practiceWords: [
        { word: 'Knee', ipa: '/niː/', guide: 'Silent letter K. Only pronounce /niː/.' },
        { word: 'Climb', ipa: '/klaɪm/', guide: 'Silent letter B. Never pronounce the final "b". stop at "m".' },
        { word: 'Answer', ipa: '/ˈɑːnsə/', guide: 'Silent letter W. Do not pronounce "w" sound inside.' },
        { word: 'Doubt', ipa: '/daʊt/', guide: 'Silent letter B. The "b" is not sounded: sounds exactly like "dout".' }
      ],
      practiceSentences: [
        {
          text: 'He knows how to climb the mountain without doubt.',
          emphasis: 'Contains silent K (knows), silent B (climb, doubt) and silent W (without).'
        },
        {
          text: 'She wrote a quick answer to her boss, then walked away.',
          emphasis: 'Connect "wrote a" (/roʊ-tə/) and look at silent W (wrote, answer) and silent L (walked).'
        }
      ],
      quiz: [
        {
          id: 'p2-q1',
          question: 'In the word "Wednesday", which letter is completely silent?',
          options: [
            'The first "d"',
            'The first "e"',
            'The "s"',
            'The "n"'
          ],
          answerIndex: 0,
          explanation: 'Wednesday is pronounced /ˈwɛnzdeɪ/, where the first letter "d" is completely dropped.'
        },
        {
          id: 'p2-q2',
          question: 'Choose the word that has a silent "k" at the beginning:',
          options: [
            'Kangaroo',
            'Keyboard',
            'Knowledge',
            'Kingdom'
          ],
          answerIndex: 2,
          explanation: '"Knowledge" is pronounced starting directly with the /n/ sound; the "K" is completely silent.'
        },
        {
          id: 'p2-q3',
          question: 'How is "climb to the top" connected in natural speech?',
          options: [
            'By shouting each word with a heavy pause between them',
            'The silent letter "b" in climb remains unpronounced, and the vocal energy flows directly from "clime" to "to"',
            'By pronouncing the letter "b" to make "climb-ba"',
            'By spelling out letters out loud'
          ],
          answerIndex: 1,
          explanation: 'Because B is silent, "climb" ends in the "m" sound, blending seamlessly with the preposition "to".'
        }
      ]
    }
  },

  // === PRESENT SIMPLE TENSE ===
  {
    id: 'g-tense-present-simple',
    category: 'grammar',
    level: 'beginner',
    title: 'Present Simple Tense',
    description: 'Master the core tense for general truths, daily habits, and permanent states.',
    xpReward: 150,
    estimatedMinutes: 7,
    content: {
      explanation: 'The Present Simple tense is the most fundamental building block in English grammar. It is used to talk about facts that are always true, habits, daily routines, or permanent states of being.',
      keyRules: [
        'Affirmative: Subject + verb (add -s or -es for singular third-person: he, she, it).',
        'Negative: Subject + do not (don\'t) / does not (doesn\'t) + base verb (no -s).',
        'Interrogative: Do / Does + Subject + base verb?',
        'State verbs: Often used with non-continuous thinking/feeling verbs (know, believe, like, love).'
      ],
      examples: [
        {
          english: 'Water boils at 100 degrees Celsius under standard atmospheric pressure.',
          structureExplanation: 'General truth / scientific fact. "Water" is singular (it), so we add "-s" to "boil" -> "boils".'
        },
        {
          english: 'He does not drink coffee in the evening, but he always enjoys tea.',
          structureExplanation: 'Negative habit. "Does not" removes the "-s" of the main verb ("drink"). "Enjoys" is the affirmative singular.'
        },
        {
          english: 'Do you study English at the university every afternoon?',
          structureExplanation: 'Question pattern. Uses auxiliary "Do" at the front because the subject is "you".'
        }
      ],
      quiz: [
        {
          id: 'gps-q1',
          question: 'Which of the following sentences represents a correct third-person singular habit?',
          options: [
            'She go to the gym every Saturday morning.',
            'She goes to the gym every Saturday morning.',
            'She going to the gym every Saturday morning.',
            'She don\'t goes to the gym every Saturday morning.'
          ],
          answerIndex: 1,
          explanation: '"She" is third-person singular, which requires the verb ending "-es" (goes).'
        },
        {
          id: 'gps-q2',
          question: 'Choose the correct negative form of the sentence: "They like broccoli."',
          options: [
            'They doesn\'t like broccoli.',
            'They don\'t likes broccoli.',
            'They like not broccoli.',
            'They don\'t like broccoli.'
          ],
          answerIndex: 3,
          explanation: '"They" is plural, requiring the auxiliary "don\'t" + the base verb "like".'
        },
        {
          id: 'gps-q3',
          question: 'Complete the question: "________ your father work in downtown Chicago?"',
          options: [
            'Do',
            'Does',
            'Is',
            'Has'
          ],
          answerIndex: 1,
          explanation: '"Your father" is he (singular third-person), so we use the helper verb "Does" to initiate the question.'
        }
      ]
    }
  },

  // === PRESENT PERFECT TENSE ===
  {
    id: 'g-tense-present-perfect',
    category: 'grammar',
    level: 'intermediate',
    title: 'Present Perfect Simple Tense',
    description: 'Learn how to describe lifetime accomplishments, active duration, and past actions with current consequences.',
    xpReward: 160,
    estimatedMinutes: 8,
    content: {
      explanation: 'The Present Perfect Connects the present moment with the past. It shows that an action happened at an unspecified time in the past and carries an active relevance or result right now.',
      keyRules: [
        'Form: Subject + have / has + past participle (irregular or ending in -ed).',
        'Life Experiences: Describe what you have or haven\'t done without specifying a precise date.',
        'Just / Already / Yet: "Just" (very recently), "Already" (earlier than expected), "Yet" (not up to now; used in negatives and questions).',
        'For vs. Since: "For" measures the length of period (e.g. for 5 years). "Since" pinpoints the starting date/hour (e.g. since 2012).'
      ],
      examples: [
        {
          english: 'I have already lost my keys, so I cannot enter the classroom.',
          structureExplanation: 'Connection to present. The past lost action results in a present inability to get inside.'
        },
        {
          english: 'She has worked in London for six years and loves her current job.',
          structureExplanation: 'An action that started in the past and is still true or ongoing in the present.'
        },
        {
          english: 'Have they ever ridden a camel in the desert?',
          structureExplanation: 'Asking about generic life experience up to the present moment.'
        }
      ],
      quiz: [
        {
          id: 'gpp-q1',
          question: 'Complete the sentence: "We ________ to Paris twice, but we would love to go again."',
          options: [
            'have been',
            'were',
            'are gone',
            'has been'
          ],
          answerIndex: 0,
          explanation: '"We" takes the auxiliary "have". We use "have been" to describe life experiences of visiting somewhere and returning.'
        },
        {
          id: 'gpp-q2',
          question: 'What is the correct negative sentence denoting unfinished work?',
          options: [
            'I have finished already my homework yet.',
            'I hasn\'t finished my homework yet.',
            'I haven\'t finished my homework yet.',
            'I cleared my homework yet.'
          ],
          answerIndex: 2,
          explanation: '"I" is paired with "haven\'t". Adverb "yet" fits perfectly at the end of negative present perfect clauses.'
        },
        {
          id: 'gpp-q3',
          question: 'Choose "for" or "since" correctly: "He has been sick ________ Monday morning."',
          options: [
            'for',
            'since',
            'during',
            'ago'
          ],
          answerIndex: 1,
          explanation: '"Monday morning" is a specific starting time point, so we use "since".'
        }
      ]
    }
  },

  // === PRESENT PERFECT CONTINUOUS TENSE ===
  {
    id: 'g-tense-present-perfect-continuous',
    category: 'grammar',
    level: 'intermediate',
    title: 'Present Perfect Continuous Tense',
    description: 'Learn to emphasize the ongoing nature, duration, or recent physical consequences of an action starting in the past.',
    xpReward: 170,
    estimatedMinutes: 9,
    content: {
      explanation: 'The Present Perfect Continuous focuses on the duration or process of an activity that began in the past and is either still happening now, or has just finished and left highly visible physical signs.',
      keyRules: [
        'Form: Subject + have / has + been + verb-ing.',
        'Emphasize duration: Focused on "how long" we have been doing something.',
        'Temporary duration: Expresses temporary situations (e.g. I have been sleeping on the couch recently).',
        'State verbs exception: Verbs like like, know, believe, belong cannot be used in continuous forms; use Present Perfect Simple instead (e.g., I have known her for years, NOT I have been knowing).'
      ],
      examples: [
        {
          english: 'It has been raining continuously for three hours, and the ground is soaked.',
          structureExplanation: 'Action began in the past, is still ongoing, and has created visible physical wetness in the present.'
        },
        {
          english: 'I am exhausted because I have been working in the garden all morning.',
          structureExplanation: 'Focus on recent physical exertion. The work may have just completed, but the exhaustion resides key in the present.'
        },
        {
          english: 'How long have you been studying for your final English test?',
          structureExplanation: 'Standard question formula inquiring about continuous time duration up to now.'
        }
      ],
      quiz: [
        {
          id: 'gppc-q1',
          question: 'Complete the sentence: "Sorry about my dirty hands. I ________ in the soil outside."',
          options: [
            'have been digging',
            'had dug',
            'dig',
            'am dig'
          ],
          answerIndex: 0,
          explanation: 'The present state (dirty hands) is a visible consequence of a recently finished continuous activity. "Have been digging" is correct.'
        },
        {
          id: 'gppc-q2',
          question: 'Which verb is NOT allowed in the Present Perfect Continuous?',
          options: [
            'Read',
            'Know',
            'Run',
            'Write'
          ],
          answerIndex: 1,
          explanation: '"Know" is a state/stative verb. You cannot say "I have been knowing him." You must say "I have known him."'
        },
        {
          id: 'gppc-q3',
          question: 'Choose the correct formulation: "They ________ video games since 9 AM."',
          options: [
            'has been playing',
            'have been playing',
            'have played been',
            'were playing'
          ],
          answerIndex: 1,
          explanation: '"They" is plural, which takes "have been" + the continuous participle form "playing".'
        }
      ]
    }
  },

  // === PAST SIMPLE TENSE ===
  {
    id: 'g-tense-past-simple',
    category: 'grammar',
    level: 'beginner',
    title: 'Past Simple Tense',
    description: 'Learn the rules for regular and irregular verbs to talk about completed actions in specific past times.',
    xpReward: 140,
    estimatedMinutes: 7,
    content: {
      explanation: 'The Past Simple tense is used to describe actions that started and finished in a specific, completed timeframe in the past.',
      keyRules: [
        'Regular verbs form: Add -ed to the base verb (walk -> walked, live -> lived, study -> studied).',
        'Irregular verbs do not follow the "-ed" rule. They completely change form (buy -> bought, go -> went, meet -> met, write -> wrote).',
        'Negative: Subject + did not (didn\'t) + base verb (no past form on the main verb).',
        'Interrogative: Did + Subject + base verb?',
        'State / Verb to be: Past of "be" is "was" (I/he/she/it) or "were" (we/you/they).'
      ],
      examples: [
        {
          english: 'We visited a historic castle and bought delicious pastries yesterday.',
          structureExplanation: 'Completed past actions. "Visited" is regular, while "bought" is the irregular past form of "buy".'
        },
        {
          english: 'She did not like the movie that she watched last night.',
          structureExplanation: 'Negative form. "Did not" is followed by the base form "like". The relative clause contains regular past "watched".'
        },
        {
          english: 'Did you meet the new manager during the conference in London last week?',
          structureExplanation: 'Questions use auxiliary "Did" + base form "meet" (not did you met).'
        }
      ],
      quiz: [
        {
          id: 'gpsim-q1',
          question: 'Identify the irregular past tense of "write" and "buy":',
          options: [
            'writed / buyed',
            'wrote / bought',
            'written / bought',
            'wrote / buyed'
          ],
          answerIndex: 1,
          explanation: '"Write" becomes "wrote" and "buy" becomes "bought" in Past Simple. "Written" is a past participle.'
        },
        {
          id: 'gpsim-q2',
          question: 'Find the correct past question formulation:',
          options: [
            'Did you went to the store yesterday?',
            'Did you go to the store yesterday?',
            'Were you go to the store yesterday?',
            'Gone you to the store yesterday?'
          ],
          answerIndex: 1,
          explanation: 'To formulate a past simple question, use "Did" + Subject + Base Verb ("Did you go").'
        },
        {
          id: 'gpsim-q3',
          question: 'Complete the sentence: "They ________ on the beach because it was extremely cold last night."',
          options: [
            'didn\'t walk',
            'didn\'t walked',
            'not walked',
            'wasn\'t walk'
          ],
          answerIndex: 0,
          explanation: 'Past Simple negative requires "didn\'t" + base verb: "didn\'t walk".'
        }
      ]
    }
  },

  // === PAST CONTINUOUS TENSE ===
  {
    id: 'g-tense-past-continuous',
    category: 'grammar',
    level: 'intermediate',
    title: 'Past Continuous Tense',
    description: 'Learn to describe actions that were actively in progress at a specific past point or during interruptions.',
    xpReward: 150,
    estimatedMinutes: 8,
    content: {
      explanation: 'The Past Continuous tense describes actions that were in middle of occurring in the past. It is frequently paired with Past Simple to show a longer action interrupted by a shorter action.',
      keyRules: [
        'Form: Subject + was / were + verb-ing.',
        'Uses: Actions in progress at a distinct past time (e.g., At 8 PM, I was reading).',
        'Parallel actions: Two actions happening at the same time in the past using "while" (e.g., I was studying while she was cooking).',
        'Interrupted action: Direct background setting. Use Past Continuous for the long action and Past Simple for the interrupting event introduced by "when".'
      ],
      examples: [
        {
          english: 'I was cleaning the living room when the doorbell suddenly rang.',
          structureExplanation: 'Background long action (was cleaning) is interrupted by a short, sharp past simple key event (rang).'
        },
        {
          english: 'What were you doing at exactly ten o\'clock last night when the power went out?',
          structureExplanation: 'Interrogative form. Inquiring about progress at a specific time coordinate.'
        },
        {
          english: 'We were talking about him while they were searching for the files.',
          structureExplanation: 'Parallel continuous activities running simultaneously inside past blocks.'
        }
      ],
      quiz: [
        {
          id: 'gpc-q1',
          question: 'Complete the past situation: "When I walked into the kitchen, my sister ________ a cake."',
          options: [
            'bakes',
            'was baking',
            'baked',
            'were baking'
          ],
          answerIndex: 1,
          explanation: '"My sister" (singular she) takes "was" + "baking". The action was ongoing background when the walk-in interruption occurred.'
        },
        {
          id: 'gpc-q2',
          question: 'Choose the correct formulation for parallel actions:',
          options: [
            'While my husband was working, I was sleeping.',
            'While my husband worked, I slept background.',
            'My husband was working when I was sleeping.',
            'My husband is working while I slept.'
          ],
          answerIndex: 0,
          explanation: 'Parallel past ongoing events are ideally linked with "While" + Past Continuous on both clauses.'
        },
        {
          id: 'gpc-q3',
          question: 'What is the correct negative past continuous sentence?',
          options: [
            'We was not playing piano.',
            'We was not play piano.',
            'We weren\'t playing piano.',
            'We didn\'t playing piano.'
          ],
          answerIndex: 2,
          explanation: '"We" takes plural past auxiliary "were", negative is "weren\'t" + "playing".'
        }
      ]
    }
  },

  // === PAST PERFECT TENSE ===
  {
    id: 'g-tense-past-perfect',
    category: 'grammar',
    level: 'advanced',
    title: 'Past Perfect Simple Tense',
    description: 'Learn to clearly order historic events by establishing which past action happened before another past action.',
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: 'The Past Perfect (often called the "past of the past") describes an action that happened before another action or point in the past. It establishes clear chronological sequence.',
      keyRules: [
        'Form: Subject + had + past participle.',
        'Sequence establishing: The earlier action is in Past Perfect ("had done"). The later action is in Past Simple ("did").',
        'When / By the time: Frequently introduced by "by the time" or "when" indicating the second benchmark moment.',
        'Never use alone: Use only when needed to clarify order; if chronological sequence is already obvious (using "first", "then"), Past Simple is sufficient.'
      ],
      examples: [
        {
          english: 'By the time the train finally arrived, we had waited at the cold station for two hours.',
          structureExplanation: 'Arrived is later (Past Simple). Had waited is earlier (Past Perfect).'
        },
        {
          english: 'She realized that she had left her flight tickets at home.',
          structureExplanation: 'Realized is later (Past Simple). Left tickets is earlier (Past Perfect had left).'
        },
        {
          english: 'Had he ever studied Spanish before he immigrated to Argentina?',
          structureExplanation: 'Question pattern querying lifetime experience prior to a specific historical event.'
        }
      ],
      quiz: [
        {
          id: 'gppf-q1',
          question: 'Complete the sequence: "When we arrived at the cinema, the movie ________ already ________."',
          options: [
            'had / started',
            'did / start',
            'was / starting',
            'has / started'
          ],
          answerIndex: 0,
          explanation: 'The starting of the movie occurred BEFORE the arrival at the cinema, requesting Past Perfect: "had started".'
        },
        {
          id: 'gppf-q2',
          question: 'Identify the earlier past event: "The team celebrated because they had won the championship."',
          options: [
            'The celebration',
            'Winning the championship',
            'They happened simultaneously',
            'Celebrating happened first'
          ],
          answerIndex: 1,
          explanation: '"had won" is in Past Perfect, which designates it as occurring prior to the celebration (Past Simple).'
        },
        {
          id: 'gppf-q3',
          question: 'Formulate the correct negative past perfect sentence:',
          options: [
            'I hadn\'t seen him for ages until we met last Sunday.',
            'I didn\'t saw him for ages until we met last Sunday.',
            'I haven\'t seen him for ages until we met last Sunday.',
            'I not had saw him.'
          ],
          answerIndex: 0,
          explanation: '"hadn\'t seen" is the past perfect negative format correct for referencing past prior duration.'
        }
      ]
    }
  },

  // === PAST PERFECT CONTINUOUS TENSE ===
  {
    id: 'g-tense-past-perfect-continuous',
    category: 'grammar',
    level: 'advanced',
    title: 'Past Perfect Continuous Tense',
    description: 'Describe ongoing durations or physical conditions that occurred prior to another past coordinate.',
    xpReward: 200,
    estimatedMinutes: 10,
    content: {
      explanation: 'The Past Perfect Continuous describes an ongoing activity that was happening up until another point in the past, emphasizing its ongoing duration or process.',
      keyRules: [
        'Form: Subject + had + been + verb-ing.',
        'Emphasize past duration: Measures how long an activity had been in progress before a past boundary was reached.',
        'Cause and effect in past: Clear description of why a past state existed (e.g. He was tired because he had been running).',
        'Action vs State: Similar to Present Perfect Continuous, state verbs are prohibited; use Past Perfect Simple instead.'
      ],
      examples: [
        {
          english: 'The young mechanic was exhausted because he had been repairing car engines all afternoon.',
          structureExplanation: 'Exhausted state is past simple. The engine repairing is the previous continuous cause (had been repairing).'
        },
        {
          english: 'They had been driving for four hours when their vehicle suddenly ran out of gas.',
          structureExplanation: 'Background ongoing duration (had been driving) is interrupted by a Past Simple event (ran out).'
        },
        {
          english: 'Had she been singing at the company opera for long before she lost her voice?',
          structureExplanation: 'Question pattern inquiring about past continuous duration up to a past event.'
        }
      ],
      quiz: [
        {
          id: 'gppfc-q1',
          question: 'Complete: "The grass was soaking wet because it ________ all night."',
          options: [
            'had been raining',
            'was raining',
            'rained',
            'has been raining'
          ],
          answerIndex: 0,
          explanation: '"The grass was wet" (Past state description). The prior overnight rain cause requires Past Perfect Continuous: "had been raining".'
        },
        {
          id: 'gppfc-q2',
          question: 'Identify the sentence in the Past Perfect Continuous:',
          options: [
            'She enjoyed writing letters to him.',
            'We had been hoping for a pay rise for months before the announcement.',
            'They had hoped that we would arrive.',
            'I was studying while he had slept.'
          ],
          answerIndex: 1,
          explanation: '"had been hoping" fits [Subject + had + been + verb-ing] indicating prior continuous hope.'
        },
        {
          id: 'gppfc-q3',
          question: 'Complete the sentence: "By 2020, I ________ coding for years without any formal certification."',
          options: [
            'had been practicing',
            'was practicing',
            'have been practicing',
            'had practiced been'
          ],
          answerIndex: 0,
          explanation: '"By 2020" sets a past boundary. Prior ongoing duration requires Past Perfect Continuous: "had been practicing".'
        }
      ]
    }
  },

  // === FUTURE SIMPLE TENSE ===
  {
    id: 'g-tense-future-simple',
    category: 'grammar',
    level: 'beginner',
    title: 'Future Simple Tense: Will vs. Be Going To',
    description: 'Learn when to use "will" for spontaneous actions and predictions vs. "be going to" for planned futures.',
    xpReward: 140,
    estimatedMinutes: 7,
    content: {
      explanation: 'English employs different structures to talk about the future depending on the level of intent. The two most common are "Will" and "Be Going To".',
      keyRules: [
        'Will rule: Subject + will + base verb. Used for instant spontaneous decisions, general predictions, offers, and promises.',
        'Be Going To rule: Subject + am/is/are + going to + base verb. Used for intentions, firm pre-made plans, and physical evidence predictions.',
        'Negative: Subject + will not (won\'t) / am/is/are not + going to + base verb.',
        'Interrogative: Will + Subject + base verb? / Am/Is/Are + Subject + going to + base verb?'
      ],
      examples: [
        {
          english: 'The phone is ringing. I will answer it for you immediately!',
          structureExplanation: 'Spontaneous decision made at the moment of speaking, demanding the use of "will".'
        },
        {
          english: 'We are going to move to our brand-new apartment in Madrid next summer.',
          structureExplanation: 'Pre-existing travel plan / intent. "Be going to" is highly natural since the plan was already made.'
        },
        {
          english: 'Look at those heavy black clouds in the sky. It is going to rain.',
          structureExplanation: 'Prediction based on present physical evidence, demanding "is going to rain" rather than generic "will rain".'
        }
      ],
      quiz: [
        {
          id: 'gifs-q1',
          question: 'Barista: "What coffee do you want?" Customer: "Hmm... I ________ have the cold brew, please."',
          options: [
            'will',
            'am going to',
            'going to',
            'will be have'
          ],
          answerIndex: 0,
          explanation: 'Since the decision is made spontaneously on the spot, the customer uses "will": "I will have".'
        },
        {
          id: 'gifs-q2',
          question: 'Which sentence correctly represents an intention backed by a pre-made plane?',
          options: [
            'I will buy a sports car tomorrow at 9 AM, I have already booked it.',
            'I am going to buy a sports car tomorrow, I have already booked it.',
            'I will buying a sports car.',
            'I going to buy a sports car.'
          ],
          answerIndex: 1,
          explanation: '"I am going to buy" is the natural pattern for pre-arranged future actions and intentions.'
        },
        {
          id: 'gifs-q3',
          question: 'What is the negative prediction form of "will marry"?',
          options: [
            'won\'t marry',
            'will to not marry',
            'not will marry',
            'goes not to marry'
          ],
          answerIndex: 0,
          explanation: 'The negative of "will" is "will not", contracted to "won\'t".'
        }
      ]
    }
  },

  // === FUTURE CONTINUOUS TENSE ===
  {
    id: 'g-tense-future-continuous',
    category: 'grammar',
    level: 'intermediate',
    title: 'Future Continuous Tense',
    description: 'Learn to describe activities that will be actively in progress at a specific time in the future.',
    xpReward: 160,
    estimatedMinutes: 8,
    content: {
      explanation: 'The Future Continuous describes an action that will be actively "in the middle of happening" at a specific coordinate of future time.',
      keyRules: [
        'Form: Subject + will + be + verb-ing.',
        'Uses: Actions in progress in the future (e.g. This time tomorrow, I will be flying).',
        'Polite inquiries: Inquiring about future plans without pressure (e.g. Will you be using the printer today?).',
        'Overlapping actions: Long future continuous actions interrupted by short present simple actions (e.g. I will be waiting when you arrive).'
      ],
      examples: [
        {
          english: 'At exactly nine o\'clock tomorrow morning, we will be boarding our flight to Paris.',
          structureExplanation: 'At the future point of 9 AM, the continuous boarding process will be in full progress.'
        },
        {
          english: 'She will be studying in the library all afternoon, so do not call her.',
          structureExplanation: 'Expresses a prolonged future action that spans a distinct duration.'
        },
        {
          english: 'I will be making coffee when you wake up.',
          structureExplanation: 'Future continuous action (will be making) overlaps with a future short event expressed in Present Simple (wake up).'
        }
      ],
      quiz: [
        {
          id: 'gfc-q1',
          question: 'Complete: "This time next Saturday, she ________ on a tropical beach in Thailand."',
          options: [
            'will be relaxing',
            'will relaxes',
            'is relaxing',
            'will relax been'
          ],
          answerIndex: 0,
          explanation: '"This time next Saturday" is a specific coordinate in the future, demanding Future Continuous: "will be relaxing".'
        },
        {
          id: 'gfc-q2',
          question: 'Choose the correct overlapping future clause:',
          options: [
            'I will be sleeping when you will get home.',
            'I will be sleeping when you get home.',
            'I sleep when you are getting home.',
            'I will sleep when you will be getting home.'
          ],
          answerIndex: 1,
          explanation: 'When combining a long future action with a short one, use Present Simple ("you get") for the short indicator and Future Continuous ("will be sleeping") for the long background.'
        },
        {
          id: 'gfc-q3',
          question: 'Correct the question format: "________ you ________ utilizing the corporate lounge tonight?"',
          options: [
            'Will / be',
            'Do / be',
            'Are / going to',
            'Will / been'
          ],
          answerIndex: 0,
          explanation: '"Will you be utilizing..." is the correct future continuous question schema.'
        }
      ]
    }
  },

  // === FUTURE PERFECT TENSE ===
  {
    id: 'g-tense-future-perfect',
    category: 'grammar',
    level: 'advanced',
    title: 'Future Perfect Simple Tense',
    description: 'Learn how to describe accomplishments that will be fully completed prior to a future deadline.',
    xpReward: 190,
    estimatedMinutes: 9,
    content: {
      explanation: 'The Future Perfect looks back from a point in the future. It states that an action will be completed before a certain time or deadline in the future.',
      keyRules: [
        'Form: Subject + will + have + past participle.',
        'Deadline indicators: Almost always introduced by "by", "by the time", "by tomorrow", or "in ten years\' time".',
        'Sequence: Action complete first (Future Perfect) before the future benchmark (expressed in Present Simple).',
        'State verbs: Standard participle forms can describe states up to the future coordinate.'
      ],
      examples: [
        {
          english: 'By the time you finish your university exams, I will have already graduated.',
          structureExplanation: 'My graduation will be fully completed BEFORE your future exam finishing.'
        },
        {
          english: 'In December, they will have been married for exactly thirty years.',
          structureExplanation: 'Expresses a duration that will accumulate and be fully completed at a specific future benchmark.'
        },
        {
          english: 'Will you have written the reports by next Friday afternoon?',
          structureExplanation: 'Interrogative form checking if a task is fully accomplished before a deadline.'
        }
      ],
      quiz: [
        {
          id: 'gfpf-q1',
          question: 'Complete spelling: "By midnight, the engineering crew ________ repairing the tracks."',
          options: [
            'will have finished',
            'will finishes',
            'will be finishing',
            'shall be finish'
          ],
          answerIndex: 0,
          explanation: 'The "by midnight" deadline requires Future Perfect "will have finished" indicating full completion.'
        },
        {
          id: 'gfpf-q2',
          question: 'Identify the correct sequence: "By 2030, scientists ________ a vaccine for the disease."',
          options: [
            'will have discovered',
            'discover',
            'are discovering',
            'will have been discover'
          ],
          answerIndex: 0,
          explanation: '"By 2030" indicates a future deadline, requiring the Future Perfect "will have discovered".'
        },
        {
          id: 'gfpf-q3',
          question: 'What is the correct negative form of the Future Perfect?',
          options: [
            'They won\'t have arrived by then.',
            'They won\'t arrived by then.',
            'They will have not arrived by then.',
            'They wouldn\'t have arrived by then.'
          ],
          answerIndex: 0,
          explanation: 'The negative is formed by putting "not" after "will" ("will not have" = "won\'t have").'
        }
      ]
    }
  },

  // === FUTURE PERFECT CONTINUOUS TENSE ===
  {
    id: 'g-tense-future-perfect-continuous',
    category: 'grammar',
    level: 'advanced',
    title: 'Future Perfect Continuous Tense',
    description: 'Learn to measure the ongoing duration of an action up to a specific timeline in the future.',
    xpReward: 210,
    estimatedMinutes: 10,
    content: {
      explanation: 'The Future Perfect Continuous is used to project ourselves forward in time and look back at the ongoing duration of an action. It measures "how long" an activity will have been running at a future coordinate.',
      keyRules: [
        'Form: Subject + will + have + been + verb-ing.',
        'Uses: Expresses the duration of a future action up to a specific benchmark.',
        'Deadline indicators: Frequently introduced by "by next month", "by the time", with a duration stated using "for".',
        'Result focus: Expresses future continuous cause and effect in the future (e.g. By noon I will be tired because I will have been working).'
      ],
      examples: [
        {
          english: 'By ten o\'clock tonight, I will have been writing this software code for fourteen continuous hours.',
          structureExplanation: 'At the 10 PM future point, 14 hours of continuous coding will have accumulated.'
        },
        {
          english: 'By next spring, she will have been living in Tokyo for exactly five years.',
          structureExplanation: 'Looks back from next spring to measure the duration of her continuous residence in Tokyo.'
        },
        {
          english: 'Will they have been traveling for over a week by the time we finally meet them?',
          structureExplanation: 'Inquires about the total accumulated travel duration reached when our meet-up takes place.'
        }
      ],
      quiz: [
        {
          id: 'gfpfc-q1',
          question: 'Complete the sentence: "By the time he retires, he ________ at this bank for forty years."',
          options: [
            'will have been working',
            'will be working',
            'will have worked',
            'has been working'
          ],
          answerIndex: 0,
          explanation: 'The deadline ("by the time he retires") paired with a duration ("for forty years") requires the Future Perfect Continuous "will have been working".'
        },
        {
          id: 'gfpfc-q2',
          question: 'Select the sentence that uses the correct Future Perfect Continuous structure:',
          options: [
            'By next month, I will have been studying English for a year.',
            'By next month, I will be has been studying English.',
            'By next month, I have been studying English.',
            'By next month, I will had been studying English for a year.'
          ],
          answerIndex: 0,
          explanation: '"will have been studying" is [will + have + been + verb-ing] which is the correct formula.'
        },
        {
          id: 'gfpfc-q3',
          question: 'In December, we ________ in Seattle for six years. (Continuous focus)',
          options: [
            'will have been living',
            'will have lived',
            'shall been living',
            'are living'
          ],
          answerIndex: 0,
          explanation: '"will have been living" is the correct choice to emphasize the ongoing nature of our living duration up to that future December date.'
        }
      ]
    }
  }
];

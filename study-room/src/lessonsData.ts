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
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇹🇭  THAI LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'thai-vocab-greetings',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'thai',
    title: 'Thai Essentials: Greetings & Polite Phrases',
    description: 'Learn the most important Thai greetings, polite particles, and everyday expressions used in Thailand.',
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: 'Thai is a tonal language spoken by over 60 million people. Politeness is deeply embedded in Thai culture — every sentence ends with ครับ (khrap) for men or ค่ะ (kha) for women. Mastering greetings will open doors and hearts throughout Thailand.',
      words: [
        { word: 'สวัสดี (Sawatdee)', partOfSpeech: 'greeting', definition: 'Hello / Goodbye — the universal Thai greeting used any time of day.', englishExample: 'Sawatdee kha! — Hello! (said by a woman)' },
        { word: 'ขอบคุณ (Khob Khun)', partOfSpeech: 'phrase', definition: 'Thank you — used to express gratitude in any situation.', englishExample: 'Khob khun khrap — Thank you (said by a man).' },
        { word: 'ใช่ / ไม่ใช่ (Chai / Mai Chai)', partOfSpeech: 'adverb', definition: 'Yes / No — the two most fundamental affirmative and negative words.', englishExample: 'Chai! Phom chob aahan Thai — Yes! I like Thai food.' },
        { word: 'ขอโทษ (Kho Thot)', partOfSpeech: 'phrase', definition: 'Sorry / Excuse me — used to apologize or get someone\'s attention politely.', englishExample: 'Kho thot khrap, hong nam yoo thi nai? — Excuse me, where is the bathroom?' },
        { word: 'ไม่เป็นไร (Mai Pen Rai)', partOfSpeech: 'phrase', definition: 'Never mind / It\'s okay — the iconic Thai expression of relaxed acceptance.', englishExample: 'Mai pen rai kha — No worries at all!' },
        { word: 'ชื่อ (Chue)', partOfSpeech: 'noun', definition: 'Name — used when introducing yourself or asking someone\'s name.', englishExample: 'Phom chue Marco — My name is Marco.' },
        { word: 'ยินดีต้อนรับ (Yindee Ton Rap)', partOfSpeech: 'phrase', definition: 'Welcome — a formal phrase used to welcome guests or visitors.', englishExample: 'Yindee ton rap su prathet Thai — Welcome to Thailand!' },
        { word: 'อร่อย (Aroy)', partOfSpeech: 'adjective', definition: 'Delicious — the word you will use most at every Thai meal.', englishExample: 'Aroy mak! — Very delicious!' },
      ],
      quiz: [
        { id: 'th-gr-q1', question: 'What does "สวัสดี (Sawatdee)" mean?', options: ['Thank you', 'Goodbye only', 'Hello / Goodbye (universal greeting)', 'Excuse me'], answerIndex: 2, explanation: 'Sawatdee is used at any time of day for both hello and goodbye.' },
        { id: 'th-gr-q2', question: 'Which polite particle does a woman add at the end of sentences in Thai?', options: ['ครับ (Khrap)', 'ค่ะ (Kha)', 'นะ (Na)', 'ด้วย (Duay)'], answerIndex: 1, explanation: 'Women add ค่ะ (kha) to show politeness; men use ครับ (khrap).' },
        { id: 'th-gr-q3', question: 'How do you say "Thank you" in Thai?', options: ['ขอโทษ (Kho Thot)', 'ไม่เป็นไร (Mai Pen Rai)', 'ขอบคุณ (Khob Khun)', 'ยินดี (Yindee)'], answerIndex: 2, explanation: 'ขอบคุณ (Khob Khun) is the standard way to say Thank you.' },
        { id: 'th-gr-q4', question: 'What is the famous Thai phrase meaning "No worries / Never mind"?', options: ['Sawatdee', 'Aroy Mak', 'Mai Pen Rai', 'Chai Kha'], answerIndex: 2, explanation: 'ไม่เป็นไร (Mai Pen Rai) is Thailand\'s culturally iconic "no worries" expression.' },
        { id: 'th-gr-q5', question: 'If you want to say "Excuse me, sorry" in Thai, you say:', options: ['Khob Khun', 'Kho Thot', 'Yindee Ton Rap', 'Chai'], answerIndex: 1, explanation: 'ขอโทษ (Kho Thot) means both "sorry" and "excuse me" in Thai.' },
        { id: 'th-gr-q6', question: 'What does "อร่อย (Aroy)" mean?', options: ['Beautiful', 'Delicious', 'Expensive', 'Friendly'], answerIndex: 1, explanation: 'Aroy means delicious — one of the most used words when eating Thai food!' },
        { id: 'th-gr-q7', question: 'Complete: "My name is Ana" in Thai structure uses which word?', options: ['ชื่อ (Chue)', 'ไม่ใช่ (Mai Chai)', 'ขอบคุณ (Khob Khun)', 'อร่อย (Aroy)'], answerIndex: 0, explanation: 'ชื่อ (Chue) means "name". The structure is: [Name] + chue + [your name].' },
        { id: 'th-gr-q8', question: 'How do you say "Yes" in Thai?', options: ['Mai', 'Chai', 'Kha', 'Aroy'], answerIndex: 1, explanation: 'ใช่ (Chai) means Yes. ไม่ (Mai) is a negation particle meaning "not".' },
        { id: 'th-gr-q9', question: '"ยินดีต้อนรับ (Yindee Ton Rap)" means:', options: ['See you later', 'Congratulations', 'Welcome', 'Good morning'], answerIndex: 2, explanation: 'Yindee Ton Rap is the formal Thai welcome greeting.' },
        { id: 'th-gr-q10', question: 'A Thai man saying "Thank you" politely would say:', options: ['Khob Khun Kha', 'Khob Khun Khrap', 'Sawatdee Kha', 'Aroy Khrap'], answerIndex: 1, explanation: 'Men add ครับ (Khrap) as their polite particle, so: Khob Khun Khrap.' },
      ],
    },
  },
  {
    id: 'thai-conv-market',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'thai',
    title: 'Thai Conversations: At the Market (ตลาด)',
    description: 'Practice real Thai market dialogues — bargaining, asking prices, ordering food, and navigating a Thai street market.',
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      context: 'You are at a vibrant Thai street market (ตลาด — ta-lat). A friendly vendor is selling fresh tropical fruits. You want to buy some mangoes and ask about the prices. This conversation teaches practical market Thai.',
      speakerNames: ['Vendor (แม่ค้า)', 'Tourist (นักท่องเที่ยว)'],
      transcript: [
        { speaker: 'Vendor (แม่ค้า)', text: 'Sawatdee kha! Maa duu khong mai kha? (Hello! Would you like to look at our goods?)' },
        { speaker: 'Tourist (นักท่องเที่ยว)', text: 'Sawatdee khrap! Ma-muang raka thao rai khrap? (Hello! How much are the mangoes?)' },
        { speaker: 'Vendor (แม่ค้า)', text: 'Ma-muang song roi baht per kilo kha. Wan mak loei! (Mangoes are 200 Baht per kilo. Very sweet!)' },
        { speaker: 'Tourist (นักท่องเที่ยว)', text: 'Phaeng pai nit. Lot raka dai mai khrap? (That\'s a bit expensive. Can you reduce the price?)' },
        { speaker: 'Vendor (แม่ค้า)', text: 'Dai kha! Song kilo song roi ha sip baht kha. Ok mai? (Okay! Two kilos for 250 Baht. Deal?)' },
        { speaker: 'Tourist (นักท่องเที่ยว)', text: 'Ok khrap! Khob khun mak khrap. (Deal! Thank you very much.)' },
        { speaker: 'Vendor (แม่ค้า)', text: 'Yindee hai borikan kha! Chern maa ik na kha. (Happy to serve! Please come again.)' },
        { speaker: 'Tourist (นักท่องเที่ยว)', text: 'Aroy mak khrap! Ma-muang thi ni aroy thi sut. (Delicious! These mangoes are the best.)' },
      ],
      quiz: [
        { id: 'th-mkt-q1', question: 'What does "ตลาด (Ta-Lat)" mean?', options: ['Restaurant', 'Market', 'Hotel', 'Airport'], answerIndex: 1, explanation: 'ตลาด (Ta-Lat) is the Thai word for market.' },
        { id: 'th-mkt-q2', question: 'How do you ask "How much is it?" in Thai?', options: ['Aroy thao rai?', 'Raka thao rai?', 'Mee mai?', 'Khob khun thao rai?'], answerIndex: 1, explanation: 'รากาเท่าไหร่? (Raka Thao Rai?) means "How much does it cost?"' },
        { id: 'th-mkt-q3', question: 'What phrase means "Can you reduce the price?"', options: ['Maa duu khong mai?', 'Lot raka dai mai?', 'Chern maa ik na?', 'Wan mak loei'], answerIndex: 1, explanation: 'ลดราคาได้ไหม? (Lot Raka Dai Mai?) is how you bargain for a lower price.' },
        { id: 'th-mkt-q4', question: 'What is "มะม่วง (Ma-Muang)" in English?', options: ['Banana', 'Mango', 'Papaya', 'Pineapple'], answerIndex: 1, explanation: 'มะม่วง (Ma-Muang) means mango in Thai.' },
        { id: 'th-mkt-q5', question: 'The vendor says "Wan mak loei!" — what does "wan" mean here?', options: ['Expensive', 'Fresh', 'Sweet', 'Small'], answerIndex: 2, explanation: 'หวาน (Wan) means sweet — a common descriptor for tropical fruits in Thailand.' },
        { id: 'th-mkt-q6', question: 'How do you say "Deal!" / "Okay!" to accept an offer in Thai market?', options: ['Mai Chai', 'Phaeng', 'Ok / Dai', 'Thao Rai'], answerIndex: 2, explanation: '"Ok" or "Dai" (ได้) both mean okay/deal in Thai bargaining contexts.' },
        { id: 'th-mkt-q7', question: 'What does "Chern Maa Ik Na" mean?', options: ['This is expensive', 'Please come again', 'What is your name?', 'Thank you very much'], answerIndex: 1, explanation: '"Chern Maa Ik Na" (เชิญมาอีกนะ) means "Please come again" — a common goodbye from Thai vendors.' },
        { id: 'th-mkt-q8', question: 'Which word means "expensive" in Thai?', options: ['Aroy', 'Phaeng', 'Wan', 'Saduak'], answerIndex: 1, explanation: 'แพง (Phaeng) means expensive. ถูก (Thuk) is the opposite — cheap.' },
        { id: 'th-mkt-q9', question: 'What is the Thai currency used when pricing items at the market?', options: ['Ringgit', 'Dong', 'Baht', 'Peso'], answerIndex: 2, explanation: 'Thailand\'s currency is the Baht (บาท — Baht).' },
        { id: 'th-mkt-q10', question: '"Aroy Mak" means:', options: ['Very cheap', 'Very delicious', 'Very beautiful', 'Very polite'], answerIndex: 1, explanation: 'อร่อยมาก (Aroy Mak) = Very delicious. มาก (Mak) is the Thai intensifier meaning "very".' },
      ],
    },
  },
  {
    id: 'thai-vocab-daily',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'thai',
    title: 'Thai Vocabulary: Numbers, Colors & Daily Life',
    description: 'Master Thai numbers 1–10, basic colors, and the most useful daily life words to navigate Thailand confidently.',
    xpReward: 180,
    estimatedMinutes: 10,
    content: {
      introduction: 'Numbers and colors are foundational in any language. In Thai, numbers follow a logical system, and colors are often named after natural things. These words appear constantly in markets, menus, transportation, and everyday conversations.',
      words: [
        { word: 'หนึ่ง / สอง / สาม (Nueng / Song / Sam)', partOfSpeech: 'number', definition: 'One / Two / Three — the first three Thai numbers.', englishExample: 'Nueng, Song, Sam — counting items at a market stall.' },
        { word: 'สี่ / ห้า / หก (Si / Ha / Hok)', partOfSpeech: 'number', definition: 'Four / Five / Six — mid-range numbers used in prices and addresses.', englishExample: 'Ha baht — Five Baht.' },
        { word: 'เจ็ด / แปด / เก้า / สิบ (Jet / Paet / Kao / Sip)', partOfSpeech: 'number', definition: 'Seven / Eight / Nine / Ten — completing the first decade of Thai numbers.', englishExample: 'Sip baht — Ten Baht.' },
        { word: 'แดง / น้ำเงิน / เหลือง (Daeng / Nam Ngoen / Lueang)', partOfSpeech: 'adjective', definition: 'Red / Blue / Yellow — three primary Thai color words.', englishExample: 'Rot daeng — red car; Nam ngoen — blue (lit. water-silver).' },
        { word: 'ขาว / ดำ / เขียว (Khao / Dam / Khiao)', partOfSpeech: 'adjective', definition: 'White / Black / Green — three more essential Thai colors.', englishExample: 'Suea khao — white shirt; Phak khiao — green vegetable.' },
        { word: 'น้ำ / ข้าว / ไก่ (Nam / Khao / Kai)', partOfSpeech: 'noun', definition: 'Water / Rice / Chicken — the three most important food words in Thailand.', englishExample: 'Khao Kai — rice with chicken, a Thai staple dish.' },
        { word: 'ห้องน้ำ (Hong Nam)', partOfSpeech: 'noun', definition: 'Bathroom / Toilet — literally "water room", essential to know when traveling.', englishExample: 'Hong nam yoo thi nai? — Where is the bathroom?' },
        { word: 'รถไฟฟ้า (Rot Fai Faa)', partOfSpeech: 'noun', definition: 'BTS Skytrain / Electric Train — Bangkok\'s iconic elevated rail system.', englishExample: 'Pai Rot Fai Faa — Let\'s take the Skytrain.' },
      ],
      quiz: [
        { id: 'th-dl-q1', question: 'What is the Thai word for "Five"?', options: ['Si', 'Ha', 'Hok', 'Nueng'], answerIndex: 1, explanation: 'ห้า (Ha) = Five. Si=4, Hok=6, Nueng=1.' },
        { id: 'th-dl-q2', question: 'What does "สิบ (Sip)" mean?', options: ['Seven', 'Nine', 'Ten', 'Eight'], answerIndex: 2, explanation: 'สิบ (Sip) = Ten in Thai.' },
        { id: 'th-dl-q3', question: 'Which Thai color means "Red"?', options: ['Khiao', 'Lueang', 'Daeng', 'Khao'], answerIndex: 2, explanation: 'แดง (Daeng) = Red. Khiao=Green, Lueang=Yellow, Khao=White.' },
        { id: 'th-dl-q4', question: 'What do the three words "Nam / Khao / Kai" mean in English?', options: ['Water / Rice / Chicken', 'Blue / White / Yellow', 'One / Two / Three', 'Hot / Cold / Fresh'], answerIndex: 0, explanation: 'น้ำ=Water, ข้าว=Rice, ไก่=Kai — the foundations of Thai cuisine vocabulary.' },
        { id: 'th-dl-q5', question: '"ห้องน้ำ (Hong Nam)" literally means and refers to:', options: ['Water room — Bathroom', 'River place — Lake', 'Blue room — Kitchen', 'Food room — Cafeteria'], answerIndex: 0, explanation: 'Hong=Room, Nam=Water. Hong Nam = Water Room = Bathroom/Toilet.' },
        { id: 'th-dl-q6', question: 'What color is "เหลือง (Lueang)"?', options: ['Green', 'Blue', 'Yellow', 'Orange'], answerIndex: 2, explanation: 'เหลือง (Lueang) = Yellow in Thai.' },
        { id: 'th-dl-q7', question: 'What is "รถไฟฟ้า (Rot Fai Faa)"?', options: ['A Thai tuk-tuk', 'A river boat', 'Bangkok\'s Skytrain/BTS', 'A motorbike taxi'], answerIndex: 2, explanation: 'Rot Fai Faa literally means "electric train" — referring to the Bangkok BTS Skytrain.' },
        { id: 'th-dl-q8', question: 'Count: "เจ็ด (Jet)" equals which number?', options: ['6', '7', '8', '9'], answerIndex: 1, explanation: 'เจ็ด (Jet) = Seven in Thai.' },
        { id: 'th-dl-q9', question: '"ดำ (Dam)" is which color?', options: ['White', 'Brown', 'Black', 'Grey'], answerIndex: 2, explanation: 'ดำ (Dam) = Black in Thai. ขาว (Khao) = White.' },
        { id: 'th-dl-q10', question: 'What is the Thai phrase for "Where is the bathroom?"', options: ['Aroy yoo thi nai?', 'Hong nam yoo thi nai?', 'Raka thao rai?', 'Nam mee mai?'], answerIndex: 1, explanation: '"Hong Nam Yoo Thi Nai?" (ห้องน้ำอยู่ที่ไหน?) = Where is the bathroom?' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇰🇷  KOREAN LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'korean-vocab-hangeul',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'korean',
    title: 'Korean Essentials: Hangeul Basics & Greetings',
    description: 'Discover the elegant Hangeul alphabet, learn essential Korean greetings, and pick up key polite expressions.',
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: 'Korean (한국어) is spoken by over 80 million people. Its alphabet, Hangeul (한글), was scientifically designed in 1443 and is one of the most logical writing systems in the world. Korean has distinct speech levels — formal speech is used with elders and strangers, while informal is used with close friends.',
      words: [
        { word: '안녕하세요 (Annyeonghaseyo)', partOfSpeech: 'greeting', definition: 'Hello — formal polite greeting used with strangers, elders, and in professional settings.', englishExample: 'Annyeonghaseyo! Mannaseo bangapseumnida. — Hello! Nice to meet you.' },
        { word: '감사합니다 (Gamsahamnida)', partOfSpeech: 'phrase', definition: 'Thank you — the formal way to express gratitude in Korean.', englishExample: 'Gamsahamnida! Jeongmal gamsahamnida — Thank you! Thank you very much.' },
        { word: '죄송합니다 (Joesonghamnida)', partOfSpeech: 'phrase', definition: 'I am sorry — formal sincere apology, stronger than "excuse me".', englishExample: 'Joesonghamnida, chaja-gessseumnida — I am sorry, I will find it.' },
        { word: '이름 (Ireum)', partOfSpeech: 'noun', definition: 'Name — the word for a person\'s name, used in introductions.', englishExample: 'Ireum-i mwoeyo? — What is your name?' },
        { word: '네 / 아니요 (Ne / Aniyo)', partOfSpeech: 'adverb', definition: 'Yes / No — the formal affirmative and negative responses in Korean.', englishExample: 'Ne, algessseumnida — Yes, I understand.' },
        { word: '괜찮아요 (Gwaenchanayo)', partOfSpeech: 'phrase', definition: 'It\'s okay / Are you okay? — used to check well-being or to reassure someone.', englishExample: 'Gwaenchanayo? — Are you okay? / Gwaenchanayo! — It\'s fine!' },
        { word: '반갑습니다 (Bangapseumnida)', partOfSpeech: 'phrase', definition: 'Nice to meet you — the formal expression for first-time introductions.', englishExample: 'Annyeonghaseyo, bangapseumnida — Hello, nice to meet you.' },
        { word: '맛있어요 (Masisseoyo)', partOfSpeech: 'adjective', definition: 'Delicious / It\'s tasty — the word you will say constantly in Korea.', englishExample: 'Jinjja masisseoyo! — It\'s really delicious!' },
      ],
      quiz: [
        { id: 'ko-hg-q1', question: 'What is "안녕하세요 (Annyeonghaseyo)"?', options: ['Thank you', 'Formal hello greeting', 'Goodbye', 'I am sorry'], answerIndex: 1, explanation: 'Annyeonghaseyo is the standard formal "Hello" in Korean.' },
        { id: 'ko-hg-q2', question: 'Hangeul (한글) was created in which year?', options: ['1200', '1443', '1592', '1900'], answerIndex: 1, explanation: 'King Sejong the Great created Hangeul in 1443 to improve literacy in Korea.' },
        { id: 'ko-hg-q3', question: 'How do you formally say "Thank you" in Korean?', options: ['Gwaenchanayo', 'Aniyo', 'Gamsahamnida', 'Joesonghamnida'], answerIndex: 2, explanation: '감사합니다 (Gamsahamnida) is the formal "Thank you".' },
        { id: 'ko-hg-q4', question: 'What does "네 (Ne)" mean?', options: ['No', 'Maybe', 'Yes', 'Hello'], answerIndex: 2, explanation: '네 (Ne) means Yes in formal Korean. 아니요 (Aniyo) = No.' },
        { id: 'ko-hg-q5', question: '"죄송합니다 (Joesonghamnida)" means:', options: ['You\'re welcome', 'Nice to meet you', 'Excuse me informally', 'I am sincerely sorry'], answerIndex: 3, explanation: 'Joesonghamnida is a formal, sincere apology in Korean.' },
        { id: 'ko-hg-q6', question: 'What does "이름이 뭐예요? (Ireum-i mwoeyo?)" mean?', options: ['Where are you from?', 'What is your name?', 'How old are you?', 'What do you like?'], answerIndex: 1, explanation: '"Ireum-i Mwoeyo?" = What is your name? — 이름 means name.' },
        { id: 'ko-hg-q7', question: 'Which word means "Delicious" in Korean?', options: ['Gwaenchanayo', 'Masisseoyo', 'Bangapseumnida', 'Annyeong'], answerIndex: 1, explanation: '맛있어요 (Masisseoyo) = Delicious / It\'s tasty in Korean.' },
        { id: 'ko-hg-q8', question: '"괜찮아요 (Gwaenchanayo)" can mean:', options: ['I\'m sorry / Forgive me', 'It\'s okay / Are you alright?', 'Welcome / Please come in', 'Goodbye / See you'], answerIndex: 1, explanation: 'Gwaenchanayo is versatile — it can be a question (Are you okay?) or a statement (It\'s okay).' },
        { id: 'ko-hg-q9', question: '"반갑습니다 (Bangapseumnida)" is used when:', options: ['Saying goodbye', 'Meeting someone for the first time', 'Ordering food', 'Asking for directions'], answerIndex: 1, explanation: 'Bangapseumnida = Nice to meet you — used during first-time formal introductions.' },
        { id: 'ko-hg-q10', question: 'Korean speech has different levels. Formal speech is used with:', options: ['Only close friends', 'Elders, strangers, and professionals', 'Children only', 'Only in written Korean'], answerIndex: 1, explanation: 'Formal (존댓말 — Jondaemal) is used with elders, strangers, and in professional/public settings.' },
      ],
    },
  },
  {
    id: 'korean-conv-food',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'korean',
    title: 'Korean Conversations: Ordering Food (음식 주문)',
    description: 'Practice real Korean conversations at a Korean restaurant — ordering dishes, asking about spice levels, and paying the bill.',
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      context: 'You are at a popular Korean BBQ restaurant (고깃집 — Gogitjip) in Seoul. A friendly server comes to take your order. You want to order samgyeopsal (grilled pork belly) and kimchi jjigae (kimchi stew), and ask about the spice level. This dialogue practices essential food-ordering Korean.',
      speakerNames: ['Server (서버)', 'Customer (손님)'],
      transcript: [
        { speaker: 'Server (서버)', text: 'Annyeonghaseyo! Mwol deurigeulkkayo? (Hello! What would you like to have?)' },
        { speaker: 'Customer (손님)', text: 'Samgyeopsal il inbun-gwa kimchi jjigae hana juseyo. (One serving of pork belly and one kimchi stew, please.)' },
        { speaker: 'Server (서버)', text: 'Ne! Maepge hae deurilkkayo? (Yes! Would you like it spicy?)' },
        { speaker: 'Customer (손님)', text: 'Jogeum maepge haejuseyo. Gwaenchanayo? (Please make it a little spicy. Is that okay?)' },
        { speaker: 'Server (서버)', text: 'Ne, mul-ron-ijo! Eumryo-neun mwol deurigeulkkayo? (Of course! What would you like to drink?)' },
        { speaker: 'Customer (손님)', text: 'Mul han jan-gwa maekju han byeong juseyo. (One glass of water and one bottle of beer, please.)' },
        { speaker: 'Server (서버)', text: 'Al-gessseumnida! Jamkkan gidaryeo juseyo. (Understood! Please wait a moment.)' },
        { speaker: 'Customer (손님)', text: 'Gamsahamnida! Gyesan-seo juseyo. Eolmaeyo? (Thank you! The bill please. How much is it?)' },
      ],
      quiz: [
        { id: 'ko-fd-q1', question: 'What does "음식 주문 (Eumsik Jumun)" mean?', options: ['Restaurant menu', 'Food ordering', 'Cooking recipe', 'Food delivery'], answerIndex: 1, explanation: '음식 (Eumsik) = Food, 주문 (Jumun) = Order. Together: Food ordering.' },
        { id: 'ko-fd-q2', question: 'How do you say "Please give me one serving" in Korean?', options: ['Juseyo', 'Il Inbun Juseyo', 'Mwol Deurigeulkkayo', 'Jamkkan Gidaryeo Juseyo'], answerIndex: 1, explanation: '"Il Inbun Juseyo" (일 인분 주세요) = One serving please. Juseyo alone means "please give me."' },
        { id: 'ko-fd-q3', question: 'What is "삼겹살 (Samgyeopsal)"?', options: ['Kimchi soup', 'Grilled pork belly', 'Bibimbap rice bowl', 'Spicy noodles'], answerIndex: 1, explanation: 'Samgyeopsal (삼겹살) is one of Korea\'s most beloved dishes — grilled pork belly.' },
        { id: 'ko-fd-q4', question: '"맵게 (Maepge)" means:', options: ['Sweet', 'Salty', 'Spicy', 'Sour'], answerIndex: 2, explanation: '맵게 (Maepge) = Spicy. 조금 맵게 (Jogeum Maepge) = A little spicy.' },
        { id: 'ko-fd-q5', question: 'How do you say "The bill please" in Korean?', options: ['Eumryo Juseyo', 'Masisseoyo', 'Gyesan-seo Juseyo', 'Jamkkan Gidaryeo'], answerIndex: 2, explanation: '계산서 주세요 (Gyesan-seo Juseyo) = Please give me the bill.' },
        { id: 'ko-fd-q6', question: 'What does "잠깐 기다려 주세요 (Jamkkan Gidaryeo Juseyo)" mean?', options: ['Please order now', 'Please wait a moment', 'Please sit down', 'Please come again'], answerIndex: 1, explanation: '"Jamkkan Gidaryeo Juseyo" = Please wait a moment — used by servers when processing an order.' },
        { id: 'ko-fd-q7', question: '"얼마예요? (Eolmaeyo?)" means:', options: ['Is it spicy?', 'What is this?', 'How much is it?', 'Is it delicious?'], answerIndex: 2, explanation: '얼마예요? (Eolmaeyo?) = How much is it? — essential for shopping and dining in Korea.' },
        { id: 'ko-fd-q8', question: 'Which drink did the customer order?', options: ['Soju and juice', 'Water and beer', 'Tea and coffee', 'Milk and water'], answerIndex: 1, explanation: 'The customer ordered "Mul han jan" (water) and "Maekju han byeong" (one bottle of beer).' },
        { id: 'ko-fd-q9', question: '"김치찌개 (Kimchi Jjigae)" is:', options: ['A Korean BBQ style', 'A kimchi stew dish', 'A cold noodle dish', 'A Korean dessert'], answerIndex: 1, explanation: 'Kimchi Jjigae (김치찌개) is a popular Korean kimchi stew, one of Korea\'s most comforting dishes.' },
        { id: 'ko-fd-q10', question: 'To ask for something in Korean restaurants, you end requests with:', options: ['Gamsahamnida', 'Juseyo', 'Annyeong', 'Gwaenchanayo'], answerIndex: 1, explanation: '주세요 (Juseyo) = Please give me / Please do. It\'s attached after the item to make a polite request.' },
      ],
    },
  },
  {
    id: 'korean-vocab-culture',
    category: 'vocabulary',
    level: 'intermediate',
    targetLang: 'korean',
    title: 'Korean Vocabulary: K-Culture, Travel & Daily Life',
    description: 'Learn Korean words from K-pop, K-drama, travel, and everyday life — bridging pop culture with real language learning.',
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: 'Korean pop culture (Hallyu — 한류) has spread Korean language globally through K-pop and K-dramas. Many Hallyu fans already know some Korean intuitively. This lesson connects those cultural touchpoints to core language vocabulary for travel and daily conversations.',
      words: [
        { word: '화이팅 (Hwaiting)', partOfSpeech: 'exclamation', definition: 'Fighting! / You can do it! — a motivational cheer borrowed from English "fighting" used in Korean culture.', englishExample: 'Gamsahamnida, hwaiting! — Thank you, you can do it!' },
        { word: '오빠 / 언니 (Oppa / Eonni)', partOfSpeech: 'noun', definition: 'Older brother (said by females) / Older sister (said by females) — terms of endearment in Korean social hierarchy.', englishExample: 'Oppa, yeogi wa! — Hey oppa, come here!' },
        { word: '지하철 (Jihacheol)', partOfSpeech: 'noun', definition: 'Subway / Metro — Seoul\'s extensive underground rail system, one of the world\'s best.', englishExample: 'Jihacheol-eul ta-go Myeongdong-e ga-ja — Let\'s take the subway to Myeongdong.' },
        { word: '편의점 (Pyeonuijeom)', partOfSpeech: 'noun', definition: 'Convenience store — South Korea has the most convenient stores per capita; open 24/7.', englishExample: 'Pyeonuijeom-e-seo gimbap sa-ja — Let\'s buy kimbap at the convenience store.' },
        { word: '셀카 (Selka)', partOfSpeech: 'noun', definition: 'Selfie — Korea popularized the selfie culture; selka is the Korean adaptation of the word.', englishExample: 'Selka jjik-ja! — Let\'s take a selfie!' },
        { word: '대박 (Daebak)', partOfSpeech: 'exclamation', definition: 'Awesome! / Jackpot! / Amazing! — a versatile Korean exclamation of surprise and excitement.', englishExample: 'Daebak! Jinjja? — Amazing! Really?' },
        { word: '한류 (Hallyu)', partOfSpeech: 'noun', definition: 'Korean Wave — the global spread of Korean pop culture including K-pop, K-dramas, and Korean food.', englishExample: 'Hallyu-ro Hangugeo-reul bae-u-go sipeoyo — I want to learn Korean because of the Korean Wave.' },
        { word: '고마워 (Gomawo)', partOfSpeech: 'phrase', definition: 'Thank you — informal version used with close friends, younger people, or peers.', englishExample: 'Gomawo, chingu-ya! — Thanks, friend!' },
      ],
      quiz: [
        { id: 'ko-kc-q1', question: '"화이팅 (Hwaiting)" is used to express:', options: ['Anger', 'Sadness', 'Encouragement / Cheer someone on', 'Surprise only'], answerIndex: 2, explanation: 'Hwaiting (화이팅) is a cheer meaning "You can do it!" — extremely common in Korean culture.' },
        { id: 'ko-kc-q2', question: 'What does "대박 (Daebak)" express?', options: ['Disappointment', 'Boredom', 'Amazing / Awesome / Jackpot', 'Fear'], answerIndex: 2, explanation: 'Daebak (대박) is an exclamation for something amazing, awesome, or incredibly lucky.' },
        { id: 'ko-kc-q3', question: '"오빠 (Oppa)" is a term used by a female for:', options: ['Younger brother', 'Older brother or older male', 'Male classmate of same age', 'Father'], answerIndex: 1, explanation: '오빠 (Oppa) is used by females to refer to an older male (brother, friend, or partner).' },
        { id: 'ko-kc-q4', question: '"지하철 (Jihacheol)" means:', options: ['Bus terminal', 'Subway / Metro', 'Taxi stand', 'Airport'], answerIndex: 1, explanation: '지하철 (Jihacheol) = Subway/Metro — Seoul\'s subway system is world-renowned.' },
        { id: 'ko-kc-q5', question: 'What is a "편의점 (Pyeonuijeom)"?', options: ['Department store', 'Night market', '24-hour convenience store', 'Traditional market'], answerIndex: 2, explanation: '편의점 (Pyeonuijeom) = Convenience store, a staple of Korean daily life, open 24/7.' },
        { id: 'ko-kc-q6', question: '"셀카 (Selka)" is the Korean word for:', options: ['Mirror', 'Camera', 'Selfie', 'Photo album'], answerIndex: 2, explanation: '셀카 is the Korean adaptation of "selfie" — Korea is the birthplace of modern selfie culture.' },
        { id: 'ko-kc-q7', question: '"한류 (Hallyu)" refers to:', options: ['Korean traditional food only', 'Korean national holidays', 'The global Korean cultural wave (K-pop, K-drama)', 'Korea\'s ancient history'], answerIndex: 2, explanation: 'Hallyu (한류) = Korean Wave — the global spread of Korean pop culture.' },
        { id: 'ko-kc-q8', question: 'What is the informal way to say "Thank you" to a friend in Korean?', options: ['Gamsahamnida', 'Joesonghamnida', 'Gomawo', 'Annyeong'], answerIndex: 2, explanation: '고마워 (Gomawo) is the informal "Thank you" used with close friends and peers.' },
        { id: 'ko-kc-q9', question: '"언니 (Eonni)" is used by a female to refer to:', options: ['Her older sister or older female friend', 'Her mother', 'Her teacher', 'A younger girl'], answerIndex: 0, explanation: '언니 (Eonni) is used by females to refer to an older female — sister, friend, or mentor.' },
        { id: 'ko-kc-q10', question: 'K-pop fans worldwide already know "Hwaiting!" — it originally comes from the English word:', options: ['Faith', 'Fighting', 'Feeling', 'Forward'], answerIndex: 1, explanation: '화이팅 (Hwaiting) is derived from the English word "fighting" used as a cheer.' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇯🇵  JAPANESE LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'japanese-vocab-hiragana',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'japanese',
    title: 'Japanese Essentials: Hiragana Words & Greetings',
    description: 'Start your Japanese journey with the Hiragana writing system, essential greetings, and key polite expressions.',
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: 'Japanese (日本語 — Nihongo) has three writing systems: Hiragana (ひらがな), Katakana (カタカナ), and Kanji (漢字). Hiragana is the foundation — it is a syllabic alphabet with 46 characters that every Japanese learner masters first. Japanese culture deeply values respect and politeness expressed through keigo (敬語 — formal speech).',
      words: [
        { word: 'こんにちは (Konnichiwa)', partOfSpeech: 'greeting', definition: 'Hello / Good afternoon — the universal Japanese greeting used from midday onward.', englishExample: 'Konnichiwa! Hajimemashite — Hello! Nice to meet you.' },
        { word: 'ありがとうございます (Arigatou Gozaimasu)', partOfSpeech: 'phrase', definition: 'Thank you very much — the formal, complete expression of gratitude in Japanese.', englishExample: 'Tetsudatte arigatou gozaimasu — Thank you very much for helping me.' },
        { word: 'すみません (Sumimasen)', partOfSpeech: 'phrase', definition: 'Excuse me / I\'m sorry — the most versatile Japanese phrase for getting attention or apologizing lightly.', englishExample: 'Sumimasen! Eki wa doko desu ka? — Excuse me! Where is the station?' },
        { word: 'はい / いいえ (Hai / Iie)', partOfSpeech: 'adverb', definition: 'Yes / No — fundamental affirmative and negative responses in Japanese.', englishExample: 'Hai, wakarimasita — Yes, I understood.' },
        { word: 'おはようございます (Ohayou Gozaimasu)', partOfSpeech: 'greeting', definition: 'Good morning — formal morning greeting used before midday in Japan.', englishExample: 'Ohayou gozaimasu, sensei! — Good morning, teacher!' },
        { word: 'おやすみなさい (Oyasuminasai)', partOfSpeech: 'greeting', definition: 'Good night — said when going to sleep or leaving at night.', englishExample: 'Oyasuminasai, mata ashita — Good night, see you tomorrow.' },
        { word: 'よろしくお願いします (Yoroshiku Onegaishimasu)', partOfSpeech: 'phrase', definition: 'Please treat me well / Nice to meet you — a deeply cultural expression used in introductions and requests.', englishExample: 'Hajimemashite, Kenji desu. Yoroshiku onegaishimasu — Nice to meet you, I\'m Kenji. Please take care of me.' },
        { word: 'おいしい (Oishii)', partOfSpeech: 'adjective', definition: 'Delicious / Tasty — the most important food word in Japanese!', englishExample: 'Kono ramen wa hontou ni oishii! — This ramen is really delicious!' },
      ],
      quiz: [
        { id: 'ja-hg-q1', question: 'What does "こんにちは (Konnichiwa)" mean?', options: ['Good morning', 'Hello / Good afternoon', 'Good night', 'Goodbye'], answerIndex: 1, explanation: 'Konnichiwa is the standard Japanese greeting used from midday until evening.' },
        { id: 'ja-hg-q2', question: 'Japanese has how many base Hiragana characters?', options: ['26', '46', '52', '64'], answerIndex: 1, explanation: 'Hiragana has 46 base characters. They are the first writing system Japanese children and learners master.' },
        { id: 'ja-hg-q3', question: 'How do you say "Thank you very much" formally in Japanese?', options: ['Sumimasen', 'Hai', 'Arigatou Gozaimasu', 'Oyasuminasai'], answerIndex: 2, explanation: 'ありがとうございます (Arigatou Gozaimasu) is the formal complete "Thank you very much".' },
        { id: 'ja-hg-q4', question: '"すみません (Sumimasen)" is used to:', options: ['Say goodbye', 'Say good morning', 'Get someone\'s attention or apologize lightly', 'Order food'], answerIndex: 2, explanation: 'Sumimasen is extraordinarily versatile — excuse me, sorry, and even "thank you" in some contexts.' },
        { id: 'ja-hg-q5', question: 'What does "おはようございます (Ohayou Gozaimasu)" mean?', options: ['Good night', 'Good evening', 'Goodbye', 'Good morning'], answerIndex: 3, explanation: 'Ohayou Gozaimasu is the formal Japanese good morning greeting.' },
        { id: 'ja-hg-q6', question: '"よろしくお願いします (Yoroshiku Onegaishimasu)" is said when:', options: ['Ordering food', 'Saying farewell forever', 'Meeting someone for the first time or making a request', 'Complaining'], answerIndex: 2, explanation: 'Yoroshiku Onegaishimasu is a rich cultural phrase meaning "please treat me well" — used in introductions and requests.' },
        { id: 'ja-hg-q7', question: 'What is "はい (Hai)" in English?', options: ['No', 'Maybe', 'Yes', 'Please'], answerIndex: 2, explanation: 'はい (Hai) = Yes. いいえ (Iie) = No in Japanese.' },
        { id: 'ja-hg-q8', question: '"おやすみなさい (Oyasuminasai)" is said:', options: ['In the morning when waking up', 'When going to sleep or parting at night', 'Before eating a meal', 'When meeting someone new'], answerIndex: 1, explanation: 'Oyasuminasai is the formal Japanese "Good night" said at bedtime or when parting in the evening.' },
        { id: 'ja-hg-q9', question: 'What does "おいしい (Oishii)" mean?', options: ['Beautiful', 'Cheap', 'Delicious', 'Quiet'], answerIndex: 2, explanation: '美味しい (Oishii) = Delicious/Tasty — the go-to word for complimenting food in Japan.' },
        { id: 'ja-hg-q10', question: 'Japan\'s three writing systems are:', options: ['Hiragana, Katakana, Romaji', 'Hiragana, Katakana, Kanji', 'Kanji, Romaji, Katakana', 'Hiragana, Kanji, Mandarin'], answerIndex: 1, explanation: 'Japanese uses Hiragana (ひらがな), Katakana (カタカナ), and Kanji (漢字) together in written text.' },
      ],
    },
  },
  {
    id: 'japanese-conv-restaurant',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'japanese',
    title: 'Japanese Conversations: At a Restaurant (レストラン)',
    description: 'Practice authentic Japanese restaurant dialogues — being seated, ordering ramen and sushi, and paying the bill.',
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      context: 'You have entered a popular traditional ramen restaurant (ラーメン屋 — Ramen-ya) in Tokyo. The polite server greets you at the entrance. You want to order shoyu ramen (soy sauce ramen) and gyoza (potstickers). This dialogue teaches practical dining Japanese with authentic phrases.',
      speakerNames: ['Server (店員)', 'Customer (お客様)'],
      transcript: [
        { speaker: 'Server (店員)', text: 'Irasshaimase! Nan-mei sama desu ka? (Welcome! How many people are in your party?)' },
        { speaker: 'Customer (お客様)', text: 'Hitori desu. (Just one person.)' },
        { speaker: 'Server (店員)', text: 'Kochira e douzo. Go-chuumon wa okimari desu ka? (This way please. Have you decided your order?)' },
        { speaker: 'Customer (お客様)', text: 'Hai, shoyu ramen to gyouza wo kudasai. (Yes, shoyu ramen and gyoza please.)' },
        { speaker: 'Server (店員)', text: 'Kashikomarimashita! Karai no wa daijoubu desu ka? (Certainly! Is spicy okay for you?)' },
        { speaker: 'Customer (お客様)', text: 'Hai, daijoubu desu. Mizu mo onegaishimasu. (Yes, that\'s fine. Water as well please.)' },
        { speaker: 'Server (店員)', text: 'Sukoshi omachi kudasai. (Please wait a moment.)' },
        { speaker: 'Customer (お客様)', text: 'Oishikatta desu! Okaikei onegaishimasu. Ikura desu ka? (That was delicious! The bill please. How much is it?)' },
      ],
      quiz: [
        { id: 'ja-rs-q1', question: 'What does "いらっしゃいませ (Irasshaimase)" mean?', options: ['Thank you for coming', 'Welcome! (formal greeting to customers)', 'Please sit down', 'What would you like?'], answerIndex: 1, explanation: 'Irasshaimase is the formal welcome phrase used by all Japanese shops and restaurants when a customer enters.' },
        { id: 'ja-rs-q2', question: '"一人です (Hitori Desu)" means:', options: ['Table for two', 'Just one person', 'I have a reservation', 'I am waiting for someone'], answerIndex: 1, explanation: '一人 (Hitori) = One person. 二人 (Futari) = Two people. です (Desu) is the polite copula.' },
        { id: 'ja-rs-q3', question: 'How do you politely say "Please give me..." in Japanese?', options: ['Sumimasen', 'Kudasai / Onegaishimasu', 'Daijoubu', 'Kashikomarimashita'], answerIndex: 1, explanation: '〜をください (Kudasai) and 〜をお願いします (Onegaishimasu) both mean "please give me ___".' },
        { id: 'ja-rs-q4', question: '"かしこまりました (Kashikomarimashita)" is a very formal way servers say:', options: ['Please wait', 'Certainly / Understood (very formal)', 'Welcome', 'Here is your order'], answerIndex: 1, explanation: 'Kashikomarimashita is the most formal "Certainly/Understood" used by service staff in Japan.' },
        { id: 'ja-rs-q5', question: 'What is "餃子 (Gyouza)"?', options: ['Tempura shrimp', 'Japanese potsticker dumplings', 'Grilled skewers', 'Miso soup'], answerIndex: 1, explanation: '餃子 (Gyouza/Gyoza) are Japanese-style potsticker dumplings — a popular side dish with ramen.' },
        { id: 'ja-rs-q6', question: '"大丈夫ですか? (Daijoubu Desu Ka?)" means:', options: ['Is it delicious?', 'Is it expensive?', 'Are you okay? / Is it alright?', 'Is it spicy?'], answerIndex: 2, explanation: '大丈夫 (Daijoubu) = Okay/Alright. 大丈夫ですか? = Is that okay? / Are you alright?' },
        { id: 'ja-rs-q7', question: 'How do you ask "How much is it?" in Japanese?', options: ['Ikura desu ka?', 'Nani desu ka?', 'Doko desu ka?', 'Itsu desu ka?'], answerIndex: 0, explanation: 'いくらですか? (Ikura Desu Ka?) = How much is it? — essential for shopping and dining.' },
        { id: 'ja-rs-q8', question: '"おいしかったです (Oishikatta Desu)" is the past tense meaning:', options: ['It will be delicious', 'It is delicious now', 'It was delicious', 'It is not delicious'], answerIndex: 2, explanation: 'Oishikatta Desu (おいしかったです) is the past tense of Oishii — "It was delicious."' },
        { id: 'ja-rs-q9', question: '"お会計お願いします (Okaikei Onegaishimasu)" means:', options: ['Another order please', 'The bill please', 'More water please', 'A takeaway box please'], answerIndex: 1, explanation: 'お会計 (Okaikei) = Bill/Check. お会計お願いします = "The bill please" — the correct way to ask for the check in Japan.' },
        { id: 'ja-rs-q10', question: 'Japanese restaurants always greet entering customers with:', options: ['Konnichiwa', 'Arigatou Gozaimasu', 'Irasshaimase', 'Sumimasen'], answerIndex: 2, explanation: 'いらっしゃいませ (Irasshaimase) is the universal formal welcome phrase shouted to every customer who enters a Japanese establishment.' },
      ],
    },
  },
  {
    id: 'japanese-vocab-culture',
    category: 'vocabulary',
    level: 'intermediate',
    targetLang: 'japanese',
    title: 'Japanese Vocabulary: Anime, Culture & Daily Life',
    description: 'Connect anime and manga vocabulary to real Japanese — plus essential daily life words for navigating Japan as a traveler.',
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: 'Japanese pop culture (anime, manga, J-pop, and gaming) has introduced millions of learners to Japanese vocabulary. Many anime words are actually real, everyday Japanese expressions. This lesson bridges your cultural knowledge with practical travel and daily life vocabulary.',
      words: [
        { word: 'かわいい (Kawaii)', partOfSpeech: 'adjective', definition: 'Cute / Adorable — perhaps the most globally recognized Japanese word, used constantly in daily speech.', englishExample: 'Ano neko wa kawaii desu ne — That cat is so cute, isn\'t it!' },
        { word: 'すごい (Sugoi)', partOfSpeech: 'exclamation', definition: 'Amazing! / Wow! / Great! — a highly versatile expression of admiration or surprise.', englishExample: 'Sugoi! Sore wa hontou ni jouzu desu ne — Amazing! You\'re really skilled, aren\'t you!' },
        { word: 'なるほど (Naruhodo)', partOfSpeech: 'phrase', definition: 'I see / That makes sense / Indeed — an expression of understanding or realization.', englishExample: 'Naruhodo! Sou iu koto desu ne — I see! So that\'s how it is.' },
        { word: '電車 (Densha)', partOfSpeech: 'noun', definition: 'Train / Electric train — Japan has one of the world\'s most punctual and extensive rail networks.', englishExample: 'Densha de Shibuya ni ikimashita — I went to Shibuya by train.' },
        { word: 'コンビニ (Conbini)', partOfSpeech: 'noun', definition: 'Convenience store — Japan\'s legendary convenience stores (7-Eleven, Lawson, FamilyMart) are open 24/7 and sell hot meals.', englishExample: 'Conbini de onigiri katte kita — I bought an onigiri at the convenience store.' },
        { word: '温泉 (Onsen)', partOfSpeech: 'noun', definition: 'Hot spring / Hot spring bath — a quintessential Japanese cultural experience in natural volcanic hot water.', englishExample: 'Onsen ni hairitai desu — I want to soak in an onsen.' },
        { word: '頑張って (Ganbatte)', partOfSpeech: 'phrase', definition: 'Do your best! / Good luck! / Keep going! — an extremely common Japanese encouragement phrase.', englishExample: 'Shiken ganbatte ne! — Do your best on the exam!' },
        { word: 'もったいない (Mottainai)', partOfSpeech: 'adjective', definition: 'What a waste! / Too good to waste — a Japanese concept of avoiding waste out of respect for value.', englishExample: 'Kore wo suteruno wa mottainai — It\'s a waste to throw this away.' },
      ],
      quiz: [
        { id: 'ja-kc-q1', question: '"かわいい (Kawaii)" means:', options: ['Scary', 'Cool / Stylish', 'Cute / Adorable', 'Sad'], answerIndex: 2, explanation: 'かわいい (Kawaii) = Cute/Adorable — one of the most universally recognized Japanese words worldwide.' },
        { id: 'ja-kc-q2', question: '"すごい (Sugoi)" is used to express:', options: ['Boredom or disinterest', 'Confusion or misunderstanding', 'Fear or danger', 'Amazement, admiration, or surprise'], answerIndex: 3, explanation: 'Sugoi (すごい) = Amazing/Wow! — one of the most versatile Japanese emotional expressions.' },
        { id: 'ja-kc-q3', question: '"なるほど (Naruhodo)" is said when:', options: ['You are angry', 'You just understood something', 'You are hungry', 'You are leaving'], answerIndex: 1, explanation: 'Naruhodo (なるほど) = "I see / That makes sense" — said when gaining understanding or insight.' },
        { id: 'ja-kc-q4', question: 'What does "電車 (Densha)" mean?', options: ['Airplane', 'Bus', 'Train / Electric train', 'Bicycle'], answerIndex: 2, explanation: '電車 (Densha) = Train. Japan\'s trains are world-famous for their punctuality and extensive network.' },
        { id: 'ja-kc-q5', question: '"コンビニ (Conbini)" is short for which English word?', options: ['Continental', 'Convenience (store)', 'Combination', 'Conference'], answerIndex: 1, explanation: 'Conbini (コンビニ) is shortened from "Convenience store." Japan\'s conbini are legendary for their quality and variety.' },
        { id: 'ja-kc-q6', question: '"温泉 (Onsen)" is:', options: ['A Japanese hot spring bath', 'A traditional Japanese garden', 'A type of Japanese noodle', 'A Japanese tea ceremony'], answerIndex: 0, explanation: '温泉 (Onsen) = Hot spring — a central part of Japanese relaxation and cultural tradition.' },
        { id: 'ja-kc-q7', question: '"頑張って (Ganbatte)" is used to:', options: ['Say goodbye formally', 'Encourage someone / Wish them good luck', 'Apologize', 'Express surprise'], answerIndex: 1, explanation: 'Ganbatte (頑張って) = Do your best! / Keep going! — one of Japan\'s most uplifting phrases.' },
        { id: 'ja-kc-q8', question: '"もったいない (Mottainai)" expresses:', options: ['Excitement about something new', 'Regret about wasting something valuable', 'Pride in achievement', 'Curiosity about something unknown'], answerIndex: 1, explanation: 'Mottainai expresses the feeling that something valuable shouldn\'t be wasted — a key Japanese cultural value.' },
        { id: 'ja-kc-q9', question: 'Which Japanese word do anime fans worldwide already know, meaning "cute"?', options: ['Sugoi', 'Kawaii', 'Naruhodo', 'Ganbatte'], answerIndex: 1, explanation: 'かわいい (Kawaii) is globally recognized through anime, manga, and Japanese pop culture.' },
        { id: 'ja-kc-q10', question: 'Japan\'s convenience stores (コンビニ) are notable for being:', options: ['Expensive luxury shops', 'Open only in daytime', 'Open 24/7 and selling hot fresh meals', 'Only found in airports'], answerIndex: 2, explanation: 'Japanese conbini are legendary for being open 24 hours and selling fresh, high-quality food.' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇹🇭  THAI — ADDITIONAL MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'thai-vocab-food',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'thai',
    title: 'Thai Vocabulary: Food & Thai Cuisine',
    description: 'Master the names of iconic Thai dishes, spice levels, and food-related vocabulary to eat like a local.',
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: 'Thai cuisine is world-famous for its bold flavors, aromatic herbs, and balance of sweet, sour, salty, and spicy. Learning food vocabulary will help you navigate menus, order confidently, and connect with Thai people through their most beloved cultural tradition — eating!',
      words: [
        { word: 'ผัดไทย (Pad Thai)', partOfSpeech: 'noun', definition: 'Stir-fried rice noodles — Thailand\'s most famous dish served worldwide.', englishExample: 'Khaw Pad Thai song thi — Please give me two Pad Thai.' },
        { word: 'ต้มยำกุ้ง (Tom Yum Goong)', partOfSpeech: 'noun', definition: 'Spicy shrimp soup — a signature Thai soup with lemongrass, galangal, and kaffir lime.', englishExample: 'Tom Yum Goong aroy mak! — Tom Yum Goong is very delicious!' },
        { word: 'ส้มตำ (Som Tum)', partOfSpeech: 'noun', definition: 'Green papaya salad — a spicy, tangy salad from northeastern Thailand (Isaan).', englishExample: 'Som Tum mai phet — Som Tum, not spicy please.' },
        { word: 'เผ็ด / ไม่เผ็ด (Phet / Mai Phet)', partOfSpeech: 'adjective', definition: 'Spicy / Not spicy — the two most important words when ordering Thai food.', englishExample: 'Mai phet na khrap — Not spicy please.' },
        { word: 'ข้าวผัด (Khao Pad)', partOfSpeech: 'noun', definition: 'Fried rice — a simple, beloved Thai staple available everywhere at any time.', englishExample: 'Khao pad gai — chicken fried rice.' },
        { word: 'แกงเขียวหวาน (Kaeng Khiao Wan)', partOfSpeech: 'noun', definition: 'Green curry — fragrant coconut-milk curry with green chilies, one of Thailand\'s most iconic dishes.', englishExample: 'Kaeng Khiao Wan nuea — green curry with beef.' },
        { word: 'มังคุด / ทุเรียน (Mangkhut / Thurian)', partOfSpeech: 'noun', definition: 'Mangosteen / Durian — two legendary Thai fruits; mangosteen is sweet, durian is pungent.', englishExample: 'Thurian king phollamai — Durian is the king of fruits (in Thai culture).' },
        { word: 'ชานมไข่มุก (Cha Nom Khai Muk)', partOfSpeech: 'noun', definition: 'Bubble tea — extremely popular milk tea with tapioca pearls, found on every street corner.', englishExample: 'Cha nom khai muk yen — iced bubble milk tea.' },
      ],
      quiz: [
        { id: 'th-fd-q1', question: 'What is "ผัดไทย (Pad Thai)"?', options: ['A Thai soup', 'Stir-fried rice noodles', 'A spicy salad', 'Green curry'], answerIndex: 1, explanation: 'Pad Thai (ผัดไทย) is Thailand\'s most internationally famous dish — stir-fried rice noodles.' },
        { id: 'th-fd-q2', question: 'How do you say "Not spicy" when ordering in Thailand?', options: ['Phet mak', 'Aroy mak', 'Mai phet', 'Khao pad'], answerIndex: 2, explanation: '"Mai Phet" (ไม่เผ็ด) = Not spicy. This is essential to know when ordering Thai food!' },
        { id: 'th-fd-q3', question: '"ต้มยำกุ้ง (Tom Yum Goong)" contains which main protein?', options: ['Chicken', 'Beef', 'Tofu', 'Shrimp (Goong)'], answerIndex: 3, explanation: 'Goong (กุ้ง) means shrimp in Thai. Tom Yum Goong is shrimp in spicy lemongrass soup.' },
        { id: 'th-fd-q4', question: '"ส้มตำ (Som Tum)" is a salad made from:', options: ['Mango', 'Green papaya', 'Cucumber', 'Banana blossom'], answerIndex: 1, explanation: 'Som Tum (ส้มตำ) = Green papaya salad, originally from Isaan (northeastern Thailand).' },
        { id: 'th-fd-q5', question: 'What does "เผ็ด (Phet)" mean?', options: ['Sweet', 'Sour', 'Spicy', 'Salty'], answerIndex: 2, explanation: 'เผ็ด (Phet) = Spicy. Thai food has 4 main flavors: Wan (sweet), Priaw (sour), Khem (salty), Phet (spicy).' },
        { id: 'th-fd-q6', question: '"แกงเขียวหวาน (Kaeng Khiao Wan)" means:', options: ['Red curry', 'Yellow curry', 'Green curry', 'Massaman curry'], answerIndex: 2, explanation: 'Kaeng Khiao Wan (แกงเขียวหวาน) literally means "green sweet curry" = Thai green curry.' },
        { id: 'th-fd-q7', question: '"ข้าวผัด (Khao Pad)" means:', options: ['Steamed rice', 'Sticky rice', 'Fried rice', 'Rice porridge'], answerIndex: 2, explanation: 'Khao (ข้าว) = Rice, Pad (ผัด) = Stir-fried/Fried. Khao Pad = Fried rice.' },
        { id: 'th-fd-q8', question: '"ทุเรียน (Thurian)" is known as:', options: ['The king of fruits', 'The queen of fruits', 'The sweetest fruit', 'The rarest fruit'], answerIndex: 0, explanation: 'Durian (ทุเรียน) is called "the king of fruits" in Southeast Asia — it has a powerful, pungent aroma.' },
        { id: 'th-fd-q9', question: 'What is "ชานมไข่มุก (Cha Nom Khai Muk)"?', options: ['Thai iced coffee', 'Bubble milk tea', 'Coconut water', 'Tamarind juice'], answerIndex: 1, explanation: 'Cha Nom Khai Muk (ชานมไข่มุก) = Bubble tea / Boba — extremely popular across Thailand.' },
        { id: 'th-fd-q10', question: 'Which Thai dish is a spicy shrimp soup with lemongrass?', options: ['Pad Thai', 'Khao Pad', 'Tom Yum Goong', 'Som Tum'], answerIndex: 2, explanation: 'Tom Yum Goong (ต้มยำกุ้ง) is Thailand\'s iconic spicy-sour shrimp soup.' },
      ],
    },
  },
  {
    id: 'thai-conv-hotel',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'thai',
    title: 'Thai Conversations: At the Hotel (โรงแรม)',
    description: 'Navigate hotel check-in, room requests, and common hotel situations in Thai with confidence.',
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: 'You have arrived at a mid-range hotel (โรงแรม — Rong Raem) in Chiang Mai after a long journey. You need to check in, confirm your reservation, and ask about breakfast and WiFi. This dialogue covers essential hotel Thai vocabulary.',
      speakerNames: ['Receptionist (พนักงานต้อนรับ)', 'Guest (แขก)'],
      transcript: [
        { speaker: 'Receptionist (พนักงานต้อนรับ)', text: 'Sawatdee kha! Chern rap borikan. Mee jutmai samrong mai kha? (Hello! Welcome. Do you have a reservation?)' },
        { speaker: 'Guest (แขก)', text: 'Mee khrap. Chue Somchai. Chan diao, song khuen. (Yes. My name is Somchai. Single room, two nights.)' },
        { speaker: 'Receptionist (พนักงานต้อนรับ)', text: 'Chai loei kha! Hong chan thi ha. Nee is key card kha. (Yes, that\'s correct! Room number 5. Here is your key card.)' },
        { speaker: 'Guest (แขก)', text: 'Khob khun khrap. Ahaan chao ruam mai khrap? (Thank you. Is breakfast included?)' },
        { speaker: 'Receptionist (พนักงานต้อนรับ)', text: 'Ruam kha! Ahaan chao tee dining room chan 1 tam wan 7 thueng 10 kha. (Included! Breakfast is in the dining room on floor 1 from 7 to 10 AM.)' },
        { speaker: 'Guest (แขก)', text: 'Wi-Fi mee mai khrap? Rot pass arai khrap? (Is there WiFi? What is the password?)' },
        { speaker: 'Receptionist (พนักงานต้อนรับ)', text: 'Mee kha! Wi-Fi chue "HotelChiangmai" rot pass "welcome2025" kha. (Yes! WiFi name is "HotelChiangmai" and the password is "welcome2025".)' },
        { speaker: 'Guest (แขก)', text: 'Khob khun mak khrap! Hong yoo chan nai khrap? (Thank you very much! Which floor is the room on?)' },
      ],
      quiz: [
        { id: 'th-ht-q1', question: 'What does "โรงแรม (Rong Raem)" mean?', options: ['Airport', 'Hotel', 'Hospital', 'Restaurant'], answerIndex: 1, explanation: 'โรงแรม (Rong Raem) = Hotel in Thai.' },
        { id: 'th-ht-q2', question: 'How do you say "I have a reservation" in Thai?', options: ['Mai mee khrap', 'Mee jutmai samrong khrap', 'Hong mai mee khrap', 'Chue arai khrap'], answerIndex: 1, explanation: '"Mee Jutmai Samrong" (มีจุดหมายสำรอง) — this phrase means "I have a reservation".' },
        { id: 'th-ht-q3', question: '"Key card" in a Thai hotel context is called:', options: ['Jutmai', 'Bat samrong', 'Key card (same)', 'Bai arnu yat'], answerIndex: 2, explanation: 'Thai hotels use the English loanword "key card" (pronounced similarly). Many modern English hotel terms are used directly.' },
        { id: 'th-ht-q4', question: 'How do you ask "Is breakfast included?" in Thai?', options: ['Ahaan chao ruam mai?', 'Wi-Fi mee mai?', 'Hong yoo chan nai?', 'Mee jutmai mai?'], answerIndex: 0, explanation: '"Ahaan Chao Ruam Mai?" (อาหารเช้ารวมไหม?) = Is breakfast included? Ruam (รวม) means included.' },
        { id: 'th-ht-q5', question: '"อาหารเช้า (Ahaan Chao)" means:', options: ['Lunch', 'Dinner', 'Breakfast', 'Snack'], answerIndex: 2, explanation: 'อาหารเช้า = Breakfast. เช้า (Chao) = Morning. อาหารกลางวัน = Lunch. อาหารเย็น = Dinner.' },
        { id: 'th-ht-q6', question: 'How do you ask for the WiFi password in Thai?', options: ['Wi-Fi rot pass arai?', 'Hong number arai?', 'Ahaan mee mai?', 'Check-in thi nai?'], answerIndex: 0, explanation: '"Wi-Fi Rot Pass Arai?" = What is the WiFi password? Thai uses English loanwords for tech terms.' },
        { id: 'th-ht-q7', question: '"Chan diao" (ห้องเดี่ยว) means what type of room?', options: ['Double room', 'Suite', 'Single room', 'Dormitory'], answerIndex: 2, explanation: 'Chan Diao (ห้องเดี่ยว) = Single room. Chan Khu (ห้องคู่) = Double/Twin room.' },
        { id: 'th-ht-q8', question: '"สอง คืน (Song Khuen)" means:', options: ['Second floor', 'Two nights', 'Two days', 'Room 2'], answerIndex: 1, explanation: 'Song (สอง) = Two. Khuen (คืน) = Night. Song Khuen = Two nights.' },
        { id: 'th-ht-q9', question: 'The receptionist says breakfast is from 7 to 10 AM. "ตาม วัน" (Tam Wan) means:', options: ['Per person', 'Daily / every day', 'Per room', 'For guests only'], answerIndex: 1, explanation: 'ตามวัน (Tam Wan) = Daily / every day. Wan (วัน) = Day.' },
        { id: 'th-ht-q10', question: 'How do you ask "Which floor is my room on?" in Thai?', options: ['Hong thi tao rai?', 'Chan yoo thi nai?', 'Hong yoo chan nai?', 'Thi nai mee hong?'], answerIndex: 2, explanation: '"Hong Yoo Chan Nai?" (ห้องอยู่ชั้นไหน?) = Which floor is the room on? Chan (ชั้น) = Floor/Level.' },
      ],
    },
  },
  {
    id: 'thai-vocab-directions',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'thai',
    title: 'Thai Vocabulary: Directions & Transportation',
    description: 'Learn how to ask for and understand directions in Thai — plus key transportation vocabulary for getting around Thailand.',
    xpReward: 190,
    estimatedMinutes: 11,
    content: {
      introduction: 'Getting around Thailand requires knowing key direction words and transportation vocabulary. Whether you are hailing a tuk-tuk, taking a songthaew (shared red truck), or navigating Bangkok\'s BTS, these words will keep you moving in the right direction!',
      words: [
        { word: 'ซ้าย / ขวา (Sai / Khwa)', partOfSpeech: 'adverb', definition: 'Left / Right — the two most important direction words in any language.', englishExample: 'Liao sai — Turn left. Liao khwa — Turn right.' },
        { word: 'ตรงไป (Trong Pai)', partOfSpeech: 'adverb', definition: 'Go straight ahead — used when giving or receiving directions.', englishExample: 'Trong pai laew liao sai — Go straight, then turn left.' },
        { word: 'ใกล้ / ไกล (Klai / Klai)', partOfSpeech: 'adjective', definition: 'Near / Far — two opposite adjectives for describing distance (note: different tones!).', englishExample: 'Yoo klai mai? — Is it nearby? Yoo klai mak — It\'s very far.' },
        { word: 'ตุ๊กตุ๊ก (Tuk-Tuk)', partOfSpeech: 'noun', definition: 'Three-wheeled motorized taxi — the iconic Thai vehicle found in cities and tourist areas.', englishExample: 'Tuk-tuk pai Khao San Road thao rai? — How much is a tuk-tuk to Khao San Road?' },
        { word: 'สถานี (Sathani)', partOfSpeech: 'noun', definition: 'Station — used for bus stations, train stations, and BTS/MRT sky train stops.', englishExample: 'BTS Sathani Siam yoo thi nai? — Where is Siam BTS Station?' },
        { word: 'แท็กซี่ (Taxi)', partOfSpeech: 'noun', definition: 'Taxi — Bangkok has metered taxis; always ask "Meter na khrap?" to confirm they use the meter.', englishExample: 'Taxi meter na khrap — Please use the meter.' },
        { word: 'ถนน (Thanon)', partOfSpeech: 'noun', definition: 'Street / Road — used in addresses and directions throughout Thailand.', englishExample: 'Thanon Sukhumvit — Sukhumvit Road, Bangkok\'s famous main artery.' },
        { word: 'แผนที่ (Phaen Thi)', partOfSpeech: 'noun', definition: 'Map — useful when you need to show your destination to a driver.', englishExample: 'Mee phaen thi mai? — Do you have a map?' },
      ],
      quiz: [
        { id: 'th-dr-q1', question: 'How do you say "Turn left" in Thai?', options: ['Trong pai', 'Liao khwa', 'Liao sai', 'Yoo klai'], answerIndex: 2, explanation: '"Liao Sai" (เลี้ยวซ้าย) = Turn left. Liao (เลี้ยว) = Turn, Sai (ซ้าย) = Left.' },
        { id: 'th-dr-q2', question: '"ตรงไป (Trong Pai)" means:', options: ['Turn around', 'Go straight ahead', 'Turn right', 'Stop here'], answerIndex: 1, explanation: 'Trong Pai (ตรงไป) = Go straight ahead. Essential for giving and following directions.' },
        { id: 'th-dr-q3', question: 'What is a "ตุ๊กตุ๊ก (Tuk-Tuk)"?', options: ['A river boat', 'A train', 'A three-wheeled motorized taxi', 'A motorbike taxi'], answerIndex: 2, explanation: 'The Tuk-Tuk (ตุ๊กตุ๊ก) is Thailand\'s iconic 3-wheeled open taxi — a must-try for tourists!' },
        { id: 'th-dr-q4', question: 'When getting a Bangkok taxi, you should ask:', options: ['Sabai dee mai?', 'Meter na khrap?', 'Pai nai khrap?', 'Raka thao rai?'], answerIndex: 1, explanation: '"Meter Na Khrap?" = Please use the meter. Always ask this to avoid overcharging.' },
        { id: 'th-dr-q5', question: '"ใกล้ (Klai)" and "ไกล (Klai)" are two different words. What is the difference?', options: ['Spelling is different only', 'They are the same word', 'Different tones — klai (near) vs klai (far)', 'One is formal, one is informal'], answerIndex: 2, explanation: 'Thai is a tonal language! ใกล้ = near (falling tone) and ไกล = far (rising tone) — they sound similar but different tones change meaning entirely.' },
        { id: 'th-dr-q6', question: '"ถนน (Thanon)" means:', options: ['Bridge', 'Street / Road', 'Intersection', 'Alley'], answerIndex: 1, explanation: 'ถนน (Thanon) = Street / Road. You\'ll see this word in all Thai addresses.' },
        { id: 'th-dr-q7', question: 'What is "สถานี (Sathani)"?', options: ['Hotel', 'Market', 'Station (bus/train/BTS)', 'Hospital'], answerIndex: 2, explanation: 'สถานี (Sathani) = Station — used for train stations, bus terminals, and MRT/BTS stops.' },
        { id: 'th-dr-q8', question: '"ขวา (Khwa)" means:', options: ['Left', 'Straight', 'Right', 'Back'], answerIndex: 2, explanation: 'ขวา (Khwa) = Right direction. ซ้าย (Sai) = Left.' },
        { id: 'th-dr-q9', question: 'How do you ask "Is it nearby?" in Thai?', options: ['Thanon arai?', 'Pai dai mai?', 'Yoo klai mai?', 'Hong yoo thi nai?'], answerIndex: 2, explanation: '"Yoo Klai Mai?" (อยู่ใกล้ไหม?) = Is it nearby? Yoo = Located, Klai = Near, Mai = Question particle.' },
        { id: 'th-dr-q10', question: '"แผนที่ (Phaen Thi)" means:', options: ['Timetable', 'Bus stop', 'Ticket', 'Map'], answerIndex: 3, explanation: 'แผนที่ (Phaen Thi) = Map. Very useful to show taxi or tuk-tuk drivers where you want to go.' },
      ],
    },
  },
  {
    id: 'thai-grammar-basics',
    category: 'grammar',
    level: 'beginner',
    targetLang: 'thai',
    title: 'Thai Grammar: Basic Sentence Structure',
    description: 'Understand how Thai sentences are constructed — word order, negation, questions, and the role of particles.',
    xpReward: 210,
    estimatedMinutes: 13,
    content: {
      explanation: 'Thai grammar is simpler than many languages in some ways — there are no verb conjugations, no plurals, and no grammatical gender. However, Thai sentence structure and the use of tones and particles are unique. This lesson covers the essential building blocks of Thai sentences.',
      keyRules: [
        'Thai uses Subject-Verb-Object (SVO) word order, similar to English: "Phom kin khao" = "I eat rice"',
        'To make a sentence negative, add "mai" (ไม่) before the verb: "Phom mai kin pla" = "I don\'t eat fish"',
        'To ask a yes/no question, add "mai" (ไหม) at the end of a statement: "Khun kin khao mai?" = "Do you eat rice?"',
        'Politeness particles: men say "khrap" (ครับ), women say "kha" (ค่ะ/ครับ) at the end of sentences',
        'There are no articles (a, an, the) and no plural forms in Thai',
        'Classifiers are used when counting nouns: "dog 3 animals" = "ma sam tua" (หมาสามตัว)',
      ],
      examples: [
        { english: 'I like Thai food.', structureExplanation: 'Phom (I) + chob (like) + aahan Thai (Thai food). No conjugation needed!' },
        { english: 'She does not speak English.', structureExplanation: 'Khao (She) + mai (not) + phut (speak) + Angrit (English).' },
        { english: 'Do you understand?', structureExplanation: 'Khun (you) + khao jai (understand) + mai (?) = "Khun khao jai mai?"' },
      ],
      quiz: [
        { id: 'th-gr2-q1', question: 'Thai sentence structure follows which word order?', options: ['Object-Subject-Verb', 'Verb-Subject-Object', 'Subject-Verb-Object (SVO)', 'Object-Verb-Subject'], answerIndex: 2, explanation: 'Thai uses SVO order like English: Phom (I) + kin (eat) + khao (rice) = I eat rice.' },
        { id: 'th-gr2-q2', question: 'To make a Thai sentence negative, you add "ไม่ (Mai)" where?', options: ['At the end', 'Before the noun', 'Before the verb', 'At the beginning'], answerIndex: 2, explanation: '"Mai" (ไม่) is placed before the verb to negate it: "Mai kin" = "do not eat".' },
        { id: 'th-gr2-q3', question: 'To turn a statement into a yes/no question in Thai, you add "ไหม (Mai)" where?', options: ['At the beginning', 'Before the verb', 'After the subject', 'At the end of the sentence'], answerIndex: 3, explanation: 'Question "mai" (ไหม) goes at the END of a statement to make it a yes/no question.' },
        { id: 'th-gr2-q4', question: 'Which politeness particle does a Thai man use at the end of sentences?', options: ['Kha (ค่ะ)', 'Khrap (ครับ)', 'Na (นะ)', 'Loei (เลย)'], answerIndex: 1, explanation: 'Men use ครับ (Khrap). Women use ค่ะ/ครับ (Kha). These are essential for polite Thai speech.' },
        { id: 'th-gr2-q5', question: 'Does Thai have grammatical gender on nouns?', options: ['Yes, like French', 'Yes, but only for animals', 'No, Thai has no grammatical gender', 'Only in formal writing'], answerIndex: 2, explanation: 'Thai has NO grammatical gender on nouns — a major simplification compared to European languages.' },
        { id: 'th-gr2-q6', question: 'Does Thai have plural forms for nouns?', options: ['Yes, add "-s" like English', 'Yes, double the noun', 'No, context or numbers indicate plurality', 'Only for people'], answerIndex: 2, explanation: 'Thai has NO plural forms. Plurality is shown through context or number + classifier.' },
        { id: 'th-gr2-q7', question: 'What is a "classifier" in Thai?', options: ['A grammar particle for questions', 'A word used when counting specific types of nouns', 'A word that adds formality', 'A verb modifier'], answerIndex: 1, explanation: 'Classifiers are used with numbers + nouns. "Ma song tua" = two dogs. Tua is the classifier for animals.' },
        { id: 'th-gr2-q8', question: '"Phom mai phut Angrit" translates to:', options: ['I speak English', 'Do you speak English?', 'I don\'t speak English', 'He speaks English'], answerIndex: 2, explanation: 'Phom = I, Mai = not, Phut = speak, Angrit = English. → "I don\'t speak English."' },
        { id: 'th-gr2-q9', question: 'How do you say "Do you like Thai food?" in Thai structure?', options: ['Chob aahan Thai phom?', 'Khun chob aahan Thai mai?', 'Aahan Thai khun chob?', 'Mai chob aahan Thai khun?'], answerIndex: 1, explanation: '"Khun Chob Aahan Thai Mai?" = Subject (Khun) + Verb (Chob) + Object (Aahan Thai) + Question particle (Mai?)' },
        { id: 'th-gr2-q10', question: 'In Thai, verb conjugation changes with:',  options: ['Subject (I, you, he)', 'Tense (past, present, future)', 'Neither — Thai verbs do not conjugate', 'Gender of the speaker'], answerIndex: 2, explanation: 'Thai verbs NEVER conjugate. "Kin" (eat) stays the same regardless of who is eating or when.' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇰🇷  KOREAN — ADDITIONAL MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'korean-grammar-particles',
    category: 'grammar',
    level: 'beginner',
    targetLang: 'korean',
    title: 'Korean Grammar: Essential Particles (조사)',
    description: 'Master Korean particles — the small words attached to nouns that tell you who does what in a sentence.',
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      explanation: 'Korean is a Subject-Object-Verb (SOV) language, and particles (조사 — Josa) are attached directly to nouns to mark their grammatical role. Unlike English prepositions, Korean particles come AFTER the noun. Mastering particles is the single most important step in Korean grammar.',
      keyRules: [
        '은/는 (Eun/Neun): Topic marker — highlights what the sentence is ABOUT. "Naneun haksaeng" = "I am a student" (As for me, I am a student)',
        '이/가 (I/Ga): Subject marker — marks the grammatical SUBJECT performing an action',
        '을/를 (Eul/Reul): Object marker — marks the direct OBJECT receiving the action',
        '에 (E): Location/direction marker — "where" something is or "where" you go to',
        '에서 (Eseo): Action location marker — "where" an action takes place',
        '와/과 or 하고 (Wa/Gwa / Hago): "And" conjunction — connects nouns (like English "and")',
      ],
      examples: [
        { english: 'I eat rice.', structureExplanation: 'Naneun (I-topic) + bap-eul (rice-object) + meokeoyo (eat). → 나는 밥을 먹어요.' },
        { english: 'I go to school.', structureExplanation: 'Naneun (I-topic) + hakgyo-e (school-direction) + ga-yo (go). → 나는 학교에 가요.' },
        { english: 'I study at the library.', structureExplanation: 'Naneun (I) + doseogwan-eseo (library-action location) + gongbu-haeyo (study). → 나는 도서관에서 공부해요.' },
      ],
      quiz: [
        { id: 'ko-gp-q1', question: 'Korean sentence structure follows which word order?', options: ['SVO like English', 'SOV — Subject-Object-Verb', 'VSO', 'OVS'], answerIndex: 1, explanation: 'Korean is SOV: "Naneun bap-eul meokeoyo" = I (S) rice (O) eat (V). The verb always comes LAST.' },
        { id: 'ko-gp-q2', question: '"은/는 (Eun/Neun)" is used as:', options: ['The object marker', 'The topic marker', 'The location marker', 'The possessive marker'], answerIndex: 1, explanation: 'Eun/Neun (은/는) marks the TOPIC of the sentence — what the sentence is "about".' },
        { id: 'ko-gp-q3', question: '"을/를 (Eul/Reul)" marks the:', options: ['Subject', 'Topic', 'Direction', 'Direct object'], answerIndex: 3, explanation: 'Eul/Reul (을/를) is the OBJECT particle — it marks what is receiving the action of the verb.' },
        { id: 'ko-gp-q4', question: '"에 (E)" is used to show:', options: ['The person doing an action', 'Where an action takes place (like "in" for ongoing actions)', 'Location/destination or direction', 'Possession'], answerIndex: 2, explanation: '에 (E) marks location or direction: "hakgyo-e ga-yo" = go TO school; "bang-e isseoyo" = is IN the room.' },
        { id: 'ko-gp-q5', question: 'What is the difference between "에 (E)" and "에서 (Eseo)"?', options: ['No difference', 'E = static location/destination; Eseo = where an action happens', 'E is formal; Eseo is informal', 'E is for places; Eseo is for people'], answerIndex: 1, explanation: '"E" (에) = where you ARE or GO TO. "Eseo" (에서) = where an action HAPPENS: "doseogwan-eseo gongbu" = study AT the library.' },
        { id: 'ko-gp-q6', question: 'How do you say "I eat rice" in Korean?', options: ['Bap-eul naneun meokeoyo', 'Meokeoyo naneun bap-eul', 'Naneun bap-eul meokeoyo', 'Bap naneun meokeoyo-eul'], answerIndex: 2, explanation: 'SOV order: Naneun (I-topic) + bap-eul (rice-object) + meokeoyo (eat). → 나는 밥을 먹어요.' },
        { id: 'ko-gp-q7', question: '"이/가 (I/Ga)" marks the:', options: ['Topic', 'Object', 'Subject', 'Time'], answerIndex: 2, explanation: 'I/Ga (이/가) is the SUBJECT marker — it marks who is doing the action. 이 after a consonant, 가 after a vowel.' },
        { id: 'ko-gp-q8', question: 'To say "at school" (where action happens), you use:', options: ['학교에 (Hakgyo-e)', '학교에서 (Hakgyo-eseo)', '학교를 (Hakgyo-reul)', '학교는 (Hakgyo-neun)'], answerIndex: 1, explanation: '"Hakgyo-eseo" (학교에서) = at school (where something is done). 에서 marks the location of an action.' },
        { id: 'ko-gp-q9', question: 'Korean particles are placed:', options: ['Before the noun', 'After the noun', 'Before the verb', 'At the start of the sentence'], answerIndex: 1, explanation: 'Korean particles are always ATTACHED AFTER the noun they modify — this is opposite to English prepositions.' },
        { id: 'ko-gp-q10', question: '"하고 (Hago)" is used to mean:', options: ['Because', 'But', 'And (connecting nouns)', 'Or'], answerIndex: 2, explanation: '"Hago" (하고) = And — used to connect nouns. "Bap hago kimchi" = rice and kimchi.' },
      ],
    },
  },
  {
    id: 'korean-vocab-family',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'korean',
    title: 'Korean Vocabulary: Family Members & Relationships',
    description: 'Learn Korean family terms — which are unique because they differ depending on whether YOU are male or female.',
    xpReward: 190,
    estimatedMinutes: 11,
    content: {
      introduction: 'Korean family vocabulary is fascinating because many terms differ depending on YOUR gender and whether you are speaking TO the person or ABOUT them. This reflects Korea\'s deeply Confucian family hierarchy. Learning these terms will help you understand K-dramas much better!',
      words: [
        { word: '아버지 / 아빠 (Abeoji / Appa)', partOfSpeech: 'noun', definition: 'Father (formal) / Dad (informal) — formal used in polite speech, appa is the affectionate everyday term.', englishExample: 'Abeoji, annyeonghaseyo — Hello, Father.' },
        { word: '어머니 / 엄마 (Eomeoni / Eomma)', partOfSpeech: 'noun', definition: 'Mother (formal) / Mom (informal) — eomma is the warm, everyday word for mom.', englishExample: 'Eomma, bap meogeoyo! — Mom, let\'s eat!' },
        { word: '형 / 오빠 (Hyeong / Oppa)', partOfSpeech: 'noun', definition: 'Older brother — Hyeong used by males, Oppa used by females when addressing an older male.', englishExample: 'Hyeong, gati ga-ja — Bro, let\'s go together.' },
        { word: '누나 / 언니 (Nuna / Eonni)', partOfSpeech: 'noun', definition: 'Older sister — Nuna used by males, Eonni used by females when addressing an older female.', englishExample: 'Nuna, bab meokeoyo — Nuna, come eat.' },
        { word: '남동생 / 여동생 (Namdongsaeng / Yeodongsaeng)', partOfSpeech: 'noun', definition: 'Younger brother / Younger sister — dongsaeng means younger sibling, nam=male, yeo=female.', englishExample: 'Nae namdongsaeng eun yeoseol sal — My younger brother is 6 years old.' },
        { word: '할머니 / 할아버지 (Halmeoni / Harabeoji)', partOfSpeech: 'noun', definition: 'Grandmother / Grandfather — respectful terms for grandparents.', englishExample: 'Halmeoni, annyeonghaseyo — Hello, Grandmother.' },
        { word: '남자친구 / 여자친구 (Namjachingu / Yeojachingu)', partOfSpeech: 'noun', definition: 'Boyfriend / Girlfriend — Nam-ja = male, Yeo-ja = female, Chingu = friend.', englishExample: 'Nae namjachingu-neun K-pop star — My boyfriend is a K-pop star.' },
        { word: '가족 (Gajok)', partOfSpeech: 'noun', definition: 'Family — the collective word for family, deeply central to Korean culture.', englishExample: 'Uri gajok-eun daseot myeong — Our family has five people.' },
      ],
      quiz: [
        { id: 'ko-fm-q1', question: '"아빠 (Appa)" means:', options: ['Grandfather', 'Uncle', 'Dad (informal)', 'Older brother'], answerIndex: 2, explanation: '아빠 (Appa) is the informal, affectionate word for Dad. 아버지 (Abeoji) is the formal version.' },
        { id: 'ko-fm-q2', question: 'A FEMALE speaker would call her older brother:', options: ['Hyeong (형)', 'Nuna (누나)', 'Eonni (언니)', 'Oppa (오빠)'], answerIndex: 3, explanation: 'Oppa (오빠) is used by FEMALES to refer to an older male (brother, or close older male friend/partner).' },
        { id: 'ko-fm-q3', question: 'A MALE speaker would call his older sister:', options: ['Eonni (언니)', 'Nuna (누나)', 'Oppa (오빠)', 'Hyeong (형)'], answerIndex: 1, explanation: 'Nuna (누나) is used by MALES to refer to an older female (sister or close older female friend).' },
        { id: 'ko-fm-q4', question: '"여동생 (Yeodongsaeng)" means:', options: ['Younger brother', 'Older sister', 'Younger sister', 'Older brother'], answerIndex: 2, explanation: 'Yeo (여) = female. Dongsaeng = younger sibling. So Yeodongsaeng = younger sister.' },
        { id: 'ko-fm-q5', question: '"할머니 (Halmeoni)" means:', options: ['Aunt', 'Mother', 'Grandmother', 'Older sister'], answerIndex: 2, explanation: '할머니 (Halmeoni) = Grandmother. 할아버지 (Harabeoji) = Grandfather.' },
        { id: 'ko-fm-q6', question: '"가족 (Gajok)" means:', options: ['Home', 'Neighborhood', 'Family', 'Relatives'], answerIndex: 2, explanation: '가족 (Gajok) = Family — a deeply important concept in Korean Confucian culture.' },
        { id: 'ko-fm-q7', question: 'In Korean, many family terms differ based on:', options: ['Age only', 'The speaker\'s gender and relationship', 'Whether the person is married', 'The region of Korea'], answerIndex: 1, explanation: 'Korean family terms change based on YOUR gender (speaker) and the relationship — a key feature of Korean social hierarchy.' },
        { id: 'ko-fm-q8', question: '"남자친구 (Namjachingu)" means:', options: ['Male friend (general)', 'Boyfriend', 'Husband', 'Brother'], answerIndex: 1, explanation: 'Nam-ja (남자) = male/man. Chingu (친구) = friend. Together = Boyfriend.' },
        { id: 'ko-fm-q9', question: '"엄마 (Eomma)" is:', options: ['The formal word for mother', 'The informal/affectionate word for mom', 'The word for grandmother', 'Used only by adults'], answerIndex: 1, explanation: '엄마 (Eomma) is the warm, everyday word for Mom. 어머니 (Eomeoni) is the formal version.' },
        { id: 'ko-fm-q10', question: '"형 (Hyeong)" is used by a MALE speaker to refer to:', options: ['Younger brother', 'Older brother', 'Father', 'Friend'], answerIndex: 1, explanation: '형 (Hyeong) is used EXCLUSIVELY by males to refer to their older brother or close older male friend.' },
      ],
    },
  },
  {
    id: 'korean-vocab-emotions',
    category: 'vocabulary',
    level: 'intermediate',
    targetLang: 'korean',
    title: 'Korean Vocabulary: K-Drama Emotions & Expressions',
    description: 'Learn the rich emotional vocabulary from K-dramas — expressions of love, heartbreak, anger, and joy used in everyday Korean.',
    xpReward: 230,
    estimatedMinutes: 13,
    content: {
      introduction: 'K-dramas are famous for their emotional intensity and dramatic expressions. The good news is that most of these emotional phrases are real, everyday Korean! From confessing love to expressing frustration, this lesson covers the emotional vocabulary that K-drama fans already recognize.',
      words: [
        { word: '사랑해 (Saranghae)', partOfSpeech: 'phrase', definition: 'I love you (informal) — the most famous Korean phrase, used with close family and romantic partners.', englishExample: 'Saranghae! — I love you! (used between lovers or family)' },
        { word: '보고 싶어 (Bogo Sipeo)', partOfSpeech: 'phrase', definition: 'I miss you — literally "I want to see you", one of the most commonly heard K-drama phrases.', englishExample: 'Bogo sipeo, jagiya — I miss you, sweetheart.' },
        { word: '미안해 (Mianhae)', partOfSpeech: 'phrase', definition: 'I\'m sorry (informal) — the casual apology used with friends and family in K-dramas.', englishExample: 'Mianhae, nae jalit-ya — I\'m sorry, it\'s my fault.' },
        { word: '행복해 (Haengbokhae)', partOfSpeech: 'adjective', definition: 'I am happy — expressing personal happiness, a core emotion word.', englishExample: 'Neol man-na-seo haengbokhae — I\'m happy that I met you.' },
        { word: '슬퍼 (Seulpeo)', partOfSpeech: 'adjective', definition: 'I am sad — the most common word for sadness in Korean.', englishExample: 'Wae irae? Seulpeo? — Why are you like this? Are you sad?' },
        { word: '화났어 (Hwanasseo)', partOfSpeech: 'phrase', definition: 'I am angry — used to express frustration or anger, very common in K-drama conflict scenes.', englishExample: 'Nae-ga hwa-nasseo! — I am angry!' },
        { word: '설레다 (Seolleda)', partOfSpeech: 'verb', definition: 'To feel excited/fluttery — the unique Korean word for the excited, fluttery feeling of a new crush or anticipation.', englishExample: 'Neol bolttae maeum-i seolleo — My heart flutters when I see you.' },
        { word: '외로워 (Oeorowo)', partOfSpeech: 'adjective', definition: 'I am lonely — expressing loneliness, a deeply resonant emotion in K-drama storytelling.', englishExample: 'Honja isseo-seo oeorowo — I\'m lonely because I\'m alone.' },
      ],
      quiz: [
        { id: 'ko-em-q1', question: '"사랑해 (Saranghae)" means:', options: ['I miss you', 'I\'m sorry', 'I love you (informal)', 'Thank you'], answerIndex: 2, explanation: '사랑해 (Saranghae) = I love you — informal, used between close people. 사랑합니다 is the formal version.' },
        { id: 'ko-em-q2', question: '"보고 싶어 (Bogo Sipeo)" literally means:', options: ['I want to talk to you', 'I want to see you (= I miss you)', 'I am looking for you', 'I think about you'], answerIndex: 1, explanation: 'Bogo (보고) = see + Sipeo (싶어) = want to. "I want to see you" = I miss you in Korean.' },
        { id: 'ko-em-q3', question: '"미안해 (Mianhae)" is:', options: ['A formal apology', 'An informal "I\'m sorry" used with close people', 'A way to say excuse me to strangers', 'A way to say thank you'], answerIndex: 1, explanation: '미안해 (Mianhae) is the informal apology. 죄송합니다 (Joesonghamnida) is the formal, sincere apology.' },
        { id: 'ko-em-q4', question: 'Which word describes the fluttery, excited feeling of a new crush?', options: ['행복해 (Haengbokhae)', '설레다 (Seolleda)', '사랑해 (Saranghae)', '외로워 (Oeorowo)'], answerIndex: 1, explanation: '설레다 (Seolleda) is a uniquely Korean word for the heart-fluttering excitement of anticipation or a new crush.' },
        { id: 'ko-em-q5', question: '"슬퍼 (Seulpeo)" means:', options: ['Angry', 'Lonely', 'Sad', 'Nervous'], answerIndex: 2, explanation: '슬퍼 (Seulpeo) = Sad. Used when expressing sadness or empathizing with someone who is sad.' },
        { id: 'ko-em-q6', question: '"행복해 (Haengbokhae)" means:', options: ['I am happy', 'I am tired', 'I am excited', 'I am grateful'], answerIndex: 0, explanation: '행복해 (Haengbokhae) = I am happy. 행복 (Haengbok) = happiness.' },
        { id: 'ko-em-q7', question: '"화났어 (Hwanasseo)" expresses:', options: ['Happiness', 'Anger', 'Surprise', 'Sadness'], answerIndex: 1, explanation: '화났어 (Hwanasseo) = I am angry. 화 (Hwa) = anger. Common in K-drama conflict scenes.' },
        { id: 'ko-em-q8', question: '"외로워 (Oeorowo)" means:', options: ['I am bored', 'I am lonely', 'I am tired', 'I am confused'], answerIndex: 1, explanation: '외로워 (Oeorowo) = I am lonely. 외로움 (Oerouem) = loneliness — a very common K-drama theme.' },
        { id: 'ko-em-q9', question: 'The informal "I love you" in Korean is:', options: ['사랑합니다 (Saranghamnida)', '사랑해 (Saranghae)', '좋아해 (Joahae)', '보고 싶어 (Bogo Sipeo)'], answerIndex: 1, explanation: '사랑해 (Saranghae) is informal. 사랑합니다 is formal. 좋아해 means "I like you" (a step before love).' },
        { id: 'ko-em-q10', question: 'Before saying 사랑해 (Saranghae), Koreans might first say:', options: ['미안해 (Mianhae)', '행복해 (Haengbokhae)', '좋아해 (Joahae — I like you)', '화났어 (Hwanasseo)'], answerIndex: 2, explanation: '좋아해 (Joahae) = I like you — the step before confessing 사랑해 (I love you) in Korean dating culture.' },
      ],
    },
  },
  {
    id: 'korean-conv-hospital',
    category: 'conversation',
    level: 'intermediate',
    targetLang: 'korean',
    title: 'Korean Conversations: At the Hospital (병원)',
    description: 'Learn essential Korean medical vocabulary and practice hospital conversations for describing symptoms and getting help.',
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      context: 'You are feeling unwell in Seoul and visit a local clinic (병원 — Byeongwon). The receptionist registers you and the doctor examines you. This dialogue covers essential medical Korean for describing symptoms, understanding diagnoses, and getting prescriptions.',
      speakerNames: ['Doctor/Receptionist (의사/접수)', 'Patient (환자)'],
      transcript: [
        { speaker: 'Receptionist (접수)', text: 'Annyeonghaseyo! Yeoyak-i isseoyo? (Hello! Do you have an appointment?)' },
        { speaker: 'Patient (환자)', text: 'Aniyo, yeoyak-eun eopseoyo. Momi an joeayo. (No, I don\'t have an appointment. I don\'t feel well.)' },
        { speaker: 'Receptionist (접수)', text: 'Eotdeun-ga deuryeolkkayo? Ireumi mwoeyo? (What seems to be the problem? What is your name?)' },
        { speaker: 'Patient (환자)', text: 'Gideungi apa-yo. Yeollo isseo-yo. (My throat hurts. I have a fever.)' },
        { speaker: 'Doctor (의사)', text: 'Eotge dwaesseo-yo? Eonje buteo apa-yo? (How did this happen? Since when have you been in pain?)' },
        { speaker: 'Patient (환자)', text: 'Eo-je buteo apa-sseoyo. Ipmaeg-do eopta-go bae-do apa-yo. (It started yesterday. I also have no appetite and my stomach hurts.)' },
        { speaker: 'Doctor (의사)', text: 'Gamgi-ye-yo. Yak-eul cheobang-hae deurigeyo. Haru se beon deuseyo. (It\'s a cold. I will prescribe some medicine. Take it 3 times a day.)' },
        { speaker: 'Patient (환자)', text: 'Gamsahamnida! Eolmana janya-ji-nayo? (Thank you! How long will it take to get better?)' },
      ],
      quiz: [
        { id: 'ko-hp-q1', question: '"병원 (Byeongwon)" means:', options: ['Pharmacy', 'Hospital / Clinic', 'Health center', 'Emergency room only'], answerIndex: 1, explanation: '병원 (Byeongwon) = Hospital or clinic. 약국 (Yakguk) = Pharmacy.' },
        { id: 'ko-hp-q2', question: '"몸이 안 좋아요 (Momi an joeayo)" means:', options: ['My body is strong', 'I feel great', 'I don\'t feel well', 'I have an allergy'], answerIndex: 2, explanation: '"Momi An Joeayo" = I don\'t feel well/I\'m not feeling good. Momi = body, An = not, Joeayo = good.' },
        { id: 'ko-hp-q3', question: '"기덩이 아파요 (Gideungi Apa-yo)" means:', options: ['My head hurts', 'My stomach hurts', 'My throat hurts', 'My leg hurts'], answerIndex: 2, explanation: '기덩이 (Gideungi) = Throat. 아파요 (Apa-yo) = hurts/is in pain. → My throat hurts.' },
        { id: 'ko-hp-q4', question: '"열이 있어요 (Yeollo Isseo-yo)" means:', options: ['I have a cough', 'I have a fever', 'I have a headache', 'I feel dizzy'], answerIndex: 1, explanation: '열 (Yeol) = Fever/heat. 있어요 = I have. → I have a fever.' },
        { id: 'ko-hp-q5', question: '"어제부터 아팠어요 (Eolje Buteo Apa-sseoyo)" means:', options: ['I\'ve been sick for a week', 'It hurts only sometimes', 'The pain started yesterday', 'I\'ve always had this pain'], answerIndex: 2, explanation: '어제 (Eolje) = Yesterday. 부터 (Buteo) = Since/from. → "It started hurting since yesterday."' },
        { id: 'ko-hp-q6', question: '"감기예요 (Gamgi-ye-yo)" means:', options: ['It\'s serious', 'It\'s an allergy', 'It\'s a cold', 'You need surgery'], answerIndex: 2, explanation: '감기 (Gamgi) = Cold (illness). 감기예요 = It\'s a cold. 독감 (Dokgam) = Flu.' },
        { id: 'ko-hp-q7', question: '"약을 처방해 드리게요 (Yak-eul Cheobang-hae Deurigeyo)" means:', options: ['You need to rest', 'I\'ll prescribe medicine for you', 'Take this pill now', 'Go to the pharmacy first'], answerIndex: 1, explanation: '약 (Yak) = Medicine/pills. 처방하다 (Cheobang-hada) = To prescribe. → "I will prescribe medicine."' },
        { id: 'ko-hp-q8', question: '"하루 세 번 (Haru Se Beon)" means:', options: ['Once a day', 'Twice a day', 'Three times a day', 'Every 8 hours'], answerIndex: 2, explanation: '하루 = One day. 세 = Three. 번 = Times. → Three times a day.' },
        { id: 'ko-hp-q9', question: '"예약 (Yeoyak)" means:', options: ['Insurance', 'Appointment / Reservation', 'Payment', 'Medical record'], answerIndex: 1, explanation: '예약 (Yeoyak) = Appointment or reservation — used for both medical appointments and restaurant bookings.' },
        { id: 'ko-hp-q10', question: 'How do you say "I don\'t have an appetite" in Korean?', options: ['Bae apa-yo', 'Ipmaeg-i eopsseoyo', 'Meogeun-go sipeo-yo', 'Sokyi an joeayo'], answerIndex: 1, explanation: '입맛이 없어요 (Ipmaeg-i Eopsseoyo) = I have no appetite. Ipmaeg = appetite, Eopsseoyo = don\'t have.' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇯🇵  JAPANESE — ADDITIONAL MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'japanese-grammar-verbs',
    category: 'grammar',
    level: 'beginner',
    targetLang: 'japanese',
    title: 'Japanese Grammar: Verb Forms (ます/です)',
    description: 'Learn the polite -masu and -desu verb forms that are the foundation of all polite Japanese conversation.',
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      explanation: 'Japanese has two main politeness levels — polite (丁寧語 — Teinei-go) and plain/casual. All beginners should learn polite speech first. The two most important endings are: ～ます (-masu) for verbs and ～です (-desu) for nouns and adjectives. This lesson covers how to use them correctly.',
      keyRules: [
        'ます (-masu): The polite present/future verb form. "Tabemasu" = I eat / I will eat',
        'ません (-masen): The polite NEGATIVE verb form. "Tabemasen" = I don\'t eat / I won\'t eat',
        'ました (-mashita): The polite PAST verb form. "Tabemashita" = I ate',
        'ませんでした (-masen deshita): The polite NEGATIVE PAST. "Tabemasen deshita" = I didn\'t eat',
        'です (-desu): Polite copula for nouns/adjectives. "Gakusei desu" = I am a student',
        'では/じゃありません (-de wa arimasen): Negative of desu. "Gakusei de wa arimasen" = I am not a student',
      ],
      examples: [
        { english: 'I eat sushi every day.', structureExplanation: 'Mainichi (everyday) + sushi-o (sushi-object) + tabemasu (eat-polite). → 毎日すしを食べます.' },
        { english: 'I did not go to school yesterday.', structureExplanation: 'Kinō (yesterday) + gakkō-ni (school-direction) + ikimasen deshita (did not go). → 昨日学校に行きませんでした.' },
        { english: 'This is a book.', structureExplanation: 'Kore-wa (this-topic) + hon (book) + desu (is). → これは本です.' },
      ],
      quiz: [
        { id: 'ja-gv-q1', question: 'The polite present tense verb ending in Japanese is:', options: ['-te', '-masu', '-nai', '-ta'], answerIndex: 1, explanation: '～ます (-masu) is the polite present/future verb form. "Ikimasu" = I go / I will go.' },
        { id: 'ja-gv-q2', question: '"食べません (Tabemasen)" means:', options: ['I ate', 'I eat', 'I don\'t eat / I won\'t eat', 'I am eating'], answerIndex: 2, explanation: 'Tabemasen (食べません) = The polite NEGATIVE present/future. ～ません = don\'t/won\'t + verb.' },
        { id: 'ja-gv-q3', question: '"行きました (Ikimashita)" is the:', options: ['Present positive', 'Present negative', 'Past positive', 'Past negative'], answerIndex: 2, explanation: '～ました (-mashita) is the polite PAST POSITIVE form. Ikimashita = I went.' },
        { id: 'ja-gv-q4', question: '"です (Desu)" is used after:', options: ['Verbs only', 'Nouns and adjectives', 'Question words only', 'Numbers only'], answerIndex: 1, explanation: 'です (Desu) follows NOUNS and ADJECTIVES to make polite statements: "Gakusei desu" = I am a student.' },
        { id: 'ja-gv-q5', question: '"学生ではありません (Gakusei de wa arimasen)" means:', options: ['I am a student', 'Are you a student?', 'I am not a student', 'He was a student'], answerIndex: 2, explanation: 'では/じゃありません = negative of です. Gakusei de wa arimasen = I am NOT a student.' },
        { id: 'ja-gv-q6', question: 'Japanese sentence structure is:', options: ['SVO like English', 'SOV — the verb always comes LAST', 'VSO', 'Flexible — any order'], answerIndex: 1, explanation: 'Japanese is SOV: "Watashi-wa sushi-o tabemasu" = I (S) sushi (O) eat (V). The verb always ends the sentence.' },
        { id: 'ja-gv-q7', question: 'How do you say "I did not eat" politely in Japanese?', options: ['Tabemasu', 'Tabemasen', 'Tabemashita', 'Tabemasen deshita'], answerIndex: 3, explanation: 'Tabemasen deshita (食べませんでした) = I did not eat. ～ませんでした = polite negative PAST.' },
        { id: 'ja-gv-q8', question: '"毎日 (Mainichi)" means:', options: ['Yesterday', 'Tomorrow', 'Every day', 'Last week'], answerIndex: 2, explanation: '毎日 (Mainichi) = Every day. 毎 (Mai) = every, 日 (Nichi) = day.' },
        { id: 'ja-gv-q9', question: 'The topic marker "は (Wa)" is used to:', options: ['Mark the object', 'Mark the subject', 'Mark the topic of the sentence', 'Show direction'], answerIndex: 2, explanation: 'は (Wa) marks the TOPIC — what the sentence is about. "Watashi-wa" = As for me / Speaking of me.' },
        { id: 'ja-gv-q10', question: '"これは本です (Kore-wa hon desu)" means:', options: ['Is this a book?', 'This is not a book', 'This is a book', 'I read books'], answerIndex: 2, explanation: 'Kore-wa (this-topic) + hon (book) + desu (is/am/are) = "This is a book."' },
      ],
    },
  },
  {
    id: 'japanese-conv-shopping',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'japanese',
    title: 'Japanese Conversations: Shopping (買い物)',
    description: 'Practice Japanese shopping dialogues — finding sizes, asking prices, trying on clothes, and making purchases.',
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: 'You are shopping at a popular Japanese clothing store (服屋 — Fukuya) in Harajuku, Tokyo. You want to buy a blue jacket and need help finding your size. This dialogue covers essential Japanese retail shopping vocabulary.',
      speakerNames: ['Staff (店員)', 'Customer (お客様)'],
      transcript: [
        { speaker: 'Staff (店員)', text: 'Irasshaimase! Nanika o osagashi desu ka? (Welcome! Are you looking for something?)' },
        { speaker: 'Customer (お客様)', text: 'Hai, ano aoi jaketto o mite iru n desu ga. (Yes, I\'m looking at that blue jacket over there.)' },
        { speaker: 'Staff (店員)', text: 'Saizu wa dono kurai desu ka? (What size would you like?)' },
        { speaker: 'Customer (お客様)', text: 'Futsuu saizu desu. Shichaku dekimasu ka? (Medium size please. Can I try it on?)' },
        { speaker: 'Staff (店員)', text: 'Mochiron desu! Shichakushitsu wa asoko desu. (Of course! The fitting room is over there.)' },
        { speaker: 'Customer (お客様)', text: 'Kore, totemo ii desu ne! Ikura desu ka? (This is really nice! How much is it?)' },
        { speaker: 'Staff (店員)', text: 'Go-sen en de gozaimasu. Okaikei wa kashira de yoroshii desu ka? (It\'s 5,000 yen. Will cash payment be okay?)' },
        { speaker: 'Customer (お客様)', text: 'Hai, daijoubu desu. Kurejitto kaado mo tsukaemasuka? (Yes, that\'s fine. Can I also use a credit card?)' },
      ],
      quiz: [
        { id: 'ja-sh-q1', question: '"買い物 (Kaimono)" means:', options: ['Cooking', 'Shopping', 'Cooking shopping', 'Restaurant'], answerIndex: 1, explanation: '買い物 (Kaimono) = Shopping. 買う (Kau) = to buy, 物 (Mono) = thing/stuff.' },
        { id: 'ja-sh-q2', question: '"何かお探しですか? (Nanika o osagashi desu ka?)" means:', options: ['Can I help you pay?', 'Are you looking for something?', 'What is your size?', 'Would you like a bag?'], answerIndex: 1, explanation: '"Nanika o Osagashi Desu Ka?" = "Are you looking for something?" — the standard Japanese retail greeting.' },
        { id: 'ja-sh-q3', question: '"試着できますか? (Shichaku Dekimasu Ka?)" means:', options: ['Can I return this?', 'Is this my size?', 'Can I try this on?', 'Is there a discount?'], answerIndex: 2, explanation: '試着 (Shichaku) = Trying on clothes. できますか = Can I/Is it possible? → "Can I try this on?"' },
        { id: 'ja-sh-q4', question: '"試着室 (Shichakushitsu)" is:', options: ['Cash register', 'Storage room', 'Fitting/changing room', 'Staff room'], answerIndex: 2, explanation: '試着室 (Shichakushitsu) = Fitting room / Changing room — 試着 (try on) + 室 (room).' },
        { id: 'ja-sh-q5', question: '"普通サイズ (Futsuu Saizu)" means:', options: ['Large size', 'Small size', 'Extra large', 'Medium size'], answerIndex: 3, explanation: '普通 (Futsuu) = Normal/ordinary = Medium size. Small = 小 (Shou), Large = 大 (Dai).' },
        { id: 'ja-sh-q6', question: '"5,000円 (Go-sen En)" is:', options: ['500 yen', '5,000 yen', '50,000 yen', '5 yen'], answerIndex: 1, explanation: 'Go (五) = 5, Sen (千) = 1,000, En (円) = Yen. 五千円 = 5,000 Yen.' },
        { id: 'ja-sh-q7', question: '"クレジットカード (Kurejitto Kaado)" is:', options: ['Cash', 'Gift card', 'Credit card', 'Receipt'], answerIndex: 2, explanation: 'クレジットカード is the Japanese katakana loanword for "credit card" (from English).' },
        { id: 'ja-sh-q8', question: '"もちろんです (Mochiron Desu)" means:', options: ['I\'m not sure', 'No problem', 'Of course!', 'Please wait'], answerIndex: 2, explanation: 'もちろんです (Mochiron Desu) = Of course! — an enthusiastic confirmation.' },
        { id: 'ja-sh-q9', question: '"青い (Aoi)" means which color?', options: ['Red', 'Green', 'Yellow', 'Blue'], answerIndex: 3, explanation: '青い (Aoi) = Blue. 赤い (Akai) = Red. 緑 (Midori) = Green. 黄色い (Kiiroi) = Yellow.' },
        { id: 'ja-sh-q10', question: 'Japan\'s currency, the "円 (En)", is also known in English as:', options: ['Won', 'Yuan', 'Yen', 'Bath'], answerIndex: 2, explanation: '円 (En) is romanized and known internationally as "Yen" — Japan\'s official currency.' },
      ],
    },
  },
  {
    id: 'japanese-vocab-katakana',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'japanese',
    title: 'Japanese Vocabulary: Katakana Loanwords',
    description: 'Discover how English and foreign words are adapted into Japanese Katakana — and instantly expand your Japanese vocabulary!',
    xpReward: 200,
    estimatedMinutes: 11,
    content: {
      introduction: 'Katakana (カタカナ) is the Japanese syllabic alphabet used primarily for loanwords from foreign languages — especially English. The amazing secret: if you know English, you already know THOUSANDS of Japanese words! They just sound a bit different due to Japanese phonology. This lesson teaches the pattern.',
      words: [
        { word: 'コーヒー (Koohii)', partOfSpeech: 'noun', definition: 'Coffee — from English "coffee". One of Japan\'s most loved beverages.', englishExample: 'Koohii o kudasai — Please give me a coffee.' },
        { word: 'レストラン (Resutoran)', partOfSpeech: 'noun', definition: 'Restaurant — from French "restaurant", used in Japanese for Western-style restaurants.', englishExample: 'Ii resutoran o shitte imasu ka? — Do you know a good restaurant?' },
        { word: 'スマホ (Sumaho)', partOfSpeech: 'noun', definition: 'Smartphone — shortened from "sumaato fon" (smart phone). Japanese loves abbreviating loanwords!', englishExample: 'Sumaho no juuden ga kireta — My smartphone battery died.' },
        { word: 'アイスクリーム (Aisu Kuriimu)', partOfSpeech: 'noun', definition: 'Ice cream — from English "ice cream". A hugely popular treat across Japan.', englishExample: 'Aisu kuriimu wa nani ga suki desu ka? — What flavor of ice cream do you like?' },
        { word: 'パスポート (Pasupooto)', partOfSpeech: 'noun', definition: 'Passport — from English "passport". Essential travel vocabulary in Katakana.', englishExample: 'Pasupooto o misete kudasai — Please show me your passport.' },
        { word: 'エアコン (Eakon)', partOfSpeech: 'noun', definition: 'Air conditioner — shortened from "air conditioner". Abbreviated loanwords are called "wasei-eigo".', englishExample: 'Eakon o tsukete kudasai — Please turn on the air conditioner.' },
        { word: 'デパート (Depaato)', partOfSpeech: 'noun', definition: 'Department store — from "department" store. Japanese abbreviated it to "depaato".', englishExample: 'Depaato de kaimono shita — I shopped at the department store.' },
        { word: 'ゲーム (Geemu)', partOfSpeech: 'noun', definition: 'Game — from English "game". Japan is the world\'s leading video game country, so this word is everywhere.', englishExample: 'Geemu o shite mo ii desu ka? — Is it okay to play games?' },
      ],
      quiz: [
        { id: 'ja-kt-q1', question: '"コーヒー (Koohii)" comes from which English word?', options: ['Cookie', 'Copy', 'Coffee', 'Cocoa'], answerIndex: 2, explanation: 'コーヒー (Koohii) is the Japanese Katakana rendering of "coffee".' },
        { id: 'ja-kt-q2', question: 'Katakana (カタカナ) is primarily used for:', options: ['Japanese native words', 'Grammar particles', 'Loanwords from foreign languages', 'Formal writing'], answerIndex: 2, explanation: 'Katakana is used for foreign loanwords, foreign names, and some technical/scientific terms.' },
        { id: 'ja-kt-q3', question: '"スマホ (Sumaho)" is a shortened form of:', options: ['Sumaato Fon (Smartphone)', 'Smart Machine', 'Sumaho (original Japanese word)', 'Samsung Mobile'], answerIndex: 0, explanation: 'Sumaho (スマホ) = shortened from "Sumaato Fon" (スマートフォン = Smart Phone). Japan loves shorting loanwords!' },
        { id: 'ja-kt-q4', question: '"パスポート (Pasupooto)" means:', options: ['Password', 'Passport', 'Package', 'Post office'], answerIndex: 1, explanation: 'パスポート (Pasupooto) = Passport — directly borrowed from English with Japanese phonological adaptation.' },
        { id: 'ja-kt-q5', question: '"エアコン (Eakon)" is shortened from:', options: ['Air conditioner', 'Airplane connection', 'Air communication', 'Economy class'], answerIndex: 0, explanation: 'エアコン (Eakon) = Air conditioner, shortened from エアーコンディショナー. Japan abbreviates English words regularly.' },
        { id: 'ja-kt-q6', question: '"デパート (Depaato)" means:', options: ['Departure gate', 'Department store', 'Departure time', 'Deposit'], answerIndex: 1, explanation: 'デパート (Depaato) = Department store — from the English word "department".' },
        { id: 'ja-kt-q7', question: '"ゲーム (Geemu)" comes from the English word:', options: ['Gym', 'Game', 'Gem', 'Gamer'], answerIndex: 1, explanation: 'ゲーム (Geemu) = Game — Japan is the birthplace of many beloved video game franchises.' },
        { id: 'ja-kt-q8', question: 'Japanese loanwords that combine English words in new ways unique to Japan are called:', options: ['Romaji', 'Furigana', 'Wasei-eigo', 'Keigo'], answerIndex: 2, explanation: '"Wasei-eigo" (和製英語) = Japanese-made English — words coined in Japan using English parts, like "salaryman".' },
        { id: 'ja-kt-q9', question: '"アイスクリーム (Aisu Kuriimu)" is:', options: ['Iced coffee', 'Ice cream', 'Iced tea', 'Ice water'], answerIndex: 1, explanation: 'アイスクリーム (Aisu Kuriimu) = Ice cream — one of Japan\'s most beloved sweet treats.' },
        { id: 'ja-kt-q10', question: 'If you know English well, learning Katakana vocabulary is:', options: ['Very difficult — the words are completely different', 'Impossible for non-Japanese speakers', 'Surprisingly easy — many are recognizable English words', 'Only useful for tourists'], answerIndex: 2, explanation: 'Knowing English gives you an instant head-start with Japanese — thousands of Katakana words are English loanwords!' },
      ],
    },
  },
  {
    id: 'japanese-vocab-festivals',
    category: 'vocabulary',
    level: 'intermediate',
    targetLang: 'japanese',
    title: 'Japanese Vocabulary: Seasons, Nature & Traditional Festivals',
    description: 'Explore Japanese seasonal vocabulary, nature words, and the beautiful traditional festivals (matsuri) that define Japanese culture.',
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: 'Japan has four distinct seasons (四季 — Shiki), and seasonal change is deeply embedded in Japanese culture, art, and language. Traditional festivals (祭り — Matsuri) are held throughout the year celebrating harvests, spirits, and the beauty of nature. This vocabulary brings Japanese cultural life to life.',
      words: [
        { word: '桜 (Sakura)', partOfSpeech: 'noun', definition: 'Cherry blossom — Japan\'s national flower, celebrated every spring with hanami (flower-viewing) parties.', englishExample: 'Sakura ga kirei desu ne — The cherry blossoms are beautiful, aren\'t they!' },
        { word: 'お祭り (Omatsuri)', partOfSpeech: 'noun', definition: 'Festival — traditional Japanese festivals featuring food stalls, fireworks, yukata, and dances.', englishExample: 'Natsu matsuri ni ikimashou! — Let\'s go to the summer festival!' },
        { word: '浴衣 (Yukata)', partOfSpeech: 'noun', definition: 'Light summer kimono — worn to summer festivals and fireworks events, more casual than a formal kimono.', englishExample: 'Yukata o kite matsuri ni itta — I wore a yukata to the festival.' },
        { word: '花火 (Hanabi)', partOfSpeech: 'noun', definition: 'Fireworks — literally "flower fire", Japan has world-class fireworks festivals (hanabi taikai) every summer.', englishExample: 'Hanabi ga kirei! — The fireworks are beautiful!' },
        { word: '紅葉 (Momiji / Kouyou)', partOfSpeech: 'noun', definition: 'Autumn leaves / Maple leaves — the red and orange autumn foliage celebrated across Japan in fall.', englishExample: 'Kyoto no kouyou wa subarashii — The autumn leaves in Kyoto are magnificent.' },
        { word: '雪 (Yuki)', partOfSpeech: 'noun', definition: 'Snow — Japan gets heavy snowfall in many regions; Hokkaido\'s snow festivals are world-famous.', englishExample: 'Yuki ga futte iru — It\'s snowing!' },
        { word: '初詣 (Hatsumoude)', partOfSpeech: 'noun', definition: 'First shrine/temple visit of the New Year — millions of Japanese people visit shrines during the first three days of January.', englishExample: 'Gantan ni hatsumoude ni ikimashou — Let\'s do the first shrine visit on New Year\'s Day.' },
        { word: 'もったいない (Mottainai)', partOfSpeech: 'concept', definition: 'What a waste — a deep Japanese cultural concept of not wasting anything of value, including seasonal beauty.', englishExample: 'Sakura wo minai no wa mottainai — It would be a waste not to see the cherry blossoms.' },
      ],
      quiz: [
        { id: 'ja-fs-q1', question: '"桜 (Sakura)" is:', options: ['Japan\'s national bird', 'Japan\'s national flower — cherry blossom', 'A type of Japanese tea', 'A traditional instrument'], answerIndex: 1, explanation: '桜 (Sakura) = Cherry blossom — Japan\'s national flower, celebrated every spring with hanami parties.' },
        { id: 'ja-fs-q2', question: '"花火 (Hanabi)" literally means:', options: ['Fire dance', 'Flower fire (= Fireworks)', 'Night flower', 'Summer celebration'], answerIndex: 1, explanation: '花 (Hana) = Flower + 火 (Hi/Bi) = Fire. 花火 (Hanabi) = Fireworks — literally "flower fire".' },
        { id: 'ja-fs-q3', question: '"浴衣 (Yukata)" is:', options: ['A formal kimono for weddings', 'A light summer kimono worn at festivals', 'A type of traditional footwear', 'Traditional Japanese armor'], answerIndex: 1, explanation: '浴衣 (Yukata) is a casual summer kimono worn at festivals, fireworks events, and hot spring resorts.' },
        { id: 'ja-fs-q4', question: '"お祭り (Omatsuri)" means:', options: ['Prayer', 'Festival', 'Shrine', 'Parade'], answerIndex: 1, explanation: 'お祭り (Omatsuri) = Traditional Japanese festival — a cornerstone of Japanese community life.' },
        { id: 'ja-fs-q5', question: '"紅葉 (Kouyou / Momiji)" refers to:', options: ['Cherry blossoms in spring', 'Summer sunflowers', 'Autumn red leaves', 'Winter snow'], answerIndex: 2, explanation: '紅葉 (Kouyou/Momiji) = Autumn leaves — Japan\'s colorful fall foliage is a major cultural event.' },
        { id: 'ja-fs-q6', question: '"雪 (Yuki)" means:', options: ['Rain', 'Wind', 'Snow', 'Ice'], answerIndex: 2, explanation: '雪 (Yuki) = Snow. Japan has a rich snow culture, especially in Hokkaido which hosts famous snow festivals.' },
        { id: 'ja-fs-q7', question: '"初詣 (Hatsumoude)" is done:', options: ['At the end of the year (December 31)', 'During the first days of the New Year', 'At the start of spring', 'On a person\'s birthday'], answerIndex: 1, explanation: '初詣 (Hatsumoude) = First shrine visit of the New Year — a major tradition for millions of Japanese on Jan 1-3.' },
        { id: 'ja-fs-q8', question: '"花見 (Hanami)" means:', options: ['Flower arranging', 'Cherry blossom viewing parties', 'Planting flowers', 'Selling flowers'], answerIndex: 1, explanation: '花見 (Hanami) = Flower viewing — specifically the beloved Japanese tradition of picnicking under cherry blossoms.' },
        { id: 'ja-fs-q9', question: 'Japan has how many distinct seasons?', options: ['Two (dry and wet)', 'Three (spring, summer, winter)', 'Four (spring, summer, autumn, winter)', 'Five'], answerIndex: 2, explanation: 'Japan has four distinct seasons (四季 — Shiki), and seasonal change deeply influences Japanese culture and vocabulary.' },
        { id: 'ja-fs-q10', question: 'The Sapporo Snow Festival (Yuki Matsuri) is held in which region of Japan?', options: ['Tokyo', 'Kyoto', 'Okinawa', 'Hokkaido'], answerIndex: 3, explanation: 'Hokkaido — Japan\'s northernmost island — hosts the world-famous Sapporo Snow Festival, drawing millions of visitors.' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇫🇷  FRENCH LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'french-vocab-greetings',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'french',
    title: 'French Essentials: Bonjour & Core Phrases',
    description: 'Learn the essential French greetings, polite phrases, and the basics of formal (vous) vs informal (tu) speech.',
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: 'French (Français) is spoken by over 300 million people across 5 continents and is an official language of the United Nations. Known as "la langue de l\'amour" (the language of love), French is famous for its elegance and cultural richness. One key feature: French distinguishes between formal "vous" and informal "tu" when addressing people.',
      words: [
        { word: 'Bonjour / Bonsoir', partOfSpeech: 'greeting', definition: 'Good morning/afternoon / Good evening — Bonjour is used until evening, then Bonsoir.', englishExample: 'Bonjour! Comment allez-vous? — Good morning! How are you?' },
        { word: 'Merci (beaucoup)', partOfSpeech: 'phrase', definition: 'Thank you (very much) — Merci alone is "thank you", beaucoup adds "very much".', englishExample: 'Merci beaucoup pour votre aide — Thank you very much for your help.' },
        { word: 'S\'il vous plaît / S\'il te plaît', partOfSpeech: 'phrase', definition: 'Please (formal) / Please (informal) — the French word for "please" changes with formality.', englishExample: 'Un café, s\'il vous plaît — A coffee, please.' },
        { word: 'Excusez-moi / Pardon', partOfSpeech: 'phrase', definition: 'Excuse me / Pardon — Excusez-moi to get attention, Pardon when bumping into someone.', englishExample: 'Excusez-moi, où est la gare? — Excuse me, where is the train station?' },
        { word: 'Je m\'appelle...', partOfSpeech: 'phrase', definition: 'My name is... — literally "I call myself..." The standard French self-introduction.', englishExample: 'Je m\'appelle Sophie. Et vous? — My name is Sophie. And you?' },
        { word: 'Vous (formal) / Tu (informal)', partOfSpeech: 'pronoun', definition: '"You" formal vs informal — a key French cultural distinction. Always use "vous" with strangers and elders.', englishExample: 'Comment vous appelez-vous? (formal) vs Comment tu t\'appelles? (informal) — What\'s your name?' },
        { word: 'De rien / Je vous en prie', partOfSpeech: 'phrase', definition: 'You\'re welcome — De rien is casual, Je vous en prie is formal. Both respond to Merci.', englishExample: 'Merci! — De rien! — Thank you! — You\'re welcome!' },
        { word: 'Au revoir / À bientôt', partOfSpeech: 'phrase', definition: 'Goodbye (formal) / See you soon — Au revoir is the standard goodbye; À bientôt suggests you\'ll meet again.', englishExample: 'Au revoir! Bonne journée! — Goodbye! Have a good day!' },
      ],
      quiz: [
        { id: 'fr-gr-q1', question: '"Bonjour" is used when?', options: ['Only in the morning', 'During the day until evening', 'Only at night', 'Only in formal settings'], answerIndex: 1, explanation: 'Bonjour is used from morning until evening. After sunset, French speakers switch to "Bonsoir".' },
        { id: 'fr-gr-q2', question: '"Merci beaucoup" means:', options: ['Thank you a little', 'Thank you very much', 'Thanks anyway', 'Thanks for nothing'], answerIndex: 1, explanation: 'Merci = Thank you. Beaucoup = a lot/very much. Together: Thank you very much.' },
        { id: 'fr-gr-q3', question: 'In French, "vous" is used when speaking to:', options: ['Close friends', 'Children', 'Strangers, elders, and in formal situations', 'Pets'], answerIndex: 2, explanation: '"Vous" is the formal/plural "you" — used with strangers, elders, authority figures, and in professional settings.' },
        { id: 'fr-gr-q4', question: '"S\'il vous plaît" is:', options: ['You\'re welcome (formal)', 'Please (formal)', 'Excuse me (formal)', 'Goodbye (formal)'], answerIndex: 1, explanation: '"S\'il vous plaît" = Please (formal). "S\'il te plaît" = Please (informal).' },
        { id: 'fr-gr-q5', question: '"Je m\'appelle..." means:', options: ['I live in...', 'I am from...', 'My name is...', 'I speak...'], answerIndex: 2, explanation: '"Je m\'appelle" literally = "I call myself" = My name is... Standard French introduction.' },
        { id: 'fr-gr-q6', question: '"Au revoir" means:', options: ['Hello', 'See you soon', 'Goodbye', 'Good night'], answerIndex: 2, explanation: '"Au revoir" = Goodbye. Literally "until we see each other again". The standard formal farewell.' },
        { id: 'fr-gr-q7', question: '"De rien" is a response to:', options: ['Bonjour', 'Merci', 'Excusez-moi', 'Au revoir'], answerIndex: 1, explanation: '"De rien" = You\'re welcome — said in response to "Merci" (Thank you).' },
        { id: 'fr-gr-q8', question: 'French is an official language of how many countries?', options: ['5', '10', '20+', '29+'], answerIndex: 3, explanation: 'French is an official language in 29 countries across 5 continents, making it one of the world\'s most widespread languages.' },
        { id: 'fr-gr-q9', question: '"Bonsoir" is used:', options: ['At noon', 'In the morning only', 'In the evening/at night', 'When leaving'], answerIndex: 2, explanation: '"Bonsoir" = Good evening — used from evening onwards as a greeting. "Bonne nuit" = Good night (when going to sleep).' },
        { id: 'fr-gr-q10', question: '"À bientôt!" means:', options: ['Goodbye forever', 'See you soon', 'Good luck', 'Take care'], answerIndex: 1, explanation: '"À bientôt" = See you soon! Bientôt = soon. It implies you expect to see the person again.' },
      ],
    },
  },
  {
    id: 'french-conv-cafe',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'french',
    title: 'French Conversations: At a Café (Au Café)',
    description: 'Experience the quintessential French café culture — ordering coffee, pastries, and meals with authentic French dialogue.',
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: 'You are sitting at a charming Parisian café (un café parisien) on a sunny afternoon. A friendly waiter comes to take your order. You want to order an espresso, a croissant, and ask about the plat du jour (dish of the day). French café culture is an art form!',
      speakerNames: ['Waiter (Serveur)', 'Customer (Client)'],
      transcript: [
        { speaker: 'Waiter (Serveur)', text: 'Bonjour! Vous avez choisi? (Hello! Have you chosen?)' },
        { speaker: 'Customer (Client)', text: 'Oui, je voudrais un café et un croissant, s\'il vous plaît. (Yes, I would like a coffee and a croissant, please.)' },
        { speaker: 'Waiter (Serveur)', text: 'Très bien! Et comme boisson? Un café noisette ou un expresso? (Very good! And as a drink? A coffee with a drop of milk or an espresso?)' },
        { speaker: 'Customer (Client)', text: 'Un expresso, s\'il vous plaît. C\'est quoi le plat du jour? (An espresso, please. What is the dish of the day?)' },
        { speaker: 'Waiter (Serveur)', text: 'Aujourd\'hui c\'est le coq au vin avec des légumes. Très populaire! (Today it\'s coq au vin with vegetables. Very popular!)' },
        { speaker: 'Customer (Client)', text: 'Parfait! Je prends aussi le plat du jour. (Perfect! I\'ll also have the dish of the day.)' },
        { speaker: 'Waiter (Serveur)', text: 'Excellente choice! Je reviens dans un instant. (Excellent choice! I\'ll be back in a moment.)' },
        { speaker: 'Customer (Client)', text: 'L\'addition, s\'il vous plaît. C\'est combien? (The bill please. How much is it?)' },
      ],
      quiz: [
        { id: 'fr-cf-q1', question: '"Vous avez choisi?" means:', options: ['Are you ready to order?', 'Have you chosen / Are you ready?', 'What would you like?', 'Can I bring the menu?'], answerIndex: 1, explanation: '"Vous avez choisi?" = Have you chosen? — the common French waiter phrase meaning "Are you ready to order?"' },
        { id: 'fr-cf-q2', question: '"Je voudrais..." means:', options: ['I have...', 'I want... (aggressive)', 'I would like... (polite)', 'I need...'], answerIndex: 2, explanation: '"Je voudrais" = I would like... — the polite conditional form of "vouloir" (to want). Always use this in French restaurants.' },
        { id: 'fr-cf-q3', question: '"Le plat du jour" means:', options: ['The dessert menu', 'The dish of the day', 'The daily soup', 'The chef\'s special'], answerIndex: 1, explanation: '"Le plat du jour" = The dish of the day — a staple of French restaurant culture, usually a set special.' },
        { id: 'fr-cf-q4', question: '"L\'addition, s\'il vous plaît" means:', options: ['More bread please', 'Another drink please', 'The bill/check please', 'The menu please'], answerIndex: 2, explanation: '"L\'addition" = The bill/check. "L\'addition, s\'il vous plaît" is how you ask for the check in France.' },
        { id: 'fr-cf-q5', question: '"C\'est combien?" means:', options: ['What is this?', 'How much is it?', 'Is it expensive?', 'What time is it?'], answerIndex: 1, explanation: '"C\'est combien?" = How much is it? — the simple, standard way to ask for the price in French.' },
        { id: 'fr-cf-q6', question: '"Un croissant" is:', options: ['A type of French cheese', 'A crescent-shaped buttery pastry', 'A French omelet', 'A type of baguette'], answerIndex: 1, explanation: 'A croissant (from French "crescent") is a flaky, buttery pastry — one of France\'s most iconic foods.' },
        { id: 'fr-cf-q7', question: '"Parfait!" means:', options: ['Excuse me!', 'Not bad!', 'Perfect!', 'Interesting!'], answerIndex: 2, explanation: '"Parfait!" = Perfect! — commonly used to express approval or satisfaction in French.' },
        { id: 'fr-cf-q8', question: '"Je prends aussi..." means:', options: ['I don\'t want...', 'I\'ll also have / I\'ll also take...', 'Can I take away...?', 'I prefer...'], answerIndex: 1, explanation: '"Je prends" = I take/I\'ll have. "Aussi" = also/too. Together: "I\'ll also have..." — another way to order.' },
        { id: 'fr-cf-q9', question: 'What is "Coq au Vin"?', options: ['Fish with white wine sauce', 'Chicken braised in red wine', 'Duck with orange sauce', 'Beef stew with vegetables'], answerIndex: 1, explanation: '"Coq au Vin" = Chicken (Coq) in wine (Vin) — a classic French country dish braised in red wine.' },
        { id: 'fr-cf-q10', question: '"Un expresso" in French café culture refers to:', options: ['A large milky coffee', 'A small strong black espresso coffee', 'An iced coffee', 'A coffee with whipped cream'], answerIndex: 1, explanation: '"Un expresso" (or espresso) = A small, concentrated black coffee shot — the standard coffee in a French café.' },
      ],
    },
  },
  {
    id: 'french-vocab-culture',
    category: 'vocabulary',
    level: 'intermediate',
    targetLang: 'french',
    title: 'French Vocabulary: Fashion, Food & French Culture',
    description: 'Dive into French cultural vocabulary — fashion terms, gourmet food words, and the cultural concepts that define French identity.',
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: 'France is synonymous with fashion, gastronomy, and art de vivre (art of living). French cultural vocabulary has heavily influenced global fashion, cooking, and lifestyle language — many words you already know are French! This lesson explores the rich cultural vocabulary that makes French culture unique.',
      words: [
        { word: 'La Mode', partOfSpeech: 'noun', definition: 'Fashion — France is the global capital of haute couture (high fashion). "À la mode" = fashionable/in style.', englishExample: 'Paris est la capitale de la mode — Paris is the fashion capital.' },
        { word: 'La Gastronomie', partOfSpeech: 'noun', definition: 'Gastronomy / Fine cuisine — French cuisine is UNESCO heritage. France takes food more seriously than almost any other culture.', englishExample: 'La gastronomie française est renommée dans le monde entier — French gastronomy is renowned worldwide.' },
        { word: 'Joie de Vivre', partOfSpeech: 'concept', definition: 'Joy of living — one of France\'s most famous cultural expressions, meaning a cheerful enjoyment of life.', englishExample: 'Les Français ont la joie de vivre — The French have the joy of living.' },
        { word: 'Un Baguette', partOfSpeech: 'noun', definition: 'A long French bread loaf — baguettes are baked fresh daily; it\'s a cultural icon and UNESCO heritage.', englishExample: 'Je vais chercher une baguette à la boulangerie — I\'m going to get a baguette from the bakery.' },
        { word: 'Le Musée / L\'Art', partOfSpeech: 'noun', definition: 'Museum / Art — France hosts the world\'s most visited museum (The Louvre) and has shaped Western art history.', englishExample: 'Le Louvre est le musée le plus célèbre du monde — The Louvre is the most famous museum in the world.' },
        { word: 'Bon Appétit', partOfSpeech: 'phrase', definition: 'Enjoy your meal — said before eating a meal in French culture. It\'s an expression of warmth and social bonding.', englishExample: 'Bon appétit! — Enjoy your meal!' },
        { word: 'La Politesse', partOfSpeech: 'noun', definition: 'Politeness / Manners — French culture places enormous value on politeness, especially in greetings and formal settings.', englishExample: 'La politesse est très importante en France — Politeness is very important in France.' },
        { word: 'Le Cinéma', partOfSpeech: 'noun', definition: 'Cinema — France invented cinema (the Lumière brothers, 1895) and the Cannes Film Festival is the world\'s most prestigious.', englishExample: 'J\'adore le cinéma français — I love French cinema.' },
      ],
      quiz: [
        { id: 'fr-cu-q1', question: '"La Mode" means:', options: ['Food', 'Fashion', 'Music', 'Art'], answerIndex: 1, explanation: '"La Mode" = Fashion. "À la mode" in French means fashionable/in style (in the US it also means "with ice cream"!).' },
        { id: 'fr-cu-q2', question: '"Joie de Vivre" means:', options: ['Fear of life', 'Joy of living', 'Art of cooking', 'Love of travel'], answerIndex: 1, explanation: '"Joie de Vivre" = Joy of living/life — a famous French cultural concept of enthusiastically enjoying life.' },
        { id: 'fr-cu-q3', question: '"Bon Appétit" is said:', options: ['After finishing a meal', 'Before starting a meal', 'When ordering food', 'When paying the bill'], answerIndex: 1, explanation: '"Bon Appétit" = Enjoy your meal — said before or at the start of eating. It\'s a French social custom.' },
        { id: 'fr-cu-q4', question: '"Une Boulangerie" is:', options: ['A cheese shop', 'A restaurant', 'A bakery (sells bread and pastries)', 'A wine shop'], answerIndex: 2, explanation: '"Une Boulangerie" = A bakery — where fresh baguettes, croissants, and pastries are sold daily in France.' },
        { id: 'fr-cu-q5', question: 'France invented cinema in which year?', options: ['1850', '1895', '1910', '1920'], answerIndex: 1, explanation: 'The Lumière brothers held the world\'s first public film screening in Paris in 1895 — inventing cinema!' },
        { id: 'fr-cu-q6', question: '"La Gastronomie Française" is recognized as:', options: ['A French cooking technique', 'A UNESCO Intangible Cultural Heritage', 'A French restaurant style', 'A school of cooking'], answerIndex: 1, explanation: 'French gastronomy was inscribed on UNESCO\'s Intangible Cultural Heritage list in 2010.' },
        { id: 'fr-cu-q7', question: 'The world\'s most visited museum, "Le Louvre", is in:', options: ['Lyon', 'Nice', 'Paris', 'Bordeaux'], answerIndex: 2, explanation: 'The Louvre (Le Louvre) in Paris is the world\'s most visited museum, home to the Mona Lisa.' },
        { id: 'fr-cu-q8', question: '"La Politesse" emphasizes that in France:', options: ['Speed of service is most important', 'Greetings and manners are culturally very important', 'Silence is golden', 'Directness is valued above all'], answerIndex: 1, explanation: 'La politesse (politeness) is central to French culture — always say "Bonjour" when entering any shop, and formal greetings matter.' },
        { id: 'fr-cu-q9', question: '"Haute Couture" means:', options: ['Street fashion', 'High fashion / luxury handmade clothing', 'Vintage clothing', 'Ready-to-wear fashion'], answerIndex: 1, explanation: '"Haute Couture" (High Sewing) refers to exclusive, custom luxury fashion — Paris is its world capital.' },
        { id: 'fr-cu-q10', question: 'The world\'s most prestigious film festival, "Le Festival de Cannes", is held in:', options: ['Paris', 'Lyon', 'Cannes (French Riviera)', 'Bordeaux'], answerIndex: 2, explanation: 'The Cannes Film Festival (Festival de Cannes) is held annually in Cannes on the French Riviera — cinema\'s most prestigious event.' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇪🇸  SPANISH LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'spanish-vocab-greetings',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'spanish',
    title: 'Spanish Essentials: Hola & Core Phrases',
    description: 'Learn the most important Spanish greetings, polite expressions, and self-introduction phrases spoken across 20+ countries.',
    xpReward: 200,
    estimatedMinutes: 12,
    content: {
      introduction: 'Spanish (Español) is the world\'s second most spoken native language with over 485 million speakers across 20+ countries. From Spain to Mexico to Argentina, Spanish opens doors across two continents. It\'s famous for its warm, expressive character and its strong connection to music, food, and family culture.',
      words: [
        { word: 'Hola / Buenos días', partOfSpeech: 'greeting', definition: 'Hi / Good morning — Hola is the universal casual greeting; Buenos días is the formal morning version.', englishExample: 'Hola! ¿Cómo estás? — Hi! How are you?' },
        { word: 'Gracias / De nada', partOfSpeech: 'phrase', definition: 'Thank you / You\'re welcome — the most important exchange of gratitude in Spanish.', englishExample: 'Muchas gracias! — De nada — Thank you very much! — You\'re welcome.' },
        { word: 'Por favor', partOfSpeech: 'phrase', definition: 'Please — the indispensable polite word, used in requests and orders across Spanish-speaking countries.', englishExample: 'Un agua, por favor — A water, please.' },
        { word: 'Perdón / Disculpe', partOfSpeech: 'phrase', definition: 'Sorry / Excuse me — Perdón for apologizing, Disculpe for getting someone\'s attention politely.', englishExample: 'Disculpe, ¿dónde está el baño? — Excuse me, where is the bathroom?' },
        { word: 'Me llamo...', partOfSpeech: 'phrase', definition: 'My name is... — literally "I call myself..." — the standard Spanish self-introduction.', englishExample: 'Me llamo Carlos. ¿Y tú? — My name is Carlos. And you?' },
        { word: '¿Cómo estás? / Bien, gracias', partOfSpeech: 'phrase', definition: 'How are you? / Fine, thank you — the most common Spanish social exchange.', englishExample: 'Hola! ¿Cómo estás? — Bien, gracias. ¿Y tú? — Hi! How are you? — Fine, thanks. And you?' },
        { word: 'Lo siento', partOfSpeech: 'phrase', definition: 'I\'m sorry (sincere apology) — used for sincere apologies, stronger than "perdón".', englishExample: 'Lo siento mucho, fue mi culpa — I\'m very sorry, it was my fault.' },
        { word: 'Hasta luego / Adiós', partOfSpeech: 'phrase', definition: 'See you later / Goodbye — Hasta luego implies seeing each other again; Adiós is a final farewell.', englishExample: 'Hasta luego! Que te vaya bien! — See you later! Hope it goes well!' },
      ],
      quiz: [
        { id: 'es-gr-q1', question: '"Buenos días" is used:', options: ['In the evening', 'At night', 'In the morning (good morning)', 'On weekends only'], answerIndex: 2, explanation: '"Buenos días" = Good morning. Buenas tardes = Good afternoon. Buenas noches = Good evening/night.' },
        { id: 'es-gr-q2', question: '"Muchas gracias" means:', options: ['Thank you a little', 'Thank you very much', 'No thank you', 'Thanks anyway'], answerIndex: 1, explanation: '"Muchas gracias" = Thank you very much. Muchas = many/much, Gracias = thank you.' },
        { id: 'es-gr-q3', question: '"Por favor" is:', options: ['Goodbye', 'You\'re welcome', 'Please', 'Excuse me'], answerIndex: 2, explanation: '"Por favor" = Please — essential for polite requests in Spanish.' },
        { id: 'es-gr-q4', question: '"Me llamo..." is used to:', options: ['Ask someone\'s name', 'Say your name / introduce yourself', 'Say where you\'re from', 'Ask someone\'s age'], answerIndex: 1, explanation: '"Me llamo..." = My name is... — literally "I call myself..." — the standard Spanish introduction.' },
        { id: 'es-gr-q5', question: 'How do you say "How are you?" informally in Spanish?', options: ['¿Cómo se llama?', '¿Dónde está?', '¿Cómo estás?', '¿Cuánto cuesta?'], answerIndex: 2, explanation: '"¿Cómo estás?" = How are you? (informal). "¿Cómo está usted?" = How are you? (formal).' },
        { id: 'es-gr-q6', question: '"Lo siento" is used when:', options: ['Greeting someone', 'Thanking someone', 'Making a sincere apology', 'Ordering food'], answerIndex: 2, explanation: '"Lo siento" = I\'m sorry (sincere). It\'s stronger than "perdón" and used for genuine apologies.' },
        { id: 'es-gr-q7', question: '"Hasta luego" means:', options: ['Goodbye forever', 'See you later', 'Good night', 'Hello again'], answerIndex: 1, explanation: '"Hasta luego" = See you later. Hasta = until, Luego = later/soon. Implies another meeting.' },
        { id: 'es-gr-q8', question: 'Spanish is spoken natively in how many countries?', options: ['5', '10', '20+', '50+'], answerIndex: 2, explanation: 'Spanish is the official language in 20+ countries across Spain, Latin America, and is widely spoken in the US.' },
        { id: 'es-gr-q9', question: '"De nada" is the response to:', options: ['Hola', 'Gracias', 'Lo siento', 'Buenos días'], answerIndex: 1, explanation: '"De nada" = You\'re welcome — literally "it\'s nothing". Said in response to "Gracias".' },
        { id: 'es-gr-q10', question: '"Disculpe" is used to:', options: ['Apologize sincerely', 'Get someone\'s attention politely', 'Say goodbye', 'Ask for directions'], answerIndex: 1, explanation: '"Disculpe" = Excuse me — used to politely get someone\'s attention. "Perdón" is more for bumping into someone.' },
      ],
    },
  },
  {
    id: 'spanish-conv-market',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'spanish',
    title: 'Spanish Conversations: At the Market (En el Mercado)',
    description: 'Practice real Spanish market conversations — asking for prices, bargaining, and buying fresh produce.',
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: 'You are at a vibrant Mexican mercado (market) in Oaxaca. A friendly vendor is selling fresh tropical fruits and local chiles. You want to buy some avocados and ask about the specialties. This dialogue teaches practical market Spanish.',
      speakerNames: ['Vendor (Vendedor/a)', 'Customer (Cliente)'],
      transcript: [
        { speaker: 'Vendor (Vendedor/a)', text: '¡Buenos días! ¿Qué le doy? (Good morning! What can I give you?)' },
        { speaker: 'Customer (Cliente)', text: 'Buenos días. ¿Cuánto cuestan los aguacates? (Good morning. How much do the avocados cost?)' },
        { speaker: 'Vendor (Vendedor/a)', text: 'Están a veinte pesos el kilo. ¡Son fresquísimos! (They\'re 20 pesos per kilo. They are very fresh!)' },
        { speaker: 'Customer (Cliente)', text: 'Me da dos kilos, por favor. ¿Tiene chiles también? (Give me two kilos, please. Do you also have chiles?)' },
        { speaker: 'Vendor (Vendedor/a)', text: 'Sí, tengo chile habanero, jalapeño y ancho. ¿Cuál prefiere? (Yes, I have habanero, jalapeño and ancho chiles. Which do you prefer?)' },
        { speaker: 'Customer (Cliente)', text: 'Jalapeño, por favor. No muy picante. (Jalapeño please. Not too spicy.)' },
        { speaker: 'Vendor (Vendedor/a)', text: '¡Perfecto! Todo junto son cincuenta pesos. (Perfect! Everything together is 50 pesos.)' },
        { speaker: 'Customer (Cliente)', text: 'Aquí tiene. Muchas gracias, ¡que tenga buen día! (Here you go. Thank you very much, have a good day!)' },
      ],
      quiz: [
        { id: 'es-mk-q1', question: '"¿Cuánto cuesta?" means:', options: ['What is this?', 'How much does it cost?', 'Is it fresh?', 'Do you have it?'], answerIndex: 1, explanation: '"¿Cuánto cuesta?" = How much does it cost? Essential for all Spanish shopping situations.' },
        { id: 'es-mk-q2', question: '"¿Qué le doy?" is a vendor\'s way of saying:', options: ['Are you leaving?', 'What can I give you? / What would you like?', 'Do you have change?', 'What is your name?'], answerIndex: 1, explanation: '"¿Qué le doy?" = What can I give you? — a common market vendor greeting offering help.' },
        { id: 'es-mk-q3', question: '"El aguacate" is:', options: ['A type of chile', 'Avocado', 'Mango', 'Tomato'], answerIndex: 1, explanation: '"El aguacate" = Avocado — one of Mexico\'s most iconic products and central to guacamole.' },
        { id: 'es-mk-q4', question: '"Fresquísimos" means:', options: ['Very cheap', 'Very fresh (superlative)', 'Very colorful', 'Very spicy'], answerIndex: 1, explanation: '"Fresquísimos" = Very very fresh. Adding -ísimo/a to adjectives creates the superlative form in Spanish.' },
        { id: 'es-mk-q5', question: '"No muy picante" means:', options: ['Not very sweet', 'Not very expensive', 'Not too spicy', 'Not very ripe'], answerIndex: 2, explanation: '"No muy picante" = Not too spicy. Picante = spicy in Spanish.' },
        { id: 'es-mk-q6', question: '"Me da dos kilos, por favor" means:', options: ['I want to see two kilos', 'Give me two kilos, please', 'I have two kilos', 'Two kilos is too much'], answerIndex: 1, explanation: '"Me da..." = Give me / Can you give me... Used to make purchases or requests.' },
        { id: 'es-mk-q7', question: '"¿Tiene...?" is used to ask:', options: ['How much?', 'Do you have...?', 'What is...?', 'Where is...?'], answerIndex: 1, explanation: '"¿Tiene...?" = Do you have...? From "tener" (to have). "¿Tiene jalapeños?" = Do you have jalapeños?' },
        { id: 'es-mk-q8', question: '"Cincuenta pesos" means:', options: ['15 pesos', '50 pesos', '500 pesos', '5 pesos'], answerIndex: 1, explanation: 'Cincuenta = 50. El peso = the currency of Mexico and several other Latin American countries.' },
        { id: 'es-mk-q9', question: '"¡Que tenga buen día!" means:', options: ['See you tomorrow!', 'Come back soon!', 'Have a good day!', 'Thank you very much!'], answerIndex: 2, explanation: '"¡Que tenga buen día!" = Have a good day! A warm farewell common in Latin American markets.' },
        { id: 'es-mk-q10', question: 'Which chile is generally the mildest of these options?', options: ['Habanero', 'Ghost pepper', 'Jalapeño', 'Scotch bonnet'], answerIndex: 2, explanation: 'Jalapeño is the mildest of these options. Habanero is much hotter. Chile knowledge is cultural knowledge in Mexico!' },
      ],
    },
  },
  {
    id: 'spanish-vocab-culture',
    category: 'vocabulary',
    level: 'intermediate',
    targetLang: 'spanish',
    title: 'Spanish Vocabulary: Travel, Food & Fiesta Culture',
    description: 'Explore Spanish and Latin American cultural vocabulary — travel words, food terms, music, and the vibrant fiesta culture.',
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: 'The Spanish-speaking world is richly diverse — from flamenco in Spain to salsa in Colombia, from tacos in Mexico to asado in Argentina. This lesson dives into the cultural vocabulary that makes Spanish-speaking cultures so vibrant, joyful, and beloved worldwide.',
      words: [
        { word: 'La Fiesta', partOfSpeech: 'noun', definition: 'Party / Festival / Celebration — central to Spanish and Latin American culture, fiestas are joyful communal celebrations.', englishExample: 'La fiesta de San Fermín es muy famosa — The San Fermín festival is very famous.' },
        { word: 'El Fútbol', partOfSpeech: 'noun', definition: 'Football/Soccer — the most popular sport in the Spanish-speaking world. Passion for fútbol unites the culture.', englishExample: 'El fútbol es la pasión de los latinoamericanos — Football is the passion of Latin Americans.' },
        { word: 'La Música', partOfSpeech: 'noun', definition: 'Music — Spanish musical genres (flamenco, salsa, reggaeton, tango, mariachi) are globally influential.', englishExample: 'Me encanta la música latina — I love Latin music.' },
        { word: 'El Mercado', partOfSpeech: 'noun', definition: 'Market — traditional markets are the heart of Spanish and Latin American community life.', englishExample: 'El mercado es el corazón de la ciudad — The market is the heart of the city.' },
        { word: 'La Sobremesa', partOfSpeech: 'concept', definition: 'Post-meal conversation — the Spanish cultural tradition of lingering at the table after eating to talk. No rushing allowed!', englishExample: 'La sobremesa es sagrada en España — The after-meal conversation is sacred in Spain.' },
        { word: 'Siesta', partOfSpeech: 'noun', definition: 'Afternoon nap — the Spanish tradition of a midday rest, though now mainly in smaller towns and older generations.', englishExample: 'En verano, mucha gente hace la siesta — In summer, many people take a siesta.' },
        { word: 'El Tapeo / Las Tapas', partOfSpeech: 'noun', definition: 'Tapas culture — the Spanish tradition of eating small dishes while socializing. One of Spain\'s greatest gifts to the world.', englishExample: 'Vamos de tapas esta noche — Let\'s go for tapas tonight.' },
        { word: 'Mi casa es tu casa', partOfSpeech: 'phrase', definition: 'My house is your house — a famous Spanish hospitality expression showing warmth and generosity to guests.', englishExample: 'Bienvenido! Mi casa es tu casa — Welcome! My house is your house.' },
      ],
      quiz: [
        { id: 'es-cu-q1', question: '"La Fiesta" in Spanish culture means:', options: ['A political gathering', 'A joyful party/festival/celebration', 'A religious ceremony only', 'A sports event'], answerIndex: 1, explanation: '"La Fiesta" = Party / Festival / Celebration — the word and concept are central to Spanish-speaking cultures.' },
        { id: 'es-cu-q2', question: '"La Sobremesa" is the Spanish tradition of:', options: ['Cooking together', 'Eating quickly', 'Lingering at the table after a meal to talk', 'Napping after lunch'], answerIndex: 2, explanation: '"La Sobremesa" (literally "over the table") = the post-meal conversation — a sacred Spanish social custom.' },
        { id: 'es-cu-q3', question: '"Las Tapas" are:', options: ['A type of Spanish dessert', 'Small plates of food shared while socializing', 'A type of Spanish hat', 'Full-course meals'], answerIndex: 1, explanation: '"Las Tapas" = Small Spanish dishes shared during socializing — one of Spain\'s greatest culinary gifts to the world.' },
        { id: 'es-cu-q4', question: '"Mi casa es tu casa" means:', options: ['My house is private', 'You can buy my house', 'My house is your house (gesture of hospitality)', 'Our houses are different'], answerIndex: 2, explanation: '"Mi casa es tu casa" = My house is your house — a famous expression of warm Latin hospitality and welcome.' },
        { id: 'es-cu-q5', question: '"La Siesta" is traditionally taken:', options: ['After dinner', 'At midnight', 'In the early afternoon after lunch', 'Before breakfast'], answerIndex: 2, explanation: 'La Siesta is a traditional midday/early afternoon nap, especially common in hot Mediterranean and Latin climates.' },
        { id: 'es-cu-q6', question: 'Which musical genre is from Argentina?', options: ['Flamenco', 'Salsa', 'Mariachi', 'Tango'], answerIndex: 3, explanation: 'Tango originated in Buenos Aires, Argentina (and Montevideo, Uruguay) in the late 19th century.' },
        { id: 'es-cu-q7', question: 'Flamenco, the passionate music and dance form, originated in:', options: ['Mexico', 'Cuba', 'Southern Spain (Andalusia)', 'Colombia'], answerIndex: 2, explanation: 'Flamenco originated in Andalusia, southern Spain — it\'s a UNESCO Intangible Cultural Heritage.' },
        { id: 'es-cu-q8', question: '"El Fútbol" occupies what place in Spanish and Latin American culture?', options: ['A minor hobby', 'Only popular with young men', 'Central passion and community identity', 'Declining in interest'], answerIndex: 2, explanation: 'Fútbol is the defining passion of most Spanish-speaking countries — uniting communities across all social classes.' },
        { id: 'es-cu-q9', question: 'The famous "Running of the Bulls" festival (Fiesta de San Fermín) is held in:', options: ['Madrid', 'Barcelona', 'Pamplona', 'Seville'], answerIndex: 2, explanation: 'San Fermín is held in Pamplona, Navarra, Spain — immortalized by Ernest Hemingway\'s "The Sun Also Rises".' },
        { id: 'es-cu-q10', question: '"Me encanta" means:', options: ['I like it', 'I hate it', 'I love it (I\'m enchanted by it)', 'I\'m not sure about it'], answerIndex: 2, explanation: '"Me encanta" = I love it! — stronger than "me gusta" (I like it). From "encantar" = to enchant.' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇨🇳  MANDARIN CHINESE LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'chinese-vocab-greetings',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'chinese',
    title: 'Mandarin Essentials: Nǐ hǎo & Tones Basics',
    description: 'Begin your Mandarin journey with essential greetings, the revolutionary concept of tones, and the Pinyin romanization system.',
    xpReward: 220,
    estimatedMinutes: 14,
    content: {
      introduction: 'Mandarin Chinese (普通话 — Pǔtōnghuà) is spoken by over 1 billion people and is the world\'s most spoken language by native speakers. Its most unique feature is TONES — the same syllable spoken in 4 different tones creates 4 completely different words! Pinyin is the romanization system that shows pronunciation. This lesson is your foundation.',
      words: [
        { word: '你好 (Nǐ hǎo)', partOfSpeech: 'greeting', definition: 'Hello — literally "you good". The universal Mandarin greeting for any time of day.', englishExample: 'Nǐ hǎo! Nǐ jiào shénme míngzì? — Hello! What is your name?' },
        { word: '谢谢 (Xièxiè)', partOfSpeech: 'phrase', definition: 'Thank you — said with two falling tones. One of the first words every Chinese learner masters.', englishExample: 'Xièxiè nǐ de bāngzhù! — Thank you for your help!' },
        { word: '对不起 (Duìbuqǐ)', partOfSpeech: 'phrase', definition: 'I\'m sorry / Excuse me — used for apologies and when apologizing for an inconvenience.', englishExample: 'Duìbuqǐ, wǒ bù míngbái — I\'m sorry, I don\'t understand.' },
        { word: '不客气 (Bú kèqi)', partOfSpeech: 'phrase', definition: 'You\'re welcome — literally "don\'t be polite/formal". The standard response to Xièxiè.', englishExample: 'Xièxiè! — Bú kèqi! — Thank you! — You\'re welcome!' },
        { word: '我叫... (Wǒ jiào...)', partOfSpeech: 'phrase', definition: 'My name is... — literally "I am called..." The standard Mandarin self-introduction.', englishExample: 'Wǒ jiào Lǐ Wěi. Nǐ ne? — My name is Li Wei. And you?' },
        { word: 'The 4 Tones', partOfSpeech: 'concept', definition: '1st (mā-flat), 2nd (má-rising), 3rd (mǎ-dip), 4th (mà-falling). Same spelling, 4 different meanings!', englishExample: 'mā=mother, má=hemp, mǎ=horse, mà=scold — four words from one sound with different tones!' },
        { word: '再见 (Zàijiàn)', partOfSpeech: 'phrase', definition: 'Goodbye — literally "see again". The standard Mandarin farewell.', englishExample: 'Zàijiàn! Míngtiān jiàn! — Goodbye! See you tomorrow!' },
        { word: '请 (Qǐng)', partOfSpeech: 'phrase', definition: 'Please / Please go ahead — a versatile politeness word used in requests and invitations.', englishExample: 'Qǐng zuò! — Please sit down! Qǐng wèn... — May I ask...' },
      ],
      quiz: [
        { id: 'zh-gr-q1', question: '"你好 (Nǐ hǎo)" literally means:', options: ['Good morning', 'How are you', 'You are good / Hello', 'Nice to meet you'], answerIndex: 2, explanation: '"Nǐ hǎo" = You (Nǐ) + Good (Hǎo) = literally "you good" — the universal Mandarin hello.' },
        { id: 'zh-gr-q2', question: 'Mandarin Chinese has how many tones?', options: ['2 tones', '3 tones', '4 tones (+ a neutral)', '6 tones'], answerIndex: 2, explanation: 'Standard Mandarin has 4 tones plus a neutral/5th tone. Different tones on the same syllable = completely different words!' },
        { id: 'zh-gr-q3', question: 'The word "mā, má, mǎ, mà" demonstrates that:', options: ['Spelling determines meaning', 'The same syllable in 4 different tones means 4 different things', 'Mandarin has no consistent rules', 'These are all the same word'], answerIndex: 1, explanation: 'mā=mother, má=hemp, mǎ=horse, mà=scold — 4 completely different meanings from the same sound with different tones.' },
        { id: 'zh-gr-q4', question: '"谢谢 (Xièxiè)" means:', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], answerIndex: 2, explanation: '谢谢 (Xièxiè) = Thank you — one of the most important and recognizable Mandarin phrases.' },
        { id: 'zh-gr-q5', question: '"Pinyin" is:', options: ['A Chinese dialect', 'The romanization system for Mandarin pronunciation', 'A type of Chinese writing', 'A grammar rule'], answerIndex: 1, explanation: 'Pinyin (拼音) is the official romanization system that shows how Mandarin is pronounced using Latin letters and tone marks.' },
        { id: 'zh-gr-q6', question: '"不客气 (Bú kèqi)" is said in response to:', options: ['Nǐ hǎo', 'Zàijiàn', 'Xièxiè', 'Duìbuqǐ'], answerIndex: 2, explanation: '"Bú kèqi" = You\'re welcome — literally "don\'t be polite". Said in response to "Xièxiè" (thank you).' },
        { id: 'zh-gr-q7', question: '"再见 (Zàijiàn)" literally means:', options: ['Good night', 'See again (= Goodbye)', 'Take care', 'Until next time'], answerIndex: 1, explanation: '"Zài" = again, "Jiàn" = see. 再见 = See again = Goodbye — a beautiful farewell.' },
        { id: 'zh-gr-q8', question: '"我叫... (Wǒ jiào...)" is used to:', options: ['Ask someone\'s name', 'Say where you\'re from', 'Introduce yourself (My name is...)', 'Express what you like'], answerIndex: 2, explanation: '"Wǒ jiào..." = My name is... (I am called...). "Wǒ" = I/me, "jiào" = called/named.' },
        { id: 'zh-gr-q9', question: '"请 (Qǐng)" can mean:', options: ['Please / Please go ahead (versatile polite word)', 'Thank you', 'Excuse me only', 'I\'m sorry'], answerIndex: 0, explanation: '"请" (Qǐng) = Please — used in requests "qǐng..." and invitations "qǐng zuò" (please sit).' },
        { id: 'zh-gr-q10', question: 'Mandarin is the native language of approximately how many people?', options: ['100 million', '500 million', '1 billion+', '2 billion'], answerIndex: 2, explanation: 'Mandarin Chinese has over 1 billion native speakers — making it the world\'s most spoken language by native speakers.' },
      ],
    },
  },
  {
    id: 'chinese-conv-restaurant',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'chinese',
    title: 'Mandarin Conversations: Ordering at a Restaurant (点菜)',
    description: 'Practice ordering food, asking for recommendations, and paying the bill in Mandarin at a Chinese restaurant.',
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: 'You are at a popular local Chinese restaurant (餐厅 — Cāntīng) in Beijing. A friendly server comes to your table. You want to order kung pao chicken, dumplings, and tea. This conversation teaches practical restaurant Mandarin used daily across China.',
      speakerNames: ['Server (服务员)', 'Customer (顾客)'],
      transcript: [
        { speaker: 'Server (服务员)', text: 'Nín hǎo! Nín yào diǎn shénme? (Hello! What would you like to order?)' },
        { speaker: 'Customer (顾客)', text: 'Nǐ hǎo! Wǒ yào gōngbǎo jīdīng hé jiǎozi. (Hello! I would like kung pao chicken and dumplings.)' },
        { speaker: 'Server (服务员)', text: 'Hǎo de! Hē diǎn shénme? Chá háishì píjiǔ? (Good! What would you like to drink? Tea or beer?)' },
        { speaker: 'Customer (顾客)', text: 'Lǜchá, qǐng. Zhè dào cài là ma? (Green tea, please. Is this dish spicy?)' },
        { speaker: 'Server (服务员)', text: 'Gōngbǎo jīdīng yǒu yīdiǎn là. Kěyǐ bù là ma? (Kung pao chicken is a little spicy. Can I make it not spicy?)' },
        { speaker: 'Customer (顾客)', text: 'Bú yào tài là. Xièxiè! (Not too spicy. Thank you!)' },
        { speaker: 'Server (服务员)', text: 'Méi wèntí! Qǐng shāo děng. (No problem! Please wait a moment.)' },
        { speaker: 'Customer (顾客)', text: 'Máfan nín, mǎidān! Duōshǎo qián? (Excuse me, the bill please! How much is it?)' },
      ],
      quiz: [
        { id: 'zh-rs-q1', question: '"餐厅 (Cāntīng)" means:', options: ['Kitchen', 'Restaurant', 'Food market', 'Canteen only'], answerIndex: 1, explanation: '餐厅 (Cāntīng) = Restaurant. 饭馆 (Fànguǎn) is another word for restaurant (more casual).' },
        { id: 'zh-rs-q2', question: '"您要点什么? (Nín yào diǎn shénme?)" means:', options: ['Are you ready?', 'What would you like to order?', 'How many people?', 'Do you have a reservation?'], answerIndex: 1, explanation: '"Nín yào diǎn shénme?" = What would you like to order? 点 (diǎn) = to order (food).' },
        { id: 'zh-rs-q3', question: '"宫保鸡丁 (Gōngbǎo Jīdīng)" is:', options: ['Peking Duck', 'Kung Pao Chicken', 'Mapo Tofu', 'Sweet and Sour Pork'], answerIndex: 1, explanation: '宫保鸡丁 (Gōngbǎo Jīdīng) = Kung Pao Chicken — one of China\'s most internationally famous dishes.' },
        { id: 'zh-rs-q4', question: '"辣 (Là)" means:', options: ['Sweet', 'Salty', 'Spicy', 'Sour'], answerIndex: 2, explanation: '辣 (Là) = Spicy/Hot. 不要太辣 = Don\'t make it too spicy. An important word when eating Sichuan food!' },
        { id: 'zh-rs-q5', question: '"饺子 (Jiǎozi)" are:', options: ['Spring rolls', 'Chinese dumplings', 'Fried rice', 'Noodle soup'], answerIndex: 1, explanation: '饺子 (Jiǎozi) = Chinese dumplings — a beloved staple eaten especially during Chinese New Year.' },
        { id: 'zh-rs-q6', question: '"没问题 (Méi Wèntí)" means:', options: ['What\'s the problem?', 'No problem!', 'I don\'t understand', 'One moment please'], answerIndex: 1, explanation: '"Méi Wèntí" = No problem! — 没 (Méi) = not/no, 问题 (Wèntí) = problem/question.' },
        { id: 'zh-rs-q7', question: '"买单 (Mǎidān)" means:', options: ['Menu', 'Discount', 'The bill/check', 'Receipt'], answerIndex: 2, explanation: '买单 (Mǎidān) = The bill/check — how you ask for the check in a Chinese restaurant.' },
        { id: 'zh-rs-q8', question: '"多少钱? (Duōshǎo Qián?)" means:', options: ['What time is it?', 'How many people?', 'How much money / How much does it cost?', 'What is this?'], answerIndex: 2, explanation: '"Duōshǎo Qián?" = How much money? = How much does it cost? Essential for all shopping in China.' },
        { id: 'zh-rs-q9', question: '"绿茶 (Lǜchá)" means:', options: ['Black tea', 'Oolong tea', 'Jasmine tea', 'Green tea'], answerIndex: 3, explanation: '绿茶 (Lǜchá) = Green tea. 红茶 (Hóngchá) = Red tea (= black tea in Western terms). 茉莉花茶 = Jasmine tea.' },
        { id: 'zh-rs-q10', question: '"请稍等 (Qǐng Shāo Děng)" means:', options: ['Come this way', 'Enjoy your meal', 'Please wait a moment', 'You\'re welcome'], answerIndex: 2, explanation: '"Qǐng shāo děng" = Please wait a moment. 请 = please, 稍 = a little, 等 = wait.' },
      ],
    },
  },
  {
    id: 'chinese-vocab-daily',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'chinese',
    title: 'Mandarin Vocabulary: Numbers, Colors & Daily Life',
    description: 'Master Mandarin numbers 1-10, essential colors, and everyday vocabulary for navigating life in China.',
    xpReward: 190,
    estimatedMinutes: 11,
    content: {
      introduction: 'Numbers in Mandarin are beautifully logical — once you learn 1-10, you can count to 99 with simple combinations. Colors are also intuitive, many linked to nature. These words appear in every transaction, every conversation, and every aspect of daily life in Chinese-speaking countries.',
      words: [
        { word: '一二三四五 (Yī Èr Sān Sì Wǔ)', partOfSpeech: 'number', definition: 'One / Two / Three / Four / Five — the first five Mandarin numbers.', englishExample: 'Wǒ yào liǎng gè — I want two (items). Note: "liǎng" is used for "two" before measure words.' },
        { word: '六七八九十 (Liù Qī Bā Jiǔ Shí)', partOfSpeech: 'number', definition: 'Six / Seven / Eight / Nine / Ten — completing the first decade.', englishExample: 'Shí = ten, Shí yī = eleven, Shí èr = twelve. Chinese numbers follow a logical pattern!' },
        { word: '红/蓝/黄 (Hóng / Lán / Huáng)', partOfSpeech: 'adjective', definition: 'Red / Blue / Yellow — three core Chinese colors. Red (红) is the luckiest color in Chinese culture.', englishExample: 'Hóng sè shì zhōngguó de xìngyùn yánsè — Red is China\'s lucky color.' },
        { word: '白/黑/绿 (Bái / Hēi / Lǜ)', partOfSpeech: 'adjective', definition: 'White / Black / Green — three more essential Chinese color words.', englishExample: 'Wǒ xǐhuān lǜ chá — I like green tea.' },
        { word: '水/米饭/鸡蛋 (Shuǐ / Mǐfàn / Jīdàn)', partOfSpeech: 'noun', definition: 'Water / Steamed rice / Egg — three essential Chinese food words used daily.', englishExample: 'Wǒ yào mǐfàn — I want rice. Jīdàn chǎofàn — Egg fried rice.' },
        { word: '超市 (Chāoshì)', partOfSpeech: 'noun', definition: 'Supermarket — from "super" + "market". Modern supermarkets are everywhere in Chinese cities.', englishExample: 'Wǒ qù chāoshì mǎi dōngxi — I\'m going to the supermarket to buy things.' },
        { word: '手机 (Shǒujī)', partOfSpeech: 'noun', definition: 'Mobile phone — literally "hand machine". China is the world\'s largest smartphone market.', englishExample: 'Nǐ de shǒujī hào shì duōshǎo? — What is your mobile phone number?' },
        { word: '人民币 (Rénmínbì) / 元 (Yuán)', partOfSpeech: 'noun', definition: 'Chinese currency — Renminbi (RMB) is the official name; Yuan is the basic unit. Colloquially called "kuài".', englishExample: 'Zhège duōshǎo yuán? — How many yuan is this?' },
      ],
      quiz: [
        { id: 'zh-dl-q1', question: 'What is the Mandarin word for "Ten"?', options: ['Jiǔ', 'Shí', 'Bā', 'Qī'], answerIndex: 1, explanation: '十 (Shí) = Ten. Nine = Jiǔ (九), Eight = Bā (八), Seven = Qī (七).' },
        { id: 'zh-dl-q2', question: 'In Mandarin, "eleven" is expressed as:', options: ['Shí yī (10+1)', 'Yī yī (1+1)', 'Yī shí (1×10)', 'Shí yī is a unique word'], answerIndex: 0, explanation: '"Shí yī" (十一) = 10 + 1 = Eleven. Mandarin uses a logical additive system: 12 = Shí èr, 20 = Èr shí, etc.' },
        { id: 'zh-dl-q3', question: '"红色 (Hóng sè)" is which color?', options: ['Blue', 'Yellow', 'Red', 'Green'], answerIndex: 2, explanation: '红 (Hóng) = Red. Red (红) is the luckiest and most auspicious color in Chinese culture.' },
        { id: 'zh-dl-q4', question: '"米饭 (Mǐfàn)" means:', options: ['Noodles', 'Bread', 'Steamed rice', 'Fried rice'], answerIndex: 2, explanation: '米饭 (Mǐfàn) = Steamed rice — the staple of Chinese cuisine. 米 = uncooked rice, 饭 = cooked food/rice.' },
        { id: 'zh-dl-q5', question: '"手机 (Shǒujī)" literally means:', options: ['Computer', 'Hand machine (= Mobile phone)', 'Watch', 'Camera'], answerIndex: 1, explanation: '手 (Shǒu) = Hand + 机 (Jī) = Machine. 手机 = Hand machine = Mobile phone. A wonderfully descriptive word!' },
        { id: 'zh-dl-q6', question: 'In Chinese culture, which color is considered the luckiest?', options: ['White', 'Blue', 'Red (红)', 'Gold only'], answerIndex: 2, explanation: 'Red (红色 — Hóng sè) is the luckiest color in Chinese culture — used at weddings, New Year celebrations, and for good luck.' },
        { id: 'zh-dl-q7', question: '"超市 (Chāoshì)" means:', options: ['Night market', 'Street food stall', 'Supermarket', 'Shopping mall'], answerIndex: 2, explanation: '超市 (Chāoshì) = Supermarket — from 超 (super) + 市 (market/city).' },
        { id: 'zh-dl-q8', question: 'China\'s currency is officially called:', options: ['Yuan only', 'Renminbi (RMB)', 'Kuai', 'Jiao'], answerIndex: 1, explanation: 'The official name is 人民币 (Rénmínbì = People\'s Currency), abbreviated RMB. The basic unit is 元 (Yuán). Colloquially "kuài" (块).' },
        { id: 'zh-dl-q9', question: '"绿 (Lǜ)" is which color?', options: ['Yellow', 'Green', 'Blue', 'Black'], answerIndex: 1, explanation: '绿 (Lǜ) = Green. 蓝 (Lán) = Blue. 黄 (Huáng) = Yellow. 黑 (Hēi) = Black.' },
        { id: 'zh-dl-q10', question: '"五 (Wǔ)" is which number?', options: ['3', '4', '5', '6'], answerIndex: 2, explanation: '五 (Wǔ) = Five. The sequence: 一(1) 二(2) 三(3) 四(4) 五(5).' },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🇻🇳  VIETNAMESE LANGUAGE MODULES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'vietnamese-vocab-greetings',
    category: 'vocabulary',
    level: 'beginner',
    targetLang: 'vietnamese',
    title: 'Vietnamese Essentials: Xin chào & Tonal Greetings',
    description: 'Begin your Vietnamese journey with essential greetings, the 6-tone system, and polite address terms that are unique to Vietnamese culture.',
    xpReward: 210,
    estimatedMinutes: 13,
    content: {
      introduction: 'Vietnamese (Tiếng Việt) is spoken by over 95 million people. It uses a romanized script (chữ Quốc ngữ) with accent marks — making it more readable for beginners than Chinese or Japanese. However, Vietnamese has 6 tones, making it one of the world\'s most tonal languages! A unique feature: Vietnamese uses different words for "I" and "you" based on relative age and relationship.',
      words: [
        { word: 'Xin chào!', partOfSpeech: 'greeting', definition: 'Hello! — the formal, universal Vietnamese greeting. Xin (please/respectful) + chào (greeting).', englishExample: 'Xin chào! Bạn khỏe không? — Hello! How are you?' },
        { word: 'Cảm ơn / Không có gì', partOfSpeech: 'phrase', definition: 'Thank you / You\'re welcome — the fundamental exchange of gratitude in Vietnamese.', englishExample: 'Cảm ơn bạn rất nhiều! — Thank you very much!' },
        { word: 'Xin lỗi', partOfSpeech: 'phrase', definition: 'Sorry / Excuse me — used for both apologies and getting someone\'s attention.', englishExample: 'Xin lỗi, nhà vệ sinh ở đâu? — Excuse me, where is the bathroom?' },
        { word: 'Tôi / Bạn / Anh / Chị', partOfSpeech: 'pronoun', definition: 'I / You (peer) / You (older male) / You (older female) — Vietnamese pronouns reflect social relationships.', englishExample: 'Anh tên là gì? — What is your name? (to an older male)' },
        { word: 'Tên tôi là...', partOfSpeech: 'phrase', definition: 'My name is... — Tên (name) + tôi (I/my) + là (is/am).', englishExample: 'Tên tôi là Minh. Còn bạn? — My name is Minh. And you?' },
        { word: '6 Tones (6 Thanh Điệu)', partOfSpeech: 'concept', definition: 'Vietnamese has 6 tones: flat, falling, rising, questioning, heavy, tumbling. Each changes the word\'s meaning completely.', englishExample: 'Ma (ghost), Má (mother), Mà (but), Mả (tomb), Mã (code), Mạ (rice seedling) — 6 different words, one sound!' },
        { word: 'Vâng / Không', partOfSpeech: 'adverb', definition: 'Yes (respectful) / No — Vâng is used with elders as a sign of respect; Dạ is even more formal.', englishExample: 'Vâng, tôi hiểu. — Yes, I understand. Không, cảm ơn. — No, thank you.' },
        { word: 'Tạm biệt', partOfSpeech: 'phrase', definition: 'Goodbye — the standard Vietnamese farewell. Literally "temporary separation".', englishExample: 'Tạm biệt! Hẹn gặp lại! — Goodbye! See you again!' },
      ],
      quiz: [
        { id: 'vi-gr-q1', question: '"Xin chào" is:', options: ['Goodbye', 'Thank you', 'Hello (universal greeting)', 'Sorry'], answerIndex: 2, explanation: '"Xin chào" = Hello — the universal Vietnamese greeting. "Xin" adds a respectful/polite tone.' },
        { id: 'vi-gr-q2', question: 'Vietnamese has how many tones?', options: ['2', '4', '6', '8'], answerIndex: 2, explanation: 'Vietnamese has 6 tones (6 thanh điệu), making it one of the world\'s most tonal languages.' },
        { id: 'vi-gr-q3', question: '"Cảm ơn" means:', options: ['Excuse me', 'Thank you', 'You\'re welcome', 'Hello'], answerIndex: 1, explanation: '"Cảm ơn" = Thank you. "Cảm ơn rất nhiều" = Thank you very much.' },
        { id: 'vi-gr-q4', question: 'In Vietnamese, "Anh" is used to address:', options: ['A younger person', 'A peer of the same age', 'An older male', 'An older female'], answerIndex: 2, explanation: '"Anh" is used to respectfully address an older male. "Chị" = older female. "Bạn" = peer/friend.' },
        { id: 'vi-gr-q5', question: 'The word "Ma" spoken in 6 different Vietnamese tones creates:', options: ['The same word 6 times', 'Variations of the word "ghost"', '6 completely different words', 'Formal and informal versions'], answerIndex: 2, explanation: 'Ma/Má/Mà/Mả/Mã/Mạ — 6 different words (ghost/mother/but/tomb/code/rice seedling) from one syllable in different tones!' },
        { id: 'vi-gr-q6', question: '"Xin lỗi" is used for:', options: ['Thanking someone', 'Greeting someone', 'Apologizing or getting attention', 'Saying goodbye'], answerIndex: 2, explanation: '"Xin lỗi" = Sorry / Excuse me — used for both apologies and getting someone\'s attention politely.' },
        { id: 'vi-gr-q7', question: '"Tạm biệt" means:', options: ['Hello again', 'See you soon', 'Goodbye', 'Good night'], answerIndex: 2, explanation: '"Tạm biệt" = Goodbye — literally means "temporary separation". The standard farewell.' },
        { id: 'vi-gr-q8', question: 'Vietnamese uses which writing script?', options: ['Chinese characters', 'Its own unique alphabet', 'Romanized script with accent marks (chữ Quốc ngữ)', 'Arabic script'], answerIndex: 2, explanation: 'Vietnamese uses romanized Latin script with diacritical marks for tones — making it more accessible for beginners than other Asian languages.' },
        { id: 'vi-gr-q9', question: '"Vâng" is a respectful way to say:', options: ['No', 'Maybe', 'Yes (used with elders)', 'Please'], answerIndex: 2, explanation: '"Vâng" = Yes (respectful), used when speaking to elders or people of higher status. "Dạ" is even more formal.' },
        { id: 'vi-gr-q10', question: 'Vietnamese is spoken by approximately how many people?', options: ['20 million', '50 million', '95+ million', '200 million'], answerIndex: 2, explanation: 'Vietnamese is spoken by over 95 million people — primarily in Vietnam but also by diaspora communities worldwide.' },
      ],
    },
  },
  {
    id: 'vietnamese-conv-streetfood',
    category: 'conversation',
    level: 'beginner',
    targetLang: 'vietnamese',
    title: 'Vietnamese Conversations: At a Street Food Stall',
    description: 'Practice ordering Vietnam\'s incredible street food — phở, bánh mì, bún bò — and navigating a Vietnamese food stall with real dialogue.',
    xpReward: 220,
    estimatedMinutes: 13,
    content: {
      context: 'You are at a bustling street food stall (quán ăn vỉa hè) in Hanoi\'s Old Quarter. A friendly vendor is selling fresh bowls of phở (beef noodle soup). You want to order, customize your bowl, and ask about other dishes. Vietnamese street food culture is one of the world\'s finest!',
      speakerNames: ['Vendor (Chủ quán)', 'Customer (Khách)'],
      transcript: [
        { speaker: 'Vendor (Chủ quán)', text: 'Chào bạn! Bạn muốn ăn gì? (Hello! What would you like to eat?)' },
        { speaker: 'Customer (Khách)', text: 'Cho tôi một tô phở bò, xin cảm ơn! (Please give me one bowl of beef phở, thank you!)' },
        { speaker: 'Vendor (Chủ quán)', text: 'Tái hay chín? Phở bò tái hay chín bạn? (Rare or well-done? Rare or well-done beef phở?)' },
        { speaker: 'Customer (Khách)', text: 'Chín, cảm ơn. Cay không? (Well-done, thank you. Is it spicy?)' },
        { speaker: 'Vendor (Chủ quán)', text: 'Không cay. Bạn có thể thêm ớt nếu muốn. (Not spicy. You can add chili if you want.)' },
        { speaker: 'Customer (Khách)', text: 'Tôi muốn không cay. Bao nhiêu tiền một tô? (I want no spice. How much is one bowl?)' },
        { speaker: 'Vendor (Chủ quán)', text: 'Năm mươi nghìn đồng một tô. Rẻ lắm! (Fifty thousand dong per bowl. Very cheap!)' },
        { speaker: 'Customer (Khách)', text: 'Ngon quá! Tôi muốn thêm một tô nữa. (So delicious! I want one more bowl.)' },
      ],
      quiz: [
        { id: 'vi-sf-q1', question: '"Phở (Phở Bò)" is:', options: ['Grilled pork with noodles', 'Vietnamese beef noodle soup', 'A Vietnamese sandwich', 'Fried rice dish'], answerIndex: 1, explanation: 'Phở Bò (phở = noodle soup, bò = beef) is Vietnam\'s most iconic dish — a fragrant beef noodle soup.' },
        { id: 'vi-sf-q2', question: '"Bạn muốn ăn gì?" means:', options: ['Are you hungry?', 'What did you eat?', 'What would you like to eat?', 'Is the food ready?'], answerIndex: 2, explanation: '"Bạn muốn ăn gì?" = What would you like to eat? Muốn = want, Ăn = eat, Gì = what.' },
        { id: 'vi-sf-q3', question: '"Cho tôi..." is used to:', options: ['Ask a question', 'Say thank you', 'Ask someone to give you something / order', 'Refuse something'], answerIndex: 2, explanation: '"Cho tôi..." = Please give me / I\'d like... — the standard way to order in Vietnamese.' },
        { id: 'vi-sf-q4', question: '"Tái" means what type of beef in phở?', options: ['Well-done', 'Rare (barely cooked)', 'Medium', 'Grilled'], answerIndex: 1, explanation: '"Tái" = Rare beef, added raw and cooked by the hot soup. "Chín" = well-done beef.' },
        { id: 'vi-sf-q5', question: '"Cay không?" means:', options: ['Is it cheap?', 'Is it fresh?', 'Is it spicy?', 'Is it delicious?'], answerIndex: 2, explanation: '"Cay không?" = Is it spicy? Cay = spicy in Vietnamese. Not (không) + spicy (cay) = không cay = not spicy.' },
        { id: 'vi-sf-q6', question: '"Bao nhiêu tiền?" means:', options: ['How many people?', 'How much money / How much does it cost?', 'What time is it?', 'How far is it?'], answerIndex: 1, explanation: '"Bao nhiêu tiền?" = How much money? = How much does it cost? Essential for Vietnamese shopping and dining.' },
        { id: 'vi-sf-q7', question: 'Vietnamese currency is called:', options: ['Baht', 'Dong (Đồng)', 'Ringgit', 'Peso'], answerIndex: 1, explanation: 'Vietnam\'s currency is the Đồng (₫). "Năm mươi nghìn đồng" = 50,000 dong (approximately $2 USD).' },
        { id: 'vi-sf-q8', question: '"Ngon quá!" means:', options: ['Too spicy!', 'Very expensive!', 'So delicious!', 'Very cheap!'], answerIndex: 2, explanation: '"Ngon quá!" = So delicious! Ngon = delicious/tasty, Quá = very/too. Perfect for complimenting Vietnamese food.' },
        { id: 'vi-sf-q9', question: '"Thêm một tô nữa" means:', options: ['The bill please', 'Another bowl please', 'A smaller bowl please', 'No more please'], answerIndex: 1, explanation: '"Thêm" = more/add. "Một tô nữa" = one more bowl. → Another bowl please.' },
        { id: 'vi-sf-q10', question: 'Vietnamese street food is recognized for being:', options: ['Mostly desserts', 'Expensive and exclusive', 'Among the world\'s finest and most flavorful affordable cuisines', 'Simple and bland'], answerIndex: 2, explanation: 'Vietnamese street food (especially phở, bánh mì, bún bò) is internationally celebrated as some of the world\'s best and most accessible cuisine.' },
      ],
    },
  },
  {
    id: 'vietnamese-vocab-culture',
    category: 'vocabulary',
    level: 'intermediate',
    targetLang: 'vietnamese',
    title: 'Vietnamese Vocabulary: Food, Culture & Daily Life',
    description: 'Explore Vietnamese cultural vocabulary — iconic foods, cultural values, festivals, and daily life words that reflect Vietnam\'s rich heritage.',
    xpReward: 240,
    estimatedMinutes: 14,
    content: {
      introduction: 'Vietnam is a country of extraordinary natural beauty, rich history, and vibrant culture. From the ancient town of Hội An to the limestone karsts of Hạ Long Bay, Vietnamese culture blends Confucian values, Buddhist traditions, French colonial influence, and indigenous creativity. This vocabulary connects you to the heart of Vietnamese life.',
      words: [
        { word: 'Bánh mì', partOfSpeech: 'noun', definition: 'Vietnamese sandwich — a fusion baguette from French colonial influence, filled with Vietnamese ingredients. UNESCO-recognized street food.', englishExample: 'Bánh mì thịt nướng ngon lắm! — Grilled pork bánh mì is so delicious!' },
        { word: 'Tết Nguyên Đán', partOfSpeech: 'noun', definition: 'Vietnamese Lunar New Year — the most important Vietnamese festival, celebrating family reunion, luck, and new beginnings.', englishExample: 'Chúc mừng năm mới! — Happy New Year! (Said during Tết)' },
        { word: 'Gia đình', partOfSpeech: 'noun', definition: 'Family — the cornerstone of Vietnamese society. Confucian values place enormous emphasis on family loyalty and filial piety.', englishExample: 'Gia đình là quan trọng nhất — Family is the most important thing.' },
        { word: 'Nón lá', partOfSpeech: 'noun', definition: 'Conical hat — the iconic Vietnamese palm-leaf hat, a symbol of Vietnamese identity and women\'s grace.', englishExample: 'Nón lá là biểu tượng của Việt Nam — The conical hat is a symbol of Vietnam.' },
        { word: 'Áo dài', partOfSpeech: 'noun', definition: 'Traditional Vietnamese dress — the national costume, a fitted silk tunic worn over trousers. Elegant and iconic.', englishExample: 'Áo dài rất đẹp — The áo dài is very beautiful.' },
        { word: 'Cà phê trứng', partOfSpeech: 'noun', definition: 'Egg coffee — a uniquely Vietnamese specialty from Hanoi: strong coffee topped with creamy, sweetened egg yolk foam.', englishExample: 'Cà phê trứng Hà Nội nổi tiếng thế giới — Hanoi\'s egg coffee is world-famous.' },
        { word: 'Hội An', partOfSpeech: 'noun', definition: 'A UNESCO World Heritage ancient town — famous for its well-preserved trading port architecture, lanterns, and tailors.', englishExample: 'Hội An rất đẹp vào ban đêm — Hội An is very beautiful at night.' },
        { word: 'Chúc mừng!', partOfSpeech: 'phrase', definition: 'Congratulations! — used for birthdays, new year, achievements, and celebrations.', englishExample: 'Chúc mừng sinh nhật! — Happy Birthday! / Congratulations on your birthday!' },
      ],
      quiz: [
        { id: 'vi-cu-q1', question: '"Bánh mì" is a Vietnamese sandwich that shows which cultural influence?', options: ['Chinese influence', 'American influence', 'French colonial influence (baguette)', 'Japanese influence'], answerIndex: 2, explanation: 'Bánh mì uses a French baguette (from French colonial era) filled with Vietnamese ingredients — a delicious cultural fusion.' },
        { id: 'vi-cu-q2', question: '"Tết Nguyên Đán" is:', options: ['Vietnam\'s Independence Day', 'The Lunar New Year — Vietnam\'s most important festival', 'A harvest festival', 'A Buddhist holiday only'], answerIndex: 1, explanation: 'Tết Nguyên Đán = Vietnamese Lunar New Year — the most significant national celebration, emphasizing family, luck, and new beginnings.' },
        { id: 'vi-cu-q3', question: '"Áo dài" is:', options: ['A traditional Vietnamese hat', 'A Vietnamese musical instrument', 'Vietnam\'s national traditional dress (fitted silk tunic)', 'A type of Vietnamese noodle'], answerIndex: 2, explanation: 'Áo dài (Long shirt) = Vietnam\'s beautiful national dress — a fitted silk tunic worn over trousers, especially by women.' },
        { id: 'vi-cu-q4', question: '"Gia đình" means:', options: ['Village', 'Community', 'Family', 'Ancestors'], answerIndex: 2, explanation: '"Gia đình" = Family — the foundation of Vietnamese society, rooted in Confucian values of family loyalty.' },
        { id: 'vi-cu-q5', question: '"Chúc mừng sinh nhật!" means:', options: ['Happy New Year', 'Happy Birthday / Congratulations on your birthday', 'Congratulations on your wedding', 'Welcome home'], answerIndex: 1, explanation: '"Chúc mừng sinh nhật!" = Happy Birthday! Chúc mừng = Congratulations/Happy, Sinh nhật = Birthday.' },
        { id: 'vi-cu-q6', question: '"Nón lá" is:', options: ['A Vietnamese drum', 'The iconic conical palm-leaf hat', 'A traditional Vietnamese dance', 'A type of Vietnamese fabric'], answerIndex: 1, explanation: '"Nón lá" = Conical hat — the iconic Vietnamese palm-leaf hat, a recognized symbol of Vietnamese identity and femininity.' },
        { id: 'vi-cu-q7', question: '"Cà phê trứng" is a specialty from which Vietnamese city?', options: ['Ho Chi Minh City', 'Da Nang', 'Hanoi (Hà Nội)', 'Hội An'], answerIndex: 2, explanation: '"Cà phê trứng" (egg coffee) originated in Hanoi (Hà Nội) in the 1940s and is now world-famous.' },
        { id: 'vi-cu-q8', question: '"Hội An" is recognized as:', options: ['Vietnam\'s capital city', 'A UNESCO World Heritage ancient trading town', 'Vietnam\'s largest market', 'A modern Vietnamese city'], answerIndex: 1, explanation: 'Hội An (古會安) is a beautifully preserved UNESCO World Heritage ancient town famous for its lanterns, history, and tailors.' },
        { id: 'vi-cu-q9', question: 'Vietnamese culture is primarily influenced by:', options: ['Only French colonial history', 'Confucian values, Buddhist traditions, and indigenous heritage', 'Only Chinese culture', 'Western culture primarily'], answerIndex: 1, explanation: 'Vietnamese culture blends Confucian values, Buddhist traditions, indigenous cultures, and French colonial influence into a unique identity.' },
        { id: 'vi-cu-q10', question: '"Chúc mừng năm mới!" means:', options: ['Goodbye for the year', 'Happy New Year! (Tết greeting)', 'Welcome to Vietnam', 'Best wishes always'], answerIndex: 1, explanation: '"Chúc mừng năm mới!" = Happy New Year! — the most important Tết greeting exchanged between family and friends.' },
      ],
    },
  },
];

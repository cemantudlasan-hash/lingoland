import { QuizItem } from './types';

export const EXAM_QUESTIONS: QuizItem[] = [
  // --- GRAMMAR (1-10) ---
  {
    id: 'ex-1',
    question: 'She has ________ in London since she graduated from university in 2018.',
    options: ['lived', 'lives', 'living', 'been lived'],
    answerIndex: 0,
    explanation: 'The present perfect tense (has + past participle "lived") is used here because the action started in the past (2018) and continues to the present, signaled by the word "since".'
  },
  {
    id: 'ex-2',
    question: 'If I had known about the traffic delays, I ________ a different route.',
    options: ['will take', 'took', 'would have taken', 'take'],
    answerIndex: 2,
    explanation: 'This is a third conditional sentence, which refers to an imaginary situation in the past. The structure is [If + Past Perfect (had known)], [would have + Past Participle (would have taken)].'
  },
  {
    id: 'ex-3',
    question: 'The new environmental protection laws ________ by the government next month.',
    options: ['will introduce', 'will be introduced', 'are introducing', 'introduced'],
    answerIndex: 1,
    explanation: 'The sentence requires the future passive voice because the subject (the laws) receives the action of being introduced by the agent (the government). The formula is [will be + past participle].'
  },
  {
    id: 'ex-4',
    question: 'Henry asked me ________ I had finished the quarterly report.',
    options: ['that', 'weather', 'if', 'what'],
    answerIndex: 2,
    explanation: 'In reported questions for yes/no questions, we use "if" or "whether" (spelled "whether", not "weather") to introduce the reported clause.'
  },
  {
    id: 'ex-5',
    question: 'Our manager suggested ________ the deadline to allow for thorough testing.',
    options: ['postpone', 'postponing', 'to postpone', 'postponed'],
    answerIndex: 1,
    explanation: 'The verb "suggest" is followed by a gerund (verb-ing) when there is no direct object pronoun or "that" clause: "suggested postponing".'
  },
  {
    id: 'ex-6',
    question: 'The group of students, along with their teacher, ________ visiting the museum today.',
    options: ['is', 'are', 'were', 'be'],
    answerIndex: 0,
    explanation: 'The subject of the sentence is "The group" (singular collective noun). Phrases like "along with their teacher" do not change the number of the subject. Therefore, the singular verb "is" is correct.'
  },
  {
    id: 'ex-7',
    question: 'You ________ submit the project proposal today; the director extended the deadline to Friday.',
    options: ['must not', 'need not', 'should', 'ought to'],
    answerIndex: 1,
    explanation: '"Need not" (or "don\'t have to") expresses lack of obligation or necessity. Since the deadline was extended, submitting it today is not necessary.'
  },
  {
    id: 'ex-8',
    question: 'The company ________ logo is a blue bird has recently rebranded.',
    options: ['which', 'who', 'whom', 'whose'],
    answerIndex: 3,
    explanation: 'The relative pronoun "whose" is possessive and shows that the logo belongs to the company.'
  },
  {
    id: 'ex-9',
    question: '________ she worked incredibly hard, she was not promoted this quarter.',
    options: ['Despite', 'Although', 'However', 'In spite of'],
    answerIndex: 1,
    explanation: '"Although" is a conjunction used to introduce a clause of concession (subject + verb: "she worked"). "Despite" and "In spite of" require a noun or gerund.'
  },
  {
    id: 'ex-10',
    question: 'By the time the guest speaker arrives, we ________ the auditorium.',
    options: ['will prepare', 'prepared', 'will have prepared', 'are preparing'],
    answerIndex: 2,
    explanation: 'The future perfect tense (will have prepared) is used to describe an action that will be completed before a specific point in the future (the arrival of the speaker).'
  },
  
  // --- VOCABULARY (11-20) ---
  {
    id: 'ex-11',
    question: 'If you want to reach an agreement, both sides need to meet each other ________.',
    options: ['in the middle', 'halfway', 'at the table', 'on the corner'],
    answerIndex: 1,
    explanation: 'The idiom "meet someone halfway" means to make a compromise or reach an agreement by making concessions on both sides.'
  },
  {
    id: 'ex-12',
    question: 'Our project proposal was rejected, so we had to go back to the ________.',
    options: ['first page', 'drawing board', 'square one', 'starting gate'],
    answerIndex: 1,
    explanation: 'The idiom "go back to the drawing board" means to start planning a failed project or idea again from the very beginning with a new approach.'
  },
  {
    id: 'ex-13',
    question: 'The company decided to ________ the opportunity to expand into the Asian market.',
    options: ['seize', 'catch', 'hold', 'lock'],
    answerIndex: 0,
    explanation: '"Seize the opportunity" is a strong collocation meaning to eagerly take advantage of a favorable situation immediately.'
  },
  {
    id: 'ex-14',
    question: "Let's touch ________ next Monday to review the client feedback.",
    options: ['base', 'point', 'ground', 'line'],
    answerIndex: 0,
    explanation: 'The business idiom "touch base" means to briefly make contact with someone to update each other on progress.'
  },
  {
    id: 'ex-15',
    question: "Which word is a synonym for 'ephemeral'?",
    options: ['permanent', 'temporary', 'fleeting', 'insignificant'],
    answerIndex: 2,
    explanation: '"Ephemeral" means lasting for a very short time. "Fleeting" is a direct synonym describing something passing quickly.'
  },
  {
    id: 'ex-16',
    question: "What does 'on the same page' mean in a business context?",
    options: ['Reading the same document', 'In agreement with the plan', 'Working at the same desk', 'Having the same work shifts'],
    answerIndex: 1,
    explanation: 'Being "on the same page" is a corporate metaphor meaning to have the same understanding, ideas, or agreement on a plan.'
  },
  {
    id: 'ex-17',
    question: 'We need to look at the big ________, rather than focusing purely on minor details.',
    options: ['map', 'picture', 'frame', 'canvas'],
    answerIndex: 1,
    explanation: 'The expression "the big picture" refers to the entire perspective, overall situation, or long-term plan rather than isolated details.'
  },
  {
    id: 'ex-18',
    question: 'She is highly qualified ________ the post, with ten years of leadership experience.',
    options: ['for', 'at', 'to', 'with'],
    answerIndex: 0,
    explanation: 'The adjective "qualified" is followed by the preposition "for" when specifying a job, role, or position.'
  },
  {
    id: 'ex-19',
    question: 'The board decided to ________ the annual meeting until next quarter due to travel restrictions.',
    options: ['put off', 'put out', 'call off', 'call out'],
    answerIndex: 0,
    explanation: 'The phrasal verb "put off" means to postpone an event. "Call off" means to cancel it completely.'
  },
  {
    id: 'ex-20',
    question: "The manager praised the team's ________ effort in resolving the customer crisis.",
    options: ['collaborative', 'collateral', 'compulsory', 'complacent'],
    answerIndex: 0,
    explanation: '"Collaborative" refers to cooperative joint action by multiple people working together toward a common goal.'
  },
  
  // --- LISTENING & DIALOGUE (21-25) ---
  {
    id: 'ex-21',
    question: "Speaker A: 'Do you mind if I close the window?' Speaker B: '________, please go ahead. It is getting chilly.'",
    options: ['Yes, I do', 'Not at all', 'Of course', 'Yes, please'],
    answerIndex: 1,
    explanation: '"Do you mind" asks if closing the window would bother someone. "Not at all" means "I do not mind; it is fine for you to close it".'
  },
  {
    id: 'ex-22',
    question: "If someone says 'Let's call it a day', what do they mean?",
    options: ["Let's write down the date", "Let's stop working for today", "Let's schedule a meeting", "Let's celebrate the day"],
    answerIndex: 1,
    explanation: 'To "call it a day" is an idiom meaning to stop what you are doing (usually work) because you have done enough for the day.'
  },
  {
    id: 'ex-23',
    question: "Speaker A: 'Could you give me a hand with this suitcase?' Speaker B: '________. It looks very heavy.'",
    options: ['Sure, no problem', 'No, I can\'t', 'You are welcome', 'Thanks a lot'],
    answerIndex: 0,
    explanation: '"Sure, no problem" is a polite, helpful way to accept a request to assist someone.'
  },
  {
    id: 'ex-24',
    question: 'When checking into a hotel, which phrase is most natural to inquire if breakfast is free?',
    options: ['Is breakfast included in the room rate?', 'How is the breakfast today?', 'Do you feed us breakfast?', 'Where do I eat breakfast?'],
    answerIndex: 0,
    explanation: '"Is breakfast included in the room rate?" is the standard polite formulation to ask if breakfast is covered by the payment.'
  },
  {
    id: 'ex-25',
    question: "Speaker A: 'I'm sorry, I've misplaced your notebook.' Speaker B: '________. I have plenty of others.'",
    options: ['No problem', "Don't mention it", 'Never mind', 'Both A and C are correct'],
    answerIndex: 3,
    explanation: 'Both "No problem" and "Never mind" are appropriate friendly responses to a minor apology, reassuring the speaker that it is fine.'
  },
  
  // --- PRONUNCIATION (26-30) ---
  {
    id: 'ex-26',
    question: "Which word has the same short /æ/ vowel sound as 'cat'?",
    options: ['car', 'cake', 'stamp', 'saw'],
    answerIndex: 2,
    explanation: '"Stamp" contains the short /æ/ sound. "Car" has /ɑ:/, "Cake" has /eɪ/, and "Saw" has /ɔ:/.'
  },
  {
    id: 'ex-27',
    question: "Which word contains the long /i:/ sound as in the word 'sleep'?",
    options: ['slip', 'beach', 'bread', 'friend'],
    answerIndex: 1,
    explanation: '"Beach" is pronounced with the long /i:/ sound. "Slip" has the short /ɪ/, "Bread" has the short /e/, and "Friend" has the short /e/.'
  },
  {
    id: 'ex-28',
    question: "Which word has a silent letter 'b'?",
    options: ['climb', 'double', 'timber', 'rabbit'],
    answerIndex: 0,
    explanation: 'In the word "climb", the final letter "b" is silent, so the word is pronounced /klaɪm/.'
  },
  {
    id: 'ex-29',
    question: "How many syllables are in the word 'pronunciation'?",
    options: ['4', '5', '6', '7'],
    answerIndex: 2,
    explanation: 'The word "pronunciation" has six syllables: pro-nun-ci-a-tion (/prə-nʌn-si-eɪ-ʃn/).'
  },
  {
    id: 'ex-30',
    question: "Which syllable is stressed in the noun form of 'contract' (e.g. a business agreement)?",
    options: ["First syllable ('con')", "Second syllable ('tract')", "Both syllables equally", "It depends on the speaker's accent"],
    answerIndex: 0,
    explanation: 'For the noun "contract", the stress is placed on the first syllable: /ˈkɒntrækt/. (Note: the verb form "contract" is stressed on the second syllable: /kənˈtrækt/).'
  }
];

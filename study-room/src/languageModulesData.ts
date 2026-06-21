import { Lesson } from "./types";

export const LANGUAGE_LESSONS: Lesson[] = [
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
          "word": "ก",
          "partOfSpeech": "phrase",
          "definition": "Chicken (base consonant)",
          "englishExample": "[K]"
        },
        {
          "word": "ข",
          "partOfSpeech": "phrase",
          "definition": "Egg (high class consonant)",
          "englishExample": "[Kh]"
        },
        {
          "word": "ง",
          "partOfSpeech": "phrase",
          "definition": "Snake (low class)",
          "englishExample": "[Ng]"
        },
        {
          "word": "จ",
          "partOfSpeech": "phrase",
          "definition": "Plate (mid class)",
          "englishExample": "[J]"
        },
        {
          "word": "ด",
          "partOfSpeech": "phrase",
          "definition": "Child (mid class)",
          "englishExample": "[D]"
        }
      ],
      "quiz": [
        {
          "id": "th-01-q1",
          "question": "What is the meaning of \"ก\"?",
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
      "introduction": "Thai culture places great emphasis on politeness. \"Wai\" (the prayer-like gesture) accompanies many greetings.",
      "words": [
        {
          "word": "สวัสดี",
          "partOfSpeech": "phrase",
          "definition": "Hello / Goodbye",
          "englishExample": "[Sawasdee]"
        },
        {
          "word": "ขอบคุณ",
          "partOfSpeech": "phrase",
          "definition": "Thank you",
          "englishExample": "[Khob Khun]"
        },
        {
          "word": "ไม่เป็นไร",
          "partOfSpeech": "phrase",
          "definition": "It's okay / No problem",
          "englishExample": "[Mai pen rai]"
        },
        {
          "word": "โทษที",
          "partOfSpeech": "phrase",
          "definition": "Excuse me / Sorry",
          "englishExample": "[Thot thee]"
        },
        {
          "word": "ยินดีที่รู้จัก",
          "partOfSpeech": "phrase",
          "definition": "Nice to meet you",
          "englishExample": "[Yin dee thi roo jak]"
        }
      ],
      "quiz": [
        {
          "id": "th-02-q1",
          "question": "What is the meaning of \"สวัสดี\"?",
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
    "title": "Numbers 1–100",
    "description": "Count in Thai from one to one hundred",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "thai",
    "content": {
      "introduction": "Thai numbers are fairly straightforward once you learn the base numbers. They follow a logical pattern.",
      "words": [
        {
          "word": "หนึ่ง",
          "partOfSpeech": "phrase",
          "definition": "One (1)",
          "englishExample": "[Nueng]"
        },
        {
          "word": "สอง",
          "partOfSpeech": "phrase",
          "definition": "Two (2)",
          "englishExample": "[Song]"
        },
        {
          "word": "สาม",
          "partOfSpeech": "phrase",
          "definition": "Three (3)",
          "englishExample": "[Sam]"
        },
        {
          "word": "สิบ",
          "partOfSpeech": "phrase",
          "definition": "Ten (10)",
          "englishExample": "[Sip]"
        },
        {
          "word": "ร้อย",
          "partOfSpeech": "phrase",
          "definition": "Hundred (100)",
          "englishExample": "[Roi]"
        }
      ],
      "quiz": [
        {
          "id": "th-03-q1",
          "question": "What is the meaning of \"หนึ่ง\"?",
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
          "word": "ขอเมนูหน่อยได้ไหม",
          "partOfSpeech": "phrase",
          "definition": "Can I have the menu please?",
          "englishExample": "[Kho menu noi dai mai]"
        },
        {
          "word": "อร่อยมาก",
          "partOfSpeech": "phrase",
          "definition": "Very delicious!",
          "englishExample": "[Aroi mak]"
        },
        {
          "word": "เผ็ดน้อยๆ",
          "partOfSpeech": "phrase",
          "definition": "A little bit spicy",
          "englishExample": "[Phet noi noi]"
        },
        {
          "word": "เช็คบิลด้วย",
          "partOfSpeech": "phrase",
          "definition": "Bill please",
          "englishExample": "[Check bin duai]"
        },
        {
          "word": "ไม่ใส่ผักชี",
          "partOfSpeech": "phrase",
          "definition": "No coriander please",
          "englishExample": "[Mai sai phak chi]"
        }
      ],
      "quiz": [
        {
          "id": "th-04-q1",
          "question": "What is the meaning of \"ขอเมนูหน่อยได้ไหม\"?",
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
          "word": "ไปที่ไหน",
          "partOfSpeech": "phrase",
          "definition": "Where are you going?",
          "englishExample": "[Pai thi nai]"
        },
        {
          "word": "ตรงไป",
          "partOfSpeech": "phrase",
          "definition": "Go straight",
          "englishExample": "[Trong pai]"
        },
        {
          "word": "เลี้ยวซ้าย",
          "partOfSpeech": "phrase",
          "definition": "Turn left",
          "englishExample": "[Liao sai]"
        },
        {
          "word": "เลี้ยวขวา",
          "partOfSpeech": "phrase",
          "definition": "Turn right",
          "englishExample": "[Liao kwa]"
        },
        {
          "word": "อยู่ไกลไหม",
          "partOfSpeech": "phrase",
          "definition": "Is it far?",
          "englishExample": "[Yu klai mai]"
        }
      ],
      "quiz": [
        {
          "id": "th-05-q1",
          "question": "What is the meaning of \"ไปที่ไหน\"?",
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
          "word": "มา",
          "partOfSpeech": "phrase",
          "definition": "To come",
          "englishExample": "[Maa (mid)]"
        },
        {
          "word": "ม้า",
          "partOfSpeech": "phrase",
          "definition": "Horse",
          "englishExample": "[Máa (rising)]"
        },
        {
          "word": "หมา",
          "partOfSpeech": "phrase",
          "definition": "Dog",
          "englishExample": "[Mǎa (falling)]"
        },
        {
          "word": "หม้า",
          "partOfSpeech": "phrase",
          "definition": "Widow",
          "englishExample": "[Mà (low)]"
        },
        {
          "word": "หมาก",
          "partOfSpeech": "phrase",
          "definition": "Betel nut",
          "englishExample": "[Mâa (high)]"
        }
      ],
      "quiz": [
        {
          "id": "th-06-q1",
          "question": "What is the meaning of \"มา\"?",
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
      "introduction": "Thai family terms are specific — different words exist depending on whether a family member is older or younger.",
      "words": [
        {
          "word": "พ่อ",
          "partOfSpeech": "phrase",
          "definition": "Father",
          "englishExample": "[Pho]"
        },
        {
          "word": "แม่",
          "partOfSpeech": "phrase",
          "definition": "Mother",
          "englishExample": "[Mae]"
        },
        {
          "word": "พี่",
          "partOfSpeech": "phrase",
          "definition": "Older sibling",
          "englishExample": "[Phi]"
        },
        {
          "word": "น้อง",
          "partOfSpeech": "phrase",
          "definition": "Younger sibling",
          "englishExample": "[Nong]"
        },
        {
          "word": "ลูก",
          "partOfSpeech": "phrase",
          "definition": "Child / Son / Daughter",
          "englishExample": "[Luk]"
        }
      ],
      "quiz": [
        {
          "id": "th-07-q1",
          "question": "What is the meaning of \"พ่อ\"?",
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
          "word": "สงกรานต์",
          "partOfSpeech": "phrase",
          "definition": "Thai New Year Water Festival",
          "englishExample": "[Songkran]"
        },
        {
          "word": "ลอยกระทง",
          "partOfSpeech": "phrase",
          "definition": "Lantern Festival",
          "englishExample": "[Loy Krathong]"
        },
        {
          "word": "วันพระ",
          "partOfSpeech": "phrase",
          "definition": "Buddhist holy day",
          "englishExample": "[Wan Phra]"
        },
        {
          "word": "วัดพระแก้ว",
          "partOfSpeech": "phrase",
          "definition": "Temple of the Emerald Buddha",
          "englishExample": "[Wat Phra Kaew]"
        },
        {
          "word": "ถวายทาน",
          "partOfSpeech": "phrase",
          "definition": "Making merit / offerings",
          "englishExample": "[Thawai than]"
        }
      ],
      "quiz": [
        {
          "id": "th-08-q1",
          "question": "What is the meaning of \"สงกรานต์\"?",
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
      "introduction": "Thai grammar is simpler than English in some ways — there is no verb conjugation or plurals, but word order is important.",
      "words": [
        {
          "word": "ฉันกินข้าว",
          "partOfSpeech": "phrase",
          "definition": "I eat rice",
          "englishExample": "[Chan gin khao]"
        },
        {
          "word": "เขาทำงาน",
          "partOfSpeech": "phrase",
          "definition": "He works",
          "englishExample": "[Khao tham ngan]"
        },
        {
          "word": "เราเรียนภาษาไทย",
          "partOfSpeech": "phrase",
          "definition": "We study Thai language",
          "englishExample": "[Rao rian phasa thai]"
        },
        {
          "word": "เธอชอบเพลง",
          "partOfSpeech": "phrase",
          "definition": "She likes music",
          "englishExample": "[Thoe chop phleng]"
        },
        {
          "word": "พวกเขาวิ่ง",
          "partOfSpeech": "phrase",
          "definition": "They run",
          "englishExample": "[Phuak khao wing]"
        }
      ],
      "quiz": [
        {
          "id": "th-09-q1",
          "question": "What is the meaning of \"ฉันกินข้าว\"?",
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
          "word": "ราคาเท่าไร",
          "partOfSpeech": "phrase",
          "definition": "How much does it cost?",
          "englishExample": "[Raka thao rai]"
        },
        {
          "word": "แพงเกินไป",
          "partOfSpeech": "phrase",
          "definition": "Too expensive",
          "englishExample": "[Phaeng koen pai]"
        },
        {
          "word": "ลดได้ไหม",
          "partOfSpeech": "phrase",
          "definition": "Can you reduce the price?",
          "englishExample": "[Lot dai mai]"
        },
        {
          "word": "เอาอันนี้",
          "partOfSpeech": "phrase",
          "definition": "I will take this one",
          "englishExample": "[Ao an ni]"
        },
        {
          "word": "มีสีอื่นไหม",
          "partOfSpeech": "phrase",
          "definition": "Do you have other colors?",
          "englishExample": "[Mi si uen mai]"
        }
      ],
      "quiz": [
        {
          "id": "th-10-q1",
          "question": "What is the meaning of \"ราคาเท่าไร\"?",
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
          "word": "ㄱ",
          "partOfSpeech": "phrase",
          "definition": "Basic consonant (giyeok)",
          "englishExample": "[G/K]"
        },
        {
          "word": "ㄴ",
          "partOfSpeech": "phrase",
          "definition": "Basic consonant (nieun)",
          "englishExample": "[N]"
        },
        {
          "word": "ㅏ",
          "partOfSpeech": "phrase",
          "definition": "Basic vowel (a)",
          "englishExample": "[A]"
        },
        {
          "word": "가",
          "partOfSpeech": "phrase",
          "definition": "Syllable: consonant + vowel",
          "englishExample": "[Ga]"
        },
        {
          "word": "한글",
          "partOfSpeech": "phrase",
          "definition": "The Korean alphabet",
          "englishExample": "[Hangeul]"
        }
      ],
      "quiz": [
        {
          "id": "ko-01-q1",
          "question": "What is the meaning of \"ㄱ\"?",
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
      "introduction": "Korean has formal and informal speech levels. Start with formal speech (존댓말) to be respectful.",
      "words": [
        {
          "word": "안녕하세요",
          "partOfSpeech": "phrase",
          "definition": "Hello (formal)",
          "englishExample": "[Annyeonghaseyo]"
        },
        {
          "word": "감사합니다",
          "partOfSpeech": "phrase",
          "definition": "Thank you (formal)",
          "englishExample": "[Gamsahamnida]"
        },
        {
          "word": "죄송합니다",
          "partOfSpeech": "phrase",
          "definition": "I am sorry",
          "englishExample": "[Joesonghamnida]"
        },
        {
          "word": "안녕히 가세요",
          "partOfSpeech": "phrase",
          "definition": "Goodbye (to person leaving)",
          "englishExample": "[Annyeonghi gaseyo]"
        },
        {
          "word": "만나서 반갑습니다",
          "partOfSpeech": "phrase",
          "definition": "Nice to meet you",
          "englishExample": "[Mannaseo bangapseumnida]"
        }
      ],
      "quiz": [
        {
          "id": "ko-02-q1",
          "question": "What is the meaning of \"안녕하세요\"?",
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
      "introduction": "Korean has two number systems: native Korean (하나, 둘...) and Sino-Korean (일, 이...). Each is used in different contexts.",
      "words": [
        {
          "word": "하나 / 일",
          "partOfSpeech": "phrase",
          "definition": "One (native / sino)",
          "englishExample": "[Hana / Il]"
        },
        {
          "word": "둘 / 이",
          "partOfSpeech": "phrase",
          "definition": "Two (native / sino)",
          "englishExample": "[Dul / I]"
        },
        {
          "word": "셋 / 삼",
          "partOfSpeech": "phrase",
          "definition": "Three (native / sino)",
          "englishExample": "[Set / Sam]"
        },
        {
          "word": "열 / 십",
          "partOfSpeech": "phrase",
          "definition": "Ten (native / sino)",
          "englishExample": "[Yeol / Sip]"
        },
        {
          "word": "백",
          "partOfSpeech": "phrase",
          "definition": "Hundred (sino only)",
          "englishExample": "[Baek]"
        }
      ],
      "quiz": [
        {
          "id": "ko-03-q1",
          "question": "What is the meaning of \"하나 / 일\"?",
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
          "word": "대박",
          "partOfSpeech": "phrase",
          "definition": "Awesome / Amazing",
          "englishExample": "[Daebak]"
        },
        {
          "word": "화이팅",
          "partOfSpeech": "phrase",
          "definition": "Fighting! (You can do it!)",
          "englishExample": "[Hwaiting]"
        },
        {
          "word": "오빠",
          "partOfSpeech": "phrase",
          "definition": "Older brother (girl's word for older male)",
          "englishExample": "[Oppa]"
        },
        {
          "word": "아이고",
          "partOfSpeech": "phrase",
          "definition": "Oh my! / Goodness!",
          "englishExample": "[Aigo]"
        },
        {
          "word": "진짜요?",
          "partOfSpeech": "phrase",
          "definition": "Really? / Seriously?",
          "englishExample": "[Jinjjayo?]"
        }
      ],
      "quiz": [
        {
          "id": "ko-04-q1",
          "question": "What is the meaning of \"대박\"?",
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
          "word": "나는 밥을 먹어요",
          "partOfSpeech": "phrase",
          "definition": "I eat rice (I-rice-eat)",
          "englishExample": "[Naneun babeul meogeoyo]"
        },
        {
          "word": "그는 음악을 좋아해요",
          "partOfSpeech": "phrase",
          "definition": "He likes music",
          "englishExample": "[Geuneun eumageul joahaeyo]"
        },
        {
          "word": "우리는 한국어를 배워요",
          "partOfSpeech": "phrase",
          "definition": "We learn Korean",
          "englishExample": "[Urineun hangugeo-reul baewoyo]"
        },
        {
          "word": "그녀는 책을 읽어요",
          "partOfSpeech": "phrase",
          "definition": "She reads a book",
          "englishExample": "[Geunyeoneun chaeg-eul ilgeoyo]"
        },
        {
          "word": "저는 학생이에요",
          "partOfSpeech": "phrase",
          "definition": "I am a student",
          "englishExample": "[Jeoneun haksaengieyo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-05-q1",
          "question": "What is the meaning of \"나는 밥을 먹어요\"?",
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
      "introduction": "Korean dining culture is unique — dishes are shared and banchan (side dishes) are served with every meal.",
      "words": [
        {
          "word": "여기요!",
          "partOfSpeech": "phrase",
          "definition": "Excuse me! (calling a server)",
          "englishExample": "[Yeogiyo!]"
        },
        {
          "word": "이거 주세요",
          "partOfSpeech": "phrase",
          "definition": "Give me this please",
          "englishExample": "[Igeo juseyo]"
        },
        {
          "word": "맛있어요",
          "partOfSpeech": "phrase",
          "definition": "It is delicious",
          "englishExample": "[Massisseoyo]"
        },
        {
          "word": "물 한 잔 주세요",
          "partOfSpeech": "phrase",
          "definition": "One glass of water please",
          "englishExample": "[Mul han jan juseyo]"
        },
        {
          "word": "계산서 주세요",
          "partOfSpeech": "phrase",
          "definition": "Check please",
          "englishExample": "[Gyesanseo juseyo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-06-q1",
          "question": "What is the meaning of \"여기요!\"?",
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
          "word": "오늘 날씨가 어때요?",
          "partOfSpeech": "phrase",
          "definition": "How is the weather today?",
          "englishExample": "[Oneul nalssiga eottaeyo?]"
        },
        {
          "word": "더워요",
          "partOfSpeech": "phrase",
          "definition": "It is hot",
          "englishExample": "[Deowoyo]"
        },
        {
          "word": "추워요",
          "partOfSpeech": "phrase",
          "definition": "It is cold",
          "englishExample": "[Chuwoyo]"
        },
        {
          "word": "봄 / 여름 / 가을 / 겨울",
          "partOfSpeech": "phrase",
          "definition": "Spring / Summer / Fall / Winter",
          "englishExample": "[Bom / Yeoreum / Gaeul / Gyeoul]"
        },
        {
          "word": "비가 와요",
          "partOfSpeech": "phrase",
          "definition": "It is raining",
          "englishExample": "[Biga wayo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-07-q1",
          "question": "What is the meaning of \"오늘 날씨가 어때요?\"?",
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
      "introduction": "Korean speech levels (경어법) are crucial for social harmony. Using the wrong level can be offensive.",
      "words": [
        {
          "word": "합쇼체",
          "partOfSpeech": "phrase",
          "definition": "Formal polite (business/strangers)",
          "englishExample": "[Hapshoche]"
        },
        {
          "word": "해요체",
          "partOfSpeech": "phrase",
          "definition": "Informal polite (everyday use)",
          "englishExample": "[Haeyoche]"
        },
        {
          "word": "해체",
          "partOfSpeech": "phrase",
          "definition": "Informal (close friends, children)",
          "englishExample": "[Haeche]"
        },
        {
          "word": "드시다",
          "partOfSpeech": "phrase",
          "definition": "Eat (honorific form)",
          "englishExample": "[Deushida]"
        },
        {
          "word": "말씀하시다",
          "partOfSpeech": "phrase",
          "definition": "Speak (honorific form)",
          "englishExample": "[Malsseum hashida]"
        }
      ],
      "quiz": [
        {
          "id": "ko-08-q1",
          "question": "What is the meaning of \"합쇼체\"?",
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
          "word": "지하철역이 어디에요?",
          "partOfSpeech": "phrase",
          "definition": "Where is the subway station?",
          "englishExample": "[Jihacheol-yeogi eodieyo?]"
        },
        {
          "word": "...에 가주세요",
          "partOfSpeech": "phrase",
          "definition": "Please take me to...",
          "englishExample": "[...e gajuseyo]"
        },
        {
          "word": "얼마예요?",
          "partOfSpeech": "phrase",
          "definition": "How much is it?",
          "englishExample": "[Eolmayeyo?]"
        },
        {
          "word": "다음 정류장",
          "partOfSpeech": "phrase",
          "definition": "Next stop",
          "englishExample": "[Daeum jeongnyujang]"
        },
        {
          "word": "표 한 장 주세요",
          "partOfSpeech": "phrase",
          "definition": "One ticket please",
          "englishExample": "[Pyo han jang juseyo]"
        }
      ],
      "quiz": [
        {
          "id": "ko-09-q1",
          "question": "What is the meaning of \"지하철역이 어디에요?\"?",
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
          "word": "김치",
          "partOfSpeech": "phrase",
          "definition": "Fermented spicy cabbage (national dish)",
          "englishExample": "[Kimchi]"
        },
        {
          "word": "불고기",
          "partOfSpeech": "phrase",
          "definition": "Marinated grilled beef",
          "englishExample": "[Bulgogi]"
        },
        {
          "word": "비빔밥",
          "partOfSpeech": "phrase",
          "definition": "Mixed rice with vegetables",
          "englishExample": "[Bibimbap]"
        },
        {
          "word": "삼겹살",
          "partOfSpeech": "phrase",
          "definition": "Grilled pork belly",
          "englishExample": "[Samgyeopsal]"
        },
        {
          "word": "떡볶이",
          "partOfSpeech": "phrase",
          "definition": "Spicy rice cakes",
          "englishExample": "[Tteokbokki]"
        }
      ],
      "quiz": [
        {
          "id": "ko-10-q1",
          "question": "What is the meaning of \"김치\"?",
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
          "word": "あ",
          "partOfSpeech": "phrase",
          "definition": "Vowel: a (as in \"father\")",
          "englishExample": "[A]"
        },
        {
          "word": "い",
          "partOfSpeech": "phrase",
          "definition": "Vowel: i (as in \"meet\")",
          "englishExample": "[I]"
        },
        {
          "word": "か",
          "partOfSpeech": "phrase",
          "definition": "Consonant+vowel combination",
          "englishExample": "[Ka]"
        },
        {
          "word": "さ",
          "partOfSpeech": "phrase",
          "definition": "Sa row beginning",
          "englishExample": "[Sa]"
        },
        {
          "word": "たべる",
          "partOfSpeech": "phrase",
          "definition": "To eat (written in hiragana)",
          "englishExample": "[Taberu]"
        }
      ],
      "quiz": [
        {
          "id": "ja-01-q1",
          "question": "What is the meaning of \"あ\"?",
          "options": [
            "Vowel: a (as in \"father\")",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Vowel: a (as in \"father\")"
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
          "word": "ア",
          "partOfSpeech": "phrase",
          "definition": "Katakana A",
          "englishExample": "[A]"
        },
        {
          "word": "コーヒー",
          "partOfSpeech": "phrase",
          "definition": "Coffee (loanword from English)",
          "englishExample": "[Koohii]"
        },
        {
          "word": "テレビ",
          "partOfSpeech": "phrase",
          "definition": "Television",
          "englishExample": "[Terebi]"
        },
        {
          "word": "アイスクリーム",
          "partOfSpeech": "phrase",
          "definition": "Ice cream",
          "englishExample": "[Aisu kuriimu]"
        },
        {
          "word": "マクドナルド",
          "partOfSpeech": "phrase",
          "definition": "McDonald's",
          "englishExample": "[Makudonarudo]"
        }
      ],
      "quiz": [
        {
          "id": "ja-02-q1",
          "question": "What is the meaning of \"ア\"?",
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
          "word": "おはようございます",
          "partOfSpeech": "phrase",
          "definition": "Good morning (formal)",
          "englishExample": "[Ohayou gozaimasu]"
        },
        {
          "word": "こんにちは",
          "partOfSpeech": "phrase",
          "definition": "Hello / Good afternoon",
          "englishExample": "[Konnichiwa]"
        },
        {
          "word": "こんばんは",
          "partOfSpeech": "phrase",
          "definition": "Good evening",
          "englishExample": "[Konbanwa]"
        },
        {
          "word": "ありがとうございます",
          "partOfSpeech": "phrase",
          "definition": "Thank you very much",
          "englishExample": "[Arigatou gozaimasu]"
        },
        {
          "word": "すみません",
          "partOfSpeech": "phrase",
          "definition": "Excuse me / I am sorry",
          "englishExample": "[Sumimasen]"
        }
      ],
      "quiz": [
        {
          "id": "ja-03-q1",
          "question": "What is the meaning of \"おはようございます\"?",
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
          "word": "は (wa)",
          "partOfSpeech": "phrase",
          "definition": "Topic marker: \"as for...\"",
          "englishExample": "[wa]"
        },
        {
          "word": "が (ga)",
          "partOfSpeech": "phrase",
          "definition": "Subject marker",
          "englishExample": "[ga]"
        },
        {
          "word": "を (wo)",
          "partOfSpeech": "phrase",
          "definition": "Object marker",
          "englishExample": "[wo/o]"
        },
        {
          "word": "に (ni)",
          "partOfSpeech": "phrase",
          "definition": "Direction / location / time",
          "englishExample": "[ni]"
        },
        {
          "word": "で (de)",
          "partOfSpeech": "phrase",
          "definition": "Location of action / by means of",
          "englishExample": "[de]"
        }
      ],
      "quiz": [
        {
          "id": "ja-04-q1",
          "question": "What is the meaning of \"は (wa)\"?",
          "options": [
            "Topic marker: \"as for...\"",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Topic marker: \"as for...\""
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
          "word": "一つ",
          "partOfSpeech": "phrase",
          "definition": "One (general objects)",
          "englishExample": "[Hitotsu]"
        },
        {
          "word": "一人",
          "partOfSpeech": "phrase",
          "definition": "One person",
          "englishExample": "[Hitori]"
        },
        {
          "word": "一枚",
          "partOfSpeech": "phrase",
          "definition": "One flat object (paper, ticket)",
          "englishExample": "[Ichimai]"
        },
        {
          "word": "一本",
          "partOfSpeech": "phrase",
          "definition": "One long object (pencil, bottle)",
          "englishExample": "[Ippon]"
        },
        {
          "word": "一匹",
          "partOfSpeech": "phrase",
          "definition": "One small animal",
          "englishExample": "[Ippiki]"
        }
      ],
      "quiz": [
        {
          "id": "ja-05-q1",
          "question": "What is the meaning of \"一つ\"?",
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
          "word": "いただきます",
          "partOfSpeech": "phrase",
          "definition": "I humbly receive (said before eating)",
          "englishExample": "[Itadakimasu]"
        },
        {
          "word": "ごちそうさまでした",
          "partOfSpeech": "phrase",
          "definition": "It was a feast (said after eating)",
          "englishExample": "[Gochisousamadeshita]"
        },
        {
          "word": "おすすめは何ですか",
          "partOfSpeech": "phrase",
          "definition": "What do you recommend?",
          "englishExample": "[Osusume wa nan desu ka]"
        },
        {
          "word": "お会計をお願いします",
          "partOfSpeech": "phrase",
          "definition": "Check please",
          "englishExample": "[Okaikei wo onegaishimasu]"
        },
        {
          "word": "辛くないものはありますか",
          "partOfSpeech": "phrase",
          "definition": "Do you have anything not spicy?",
          "englishExample": "[Karakunai mono wa arimasu ka]"
        }
      ],
      "quiz": [
        {
          "id": "ja-06-q1",
          "question": "What is the meaning of \"いただきます\"?",
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
      "introduction": "Kanji are Chinese-derived characters used in Japanese. You need 2,136 jōyō kanji for literacy.",
      "words": [
        {
          "word": "日",
          "partOfSpeech": "phrase",
          "definition": "Sun / Day",
          "englishExample": "[Nichi/Hi]"
        },
        {
          "word": "月",
          "partOfSpeech": "phrase",
          "definition": "Moon / Month",
          "englishExample": "[Getsu/Tsuki]"
        },
        {
          "word": "水",
          "partOfSpeech": "phrase",
          "definition": "Water",
          "englishExample": "[Sui/Mizu]"
        },
        {
          "word": "火",
          "partOfSpeech": "phrase",
          "definition": "Fire",
          "englishExample": "[Ka/Hi]"
        },
        {
          "word": "木",
          "partOfSpeech": "phrase",
          "definition": "Tree / Wood",
          "englishExample": "[Moku/Ki]"
        }
      ],
      "quiz": [
        {
          "id": "ja-07-q1",
          "question": "What is the meaning of \"日\"?",
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
      "introduction": "Japan's work culture is known for its dedication, hierarchy, and group harmony (和 wa).",
      "words": [
        {
          "word": "お疲れ様です",
          "partOfSpeech": "phrase",
          "definition": "Thank you for your hard work",
          "englishExample": "[Otsukaresama desu]"
        },
        {
          "word": "名刺",
          "partOfSpeech": "phrase",
          "definition": "Business card (exchange with both hands)",
          "englishExample": "[Meishi]"
        },
        {
          "word": "上司",
          "partOfSpeech": "phrase",
          "definition": "Boss / Superior",
          "englishExample": "[Jooshi]"
        },
        {
          "word": "会議",
          "partOfSpeech": "phrase",
          "definition": "Meeting",
          "englishExample": "[Kaigi]"
        },
        {
          "word": "残業",
          "partOfSpeech": "phrase",
          "definition": "Overtime work",
          "englishExample": "[Zangyou]"
        }
      ],
      "quiz": [
        {
          "id": "ja-08-q1",
          "question": "What is the meaning of \"お疲れ様です\"?",
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
      "introduction": "The て-form (te-form) is one of the most important verb forms in Japanese. It is used for sequences, requests, and progressive tenses.",
      "words": [
        {
          "word": "食べてください",
          "partOfSpeech": "phrase",
          "definition": "Please eat (polite request)",
          "englishExample": "[Tabete kudasai]"
        },
        {
          "word": "走っています",
          "partOfSpeech": "phrase",
          "definition": "Am running (progressive)",
          "englishExample": "[Hashitte imasu]"
        },
        {
          "word": "起きて、食べて、行く",
          "partOfSpeech": "phrase",
          "definition": "Wake up, eat, and go (sequence)",
          "englishExample": "[Okite, tabete, iku]"
        },
        {
          "word": "みてもいいですか",
          "partOfSpeech": "phrase",
          "definition": "May I look? (permission)",
          "englishExample": "[Mite mo ii desu ka]"
        },
        {
          "word": "してはいけません",
          "partOfSpeech": "phrase",
          "definition": "Must not do (prohibition)",
          "englishExample": "[Shite wa ikemasen]"
        }
      ],
      "quiz": [
        {
          "id": "ja-09-q1",
          "question": "What is the meaning of \"食べてください\"?",
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
          "word": "アニメ",
          "partOfSpeech": "phrase",
          "definition": "Japanese animation",
          "englishExample": "[Anime]"
        },
        {
          "word": "マンガ",
          "partOfSpeech": "phrase",
          "definition": "Japanese comics",
          "englishExample": "[Manga]"
        },
        {
          "word": "かわいい",
          "partOfSpeech": "phrase",
          "definition": "Cute / Adorable",
          "englishExample": "[Kawaii]"
        },
        {
          "word": "すごい",
          "partOfSpeech": "phrase",
          "definition": "Amazing / Wow",
          "englishExample": "[Sugoi]"
        },
        {
          "word": "なるほど",
          "partOfSpeech": "phrase",
          "definition": "I see / Makes sense",
          "englishExample": "[Naruhodo]"
        }
      ],
      "quiz": [
        {
          "id": "ja-10-q1",
          "question": "What is the meaning of \"アニメ\"?",
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
          "definition": "\"Water\" sound — like in \"oh\"",
          "englishExample": "[/o/]"
        },
        {
          "word": "eu",
          "partOfSpeech": "phrase",
          "definition": "Like \"uh\" but with rounded lips",
          "englishExample": "[/ø/]"
        },
        {
          "word": "en / an / am",
          "partOfSpeech": "phrase",
          "definition": "Nasal vowel sound",
          "englishExample": "[/ɑ̃/]"
        },
        {
          "word": "in / ain / ein",
          "partOfSpeech": "phrase",
          "definition": "Nasal \"an\" sound",
          "englishExample": "[/ɛ̃/]"
        },
        {
          "word": "on / om",
          "partOfSpeech": "phrase",
          "definition": "Nasal \"on\" sound",
          "englishExample": "[/ɔ̃/]"
        }
      ],
      "quiz": [
        {
          "id": "fr-01-q1",
          "question": "What is the meaning of \"eau\"?",
          "options": [
            "\"Water\" sound — like in \"oh\"",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means \"Water\" sound — like in \"oh\""
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
      "introduction": "French greetings depend on time of day and formality. \"Tu\" and \"vous\" indicate relationship levels.",
      "words": [
        {
          "word": "Bonjour",
          "partOfSpeech": "phrase",
          "definition": "Good morning / Hello",
          "englishExample": "[bɔ̃ʒuʁ]"
        },
        {
          "word": "Bonsoir",
          "partOfSpeech": "phrase",
          "definition": "Good evening",
          "englishExample": "[bɔ̃swaʁ]"
        },
        {
          "word": "Enchanté(e)",
          "partOfSpeech": "phrase",
          "definition": "Pleased to meet you",
          "englishExample": "[ɑ̃ʃɑ̃te]"
        },
        {
          "word": "Comment allez-vous?",
          "partOfSpeech": "phrase",
          "definition": "How are you? (formal)",
          "englishExample": "[kɔmɑ̃ ale vu]"
        },
        {
          "word": "Au revoir",
          "partOfSpeech": "phrase",
          "definition": "Goodbye",
          "englishExample": "[o ʁəvwaʁ]"
        }
      ],
      "quiz": [
        {
          "id": "fr-02-q1",
          "question": "What is the meaning of \"Bonjour\"?",
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
          "englishExample": "[lay zɑ̃fɑ̃]"
        }
      ],
      "quiz": [
        {
          "id": "fr-03-q1",
          "question": "What is the meaning of \"le livre\"?",
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
          "englishExample": "[vɑ̃dʁ]"
        },
        {
          "word": "être (je suis)",
          "partOfSpeech": "phrase",
          "definition": "To be (I am) — irregular",
          "englishExample": "[etr]"
        },
        {
          "word": "avoir (j'ai)",
          "partOfSpeech": "phrase",
          "definition": "To have (I have) — irregular",
          "englishExample": "[avwaʁ]"
        }
      ],
      "quiz": [
        {
          "id": "fr-04-q1",
          "question": "What is the meaning of \"parler (je parle)\"?",
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
          "englishExample": "[zhuh voodray komɑ̃de]"
        },
        {
          "word": "L'addition, s'il vous plaît",
          "partOfSpeech": "phrase",
          "definition": "The bill please",
          "englishExample": "[ladisyɔ̃ sil vu plɛ]"
        },
        {
          "word": "C'est délicieux!",
          "partOfSpeech": "phrase",
          "definition": "It is delicious!",
          "englishExample": "[se delisyø]"
        },
        {
          "word": "Je suis allergique à...",
          "partOfSpeech": "phrase",
          "definition": "I am allergic to...",
          "englishExample": "[zhuh swee alɛʁʒik a]"
        },
        {
          "word": "Une carafe d'eau",
          "partOfSpeech": "phrase",
          "definition": "A jug of water",
          "englishExample": "[yn kaʁaf do]"
        }
      ],
      "quiz": [
        {
          "id": "fr-05-q1",
          "question": "What is the meaning of \"Je voudrais commander\"?",
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
          "word": "un petit garçon",
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
          "word": "des livres intéressants",
          "partOfSpeech": "phrase",
          "definition": "Interesting books (masc pl)",
          "englishExample": "[day leevr ɛ̃teresɑ̃]"
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
          "englishExample": "[uh bo zhuʁ]"
        }
      ],
      "quiz": [
        {
          "id": "fr-06-q1",
          "question": "What is the meaning of \"un petit garçon\"?",
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
          "word": "Combien ça coûte?",
          "partOfSpeech": "phrase",
          "definition": "How much does it cost?",
          "englishExample": "[kɔ̃byɛ̃ sa kut]"
        },
        {
          "word": "Je cherche...",
          "partOfSpeech": "phrase",
          "definition": "I am looking for...",
          "englishExample": "[zhuh shɛʁsh]"
        },
        {
          "word": "Avez-vous une taille plus grande?",
          "partOfSpeech": "phrase",
          "definition": "Do you have a larger size?",
          "englishExample": "[ave vu yn taj ply gʁɑ̃d]"
        },
        {
          "word": "Je peux l'essayer?",
          "partOfSpeech": "phrase",
          "definition": "May I try it on?",
          "englishExample": "[zhuh pø leseje]"
        },
        {
          "word": "Je le prends",
          "partOfSpeech": "phrase",
          "definition": "I will take it",
          "englishExample": "[zhuh luh pʁɑ̃]"
        }
      ],
      "quiz": [
        {
          "id": "fr-07-q1",
          "question": "What is the meaning of \"Combien ça coûte?\"?",
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
      "introduction": "France has one of the richest cultural heritages in the world — from the Enlightenment to haute cuisine.",
      "words": [
        {
          "word": "Liberté, Égalité, Fraternité",
          "partOfSpeech": "phrase",
          "definition": "Liberty, Equality, Brotherhood (national motto)",
          "englishExample": "[libɛʁte egalite fʁatɛʁnite]"
        },
        {
          "word": "Le Louvre",
          "partOfSpeech": "phrase",
          "definition": "World's largest art museum (Paris)",
          "englishExample": "[luh loovʁ]"
        },
        {
          "word": "La Tour Eiffel",
          "partOfSpeech": "phrase",
          "definition": "The Eiffel Tower",
          "englishExample": "[la tuʁ efɛl]"
        },
        {
          "word": "le cinéma",
          "partOfSpeech": "phrase",
          "definition": "Cinema (invented in France)",
          "englishExample": "[luh sinema]"
        },
        {
          "word": "la gastronomie",
          "partOfSpeech": "phrase",
          "definition": "Gastronomy — French culinary tradition",
          "englishExample": "[la gastʁɔnɔmi]"
        }
      ],
      "quiz": [
        {
          "id": "fr-08-q1",
          "question": "What is the meaning of \"Liberté, Égalité, Fraternité\"?",
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
          "definition": "70 (literally \"sixty-ten\")",
          "englishExample": "[swasɑ̃t dis]"
        },
        {
          "word": "quatre-vingts",
          "partOfSpeech": "phrase",
          "definition": "80 (literally \"four-twenties\")",
          "englishExample": "[katʁuh vɛ̃]"
        },
        {
          "word": "Quelle heure est-il?",
          "partOfSpeech": "phrase",
          "definition": "What time is it?",
          "englishExample": "[kɛl œʁ ɛtil]"
        },
        {
          "word": "Il est midi",
          "partOfSpeech": "phrase",
          "definition": "It is noon",
          "englishExample": "[il ɛ midi]"
        },
        {
          "word": "Lundi, Mardi, Mercredi",
          "partOfSpeech": "phrase",
          "definition": "Monday, Tuesday, Wednesday",
          "englishExample": "[lœ̃di maʁdi mɛʁkʁədi]"
        }
      ],
      "quiz": [
        {
          "id": "fr-09-q1",
          "question": "What is the meaning of \"soixante-dix\"?",
          "options": [
            "70 (literally \"sixty-ten\")",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means 70 (literally \"sixty-ten\")"
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
          "englishExample": "[il fo kuh ty vyɛn]"
        },
        {
          "word": "Je veux qu'il fasse beau",
          "partOfSpeech": "phrase",
          "definition": "I want the weather to be nice",
          "englishExample": "[zhuh vø keel fas bo]"
        },
        {
          "word": "Bien que ce soit difficile",
          "partOfSpeech": "phrase",
          "definition": "Although it is difficult",
          "englishExample": "[byɛ̃ kuh suh swa difisil]"
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
          "englishExample": "[puʁvy keel aʁiv]"
        }
      ],
      "quiz": [
        {
          "id": "fr-10-q1",
          "question": "What is the meaning of \"Il faut que tu viennes\"?",
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
      "introduction": "Spanish pronunciation is highly consistent — words are almost always pronounced exactly as they are spelled.",
      "words": [
        {
          "word": "ñ",
          "partOfSpeech": "phrase",
          "definition": "Like the \"ny\" in \"canyon\"",
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
          "definition": "Like \"y\" in most dialects",
          "englishExample": "[y/zh]"
        },
        {
          "word": "j",
          "partOfSpeech": "phrase",
          "definition": "Like a strong \"h\" sound",
          "englishExample": "[kh]"
        }
      ],
      "quiz": [
        {
          "id": "es-01-q1",
          "question": "What is the meaning of \"ñ\"?",
          "options": [
            "Like the \"ny\" in \"canyon\"",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Like the \"ny\" in \"canyon\""
        }
      ]
    }
  },
  {
    "id": "es-02",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Hola y Más: Greetings",
    "description": "Greet people in Spanish at any time of day",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish is warm and expressive. Greetings often include questions about health and family.",
      "words": [
        {
          "word": "¡Buenos días!",
          "partOfSpeech": "phrase",
          "definition": "Good morning!",
          "englishExample": "[bwenos dias]"
        },
        {
          "word": "¿Cómo estás?",
          "partOfSpeech": "phrase",
          "definition": "How are you? (informal)",
          "englishExample": "[komo estas]"
        },
        {
          "word": "Mucho gusto",
          "partOfSpeech": "phrase",
          "definition": "Nice to meet you",
          "englishExample": "[mutʃo gusto]"
        },
        {
          "word": "Hasta luego",
          "partOfSpeech": "phrase",
          "definition": "See you later",
          "englishExample": "[asta lweɡo]"
        },
        {
          "word": "¿Qué tal?",
          "partOfSpeech": "phrase",
          "definition": "What's up? / How's it going?",
          "englishExample": "[ke tal]"
        }
      ],
      "quiz": [
        {
          "id": "es-02-q1",
          "question": "What is the meaning of \"¡Buenos días!\"?",
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
    "description": "Master the two Spanish verbs \"to be\"",
    "xpReward": 150,
    "estimatedMinutes": 18,
    "targetLang": "spanish",
    "content": {
      "introduction": "Spanish has two verbs meaning \"to be\": SER for permanent qualities, ESTAR for temporary states and locations.",
      "words": [
        {
          "word": "Soy estudiante",
          "partOfSpeech": "phrase",
          "definition": "I am a student (SER — identity)",
          "englishExample": "[soy estud-yante]"
        },
        {
          "word": "Estoy cansado",
          "partOfSpeech": "phrase",
          "definition": "I am tired (ESTAR — state)",
          "englishExample": "[estoy kan-sado]"
        },
        {
          "word": "La casa es grande",
          "partOfSpeech": "phrase",
          "definition": "The house is large (SER — characteristic)",
          "englishExample": "[la kasa es ɡrande]"
        },
        {
          "word": "El café está caliente",
          "partOfSpeech": "phrase",
          "definition": "The coffee is hot (ESTAR — condition)",
          "englishExample": "[el kafe esta kalyente]"
        },
        {
          "word": "Estamos en Madrid",
          "partOfSpeech": "phrase",
          "definition": "We are in Madrid (ESTAR — location)",
          "englishExample": "[estamos en madɾid]"
        }
      ],
      "quiz": [
        {
          "id": "es-03-q1",
          "question": "What is the meaning of \"Soy estudiante\"?",
          "options": [
            "I am a student (SER — identity)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means I am a student (SER — identity)"
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
          "word": "¿Cuánto cuesta?",
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
          "englishExample": "[kyero paɡar]"
        }
      ],
      "quiz": [
        {
          "id": "es-04-q1",
          "question": "What is the meaning of \"uno, dos, tres\"?",
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
          "word": "hablar → hablo",
          "partOfSpeech": "phrase",
          "definition": "To speak → I speak (-ar verb)",
          "englishExample": "[ablɑr / ablo]"
        },
        {
          "word": "comer → como",
          "partOfSpeech": "phrase",
          "definition": "To eat → I eat (-er verb)",
          "englishExample": "[komer / komo]"
        },
        {
          "word": "vivir → vivo",
          "partOfSpeech": "phrase",
          "definition": "To live → I live (-ir verb)",
          "englishExample": "[biβiɾ / biβo]"
        },
        {
          "word": "ir → voy",
          "partOfSpeech": "phrase",
          "definition": "To go → I go (irregular)",
          "englishExample": "[iɾ / boy]"
        },
        {
          "word": "tener → tengo",
          "partOfSpeech": "phrase",
          "definition": "To have → I have (irregular yo form)",
          "englishExample": "[teneɾ / teŋɡo]"
        }
      ],
      "quiz": [
        {
          "id": "es-05-q1",
          "question": "What is the meaning of \"hablar → hablo\"?",
          "options": [
            "To speak → I speak (-ar verb)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means To speak → I speak (-ar verb)"
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
          "word": "México",
          "partOfSpeech": "phrase",
          "definition": "Most populous Spanish-speaking country",
          "englishExample": "[meksiΚo]"
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
          "englishExample": "[el taŋɡo]"
        },
        {
          "word": "El fútbol",
          "partOfSpeech": "phrase",
          "definition": "Football (soccer) — a passion across Latin America",
          "englishExample": "[el futbol]"
        },
        {
          "word": "La siesta",
          "partOfSpeech": "phrase",
          "definition": "Afternoon rest — traditional in Spain",
          "englishExample": "[la syesta]"
        }
      ],
      "quiz": [
        {
          "id": "es-06-q1",
          "question": "What is the meaning of \"México\"?",
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
      "introduction": "The preterite (pretérito indefinido) is used for completed actions in the past. It is different from the imperfect tense.",
      "words": [
        {
          "word": "Comí pizza ayer",
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
          "word": "Ella llegó tarde",
          "partOfSpeech": "phrase",
          "definition": "She arrived late",
          "englishExample": "[ea ʎeɡo tarde]"
        },
        {
          "word": "Nosotros hablamos",
          "partOfSpeech": "phrase",
          "definition": "We spoke",
          "englishExample": "[nosotros ablamos]"
        },
        {
          "word": "¿Qué hiciste?",
          "partOfSpeech": "phrase",
          "definition": "What did you do?",
          "englishExample": "[ke iθiste]"
        }
      ],
      "quiz": [
        {
          "id": "es-07-q1",
          "question": "What is the meaning of \"Comí pizza ayer\"?",
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
          "englishExample": "[me dwele la kaβeθa]"
        },
        {
          "word": "Tengo fiebre",
          "partOfSpeech": "phrase",
          "definition": "I have a fever",
          "englishExample": "[teŋɡo fyeβɾe]"
        },
        {
          "word": "Soy alérgico/a a...",
          "partOfSpeech": "phrase",
          "definition": "I am allergic to...",
          "englishExample": "[soy alerxiko/a a]"
        },
        {
          "word": "Necesito una receta",
          "partOfSpeech": "phrase",
          "definition": "I need a prescription",
          "englishExample": "[neθesito una reθeta]"
        },
        {
          "word": "¿Dónde está la farmacia?",
          "partOfSpeech": "phrase",
          "definition": "Where is the pharmacy?",
          "englishExample": "[donde esta la farmaθya]"
        }
      ],
      "quiz": [
        {
          "id": "es-08-q1",
          "question": "What is the meaning of \"Me duele la cabeza\"?",
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
          "englishExample": "[kyero ke benɡas]"
        },
        {
          "word": "Espero que llueva",
          "partOfSpeech": "phrase",
          "definition": "I hope it rains",
          "englishExample": "[espero ke ʎweβa]"
        },
        {
          "word": "Dudo que sea verdad",
          "partOfSpeech": "phrase",
          "definition": "I doubt that it is true",
          "englishExample": "[duδo ke sea berδad]"
        },
        {
          "word": "Es importante que estudies",
          "partOfSpeech": "phrase",
          "definition": "It is important that you study",
          "englishExample": "[es importante ke estuðyes]"
        },
        {
          "word": "Cuando llegues, llámame",
          "partOfSpeech": "phrase",
          "definition": "When you arrive, call me",
          "englishExample": "[kwando ʎeɡes ʎamame]"
        }
      ],
      "quiz": [
        {
          "id": "es-09-q1",
          "question": "What is the meaning of \"Quiero que vengas\"?",
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
          "englishExample": "[—]"
        },
        {
          "word": "Me costó un ojo de la cara",
          "partOfSpeech": "phrase",
          "definition": "It cost me an arm and a leg",
          "englishExample": "[—]"
        },
        {
          "word": "Estar en las nubes",
          "partOfSpeech": "phrase",
          "definition": "To have your head in the clouds",
          "englishExample": "[—]"
        },
        {
          "word": "A quien madruga, Dios le ayuda",
          "partOfSpeech": "phrase",
          "definition": "The early bird catches the worm",
          "englishExample": "[—]"
        },
        {
          "word": "¡Qué guay!",
          "partOfSpeech": "phrase",
          "definition": "How cool! (Spain)",
          "englishExample": "[Spain slang]"
        }
      ],
      "quiz": [
        {
          "id": "es-10-q1",
          "question": "What is the meaning of \"No hay mal que por bien no venga\"?",
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
          "word": "mā (妈)",
          "partOfSpeech": "phrase",
          "definition": "Mother",
          "englishExample": "[1st tone (high level)]"
        },
        {
          "word": "má (麻)",
          "partOfSpeech": "phrase",
          "definition": "Hemp / Numb",
          "englishExample": "[2nd tone (rising)]"
        },
        {
          "word": "mǎ (马)",
          "partOfSpeech": "phrase",
          "definition": "Horse",
          "englishExample": "[3rd tone (dipping)]"
        },
        {
          "word": "mà (骂)",
          "partOfSpeech": "phrase",
          "definition": "To scold",
          "englishExample": "[4th tone (falling)]"
        },
        {
          "word": "ma (吗)",
          "partOfSpeech": "phrase",
          "definition": "Question particle",
          "englishExample": "[neutral tone]"
        }
      ],
      "quiz": [
        {
          "id": "zh-01-q1",
          "question": "What is the meaning of \"mā (妈)\"?",
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
          "definition": "Chinese consonant \"zh\"",
          "englishExample": "[like \"j\" in \"judge\"]"
        },
        {
          "word": "x",
          "partOfSpeech": "phrase",
          "definition": "Chinese consonant \"x\"",
          "englishExample": "[like \"sh\" but softer]"
        },
        {
          "word": "q",
          "partOfSpeech": "phrase",
          "definition": "Chinese consonant \"q\"",
          "englishExample": "[like \"ch\" but forward]"
        },
        {
          "word": "ü",
          "partOfSpeech": "phrase",
          "definition": "Front rounded vowel",
          "englishExample": "[pursed lips \"ee\"]"
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
          "question": "What is the meaning of \"zh\"?",
          "options": [
            "Chinese consonant \"zh\"",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Chinese consonant \"zh\""
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
      "introduction": "Chinese greetings are direct and practical. Asking \"have you eaten?\" (吃饭了吗) is a common greeting showing care.",
      "words": [
        {
          "word": "你好",
          "partOfSpeech": "phrase",
          "definition": "Hello",
          "englishExample": "[Nǐ hǎo]"
        },
        {
          "word": "谢谢",
          "partOfSpeech": "phrase",
          "definition": "Thank you",
          "englishExample": "[Xièxiè]"
        },
        {
          "word": "对不起",
          "partOfSpeech": "phrase",
          "definition": "Sorry / Excuse me",
          "englishExample": "[Duìbuqǐ]"
        },
        {
          "word": "再见",
          "partOfSpeech": "phrase",
          "definition": "Goodbye",
          "englishExample": "[Zàijiàn]"
        },
        {
          "word": "吃饭了吗?",
          "partOfSpeech": "phrase",
          "definition": "Have you eaten? (friendly greeting)",
          "englishExample": "[Chī fàn le ma?]"
        }
      ],
      "quiz": [
        {
          "id": "zh-03-q1",
          "question": "What is the meaning of \"你好\"?",
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
      "introduction": "Chinese characters are built from radicals — component elements that hint at meaning. There are 214 Kangxi radicals.",
      "words": [
        {
          "word": "人 (rén)",
          "partOfSpeech": "phrase",
          "definition": "Person radical",
          "englishExample": "[ren]"
        },
        {
          "word": "水 (shuǐ)",
          "partOfSpeech": "phrase",
          "definition": "Water radical",
          "englishExample": "[shui]"
        },
        {
          "word": "木 (mù)",
          "partOfSpeech": "phrase",
          "definition": "Tree/Wood radical",
          "englishExample": "[mu]"
        },
        {
          "word": "口 (kǒu)",
          "partOfSpeech": "phrase",
          "definition": "Mouth radical",
          "englishExample": "[kou]"
        },
        {
          "word": "心 (xīn)",
          "partOfSpeech": "phrase",
          "definition": "Heart radical",
          "englishExample": "[xin]"
        }
      ],
      "quiz": [
        {
          "id": "zh-04-q1",
          "question": "What is the meaning of \"人 (rén)\"?",
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
          "word": "一二三四五",
          "partOfSpeech": "phrase",
          "definition": "One two three four five",
          "englishExample": "[yī èr sān sì wǔ]"
        },
        {
          "word": "六七八九十",
          "partOfSpeech": "phrase",
          "definition": "Six seven eight nine ten",
          "englishExample": "[liù qī bā jiǔ shí]"
        },
        {
          "word": "今天几月几号?",
          "partOfSpeech": "phrase",
          "definition": "What is today's date?",
          "englishExample": "[Jīntiān jǐ yuè jǐ hào?]"
        },
        {
          "word": "星期一",
          "partOfSpeech": "phrase",
          "definition": "Monday (Star period one)",
          "englishExample": "[Xīngqīyī]"
        },
        {
          "word": "年/月/日",
          "partOfSpeech": "phrase",
          "definition": "Year / Month / Day",
          "englishExample": "[nián / yuè / rì]"
        }
      ],
      "quiz": [
        {
          "id": "zh-05-q1",
          "question": "What is the meaning of \"一二三四五\"?",
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
      "introduction": "Mandarin grammar is simpler than many languages — no verb conjugation, no tenses with endings, no plurals.",
      "words": [
        {
          "word": "我是学生",
          "partOfSpeech": "phrase",
          "definition": "I am a student",
          "englishExample": "[Wǒ shì xuéshēng]"
        },
        {
          "word": "他有一本书",
          "partOfSpeech": "phrase",
          "definition": "He has one book",
          "englishExample": "[Tā yǒu yī běn shū]"
        },
        {
          "word": "我喜欢中文",
          "partOfSpeech": "phrase",
          "definition": "I like Chinese",
          "englishExample": "[Wǒ xǐhuān zhōngwén]"
        },
        {
          "word": "今天天气很好",
          "partOfSpeech": "phrase",
          "definition": "Today's weather is very good",
          "englishExample": "[Jīntiān tiānqì hěn hǎo]"
        },
        {
          "word": "你去哪里?",
          "partOfSpeech": "phrase",
          "definition": "Where are you going?",
          "englishExample": "[Nǐ qù nǎlǐ?]"
        }
      ],
      "quiz": [
        {
          "id": "zh-06-q1",
          "question": "What is the meaning of \"我是学生\"?",
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
          "word": "北京烤鸭",
          "partOfSpeech": "phrase",
          "definition": "Peking Duck",
          "englishExample": "[Běijīng kǎoyā]"
        },
        {
          "word": "饺子",
          "partOfSpeech": "phrase",
          "definition": "Dumplings",
          "englishExample": "[Jiǎozi]"
        },
        {
          "word": "火锅",
          "partOfSpeech": "phrase",
          "definition": "Hot Pot",
          "englishExample": "[Huǒguō]"
        },
        {
          "word": "请客",
          "partOfSpeech": "phrase",
          "definition": "Treating others to a meal (common hospitality)",
          "englishExample": "[Qǐngkè]"
        },
        {
          "word": "干杯!",
          "partOfSpeech": "phrase",
          "definition": "Cheers! (dry cup — drink all)",
          "englishExample": "[Gānbēi!]"
        }
      ],
      "quiz": [
        {
          "id": "zh-07-q1",
          "question": "What is the meaning of \"北京烤鸭\"?",
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
      "introduction": "Every Chinese noun requires a specific measure word (量词) when used with numbers. There are hundreds, but a few key ones cover most situations.",
      "words": [
        {
          "word": "一个人",
          "partOfSpeech": "phrase",
          "definition": "One person (个 gè = general)",
          "englishExample": "[yī gè rén]"
        },
        {
          "word": "一本书",
          "partOfSpeech": "phrase",
          "definition": "One book (本 = bound objects)",
          "englishExample": "[yī běn shū]"
        },
        {
          "word": "一张纸",
          "partOfSpeech": "phrase",
          "definition": "One sheet of paper (张 = flat objects)",
          "englishExample": "[yī zhāng zhǐ]"
        },
        {
          "word": "一条鱼",
          "partOfSpeech": "phrase",
          "definition": "One fish (条 = long/flexible things)",
          "englishExample": "[yī tiáo yú]"
        },
        {
          "word": "一只猫",
          "partOfSpeech": "phrase",
          "definition": "One cat (只 = small animals)",
          "englishExample": "[yī zhī māo]"
        }
      ],
      "quiz": [
        {
          "id": "zh-08-q1",
          "question": "What is the meaning of \"一个人\"?",
          "options": [
            "One person (个 gè = general)",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means One person (个 gè = general)"
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
      "introduction": "Chinese New Year (春节 Chūnjié) is the most important celebration in Chinese culture, lasting 15 days.",
      "words": [
        {
          "word": "新年快乐",
          "partOfSpeech": "phrase",
          "definition": "Happy New Year",
          "englishExample": "[Xīnnián kuàilè]"
        },
        {
          "word": "恭喜发财",
          "partOfSpeech": "phrase",
          "definition": "Wishing you prosperity (CNY greeting)",
          "englishExample": "[Gōngxǐ fācái]"
        },
        {
          "word": "红包",
          "partOfSpeech": "phrase",
          "definition": "Red envelope (money gift)",
          "englishExample": "[Hóngbāo]"
        },
        {
          "word": "春联",
          "partOfSpeech": "phrase",
          "definition": "Spring couplets (door decorations)",
          "englishExample": "[Chūnlián]"
        },
        {
          "word": "鞭炮",
          "partOfSpeech": "phrase",
          "definition": "Firecrackers",
          "englishExample": "[Biānpào]"
        }
      ],
      "quiz": [
        {
          "id": "zh-09-q1",
          "question": "What is the meaning of \"新年快乐\"?",
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
          "word": "多少钱?",
          "partOfSpeech": "phrase",
          "definition": "How much money?",
          "englishExample": "[Duōshǎo qián?]"
        },
        {
          "word": "太贵了",
          "partOfSpeech": "phrase",
          "definition": "Too expensive",
          "englishExample": "[Tài guì le]"
        },
        {
          "word": "便宜一点",
          "partOfSpeech": "phrase",
          "definition": "A little cheaper",
          "englishExample": "[Piányí yīdiǎn]"
        },
        {
          "word": "我要这个",
          "partOfSpeech": "phrase",
          "definition": "I want this one",
          "englishExample": "[Wǒ yào zhège]"
        },
        {
          "word": "刷卡可以吗?",
          "partOfSpeech": "phrase",
          "definition": "Can I pay by card?",
          "englishExample": "[Shuā kǎ kěyǐ ma?]"
        }
      ],
      "quiz": [
        {
          "id": "zh-10-q1",
          "question": "What is the meaning of \"多少钱?\"?",
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
          "word": "ma (không dấu)",
          "partOfSpeech": "phrase",
          "definition": "\"Ghost\" — flat mid tone",
          "englishExample": "[level tone]"
        },
        {
          "word": "má (sắc)",
          "partOfSpeech": "phrase",
          "definition": "\"Cheek/Mother\" — rising",
          "englishExample": "[rising tone]"
        },
        {
          "word": "mà (huyền)",
          "partOfSpeech": "phrase",
          "definition": "\"But\" — low falling",
          "englishExample": "[falling tone]"
        },
        {
          "word": "mả (hỏi)",
          "partOfSpeech": "phrase",
          "definition": "\"Grave/tomb\" — dipping-rising",
          "englishExample": "[dipping tone]"
        },
        {
          "word": "mã (ngã)",
          "partOfSpeech": "phrase",
          "definition": "\"Code/sign\" — creaky rising",
          "englishExample": "[broken rising]"
        }
      ],
      "quiz": [
        {
          "id": "vi-01-q1",
          "question": "What is the meaning of \"ma (không dấu)\"?",
          "options": [
            "\"Ghost\" — flat mid tone",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means \"Ghost\" — flat mid tone"
        }
      ]
    }
  },
  {
    "id": "vi-02",
    "category": "pronunciation",
    "level": "beginner",
    "title": "Vietnamese Alphabet (Chữ Quốc Ngữ)",
    "description": "Learn the Latin-based Vietnamese script",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese uses a modified Latin alphabet (Chữ Quốc Ngữ) introduced by Portuguese missionaries. It is easier to learn than most Asian scripts.",
      "words": [
        {
          "word": "ă",
          "partOfSpeech": "phrase",
          "definition": "Short \"a\" vowel",
          "englishExample": "[short a]"
        },
        {
          "word": "â",
          "partOfSpeech": "phrase",
          "definition": "Deep throat \"a\" vowel",
          "englishExample": "[deep a]"
        },
        {
          "word": "ơ",
          "partOfSpeech": "phrase",
          "definition": "Unrounded back vowel",
          "englishExample": "[unrounded \"er\"]"
        },
        {
          "word": "ư",
          "partOfSpeech": "phrase",
          "definition": "High back unrounded vowel",
          "englishExample": "[high back]"
        },
        {
          "word": "đ",
          "partOfSpeech": "phrase",
          "definition": "Đ — unique Vietnamese letter",
          "englishExample": "[d (implosive)]"
        }
      ],
      "quiz": [
        {
          "id": "vi-02-q1",
          "question": "What is the meaning of \"ă\"?",
          "options": [
            "Short \"a\" vowel",
            "Something else",
            "Another incorrect option",
            "None of the above"
          ],
          "answerIndex": 0,
          "explanation": "It means Short \"a\" vowel"
        }
      ]
    }
  },
  {
    "id": "vi-03",
    "category": "vocabulary",
    "level": "beginner",
    "title": "Xin Chào: Greetings",
    "description": "Essential Vietnamese greetings and etiquette",
    "xpReward": 150,
    "estimatedMinutes": 10,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese greetings are uniquely tied to social hierarchy — you use different pronouns based on the age relationship.",
      "words": [
        {
          "word": "Xin chào",
          "partOfSpeech": "phrase",
          "definition": "Hello (formal)",
          "englishExample": "[sin chow]"
        },
        {
          "word": "Cảm ơn",
          "partOfSpeech": "phrase",
          "definition": "Thank you",
          "englishExample": "[kahm uhn]"
        },
        {
          "word": "Xin lỗi",
          "partOfSpeech": "phrase",
          "definition": "Sorry / Excuse me",
          "englishExample": "[sin loy]"
        },
        {
          "word": "Tạm biệt",
          "partOfSpeech": "phrase",
          "definition": "Goodbye",
          "englishExample": "[tahm byet]"
        },
        {
          "word": "Bạn có khỏe không?",
          "partOfSpeech": "phrase",
          "definition": "How are you? (to a friend)",
          "englishExample": "[ban co kwe khong]"
        }
      ],
      "quiz": [
        {
          "id": "vi-03-q1",
          "question": "What is the meaning of \"Xin chào\"?",
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
          "word": "Phở",
          "partOfSpeech": "phrase",
          "definition": "Beef/chicken noodle soup (national dish)",
          "englishExample": "[Fuh]"
        },
        {
          "word": "Bánh mì",
          "partOfSpeech": "phrase",
          "definition": "Vietnamese baguette sandwich",
          "englishExample": "[Bahn mee]"
        },
        {
          "word": "Gỏi cuốn",
          "partOfSpeech": "phrase",
          "definition": "Fresh spring rolls",
          "englishExample": "[goy kwon]"
        },
        {
          "word": "Bún bò Huế",
          "partOfSpeech": "phrase",
          "definition": "Spicy Hue beef noodle soup",
          "englishExample": "[bun baw hway]"
        },
        {
          "word": "Cà phê trứng",
          "partOfSpeech": "phrase",
          "definition": "Egg coffee (Hanoi specialty)",
          "englishExample": "[ka feh chung]"
        }
      ],
      "quiz": [
        {
          "id": "vi-04-q1",
          "question": "What is the meaning of \"Phở\"?",
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
          "word": "một, hai, ba",
          "partOfSpeech": "phrase",
          "definition": "One, two, three",
          "englishExample": "[moht, hi, ba]"
        },
        {
          "word": "bốn, năm, sáu",
          "partOfSpeech": "phrase",
          "definition": "Four, five, six",
          "englishExample": "[bohn, nam, sau]"
        },
        {
          "word": "bảy, tám, chín, mười",
          "partOfSpeech": "phrase",
          "definition": "Seven, eight, nine, ten",
          "englishExample": "[bay, tam, chin, muoi]"
        },
        {
          "word": "một trăm",
          "partOfSpeech": "phrase",
          "definition": "One hundred",
          "englishExample": "[moht tram]"
        },
        {
          "word": "Bao nhiêu tiền?",
          "partOfSpeech": "phrase",
          "definition": "How much money?",
          "englishExample": "[bow nyew tyen]"
        }
      ],
      "quiz": [
        {
          "id": "vi-05-q1",
          "question": "What is the meaning of \"một, hai, ba\"?",
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
          "word": "Tôi ăn cơm",
          "partOfSpeech": "phrase",
          "definition": "I eat rice",
          "englishExample": "[toy an kum]"
        },
        {
          "word": "Anh ấy học tiếng Anh",
          "partOfSpeech": "phrase",
          "definition": "He studies English",
          "englishExample": "[anh ay hok tyeng anh]"
        },
        {
          "word": "Chúng tôi thích Việt Nam",
          "partOfSpeech": "phrase",
          "definition": "We like Vietnam",
          "englishExample": "[chung toy thik vyet nam]"
        },
        {
          "word": "Cô ấy đẹp lắm",
          "partOfSpeech": "phrase",
          "definition": "She is very beautiful",
          "englishExample": "[koh ay dep lam]"
        },
        {
          "word": "Tôi không hiểu",
          "partOfSpeech": "phrase",
          "definition": "I do not understand",
          "englishExample": "[toy khong hyew]"
        }
      ],
      "quiz": [
        {
          "id": "vi-06-q1",
          "question": "What is the meaning of \"Tôi ăn cơm\"?",
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
    "description": "Celebrate Tết and major Vietnamese traditions",
    "xpReward": 150,
    "estimatedMinutes": 12,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Tết Nguyên Đán (Vietnamese Lunar New Year) is the most important holiday — a time for family reunion, offerings, and new beginnings.",
      "words": [
        {
          "word": "Chúc Mừng Năm Mới",
          "partOfSpeech": "phrase",
          "definition": "Happy New Year",
          "englishExample": "[chuk mung nam moy]"
        },
        {
          "word": "Bánh chưng",
          "partOfSpeech": "phrase",
          "definition": "Square sticky rice cake (Tet food)",
          "englishExample": "[banh chung]"
        },
        {
          "word": "Lì xì",
          "partOfSpeech": "phrase",
          "definition": "Lucky money in red envelope",
          "englishExample": "[lee see]"
        },
        {
          "word": "Hội An",
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
          "question": "What is the meaning of \"Chúc Mừng Năm Mới\"?",
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
    "title": "At the Market (Chợ)",
    "description": "Navigate Vietnamese markets with confidence",
    "xpReward": 150,
    "estimatedMinutes": 13,
    "targetLang": "vietnamese",
    "content": {
      "introduction": "Vietnamese wet markets (chợ) are lively and colorful. Bargaining is expected in most traditional markets.",
      "words": [
        {
          "word": "Cái này giá bao nhiêu?",
          "partOfSpeech": "phrase",
          "definition": "How much is this?",
          "englishExample": "[kai nay jah bao nyew]"
        },
        {
          "word": "Đắt quá!",
          "partOfSpeech": "phrase",
          "definition": "Too expensive!",
          "englishExample": "[daht kwa]"
        },
        {
          "word": "Bớt đi một chút",
          "partOfSpeech": "phrase",
          "definition": "Reduce it a little",
          "englishExample": "[bert dee moht chut]"
        },
        {
          "word": "Cho tôi xem",
          "partOfSpeech": "phrase",
          "definition": "Let me see it",
          "englishExample": "[cho toy sem]"
        },
        {
          "word": "Tôi mua cái này",
          "partOfSpeech": "phrase",
          "definition": "I will buy this one",
          "englishExample": "[toy mua kai nay]"
        }
      ],
      "quiz": [
        {
          "id": "vi-08-q1",
          "question": "What is the meaning of \"Cái này giá bao nhiêu?\"?",
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
          "word": "con chó",
          "partOfSpeech": "phrase",
          "definition": "Dog (con = living things)",
          "englishExample": "[kon cho]"
        },
        {
          "word": "cái bàn",
          "partOfSpeech": "phrase",
          "definition": "Table (cái = inanimate objects)",
          "englishExample": "[kai ban]"
        },
        {
          "word": "quyển sách",
          "partOfSpeech": "phrase",
          "definition": "Book (quyển = bound objects)",
          "englishExample": "[kwen sak]"
        },
        {
          "word": "tờ báo",
          "partOfSpeech": "phrase",
          "definition": "Newspaper (tờ = flat sheets)",
          "englishExample": "[tuh bao]"
        },
        {
          "word": "cốc nước",
          "partOfSpeech": "phrase",
          "definition": "Glass of water (cốc = cup-shaped)",
          "englishExample": "[kohk nuok]"
        }
      ],
      "quiz": [
        {
          "id": "vi-09-q1",
          "question": "What is the meaning of \"con chó\"?",
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
          "word": "Bến xe buýt ở đâu?",
          "partOfSpeech": "phrase",
          "definition": "Where is the bus station?",
          "englishExample": "[ben se bweet uh dau]"
        },
        {
          "word": "Cho tôi đến...",
          "partOfSpeech": "phrase",
          "definition": "Take me to... (taxi/xe ôm)",
          "englishExample": "[cho toy den]"
        },
        {
          "word": "Bao nhiêu tiền?",
          "partOfSpeech": "phrase",
          "definition": "How much?",
          "englishExample": "[bao nyew tyen]"
        },
        {
          "word": "Dừng ở đây",
          "partOfSpeech": "phrase",
          "definition": "Stop here",
          "englishExample": "[dung uh day]"
        },
        {
          "word": "Cách đây bao xa?",
          "partOfSpeech": "phrase",
          "definition": "How far from here?",
          "englishExample": "[kak day bao sa]"
        }
      ],
      "quiz": [
        {
          "id": "vi-10-q1",
          "question": "What is the meaning of \"Bến xe buýt ở đâu?\"?",
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
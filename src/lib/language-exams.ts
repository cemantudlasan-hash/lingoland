export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const languageExams: Record<string, ExamQuestion[]> = {
  thai: [
    {
      id: 'th-ex-01',
      question: 'How many base consonants are there in the Thai alphabet?',
      options: ['32', '44', '21', '15'],
      answerIndex: 1,
      explanation: 'Thai alphabet contains 44 base consonants divided into high, mid, and low classes.'
    },
    {
      id: 'th-ex-02',
      question: 'How many tones exist in the spoken Thai language?',
      options: ['3 tones', '4 tones', '5 tones', '6 tones'],
      answerIndex: 2,
      explanation: 'Thai has 5 tones: mid, low, falling, high, and rising.'
    },
    {
      id: 'th-ex-03',
      question: 'Which of the following is the Thai base consonant for "Chicken"?',
      options: ['ข (Kh)', 'ง (Ng)', 'ก (K)', 'ด (D)'],
      answerIndex: 2,
      explanation: 'ก (Ko Kai) is the first consonant and represents "chicken".'
    },
    {
      id: 'th-ex-04',
      question: 'Which consonant represents "Snake" and belongs to the low-class consonants?',
      options: ['จ (J)', 'ข (Kh)', 'ง (Ng)', 'ก (K)'],
      answerIndex: 2,
      explanation: 'ง (Ngo Ngu) represents "snake" and is a low-class consonant.'
    },
    {
      id: 'th-ex-05',
      question: 'Which consonant represents "Child" and is a mid-class consonant?',
      options: ['ด (D)', 'ข (Kh)', 'ง (Ng)', 'ก (K)'],
      answerIndex: 0,
      explanation: 'ด (Do Dek) represents "child" and is a mid-class consonant.'
    },
    {
      id: 'th-ex-06',
      question: 'How do you say "Hello" or "Goodbye" in Thai?',
      options: ['ขอบคุณ (Khob khun)', 'สวัสดี (Sawasdee)', 'ไม่เป็นไร (Mai pen rai)', 'ขอโทษ (Kho thot)'],
      answerIndex: 1,
      explanation: 'สวัสดี (Sawasdee) is used for both Hello and Goodbye.'
    },
    {
      id: 'th-ex-07',
      question: 'What is the polite particle used at the end of a sentence by a male speaker?',
      options: ['ค่ะ (Ka)', 'นะ (Na)', 'ครับ (Krap)', 'จ้า (Ja)'],
      answerIndex: 2,
      explanation: 'ครับ (Krap) is the polite particle used by male speakers.'
    },
    {
      id: 'th-ex-08',
      question: 'What is the polite particle used by a female speaker in Thai?',
      options: ['ค่ะ / คะ (Ka / Kha)', 'ครับ (Krap)', 'จ้ะ (Ja)', 'นะ (Na)'],
      answerIndex: 0,
      explanation: 'Female speakers use ค่ะ (Ka) for statements and คะ (Kha) for questions.'
    },
    {
      id: 'th-ex-09',
      question: 'How do you say "Thank you" in Thai?',
      options: ['สวัสดี (Sawasdee)', 'ไม่เป็นไร (Mai pen rai)', 'ขอบคุณ (Khob khun)', 'ยินดี (Yin dee)'],
      answerIndex: 2,
      explanation: 'ขอบคุณ (Khob khun) means "Thank you".'
    },
    {
      id: 'th-ex-10',
      question: 'What does "ไม่เป็นไร" (Mai pen rai) mean in Thai?',
      options: ['Hello', 'No problem / It is okay', 'Thank you', 'Excuse me'],
      answerIndex: 1,
      explanation: 'ไม่เป็นไร (Mai pen rai) translates to "It is okay", "No problem", or "Don\'t mention it".'
    },
    {
      id: 'th-ex-11',
      question: 'What is the Thai word for the number "One" (1)?',
      options: ['สอง (Song)', 'สาม (Sam)', 'หนึ่ง (Nueng)', 'สิบ (Sip)'],
      answerIndex: 2,
      explanation: 'หนึ่ง (Nueng) is the number 1.'
    },
    {
      id: 'th-ex-12',
      question: 'How do you say the number "Ten" (10) in Thai?',
      options: ['สิบ (Sip)', 'ร้อย (Roi)', 'หนึ่ง (Nueng)', 'สอง (Song)'],
      answerIndex: 0,
      explanation: 'สิบ (Sip) represents the number 10.'
    },
    {
      id: 'th-ex-13',
      question: 'How do you say the number "One hundred" (100) in Thai?',
      options: ['สิบ (Sip)', 'ร้อย (Roi)', 'พัน (Phan)', 'หมื่น (Muen)'],
      answerIndex: 1,
      explanation: 'ร้อย (Roi) means hundred.'
    },
    {
      id: 'th-ex-14',
      question: 'How do you say "Twenty" (20) in Thai?',
      options: ['สองสิบ (Song sip)', 'ยี่สิบ (Yee sip)', 'สิบสอง (Sip song)', 'ร้อยสอง (Roi song)'],
      answerIndex: 1,
      explanation: 'Twenty is irregularly pronounced as ยี่สิบ (Yee sip) rather than สองสิบ (Song sip).'
    },
    {
      id: 'th-ex-15',
      question: 'What is the Thai word for the number "Three" (3)?',
      options: ['สี่ (See)', 'ห้า (Ha)', 'สาม (Sam)', 'สอง (Song)'],
      answerIndex: 2,
      explanation: 'สาม (Sam) represents the number 3.'
    },
    {
      id: 'th-ex-16',
      question: 'How do you politely ask for the menu in a Thai restaurant?',
      options: ['เช็คบิลด้วย (Check bin duai)', 'ขอเมนูหน่อยได้ไหม (Kho menu noi dai mai)', 'อร่อยมาก (Aroi mak)', 'เผ็ดน้อย (Phet noi)'],
      answerIndex: 1,
      explanation: 'ขอเมนูหน่อยได้ไหม (Kho menu noi dai mai) means "Can I have the menu please?".'
    },
    {
      id: 'th-ex-17',
      question: 'How do you describe food as "Very delicious" in Thai?',
      options: ['เผ็ดมาก (Phet mak)', 'ไม่ใส่ผักชี (Mai sai phak chi)', 'อร่อยมาก (Aroi mak)', 'เช็คบิล (Check bin)'],
      answerIndex: 2,
      explanation: 'อร่อยมาก (Aroi mak) translates to "Very delicious".'
    },
    {
      id: 'th-ex-18',
      question: 'How do you say "A little bit spicy" in Thai?',
      options: ['ไม่เผ็ด (Mai phet)', 'เผ็ดมาก (Phet mak)', 'เผ็ดน้อยๆ (Phet noi noi)', 'ใส่พริก (Sai phrik)'],
      answerIndex: 2,
      explanation: 'เผ็ดน้อยๆ (Phet noi noi) means "A little bit spicy".'
    },
    {
      id: 'th-ex-19',
      question: 'How do you ask for the bill at a Thai restaurant?',
      options: ['เช็คบิลด้วย / เก็บเงินด้วย (Check bin duai / Kep ngoen duai)', 'ขอเมนู (Kho menu)', 'ขอช้อนหน่อย (Kho chon noi)', 'ขอบคุณ (Khob khun)'],
      answerIndex: 0,
      explanation: 'เช็คบิลด้วย (Check bin duai) or เก็บเงินด้วย (Kep ngoen duai) is used to call for the bill.'
    },
    {
      id: 'th-ex-20',
      question: 'What does "ไม่ใส่ผักชี" (Mai sai phak chi) mean?',
      options: ['No spicy please', 'No MSG please', 'No coriander please', 'No sugar please'],
      answerIndex: 2,
      explanation: 'ผักชี (Phak chi) is coriander/cilantro; "ไม่ใส่" (Mai sai) means "don\'t put in".'
    },
    {
      id: 'th-ex-21',
      question: 'What is the Thai phrase for "Go straight"?',
      options: ['เลี้ยวซ้าย (Liao sai)', 'ตรงไป (Trong pai)', 'เลี้ยวขวา (Liao kwa)', 'อยู่ไกลไหม (Yu klai mai)'],
      answerIndex: 1,
      explanation: 'ตรงไป (Trong pai) means "Go straight".'
    },
    {
      id: 'th-ex-22',
      question: 'How do you say "Turn left" in Thai?',
      options: ['ตรงไป (Trong pai)', 'เลี้ยวซ้าย (Liao sai)', 'เลี้ยวขวา (Liao kwa)', 'ถอยหลัง (Thoi lang)'],
      answerIndex: 1,
      explanation: 'เลี้ยวซ้าย (Liao sai) translates to "Turn left".'
    },
    {
      id: 'th-ex-23',
      question: 'How do you say "Turn right" in Thai?',
      options: ['เลี้ยวขวา (Liao kwa)', 'เลี้ยวซ้าย (Liao sai)', 'ตรงไป (Trong pai)', 'เลี้ยวกลับ (Liao klap)'],
      answerIndex: 0,
      explanation: 'เลี้ยวขวา (Liao kwa) translates to "Turn right".'
    },
    {
      id: 'th-ex-24',
      question: 'What does "ไปที่ไหน" (Pai thi nai) mean?',
      options: ['Where are you going?', 'How are you?', 'Where is it?', 'When do we go?'],
      answerIndex: 0,
      explanation: 'ไปที่ไหน (Pai thi nai) literally means "Go where?" or "Where are you going?".'
    },
    {
      id: 'th-ex-25',
      question: 'What does "อยู่ไกลไหม" (Yu klai mai) mean?',
      options: ['Is it close?', 'Is it far?', 'How much is it?', 'Can we walk?'],
      answerIndex: 1,
      explanation: 'ไกล (Klai) with a flat tone means "far". So "อยู่ไกลไหม" means "Is it far?".'
    },
        {
      id: 'th-ex-26',
      question: 'What is the Thai word for "Raining"?',
      options: ['ร้อน (Ron)', 'ฝنตก (Fon tok)', 'หนาว (Nao)', 'พายุ (Phayu)'],
      answerIndex: 1,
      explanation: 'ฝนตก (Fon tok) means "raining" in Thai; ร้อน (Ron) is hot; หนาว (Nao) is cold.'
    },
    {
      id: 'th-ex-27',
      question: 'What is the Thai word for "Temple"?',
      options: ['วัด (Wat)', 'พระ (Phra)', 'ถอดรองเท้า (Thot rong thao)', 'ทำบุญ (Tham bun)'],
      answerIndex: 0,
      explanation: 'วัด (Wat) is temple in Thai.'
    },
    {
      id: 'th-ex-28',
      question: 'Which famous water festival celebrates the traditional Thai New Year?',
      options: ['ลอยกระทง (Loy Krathong)', 'สงกรานต์ (Songkran)', 'วันสำคัญ (Wan samkhan)', 'วันเข้าพรรษา (Wan khao phansa)'],
      answerIndex: 1,
      explanation: 'สงกรานต์ (Songkran) is the water splashing festival marking the traditional Thai New Year.'
    },
    {
      id: 'th-ex-29',
      question: 'How do you ask "How much is it?" while shopping in a Thai market?',
      options: ['ราคาเท่าไร (Raka thao rai)', 'ลดได้ไหม (Lot dai mai)', 'แพงเกินไป (Phaeng koen pai)', 'เอาอันนี้ (Ao an ni)'],
      answerIndex: 0,
      explanation: 'ราคาเท่าไร (Raka thao rai) means "How much does it cost?".'
    },
    {
      id: 'th-ex-30',
      question: 'How do you say "Can you discount / reduce the price?" in Thai?',
      options: ['แพงไป (Phaeng pai)', 'ราคาเท่าไร (Raka thao rai)', 'ลดได้ไหม (Lot dai mai)', 'มีสีอื่นไหม (Mi si uen mai)'],
      answerIndex: 2,
      explanation: 'ลดได้ไหม (Lot dai mai) literally translates to "Reduce can?" or "Can you discount?".'
    }
  ],
  korean: [
    {
      id: 'ko-ex-01',
      question: 'Who is credited with the invention of Hangeul (the Korean alphabet) in 1443?',
      options: ['King Sejong the Great', 'King Gojong', 'General Yi Sun-sin', 'King Taejo'],
      answerIndex: 0,
      explanation: 'King Sejong the Great created Hangeul to increase literacy among the common people.'
    },
    {
      id: 'ko-ex-02',
      question: 'What is the basic Hangeul consonant for the "N" sound?',
      options: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
      answerIndex: 1,
      explanation: 'ㄴ is called "nieun" and represents the N sound.'
    },
    {
      id: 'ko-ex-03',
      question: 'Which vowel matches the "A" sound in Korean Hangul?',
      options: ['ㅓ', 'ㅗ', 'ㅏ', 'ㅜ'],
      answerIndex: 2,
      explanation: 'ㅏ represents the vowel sound "a" (as in "father").'
    },
    {
      id: 'ko-ex-04',
      question: 'How is Hangeul written?',
      options: ['In a continuous line of letters', 'In syllable blocks containing 2 to 4 characters', 'Only vertically from right to left', 'Using purely pictographic symbols'],
      answerIndex: 1,
      explanation: 'Korean letters are grouped together into syllable blocks (consonant + vowel + optional final consonant).'
    },
    {
      id: 'ko-ex-05',
      question: 'What is the Korean word for the Korean writing system itself?',
      options: ['Hanja', 'Hangeul', 'Kanji', 'Kana'],
      answerIndex: 1,
      explanation: '한글 (Hangeul) is the native name of the Korean alphabet.'
    },
    {
      id: 'ko-ex-06',
      question: 'What is the standard, polite way to say "Hello" in Korean?',
      options: ['안녕 (Annyeong)', '안녕하세요 (Annyeonghaseyo)', '감사합니다 (Gamsahamnida)', '죄송합니다 (Joesonghamnida)'],
      answerIndex: 1,
      explanation: '안녕하세요 (Annyeonghaseyo) is the polite, standard greeting.'
    },
    {
      id: 'ko-ex-07',
      question: 'How do you say "Thank you" politely in Korean?',
      options: ['안녕하세요 (Annyeonghaseyo)', '죄송합니다 (Joesonghamnida)', '반갑습니다 (Bangapseumnida)', '감사합니다 (Gamsahamnida)'],
      answerIndex: 3,
      explanation: '감사합니다 (Gamsahamnida) means "Thank you" in polite/formal speech.'
    },
    {
      id: 'ko-ex-08',
      question: 'What does "죄송합니다" (Joesonghamnida) mean in Korean?',
      options: ['Hello', 'I am sorry', 'Thank you', 'Goodbye'],
      answerIndex: 1,
      explanation: '죄송합니다 (Joesonghamnida) means "I am sorry".'
    },
    {
      id: 'ko-ex-09',
      question: 'How do you say "Goodbye" to someone who is leaving while you are staying?',
      options: ['안녕히 가세요 (Annyeonghi gaseyo)', '안녕히 계세요 (Annyeonghi gyeseyo)', '안녕하세요 (Annyeonghaseyo)', '반갑습니다 (Bangapseumnida)'],
      answerIndex: 0,
      explanation: '안녕히 가세요 (Annyeonghi gaseyo) means "Go in peace" (to someone leaving).'
    },
    {
      id: 'ko-ex-10',
      question: 'Which speech level ending is most commonly used to remain polite but conversational in everyday life?',
      options: ['해체 (Haeche)', '합쇼체 (Hapshoche)', '해요체 (Haeyoche)', '반말 (Banmal)'],
      answerIndex: 2,
      explanation: '해요체 (Haeyoche) ending with "-요" is the standard informal polite speech level.'
    },
    {
      id: 'ko-ex-11',
      question: 'What is the Native Korean number for "One" (1)?',
      options: ['일 (Il)', '이 (I)', '하나 (Hana)', '둘 (Dul)'],
      answerIndex: 2,
      explanation: '하나 (Hana) is the Native Korean number for 1.'
    },
    {
      id: 'ko-ex-12',
      question: 'What is the Sino-Korean number for "One" (1)?',
      options: ['일 (Il)', '이 (I)', '하나 (Hana)', '둘 (Dul)'],
      answerIndex: 0,
      explanation: '일 (Il) is the Sino-Korean number for 1.'
    },
    {
      id: 'ko-ex-13',
      question: 'Which number system should you use when counting currency (Won) or expressing phone numbers?',
      options: ['Native Korean', 'Sino-Korean', 'Hanja numbers', 'English numbers'],
      answerIndex: 1,
      explanation: 'Sino-Korean numbers (일, 이, 삼...) are used for money, phone numbers, dates, and minutes.'
    },
    {
      id: 'ko-ex-14',
      question: 'Which number system is used for counting physical items or expressing age?',
      options: ['Sino-Korean', 'Native Korean', 'English numbers', 'Arabic numbers'],
      answerIndex: 1,
      explanation: 'Native Korean numbers (하나, 둘, 셋...) are used for counting general items, age, and hours.'
    },
    {
      id: 'ko-ex-15',
      question: 'What is the Sino-Korean word for "Hundred" (100)?',
      options: ['십 (Sip)', '백 (Baek)', '천 (Cheon)', '만 (Man)'],
      answerIndex: 1,
      explanation: '백 (Baek) is the Sino-Korean number for 100.'
    },
    {
      id: 'ko-ex-16',
      question: 'What does the popular slang "대박" (Daebak) mean?',
      options: ['I am tired', 'Awesome / Big win / Jack-pot', 'Help me', 'Please wait'],
      answerIndex: 1,
      explanation: '대박 (Daebak) means "Awesome", "Great", or "Jackpot".'
    },
    {
      id: 'ko-ex-17',
      question: 'Which phrase is used as a cheer of encouragement (meaning "Fighting!" or "You can do it!")?',
      options: ['화이팅 (Hwaiting)', '아이고 (Aigo)', '진짜요 (Jinjjayo)', '대박 (Daebak)'],
      answerIndex: 0,
      explanation: '화이팅 (Hwaiting) or 파이팅 is the ubiquitous cheering expression.'
    },
    {
      id: 'ko-ex-18',
      question: 'What is the grammatical sentence structure of Korean?',
      options: ['Subject-Verb-Object (SVO)', 'Subject-Object-Verb (SOV)', 'Verb-Subject-Object (VSO)', 'Object-Subject-Verb (OSV)'],
      answerIndex: 1,
      explanation: 'Korean sentences end with the verb, following the SOV order.'
    },
    {
      id: 'ko-ex-19',
      question: 'Which grammatical particle marks the object of a verb in Korean?',
      options: ['은 / 는 (eun/neun)', '이 / 가 (i/ga)', '을 / 를 (eul/reul)', '에 (e)'],
      answerIndex: 2,
      explanation: '을/를 (eul/reul) is the direct object marker.'
    },
    {
      id: 'ko-ex-20',
      question: 'Which particle is the topic marker in Korean?',
      options: ['은 / 는 (eun/neun)', '이 / 가 (i/ga)', '을 / 를 (eul/reul)', '로 / 으로 (ro/euro)'],
      answerIndex: 0,
      explanation: '은/는 (eun/neun) acts as the topic marker, often meaning "as for...".'
    },
    {
      id: 'ko-ex-21',
      question: 'How do you call a server at a restaurant in Korea politely?',
      options: ['대박 (Daebak)', '여기요 (Yeogiyo)', '물 주세요 (Mul juseyo)', '오빠 (Oppa)'],
      answerIndex: 1,
      explanation: '여기요 (Yeogiyo) literally means "over here" and is used to call servers.'
    },
    {
      id: 'ko-ex-22',
      question: 'How do you say "Give me this please" in Korean?',
      options: ['이거 주세요 (Igeo juseyo)', '맛있어요 (Massisseoyo)', '계산서 주세요 (Gyesanseo juseyo)', '여기요 (Yeogiyo)'],
      answerIndex: 0,
      explanation: '이거 (Igeo) means "this" and 주세요 (juseyo) means "please give".'
    },
    {
      id: 'ko-ex-23',
      question: 'What is the Korean word for "Delicious"?',
      options: ['맛있어요 (Massisseoyo)', '더워요 (Deowoyo)', '추워요 (Chuwoyo)', '진짜요 (Jinjjayo)'],
      answerIndex: 0,
      explanation: '맛있어요 (Massisseoyo) means "It is delicious".'
    },
    {
      id: 'ko-ex-24',
      question: 'What is the Korean word for "Weather"?',
      options: ['날씨 (Nalssi)', '계절 (Gyejeol)', '하늘 (Haneul)', '바람 (Baram)'],
      answerIndex: 0,
      explanation: '날씨 (Nalssi) translates to "weather".'
    },
    {
      id: 'ko-ex-25',
      question: 'What is the Korean national dish of spicy fermented cabbage?',
      options: ['비빔밥 (Bibimbap)', '김치 (Kimchi)', '불고기 (Bulgogi)', '떡볶이 (Tteokbokki)'],
      answerIndex: 1,
      explanation: '김치 (Kimchi) is the world-famous Korean fermented side dish.'
    },
        {
      id: 'ko-ex-26',
      question: 'Which Korean word refers to Karaoke rooms?',
      options: ['등산 (Deungsan)', '노래방 (Noraebang)', 'PC방 (PC bang)', '영화 (Yeonghwa)'],
      answerIndex: 1,
      explanation: '노래방 (Noraebang) is a Karaoke singing room.'
    },
    {
      id: 'ko-ex-27',
      question: 'Which Korean street food refers to seaweed rice rolls?',
      options: ['떡볶이 (Tteokbokki)', '오뎅 (Odeng)', '김밥 (Gimbap)', '순대 (Sundae)'],
      answerIndex: 2,
      explanation: '김밥 (Gimbap) is seaweed rice rolls.'
    },
    {
      id: 'ko-ex-28',
      question: 'What does "지하철" (Jihacheol) mean?',
      options: ['Bus', 'Taxi', 'Subway', 'Train'],
      answerIndex: 2,
      explanation: '지하철 (Jihacheol) means Subway.'
    },
    {
      id: 'ko-ex-29',
      question: 'Which season is called "겨울" (Gyeoul) in Korean?',
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
      answerIndex: 3,
      explanation: '겨울 (Gyeoul) means Winter; 봄 (Bom) is Spring.'
    },
    {
      id: 'ko-ex-30',
      question: 'What is the traditional Korean dish of rice mixed with various vegetables, meat, and red chili paste?',
      options: ['김치 (Kimchi)', '비빔밥 (Bibimbap)', '삼겹살 (Samgyeopsal)', '불고기 (Bulgogi)'],
      answerIndex: 1,
      explanation: '비빔밥 (Bibimbap) translates literally to "mixed rice".'
    }
  ],
  japanese: [
    {
      id: 'ja-ex-01',
      question: 'How many base Hiragana characters are there in standard Japanese?',
      options: ['26', '46', '50', '36'],
      answerIndex: 1,
      explanation: 'The standard Hiragana syllabary has exactly 46 basic characters.'
    },
    {
      id: 'ja-ex-02',
      question: 'Which Japanese script is primarily used to write foreign loanwords, names, and scientific terms?',
      options: ['Hiragana', 'Kanji', 'Katakana', 'Romaji'],
      answerIndex: 2,
      explanation: 'Katakana (カタカナ) is used for loanwords (e.g. coffee, television) and foreign names.'
    },
    {
      id: 'ja-ex-03',
      question: 'What is the Katakana representation of "Coffee"?',
      options: ['お茶 (Ocha)', 'コーヒー (Koohii)', 'テレビ (Terebi)', 'ビール (Biiru)'],
      answerIndex: 1,
      explanation: 'コーヒー (Koohii) is the Katakana loanword for Coffee.'
    },
    {
      id: 'ja-ex-04',
      question: 'What does the Katakana "テレビ" (Terebi) mean?',
      options: ['Radio', 'Telephone', 'Television', 'Computer'],
      answerIndex: 2,
      explanation: 'テレビ (Terebi) is a shortened loanword meaning Television.'
    },
    {
      id: 'ja-ex-05',
      question: 'What is the formal way to say "Good morning" in Japanese?',
      options: ['こんにちは (Konnichiwa)', 'おはようございます (Ohayou gozaimasu)', 'こんばんは (Konbanwa)', 'さようなら (Sayounara)'],
      answerIndex: 1,
      explanation: 'おはようございます (Ohayou gozaimasu) is the polite morning greeting.'
    },
    {
      id: 'ja-ex-06',
      question: 'What is the multi-purpose Japanese greeting "こんにちは" (Konnichiwa) used for?',
      options: ['Good morning', 'Hello / Good afternoon', 'Good evening', 'Goodbye'],
      answerIndex: 1,
      explanation: 'こんにちは (Konnichiwa) is used as "Hello" during daylight hours.'
    },
    {
      id: 'ja-ex-07',
      question: 'How do you politely say "Thank you very much" in Japanese?',
      options: ['ありがとうございます (Arigatou gozaimasu)', 'すみません (Sumimasen)', 'どういたしまして (Douitashimashite)', 'はじめまして (Hajimemashite)'],
      answerIndex: 0,
      explanation: 'ありがとうございます (Arigatou gozaimasu) means "Thank you very much".'
    },
    {
      id: 'ja-ex-08',
      question: 'What does "すみません" (Sumimasen) mean in Japanese?',
      options: ['Hello', 'Excuse me / Sorry', 'Goodbye', 'Good night'],
      answerIndex: 1,
      explanation: 'Sumimasen is used for "Excuse me" (getting attention) or "Sorry" (mild apology).'
    },
    {
      id: 'ja-ex-09',
      question: 'Which particle marks the topic of a Japanese sentence?',
      options: ['は (wa)', 'が (ga)', 'を (o)', 'に (ni)'],
      answerIndex: 0,
      explanation: 'は (written as ha, pronounced wa) is the topic marker.'
    },
    {
      id: 'ja-ex-10',
      question: 'Which particle marks the direct object of a verb in Japanese?',
      options: ['は (wa)', 'が (ga)', 'を (o)', 'で (de)'],
      answerIndex: 2,
      explanation: 'を (written as wo, pronounced o) indicates the direct object.'
    },
    {
      id: 'ja-ex-11',
      question: 'Which particle indicates the location of an action (i.e. "at" or "in" a place)?',
      options: ['に (ni)', 'で (de)', 'へ (he)', 'は (wa)'],
      answerIndex: 1,
      explanation: 'で (de) is used to mark the location where an action takes place.'
    },
    {
      id: 'ja-ex-12',
      question: 'What is the Japanese word for the general counter "One object"?',
      options: ['一人 (Hitori)', '一つ (Hitotsu)', '一本 (Ippon)', '一枚 (Ichimai)'],
      answerIndex: 1,
      explanation: '一つ (Hitotsu) is the general counter for one object.'
    },
    {
      id: 'ja-ex-13',
      question: 'What counter is used when counting people?',
      options: ['つ (tsu)', '枚 (mai)', '人 (nin / ri)', '本 (hon)'],
      answerIndex: 2,
      explanation: '人 (nin, or ri for 1 and 2 people) is the counter for humans.'
    },
    {
      id: 'ja-ex-14',
      question: 'Which counter is used for flat, thin items like sheets of paper or tickets?',
      options: ['本 (hon)', '枚 (mai)', '台 (dai)', '個 (ko)'],
      answerIndex: 1,
      explanation: '枚 (mai) is the counter for flat objects.'
    },
    {
      id: 'ja-ex-15',
      question: 'What phrase do Japanese people say before eating a meal to express gratitude?',
      options: ['ごちそうさまでした (Gochisousamadeshita)', 'いただきます (Itadakimasu)', 'おいしいです (Oishii desu)', 'すみません (Sumimasen)'],
      answerIndex: 1,
      explanation: 'いただきます (Itadakimasu) means "I humbly receive" and is said before eating.'
    },
    {
      id: 'ja-ex-16',
      question: 'What is said after finishing a meal to thank the host/chef?',
      options: ['いただきます (Itadakimasu)', 'ごちそうさまでした (Gochisousamadeshita)', 'おいしかったです (Oishikatta desu)', 'お会計お願いします (Okaikei onegaishimasu)'],
      answerIndex: 1,
      explanation: 'ごちそうさまでした (Gochisousamadeshita) means "It was a feast / Thank you for the meal".'
    },
    {
      id: 'ja-ex-17',
      question: 'What does "おすすめは何ですか" (Osusume wa nan desu ka) mean?',
      options: ['How much is it?', 'What do you recommend?', 'Where is the restroom?', 'Is this spicy?'],
      answerIndex: 1,
      explanation: 'おすすめ (Osusume) means recommendation.'
    },
    {
      id: 'ja-ex-18',
      question: 'Which Kanji represents "Sun" or "Day"?',
      options: ['月', '水', '火', '日'],
      answerIndex: 3,
      explanation: '日 (Nichi/Hi) is Sun or Day.'
    },
    {
      id: 'ja-ex-19',
      question: 'Which Kanji represents "Water"?',
      options: ['木', '水', '金', '土'],
      answerIndex: 1,
      explanation: '水 (Mizu/Sui) represents Water.'
    },
    {
      id: 'ja-ex-20',
      question: 'What is the common business phrase meaning "Thank you for your hard work"?',
      options: ['はじめまして (Hajimemashite)', 'お疲れ様です (Otsukaresama desu)', 'すみません (Sumimasen)', '失礼します (Shitsurei shimasu)'],
      answerIndex: 1,
      explanation: 'お疲れ様です (Otsukaresama desu) is the fundamental workplace greeting.'
    },
    {
      id: 'ja-ex-21',
      question: 'Which verb form is used to connect multiple actions in a sequence or make polite requests?',
      options: ['Dictionary form', 'Te-form (て形)', 'Masu-form', 'Nai-form'],
      answerIndex: 1,
      explanation: 'The te-form (e.g. okite, tabete) connects verbs or links to "kudasai" for requests.'
    },
    {
      id: 'ja-ex-22',
      question: 'What does "かわいい" (Kawaii) mean?',
      options: ['Scary', 'Cute / Adorable', 'Delicious', 'Amazing'],
      answerIndex: 1,
      explanation: 'かわいい (Kawaii) translates to "Cute" or "Pretty".'
    },
    {
      id: 'ja-ex-23',
      question: 'What does "すごい" (Sugoi) mean?',
      options: ['Terrible', 'Cute', 'Awesome / Amazing / Great', 'Boring'],
      answerIndex: 2,
      explanation: 'すごい (Sugoi) means "Amazing", "Awesome", or "Wow".'
    },
    {
      id: 'ja-ex-24',
      question: 'What does "上司" (Jooshi) mean in Japanese work culture?',
      options: ['Colleague', 'Boss / Superior', 'Client', 'Secretary'],
      answerIndex: 1,
      explanation: '上司 (Jooshi) means Boss or Superior.'
    },
    {
      id: 'ja-ex-25',
      question: 'What does "残業" (Zangyou) mean?',
      options: ['Paid leave', 'Business trip', 'Overtime work', 'Retirement'],
      answerIndex: 2,
      explanation: '残業 (Zangyou) refers to overtime work.'
    },
        {
      id: 'ja-ex-26',
      question: 'What is the Japanese word for cherry blossoms?',
      options: ['晴れ (Hare)', '雨 (Ame)', '暑い (Atsui)', '桜 (Sakura)'],
      answerIndex: 3,
      explanation: '桜 (Sakura) is cherry blossom in Japanese.'
    },
    {
      id: 'ja-ex-27',
      question: 'What is the Japanese word for the hot spring changing room?',
      options: ['温泉 (Onsen)', '湯 (Yu)', '浴衣 (Yukata)', '脱衣所 (Datsuijo)'],
      answerIndex: 3,
      explanation: '脱衣所 (Datsuijo) is the changing room at an Onsen.'
    },
    {
      id: 'ja-ex-28',
      question: 'How is "McDonald\'s" pronounced in Katakana?',
      options: ['マクドナルド (Makudonarudo)', 'コーヒー (Koohii)', 'テレビ (Terebi)', 'パソコン (Pasokon)'],
      answerIndex: 0,
      explanation: 'マクドナルド (Makudonarudo) is the Japanese loanword phonetics for McDonald\'s.'
    },
    {
      id: 'ja-ex-29',
      question: 'What does the general bowing of the head signify in Japan?',
      options: ['Anger', 'Respect, greetings, and apologies', 'Sleepiness', 'Refusal'],
      answerIndex: 1,
      explanation: 'Bowing represents respect, greetings, and showing polite apologies/gratitude.'
    },
    {
      id: 'ja-ex-30',
      question: 'Which script represents Chinese characters adapted for Japanese spelling?',
      options: ['Katakana', 'Hiragana', 'Kanji', 'Romaji'],
      answerIndex: 2,
      explanation: 'Kanji (漢字) are the logographic Chinese characters used in Japanese.'
    }
  ],
  french: [
    {
      id: 'fr-ex-01',
      question: 'What does the French vowel combination "eau" sound like?',
      options: ['/oo/ as in spoon', '/o/ as in oh', '/ow/ as in cow', '/uh/ as in run'],
      answerIndex: 1,
      explanation: '"eau" (and "au") is pronounced as a closed /o/ sound (like the letter "o" in English).'
    },
    {
      id: 'fr-ex-02',
      question: 'Which vowel sound is nasal in French?',
      options: ['ou', 'en / an', 'oi', 'ai'],
      answerIndex: 1,
      explanation: '"en" and "an" are pronounced as nasalized vowels.'
    },
    {
      id: 'fr-ex-03',
      question: 'What is standard French telephone/door greeting meaning "Hello"?',
      options: ['Au revoir', 'Bonjour', 'Bonsoir', 'Enchanté'],
      answerIndex: 1,
      explanation: 'Bonjour is standard for Hello/Good day.'
    },
    {
      id: 'fr-ex-04',
      question: 'Which pronoun represents "you" in formal or plural situations in French?',
      options: ['tu', 'il', 'vous', 'nous'],
      answerIndex: 2,
      explanation: 'vous is the formal singular "you" and the plural "you".'
    },
    {
      id: 'fr-ex-05',
      question: 'What does "Enchanté(e)" mean?',
      options: ['Goodbye', 'Pleased to meet you', 'How are you?', 'Thank you'],
      answerIndex: 1,
      explanation: 'Enchanté(e) means "delighted" or "pleased to meet you".'
    },
    {
      id: 'fr-ex-06',
      question: 'What is the grammatical gender of the noun "livre" (book)?',
      options: ['Feminine', 'Masculine', 'Neutral', 'Plural only'],
      answerIndex: 1,
      explanation: 'Book is masculine: "le livre" or "un livre".'
    },
    {
      id: 'fr-ex-07',
      question: 'What is the grammatical gender of the noun "maison" (house)?',
      options: ['Masculine', 'Feminine', 'Neutral', 'Dynamic'],
      answerIndex: 1,
      explanation: 'House is feminine: "la maison" or "une maison".'
    },
    {
      id: 'fr-ex-08',
      question: 'How do you say "I speak" in French present tense?',
      options: ['Je parlons', 'Je parle', 'Tu parles', 'Il parle'],
      answerIndex: 1,
      explanation: 'Je conjugation for -er verbs ends in -e: "Je parle".'
    },
    {
      id: 'fr-ex-09',
      question: 'What is the irregular French verb for "to be"?',
      options: ['avoir', 'faire', 'être', 'aller'],
      answerIndex: 2,
      explanation: 'être is "to be"; avoir is "to have".'
    },
    {
      id: 'fr-ex-10',
      question: 'How do you say "I have" in French?',
      options: ['Je suis', 'J\'ai', 'Tu as', 'Nous avons'],
      answerIndex: 1,
      explanation: 'avoir conjugations: J\'ai (I have).'
    },
    {
      id: 'fr-ex-11',
      question: 'How do you politely ask for the check/bill in a French restaurant?',
      options: ['Je voudrais commander', 'L\'addition, s\'il vous plaît', 'La carte, s\'il vous plaît', 'Une carafe d\'eau'],
      answerIndex: 1,
      explanation: 'L\'addition means the bill; "L\'addition s\'il vous plaît" asks for the bill.'
    },
    {
      id: 'fr-ex-12',
      question: 'What does "une carafe d\'eau" mean?',
      options: ['A bottle of wine', 'A jug of tap water', 'A cup of coffee', 'A sparkling water'],
      answerIndex: 1,
      explanation: 'A carafe d\'eau is a jug of tap water, which is free in French restaurants.'
    },
    {
      id: 'fr-ex-13',
      question: 'What is the feminine form of the adjective "petit" (small)?',
      options: ['petits', 'petite', 'petites', 'petit'],
      answerIndex: 1,
      explanation: 'We add a silent -e to make "petit" feminine: "petite".'
    },
    {
      id: 'fr-ex-14',
      question: 'What is the plural form of the masculine adjective "intéressant" (interesting)?',
      options: ['intéressante', 'intéressantes', 'intéressants', 'intéressant'],
      answerIndex: 2,
      explanation: 'We add -s to the masculine base: "intéressants".'
    },
    {
      id: 'fr-ex-15',
      question: 'What is the feminine form of the adjective "beau" (beautiful)?',
      options: ['beaux', 'belle', 'belles', 'bon'],
      answerIndex: 1,
      explanation: 'The adjective "beau" has an irregular feminine form: "belle".'
    },
    {
      id: 'fr-ex-16',
      question: 'How do you ask "How much does it cost?" in French?',
      options: ['Où est le magasin?', 'Combien ça coûte?', 'C\'est cher', 'Je cherche...'],
      answerIndex: 1,
      explanation: 'Combien ça coûte? translates to "How much does it cost?".'
    },
    {
      id: 'fr-ex-17',
      question: 'What does "Je cherche..." mean?',
      options: ['I am buying', 'I am looking for...', 'I am paying', 'I am returning'],
      answerIndex: 1,
      explanation: 'Je cherche means "I am looking for" or "I search".'
    },
    {
      id: 'fr-ex-18',
      question: 'What is the national motto of France?',
      options: ['Veni, vidi, vici', 'Liberté, Égalité, Fraternité', 'Carpe Diem', 'E Pluribus Unum'],
      answerIndex: 1,
      explanation: 'Liberté, Égalité, Fraternité (Liberty, Equality, Fraternity) is the official motto.'
    },
    {
      id: 'fr-ex-19',
      question: 'What is the name of the famous, massive art museum in Paris?',
      options: ['Orsay', 'Le Louvre', 'Pompidou', 'Versailles'],
      answerIndex: 1,
      explanation: 'Le Louvre is the world\'s largest art museum and a historic monument in Paris.'
    },
    {
      id: 'fr-ex-20',
      question: 'What is the French number "Eighty" (80) literally translated as?',
      options: ['Eighty', 'Four twenties (quatre-vingts)', 'Sixty-ten', 'Eight tens'],
      answerIndex: 1,
      explanation: '80 in French is "quatre-vingts" which literally means "four-twenties" (4 x 20).'
    },
    {
      id: 'fr-ex-21',
      question: 'Which mood is used in French to express doubt, wishes, necessity, or subjective emotions?',
      options: ['Indicative', 'Conditional', 'Subjunctive (Subjonctif)', 'Imperative'],
      answerIndex: 2,
      explanation: 'The Subjunctive mood expresses subjective emotions, desires, doubts, or necessities.'
    },
    {
      id: 'fr-ex-22',
      question: 'How do you say "It is delicious" in French?',
      options: ['C\'est mauvais', 'C\'est délicieux!', 'C\'est cher', 'S\'il vous plaît'],
      answerIndex: 1,
      explanation: 'C\'est délicieux translates to "It is delicious".'
    },
    {
      id: 'fr-ex-23',
      question: 'What is the informal cheek kissing greeting in France called?',
      options: ['Le baiser', 'La bise', 'Liaison', 'Salutation'],
      answerIndex: 1,
      explanation: 'La bise is the traditional custom of greeting with light cheek touches/kisses.'
    },
    {
      id: 'fr-ex-24',
      question: 'Which pronoun represents "we" in French?',
      options: ['ils', 'je', 'vous', 'nous'],
      answerIndex: 3,
      explanation: 'nous means "we".'
    },
    {
      id: 'fr-ex-25',
      question: 'How do you write "a beautiful day" in French?',
      options: ['un beau jour', 'une belle jour', 'un bon jour', 'un vieux jour'],
      answerIndex: 0,
      explanation: '"jour" is masculine; requires "beau".'
    },
        {
      id: 'fr-ex-26',
      question: 'How do you say "It is raining" in French?',
      options: ['Il fait beau', 'Il pleut', 'Chaud', 'Froid'],
      answerIndex: 1,
      explanation: 'Il pleut means "It is raining" in French.'
    },
    {
      id: 'fr-ex-27',
      question: 'What is the French word for the restaurant bill/check?',
      options: ['Un café', 'Un croissant', "L'addition", 'Terrasse'],
      answerIndex: 2,
      explanation: "L'addition is the restaurant bill in French."
    },
    {
      id: 'fr-ex-28',
      question: 'How do you say "Goodbye" in French?',
      options: ['Bonjour', 'Bonsoir', 'Au revoir', 'Merci'],
      answerIndex: 2,
      explanation: 'Au revoir is the standard way to say "Goodbye".'
    },
    {
      id: 'fr-ex-29',
      question: 'What represents the French word for water?',
      options: ['lait', 'vin', 'eau', 'pain'],
      answerIndex: 2,
      explanation: 'eau translates to water.'
    },
    {
      id: 'fr-ex-30',
      question: 'Which ending represents the regular verb class containing "parler"?',
      options: ['-ir', '-re', '-er', '-oir'],
      answerIndex: 2,
      explanation: 'parler is a regular -er verb class.'
    }
  ],
  spanish: [
    {
      id: 'es-ex-01',
      question: 'How is the double "LL" generally pronounced in standard Spanish?',
      options: ['Like "L"', 'Like "Y" or "J"', 'Like "H"', 'It is silent'],
      answerIndex: 1,
      explanation: 'In standard Spanish, "LL" sounds like the English "Y" sound (e.g. calle = kah-yeh).'
    },
    {
      id: 'es-ex-02',
      question: 'What sound does the letter "ñ" make in Spanish?',
      options: ['Like "N"', 'Like "NY" in canyon', 'Like "NG"', 'Like "M"'],
      answerIndex: 1,
      explanation: 'The tilde letter ñ represents the palatal nasal sound, similar to "ny" in English.'
    },
    {
      id: 'es-ex-03',
      question: 'Is the letter "H" pronounced in Spanish words?',
      options: ['Yes, like English H', 'No, it is always silent', 'Only at the beginning of words', 'Only between vowels'],
      answerIndex: 1,
      explanation: 'The letter H is completely silent in Spanish (e.g. hola is pronounced oh-lah).'
    },
    {
      id: 'es-ex-04',
      question: 'What is the basic greeting meaning "Hello" in Spanish?',
      options: ['Adiós', 'Hola', 'Gracias', 'De nada'],
      answerIndex: 1,
      explanation: 'Hola is Hello.'
    },
    {
      id: 'es-ex-05',
      question: 'How do you say "Good morning" in Spanish?',
      options: ['Buenas noches', 'Buenas tardes', 'Buenos días', 'Hola'],
      answerIndex: 2,
      explanation: 'Buenos días is Good morning.'
    },
    {
      id: 'es-ex-06',
      question: 'Which verb "to be" is used for permanent characteristics, origin, and professions?',
      options: ['estar', 'ser', 'haber', 'tener'],
      answerIndex: 1,
      explanation: 'ser is used for DOCTOR (Description, Occupation, Characteristic, Time, Origin, Relation).'
    },
    {
      id: 'es-ex-07',
      question: 'Which verb "to be" is used for temporary states, emotions, and geographic location?',
      options: ['ser', 'estar', 'hacer', 'ir'],
      answerIndex: 1,
      explanation: 'estar is used for PLACE (Position, Location, Action, Condition, Emotion).'
    },
    {
      id: 'es-ex-08',
      question: 'How do you express "I am tired" in Spanish?',
      options: ['Soy cansado', 'Estoy cansado', 'Tengo cansado', 'Hago cansado'],
      answerIndex: 1,
      explanation: 'Tiredness is a temporary condition, so we use estar: "Estoy cansado".'
    },
    {
      id: 'es-ex-09',
      question: 'How do you express "I am from Spain" in Spanish?',
      options: ['Estoy de España', 'Soy de España', 'Tengo de España', 'Vivo de España'],
      answerIndex: 1,
      explanation: 'Origin uses the verb ser: "Soy de España".'
    },
    {
      id: 'es-ex-10',
      question: 'What is the Spanish word for "One" (1)?',
      options: ['dos', 'tres', 'uno', 'cuatro'],
      answerIndex: 2,
      explanation: 'uno is 1.'
    },
    {
      id: 'es-ex-11',
      question: 'What is the Spanish word for "One hundred" (100)?',
      options: ['diez', 'cien', 'mil', 'millón'],
      answerIndex: 1,
      explanation: 'cien is 100.'
    },
    {
      id: 'es-ex-12',
      question: 'What is the present tense "Yo" (I) conjugation for the regular verb "hablar" (to speak)?',
      options: ['hablas', 'hablo', 'habla', 'hablan'],
      answerIndex: 1,
      explanation: 'Yo conjugation of hablar is "hablo".'
    },
    {
      id: 'es-ex-13',
      question: 'What is the present tense "Yo" (I) conjugation for the regular verb "comer" (to eat)?',
      options: ['comes', 'como', 'come', 'comemos'],
      answerIndex: 1,
      explanation: 'Yo conjugation of comer is "como".'
    },
    {
      id: 'es-ex-14',
      question: 'What is the present tense "Yo" (I) conjugation for the regular verb "vivir" (to live)?',
      options: ['vives', 'vivo', 'vive', 'vivimos'],
      answerIndex: 1,
      explanation: 'Yo conjugation of vivir is "vivo".'
    },
    {
      id: 'es-ex-15',
      question: 'Which Spanish past tense is used for completed actions in the past with a specific time frame?',
      options: ['Imperfect', 'Preterite (Pretérito Indefinido)', 'Present Perfect', 'Pluperfect'],
      answerIndex: 1,
      explanation: 'The Preterite tense is used to describe actions completed at a specific point in the past.'
    },
    {
      id: 'es-ex-16',
      question: 'How do you say "I spoke" in the preterite tense?',
      options: ['hablaba', 'hablé', 'hablo', 'habléis'],
      answerIndex: 1,
      explanation: 'Yo preterite conjugation of hablar is "hablé".'
    },
    {
      id: 'es-ex-17',
      question: 'Approximately how many countries have Spanish as their official language?',
      options: ['5', '10', 'Over 20', 'Over 50'],
      answerIndex: 2,
      explanation: 'Spanish is the official language of 21 countries across Europe, Africa, and the Americas.'
    },
    {
      id: 'es-ex-18',
      question: 'What is the Spanish word for "Doctor" or "Physician"?',
      options: ['médico / doctor', 'maestro', 'abogado', 'ingeniero'],
      answerIndex: 0,
      explanation: 'médico or doctor is the word for physician.'
    },
    {
      id: 'es-ex-19',
      question: 'What is the Spanish word for the body part "Head"?',
      options: ['brazo', 'cabeza', 'pierna', 'mano'],
      answerIndex: 1,
      explanation: 'cabeza means head.'
    },
    {
      id: 'es-ex-20',
      question: 'Which mood is triggered in Spanish by verbs of doubt, desire, emotion, or recommendation in a dependent clause?',
      options: ['Indicativo', 'Subjuntivo (Subjunctive)', 'Imperativo', 'Condicional'],
      answerIndex: 1,
      explanation: 'The Subjunctive mood expresses uncertainty, desire, emotion, and hypothetical scenarios.'
    },
    {
      id: 'es-ex-21',
      question: 'What is the meaning of the common Spanish idiom "tomar el pelo"?',
      options: ['To wash hair', 'To pull someone\'s leg / tease', 'To cut hair', 'To have a headache'],
      answerIndex: 1,
      explanation: '"tomar el pelo" means to tease or pull someone\'s leg.'
    },
    {
      id: 'es-ex-22',
      question: 'How do you politely ask for the check at a Spanish restaurant?',
      options: ['La cuenta, por favor', 'Hola, quiero comer', 'Gracias por la comida', 'Adiós, me voy'],
      answerIndex: 0,
      explanation: '"La cuenta, por favor" translates to "The bill/check, please".'
    },
    {
      id: 'es-ex-23',
      question: 'What is the Spanish word for "Friend"?',
      options: ['enemigo', 'amigo', 'hermano', 'padre'],
      answerIndex: 1,
      explanation: 'amigo is Friend.'
    },
    {
      id: 'es-ex-24',
      question: 'How do you say "Thank you" in Spanish?',
      options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
      answerIndex: 2,
      explanation: 'Gracias is Thank you.'
    },
    {
      id: 'es-ex-25',
      question: 'How do you say "Goodbye" in Spanish?',
      options: ['Adiós', 'Hola', 'Por favor', 'Buenos días'],
      answerIndex: 0,
      explanation: 'Adiós is Goodbye.'
    },
        {
      id: 'es-ex-26',
      question: 'How do you say "It is hot" in Spanish?',
      options: ['Hace frío', 'Llueve', 'Hace calor', 'Hace buen tiempo'],
      answerIndex: 2,
      explanation: 'Hace calor means "It is hot" in Spanish.'
    },
    {
      id: 'es-ex-27',
      question: 'What are the small sharing plates of food called in Spain?',
      options: ['Una ración', 'Una tapa', 'Jamón ibérico', 'Patatas bravas'],
      answerIndex: 1,
      explanation: 'Una tapa (or tapas) are the famous small sharing plates of food in Spain.'
    },
    {
      id: 'es-ex-28',
      question: 'What represents the number "two" in Spanish?',
      options: ['uno', 'dos', 'tres', 'cuatro'],
      answerIndex: 1,
      explanation: 'dos is 2.'
    },
    {
      id: 'es-ex-29',
      question: 'What is the translation of "cabeza"?',
      options: ['arm', 'leg', 'head', 'hand'],
      answerIndex: 2,
      explanation: 'cabeza is head.'
    },
    {
      id: 'es-ex-30',
      question: 'How do you conjugate "comer" in present tense for "yo" (I)?',
      options: ['como', 'comes', 'come', 'comemos'],
      answerIndex: 0,
      explanation: 'Yo conjugation of comer is como.'
    }
  ],
  chinese: [
    {
      id: 'zh-ex-01',
      question: 'How many main spoken tones are there in standard Mandarin Chinese?',
      options: ['3 tones', '4 tones plus a neutral tone', '5 spoken tones plus high tone', '6 distinct tones'],
      answerIndex: 1,
      explanation: 'Mandarin has 4 main tones (flat, rising, falling-rising, falling) and one neutral tone.'
    },
    {
      id: 'zh-ex-02',
      question: 'What is the name of the official Romanization system used to write Chinese characters phonetically?',
      options: ['Hanyu Pinyin', 'Hanja', 'Kanji', 'Romaji'],
      answerIndex: 0,
      explanation: 'Pinyin (拼音) is the standardized system of Romanized Chinese pronunciation.'
    },
    {
      id: 'zh-ex-03',
      question: 'How do you write the basic greeting "Hello" in Chinese Pinyin?',
      options: ['Xièxie', 'Nǐ hǎo', 'Zàijiàn', 'Měilì'],
      answerIndex: 1,
      explanation: 'Nǐ hǎo (你好) translates to Hello.'
    },
    {
      id: 'zh-ex-04',
      question: 'How do you say "Thank you" in Mandarin Chinese?',
      options: ['Nǐ hǎo', 'Xièxie', 'Zàijiàn', 'Bù kèqi'],
      answerIndex: 1,
      explanation: 'Xièxie (谢谢) means Thank you.'
    },
    {
      id: 'zh-ex-05',
      question: 'What is the correct flat, first tone for the pinyin syllable "ma" when it means "Mother"?',
      options: ['mā', 'má', 'mǎ', 'mà'],
      answerIndex: 0,
      explanation: 'mā (first tone) is Mother; má is hemp; mǎ is horse; mà is scold.'
    },
    {
      id: 'zh-ex-06',
      question: 'What are the semantic building blocks of Chinese characters called?',
      options: ['Pinyin initials', 'Strokes', 'Radicals (部首)', 'Tones'],
      answerIndex: 2,
      explanation: 'Radicals indicate the general meaning category of a Chinese character.'
    },
    {
      id: 'zh-ex-07',
      question: 'Which radical representing "Water" is commonly written as three dots (氵) on the left side of a character?',
      options: ['火 (Fire)', '人 (Person)', '氵(Water)', '木 (Wood)'],
      answerIndex: 2,
      explanation: 'The three-dots radical (氵) represents water (e.g. in river, lake).'
    },
    {
      id: 'zh-ex-08',
      question: 'What does the radical "火" represent?',
      options: ['Water', 'Wood', 'Fire', 'Metal'],
      answerIndex: 2,
      explanation: '火 (huǒ) represents Fire.'
    },
    {
      id: 'zh-ex-09',
      question: 'What does the radical "人" represent?',
      options: ['Mouth', 'Person / Human', 'Earth', 'Sun'],
      answerIndex: 1,
      explanation: '人 (rén) represents Person or Human.'
    },
    {
      id: 'zh-ex-10',
      question: 'What is the Mandarin word for the number "One" (1)?',
      options: ['yī (一)', 'èr (二)', 'sān (三)', 'shí (十)'],
      answerIndex: 0,
      explanation: 'yī is one.'
    },
    {
      id: 'zh-ex-11',
      question: 'What is the Mandarin word for the number "Ten" (10)?',
      options: ['èr (二)', 'shí (十)', 'bǎi (百)', 'yī (一)'],
      answerIndex: 1,
      explanation: 'shí is ten.'
    },
    {
      id: 'zh-ex-12',
      question: 'What is the Mandarin word for "Hundred" (100)?',
      options: ['shí (十)', 'bǎi (百)', 'qiān (千)', 'wàn (万)'],
      answerIndex: 1,
      explanation: 'bǎi means hundred.'
    },
    {
      id: 'zh-ex-13',
      question: 'How do you say the date "January 1st" in Chinese?',
      options: ['yī yuè yī rì (一月一日)', 'shí yuè yī rì', 'èr yuè èr rì', 'yī nián yī yuè'],
      answerIndex: 0,
      explanation: 'Dates follow the order: Year + Month (yuè) + Day (rì/hào). So Jan 1st is yī yuè yī rì.'
    },
    {
      id: 'zh-ex-14',
      question: 'What is the Chinese word for "Today"?',
      options: ['míngtiān', 'jīntiān (今天)', 'zuótiān', 'qiántiān'],
      answerIndex: 1,
      explanation: 'jīntiān means today; míngtiān means tomorrow.'
    },
    {
      id: 'zh-ex-15',
      question: 'What is the basic sentence word order of Mandarin Chinese?',
      options: ['Subject-Object-Verb (SOV)', 'Subject-Verb-Object (SVO)', 'Verb-Subject-Object (VSO)', 'Object-Subject-Verb (OSV)'],
      answerIndex: 1,
      explanation: 'Chinese follows the Subject-Verb-Object (SVO) order, similar to English.'
    },
    {
      id: 'zh-ex-16',
      question: 'What grammatical category is required in Chinese when counting nouns (acting as classifiers)?',
      options: ['Particles', 'Measure Words (量词)', 'Auxiliary verbs', 'Conjunctions'],
      answerIndex: 1,
      explanation: 'Chinese requires measure words (量词) between a number and a noun.'
    },
    {
      id: 'zh-ex-17',
      question: 'What is the most common, general measure word used in Chinese?',
      options: ['gè (个)', 'běn (本)', 'zhī (只)', 'jiān (间)'],
      answerIndex: 0,
      explanation: 'gè (个) is the most widely used general measure word.'
    },
    {
      id: 'zh-ex-18',
      question: 'Which measure word is specifically used for books or bound documents?',
      options: ['gè (个)', 'běn (本)', 'zhī (只)', 'tiáo (条)'],
      answerIndex: 1,
      explanation: 'běn (本) is the classifier for books (e.g. yī běn shū = one book).'
    },
    {
      id: 'zh-ex-19',
      question: 'How do you say "This" in Mandarin?',
      options: ['zhè (这)', 'nà (那)', 'shí (十)', 'yī (一)'],
      answerIndex: 0,
      explanation: 'zhè means this; nà means that.'
    },
    {
      id: 'zh-ex-20',
      question: 'How do you say "That" in Mandarin?',
      options: ['zhè (这)', 'nà (那)', 'gè (个)', 'shí (十)'],
      answerIndex: 1,
      explanation: 'nà means that.'
    },
    {
      id: 'zh-ex-21',
      question: 'What are the red envelopes containing money given during Chinese New Year called?',
      options: ['Jiǎozi', 'Hóngbāo (红包)', 'Chá', 'Chūn节'],
      answerIndex: 1,
      explanation: 'hóngbāo (红包) are red packets containing gift money.'
    },
    {
      id: 'zh-ex-22',
      question: 'What is the Chinese New Year festival officially known as?',
      options: ['Lantern Festival', 'Spring Festival (春节)', 'Mid-Autumn Festival', 'Dragon Boat Festival'],
      answerIndex: 1,
      explanation: 'Chinese New Year is officially called the Spring Festival (春节 Chūnjié).'
    },
    {
      id: 'zh-ex-23',
      question: 'What is the Chinese word for traditional dumplings?',
      options: ['jiǎozi (饺子)', 'bāozi', 'miàntiáo', 'mǐfàn'],
      answerIndex: 0,
      explanation: 'jiǎozi represents dumplings, traditionally eaten during Spring Festival.'
    },
    {
      id: 'zh-ex-24',
      question: 'What is the Chinese word for "Tea"?',
      options: ['kāfēi', 'chá (茶)', 'shǔi', 'jiǔ'],
      answerIndex: 1,
      explanation: 'chá is tea.'
    },
    {
      id: 'zh-ex-25',
      question: 'How do you ask "How much money?" in a Chinese market?',
      options: ['duōshǎo qián? (多少钱)', 'tài guì le', 'piányi yīdiǎn', 'mǎidān'],
      answerIndex: 0,
      explanation: 'duōshǎo (how much) + qián (money) asks for the price.'
    },
        {
      id: 'zh-ex-26',
      question: 'What is the Chinese word for "To rain"?',
      options: ['晴天 (Qíngtiān)', '下雨 (Xià yǔ)', '热 (Rè)', '冷 (Lěng)'],
      answerIndex: 1,
      explanation: '下雨 (Xià yǔ) is "to rain" in Chinese.'
    },
    {
      id: 'zh-ex-27',
      question: 'What is the Chinese word for "Tea"?',
      options: ['茶 (Chá)', '绿茶 (Lǜchá)', '泡茶 (Pào chá)', '谢谢 (Xièxiè)'],
      answerIndex: 0,
      explanation: '茶 (Chá) is tea in Chinese.'
    },
    {
      id: 'zh-ex-28',
      question: 'How do you call for the check/bill in a restaurant in China?',
      options: ['mǎidān (买单)', 'huānyíng', 'xièxie', 'nǐ hǎo'],
      answerIndex: 0,
      explanation: 'mǎidān is the phrase used to ask for the bill.'
    },
    {
      id: 'zh-ex-29',
      question: 'How do you say "Welcome" in Mandarin?',
      options: ['huānyíng (欢迎)', 'zàijiàn', 'xie xie', 'bù kèqi'],
      answerIndex: 0,
      explanation: 'huānyíng translates to Welcome.'
    },
    {
      id: 'zh-ex-30',
      question: 'What does the wood radical "木" represent?',
      options: ['Water', 'Fire', 'Wood / Tree', 'Metal'],
      answerIndex: 2,
      explanation: '木 (mù) represents wood or tree.'
    }
  ],
  vietnamese: [
    {
      id: 'vi-ex-01',
      question: 'How many spoken tones are there in the Vietnamese language?',
      options: ['4 tones', '5 tones', '6 tones', '8 tones'],
      answerIndex: 2,
      explanation: 'Vietnamese is a highly tonal language with exactly 6 tones.'
    },
    {
      id: 'vi-ex-02',
      question: 'What is the name of the Latin-based script used for modern written Vietnamese?',
      options: ['Chữ Nôm', 'Chữ Quốc Ngữ', 'Hán tự', 'Romaji'],
      answerIndex: 1,
      explanation: 'Chữ Quốc Ngữ is the Latin script with diacritics created by missionaries and popularized in the 20th century.'
    },
    {
      id: 'vi-ex-03',
      question: 'What is the standard, polite way to say "Hello" in Vietnamese?',
      options: ['Tạm biệt', 'Xin chào', 'Cám ơn', 'Không có gì'],
      answerIndex: 1,
      explanation: 'Xin chào is the general greeting for Hello.'
    },
    {
      id: 'vi-ex-04',
      question: 'How do you say "Thank you" in Vietnamese?',
      options: ['Xin chào', 'Cám ơn', 'Xin lỗi', 'Không có gì'],
      answerIndex: 1,
      explanation: 'Cám ơn translates to Thank you.'
    },
    {
      id: 'vi-ex-05',
      question: 'What is the Vietnamese phrase for "You\'re welcome" or "No problem"?',
      options: ['Xin chào', 'Cám ơn', 'Không có gì', 'Tạm biệt'],
      answerIndex: 2,
      explanation: 'Không có gì literally means "Nothing at all" or "You\'re welcome".'
    },
    {
      id: 'vi-ex-06',
      question: 'What is the famous national Vietnamese noodle soup?',
      options: ['Phở', 'Bánh mì', 'Cà phê', 'Bún chả'],
      answerIndex: 0,
      explanation: 'Phở is the famous Vietnamese noodle soup served with beef (phở bò) or chicken (phở gà).'
    },
    {
      id: 'vi-ex-07',
      question: 'What does "Bánh mì" mean?',
      options: ['Noodle salad', 'Vietnamese sandwich / bread', 'Spring roll', 'Rice cake'],
      answerIndex: 1,
      explanation: 'Bánh mì is the iconic Vietnamese baguette sandwich.'
    },
    {
      id: 'vi-ex-08',
      question: 'What is the Vietnamese word for Coffee?',
      options: ['Trà', 'Cà phê', 'Nước', 'Sữa'],
      answerIndex: 1,
      explanation: 'Cà phê is Coffee.'
    },
    {
      id: 'vi-ex-09',
      question: 'How do you politely call a server younger than you in a Vietnamese restaurant?',
      options: ['Em ơi!', 'Anh ơi!', 'Chị ơi!', 'Bạn ơi!'],
      answerIndex: 0,
      explanation: 'Em ơi is used to call servers who are younger (male or female).'
    },
    {
      id: 'vi-ex-10',
      question: 'What is the Vietnamese word for the number "One" (1)?',
      options: ['hai', 'ba', 'một', 'mười'],
      answerIndex: 2,
      explanation: 'một is 1.'
    },
    {
      id: 'vi-ex-11',
      question: 'What is the Vietnamese word for the number "Ten" (10)?',
      options: ['một', 'mười', 'trăm', 'hai'],
      answerIndex: 1,
      explanation: 'mười is 10.'
    },
    {
      id: 'vi-ex-12',
      question: 'What is the Vietnamese word for "Hundred" (100)?',
      options: ['mười', 'trăm', 'ngàn', 'triệu'],
      answerIndex: 1,
      explanation: 'trăm is hundred.'
    },
    {
      id: 'vi-ex-13',
      question: 'What is the basic word order of a Vietnamese sentence?',
      options: ['Subject-Object-Verb (SOV)', 'Subject-Verb-Object (SVO)', 'Verb-Subject-Object (VSO)', 'Object-Subject-Verb (OSV)'],
      answerIndex: 1,
      explanation: 'Like English, Vietnamese sentences follow the SVO structure.'
    },
    {
      id: 'vi-ex-14',
      question: 'What is the Vietnamese word for Student?',
      options: ['Học sinh / Sinh viên', 'Giáo viên', 'Bác sĩ', 'Kỹ sư'],
      answerIndex: 0,
      explanation: 'Học sinh (school student) or Sinh viên (university student) means student.'
    },
    {
      id: 'vi-ex-15',
      question: 'What is the major Vietnamese Lunar New Year festival called?',
      options: ['Tết (Tết Nguyên Đán)', 'Trung Thu', 'Lễ Phật Đản', 'Giáng Sinh'],
      answerIndex: 0,
      explanation: 'Tết is the most important national holiday celebrating the Lunar New Year.'
    },
    {
      id: 'vi-ex-16',
      question: 'What is the Vietnamese word for "Market"?',
      options: ['Chùa', 'Chợ', 'Nhà', 'Đường'],
      answerIndex: 1,
      explanation: 'Chợ translates to Market.'
    },
    {
      id: 'vi-ex-17',
      question: 'How do you ask "How much money?" / "How much does it cost?" in Vietnamese?',
      options: ['Bao nhiêu tiền?', 'Đắt quá!', 'Giảm giá đi!', 'Cái này gì?'],
      answerIndex: 0,
      explanation: 'Bao nhiêu (how much) + tiền (money) is the question for cost.'
    },
    {
      id: 'vi-ex-18',
      question: 'How do you say "Too expensive!" in Vietnamese?',
      options: ['Rẻ quá!', 'Bao nhiêu tiền', 'Đắt quá! / Mắc quá!', 'Không mua'],
      answerIndex: 2,
      explanation: 'Đắt quá or Mắc quá translates to "Too expensive!".'
    },
    {
      id: 'vi-ex-19',
      question: 'How do you ask for a discount ("Reduce price please") in Vietnamese?',
      options: ['Bớt đi / Giảm giá đi!', 'Bao nhiêu', 'Đắt quá', 'Cám ơn'],
      answerIndex: 0,
      explanation: 'Bớt đi or Giảm giá đi asks the merchant to lower the price.'
    },
    {
      id: 'vi-ex-20',
      question: 'Which noun classifier is used in Vietnamese for most animals?',
      options: ['cái', 'người', 'con', 'quả'],
      answerIndex: 2,
      explanation: 'con is the classifier for animals (e.g. con chó = the dog).'
    },
    {
      id: 'vi-ex-21',
      question: 'Which noun classifier is used for inanimate physical objects?',
      options: ['con', 'cái', 'người', 'cuốn'],
      answerIndex: 1,
      explanation: 'cái is the general classifier for inanimate objects (e.g. cái bàn = the table).'
    },
    {
      id: 'vi-ex-22',
      question: 'Which classifier is used for people or professions?',
      options: ['cái', 'con', 'người', 'tờ'],
      answerIndex: 2,
      explanation: 'người is the classifier for humans (e.g. người học sinh = the student).'
    },
    {
      id: 'vi-ex-23',
      question: 'What does "đi thẳng" mean?',
      options: ['Turn left', 'Turn right', 'Go straight', 'Stop'],
      answerIndex: 2,
      explanation: 'đi thẳng means "Go straight".'
    },
    {
      id: 'vi-ex-24',
      question: 'What does "rẽ trái" mean?',
      options: ['Go straight', 'Turn left', 'Turn right', 'U-turn'],
      answerIndex: 1,
      explanation: 'rẽ trái means "Turn left".'
    },
    {
      id: 'vi-ex-25',
      question: 'What does "rẽ phải" mean?',
      options: ['Turn right', 'Turn left', 'Go straight', 'Go back'],
      answerIndex: 0,
      explanation: 'rẽ phải means "Turn right".'
    },
        {
      id: 'vi-ex-26',
      question: 'How do you say "Hot" in Vietnamese?',
      options: ['Lạnh', 'Mưa', 'Nóng', 'Nắng'],
      answerIndex: 2,
      explanation: 'Nóng is hot in Vietnamese.'
    },
    {
      id: 'vi-ex-27',
      question: 'What is the traditional filter used to brew Vietnamese coffee?',
      options: ['Cà phê sữa đá', 'Phin', 'Đắng', 'Ngọt'],
      answerIndex: 1,
      explanation: 'Phin is the traditional metal drip filter for Vietnamese coffee.'
    },
    {
      id: 'vi-ex-28',
      question: 'What is the word meaning "delicious" in Vietnamese?',
      options: ['dở', 'ngon', 'nóng', 'lạnh'],
      answerIndex: 1,
      explanation: 'ngon means delicious.'
    },
    {
      id: 'vi-ex-29',
      question: 'Which classifier is used for fruits or spherical objects?',
      options: ['con', 'cái', 'người', 'quả / trái'],
      answerIndex: 3,
      explanation: 'quả or trái is used to count fruits.'
    },
    {
      id: 'vi-ex-30',
      question: 'What is the Vietnamese translation of "Thank you"?',
      options: ['Xin chào', 'Cám ơn', 'Tạm biệt', 'Xin lỗi'],
      answerIndex: 1,
      explanation: 'Cám ơn means "Thank you".'
    }
  ],
  german: [
    {
      id: 'de-ex-01',
      question: 'Which vowel sounds like "e" in the English word "bet"?',
      options: ['ä', 'ö', 'ü', 'ß'],
      answerIndex: 0,
      explanation: 'ä (Amlaut) typically sounds like the short "e" in "bet" in standard German pronunciation.'
    },
    {
      id: 'de-ex-02',
      question: 'Which special character represents a sharp/double "s" in German?',
      options: ['ö', 'ü', 'ä', 'ß'],
      answerIndex: 3,
      explanation: 'ß (Eszett) represents a sharp s sound, pronounced like double s.'
    },
    {
      id: 'de-ex-03',
      question: 'How is the German letter "W" pronounced?',
      options: ['Like English "W"', 'Like English "V"', 'Like English "F"', 'Like English "H"'],
      answerIndex: 1,
      explanation: 'The German letter W is pronounced like English "V" (e.g., Wasser).'
    },
    {
      id: 'de-ex-04',
      question: 'How do you say "Hello" or "Good day" in German?',
      options: ['Bitte', 'Danke', 'Guten Tag', 'Auf Wiedersehen'],
      answerIndex: 2,
      explanation: 'Guten Tag is the standard German greeting for "Good day" or "Hello".'
    },
    {
      id: 'de-ex-05',
      question: 'What is the formal pronoun for "You" in German?',
      options: ['du', 'ihr', 'Sie', 'wir'],
      answerIndex: 2,
      explanation: 'Sie (capitalized) is the formal second-person pronoun used for strangers and polite address.'
    },
    {
      id: 'de-ex-06',
      question: 'How do you say "Goodbye" formally in German?',
      options: ['Hallo', 'Bitte', 'Auf Wiedersehen', 'Tschüss'],
      answerIndex: 2,
      explanation: 'Auf Wiedersehen is the formal expression for "Goodbye".'
    },
    {
      id: 'de-ex-07',
      question: 'What does the word "Bitte" mean?',
      options: ['Please', 'You\'re welcome', 'Pardon?', 'All of the above'],
      answerIndex: 3,
      explanation: 'Bitte is highly versatile and means Please, You\'re welcome, and Pardon? depending on context.'
    },
    {
      id: 'de-ex-08',
      question: 'How do you say the number "Ten" (10) in German?',
      options: ['eins', 'zwei', 'zehn', 'hundert'],
      answerIndex: 2,
      explanation: 'zehn is 10; eins is 1; zwei is 2; hundert is 100.'
    },
    {
      id: 'de-ex-09',
      question: 'How do you say the number "Twenty-one" (21) in German?',
      options: ['zwanzigeins', 'einundzwanzig', 'einszwanzig', 'zehnundzwanzig'],
      answerIndex: 1,
      explanation: 'German speaks units before tens: einundzwanzig (one and twenty = 21).'
    },
    {
      id: 'de-ex-10',
      question: 'Which word represents "Hundred" (100) in German?',
      options: ['tausend', 'zehn', 'hundert', 'eins'],
      answerIndex: 2,
      explanation: 'hundert is 100.'
    },
    {
      id: 'de-ex-11',
      question: 'How do you politely ask "How much does that cost?" in German?',
      options: ['Wie viel kostet das?', 'Zahlen, bitte', 'Die Rechnung, bitte', 'Guten Appetit'],
      answerIndex: 0,
      explanation: '"Wie viel kostet das?" translates to "How much does that cost?".'
    },
    {
      id: 'de-ex-12',
      question: 'How do you politely ask for the bill/check in a German restaurant?',
      options: ['Zahlen, bitte', 'Die Rechnung, bitte', 'Guten Appetit', 'Ich möchte bestellen'],
      answerIndex: 1,
      explanation: '"Die Rechnung, bitte" means "The bill, please".'
    },
    {
      id: 'de-ex-13',
      question: 'What is the polite phrase said to others before beginning to eat a meal?',
      options: ['Prost!', 'Guten Appetit', 'Danke', 'Bitte'],
      answerIndex: 1,
      explanation: 'Guten Appetit means "Enjoy your meal".'
    },
    {
      id: 'de-ex-14',
      question: 'What is the German word for "Train station"?',
      options: ['Gleis', 'Bahnhof', 'U-Bahn', 'Fahrkarte'],
      answerIndex: 1,
      explanation: 'Bahnhof means train station; Gleis is platform; Fahrkarte is ticket.'
    },
    {
      id: 'de-ex-15',
      question: 'Which of the following refers to a subway in Germany?',
      options: ['S-Bahn', 'U-Bahn', 'Autobahn', 'Bahnhof'],
      answerIndex: 1,
      explanation: 'U-Bahn (Untergrundbahn) refers to the subway system.'
    },
    {
      id: 'de-ex-16',
      question: 'What must you do before boarding public transit with a paper ticket in Germany?',
      options: ['Nothing', 'Sign your name', 'Validate / stamp it (entwerten)', 'Show it to the driver'],
      answerIndex: 2,
      explanation: 'You must validate/stamp (entwerten) paper tickets in validation machines before boarding.'
    },
    {
      id: 'de-ex-17',
      question: 'How many grammatical noun genders are there in German?',
      options: ['One', 'Two', 'Three', 'Four'],
      answerIndex: 2,
      explanation: 'German has three genders: masculine (der), feminine (die), and neuter (das).'
    },
    {
      id: 'de-ex-18',
      question: 'Which article corresponds to the neuter gender in German?',
      options: ['der', 'die', 'das', 'den'],
      answerIndex: 2,
      explanation: 'das is the neuter definite article.'
    },
    {
      id: 'de-ex-19',
      question: 'Which definite article is used for all plural nouns in the nominative case?',
      options: ['der', 'die', 'das', 'den'],
      answerIndex: 1,
      explanation: 'die is used for all plural nouns regardless of gender.'
    },
    {
      id: 'de-ex-20',
      question: 'What is the German word for "Father"?',
      options: ['Mutter', 'Vater', 'Sohn', 'Bruder'],
      answerIndex: 1,
      explanation: 'Vater is Father; Mutter is Mother; Sohn is Son; Bruder is Brother.'
    },
    {
      id: 'de-ex-21',
      question: 'What does the collective German word "Geschwister" mean?',
      options: ['Parents', 'Grandparents', 'Siblings', 'Children'],
      answerIndex: 2,
      explanation: 'Geschwister means siblings.'
    },
    {
      id: 'de-ex-22',
      question: 'Which famous Bavarian beer festival is held in Munich starting in September?',
      options: ['Karneval', 'Fasching', 'Oktoberfest', 'Weihnachtsmarkt'],
      answerIndex: 2,
      explanation: 'Oktoberfest is Munich\'s famous beer festival that starts in late September.'
    },
    {
      id: 'de-ex-23',
      question: 'What is the standard German word for "Cheers!" when clinking glasses?',
      options: ['Frohe Weihnachten', 'Prost!', 'Guten Appetit', 'Tschüss'],
      answerIndex: 1,
      explanation: 'Prost! is the German word for Cheers!.'
    },
    {
      id: 'de-ex-24',
      question: 'What is the correct present conjugation of "lernen" for the pronoun "er" (he)?',
      options: ['lerne', 'lernst', 'lernt', 'lernen'],
      answerIndex: 2,
      explanation: 'The singular 3rd person ending is -t, so: er lernt.'
    },
    {
      id: 'de-ex-25',
      question: 'What position does the verb take in standard German declarative main clauses?',
      options: ['1st position', '2nd position', 'Last position', 'Variable position'],
      answerIndex: 1,
      explanation: 'In a standard declarative main clause, the conjugated verb always takes the 2nd position.'
    },
    {
      id: 'de-ex-26',
      question: 'How do you say "By card, please" at a checkout counter?',
      options: ['Mit Karte, bitte', 'Bar zahlen', 'Kassenzettel', 'Tüte'],
      answerIndex: 0,
      explanation: 'Mit Karte, bitte means "By card, please".'
    },
    {
      id: 'de-ex-27',
      question: 'What is the German word for a shopping bag?',
      options: ['Kassenzettel', 'Größe', 'Tüte', 'Karte'],
      answerIndex: 2,
      explanation: 'Tüte is a shopping bag; Kassenzettel is a receipt.'
    },
    {
      id: 'de-ex-28',
      question: 'What is the German word for the popular national sport, soccer?',
      options: ['Fußball', 'Handball', 'Wandern', 'Rad fahren'],
      answerIndex: 0,
      explanation: 'Fußball is soccer.'
    },
    {
      id: 'de-ex-29',
      question: 'What does "Wandern" mean?',
      options: ['To bike', 'To swim', 'To hike', 'To run'],
      answerIndex: 2,
      explanation: 'Wandern is hiking.'
    },
    {
      id: 'de-ex-30',
      question: 'What is the traditional German social custom of having coffee and cake on Sunday afternoons called?',
      options: ['Kaffee und Kuchen', 'Bäckerei', 'Schwarzbrot', 'Brötchen'],
      answerIndex: 0,
      explanation: 'Kaffee und Kuchen (coffee and cake) is a traditional Sunday afternoon social ritual.'
    }
  ],

  filipino: [
    {
      id: 'fil-ex-01',
      question: 'Which word represents community spirit and helping one another in Filipino culture?',
      options: ['Fiesta', 'Bayanihan', 'Pasalubong', 'Bahala na'],
      answerIndex: 1,
      explanation: 'Bayanihan represents community unity and cooperative spirit, historically shown by carrying houses together.'
    },
    {
      id: 'fil-ex-02',
      question: 'What is the polite translation of "Good morning" in Filipino?',
      options: ['Magandang hapon po', 'Magandang gabi po', 'Magandang umaga po', 'Kumusta po'],
      answerIndex: 2,
      explanation: 'Magandang umaga po translates to "Good morning (polite)".'
    },
    {
      id: 'fil-ex-03',
      question: 'How do you show respect to elders at the end of sentences?',
      options: ['Using "ka"', 'Using "po" or "opo"', 'Using "ate"', 'Using "kuya"'],
      answerIndex: 1,
      explanation: 'Po and opo are respectful markers added to sentences when talking to elders or authorities.'
    },
    {
      id: 'fil-ex-04',
      question: 'What is the native Filipino number for "Five" (5)?',
      options: ['Isa', 'Dalawa', 'Tatlo', 'Lima'],
      answerIndex: 3,
      explanation: 'Lima is the number 5.'
    },
    {
      id: 'fil-ex-05',
      question: 'What does the word "Salamat" mean?',
      options: ['Goodbye', 'Please', 'Thank you', 'Yes'],
      answerIndex: 2,
      explanation: 'Salamat means "Thank you".'
    },
    {
      id: 'fil-ex-06',
      question: 'What does "Kuya" refer to in family relationships?',
      options: ['Older brother', 'Older sister', 'Grandfather', 'Uncle'],
      answerIndex: 0,
      explanation: 'Kuya is the title for an older brother.'
    },
    {
      id: 'fil-ex-07',
      question: 'What does "Ate" refer to in family relationships?',
      options: ['Older brother', 'Older sister', 'Grandmother', 'Aunt'],
      answerIndex: 1,
      explanation: 'Ate is the title for an older sister.'
    },
    {
      id: 'fil-ex-08',
      question: 'What does the dining phrase "Kain tayo!" translate to?',
      options: ['Give me water', 'Let\'s eat!', 'I am full', 'I am hungry'],
      answerIndex: 1,
      explanation: 'Kain tayo! translates directly to "Let\'s eat!".'
    },
    {
      id: 'fil-ex-09',
      question: 'What is the Filipino word for "Delicious"?',
      options: ['Masarap', 'Gutom', 'Busog', 'Ulam'],
      answerIndex: 0,
      explanation: 'Masarap means "Delicious".'
    },
    {
      id: 'fil-ex-10',
      question: 'What phrase do you call out to jeepney drivers to request a stop?',
      options: ['Bayad po!', 'Pakiabot po!', 'Para po!', 'Sakay po!'],
      answerIndex: 2,
      explanation: 'Para po! is the standard signal used to tell drivers to stop and let passengers off.'
    },
    {
      id: 'fil-ex-11',
      question: 'Which number represents the word "Sampu"?',
      options: ['1', '10', '20', '100'],
      answerIndex: 1,
      explanation: 'Sampu represents the number 10.'
    },
    {
      id: 'fil-ex-12',
      question: 'What is the Filipino word for the number "Twenty" (20)?',
      options: ['Labing-isa', 'Tatlumpu', 'Sandaan', 'Dalawampu'],
      answerIndex: 3,
      explanation: 'Dalawampu is the number 20.'
    },
    {
      id: 'fil-ex-13',
      question: 'What is the Filipino word for "One hundred" (100)?',
      options: ['Sandaan', 'Sampu', 'Dalawampu', 'Tatlumpu'],
      answerIndex: 0,
      explanation: 'Sandaan (from isang daan) is 100.'
    },
    {
      id: 'fil-ex-14',
      question: 'What is the standard title for "Mother" in a Filipino household?',
      options: ['Tatay', 'Nanay', 'Kapatid', 'Tita'],
      answerIndex: 1,
      explanation: 'Nanay (or Ina) refers to mother.'
    },
    {
      id: 'fil-ex-15',
      question: 'What is the standard title for "Father"?',
      options: ['Tatay', 'Nanay', 'Lolo', 'Tito'],
      answerIndex: 0,
      explanation: 'Tatay (or Ama) refers to father.'
    },
    {
      id: 'fil-ex-16',
      question: 'How do you say "Left" (direction) in Filipino?',
      options: ['Kanan', 'Kaliwa', 'Diretso', 'Baba'],
      answerIndex: 1,
      explanation: 'Kaliwa means left.'
    },
    {
      id: 'fil-ex-17',
      question: 'How do you say "Right" (direction) in Filipino?',
      options: ['Kanan', 'Kaliwa', 'Diretso', 'Para'],
      answerIndex: 0,
      explanation: 'Kanan means right.'
    },
    {
      id: 'fil-ex-18',
      question: 'How do you say "Go straight"?',
      options: ['Kaliwa', 'Kanan', 'Diretso', 'Para po'],
      answerIndex: 2,
      explanation: 'Diretso means straight / go straight.'
    },
    {
      id: 'fil-ex-19',
      question: 'What is the base root verb for "To eat"?',
      options: ['Inom', 'Kain', 'Punta', 'Tulog'],
      answerIndex: 1,
      explanation: 'Kain is the root word for eat.'
    },
    {
      id: 'fil-ex-20',
      question: 'What is the day of the week for Monday in Filipino?',
      options: ['Martes', 'Huwebes', 'Lunes', 'Sabado'],
      answerIndex: 2,
      explanation: 'Lunes is Monday (borrowed from Spanish).'
    },
    {
      id: 'fil-ex-21',
      question: 'What day of the week is "Linggo"?',
      options: ['Monday', 'Friday', 'Saturday', 'Sunday'],
      answerIndex: 3,
      explanation: 'Linggo means Sunday, and can also mean week depending on context.'
    },
    {
      id: 'fil-ex-22',
      question: 'What is the Filipino word for "Tomorrow"?',
      options: ['Ngayon', 'Kahapon', 'Bukas', 'Kanina'],
      answerIndex: 2,
      explanation: 'Bukas means tomorrow.'
    },
    {
      id: 'fil-ex-23',
      question: 'What is the Filipino word for "Yesterday"?',
      options: ['Ngayon', 'Kahapon', 'Bukas', 'Kanina'],
      answerIndex: 1,
      explanation: 'Kahapon means yesterday.'
    },
    {
      id: 'fil-ex-24',
      question: 'What does the question "Magkano ito?" mean?',
      options: ['What is your name?', 'Where is the banyo?', 'How much is this?', 'Where do you live?'],
      answerIndex: 2,
      explanation: 'Magkano ito? translates to "How much is this?".'
    },
    {
      id: 'fil-ex-25',
      question: 'What common jeepney bargaining request means "Only loose change in the morning"?',
      options: ['Para po sa kanto', 'Bayad po sa umaga', 'Pakiabot po ang barya', 'Barya lang po sa umaga'],
      answerIndex: 3,
      explanation: 'Barya lang po sa umaga is a standard notice asking passengers to pay with small change early in the day.'
    },
    {
      id: 'fil-ex-26',
      question: 'What season is referred to as "Tag-ulan"?',
      options: ['Dry season', 'Rainy season', 'Winter', 'Spring'],
      answerIndex: 1,
      explanation: 'Tag-ulan literally translates to rainy/monsoon season.'
    },
    {
      id: 'fil-ex-27',
      question: 'What season is "Tag-init"?',
      options: ['Rainy season', 'Stormy season', 'Dry / Hot season', 'Windy season'],
      answerIndex: 2,
      explanation: 'Tag-init (or Tag-araw) is the hot/dry season.'
    },
    {
      id: 'fil-ex-28',
      question: 'What does the adjective "Maganda" mean?',
      options: ['Big', 'Beautiful', 'Kind', 'Fast'],
      answerIndex: 1,
      explanation: 'Maganda means beautiful.'
    },
    {
      id: 'fil-ex-29',
      question: 'What does "Mabait" mean when describing a person?',
      options: ['Beautiful', 'Shameless', 'Kind / Good-natured', 'Born rich'],
      answerIndex: 2,
      explanation: 'Mabait means kind, friendly, or well-behaved.'
    },
    {
      id: 'fil-ex-30',
      question: 'What does the idiomatic expression "Bukas ang palad" mean?',
      options: ['Sensitive', 'Shameless', 'Generous', 'Almost impossible'],
      answerIndex: 2,
      explanation: 'Bukas ang palad (lit. open palm) means generous or helpful.'
    }
  ]
};

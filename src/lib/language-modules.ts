
export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'culture' | 'pronunciation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // e.g. "10 min"
  content: {
    intro: string;
    keyPhrases: { native: string; romanized?: string; english: string }[];
    tips: string[];
    practice: string;
  };
}

export interface LanguageModule {
  id: string;
  language: string;
  flag: string;
  color: string;
  gradient: string;
  lessons: Lesson[];
}

export const languageModules: LanguageModule[] = [
  {
    id: 'thai',
    language: 'Thai',
    flag: '🇹🇭',
    color: '#1a56db',
    gradient: 'from-blue-600 to-red-500',
    lessons: [
      {
        id: 'th-01', title: 'Thai Alphabet Basics', description: 'Learn the foundation of Thai consonants and vowels', type: 'pronunciation', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'Thai uses its own unique script with 44 consonants and 15 vowel symbols. Understanding the basics opens up the world of Thai reading.',
          keyPhrases: [
            { native: 'ก', romanized: 'K', english: 'Chicken (base consonant)' },
            { native: 'ข', romanized: 'Kh', english: 'Egg (high class consonant)' },
            { native: 'ง', romanized: 'Ng', english: 'Snake (low class)' },
            { native: 'จ', romanized: 'J', english: 'Plate (mid class)' },
            { native: 'ด', romanized: 'D', english: 'Child (mid class)' },
          ],
          tips: ['Thai has 5 tones: mid, low, falling, high, rising', 'Practice writing strokes from top to bottom', 'Use mnemonic pictures to remember each letter'],
          practice: 'Write each consonant 5 times and practice saying its name aloud.',
        },
      },
      {
        id: 'th-02', title: 'Greetings & Politeness', description: 'Essential Thai greetings and polite expressions', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Thai culture places great emphasis on politeness. "Wai" (the prayer-like gesture) accompanies many greetings.',
          keyPhrases: [
            { native: 'สวัสดี', romanized: 'Sawasdee', english: 'Hello / Goodbye' },
            { native: 'ขอบคุณ', romanized: 'Khob Khun', english: 'Thank you' },
            { native: 'ไม่เป็นไร', romanized: 'Mai pen rai', english: "It's okay / No problem" },
            { native: 'โทษที', romanized: 'Thot thee', english: 'Excuse me / Sorry' },
            { native: 'ยินดีที่รู้จัก', romanized: 'Yin dee thi roo jak', english: 'Nice to meet you' },
          ],
          tips: ['Add "krap" (male) or "ka" (female) at the end to be polite', 'Smile when greeting — it is part of Thai culture', 'Lower your head slightly as a sign of respect'],
          practice: 'Practice greeting a partner using the Wai gesture with each phrase.',
        },
      },
      {
        id: 'th-03', title: 'Numbers 1–100', description: 'Count in Thai from one to one hundred', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Thai numbers are fairly straightforward once you learn the base numbers. They follow a logical pattern.',
          keyPhrases: [
            { native: 'หนึ่ง', romanized: 'Nueng', english: 'One (1)' },
            { native: 'สอง', romanized: 'Song', english: 'Two (2)' },
            { native: 'สาม', romanized: 'Sam', english: 'Three (3)' },
            { native: 'สิบ', romanized: 'Sip', english: 'Ten (10)' },
            { native: 'ร้อย', romanized: 'Roi', english: 'Hundred (100)' },
          ],
          tips: ['Numbers 11–19 use "sip" + unit number', 'Thai also has its own numeral script (๑,๒,๓...)', 'Learn Thai numerals to read prices in markets'],
          practice: 'Count aloud from 1 to 20 using Thai numbers.',
        },
      },
      {
        id: 'th-04', title: 'Food & Ordering at a Restaurant', description: 'Order food and drinks like a local', type: 'conversation', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Thailand is famous for its cuisine. Knowing how to order food is one of the most practical skills for travelers.',
          keyPhrases: [
            { native: 'ขอเมนูหน่อยได้ไหม', romanized: 'Kho menu noi dai mai', english: 'Can I have the menu please?' },
            { native: 'อร่อยมาก', romanized: 'Aroi mak', english: 'Very delicious!' },
            { native: 'เผ็ดน้อยๆ', romanized: 'Phet noi noi', english: 'A little bit spicy' },
            { native: 'เช็คบิลด้วย', romanized: 'Check bin duai', english: 'Bill please' },
            { native: 'ไม่ใส่ผักชี', romanized: 'Mai sai phak chi', english: 'No coriander please' },
          ],
          tips: ['Point to menu items if you are unsure', 'Thai restaurants often have picture menus', 'Use "aroi mak" as a compliment to the chef'],
          practice: 'Role-play a restaurant conversation with a partner.',
        },
      },
      {
        id: 'th-05', title: 'Getting Around: Directions', description: 'Ask for and give directions in Thai', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Navigating Thai cities requires knowing direction words and transportation vocabulary.',
          keyPhrases: [
            { native: 'ไปที่ไหน', romanized: 'Pai thi nai', english: 'Where are you going?' },
            { native: 'ตรงไป', romanized: 'Trong pai', english: 'Go straight' },
            { native: 'เลี้ยวซ้าย', romanized: 'Liao sai', english: 'Turn left' },
            { native: 'เลี้ยวขวา', romanized: 'Liao kwa', english: 'Turn right' },
            { native: 'อยู่ไกลไหม', romanized: 'Yu klai mai', english: 'Is it far?' },
          ],
          tips: ['Tuk-tuks and motorbike taxis are common in Bangkok', 'Show your destination on a map if words fail', 'Use Google Maps with Thai labels for practice'],
          practice: 'Draw a simple map and practice giving directions to a landmark.',
        },
      },
      {
        id: 'th-06', title: 'Tones in Thai', description: 'Master the 5 Thai tones with practice exercises', type: 'pronunciation', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Thai is a tonal language. The same syllable can have completely different meanings depending on the tone used.',
          keyPhrases: [
            { native: 'มา', romanized: 'Maa (mid)', english: 'To come' },
            { native: 'ม้า', romanized: 'Máa (rising)', english: 'Horse' },
            { native: 'หมา', romanized: 'Mǎa (falling)', english: 'Dog' },
            { native: 'หม้า', romanized: 'Mà (low)', english: 'Widow' },
            { native: 'หมาก', romanized: 'Mâa (high)', english: 'Betel nut' },
          ],
          tips: ['Use a tone marker chart as a reference', 'Record yourself and compare to native speakers', 'Focus on mid and rising tones first as they are most common'],
          practice: 'Say each tone five times slowly then speed up gradually.',
        },
      },
      {
        id: 'th-07', title: 'Thai Family & Relationships', description: 'Vocabulary for family members and social relationships', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Thai family terms are specific — different words exist depending on whether a family member is older or younger.',
          keyPhrases: [
            { native: 'พ่อ', romanized: 'Pho', english: 'Father' },
            { native: 'แม่', romanized: 'Mae', english: 'Mother' },
            { native: 'พี่', romanized: 'Phi', english: 'Older sibling' },
            { native: 'น้อง', romanized: 'Nong', english: 'Younger sibling' },
            { native: 'ลูก', romanized: 'Luk', english: 'Child / Son / Daughter' },
          ],
          tips: ['Thai uses "Phi" and "Nong" as social honorifics too, not just family', 'Grandparents have specific gender-based terms', 'Family is central to Thai society — learn these first'],
          practice: 'Draw your family tree and label each member in Thai.',
        },
      },
      {
        id: 'th-08', title: 'Thai Festivals & Traditions', description: 'Explore Thai culture through its major festivals', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Thailand has many rich festivals that reflect Buddhist traditions and local customs.',
          keyPhrases: [
            { native: 'สงกรานต์', romanized: 'Songkran', english: 'Thai New Year Water Festival' },
            { native: 'ลอยกระทง', romanized: 'Loy Krathong', english: 'Lantern Festival' },
            { native: 'วันพระ', romanized: 'Wan Phra', english: 'Buddhist holy day' },
            { native: 'วัดพระแก้ว', romanized: 'Wat Phra Kaew', english: 'Temple of the Emerald Buddha' },
            { native: 'ถวายทาน', romanized: 'Thawai than', english: 'Making merit / offerings' },
          ],
          tips: ['Dress modestly when entering temples', 'Participate respectfully in Songkran — it is a joyful event', 'Buy a krathong to float during Loy Krathong'],
          practice: 'Research one Thai festival and write 3 sentences about it in English.',
        },
      },
      {
        id: 'th-09', title: 'Present Tense Sentences', description: 'Build simple present tense Thai sentences', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Thai grammar is simpler than English in some ways — there is no verb conjugation or plurals, but word order is important.',
          keyPhrases: [
            { native: 'ฉันกินข้าว', romanized: 'Chan gin khao', english: 'I eat rice' },
            { native: 'เขาทำงาน', romanized: 'Khao tham ngan', english: 'He works' },
            { native: 'เราเรียนภาษาไทย', romanized: 'Rao rian phasa thai', english: 'We study Thai language' },
            { native: 'เธอชอบเพลง', romanized: 'Thoe chop phleng', english: 'She likes music' },
            { native: 'พวกเขาวิ่ง', romanized: 'Phuak khao wing', english: 'They run' },
          ],
          tips: ['Thai sentence structure: Subject + Verb + Object', 'No need to change verbs for tense — use time words instead', 'Add "yang" before verb to indicate ongoing action'],
          practice: 'Write 5 sentences about your daily routine in Thai.',
        },
      },
      {
        id: 'th-10', title: 'Shopping Vocabulary', description: 'Bargain and shop at Thai markets', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Shopping at Thai markets (talaat) is an experience. Bargaining is expected at most street markets.',
          keyPhrases: [
            { native: 'ราคาเท่าไร', romanized: 'Raka thao rai', english: 'How much does it cost?' },
            { native: 'แพงเกินไป', romanized: 'Phaeng koen pai', english: 'Too expensive' },
            { native: 'ลดได้ไหม', romanized: 'Lot dai mai', english: 'Can you reduce the price?' },
            { native: 'เอาอันนี้', romanized: 'Ao an ni', english: 'I will take this one' },
            { native: 'มีสีอื่นไหม', romanized: 'Mi si uen mai', english: 'Do you have other colors?' },
          ],
          tips: ['Start bargaining at 50-60% of the asking price', 'Smile and be friendly while negotiating', 'Fixed price shops (ราคาตายตัว) do not bargain'],
          practice: 'Role-play a market bargaining scene with a classmate.',
        },
      },
    ],
  },
  {
    id: 'korean',
    language: 'Korean',
    flag: '🇰🇷',
    color: '#0284c7',
    gradient: 'from-blue-500 to-red-400',
    lessons: [
      {
        id: 'ko-01', title: 'Hangul: The Korean Alphabet', description: 'Learn the logical and elegant Korean writing system', type: 'pronunciation', difficulty: 'beginner', duration: '20 min',
        content: {
          intro: 'Hangul was invented in 1443 by King Sejong. It has 14 basic consonants and 10 basic vowels, combined into syllable blocks.',
          keyPhrases: [
            { native: 'ㄱ', romanized: 'G/K', english: 'Basic consonant (giyeok)' },
            { native: 'ㄴ', romanized: 'N', english: 'Basic consonant (nieun)' },
            { native: 'ㅏ', romanized: 'A', english: 'Basic vowel (a)' },
            { native: '가', romanized: 'Ga', english: 'Syllable: consonant + vowel' },
            { native: '한글', romanized: 'Hangeul', english: 'The Korean alphabet' },
          ],
          tips: ['Each syllable block has 2-4 components', 'Learn vowels first, then add consonants', 'Hangul can be learned in a few hours — it is very systematic'],
          practice: 'Write your name in Hangul using an online converter.',
        },
      },
      {
        id: 'ko-02', title: 'Basic Greetings', description: 'Say hello, goodbye and polite expressions in Korean', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Korean has formal and informal speech levels. Start with formal speech (존댓말) to be respectful.',
          keyPhrases: [
            { native: '안녕하세요', romanized: 'Annyeonghaseyo', english: 'Hello (formal)' },
            { native: '감사합니다', romanized: 'Gamsahamnida', english: 'Thank you (formal)' },
            { native: '죄송합니다', romanized: 'Joesonghamnida', english: 'I am sorry' },
            { native: '안녕히 가세요', romanized: 'Annyeonghi gaseyo', english: 'Goodbye (to person leaving)' },
            { native: '만나서 반갑습니다', romanized: 'Mannaseo bangapseumnida', english: 'Nice to meet you' },
          ],
          tips: ['Bow slightly when greeting — deeper bows show more respect', 'Use informal speech (반말) only with close friends or younger people', 'Add -요 at the end for polite informal speech'],
          practice: 'Greet three people using Korean formal speech today.',
        },
      },
      {
        id: 'ko-03', title: 'Numbers: Native & Sino-Korean', description: 'Learn both Korean counting systems', type: 'vocabulary', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'Korean has two number systems: native Korean (하나, 둘...) and Sino-Korean (일, 이...). Each is used in different contexts.',
          keyPhrases: [
            { native: '하나 / 일', romanized: 'Hana / Il', english: 'One (native / sino)' },
            { native: '둘 / 이', romanized: 'Dul / I', english: 'Two (native / sino)' },
            { native: '셋 / 삼', romanized: 'Set / Sam', english: 'Three (native / sino)' },
            { native: '열 / 십', romanized: 'Yeol / Sip', english: 'Ten (native / sino)' },
            { native: '백', romanized: 'Baek', english: 'Hundred (sino only)' },
          ],
          tips: ['Use native Korean for counting objects and age', 'Use Sino-Korean for money, phone numbers, and dates', 'Sino-Korean is based on Chinese characters'],
          practice: 'Say your age in native Korean and the current year in Sino-Korean.',
        },
      },
      {
        id: 'ko-04', title: 'K-Culture: K-Drama & K-Pop Expressions', description: 'Common phrases heard in Korean entertainment', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'K-Drama and K-Pop have popularized Korean worldwide. Many fans learn Korean through music and dramas.',
          keyPhrases: [
            { native: '대박', romanized: 'Daebak', english: 'Awesome / Amazing' },
            { native: '화이팅', romanized: 'Hwaiting', english: 'Fighting! (You can do it!)' },
            { native: '오빠', romanized: 'Oppa', english: "Older brother (girl's word for older male)" },
            { native: '아이고', romanized: 'Aigo', english: 'Oh my! / Goodness!' },
            { native: '진짜요?', romanized: 'Jinjjayo?', english: 'Really? / Seriously?' },
          ],
          tips: ['K-Drama is a great resource for learning natural speech patterns', 'Listen to K-Pop lyrics and try to identify words you know', 'Watch with Korean subtitles (한국어 자막) for best learning'],
          practice: 'Watch a 5-minute K-Drama clip and note 3 phrases you recognize.',
        },
      },
      {
        id: 'ko-05', title: 'Sentence Structure: SOV Order', description: 'Understanding Korean grammar basics', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Korean follows Subject-Object-Verb order, unlike English. The verb always comes at the end of the sentence.',
          keyPhrases: [
            { native: '나는 밥을 먹어요', romanized: 'Naneun babeul meogeoyo', english: 'I eat rice (I-rice-eat)' },
            { native: '그는 음악을 좋아해요', romanized: 'Geuneun eumageul joahaeyo', english: 'He likes music' },
            { native: '우리는 한국어를 배워요', romanized: 'Urineun hangugeo-reul baewoyo', english: 'We learn Korean' },
            { native: '그녀는 책을 읽어요', romanized: 'Geunyeoneun chaeg-eul ilgeoyo', english: 'She reads a book' },
            { native: '저는 학생이에요', romanized: 'Jeoneun haksaengieyo', english: 'I am a student' },
          ],
          tips: ['Topic markers: 은/는 | Subject markers: 이/가 | Object markers: 을/를', 'The verb ending changes based on formality level', 'Practice building sentences by swapping nouns'],
          practice: 'Translate 5 English sentences into Korean word order.',
        },
      },
      {
        id: 'ko-06', title: 'At the Restaurant', description: 'Order Korean food and interact with servers', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Korean dining culture is unique — dishes are shared and banchan (side dishes) are served with every meal.',
          keyPhrases: [
            { native: '여기요!', romanized: 'Yeogiyo!', english: 'Excuse me! (calling a server)' },
            { native: '이거 주세요', romanized: 'Igeo juseyo', english: 'Give me this please' },
            { native: '맛있어요', romanized: 'Massisseoyo', english: 'It is delicious' },
            { native: '물 한 잔 주세요', romanized: 'Mul han jan juseyo', english: 'One glass of water please' },
            { native: '계산서 주세요', romanized: 'Gyesanseo juseyo', english: 'Check please' },
          ],
          tips: ['Koreans say "jal meokkessseumnida" before eating (like bon appétit)', 'Elders eat first in Korean culture', 'Never tip in Korean restaurants — it can be considered rude'],
          practice: 'Create a Korean restaurant order dialogue with 6 exchanges.',
        },
      },
      {
        id: 'ko-07', title: 'Weather & Seasons', description: 'Talk about weather and the four seasons in Korean', type: 'vocabulary', difficulty: 'intermediate', duration: '11 min',
        content: {
          intro: 'Korea has four distinct seasons, and weather is a common conversation topic.',
          keyPhrases: [
            { native: '오늘 날씨가 어때요?', romanized: 'Oneul nalssiga eottaeyo?', english: 'How is the weather today?' },
            { native: '더워요', romanized: 'Deowoyo', english: 'It is hot' },
            { native: '추워요', romanized: 'Chuwoyo', english: 'It is cold' },
            { native: '봄 / 여름 / 가을 / 겨울', romanized: 'Bom / Yeoreum / Gaeul / Gyeoul', english: 'Spring / Summer / Fall / Winter' },
            { native: '비가 와요', romanized: 'Biga wayo', english: 'It is raining' },
          ],
          tips: ['Korea has a rainy season (장마철) in summer', 'Winter in Seoul can drop below -10°C', 'Spring (봄) is cherry blossom season — very famous'],
          practice: 'Describe today\'s weather in Korean using at least 3 vocabulary words.',
        },
      },
      {
        id: 'ko-08', title: 'Honorifics & Speech Levels', description: 'Navigate Korean formal and informal speech', type: 'grammar', difficulty: 'advanced', duration: '20 min',
        content: {
          intro: 'Korean speech levels (경어법) are crucial for social harmony. Using the wrong level can be offensive.',
          keyPhrases: [
            { native: '합쇼체', romanized: 'Hapshoche', english: 'Formal polite (business/strangers)' },
            { native: '해요체', romanized: 'Haeyoche', english: 'Informal polite (everyday use)' },
            { native: '해체', romanized: 'Haeche', english: 'Informal (close friends, children)' },
            { native: '드시다', romanized: 'Deushida', english: 'Eat (honorific form)' },
            { native: '말씀하시다', romanized: 'Malsseum hashida', english: 'Speak (honorific form)' },
          ],
          tips: ['When in doubt, use 해요체 — it is safe and natural', 'Elderly Koreans appreciate extra formal speech', 'Using 반말 with a stranger can cause offense'],
          practice: 'Rewrite 3 sentences from informal to formal speech levels.',
        },
      },
      {
        id: 'ko-09', title: 'Travel & Transportation', description: 'Navigate buses, subways, and taxis in Korea', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Korea has an excellent public transport system. Knowing key vocabulary makes travel easy and fun.',
          keyPhrases: [
            { native: '지하철역이 어디에요?', romanized: 'Jihacheol-yeogi eodieyo?', english: 'Where is the subway station?' },
            { native: '...에 가주세요', romanized: '...e gajuseyo', english: 'Please take me to...' },
            { native: '얼마예요?', romanized: 'Eolmayeyo?', english: 'How much is it?' },
            { native: '다음 정류장', romanized: 'Daeum jeongnyujang', english: 'Next stop' },
            { native: '표 한 장 주세요', romanized: 'Pyo han jang juseyo', english: 'One ticket please' },
          ],
          tips: ['T-money card works on all Seoul public transport', 'Taxis in Korea are generally honest and metered', 'KTX is Korea\'s high-speed train connecting major cities'],
          practice: 'Plan a route from one Korean city to another using vocabulary learned.',
        },
      },
      {
        id: 'ko-10', title: 'Korean Food Culture', description: 'Explore iconic Korean dishes and food etiquette', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Korean food is known for its bold flavors, fermented foods, and communal dining style.',
          keyPhrases: [
            { native: '김치', romanized: 'Kimchi', english: 'Fermented spicy cabbage (national dish)' },
            { native: '불고기', romanized: 'Bulgogi', english: 'Marinated grilled beef' },
            { native: '비빔밥', romanized: 'Bibimbap', english: 'Mixed rice with vegetables' },
            { native: '삼겹살', romanized: 'Samgyeopsal', english: 'Grilled pork belly' },
            { native: '떡볶이', romanized: 'Tteokbokki', english: 'Spicy rice cakes' },
          ],
          tips: ['Never stick chopsticks upright in rice — this is associated with funerals', 'Wait for the eldest to eat first', 'It is polite to refill others\' glasses before your own'],
          practice: 'Research the recipe for bibimbap and learn the ingredient names in Korean.',
        },
      },
    ],
  },
  {
    id: 'japanese',
    language: 'Japanese',
    flag: '🇯🇵',
    color: '#dc2626',
    gradient: 'from-red-500 to-pink-400',
    lessons: [
      {
        id: 'ja-01', title: 'Hiragana: The First Script', description: 'Master the 46 hiragana characters', type: 'pronunciation', difficulty: 'beginner', duration: '20 min',
        content: {
          intro: 'Hiragana is the foundational Japanese script. Every Japanese learner starts here. It represents syllables, not individual letters.',
          keyPhrases: [
            { native: 'あ', romanized: 'A', english: 'Vowel: a (as in "father")' },
            { native: 'い', romanized: 'I', english: 'Vowel: i (as in "meet")' },
            { native: 'か', romanized: 'Ka', english: 'Consonant+vowel combination' },
            { native: 'さ', romanized: 'Sa', english: 'Sa row beginning' },
            { native: 'たべる', romanized: 'Taberu', english: 'To eat (written in hiragana)' },
          ],
          tips: ['Learn in the a-i-u-e-o vowel row order', 'Use mnemonics and flashcards', 'Practice writing — muscle memory helps retention'],
          practice: 'Write the entire hiragana chart from memory.',
        },
      },
      {
        id: 'ja-02', title: 'Katakana: For Foreign Words', description: 'Learn Katakana used for loanwords and emphasis', type: 'pronunciation', difficulty: 'beginner', duration: '18 min',
        content: {
          intro: 'Katakana mirrors hiragana sounds but is used for foreign words, scientific terms, and emphasis.',
          keyPhrases: [
            { native: 'ア', romanized: 'A', english: 'Katakana A' },
            { native: 'コーヒー', romanized: 'Koohii', english: 'Coffee (loanword from English)' },
            { native: 'テレビ', romanized: 'Terebi', english: 'Television' },
            { native: 'アイスクリーム', romanized: 'Aisu kuriimu', english: 'Ice cream' },
            { native: 'マクドナルド', romanized: "Makudonarudo", english: "McDonald's" },
          ],
          tips: ['Guess English loanwords from Katakana — many are recognizable', 'Katakana has more angular strokes than hiragana', 'Essential for menus, signs, and modern vocabulary'],
          practice: 'Write 10 English words in Katakana.',
        },
      },
      {
        id: 'ja-03', title: 'Greetings & Politeness', description: 'Essential Japanese greetings for all occasions', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Japanese greetings change based on time of day and formality level. Politeness is central to Japanese culture.',
          keyPhrases: [
            { native: 'おはようございます', romanized: 'Ohayou gozaimasu', english: 'Good morning (formal)' },
            { native: 'こんにちは', romanized: 'Konnichiwa', english: 'Hello / Good afternoon' },
            { native: 'こんばんは', romanized: 'Konbanwa', english: 'Good evening' },
            { native: 'ありがとうございます', romanized: 'Arigatou gozaimasu', english: 'Thank you very much' },
            { native: 'すみません', romanized: 'Sumimasen', english: 'Excuse me / I am sorry' },
          ],
          tips: ['Bowing is the main form of greeting in Japan', 'Depth of bow shows level of respect', 'Use polite forms with strangers and elders always'],
          practice: 'Practice using different greetings at the right time of day.',
        },
      },
      {
        id: 'ja-04', title: 'Japanese Particles', description: 'Understand wa, ga, wo, ni, de and more', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Particles are the backbone of Japanese grammar. They attach to words to show their grammatical role.',
          keyPhrases: [
            { native: 'は (wa)', romanized: 'wa', english: 'Topic marker: "as for..."' },
            { native: 'が (ga)', romanized: 'ga', english: 'Subject marker' },
            { native: 'を (wo)', romanized: 'wo/o', english: 'Object marker' },
            { native: 'に (ni)', romanized: 'ni', english: 'Direction / location / time' },
            { native: 'で (de)', romanized: 'de', english: 'Location of action / by means of' },
          ],
          tips: ['は marks what you are talking about; が marks who does the action', 'で indicates the place where action happens', 'Practice by labeling sentences and identifying each particle'],
          practice: 'Write 5 sentences using a different particle in each.',
        },
      },
      {
        id: 'ja-05', title: 'Japanese Numbers & Counters', description: 'Count things correctly using Japanese counters', type: 'vocabulary', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Japanese uses different counter words depending on what is being counted (flat objects, long objects, people, etc.).',
          keyPhrases: [
            { native: '一つ', romanized: 'Hitotsu', english: 'One (general objects)' },
            { native: '一人', romanized: 'Hitori', english: 'One person' },
            { native: '一枚', romanized: 'Ichimai', english: 'One flat object (paper, ticket)' },
            { native: '一本', romanized: 'Ippon', english: 'One long object (pencil, bottle)' },
            { native: '一匹', romanized: 'Ippiki', english: 'One small animal' },
          ],
          tips: ['Learn the most common counters first (tsu, hitori, mai, hon)', 'Irregular readings exist for 1, 6, 8, and 10', 'Use generic つ counters when unsure'],
          practice: 'Count 5 different items in the room using the correct counter.',
        },
      },
      {
        id: 'ja-06', title: 'Japanese Restaurant Phrases', description: 'Dine in Japan with confidence', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Japan has a profound food culture. Knowing the right phrases will enhance your dining experience.',
          keyPhrases: [
            { native: 'いただきます', romanized: 'Itadakimasu', english: 'I humbly receive (said before eating)' },
            { native: 'ごちそうさまでした', romanized: 'Gochisousamadeshita', english: 'It was a feast (said after eating)' },
            { native: 'おすすめは何ですか', romanized: 'Osusume wa nan desu ka', english: 'What do you recommend?' },
            { native: 'お会計をお願いします', romanized: 'Okaikei wo onegaishimasu', english: 'Check please' },
            { native: '辛くないものはありますか', romanized: 'Karakunai mono wa arimasu ka', english: 'Do you have anything not spicy?' },
          ],
          tips: ['Water is free in Japanese restaurants', 'Many restaurants have plastic food displays outside', 'Slurping noodles is acceptable and complimentary'],
          practice: 'Role-play ordering a full meal in Japanese with a partner.',
        },
      },
      {
        id: 'ja-07', title: 'Kanji Basics: Top 50', description: 'Learn the most fundamental kanji characters', type: 'vocabulary', difficulty: 'intermediate', duration: '25 min',
        content: {
          intro: 'Kanji are Chinese-derived characters used in Japanese. You need 2,136 jōyō kanji for literacy.',
          keyPhrases: [
            { native: '日', romanized: 'Nichi/Hi', english: 'Sun / Day' },
            { native: '月', romanized: 'Getsu/Tsuki', english: 'Moon / Month' },
            { native: '水', romanized: 'Sui/Mizu', english: 'Water' },
            { native: '火', romanized: 'Ka/Hi', english: 'Fire' },
            { native: '木', romanized: 'Moku/Ki', english: 'Tree / Wood' },
          ],
          tips: ['Learn kanji in context — with vocabulary and sentences', 'Use spaced repetition software (Anki) for memorization', 'Days of the week use elemental kanji: 月火水木金土日'],
          practice: 'Write the 5 kanji today and create a sentence with each.',
        },
      },
      {
        id: 'ja-08', title: 'Japanese Work Culture', description: 'Understand Japanese business etiquette', type: 'culture', difficulty: 'advanced', duration: '15 min',
        content: {
          intro: 'Japan\'s work culture is known for its dedication, hierarchy, and group harmony (和 wa).',
          keyPhrases: [
            { native: 'お疲れ様です', romanized: 'Otsukaresama desu', english: 'Thank you for your hard work' },
            { native: '名刺', romanized: 'Meishi', english: 'Business card (exchange with both hands)' },
            { native: '上司', romanized: 'Jooshi', english: 'Boss / Superior' },
            { native: '会議', romanized: 'Kaigi', english: 'Meeting' },
            { native: '残業', romanized: 'Zangyou', english: 'Overtime work' },
          ],
          tips: ['Business cards are treated with great respect in Japan', 'Never write on a business card received from someone', 'Consensus-building (根回し nemawashi) is valued over individual decisions'],
          practice: 'Research 3 rules of Japanese business card etiquette.',
        },
      },
      {
        id: 'ja-09', title: 'Te-form: Connecting Verbs', description: 'Use the te-form to build complex sentences', type: 'grammar', difficulty: 'advanced', duration: '22 min',
        content: {
          intro: 'The て-form (te-form) is one of the most important verb forms in Japanese. It is used for sequences, requests, and progressive tenses.',
          keyPhrases: [
            { native: '食べてください', romanized: 'Tabete kudasai', english: 'Please eat (polite request)' },
            { native: '走っています', romanized: 'Hashitte imasu', english: 'Am running (progressive)' },
            { native: '起きて、食べて、行く', romanized: 'Okite, tabete, iku', english: 'Wake up, eat, and go (sequence)' },
            { native: 'みてもいいですか', romanized: 'Mite mo ii desu ka', english: 'May I look? (permission)' },
            { native: 'してはいけません', romanized: 'Shite wa ikemasen', english: 'Must not do (prohibition)' },
          ],
          tips: ['Group 1 verbs: replace u ending with って or って', 'Group 2 verbs: replace る with て', 'Irregular: する→して, くる→きて'],
          practice: 'Convert 10 verbs into their te-form and use each in a sentence.',
        },
      },
      {
        id: 'ja-10', title: 'Japanese Pop Culture', description: 'Anime, manga, and otaku culture vocabulary', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Japanese pop culture has global influence. Many people learn Japanese because of anime and manga.',
          keyPhrases: [
            { native: 'アニメ', romanized: 'Anime', english: 'Japanese animation' },
            { native: 'マンガ', romanized: 'Manga', english: 'Japanese comics' },
            { native: 'かわいい', romanized: 'Kawaii', english: 'Cute / Adorable' },
            { native: 'すごい', romanized: 'Sugoi', english: 'Amazing / Wow' },
            { native: 'なるほど', romanized: 'Naruhodo', english: 'I see / Makes sense' },
          ],
          tips: ['Anime often uses informal speech — supplement with formal study', 'Manga reading helps with kanji recognition', 'Join Japanese learning communities inspired by shared interests'],
          practice: 'Watch 5 minutes of anime with Japanese subtitles and note new words.',
        },
      },
    ],
  },
  {
    id: 'french',
    language: 'French',
    flag: '🇫🇷',
    color: '#1d4ed8',
    gradient: 'from-blue-700 to-red-500',
    lessons: [
      {
        id: 'fr-01', title: 'French Pronunciation Fundamentals', description: 'Master nasal vowels, silent letters and liaison', type: 'pronunciation', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'French pronunciation differs greatly from spelling. Silent letters, nasal sounds, and liaison make it unique.',
          keyPhrases: [
            { native: 'eau', romanized: '/o/', english: '"Water" sound — like in "oh"' },
            { native: 'eu', romanized: '/ø/', english: 'Like "uh" but with rounded lips' },
            { native: 'en / an / am', romanized: '/ɑ̃/', english: 'Nasal vowel sound' },
            { native: 'in / ain / ein', romanized: '/ɛ̃/', english: 'Nasal "an" sound' },
            { native: 'on / om', romanized: '/ɔ̃/', english: 'Nasal "on" sound' },
          ],
          tips: ['Final consonants are usually silent in French', 'Liaison links final consonant to next vowel-starting word', 'Practice with tongue twisters (virelangues)'],
          practice: 'Record yourself reading 3 French sentences and identify liaison points.',
        },
      },
      {
        id: 'fr-02', title: 'Les Salutations', description: 'Greetings and introductions in French', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'French greetings depend on time of day and formality. "Tu" and "vous" indicate relationship levels.',
          keyPhrases: [
            { native: 'Bonjour', romanized: 'bɔ̃ʒuʁ', english: 'Good morning / Hello' },
            { native: 'Bonsoir', romanized: 'bɔ̃swaʁ', english: 'Good evening' },
            { native: 'Enchanté(e)', romanized: 'ɑ̃ʃɑ̃te', english: 'Pleased to meet you' },
            { native: 'Comment allez-vous?', romanized: 'kɔmɑ̃ ale vu', english: 'How are you? (formal)' },
            { native: 'Au revoir', romanized: 'o ʁəvwaʁ', english: 'Goodbye' },
          ],
          tips: ['La bise (cheek kiss) is a common greeting in France', 'Use "vous" for strangers and formal situations', '"Tu" is reserved for friends, family, and children'],
          practice: 'Introduce yourself formally and informally in French.',
        },
      },
      {
        id: 'fr-03', title: 'Gender of Nouns', description: 'Understand masculine and feminine nouns', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Every French noun has a grammatical gender: masculine (le) or feminine (la). This affects all agreeing words.',
          keyPhrases: [
            { native: 'le livre', romanized: 'luh leevr', english: 'The book (masculine)' },
            { native: 'la table', romanized: 'la tabl', english: 'The table (feminine)' },
            { native: 'un chat', romanized: 'uhn sha', english: 'A cat (masculine)' },
            { native: 'une maison', romanized: 'oon mezohn', english: 'A house (feminine)' },
            { native: 'les enfants', romanized: 'lay zɑ̃fɑ̃', english: 'The children (plural)' },
          ],
          tips: ['Words ending in -tion, -sion are usually feminine', 'Words ending in -eau, -ment are usually masculine', 'Always learn nouns with their articles'],
          practice: 'List 10 French nouns and correctly assign le or la to each.',
        },
      },
      {
        id: 'fr-04', title: 'Present Tense Verbs', description: 'Conjugate -er, -ir, and -re verbs', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'French verbs are grouped into three families by their infinitive endings. Each group has its own conjugation pattern.',
          keyPhrases: [
            { native: 'parler (je parle)', romanized: 'parle', english: 'To speak (I speak)' },
            { native: 'finir (je finis)', romanized: 'feeneer', english: 'To finish (I finish)' },
            { native: 'vendre (je vends)', romanized: 'vɑ̃dʁ', english: 'To sell (I sell)' },
            { native: 'être (je suis)', romanized: 'etr', english: 'To be (I am) — irregular' },
            { native: 'avoir (j\'ai)', romanized: 'avwaʁ', english: "To have (I have) — irregular" },
          ],
          tips: ['Être and avoir are irregular but essential — memorize them first', 'Most verbs are -er; learn this group thoroughly', 'Use BAGS adjectives rule: Beauty, Age, Goodness, Size come before noun'],
          practice: 'Conjugate parler, finir, and vendre for all persons.',
        },
      },
      {
        id: 'fr-05', title: 'Au Restaurant', description: 'Dining in France: ordering food and drinks', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'French cuisine is world-famous. Knowing restaurant vocabulary helps you enjoy the full dining experience.',
          keyPhrases: [
            { native: 'Je voudrais commander', romanized: 'zhuh voodray komɑ̃de', english: 'I would like to order' },
            { native: 'L\'addition, s\'il vous plaît', romanized: 'ladisyɔ̃ sil vu plɛ', english: 'The bill please' },
            { native: 'C\'est délicieux!', romanized: 'se delisyø', english: 'It is delicious!' },
            { native: 'Je suis allergique à...', romanized: 'zhuh swee alɛʁʒik a', english: 'I am allergic to...' },
            { native: 'Une carafe d\'eau', romanized: 'yn kaʁaf do', english: 'A jug of water' },
          ],
          tips: ['Tap water (une carafe d\'eau) is free by law in French restaurants', 'Service charge is included in French bills', 'Bread is typically provided free of charge'],
          practice: 'Write a full 3-course French dinner order dialogue.',
        },
      },
      {
        id: 'fr-06', title: 'French Adjectives & Agreement', description: 'Correctly match adjectives with nouns', type: 'grammar', difficulty: 'intermediate', duration: '16 min',
        content: {
          intro: 'French adjectives must agree in gender and number with the nouns they modify. This is one of the trickiest aspects for learners.',
          keyPhrases: [
            { native: 'un petit garçon', romanized: 'uh puh-tee gar-soh', english: 'A small boy (masc)' },
            { native: 'une petite fille', romanized: 'oon puh-teet fee', english: 'A small girl (fem)' },
            { native: 'des livres intéressants', romanized: 'day leevr ɛ̃teresɑ̃', english: 'Interesting books (masc pl)' },
            { native: 'une belle femme', romanized: 'oon bel fam', english: 'A beautiful woman' },
            { native: 'un beau jour', romanized: 'uh bo zhuʁ', english: 'A beautiful day (masc)' },
          ],
          tips: ['Add -e to make most adjectives feminine', 'Add -s to make adjectives plural', 'Irregular adjectives: beau/belle, vieux/vieille, bon/bonne'],
          practice: 'Write a description of your bedroom using 5 French adjectives.',
        },
      },
      {
        id: 'fr-07', title: 'Shopping in France', description: 'Buy clothes, food, and souvenirs in French', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'France is known for fashion, food markets, and luxury goods. Shopping vocabulary is highly practical.',
          keyPhrases: [
            { native: 'Combien ça coûte?', romanized: 'kɔ̃byɛ̃ sa kut', english: 'How much does it cost?' },
            { native: 'Je cherche...', romanized: 'zhuh shɛʁsh', english: 'I am looking for...' },
            { native: 'Avez-vous une taille plus grande?', romanized: 'ave vu yn taj ply gʁɑ̃d', english: 'Do you have a larger size?' },
            { native: 'Je peux l\'essayer?', romanized: 'zhuh pø leseje', english: 'May I try it on?' },
            { native: 'Je le prends', romanized: 'zhuh luh pʁɑ̃', english: 'I will take it' },
          ],
          tips: ['French sales (Soldes) happen twice yearly in January and July', 'Most stores close on Sundays in smaller towns', 'Discount stores are called "solderie" or "dégriffé"'],
          practice: 'Role-play buying a shirt in a French boutique.',
        },
      },
      {
        id: 'fr-08', title: 'French Culture & History', description: 'Explore French art, philosophy and way of life', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'France has one of the richest cultural heritages in the world — from the Enlightenment to haute cuisine.',
          keyPhrases: [
            { native: 'Liberté, Égalité, Fraternité', romanized: 'libɛʁte egalite fʁatɛʁnite', english: 'Liberty, Equality, Brotherhood (national motto)' },
            { native: 'Le Louvre', romanized: 'luh loovʁ', english: 'World\'s largest art museum (Paris)' },
            { native: 'La Tour Eiffel', romanized: 'la tuʁ efɛl', english: 'The Eiffel Tower' },
            { native: 'le cinéma', romanized: 'luh sinema', english: 'Cinema (invented in France)' },
            { native: 'la gastronomie', romanized: 'la gastʁɔnɔmi', english: 'Gastronomy — French culinary tradition' },
          ],
          tips: ['France receives the most tourists of any country annually', 'The French language is spoken on 5 continents', 'French philosophers like Descartes and Sartre shaped modern thought'],
          practice: 'Research one French artist or philosopher and summarize their contribution.',
        },
      },
      {
        id: 'fr-09', title: 'Numbers & Time', description: 'Count, tell time, and use dates in French', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'French numbers are mostly regular, except for some tricky ones like 70 (soixante-dix) and 80 (quatre-vingts).',
          keyPhrases: [
            { native: 'soixante-dix', romanized: 'swasɑ̃t dis', english: '70 (literally "sixty-ten")' },
            { native: 'quatre-vingts', romanized: 'katʁuh vɛ̃', english: '80 (literally "four-twenties")' },
            { native: 'Quelle heure est-il?', romanized: 'kɛl œʁ ɛtil', english: 'What time is it?' },
            { native: 'Il est midi', romanized: 'il ɛ midi', english: 'It is noon' },
            { native: 'Lundi, Mardi, Mercredi', romanized: 'lœ̃di maʁdi mɛʁkʁədi', english: 'Monday, Tuesday, Wednesday' },
          ],
          tips: ['French uses 24-hour clock in formal contexts', 'Months and days are NOT capitalized in French', 'Belgium and Switzerland use different words for 70 and 90'],
          practice: 'Write out today\'s full date and your daily schedule in French.',
        },
      },
      {
        id: 'fr-10', title: 'Subjunctive Mood', description: 'Express doubt, wishes, and emotions in French', type: 'grammar', difficulty: 'advanced', duration: '22 min',
        content: {
          intro: 'The subjunctive (subjonctif) is used after expressions of wish, doubt, necessity, and emotion. It is essential for advanced French.',
          keyPhrases: [
            { native: 'Il faut que tu viennes', romanized: 'il fo kuh ty vyɛn', english: 'It is necessary that you come' },
            { native: 'Je veux qu\'il fasse beau', romanized: 'zhuh vø keel fas bo', english: 'I want the weather to be nice' },
            { native: 'Bien que ce soit difficile', romanized: 'byɛ̃ kuh suh swa difisil', english: 'Although it is difficult' },
            { native: 'Je doute qu\'il sache', romanized: 'zhuh dut keel sash', english: 'I doubt that he knows' },
            { native: 'Pourvu qu\'il arrive', romanized: 'puʁvy keel aʁiv', english: 'Provided that he arrives' },
          ],
          tips: ['Subjunctive is triggered by "que" after key expressions', 'Common irregular subjunctive: être (soit), avoir (ait)', 'Practice by transforming sentences with wish/doubt verbs'],
          practice: 'Write 5 subjunctive sentences expressing your wishes for the future.',
        },
      },
    ],
  },
  {
    id: 'spanish',
    language: 'Spanish',
    flag: '🇪🇸',
    color: '#d97706',
    gradient: 'from-yellow-500 to-red-500',
    lessons: [
      {
        id: 'es-01', title: 'Spanish Alphabet & Sounds', description: 'Pronunciation guide for Spanish letters', type: 'pronunciation', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Spanish pronunciation is highly consistent — words are almost always pronounced exactly as they are spelled.',
          keyPhrases: [
            { native: 'ñ', romanized: 'ny', english: 'Like the "ny" in "canyon"' },
            { native: 'rr', romanized: 'trilled r', english: 'A rolled/trilled r sound' },
            { native: 'h', romanized: 'silent', english: 'H is always silent in Spanish' },
            { native: 'll', romanized: 'y/zh', english: 'Like "y" in most dialects' },
            { native: 'j', romanized: 'kh', english: 'Like a strong "h" sound' },
          ],
          tips: ['Spanish vowels (a, e, i, o, u) always have one consistent sound', 'Regional accents affect pronunciation (Spain vs Latin America)', 'Practice the trilled "rr" by saying "butter" fast'],
          practice: 'Read a Spanish paragraph aloud, focusing on vowel sounds.',
        },
      },
      {
        id: 'es-02', title: 'Hola y Más: Greetings', description: 'Greet people in Spanish at any time of day', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Spanish is warm and expressive. Greetings often include questions about health and family.',
          keyPhrases: [
            { native: '¡Buenos días!', romanized: 'bwenos dias', english: 'Good morning!' },
            { native: '¿Cómo estás?', romanized: 'komo estas', english: 'How are you? (informal)' },
            { native: 'Mucho gusto', romanized: 'mutʃo gusto', english: 'Nice to meet you' },
            { native: 'Hasta luego', romanized: 'asta lweɡo', english: 'See you later' },
            { native: '¿Qué tal?', romanized: 'ke tal', english: "What's up? / How's it going?" },
          ],
          tips: ['Use ¡ and ¿ at the start of exclamations and questions', '"Tú" is informal, "Usted" is formal second person', 'Greet everyone when entering a room in Spanish culture'],
          practice: 'Write a short dialogue between two people meeting for the first time.',
        },
      },
      {
        id: 'es-03', title: 'Ser vs Estar', description: 'Master the two Spanish verbs "to be"', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Spanish has two verbs meaning "to be": SER for permanent qualities, ESTAR for temporary states and locations.',
          keyPhrases: [
            { native: 'Soy estudiante', romanized: 'soy estud-yante', english: 'I am a student (SER — identity)' },
            { native: 'Estoy cansado', romanized: 'estoy kan-sado', english: 'I am tired (ESTAR — state)' },
            { native: 'La casa es grande', romanized: 'la kasa es ɡrande', english: 'The house is large (SER — characteristic)' },
            { native: 'El café está caliente', romanized: 'el kafe esta kalyente', english: 'The coffee is hot (ESTAR — condition)' },
            { native: 'Estamos en Madrid', romanized: 'estamos en madɾid', english: 'We are in Madrid (ESTAR — location)' },
          ],
          tips: ['SER: nationality, occupation, personality, relationships, origin', 'ESTAR: feelings, health, location, progressive actions', 'Some adjectives change meaning depending on ser/estar'],
          practice: 'Write 10 sentences about yourself using both ser and estar.',
        },
      },
      {
        id: 'es-04', title: 'Numbers & Money', description: 'Count and handle money in Spanish', type: 'vocabulary', difficulty: 'beginner', duration: '11 min',
        content: {
          intro: 'Spanish numbers are essential for shopping, telling time, and everyday conversations.',
          keyPhrases: [
            { native: 'uno, dos, tres', romanized: 'uno dos tres', english: 'One, two, three' },
            { native: 'veinte', romanized: 'beynte', english: 'Twenty' },
            { native: '¿Cuánto cuesta?', romanized: 'kwanto kwesta', english: 'How much does it cost?' },
            { native: 'Es muy caro', romanized: 'es muy karo', english: 'It is very expensive' },
            { native: 'Quiero pagar', romanized: 'kyero paɡar', english: 'I want to pay' },
          ],
          tips: ['Note: "uno" becomes "un" before masculine nouns', '"Un millón" (million) but "dos millones" (plural)', 'Prices are read as "X euros con Y céntimos"'],
          practice: 'Practice saying prices of 5 common items in your local currency in Spanish.',
        },
      },
      {
        id: 'es-05', title: 'Present Tense Conjugation', description: 'Conjugate Spanish regular and irregular verbs', type: 'grammar', difficulty: 'intermediate', duration: '20 min',
        content: {
          intro: 'Spanish verbs end in -ar, -er, or -ir. Regular verbs follow predictable patterns; irregular verbs require memorization.',
          keyPhrases: [
            { native: 'hablar → hablo', romanized: 'ablɑr / ablo', english: 'To speak → I speak (-ar verb)' },
            { native: 'comer → como', romanized: 'komer / komo', english: 'To eat → I eat (-er verb)' },
            { native: 'vivir → vivo', romanized: 'biβiɾ / biβo', english: 'To live → I live (-ir verb)' },
            { native: 'ir → voy', romanized: 'iɾ / boy', english: 'To go → I go (irregular)' },
            { native: 'tener → tengo', romanized: 'teneɾ / teŋɡo', english: 'To have → I have (irregular yo form)' },
          ],
          tips: ['Yo-go verbs (tener, venir, hacer) are irregular only in "yo" form', 'Stem-changing verbs change e→ie, o→ue, e→i', 'Practice conjugation tables daily — repetition is key'],
          practice: 'Conjugate hablar, comer, and tener in all 6 persons.',
        },
      },
      {
        id: 'es-06', title: 'Spanish-Speaking World', description: 'Explore the diversity of Spanish-speaking countries', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Spanish is the 2nd most spoken language by native speakers worldwide, with 20+ countries speaking it as their official language.',
          keyPhrases: [
            { native: 'México', romanized: 'meksiΚo', english: 'Most populous Spanish-speaking country' },
            { native: 'La paella', romanized: 'la paeja', english: "Spain's famous rice dish" },
            { native: 'El tango', romanized: 'el taŋɡo', english: 'Dance from Argentina' },
            { native: 'El fútbol', romanized: 'el futbol', english: 'Football (soccer) — a passion across Latin America' },
            { native: 'La siesta', romanized: 'la syesta', english: 'Afternoon rest — traditional in Spain' },
          ],
          tips: ['Spanish varies by region — vocabulary and accents differ', 'Latin American Spanish is generally easier for beginners', 'Spain uses "vosotros" — Latin America uses "ustedes" instead'],
          practice: 'Research one Spanish-speaking country and prepare a 2-minute presentation.',
        },
      },
      {
        id: 'es-07', title: 'Preterite Tense', description: 'Talk about completed past actions in Spanish', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'The preterite (pretérito indefinido) is used for completed actions in the past. It is different from the imperfect tense.',
          keyPhrases: [
            { native: 'Comí pizza ayer', romanized: 'komi pitsa ayer', english: 'I ate pizza yesterday' },
            { native: 'Fui al mercado', romanized: 'fwi al merkado', english: 'I went to the market' },
            { native: 'Ella llegó tarde', romanized: 'ea ʎeɡo tarde', english: 'She arrived late' },
            { native: 'Nosotros hablamos', romanized: 'nosotros ablamos', english: 'We spoke' },
            { native: '¿Qué hiciste?', romanized: 'ke iθiste', english: 'What did you do?' },
          ],
          tips: ['Use preterite for specific completed events', 'Irregular preterites: ser/ir (fui), tener (tuve), hacer (hice)', 'Time markers: ayer, anoche, la semana pasada'],
          practice: 'Write a paragraph about what you did last weekend using the preterite.',
        },
      },
      {
        id: 'es-08', title: 'At the Doctor', description: 'Describe symptoms and understand medical advice', type: 'conversation', difficulty: 'advanced', duration: '15 min',
        content: {
          intro: 'Medical Spanish is important for emergencies and healthcare situations in Spanish-speaking countries.',
          keyPhrases: [
            { native: 'Me duele la cabeza', romanized: 'me dwele la kaβeθa', english: 'My head hurts' },
            { native: 'Tengo fiebre', romanized: 'teŋɡo fyeβɾe', english: 'I have a fever' },
            { native: 'Soy alérgico/a a...', romanized: 'soy alerxiko/a a', english: 'I am allergic to...' },
            { native: 'Necesito una receta', romanized: 'neθesito una reθeta', english: 'I need a prescription' },
            { native: '¿Dónde está la farmacia?', romanized: 'donde esta la farmaθya', english: 'Where is the pharmacy?' },
          ],
          tips: ['Carry a medical phrasebook when traveling', 'IMSS is Mexico\'s public health system', 'Spain has universal healthcare for residents'],
          practice: 'Write a doctor-patient dialogue describing symptoms and receiving advice.',
        },
      },
      {
        id: 'es-09', title: 'Spanish Subjunctive', description: 'Express desires, doubts, and hypotheticals', type: 'grammar', difficulty: 'advanced', duration: '20 min',
        content: {
          intro: 'The Spanish subjunctive expresses uncertainty, wishes, emotions, and hypotheticals. It is used very frequently in spoken Spanish.',
          keyPhrases: [
            { native: 'Quiero que vengas', romanized: 'kyero ke benɡas', english: 'I want you to come' },
            { native: 'Espero que llueva', romanized: 'espero ke ʎweβa', english: 'I hope it rains' },
            { native: 'Dudo que sea verdad', romanized: 'duδo ke sea berδad', english: 'I doubt that it is true' },
            { native: 'Es importante que estudies', romanized: 'es importante ke estuðyes', english: 'It is important that you study' },
            { native: 'Cuando llegues, llámame', romanized: 'kwando ʎeɡes ʎamame', english: 'When you arrive, call me' },
          ],
          tips: ['Trigger phrases: querer que, esperar que, es necesario que, dudar que', 'When subject is the same in both clauses, use infinitive instead', 'Subjunctive endings: -AR → -e, -ER/-IR → -a'],
          practice: 'Write 5 subjunctive sentences about things you hope or wish for.',
        },
      },
      {
        id: 'es-10', title: 'Spanish Idioms & Slang', description: 'Sound like a native with common expressions', type: 'vocabulary', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Spanish idioms add color and authenticity to your speech. They vary significantly by region.',
          keyPhrases: [
            { native: 'No hay mal que por bien no venga', romanized: '—', english: 'Every cloud has a silver lining' },
            { native: 'Me costó un ojo de la cara', romanized: '—', english: 'It cost me an arm and a leg' },
            { native: 'Estar en las nubes', romanized: '—', english: 'To have your head in the clouds' },
            { native: 'A quien madruga, Dios le ayuda', romanized: '—', english: 'The early bird catches the worm' },
            { native: '¡Qué guay!', romanized: 'Spain slang', english: 'How cool! (Spain)' },
          ],
          tips: ['Idioms cannot be translated literally — learn them as fixed phrases', 'Regional slang varies wildly — specify which Spanish you want to learn', 'Use idioms sparingly until you are confident with usage'],
          practice: 'Learn 3 Spanish idioms and use each in a creative sentence.',
        },
      },
    ],
  },
  {
    id: 'chinese',
    language: 'Chinese',
    flag: '🇨🇳',
    color: '#dc2626',
    gradient: 'from-red-600 to-yellow-500',
    lessons: [
      {
        id: 'zh-01', title: 'Mandarin Tones', description: 'Master the 4 tones plus neutral tone', type: 'pronunciation', difficulty: 'beginner', duration: '18 min',
        content: {
          intro: 'Mandarin Chinese has 4 tones plus a neutral tone. The same syllable with different tones has completely different meanings.',
          keyPhrases: [
            { native: 'mā (妈)', romanized: '1st tone (high level)', english: 'Mother' },
            { native: 'má (麻)', romanized: '2nd tone (rising)', english: 'Hemp / Numb' },
            { native: 'mǎ (马)', romanized: '3rd tone (dipping)', english: 'Horse' },
            { native: 'mà (骂)', romanized: '4th tone (falling)', english: 'To scold' },
            { native: 'ma (吗)', romanized: 'neutral tone', english: 'Question particle' },
          ],
          tips: ['Use your hand to gesture tone shapes while practicing', 'Record yourself and compare to native speakers', 'Tone errors cause misunderstandings — prioritize from the start'],
          practice: 'Practice all 4 tones on the syllables: ba, bi, bo, bu.',
        },
      },
      {
        id: 'zh-02', title: 'Pinyin System', description: 'Use Romanized pinyin to read Chinese', type: 'pronunciation', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'Pinyin is the Romanized system for Mandarin Chinese. It uses letters with tone marks to represent pronunciation.',
          keyPhrases: [
            { native: 'zh', romanized: 'like "j" in "judge"', english: 'Chinese consonant "zh"' },
            { native: 'x', romanized: 'like "sh" but softer', english: 'Chinese consonant "x"' },
            { native: 'q', romanized: 'like "ch" but forward', english: 'Chinese consonant "q"' },
            { native: 'ü', romanized: 'pursed lips "ee"', english: 'Front rounded vowel' },
            { native: 'r', romanized: 'retroflex r', english: 'Retroflex consonant in Chinese' },
          ],
          tips: ['Pinyin is not perfect English — the sounds differ significantly', 'Learn initials (consonants) and finals (vowels) separately', 'Pinyin is used on Chinese keyboards for typing'],
          practice: 'Write out the pinyin for 10 Chinese characters you know.',
        },
      },
      {
        id: 'zh-03', title: 'Greetings in Mandarin', description: 'Say hello and basic expressions in Chinese', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Chinese greetings are direct and practical. Asking "have you eaten?" (吃饭了吗) is a common greeting showing care.',
          keyPhrases: [
            { native: '你好', romanized: 'Nǐ hǎo', english: 'Hello' },
            { native: '谢谢', romanized: 'Xièxiè', english: 'Thank you' },
            { native: '对不起', romanized: 'Duìbuqǐ', english: 'Sorry / Excuse me' },
            { native: '再见', romanized: 'Zàijiàn', english: 'Goodbye' },
            { native: '吃饭了吗?', romanized: 'Chī fàn le ma?', english: 'Have you eaten? (friendly greeting)' },
          ],
          tips: ['Handshakes are common in modern China; bowing is less common than in Japan/Korea', '"Nǐ hǎo" uses the 3rd tone twice — the first becomes 2nd tone by tone sandhi rule', 'Say "Nǐ hǎo ma?" to ask how someone is doing'],
          practice: 'Practice greeting 5 people using different Chinese expressions.',
        },
      },
      {
        id: 'zh-04', title: 'Chinese Characters: Radicals', description: 'Understand the building blocks of Chinese writing', type: 'vocabulary', difficulty: 'intermediate', duration: '20 min',
        content: {
          intro: 'Chinese characters are built from radicals — component elements that hint at meaning. There are 214 Kangxi radicals.',
          keyPhrases: [
            { native: '人 (rén)', romanized: 'ren', english: 'Person radical' },
            { native: '水 (shuǐ)', romanized: 'shui', english: 'Water radical' },
            { native: '木 (mù)', romanized: 'mu', english: 'Tree/Wood radical' },
            { native: '口 (kǒu)', romanized: 'kou', english: 'Mouth radical' },
            { native: '心 (xīn)', romanized: 'xin', english: 'Heart radical' },
          ],
          tips: ['Knowing radicals helps you guess character meaning', 'Start with the 30 most common radicals', 'Use radical-based flashcard sets (Remembering Hanzi by Heisig)'],
          practice: 'Find 3 characters containing the water radical (氵) and write their meanings.',
        },
      },
      {
        id: 'zh-05', title: 'Numbers & Dates', description: 'Count and express dates in Mandarin', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Chinese numbers are logical and easy to learn. Once you know 1-10, you can form most other numbers.',
          keyPhrases: [
            { native: '一二三四五', romanized: 'yī èr sān sì wǔ', english: 'One two three four five' },
            { native: '六七八九十', romanized: 'liù qī bā jiǔ shí', english: 'Six seven eight nine ten' },
            { native: '今天几月几号?', romanized: 'Jīntiān jǐ yuè jǐ hào?', english: 'What is today\'s date?' },
            { native: '星期一', romanized: 'Xīngqīyī', english: 'Monday (Star period one)' },
            { native: '年/月/日', romanized: 'nián / yuè / rì', english: 'Year / Month / Day' },
          ],
          tips: ['Chinese dates go: Year → Month → Day (opposite of Western format)', 'Days of the week use numbers: 星期一 (Mon) through 星期日 (Sun)', 'Special number: 两 (liǎng) is used for "two" when counting objects'],
          practice: 'Write today\'s date in Chinese and say it aloud.',
        },
      },
      {
        id: 'zh-06', title: 'Basic Sentence Patterns', description: 'Build simple Mandarin sentences', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Mandarin grammar is simpler than many languages — no verb conjugation, no tenses with endings, no plurals.',
          keyPhrases: [
            { native: '我是学生', romanized: 'Wǒ shì xuéshēng', english: 'I am a student' },
            { native: '他有一本书', romanized: 'Tā yǒu yī běn shū', english: 'He has one book' },
            { native: '我喜欢中文', romanized: 'Wǒ xǐhuān zhōngwén', english: 'I like Chinese' },
            { native: '今天天气很好', romanized: 'Jīntiān tiānqì hěn hǎo', english: 'Today\'s weather is very good' },
            { native: '你去哪里?', romanized: 'Nǐ qù nǎlǐ?', english: 'Where are you going?' },
          ],
          tips: ['Time expressions come before the verb in Chinese', 'Questions use question words or the particle 吗', 'Negation uses 不 (bù) before verbs or 没 (méi) for past negation'],
          practice: 'Write 5 sentences about your daily routine in Mandarin.',
        },
      },
      {
        id: 'zh-07', title: 'Chinese Food Culture', description: 'Explore Chinese cuisine and dining customs', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Chinese cuisine is one of the world\'s most diverse and sophisticated, with 8 major regional cuisines.',
          keyPhrases: [
            { native: '北京烤鸭', romanized: 'Běijīng kǎoyā', english: 'Peking Duck' },
            { native: '饺子', romanized: 'Jiǎozi', english: 'Dumplings' },
            { native: '火锅', romanized: 'Huǒguō', english: 'Hot Pot' },
            { native: '请客', romanized: 'Qǐngkè', english: 'Treating others to a meal (common hospitality)' },
            { native: '干杯!', romanized: 'Gānbēi!', english: 'Cheers! (dry cup — drink all)' },
          ],
          tips: ['The host pays the bill in China — splitting is uncommon in traditional culture', 'Never flip fish over at the table (bad omen for fishermen)', 'Slurping soup is acceptable and shows appreciation'],
          practice: 'Research Sichuan cuisine and describe 3 dishes in English.',
        },
      },
      {
        id: 'zh-08', title: 'Measure Words', description: 'Use classifiers/measure words correctly in Chinese', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Every Chinese noun requires a specific measure word (量词) when used with numbers. There are hundreds, but a few key ones cover most situations.',
          keyPhrases: [
            { native: '一个人', romanized: 'yī gè rén', english: 'One person (个 gè = general)' },
            { native: '一本书', romanized: 'yī běn shū', english: 'One book (本 = bound objects)' },
            { native: '一张纸', romanized: 'yī zhāng zhǐ', english: 'One sheet of paper (张 = flat objects)' },
            { native: '一条鱼', romanized: 'yī tiáo yú', english: 'One fish (条 = long/flexible things)' },
            { native: '一只猫', romanized: 'yī zhī māo', english: 'One cat (只 = small animals)' },
          ],
          tips: ['个 (gè) works as a general measure word when unsure', 'Measure word errors rarely cause confusion — context helps', 'Learn measure words with the noun: 一本书, not just 书'],
          practice: 'Match 10 nouns with their correct measure words.',
        },
      },
      {
        id: 'zh-09', title: 'Chinese New Year Traditions', description: 'Celebrate Chinese festivals and customs', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Chinese New Year (春节 Chūnjié) is the most important celebration in Chinese culture, lasting 15 days.',
          keyPhrases: [
            { native: '新年快乐', romanized: 'Xīnnián kuàilè', english: 'Happy New Year' },
            { native: '恭喜发财', romanized: 'Gōngxǐ fācái', english: 'Wishing you prosperity (CNY greeting)' },
            { native: '红包', romanized: 'Hóngbāo', english: 'Red envelope (money gift)' },
            { native: '春联', romanized: 'Chūnlián', english: 'Spring couplets (door decorations)' },
            { native: '鞭炮', romanized: 'Biānpào', english: 'Firecrackers' },
          ],
          tips: ['Give red envelopes with even amounts (odd amounts are for funerals)', 'Avoid sweeping on New Year\'s Day — you sweep away luck', 'Wear red to attract good luck during the New Year'],
          practice: 'Write a New Year greeting card message in Chinese.',
        },
      },
      {
        id: 'zh-10', title: 'Shopping & Bargaining', description: 'Navigate Chinese markets and negotiate prices', type: 'conversation', difficulty: 'intermediate', duration: '14 min',
        content: {
          intro: 'Chinese markets like Yiwu and silk markets in Beijing are famous for bargaining. Knowing the phrases gives you an advantage.',
          keyPhrases: [
            { native: '多少钱?', romanized: 'Duōshǎo qián?', english: 'How much money?' },
            { native: '太贵了', romanized: 'Tài guì le', english: 'Too expensive' },
            { native: '便宜一点', romanized: 'Piányí yīdiǎn', english: 'A little cheaper' },
            { native: '我要这个', romanized: 'Wǒ yào zhège', english: 'I want this one' },
            { native: '刷卡可以吗?', romanized: 'Shuā kǎ kěyǐ ma?', english: 'Can I pay by card?' },
          ],
          tips: ['Start at 30-40% of the asking price in tourist markets', 'Walking away often prompts the seller to drop the price', 'Fixed price shops (明码实价) do not negotiate'],
          practice: 'Practice a bargaining dialogue aiming to halve the original price.',
        },
      },
    ],
  },
  {
    id: 'vietnamese',
    language: 'Vietnamese',
    flag: '🇻🇳',
    color: '#dc2626',
    gradient: 'from-red-600 to-yellow-400',
    lessons: [
      {
        id: 'vi-01', title: 'Vietnamese Tones (6 Tones)', description: 'Master all 6 Vietnamese tones', type: 'pronunciation', difficulty: 'beginner', duration: '20 min',
        content: {
          intro: 'Vietnamese is a tonal language with 6 tones. Tone marks are written above or below vowels in Vietnamese script.',
          keyPhrases: [
            { native: 'ma (không dấu)', romanized: 'level tone', english: '"Ghost" — flat mid tone' },
            { native: 'má (sắc)', romanized: 'rising tone', english: '"Cheek/Mother" — rising' },
            { native: 'mà (huyền)', romanized: 'falling tone', english: '"But" — low falling' },
            { native: 'mả (hỏi)', romanized: 'dipping tone', english: '"Grave/tomb" — dipping-rising' },
            { native: 'mã (ngã)', romanized: 'broken rising', english: '"Code/sign" — creaky rising' },
          ],
          tips: ['Southern Vietnamese (Saigon) has fewer distinct tones than Northern (Hanoi)', 'Use your hand to trace the tone shape while practicing', 'Tones are indicated by diacritics — learn the 5 diacritic marks'],
          practice: 'Practice each tone on the syllable "ma" five times.',
        },
      },
      {
        id: 'vi-02', title: 'Vietnamese Alphabet (Chữ Quốc Ngữ)', description: 'Learn the Latin-based Vietnamese script', type: 'pronunciation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Vietnamese uses a modified Latin alphabet (Chữ Quốc Ngữ) introduced by Portuguese missionaries. It is easier to learn than most Asian scripts.',
          keyPhrases: [
            { native: 'ă', romanized: 'short a', english: 'Short "a" vowel' },
            { native: 'â', romanized: 'deep a', english: 'Deep throat "a" vowel' },
            { native: 'ơ', romanized: 'unrounded "er"', english: 'Unrounded back vowel' },
            { native: 'ư', romanized: 'high back', english: 'High back unrounded vowel' },
            { native: 'đ', romanized: 'd (implosive)', english: 'Đ — unique Vietnamese letter' },
          ],
          tips: ['Vietnamese has 29 letters (12 vowels, 17 consonants)', 'Some letters do not appear in standard Vietnamese (f, j, w, z)', 'Tone marks are placed on the main vowel of each syllable'],
          practice: 'Write your name using Vietnamese letters and diacritics.',
        },
      },
      {
        id: 'vi-03', title: 'Xin Chào: Greetings', description: 'Essential Vietnamese greetings and etiquette', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Vietnamese greetings are uniquely tied to social hierarchy — you use different pronouns based on the age relationship.',
          keyPhrases: [
            { native: 'Xin chào', romanized: 'sin chow', english: 'Hello (formal)' },
            { native: 'Cảm ơn', romanized: 'kahm uhn', english: 'Thank you' },
            { native: 'Xin lỗi', romanized: 'sin loy', english: 'Sorry / Excuse me' },
            { native: 'Tạm biệt', romanized: 'tahm byet', english: 'Goodbye' },
            { native: 'Bạn có khỏe không?', romanized: 'ban co kwe khong', english: 'How are you? (to a friend)' },
          ],
          tips: ['Em (younger), Anh (older brother), Chị (older sister), Ông/Bà (grandparent) change pronouns', 'A slight bow shows respect to elders', 'Vietnamese people show affection through caring questions about meals'],
          practice: 'Greet someone older and younger than you using the correct pronouns.',
        },
      },
      {
        id: 'vi-04', title: 'Vietnamese Food Culture', description: 'Explore the rich world of Vietnamese cuisine', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Vietnamese food is celebrated globally for its fresh ingredients, balance of flavors, and regional diversity.',
          keyPhrases: [
            { native: 'Phở', romanized: 'Fuh', english: 'Beef/chicken noodle soup (national dish)' },
            { native: 'Bánh mì', romanized: 'Bahn mee', english: 'Vietnamese baguette sandwich' },
            { native: 'Gỏi cuốn', romanized: 'goy kwon', english: 'Fresh spring rolls' },
            { native: 'Bún bò Huế', romanized: 'bun baw hway', english: 'Spicy Hue beef noodle soup' },
            { native: 'Cà phê trứng', romanized: 'ka feh chung', english: 'Egg coffee (Hanoi specialty)' },
          ],
          tips: ['Vietnamese food varies by region — Hanoi, Hue, and Saigon have distinct styles', 'Fresh herbs are served with almost every dish', 'Street food is safe and delicious — look for busy stalls'],
          practice: 'Research the difference between Northern and Southern Vietnamese Phở.',
        },
      },
      {
        id: 'vi-05', title: 'Numbers & Counting', description: 'Count in Vietnamese for everyday use', type: 'vocabulary', difficulty: 'beginner', duration: '11 min',
        content: {
          intro: 'Vietnamese numbers are fairly straightforward. Once you learn 1-10, you can form larger numbers easily.',
          keyPhrases: [
            { native: 'một, hai, ba', romanized: 'moht, hi, ba', english: 'One, two, three' },
            { native: 'bốn, năm, sáu', romanized: 'bohn, nam, sau', english: 'Four, five, six' },
            { native: 'bảy, tám, chín, mười', romanized: 'bay, tam, chin, muoi', english: 'Seven, eight, nine, ten' },
            { native: 'một trăm', romanized: 'moht tram', english: 'One hundred' },
            { native: 'Bao nhiêu tiền?', romanized: 'bow nyew tyen', english: 'How much money?' },
          ],
          tips: ['Note: "lăm" replaces "năm" when in the units position', '"Nghìn" or "ngàn" both mean "thousand" (regional variation)', 'Vietnamese currency is Đồng (VND) — prices can be in millions'],
          practice: 'Practice saying prices of items in Vietnamese Dong.',
        },
      },
      {
        id: 'vi-06', title: 'Basic Sentence Structure', description: 'Build simple Vietnamese sentences', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Vietnamese follows Subject-Verb-Object order like English. There are no verb conjugations or grammatical gender.',
          keyPhrases: [
            { native: 'Tôi ăn cơm', romanized: 'toy an kum', english: 'I eat rice' },
            { native: 'Anh ấy học tiếng Anh', romanized: 'anh ay hok tyeng anh', english: 'He studies English' },
            { native: 'Chúng tôi thích Việt Nam', romanized: 'chung toy thik vyet nam', english: 'We like Vietnam' },
            { native: 'Cô ấy đẹp lắm', romanized: 'koh ay dep lam', english: 'She is very beautiful' },
            { native: 'Tôi không hiểu', romanized: 'toy khong hyew', english: 'I do not understand' },
          ],
          tips: ['Negation uses "không" before verbs', 'Questions are formed by adding "không?" or "à?" at the end', 'Time words come before or after the subject, not after the verb'],
          practice: 'Write 5 sentences about yourself in Vietnamese.',
        },
      },
      {
        id: 'vi-07', title: 'Vietnamese Festivals', description: 'Celebrate Tết and major Vietnamese traditions', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Tết Nguyên Đán (Vietnamese Lunar New Year) is the most important holiday — a time for family reunion, offerings, and new beginnings.',
          keyPhrases: [
            { native: 'Chúc Mừng Năm Mới', romanized: 'chuk mung nam moy', english: 'Happy New Year' },
            { native: 'Bánh chưng', romanized: 'banh chung', english: 'Square sticky rice cake (Tet food)' },
            { native: 'Lì xì', romanized: 'lee see', english: 'Lucky money in red envelope' },
            { native: 'Hội An', romanized: 'Hoy An', english: 'Ancient town famous for lantern festival' },
            { native: 'Trung Thu', romanized: 'Chung Too', english: 'Mid-Autumn Festival (mooncake celebration)' },
          ],
          tips: ['Clean your house before Tết — never on New Year\'s Day itself', 'Wear red or new clothes on Tết for good luck', 'The first visitor to a home on New Year\'s Day brings fortune or misfortune'],
          practice: 'Write a Tết greeting card in Vietnamese.',
        },
      },
      {
        id: 'vi-08', title: 'At the Market (Chợ)', description: 'Navigate Vietnamese markets with confidence', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Vietnamese wet markets (chợ) are lively and colorful. Bargaining is expected in most traditional markets.',
          keyPhrases: [
            { native: 'Cái này giá bao nhiêu?', romanized: 'kai nay jah bao nyew', english: 'How much is this?' },
            { native: 'Đắt quá!', romanized: 'daht kwa', english: 'Too expensive!' },
            { native: 'Bớt đi một chút', romanized: 'bert dee moht chut', english: 'Reduce it a little' },
            { native: 'Cho tôi xem', romanized: 'cho toy sem', english: 'Let me see it' },
            { native: 'Tôi mua cái này', romanized: 'toy mua kai nay', english: 'I will buy this one' },
          ],
          tips: ['Always smile when bargaining — confrontation is culturally inappropriate', 'Start at half the asking price in tourist areas', 'Supermarkets (siêu thị) have fixed prices'],
          practice: 'Role-play buying fruit at a Vietnamese market with a partner.',
        },
      },
      {
        id: 'vi-09', title: 'Vietnamese Classifiers', description: 'Use noun classifiers correctly in Vietnamese', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Like Chinese, Vietnamese uses classifiers before nouns when counting or specifying. They indicate the category of object.',
          keyPhrases: [
            { native: 'con chó', romanized: 'kon cho', english: 'Dog (con = living things)' },
            { native: 'cái bàn', romanized: 'kai ban', english: 'Table (cái = inanimate objects)' },
            { native: 'quyển sách', romanized: 'kwen sak', english: 'Book (quyển = bound objects)' },
            { native: 'tờ báo', romanized: 'tuh bao', english: 'Newspaper (tờ = flat sheets)' },
            { native: 'cốc nước', romanized: 'kohk nuok', english: 'Glass of water (cốc = cup-shaped)' },
          ],
          tips: ['Cái is the most common general classifier — use when unsure', 'Con is used for animals and some other objects', 'Classifiers also change meaning slightly (chiếc vs cái for shoes)'],
          practice: 'List 10 objects and assign the correct Vietnamese classifier to each.',
        },
      },
      {
        id: 'vi-10', title: 'Travel Phrases in Vietnam', description: 'Navigate Vietnam by bus, taxi, and motorbike', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Vietnam is increasingly popular with tourists. Knowing transportation phrases makes your travel smoother.',
          keyPhrases: [
            { native: 'Bến xe buýt ở đâu?', romanized: 'ben se bweet uh dau', english: 'Where is the bus station?' },
            { native: 'Cho tôi đến...', romanized: 'cho toy den', english: 'Take me to... (taxi/xe ôm)' },
            { native: 'Bao nhiêu tiền?', romanized: 'bao nyew tyen', english: 'How much?' },
            { native: 'Dừng ở đây', romanized: 'dung uh day', english: 'Stop here' },
            { native: 'Cách đây bao xa?', romanized: 'kak day bao sa', english: 'How far from here?' },
          ],
          tips: ['Grab (SE Asian Uber) is widely used in Vietnam for fair prices', 'Negotiate xe ôm (motorbike taxi) price before getting on', 'Long-distance travel: sleeper buses are comfortable and cheap'],
          practice: 'Plan a 3-city Vietnam trip itinerary using transportation vocabulary.',
        },
      },
    ],
  },
];

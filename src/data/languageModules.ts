
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
      {
        id: 'th-11', title: 'Weather & Seasons', description: 'Talk about the weather and climate in Thailand', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Thailand has a tropical climate. Knowing weather words helps you discuss the weather in daily conversation.',
          keyPhrases: [
            { native: 'ร้อน', romanized: 'Ron', english: 'Hot' },
            { native: 'ฝนตก', romanized: 'Fon tok', english: 'Raining' },
            { native: 'หนาว', romanized: 'Nao', english: 'Cold / Cool' },
            { native: 'ฤดูฝน', romanized: 'Ruedoo fon', english: 'Rainy season' },
            { native: 'พายุ', romanized: 'Phayu', english: 'Storm' },
          ],
          tips: ['Thailand has three distinct seasons: hot, rainy, and cool', 'Use "mak" (very) to emphasize, e.g., "Ron mak" (very hot)', 'The cool season is from November to February'],
          practice: 'Describe today\'s weather in Thai to a friend.',
        },
      },
      {
        id: 'th-12', title: 'Temple Etiquette', description: 'Learn key customs when visiting a Buddhist temple', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Buddhist temples (Wat) are sacred spaces. Behaving respectfully is essential when visiting.',
          keyPhrases: [
            { native: 'วัด', romanized: 'Wat', english: 'Temple' },
            { native: 'พระ', romanized: 'Phra', english: 'Monk' },
            { native: 'ถอดรองเท้า', romanized: 'Thot rong thao', english: 'Take off shoes' },
            { native: 'ห้ามถ่ายรูป', romanized: 'Ham thai roop', english: 'Do not take photos' },
            { native: 'ทำบุญ', romanized: 'Tham bun', english: 'To make merit' },
          ],
          tips: ['Dress politely: cover shoulders and knees', 'Remove your shoes before entering the main temple building', 'Avoid pointing your feet at a monk or Buddha image'],
          practice: 'List 3 rules you must follow when visiting a Thai temple.',
        },
      },
{
        id: 'th-13', title: 'Directions: Taking a Taxi', description: 'Interact with taxi drivers and navigate routes', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Get to destinations by taxi or rideshare using direct conversational phrases.',
          keyPhrases: [
            { native: 'ไปโรงพยาบาล', romanized: 'Pai rong phayaban', english: 'Go to the hospital' },
            { native: 'ไปโรงแรม', romanized: 'Pai rong raem', english: 'Go to the hotel' },
            { native: 'จอดตรงนี้', romanized: 'Chot trong ni', english: 'Park / stop here' },
            { native: 'เปิดมิเตอร์ด้วย', romanized: 'Poet meter duai', english: 'Please turn on the meter' },
            { native: 'ไม่ต้องทอน', romanized: 'Mai tong thon', english: 'Keep the change' },
            { native: 'ขึ้นทางด่วนไหม', romanized: 'Khun thang duan mai', english: 'Take the tollway?' },
            { native: 'ตรงไปเรื่อยๆ', romanized: 'Trong pai reuay reuay', english: 'Keep going straight' },
            { native: 'เลี้ยวซ้ายข้างหน้า', romanized: 'Liao sai khang na', english: 'Turn left ahead' },
            { native: 'เลี้ยวขวาที่ไฟแดง', romanized: 'Liao kwa thi fai daeng', english: 'Turn right at the red light' },
            { native: 'ขอบคุณครับ/ค่ะ', romanized: 'Khob khun krap/ka', english: 'Thank you (polite)' }
          ],
          tips: ['Always ask to turn on the meter ("Poet meter duai")', 'Ridesharing apps like Grab are highly popular and safe'],
          practice: 'Simulate a taxi ride asking to go to the airport and requesting the meter.',
        },
      },
{
        id: 'th-14', title: 'Thai Body Language & Respect', description: 'Learn social gestures and taboos in Thailand', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Body language in Thailand carries cultural values. Read about the head, feet, and general posturing.',
          keyPhrases: [
            { native: 'ไหว้', romanized: 'Wai', english: 'Polite greeting gesture' },
            { native: 'หัว', romanized: 'Hua', english: 'Head (sacred part of the body)' },
            { native: 'เท้า', romanized: 'Thao', english: 'Feet (lowest / unclean part)' },
            { native: 'ก้มหัว', romanized: 'Kom hua', english: 'Lower your head when passing elders' },
            { native: 'ยิ้ม', romanized: 'Yim', english: 'Smile (conveys multiple emotions)' },
            { native: 'เกรงใจ', romanized: 'Kreng jai', english: 'Considerateness / not wanting to burden' },
            { native: 'สุภาพ', romanized: 'Suphap', english: 'Polite / soft-spoken' },
            { native: 'ไม่สุภาพ', romanized: 'Mai suphap', english: 'Impolite' },
            { native: 'ให้เกียรti', romanized: 'Hai kiat', english: 'Show respect / give honor' },
            { native: 'ชี้', romanized: 'Chi', english: 'Pointing (avoid pointing feet at objects)' }
          ],
          tips: ['Never touch anyone on the head', 'Avoid pointing your foot at people or objects'],
          practice: 'Practice walking past a colleague while slightly lowering your head as a sign of respect.',
        },
      },
{
        id: 'th-15', title: 'Simple Past & Future Tenses', description: 'Express timing using tense markers', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Understand past and future timeline structures using indicator particles.',
          keyPhrases: [
            { native: 'แล้ว', romanized: 'Laeo', english: 'Already (past marker)' },
            { native: 'จะ', romanized: 'Cha', english: 'Will (future marker)' },
            { native: 'เมื่อวานนี้', romanized: 'Muea wan ni', english: 'Yesterday' },
            { native: 'พรุ่งนี้', romanized: 'Phrung ni', english: 'Tomorrow' },
            { native: 'กินข้าวแล้ว', romanized: 'Gin khao laeo', english: 'Ate rice already' },
            { native: 'จะไปกรุงเทพฯ', romanized: 'Cha pai krung-thep', english: 'Will go to Bangkok' },
            { native: 'เคย', romanized: 'Khoey', english: 'Used to / Ever' },
            { native: 'ยังไม่ได้', romanized: 'Yang mai dai', english: 'Not yet' },
            { native: 'ปีที่แล้ว', romanized: 'Pee thi laeo', english: 'Last year' },
            { native: 'ปีหน้า', romanized: 'Pee na', english: 'Next year' }
          ],
          tips: ['"Laeo" goes at the end of the sentence to show completion', '"Cha" goes before the verb to show intent/future'],
          practice: 'Translate "I will eat pad thai tomorrow" and "I visited Chiang Mai last year".',
        },
      },
{
        id: 'th-16', title: 'Thai Idioms & Slang', description: 'Learn colorful expressions and slang used in daily Thai conversations', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Thai slang is widely used in informal settings. Master these popular terms.',
          keyPhrases: [
            { native: 'กล้วยๆ', romanized: 'Kluai kluai', english: 'Piece of cake / Very easy' },
            { native: 'เทน้ำเทท่า', romanized: 'The nam the tha', english: 'Selling like hot cakes' },
            { native: 'ชิวๆ', romanized: 'Chill chill', english: 'Relaxed / Taking it easy' },
            { native: 'งานเข้า', romanized: 'Ngan khao', english: 'In trouble / Work has entered' },
            { native: 'ทางใครทางมัน', romanized: 'Thang khrai thang man', english: 'Go our separate ways' }
          ],
          tips: ['Doubling a word often intensifies or makes it casual', '"Ngan khao" is very common when unexpected trouble happens'],
          practice: 'Use "Chill chill" and "Ngan khao" in a short role-play.'
        }
      },
{
        id: 'th-17', title: 'Thai Proverbs & Sayings', description: 'Explore traditional Thai proverbs and wise sayings', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Thai proverbs reflect Buddhist values, agricultural history, and social rules.',
          keyPhrases: [
            { native: 'น้ำขึ้นให้รีบตัก', romanized: 'Nam khun hai reep tak', english: 'Strike while the iron is hot' },
            { native: 'ช้างตายทั้งตัวเอาใบบัวปิด', romanized: 'Chang tai tang tua ao bai bua pit', english: 'You cannot hide a massive misdeed with a small cover-up' },
            { native: 'ข้าวใหม่ปลามัน', romanized: 'Khao mai pla man', english: 'Honeymoon period / New love' },
            { native: 'หัวล้านได้หวี', romanized: 'Hua lan dai wee', english: 'Getting a gift you cannot use' },
            { native: 'รักวัวให้ผูกรักลูกให้ตี', romanized: 'Rak wua hai phuk rak luk hai tee', english: 'Spare the rod, spoil the child' }
          ],
          tips: ['Proverbs often rhyme in Thai', 'Many refer to animals like elephants, cows, and fish'],
          practice: 'Explain the meaning of "Nam khun hai reep tak" in your own words.'
        }
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
      {
        id: 'ko-11', title: 'Korean Hobbies & Activities', description: 'Talk about popular pastimes in South Korea', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'South Koreans enjoy a variety of active and indoor hobbies. Sharing hobbies is a common way to build connections.',
          keyPhrases: [
            { native: '등산', romanized: 'Deungsan', english: 'Hiking' },
            { native: '노래방', romanized: 'Noraebang', english: 'Karaoke' },
            { native: 'PC방', romanized: 'PC bang', english: 'Internet cafe' },
            { native: '영화', romanized: 'Yeonghwa', english: 'Movie' },
            { native: '쇼핑', romanized: 'Syoping', english: 'Shopping' },
          ],
          tips: ['Noraebang (song room) is very popular for group outings', 'Hiking (Deungsan) is a national weekend pastime', 'PC bangs offer ultra-fast internet and gaming setups'],
          practice: 'List three hobbies you enjoy using Korean vocabulary.',
        },
      },
      {
        id: 'ko-12', title: 'K-Food: Street Food', description: 'Discover the delicious street food of Korea', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Korea has a vibrant street food culture, particularly around traditional markets and nightlife hubs.',
          keyPhrases: [
            { native: '오뎅', romanized: 'Odeng', english: 'Fish cakes' },
            { native: '김밥', romanized: 'Gimbap', english: 'Seaweed rice rolls' },
            { native: '순대', romanized: 'Sundae', english: 'Blood sausage' },
            { native: '튀김', romanized: 'Twigim', english: 'Fried food' },
            { native: '포장마차', romanized: 'Pojangmacha', english: 'Street food stall / tent' },
          ],
          tips: ['Street foods are usually cheap and served with hot broth (odeng guk) for free', 'Pojangmacha are street tents that also serve alcohol', 'Gimbap is a popular lunchbox picnic food'],
          practice: 'Imagine you are ordering food at a Pojangmacha. List your choices.',
        },
      },
{
        id: 'ko-13', title: 'Asking for Help & Directions', description: 'Request help and clarify locations', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Ask for assistance in public settings or ask passersby for directory help.',
          keyPhrases: [
            { native: '도와주세요', romanized: 'Dowajuseyo', english: 'Please help me' },
            { native: '길을 잃었어요', romanized: 'Gireul ireosseoyo', english: 'I am lost' },
            { native: '화장실이 어디예요?', romanized: 'Hwajangsiri eodiyeyo?', english: 'Where is the restroom?' },
            { native: '여기가 어디예요?', romanized: 'Yeogiga eodiyeyo?', english: 'Where is this place?' },
            { native: '다시 말씀해 주세요', romanized: 'Dasi malsseumhae juseyo', english: 'Please say it again' },
            { native: '천천히 말해 주세요', romanized: 'Cheoncheonhi malhae juseyo', english: 'Please speak slowly' },
            { native: '영어를 할 수 있어요?', romanized: 'Yeongheoreul hal su isseyo?', english: 'Can you speak English?' },
            { native: '경찰서', romanized: 'Gyeongchalseo', english: 'Police station' },
            { native: '병원', romanized: 'Byeongwon', english: 'Hospital' },
            { native: '도와주셔서 감사합니다', romanized: 'Dowajusyeoseo gamsahamnida', english: 'Thank you for helping' }
          ],
          tips: ['If you need assistance, politely approach someone and say "Sillyehamnida" first'],
          practice: 'Practice telling someone you are lost and asking for the restroom.',
        },
      },
{
        id: 'ko-14', title: 'Korean Bowing & Gift Etiquette', description: 'Social manners and gifting customs', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Study bowing, receiving items with two hands, and housewarming gifts.',
          keyPhrases: [
            { native: '절', romanized: 'Jeol', english: 'Traditional deep bow' },
            { native: '두 손으로', romanized: 'Du soneuro', english: 'With both hands' },
            { native: '선물', romanized: 'Seonmul', english: 'Gift / Present' },
            { native: '집들이', romanized: 'Jipdeuri', english: 'Housewarming party' },
            { native: '세제 / 화장지', romanized: 'Seje / Hwajangji', english: 'Detergent / Toilet paper' },
            { native: '예의', romanized: 'Yeeui', english: 'Manners / Etiquette' },
            { native: '인사', romanized: 'Insa', english: 'Greeting / Bowing' },
            { native: '존중', romanized: 'Jonjung', english: 'Respect' },
            { native: '거절하다', romanized: 'Geojeolhada', english: 'To decline (politely)' },
            { native: '감사', romanized: 'Gamsa', english: 'Gratitude' }
          ],
          tips: ['Always pass and receive drinks, business cards, or gifts with two hands'],
          practice: 'Simulate handing a package to an elder using both hands.',
        },
      },
{
        id: 'ko-15', title: 'Past Tense Sentences', description: 'Conjugate verbs into past tense timelines', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Learn how to form past tense statements ending in -asseoyo / -eosseoyo.',
          keyPhrases: [
            { native: '갔어요', romanized: 'Gasseoyo', english: 'Went (past of 가다)' },
            { native: '먹었어요', romanized: 'Meogeosseoyo', english: 'Ate (past of 먹다)' },
            { native: '공부했어요', romanized: 'Gongbuhaesseoyo', english: 'Studied (past of 공부하다)' },
            { native: '어제', romanized: 'Eoje', english: 'Yesterday' },
            { native: '지난주', romanized: 'Jinanju', english: 'Last week' },
            { native: '받았어요', romanized: 'Badasseoyo', english: 'Received (past of 받다)' },
            { native: '봤어요', romanized: 'Bwasseoyo', english: 'Saw / Watched (past of 보다)' },
            { native: '했어요', romanized: 'Haesseoyo', english: 'Did (past of 하다)' },
            { native: '재미있었어요', romanized: 'Jaemi-isseosseoyo', english: 'It was fun' },
            { native: '어제 영화를 봤어요', romanized: 'Eoje yeonghwareul bwasseoyo', english: 'I watched a movie yesterday' }
          ],
          tips: ['Verb roots with "ㅏ" or "ㅗ" add "-았어요", others add "-었어요"; "-하다" verbs become "-했어요"'],
          practice: 'Change the sentence "김치를 먹어요" (I eat kimchi) to past tense.',
        },
      },
{
        id: 'ko-16', title: 'Korean Idioms & Slang', description: 'Learn popular idiomatic expressions and modern slang in South Korea', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Korean idioms (Gwanyonggu) and modern slangs reflect daily life, food, and feelings.',
          keyPhrases: [
            { native: '식은 죽 먹기', romanized: 'Sigeun juk meokgi', english: 'Piece of cake (lit. eating cold porridge)' },
            { native: '누워서 떡 먹기', romanized: 'Nuwoseo tteok meokgi', english: 'Extremely easy (lit. eating rice cakes while lying down)' },
            { native: '심쿵', romanized: 'Simkung', english: 'Heartthrob / Heart skip a beat' },
            { native: '밀당', romanized: 'Mildang', english: 'Push and pull in relationships' },
            { native: '피가 되고 살이 된다', romanized: 'Piga doego sari doenda', english: 'Highly beneficial (lit. becomes blood and flesh)' }
          ],
          tips: ['Food-related metaphors are extremely common in Korean expressions', '"Simkung" is widely used by younger generations'],
          practice: 'Create a sentence about a test or chore using "식은 죽 먹기".'
        }
      },
{
        id: 'ko-17', title: 'Korean Proverbs (Sokdam)', description: 'Understand traditional Korean wisdom and cultural proverbs', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Proverbs (Sokdam) offer a glimpse into traditional Korean lifestyles and advice.',
          keyPhrases: [
            { native: '티끌 모아 태산', romanized: 'Tiggle moa taesan', english: 'Dust gathered becomes a mountain' },
            { native: '시작이 반이다', romanized: 'Sijagi banida', english: 'Starting is half the battle' },
            { native: '금강산도 식후경', romanized: 'Geumgangsando sikhugyeong', english: 'Even at Mt. Geumgang, eat first' },
            { native: '원숭이도 나무에서 떨어진다', romanized: 'Wonsungido namueseo tteoreojinda', english: 'Even monkeys fall from trees (experts make mistakes)' },
            { native: '백지장도 맞들면 낫다', romanized: 'Baekjijangdo matdeulmyeon natda', english: 'Two heads are better than one' }
          ],
          tips: ['"Geumgangsando sikhugyeong" highlights the importance of eating before doing activities', 'Many proverbs emphasize diligence and cooperation'],
          practice: 'Explain the meaning of "시작이 반이다" in English.'
        }
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
      {
        id: 'ja-11', title: 'Weather & Seasons', description: 'Discuss Japan\'s weather and four seasons', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Japan has four distinct and highly celebrated seasons (Shiki). Knowing weather words is great for small talk.',
          keyPhrases: [
            { native: '晴れ', romanized: 'Hare', english: 'Sunny' },
            { native: '雨', romanized: 'Ame', english: 'Rainy' },
            { native: '暑い', romanized: 'Atsui', english: 'Hot' },
            { native: '寒い', romanized: 'Samui', english: 'Cold' },
            { native: '桜', romanized: 'Sakura', english: 'Cherry blossom' },
          ],
          tips: ['Hanami (cherry blossom viewing) happens in Spring (Haru)', 'Koyo (autumn leaves viewing) occurs in Fall (Aki)', 'Use "desu" to make weather statements polite, e.g. "Ame desu"'],
          practice: 'State the current weather of your location in Japanese.',
        },
      },
      {
        id: 'ja-12', title: 'Japanese Onsen Culture', description: 'Learn the rules of visiting a hot spring', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Onsens are natural hot springs essential to Japanese relaxation. Respecting the bathing rules is mandatory.',
          keyPhrases: [
            { native: '温泉', romanized: 'Onsen', english: 'Hot spring' },
            { native: '湯', romanized: 'Yu', english: 'Hot water' },
            { native: '浴衣', romanized: 'Yukata', english: 'Light kimono' },
            { native: '脱衣所', romanized: 'Datsuijo', english: 'Changing room' },
            { native: '洗う', romanized: 'Arau', english: 'To wash' },
          ],
          tips: ['Wash your body completely before entering the bathwater', 'Do not put towels or hair into the hot spring water', 'Check the tattoo policy before booking, as some onsens forbid them'],
          practice: 'List three steps you should follow when visiting an Onsen.',
        },
      },
{
        id: 'ja-13', title: 'Asking for Directions in Tokyo', description: 'Navigate Tokyo stations and streets', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Get lost and find landmarks in metropolitan Tokyo with confidence.',
          keyPhrases: [
            { native: '駅はどこですか', romanized: 'Eki wa doko desu ka', english: 'Where is the station?' },
            { native: 'まっすぐ行ってください', romanized: 'Massugu itte kudasai', english: 'Please go straight' },
            { native: '左に曲がってください', romanized: 'Hidari ni magatte kudasai', english: 'Please turn left' },
            { native: '右に曲がってください', romanized: 'Migi ni magatte kudasai', english: 'Please turn right' },
            { native: '交番', romanized: 'Kooban', english: 'Police box' },
            { native: '切符売り場', romanized: 'Kippu uriba', english: 'Ticket office' },
            { native: '改札口', romanized: 'Kaisatsuguchi', english: 'Ticket gate' },
            { native: '出口 / 入口', romanized: 'Deguchi / Iriguchi', english: 'Exit / Entrance' },
            { native: 'ここから遠いですか', romanized: 'Koko kara tooi desu ka', english: 'Is it far from here?' },
            { native: 'ありがとうございます', romanized: 'Arigatou gozaimasu', english: 'Thank you very much' }
          ],
          tips: ['Find the nearest "Kooban" (police box) if you get completely lost'],
          practice: 'Ask someone where Shinjuku station is: "Shinjuku eki wa doko desu ka?".',
        },
      },
{
        id: 'ja-14', title: 'Gift Giving & Omiyage', description: 'Learn Japanese gifting culture and etiquette', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Learn about Omiyage (souvenirs) and how to give/receive gifts.',
          keyPhrases: [
            { native: 'お土産', romanized: 'Omiyage', english: 'Souvenir / regional gift' },
            { native: 'つまらないものですが', romanized: 'Tsumaranai mono desu ga', english: 'It\'s nothing special, but... (humble)' },
            { native: 'どうぞ', romanized: 'Douzo', english: 'Here you go' },
            { native: '手土産', romanized: 'Temiyage', english: 'Thank-you gift brought to a house visit' },
            { native: '熨斗', romanized: 'Noshi', english: 'Decorative gift wrapping paper' },
            { native: 'お返し', romanized: 'Okaeshi', english: 'Return gift (obligatory thank-you gift)' },
            { native: '遠慮', romanized: 'Enryo', english: 'Hesitation / polite declining' },
            { native: '贈り物', romanized: 'Okurimono', english: 'Gift / Present' },
            { native: '両手で渡す', romanized: 'Ryoute de watasu', english: 'Hand over with both hands' },
            { native: 'ありがとうございました', romanized: 'Arigatou gozaimashita', english: 'Thank you for what you did' }
          ],
          tips: ['Never open a gift immediately after receiving it unless invited to do so'],
          practice: 'Simulate presenting a gift saying "Douzo" with both hands.',
        },
      },
{
        id: 'ja-15', title: 'Past Tense: Ta-form', description: 'Conjugate verbs into past tense forms', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Convert verbs into past tense using the Ta-form (informal past).',
          keyPhrases: [
            { native: '食べた', romanized: 'Tabeta', english: 'Ate (past of taberu)' },
            { native: '行った', romanized: 'Itta', english: 'Went (past of iku)' },
            { native: '読んだ', romanized: 'Yonda', english: 'Read (past of yomu)' },
            { native: 'しました', romanized: 'Shimashita', english: 'Did (formal past of suru)' },
            { native: '食べました', romanized: 'Tabemashita', english: 'Ate (formal past of taberu)' },
            { native: '昨日', romanized: 'Kinou', english: 'Yesterday' },
            { native: '先週', romanized: 'Senshuu', english: 'Last week' },
            { native: '買った', romanized: 'Katta', english: 'Bought (past of kau)' },
            { native: '見た', romanized: 'Mita', english: 'Saw / Watched (past of miru)' },
            { native: '映画を見た', romanized: 'Eiga wo mita', english: 'I watched a movie' }
          ],
          tips: ['Ta-form conjugates exactly like Te-form, just substitute "ta/da" for "te/de"'],
          practice: 'Convert "hon wo yomimasu" (I read a book) into formal past tense.',
        },
      },
{
        id: 'ja-16', title: 'Japanese Idioms & Colloquialisms', description: 'Learn everyday idiomatic phrases and popular colloquial Japanese', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Japanese colloquialisms add natural flavor to your speech. Study these common idioms.',
          keyPhrases: [
            { native: '朝飯前', romanized: 'Asameshimae', english: 'Piece of cake (lit. before breakfast)' },
            { native: '猫の手も借りたい', romanized: 'Neko no te mo karitai', english: 'Extremely busy (lit. wanting to borrow even a cat\'s paw)' },
            { native: '相槌を打つ', romanized: 'Aiduchi wo utsu', english: 'Nodding in agreement (backchanneling)' },
            { native: '口が軽い', romanized: 'Kuchi ga karui', english: 'Having a loose tongue (cannot keep secrets)' },
            { native: '腹が立つ', romanized: 'Hara ga tatsu', english: 'To get angry (lit. stomach stands up)' }
          ],
          tips: ['Conversational backchannels ("Aiduchi") like "Un", "Hee", or "Soudesu ne" show active listening', 'Many idioms refer to body parts (stomach, mouth, eyes)'],
          practice: 'Describe a busy schedule using "Neko no te mo karitai".'
        }
      },
{
        id: 'ja-17', title: 'Japanese Kotowaza (Proverbs)', description: 'Learn traditional Japanese proverbs and life advice', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Proverbs (Kotowaza) embody centuries of Japanese philosophies on life, nature, and resilience.',
          keyPhrases: [
            { native: '猿も木から落ちる', romanized: 'Saru mo ki kara ochiru', english: 'Even monkeys fall from trees (experts make mistakes)' },
            { native: '七転び八起き', romanized: 'Nanakorobi yaoki', english: 'Fall seven times, stand up eight (resilience)' },
            { native: '一期一会', romanized: 'Ichigo ichie', english: 'Once-in-a-lifetime encounter' },
            { native: 'ちりも積もれば山となる', romanized: 'Chiri mo tsumoreba yama to naru', english: 'Dust piled up becomes a mountain (every bit counts)' },
            { native: '井の中の蛙大海を知らず', romanized: 'I no naka no kawazu taikai wo shirazu', english: 'A frog in a well knows nothing of the great ocean' }
          ],
          tips: ['Four-character idioms (Yojijukugo) like "Ichigo ichie" are highly valued', '"Nanakorobi yaoki" is a core tenet of Japanese perseverance'],
          practice: 'Explain the meaning of "Ichigo ichie" in your own words.'
        }
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
      {
        id: 'fr-11', title: 'Le Climat (Weather)', description: 'Describe weather conditions and seasons', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Describing the weather is a great way to engage in conversations in France.',
          keyPhrases: [
            { native: 'Il fait beau', romanized: 'il fe bo', english: 'It is nice weather' },
            { native: 'Il pleut', romanized: 'il plø', english: 'It is raining' },
            { native: 'Chaud', romanized: 'sho', english: 'Hot' },
            { native: 'Froid', romanized: 'fʁwa', english: 'Cold' },
            { native: 'Le soleil', romanized: 'luh sɔlɛj', english: 'The sun' },
          ],
          tips: ['French uses "il fait" (literally: it makes) to describe weather, e.g. "Il fait froid"', 'To say it is snowing, use "Il neige"', 'Seasons are masculine: le printemps (spring), l\'été (summer), l\'automne (fall), l\'hiver (winter)'],
          practice: 'Write a short message to a friend about the weather forecast this weekend.',
        },
      },
      {
        id: 'fr-12', title: 'French Cafe Culture', description: 'Order coffee and experience Parisian cafe life', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Cafes are the heartbeat of French social life, serving as places to chat, read, and watch the world go by.',
          keyPhrases: [
            { native: 'Un café', romanized: 'œ̃ kafe', english: 'An espresso' },
            { native: 'Un croissant', romanized: 'œ̃ kʁwasɑ̃', english: 'A croissant' },
            { native: 'L\'addition', romanized: 'ladisjɔ̃', english: 'The bill / check' },
            { native: 'Terrasse', romanized: 'tɛʁas', english: 'Outdoor seating area' },
            { native: 'S\'il vous plaît', romanized: 'sil vu ple', english: 'Please (formal)' },
          ],
          tips: ['Ordering "un café" in France gets you a small, strong black espresso', 'Always start your order with "Bonjour" to be polite', 'Waiters are called "Monsieur", do not shout "Garçon"'],
          practice: 'Create a short roleplay dialogue ordering a coffee and croissant.',
        },
      },
{
        id: 'fr-13', title: 'Directions: Asking on the Street', description: 'Navigate Parisian neighborhoods', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Locate monuments and train stations using standard navigational phrasing.',
          keyPhrases: [
            { native: 'Où est la station de métro?', romanized: '—', english: 'Where is the subway station?' },
            { native: 'Tournez à gauche', romanized: '—', english: 'Turn left' },
            { native: 'Tournez à droite', romanized: '—', english: 'Turn right' },
            { native: 'Allez tout droit', romanized: '—', english: 'Go straight ahead' },
            { native: 'C\'est près d\'ici?', romanized: '—', english: 'Is it near here?' },
            { native: 'C\'est loin?', romanized: '—', english: 'Is it far?' },
            { native: 'Le plan', romanized: '—', english: 'The map' },
            { native: 'Pardon, je cherche...', romanized: '—', english: 'Excuse me, I am looking for...' },
            { native: 'Où se trouve...?', romanized: '—', english: 'Where is [located]...?' },
            { native: 'Merci beaucoup', romanized: '—', english: 'Thank you very much' }
          ],
          tips: ['Start street questions with "Pardon" (excuse me) to show courtesy'],
          practice: 'Practice asking for the Louvre museum and asking if it is far.',
        },
      },
{
        id: 'fr-14', title: 'French Social Manners & dinner', description: 'Master social customs and dining protocol', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Study French social rules, checking cheek kisses, and hosting manners.',
          keyPhrases: [
            { native: 'La bise', romanized: '—', english: 'Greeting cheek kisses' },
            { native: 'Bon appétit', romanized: '—', english: 'Enjoy your meal' },
            { native: 'Santé !', romanized: 'sahn-tay', english: 'Cheers! (Health)' },
            { native: 'Madame / Monsieur', romanized: '—', english: 'Mrs. / Mr. (essential titles)' },
            { native: 'Chaleureux', romanized: '—', english: 'Warm / welcoming' },
            { native: 'Le dîner', romanized: '—', english: 'Dinner' },
            { native: 'Le pain', romanized: '—', english: 'Bread (served with all dinners)' },
            { native: 'Politesse', romanized: '—', english: 'Politeness' },
            { native: 'Inviter', romanized: '—', english: 'To invite / host' },
            { native: 'Faire la bise', romanized: '—', english: 'Perform cheek kisses' }
          ],
          tips: ['Always wait for the host to say "Bon appétit" before starting to eat'],
          practice: 'List key differences between greetings in France vs. your native country.',
        },
      },
{
        id: 'fr-15', title: 'Future Tense: Futur Proche', description: 'Express future actions with aller', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Form near future timelines using the verb "aller" plus an infinitive verb.',
          keyPhrases: [
            { native: 'Je vais manger', romanized: '—', english: 'I am going to eat' },
            { native: 'Tu vas faire', romanized: '—', english: 'You are going to do' },
            { native: 'Il va partir', romanized: '—', english: 'He is going to leave' },
            { native: 'Nous allons voyager', romanized: '—', english: 'We are going to travel' },
            { native: 'Vous allez voir', romanized: '—', english: 'You all are going to see' },
            { native: 'Ils vont acheter', romanized: '—', english: 'They are going to buy' },
            { native: 'Demain', romanized: 'deh-mɛ̃', english: 'Tomorrow' },
            { native: 'Ce soir', romanized: 'suh swahr', english: 'Tonight' },
            { native: 'Bientôt', romanized: '—', english: 'Soon' },
            { native: 'Je vais étudier le français', romanized: '—', english: 'I am going to study French' }
          ],
          tips: ['Futur Proche is highly common in spoken French for plan actions'],
          practice: 'Translate "I am going to order a croissant tonight" into French.',
        },
      },
{
        id: 'fr-16', title: 'French Slang & Idioms', description: 'Master colloquial expressions and common French idioms', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Informal French is filled with colorful expressions. Master these widely-used slangs.',
          keyPhrases: [
            { native: 'Les doigts dans le nez', romanized: '—', english: 'Piece of cake (lit. fingers in the nose)' },
            { native: 'Tomber dans les pommes', romanized: '—', english: 'To faint (lit. to fall in the apples)' },
            { native: 'C\'est simple comme bonjour', romanized: '—', english: 'Very simple (lit. simple as hello)' },
            { native: 'Avoir le cafard', romanized: '—', english: 'To feel blue / depressed (lit. to have the cockroach)' },
            { native: 'Raconter des salades', romanized: '—', english: 'To tell lies / tall stories (lit. to tell salads)' }
          ],
          tips: ['French slang features "Verlan" (syllable inversion), e.g., "louche" becomes "chelou"', '"Avoir le cafard" is used casually to express sadness'],
          practice: 'Write a sentence describing a test you found extremely easy using "Les doigts dans le nez".'
        }
      },
{
        id: 'fr-17', title: 'French Proverbs & Wisdom', description: 'Explore traditional French sayings and cultural wisdom', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'French proverbs offer insights into patience, life observations, and history.',
          keyPhrases: [
            { native: 'Petit à petit, l\'oiseau fait son nid', romanized: '—', english: 'Little by little, the bird builds its nest' },
            { native: 'Qui vivra verra', romanized: '—', english: 'Time will tell (lit. he who lives will see)' },
            { native: 'Mieux vaut tard que jamais', romanized: '—', english: 'Better late than never' },
            { native: 'Après la pluie, le beau temps', romanized: '—', english: 'Every cloud has a silver lining (lit. after rain, good weather)' },
            { native: 'Rien ne sert de courir; il faut partir à point', romanized: '—', english: 'Slow and steady wins the race' }
          ],
          tips: ['Many French proverbs focus on nature, animals, and agricultural timelines', '"Qui vivra verra" is used when the outcome of a situation is uncertain'],
          practice: 'Translate "Petit à petit, l\'oiseau fait son nid" and explain its moral meaning.'
        }
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
      {
        id: 'es-11', title: 'El Clima (Weather)', description: 'Talk about weather and seasons in Spanish', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Describing weather conditions is highly practical for planning outdoor trips and simple daily conversations.',
          keyPhrases: [
            { native: 'Hace calor', romanized: 'ase kalor', english: 'It is hot' },
            { native: 'Hace frío', romanized: 'ase frio', english: 'It is cold' },
            { native: 'Llueve', romanized: 'ʎweβe', english: 'It is raining' },
            { native: 'El sol', romanized: 'el sol', english: 'The sun' },
            { native: 'Hace buen tiempo', romanized: 'ase βwen tjempo', english: 'The weather is good' },
          ],
          tips: ['Spanish uses the verb "hacer" (to do/make) for most weather statements, e.g. "Hace viento"', 'To say it is snowing, use "Nieva"', 'Use "mucho" instead of "muy" to qualify weather, e.g. "Hace mucho calor"'],
          practice: 'Describe the weather forecast for tomorrow in Spanish.',
        },
      },
      {
        id: 'es-12', title: 'Tapas Culture in Spain', description: 'Order small sharing plates in Spanish restaurants', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Tapas are small plates of food shared among friends, representing a highly social dining culture in Spain.',
          keyPhrases: [
            { native: 'Una tapa', romanized: 'una tapa', english: 'A small snack / appetizer' },
            { native: 'Compartir', romanized: 'kompaɾtiɾ', english: 'To share' },
            { native: 'Una ración', romanized: 'una ɾasjon', english: 'A larger portion size' },
            { native: 'Jamón ibérico', romanized: 'xamon iβeɾiko', english: 'Iberian cured ham' },
            { native: 'Patatas bravas', romanized: 'patatas βɾaβas', english: 'Spicy potatoes' },
          ],
          tips: ['Tapas are often served free with a drink in cities like Granada and Salamanca', '"Ir de tapas" means hopping from bar to bar to sample different dishes', 'Order "una ración" if dining with a larger group'],
          practice: 'Create a list of 3 tapas dishes you would order in a Spanish bar.',
        },
      },
{
        id: 'es-13', title: 'Directions: Taking a Bus', description: 'Navigate bus routes and ticket payments', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Interact with bus drivers and find bus stops in cities.',
          keyPhrases: [
            { native: '¿Dónde está la parada de autobús?', romanized: '—', english: 'Where is the bus stop?' },
            { native: '¿Este autobús va a...?', romanized: '—', english: 'Does this bus go to...?' },
            { native: 'Un billete, por favor', romanized: '—', english: 'One ticket, please' },
            { native: '¿Tengo que transbordar?', romanized: '—', english: 'Do I have to transfer?' },
            { native: 'Bajar en la próxima', romanized: '—', english: 'Get off at the next one' },
            { native: 'El conductor', romanized: '—', english: 'The driver' },
            { native: '¿Cuánto cuesta el pasaje?', romanized: '—', english: 'How much is the fare?' },
            { native: '¿Cuál es la línea...?', romanized: '—', english: 'Which line is...?' },
            { native: '¿Dónde me bajo?', romanized: '—', english: 'Where do I get off?' },
            { native: '¡Gracias por su ayuda!', romanized: '—', english: 'Thanks for your help!' }
          ],
          tips: ['Tickets are usually bought from the driver or validated inside using a card'],
          practice: 'Ask if the bus goes to the center: "¿Este autobús va al centro?".',
        },
      },
{
        id: 'es-14', title: 'Spanish Festivals & Traditions', description: 'Explore celebrations in Spanish countries', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Study historical celebrations like La Tomatina, San Fermín, and Semana Santa.',
          keyPhrases: [
            { native: 'La Tomatina', romanized: '—', english: 'Tomato throwing festival in Buñol' },
            { native: 'San Fermín', romanized: '—', english: 'Running of the bulls in Pamplona' },
            { native: 'Semana Santa', romanized: '—', english: 'Holy Week' },
            { native: 'Fiesta', romanized: '—', english: 'Celebration / Party' },
            { native: 'Los Reyes Magos', romanized: '—', english: 'The Three Wise Men (Jan 6th gift day)' },
            { native: 'Las Fallas', romanized: '—', english: 'Valencian puppet burning festival' },
            { native: 'El carnaval', romanized: '—', english: 'Carnival' },
            { native: 'Fuegos artificiales', romanized: '—', english: 'Fireworks' },
            { native: 'Tradición', romanized: '—', english: 'Tradition' },
            { native: 'Feliz Navidad', romanized: '—', english: 'Merry Christmas' }
          ],
          tips: ['Children in Spanish countries traditionally get gifts on Three Kings Day (Jan 6) instead of Christmas'],
          practice: 'List 3 details about your favorite Spanish cultural tradition.',
        },
      },
{
        id: 'es-15', title: 'Future Tense: Ir + a + Infinitive', description: 'Talk about future plans simply', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Form future plans easily using "ir" (conjugation) + a + infinitive verb.',
          keyPhrases: [
            { native: 'Voy a comer', romanized: '—', english: 'I am going to eat' },
            { native: 'Vas a viajar', romanized: '—', english: 'You are going to travel' },
            { native: 'Va a estudiar', romanized: '—', english: 'He is going to study' },
            { native: 'Vamos a salir', romanized: '—', english: 'We are going to go out' },
            { native: 'Vais a comprar', romanized: '—', english: 'You all are going to buy' },
            { native: 'Van a jugar', romanized: '—', english: 'They are going to play' },
            { native: 'Mañana', romanized: 'man-yana', english: 'Tomorrow' },
            { native: 'Esta noche', romanized: '—', english: 'Tonight' },
            { native: 'El año que viene', romanized: '—', english: 'Next year' },
            { native: 'Voy a hablar español', romanized: '—', english: 'I am going to speak Spanish' }
          ],
          tips: ['"Ir + a + Infinitive" is highly conversational; conjugate "ir" for person and leave the second verb unchanged'],
          practice: 'Translate "We are going to eat tapas tomorrow" into Spanish.',
        },
      },
{
        id: 'es-16', title: 'Spanish Idioms & Expressions', description: 'Learn colorful idioms and common colloquial phrases in Spanish', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Spaniards and Latin Americans use unique idioms daily. Learn these essential expressions.',
          keyPhrases: [
            { native: 'Pan comido', romanized: '—', english: 'Piece of cake (lit. eaten bread)' },
            { native: 'Tomar el pelo', romanized: '—', english: 'To pull someone\'s leg / kid (lit. to take the hair)' },
            { native: 'Estar en las nubes', romanized: '—', english: 'To be daydreaming (lit. to be in the clouds)' },
            { native: 'Echar agua al mar', romanized: '—', english: 'To do something pointless (lit. to throw water into the sea)' },
            { native: 'Ponerse las pilas', romanized: '—', english: 'To get organized / work hard (lit. to put in the batteries)' }
          ],
          tips: ['"Pan comido" describes tasks, not food', 'Use "tomar el pelo" when a friend tells a joke that sounds serious'],
          practice: 'Write a sentence telling a classmate to study using "ponerte las pilas".'
        }
      },
{
        id: 'es-17', title: 'Spanish Refranes (Proverbs)', description: 'Explore traditional Spanish proverbs and sayings', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Proverbs (Refranes) are highly valued in Spanish culture for conveying life lessons.',
          keyPhrases: [
            { native: 'Más vale tarde que nunca', romanized: '—', english: 'Better late than never' },
            { native: 'A mal tiempo, buena cara', romanized: '—', english: 'In bad times, stay positive (lit. to bad weather, a good face)' },
            { native: 'No por mucho madrugar amanece más temprano', romanized: '—', english: 'Things take their own time (lit. rising early won\'t make dawn come faster)' },
            { native: 'Dime con quién andas, y te diré quién eres', romanized: '—', english: 'You are judged by the company you keep' },
            { native: 'Perro que ladra no muerde', romanized: '—', english: 'His bark is worse than his bite (lit. dog that barks doesn\'t bite)' }
          ],
          tips: ['Proverbs often feature animals, weather, and agricultural schedules', '"A mal tiempo, buena cara" is used to motivate others during setbacks'],
          practice: 'Explain the moral meaning of "Más vale tarde que nunca" in Spanish.'
        }
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
      {
        id: 'zh-11', title: 'Weather & Seasons', description: 'Describe weather and seasons in Chinese', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Describing weather conditions is highly helpful for daily conversations and planning travel in China.',
          keyPhrases: [
            { native: '下雨', romanized: 'Xià yǔ', english: 'To rain' },
            { native: '晴天', romanized: 'Qíngtiān', english: 'Sunny day' },
            { native: '热', romanized: 'Rè', english: 'Hot' },
            { native: '冷', romanized: 'Lěng', english: 'Cold' },
            { native: '四季', romanized: 'Sìjì', english: 'Four seasons' },
          ],
          tips: ['The particle 了 (le) is often used to show a change in weather, e.g. 下雨了 (It started to rain)', 'To describe snow, say 下雪 (Xià xuě)', 'Windy is 刮风 (Guā fēng)'],
          practice: 'State today\'s weather in your city in Chinese.',
        },
      },
      {
        id: 'zh-12', title: 'Chinese Tea Culture', description: 'Understand tea categories and teahouse etiquette', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Tea has a rich history in China and is central to welcoming guests and social meetings.',
          keyPhrases: [
            { native: '茶', romanized: 'Chá', english: 'Tea' },
            { native: '绿茶', romanized: 'Lǜchá', english: 'Green tea' },
            { native: '泡茶', romanized: 'Pào chá', english: 'To brew tea' },
            { native: '茶馆', romanized: 'Cháguǎn', english: 'Teahouse' },
            { native: '谢谢', romanized: 'Xièxiè', english: 'Thank you' },
          ],
          tips: ['Tap two fingers on the table to show gratitude when someone pours tea for you (finger kowtow)', 'The first brew of tea is often poured away to wash the leaves', 'Never point the spout of the teapot towards guests'],
          practice: 'List three types of Chinese tea and describe the finger tapping custom.',
        },
      },
{
        id: 'zh-13', title: 'Directions: Subway Navigation', description: 'Navigate metropolitan subway lines', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Travel on China\'s subway networks using key location vocabulary.',
          keyPhrases: [
            { native: '地铁站在哪里?', romanized: 'Dìtiě zhàn zài nǎlǐ?', english: 'Where is the subway station?' },
            { native: '我要买票', romanized: 'Wǒ yào mǎi piào', english: 'I want to buy a ticket' },
            { native: '几号线?', romanized: 'Jǐ hào xiàn?', english: 'Which line number?' },
            { native: '换乘', romanized: 'Huànchéng', english: 'Transfer lines' },
            { native: '出口', romanized: 'Chūkǒu', english: 'Exit' },
            { native: '入口', romanized: 'Rùkǒu', english: 'Entrance' },
            { native: '单程票', romanized: 'Dānchéngpiào', english: 'One-way ticket' },
            { native: '乘车卡', romanized: 'Chéngchēkǎ', english: 'Transit card' },
            { native: '下一站', romanized: 'Xià yí zhàn', english: 'Next stop' },
            { native: '安检', romanized: 'Ānjiǎn', english: 'Security check' }
          ],
          tips: ['All Chinese subways require passing bags through security scanners (安检) before entering'],
          practice: 'Simulate asking for subway Line 1 ("一号线") and looking for Exit A ("A出口").',
        },
      },
{
        id: 'zh-14', title: 'Chinese Table Manners & Banquets', description: 'Understand dinner seating and protocol', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Study seating orders, guest positions, and toast procedures at banquets.',
          keyPhrases: [
            { native: '主人', romanized: 'Zhǔrén', english: 'Host' },
            { native: '主宾', romanized: 'Zhǔbīn', english: 'Guest of honor' },
            { native: '转盘', romanized: 'Zhuànpán', english: 'Lazy Susan (spinning center glass)' },
            { native: '敬酒', romanized: 'Jìngjiǔ', english: 'To toast' },
            { native: '长辈', romanized: 'Zhǎngbèi', english: 'Elders' },
            { native: '客气', romanized: 'Kèqì', english: 'Polite / courteous' },
            { native: '座次', romanized: 'Zuòcì', english: 'Seating order' },
            { native: '公筷', romanized: 'Gōngkuài', english: 'Serving chopsticks' },
            { native: '倒酒', romanized: 'dào jiǔ', english: 'Pour wine / alcohol' },
            { native: '干杯', romanized: 'Gānbēi', english: 'Cheers / empty glass' }
          ],
          tips: ['Keep your glass lower than that of elders/superiors when clinking glasses to toast'],
          practice: 'List two rules regarding serving chopsticks and toasting elders.',
        },
      },
{
        id: 'zh-15', title: 'Past Actions with le (了)', description: 'Indicate completed actions simply', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Learn how to place the particle "了" (le) to show that an action is finished.',
          keyPhrases: [
            { native: '我吃了饭', romanized: 'Wǒ chī le fàn', english: 'I ate rice (ate meal)' },
            { native: '他去了北京', romanized: 'Tā qù le Běijīng', english: 'He went to Beijing' },
            { native: '我们买了票', romanized: 'Wǒmen mǎi le piào', english: 'We bought tickets' },
            { native: '她学了中文', romanized: 'Tā xué le Zhōngwén', english: 'She studied Chinese' },
            { native: '我看见了他', romanized: 'Wǒ kànjiàn le tā', english: 'I saw him' },
            { native: '昨天', romanized: 'Zuótiān', english: 'Yesterday' },
            { native: '去年', romanized: 'Qùnián', english: 'Last year' },
            { native: '已经', romanized: 'Yǐjīng', english: 'Already' },
            { native: '还没', romanized: 'hái méi', english: 'Not yet' },
            { native: '我看见了', romanized: 'Wǒ kànjiàn le', english: 'I saw it' }
          ],
          tips: ['"了" goes directly after the verb to emphasize completion, or at the end for a change of status'],
          practice: 'Convert "我喝茶" (I drink tea) into past completion: "I drank tea".',
        },
      },
{
        id: 'zh-16', title: 'Chinese Chengyu & Idioms', description: 'Learn the rich 4-character idioms (Chengyu) and modern expressions', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Chengyu are classical four-character idioms that reflect history and philosophical lessons.',
          keyPhrases: [
            { native: '马马虎虎', romanized: 'Mǎmahǔhǔ', english: 'So-so / Careless (lit. horse horse tiger tiger)' },
            { native: '七上八下', romanized: 'Qīshàngbāxià', english: 'Feeling anxious / unsettled (lit. seven up eight down)' },
            { native: '画蛇添足', romanized: 'Huàshétiānzú', english: 'Overdoing it (lit. drawing legs on a snake)' },
            { native: '乱七八糟', romanized: 'Luànqībāzāo', english: 'In a mess / chaotic (lit. messy seven eight chaotic)' },
            { native: '对牛弹琴', romanized: 'Duìniútánqín', english: 'Addressing the wrong audience (lit. playing lute to a cow)' }
          ],
          tips: ['"Mǎmahǔhǔ" can describe work or feelings, meaning average or careless', 'Chengyu are frequently used in Chinese writing to show education'],
          practice: 'Write down a scenario where someone did a task "Mǎmahǔhǔ".'
        }
      },
{
        id: 'zh-17', title: 'Chinese Proverbs (Yanyu)', description: 'Understand traditional Chinese wisdom and common proverbs', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Chinese proverbs (Yanyu) provide timeless guidance on learning, perseverance, and relationships.',
          keyPhrases: [
            { native: '失败是成功之母', romanized: 'Shībài shì chénggōng zhī mǔ', english: 'Failure is the mother of success' },
            { native: '千里之行，始于足下', romanized: 'Qiānlǐ zhī xíng, shǐ yú zú xià', english: 'A journey of a thousand miles begins with a single step' },
            { native: '读书破万卷，下笔如有神', romanized: 'Dúshū pò wàn juàn, xiàbǐ rú yǒu shén', english: 'Reading widely makes writing powerful' },
            { native: '冰冻三尺，非一日之寒', romanized: 'Bīngdòng sān chǐ, fēi yī rì zhī hán', english: 'Rome wasn\'t built in a day (lit. three feet of ice doesn\'t freeze in a day)' },
            { native: '入乡随俗', romanized: 'Rùxiāngsuísú', english: 'When in Rome, do as the Romans do' }
          ],
          tips: ['Many Chinese proverbs encourage continuous self-cultivation and persistence', '"Rùxiāngsuísú" is essential advice when traveling across China\'s regions'],
          practice: 'Translate "失败是成功之母" and explain its value to a student.'
        }
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
      {
        id: 'vi-11', title: 'Thời tiết (Weather)', description: 'Describe weather and climates in Vietnamese', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Vietnam has distinct regional climates. Discussing the weather is very common in daily greetings.',
          keyPhrases: [
            { native: 'Nóng', romanized: 'Nong', english: 'Hot' },
            { native: 'Lạnh', romanized: 'Lanh', english: 'Cold' },
            { native: 'Mưa', romanized: 'Mua', english: 'Rain' },
            { native: 'Năng', romanized: 'Nang', english: 'Sunny' },
            { native: 'Thời tiết', romanized: 'Thoi tiet', english: 'Weather' },
          ],
          tips: ['Southern Vietnam has two seasons (wet and dry)', 'Northern Vietnam has four seasons (spring, summer, autumn, winter)', 'Use "trời" (sky/heaven) before weather, e.g. "Trời nóng" (It is hot)'],
          practice: 'Write a sentence in Vietnamese describing the weather today.',
        },
      },
      {
        id: 'vi-12', title: 'Vietnamese Coffee Culture', description: 'Explore coffee brewing and types in Vietnam', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Vietnam is the second-largest exporter of coffee and has a world-famous coffee lifestyle.',
          keyPhrases: [
            { native: 'Cà phê sữa đá', romanized: 'Ca phe sua da', english: 'Iced coffee with condensed milk' },
            { native: 'Phin', romanized: 'Phin', english: 'Traditional coffee filter' },
            { native: 'Đắng', romanized: 'Dang', english: 'Bitter' },
            { native: 'Ngọt', romanized: 'Ngot', english: 'Sweet' },
            { native: 'Quán cà phê', romanized: 'Quan ca phe', english: 'Coffee shop' },
          ],
          tips: ['Vietnamese coffee is made with robusta beans, giving it a strong flavor', 'Condensed milk is used instead of fresh milk', 'Coffee is brewed slowly through a metal Phin filter'],
          practice: 'List the key ingredients and filter name for standard Vietnamese iced coffee.',
        },
      },
{
        id: 'vi-13', title: 'Directions: Riding a Xe Om', description: 'Communicate with motorbike taxi drivers', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Use motorbikes to navigate traffic. Study keys directions and warnings.',
          keyPhrases: [
            { native: 'Cho tôi đi đến chợ', romanized: '—', english: 'Please take me to the market' },
            { native: 'Đội mũ bảo hiểm', romanized: 'doy mu bao hyem', english: 'Wear a helmet' },
            { native: 'Bật bản đồ lên', romanized: '—', english: 'Turn on the map' },
            { native: 'Ngã tư', romanized: 'nga tu', english: 'Intersection / crossroad' },
            { native: 'Đèn đỏ', romanized: 'den do', english: 'Red light' },
            { native: 'Cẩn thận !', romanized: 'can than', english: 'Be careful!' },
            { native: 'Dừng lại ở đây', romanized: '—', english: 'Stop here' },
            { native: 'Đi lối này', romanized: '—', english: 'Go this way' },
            { native: 'Bao nhiêu một lượt?', romanized: '—', english: 'How much for a ride?' },
            { native: 'Cảm ơn bác', romanized: '—', english: 'Thank you, uncle (driver)' }
          ],
          tips: ['Always check that you are wearing a strapped helmet when boarding a Xe Om'],
          practice: 'Simulate putting on a helmet, giving direction to the driver, and telling them to stop.',
        },
      },
{
        id: 'vi-14', title: 'Vietnamese Ao Dai & Dress', description: 'Understand traditional garments and symbols', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Ao Dai is the national garment worn on formal occasions. Study its history.',
          keyPhrases: [
            { native: 'Áo dài', romanized: 'ow zai', english: 'National tunic garment' },
            { native: 'Nón lá', romanized: 'nohn la', english: 'Conical palm-leaf hat' },
            { native: 'Lụa', romanized: 'lua', english: 'Silk fabric' },
            { native: 'Trang phục truyền thống', romanized: '—', english: 'Traditional costume' },
            { native: 'Tà áo', romanized: '—', english: 'Dress panels' },
            { native: 'Quần', romanized: 'kwan', english: 'Trousers / pants' },
            { native: 'Đám cưới', romanized: '—', english: 'Wedding ceremony' },
            { native: 'Lễ hội', romanized: '—', english: 'Festival' },
            { native: 'May đo', romanized: '—', english: 'Custom tailored' },
            { native: 'Kín đáo', romanized: '—', english: 'Modest / elegant design' }
          ],
          tips: ['Ao Dai literally translates to "Long Shirt", split into two side flaps worn over trousers'],
          practice: 'List two events where Vietnamese citizens traditionally wear the Ao Dai.',
        },
      },
{
        id: 'vi-15', title: 'Past & Future Tenses: Đã/Sẽ', description: 'Express timelines using simple markers', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Place tense particles "đã" (past) and "sẽ" (future) before main verbs.',
          keyPhrases: [
            { native: 'Tôi đã ăn', romanized: '—', english: 'I ate (already)' },
            { native: 'Tôi sẽ đi', romanized: '—', english: 'I will go' },
            { native: 'Hôm qua', romanized: 'hom kwa', english: 'Yesterday' },
            { native: 'Ngày mai', romanized: 'ngay mai', english: 'Tomorrow' },
            { native: 'Đã hoàn thành', romanized: '—', english: 'Finished / Completed' },
            { native: 'Đang làm', romanized: 'dang lam', english: 'Doing (ongoing)' },
            { native: 'Tháng trước', romanized: '—', english: 'Last month' },
            { native: 'Tháng sau', romanized: '—', english: 'Next month' },
            { native: 'Sẽ gặp lại', romanized: '—', english: 'Will meet again' },
            { native: 'Tôi đã học tiếng Việt', romanized: '—', english: 'I studied Vietnamese' }
          ],
          tips: ['Tense particles are optional if context time-words (e.g. yesterday) clarify the timeframe'],
          practice: 'Translate "I will eat Pho tomorrow" and "I studied Vietnamese last month" into Vietnamese.',
        },
      },
{
        id: 'vi-16', title: 'Vietnamese Idioms & Slang', description: 'Learn standard idioms and colloquial expressions in Vietnamese', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Vietnamese slang and idioms make your conversation sound natural. Learn these key terms.',
          keyPhrases: [
            { native: 'Dễ như ăn kẹo', romanized: '—', english: 'Extremely easy (lit. as easy as eating candy)' },
            { native: 'Chém gió', romanized: '—', english: 'To boast / chat casually (lit. slashing the wind)' },
            { native: 'Vẽ đường cho hươu chạy', romanized: '—', english: 'Encouraging bad behavior (lit. drawing a path for deer to run)' },
            { native: 'Ăn cháo đá bát', romanized: '—', english: 'Being ungrateful (lit. eating porridge and kicking the bowl)' },
            { native: 'Thả thính', romanized: '—', english: 'Flirting (lit. throwing roasted rice bran / bait)' }
          ],
          tips: ['"Chém gió" is very common among friends in cafes', '"Thả thính" is used extensively in social media contexts'],
          practice: 'Describe a fun hangout session using "chém gió".'
        }
      },
{
        id: 'vi-17', title: 'Vietnamese Proverbs (Tục Ngữ)', description: 'Explore traditional Vietnamese proverbs and wisdom', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Vietnamese proverbs reflect centuries of agricultural lifestyle, moral advice, and family values.',
          keyPhrases: [
            { native: 'Có công mài sắt, có ngày nên kim', romanized: '—', english: 'Persistence pays off (lit. with effort grinding iron, it becomes a needle)' },
            { native: 'Gần mực thì đen, gần đèn thì rạng', romanized: '—', english: 'Environment influences character (lit. near ink black, near lamp bright)' },
            { native: 'Ăn quả nhớ kẻ trồng cây', romanized: '—', english: 'Gratitude (lit. eat fruit, remember the planter)' },
            { native: 'Một cây làm chẳng nên non', romanized: '—', english: 'Unity makes strength (lit. one tree doesn\'t make a mountain)' },
            { native: 'Đi một ngày đàng, học một sàng khôn', romanized: '—', english: 'Travel broadens the mind' }
          ],
          tips: ['Rhyme is heavily used in Vietnamese tục ngữ', '"Ăn quả nhớ kẻ trồng cây" is a cornerstone of Vietnamese moral values'],
          practice: 'Explain the meaning of "Có công mài sắt, có ngày nên kim" in English.'
        }
      },
    ],
  },
  {
    id: 'german',
    language: 'German',
    flag: '🇩🇪',
    color: '#000000',
    gradient: 'from-yellow-400 via-red-500 to-black',
    lessons: [
      {
        id: 'de-01', title: 'German Alphabet & Sounds', description: 'Learn standard German letters and special characters', type: 'pronunciation', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'German pronunciation is mostly regular, but has umlauts (ä, ö, ü) and the ligature ß.',
          keyPhrases: [
            { native: 'Ä / ä', romanized: 'umlaut a', english: 'Sounds like "e" in "bet"' },
            { native: 'Ö / ö', romanized: 'umlaut o', english: 'Sounds like "i" in "bird"' },
            { native: 'Ü / ü', romanized: 'umlaut u', english: 'No English equivalent; shape lips for "oo" but say "ee"' },
            { native: 'ß', romanized: 'Eszett / sharp s', english: 'Sounds like a double s' },
            { native: 'w', romanized: 'Sounds like v', english: 'The German letter W is pronounced like V' },
          ],
          tips: ['German has 26 alphabet letters plus 3 umlauts and 1 sharp S', 'Pronounce every consonant clearly', 'The letter V is often pronounced like F, e.g. Vater'],
          practice: 'Practice pronouncing the umlauts ä, ö, and ü aloud.',
        },
      },
      {
        id: 'de-02', title: 'Greetings & Polite Phrases', description: 'Essential German greetings and polite expressions', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Politeness is highly valued in German-speaking countries. Learn standard greeting etiquette.',
          keyPhrases: [
            { native: 'Guten Tag', romanized: '—', english: 'Good day / Hello' },
            { native: 'Bitte', romanized: '—', english: 'Please / You\'re welcome' },
            { native: 'Danke', romanized: '—', english: 'Thank you' },
            { native: 'Es tut mir leid', romanized: '—', english: 'I am sorry' },
            { native: 'Auf Wiedersehen', romanized: '—', english: 'Goodbye (formal)' },
          ],
          tips: ['Use "Sie" (formal) when speaking to strangers and "du" (informal) for friends', 'Shake hands firmly when greeting someone', 'Saying "Bitte" is extremely versatile — it also means "pardon?" and "here you go"'],
          practice: 'Practice greeting a partner formally and informally.',
        },
      },
      {
        id: 'de-03', title: 'Numbers 1–100', description: 'Count in German from one to one hundred', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'German numbers are logical but have one twist: units are spoken before tens (e.g. 21 is "one and twenty").',
          keyPhrases: [
            { native: 'eins, zwei, drei', romanized: '—', english: 'One, two, three' },
            { native: 'zehn', romanized: '—', english: 'Ten' },
            { native: 'einundzwanzig', romanized: '—', english: 'Twenty-one' },
            { native: 'hundert', romanized: '—', english: 'Hundred' },
            { native: 'Wie viel kostet das?', romanized: '—', english: 'How much does that cost?' },
          ],
          tips: ['The unit is linked to the ten with "und" (and), e.g., "zweiunddreißig" (two and thirty = 32)', 'Zwei is sometimes pronounced "zwo" on the phone to avoid confusion with drei', 'Germany uses Euros (€)'],
          practice: 'Count aloud from 1 to 30 in German.',
        },
      },
      {
        id: 'de-04', title: 'Food & Ordering', description: 'Order food and drinks at German restaurants', type: 'conversation', difficulty: 'beginner', duration: '13 min',
        content: {
          intro: 'German cuisine includes regional specialties. Knowing how to order makes dining out enjoyable.',
          keyPhrases: [
            { native: 'Ich möchte bestellen, bitte', romanized: '—', english: 'I would like to order, please' },
            { native: 'Ein Wasser, bitte', romanized: '—', english: 'A water, please' },
            { native: 'Guten Appetit', romanized: '—', english: 'Enjoy your meal' },
            { native: 'Die Rechnung, bitte', romanized: '—', english: 'The bill, please' },
            { native: 'Zahlen, bitte', romanized: '—', english: 'Pay, please' },
          ],
          tips: ['Tap water is not commonly served in restaurants — you must order bottled water ("mit Kohlensäure" for sparkling, "ohne" for still)', 'Say "Guten Appetit" before eating', 'Tipping is around 5-10% — round up the bill'],
          practice: 'Roleplay ordering a drink and requesting the bill.',
        },
      },
      {
        id: 'de-05', title: 'Directions & Transport', description: 'Ask for directions and use German transit', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'German public transit (ÖPNV) is highly efficient. Learn to read maps and ask for train platforms.',
          keyPhrases: [
            { native: 'Wo ist der Bahnhof?', romanized: '—', english: 'Where is the train station?' },
            { native: 'Geradeaus', romanized: '—', english: 'Straight ahead' },
            { native: 'Links / Rechts', romanized: '—', english: 'Left / Right' },
            { native: 'Gleis', romanized: '—', english: 'Platform' },
            { native: 'Fahrkarte', romanized: '—', english: 'Ticket' },
          ],
          tips: ['U-Bahn is the subway; S-Bahn is the suburban commuter train', 'Always validate (entwerten) your paper ticket before boarding', 'Pünktlichkeit (punctuality) is highly valued in German transit'],
          practice: 'Draw a simple map and practice giving directions in German.',
        },
      },
      {
        id: 'de-06', title: 'Noun Genders (Der, Die, Das)', description: 'Master masculine, feminine, and neuter nouns', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'German nouns have three genders: masculine (der), feminine (die), and neuter (das). Gender is grammatical, not logical.',
          keyPhrases: [
            { native: 'der Tisch', romanized: '—', english: 'The table (masculine)' },
            { native: 'die Tür', romanized: '—', english: 'The door (feminine)' },
            { native: 'das Buch', romanized: '—', english: 'The book (neuter)' },
            { native: 'die Bücher', romanized: '—', english: 'The books (all plurals use die)' },
            { native: 'kein', romanized: '—', english: 'No / None (negative article)' },
          ],
          tips: ['Always memorize the article (der/die/das) together with the noun', 'Nouns ending in "-ung", "-heit", "-keit", "-schaft" are always feminine', 'All German nouns are capitalized, regardless of their position in the sentence'],
          practice: 'Categorize 15 daily items into masculine, feminine, and neuter lists.',
        },
      },
      {
        id: 'de-07', title: 'Family & Social Relations', description: 'Talk about family members in German', type: 'vocabulary', difficulty: 'beginner', duration: '11 min',
        content: {
          intro: 'Describe your family tree and talk about your family members in German.',
          keyPhrases: [
            { native: 'Vater / Mutter', romanized: '—', english: 'Father / Mother' },
            { native: 'Sohn / Tochter', romanized: '—', english: 'Son / Daughter' },
            { native: 'Bruder / Schwester', romanized: '—', english: 'Brother / Sister' },
            { native: 'Großeltern', romanized: '—', english: 'Grandparents' },
            { native: 'Geschwister', romanized: '—', english: 'Siblings' },
          ],
          tips: ['German family terms are similar to English due to shared Germanic roots', '"Geschwister" is a single word for siblings', 'Possessive pronouns change with gender: "mein Vater" vs "meine Mutter"'],
          practice: 'Describe your family structure in three sentences using German vocabulary.',
        },
      },
      {
        id: 'de-08', title: 'Festivals & Traditions', description: 'Explore German culture through Oktoberfest and holidays', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Germany is rich in cultural festivals, blending traditional folk roots with modern celebrations.',
          keyPhrases: [
            { native: 'Oktoberfest', romanized: '—', english: 'Bavarian beer festival in Munich' },
            { native: 'Weihnachtsmarkt', romanized: '—', english: 'Christmas market' },
            { native: 'Karneval', romanized: '—', english: 'Carnival / Fasching' },
            { native: 'Prost!', romanized: '—', english: 'Cheers!' },
            { native: 'Frohe Weihnachten', romanized: '—', english: 'Merry Christmas' },
          ],
          tips: ['Oktoberfest actually begins in September', 'Clink glasses with eye contact — failing to do so is considered bad luck', 'Christmas markets are famous for Glühwein (mulled wine) and gingerbread'],
          practice: 'Write a short invitation to a friend to attend a local German festival.',
        },
      },
      {
        id: 'de-09', title: 'Simple Present Tense', description: 'Conjugate standard German verbs in the present', type: 'grammar', difficulty: 'intermediate', duration: '14 min',
        content: {
          intro: 'German verbs conjugate based on the subject pronoun in the present tense.',
          keyPhrases: [
            { native: 'ich lerne / du lernst', romanized: '—', english: 'I learn / you learn' },
            { native: 'er lernt / sie lernt', romanized: '—', english: 'He learns / she learns' },
            { native: 'wir lernen', romanized: '—', english: 'We learn' },
            { native: 'ihr lernt', romanized: '—', english: 'You all learn' },
            { native: 'sie lernen', romanized: '—', english: 'They learn / You (formal) learn' },
          ],
          tips: ['Most regular verbs end in "-en" in the infinitive (e.g. spielen, lernen)', 'Conjugation endings: -e, -st, -t, -en, -t, -en', 'The verb always takes the second position in a standard main clause'],
          practice: 'Conjugate the verb "spielen" (to play) for all subject pronouns.',
        },
      },
      {
        id: 'de-10', title: 'Shopping Vocabulary', description: 'Shop and purchase items in German cities', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Navigate clothing shops, supermarkets, and cashier queues in German-speaking countries.',
          keyPhrases: [
            { native: 'Ich schaue nur, danke', romanized: '—', english: 'I am just looking, thank you' },
            { native: 'Haben Sie das in Größe...?', romanized: '—', english: 'Do you have this in size...?' },
            { native: 'Mit Karte, bitte', romanized: '—', english: 'By card, please' },
            { native: 'Kassenzettel', romanized: '—', english: 'Receipt' },
            { native: 'Tüte', romanized: '—', english: 'Shopping bag' },
          ],
          tips: ['Supermarkets expect you to bring your own bags or purchase them at the register', 'Cashiers scan items extremely fast — pack quickly', 'Sunday shopping is generally forbidden (Ladenöffnungszeiten)'],
          practice: 'Roleplay paying for groceries at a checkout counter.',
        },
      },
      {
        id: 'de-11', title: 'German Hobbies & Free Time', description: 'Talk about sports, hobbies, and leisure', type: 'vocabulary', difficulty: 'beginner', duration: '11 min',
        content: {
          intro: 'Germans value work-life balance (Feierabend) and participate actively in clubs and sports.',
          keyPhrases: [
            { native: 'Fußball spielen', romanized: '—', english: 'To play soccer' },
            { native: 'Rad fahren', romanized: '—', english: 'To ride a bike' },
            { native: 'Wandern', romanized: '—', english: 'Hiking' },
            { native: 'Freizeit', romanized: '—', english: 'Free time' },
            { native: 'Verein', romanized: '—', english: 'Club / Association' },
          ],
          tips: ['Many German hobbies revolve around a "Verein" (sports club, music club, etc.)', 'Soccer (Fußball) is the most popular national sport', 'Wandern (hiking) in the Black Forest or Alps is highly popular'],
          practice: 'Describe your favorite weekend activity in German.',
        },
      },
      {
        id: 'de-12', title: 'German Cafe Culture', description: 'Order coffee and understand German bakeries', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'German bakeries (Bäckerei) and cafes are world-famous for their high-quality bread and cakes.',
          keyPhrases: [
            { native: 'Ein Kaffee und ein Stück Kuchen', romanized: '—', english: 'A coffee and a slice of cake' },
            { native: 'Brötchen', romanized: '—', english: 'Bread rolls' },
            { native: 'Kaffee und Kuchen', romanized: '—', english: 'Coffee and cake tradition' },
            { native: 'Schwarzbrot', romanized: '—', english: 'Black rye bread' },
            { native: 'Zum Mitnehmen / Hier essen', romanized: '—', english: 'To go / Dine in' },
          ],
          tips: ['"Kaffee und Kuchen" is a traditional Sunday afternoon social ritual', 'German bakeries offer dozens of varieties of fresh bread and rolls every morning', 'Specify "Zum Mitnehmen" if you want your pastry to go'],
          practice: 'Write a dialogue ordering breakfast at a German bakery.',
        },
      },
{
        id: 'de-13', title: 'Directions: Asking for Platform', description: 'Find platform locations and check transit plans', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Navigate German central stations (Hauptbahnhof) using train vocab.',
          keyPhrases: [
            { native: 'Entschuldigung, wo ist Gleis 3?', romanized: '—', english: 'Excuse me, where is platform 3?' },
            { native: 'Fahrplan', romanized: '—', english: 'Time table / schedule' },
            { native: 'Verspätung', romanized: '—', english: 'Delay' },
            { native: 'Der Zug', romanized: '—', english: 'The train' },
            { native: 'Abfahrt / Ankunft', romanized: '—', english: 'Departure / Arrival' },
            { native: 'Auf welchem Gleis?', romanized: '—', english: 'On which platform?' },
            { native: 'Fahrkartenautomat', romanized: '—', english: 'Ticket machine' },
            { native: 'Sitzplatzreservierung', romanized: '—', english: 'Seat reservation' },
            { native: 'Gute Reise !', romanized: '—', english: 'Have a good trip!' },
            { native: 'Der Anschlusszug', romanized: '—', english: 'Connecting train' }
          ],
          tips: ['Check the "Fahrplan" board for "Verspätung" notices showing train delays'],
          practice: 'Simulate asking: "Wo fährt der Zug nach Berlin ab?" (Where does the train to Berlin depart?).',
        },
      },
{
        id: 'de-14', title: 'German Punctuality & Rules', description: 'Social etiquette and recycling procedures', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Study German community standards, focusing on punctuality and recycling categories.',
          keyPhrases: [
            { native: 'Pünktlichkeit', romanized: '—', english: 'Punctuality (arriving exactly on time)' },
            { native: 'Mülltrennung', romanized: '—', english: 'Waste sorting / recycling' },
            { native: 'Pfandflasche', romanized: '—', english: 'Returnable bottle with deposit' },
            { native: 'Ruhezeit', romanized: '—', english: 'Quiet hours (Sundays/nights)' },
            { native: 'Ordnung', romanized: '—', english: 'Order / neatness' },
            { native: 'Altpapier', romanized: '—', english: 'Recycled paper bin' },
            { native: 'Biomüll', romanized: '—', english: 'Organic waste' },
            { native: 'Restmüll', romanized: '—', english: 'General non-recyclable waste' },
            { native: 'Pfandautomat', romanized: '—', english: 'Bottle return machine' },
            { native: 'Pünktlich sein', romanized: '—', english: 'Be on time' }
          ],
          tips: ['Quiet hours (Ruhezeit) are legally enforced on Sundays; do not run loud machines'],
          practice: 'List the 4 main recycling categories and describe "Pfand" bottle return.',
        },
      },
{
        id: 'de-15', title: 'Simple Past Tense: Präteritum', description: 'Talk about past times using simple forms', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Learn simple past forms (Präteritum) for auxiliary verbs (haben, sein).',
          keyPhrases: [
            { native: 'ich war / du warst', romanized: '—', english: 'I was / you were (sein past)' },
            { native: 'er war / wir waren', romanized: '—', english: 'he was / we were' },
            { native: 'ich hatte / du hattest', romanized: '—', english: 'I had / you had (haben past)' },
            { native: 'er hatte / wir hatten', romanized: '—', english: 'he had / we had' },
            { native: 'gestern', romanized: 'ges-tern', english: 'yesterday' },
            { native: 'letztes Jahr', romanized: '—', english: 'last year' },
            { native: 'Es war einmal', romanized: '—', english: 'Once upon a time' },
            { native: 'Ich hatte keine Zeit', romanized: '—', english: 'I had no time' },
            { native: 'Wo warst du gestern?', romanized: '—', english: 'Where were you yesterday?' },
            { native: 'Wir hatten ein Auto', romanized: '—', english: 'We had a car' }
          ],
          tips: ['Präteritum is primarily used in written stories and reports, but "war" and "hatte" are common in speech'],
          practice: 'Translate "I was tired yesterday and I had no time" into German.',
        },
      },
{
        id: 'de-16', title: 'German Idioms & Colloquialisms', description: 'Learn common colloquial phrases and funny German idioms', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'German idioms add color to your spoken language. Learn these widely used expressions.',
          keyPhrases: [
            { native: 'Das ist ein Kinderspiel', romanized: '—', english: 'Child\'s play / Piece of cake' },
            { native: 'Tomaten auf den Augen haben', romanized: '—', english: 'Being oblivious (lit. having tomatoes on one\'s eyes)' },
            { native: 'Jemandem die Daumen drücken', romanized: '—', english: 'To wish someone luck (lit. to press the thumbs for someone)' },
            { native: 'Die Kirche im Dorf lassen', romanized: '—', english: 'To not get carried away (lit. to leave the church in the village)' },
            { native: 'Um den heißen Brei herumreden', romanized: '—', english: 'To beat around the bush (lit. to talk around hot porridge)' }
          ],
          tips: ['Instead of crossing fingers, Germans "press thumbs" (Daumen drücken) for luck', '"Kinderspiel" is used to describe easy tests or tasks'],
          practice: 'Write a sentence wishing a friend luck using "Daumen drücken".'
        }
      },
{
        id: 'de-17', title: 'German Proverbs (Sprichwörter)', description: 'Understand traditional German proverbs and wisdom', type: 'culture', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Proverbs (Sprichwörter) are common in German literature and reflect historical wisdom.',
          keyPhrases: [
            { native: 'Übung macht den Meister', romanized: '—', english: 'Practice makes perfect' },
            { native: 'Wer rastet, der rostet', romanized: '—', english: 'He who rests, rusts (stay active)' },
            { native: 'Ohne Fleiß kein Preis', romanized: '—', english: 'No pain, no gain (lit. without diligence, no prize)' },
            { native: 'Aller Anfang ist schwer', romanized: '—', english: 'Every beginning is hard' },
            { native: 'Morgenstund hat Gold im Mund', romanized: '—', english: 'The early bird catches the worm (lit. morning hour has gold in mouth)' }
          ],
          tips: ['Many German proverbs focus on discipline, hard work, and persistence', '"Übung macht den Meister" is commonly used to motivate learners'],
          practice: 'Translate "Übung macht den Meister" and explain its value to a language learner.'
        }
      },
    ],
  }

];
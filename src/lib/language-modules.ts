export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'culture' | 'pronunciation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
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
          intro: 'Thai uses its own unique script with 44 consonants. Let\'s study all of them in order to understand how they are written and spoken.',
          keyPhrases: [
            { native: 'ก', romanized: 'Ko Kai', english: 'Chicken (mid class)' },
            { native: 'ข', romanized: 'Kho Khai', english: 'Egg (high class)' },
            { native: 'ฃ', romanized: 'Kho Khuat', english: 'Bottle (obsolete)' },
            { native: 'ค', romanized: 'Kho Khwai', english: 'Buffalo (low class)' },
            { native: 'ฅ', romanized: 'Kho Khon', english: 'Person (obsolete)' },
            { native: 'ฆ', romanized: 'Kho Rakhang', english: 'Bell (low class)' },
            { native: 'ง', romanized: 'Ngo Ngu', english: 'Snake (low class)' },
            { native: 'จ', romanized: 'Cho Chan', english: 'Plate (mid class)' },
            { native: 'ฉ', romanized: 'Cho Ching', english: 'Cymbals (high class)' },
            { native: 'ช', romanized: 'Cho Chang', english: 'Elephant (low class)' },
            { native: 'ซ', romanized: 'So So', english: 'Chain (low class)' },
            { native: 'ฌ', romanized: 'Cho Choe', english: 'Tree (low class)' },
            { native: 'ญ', romanized: 'Yo Ying', english: 'Woman (low class)' },
            { native: 'ฎ', romanized: 'Do Chada', english: 'Headdress (mid class)' },
            { native: 'ฏ', romanized: 'To Patak', english: 'Goad (mid class)' },
            { native: 'ฐ', romanized: 'Tho Than', english: 'Pedestal (high class)' },
            { native: 'ฑ', romanized: 'Tho Montho', english: 'Montho (low class)' },
            { native: 'ฒ', romanized: 'Tho Phuthao', english: 'Elder (low class)' },
            { native: 'ณ', romanized: 'No Nen', english: 'Novice (low class)' },
            { native: 'ด', romanized: 'Do Dek', english: 'Child (mid class)' },
            { native: 'ต', romanized: 'To Tao', english: 'Turtle (mid class)' },
            { native: 'ถ', romanized: 'Tho Thung', english: 'Sack (high class)' },
            { native: 'ท', romanized: 'Tho Thahan', english: 'Soldier (low class)' },
            { native: 'ธ', romanized: 'Tho Thong', english: 'Flag (low class)' },
            { native: 'น', romanized: 'No Nu', english: 'Mouse (low class)' },
            { native: 'บ', romanized: 'Bo Baimai', english: 'Leaf (mid class)' },
            { native: 'ป', romanized: 'Po Pla', english: 'Fish (mid class)' },
            { native: 'ผ', romanized: 'Pho Phueng', english: 'Bee (high class)' },
            { native: 'ฝ', romanized: 'Fo Fa', english: 'Lid (high class)' },
            { native: 'พ', romanized: 'Pho Phan', english: 'Tray (low class)' },
            { native: 'ฟ', romanized: 'Fo Fan', english: 'Teeth (low class)' },
            { native: 'ภ', romanized: 'Pho Samphao', english: 'Junk (low class)' },
            { native: 'ม', romanized: 'Mo Ma', english: 'Horse (low class)' },
            { native: 'ย', romanized: 'Yo Yak', english: 'Giant (low class)' },
            { native: 'ร', romanized: 'Ro Ruea', english: 'Boat (low class)' },
            { native: 'ล', romanized: 'Lo Ling', english: 'Monkey (low class)' },
            { native: 'ว', romanized: 'Wo Waen', english: 'Ring (low class)' },
            { native: 'ศ', romanized: 'So Sala', english: 'Pavilion (high class)' },
            { native: 'ษ', romanized: 'So Rusi', english: 'Hermit (high class)' },
            { native: 'ส', romanized: 'So Suea', english: 'Tiger (high class)' },
            { native: 'ห', romanized: 'Ho Hip', english: 'Chest (high class)' },
            { native: 'ฬ', romanized: 'Lo Chula', english: 'Kite (low class)' },
            { native: 'อ', romanized: 'O Ang', english: 'Basin (mid class)' },
            { native: 'ฮ', romanized: 'Ho Nok-huk', english: 'Owl (low class)' }
          ],
          tips: ['Thai has 5 tones: mid, low, falling, high, rising', 'Consonants are split into Mid, High, and Low classes which dictate the tone rules', 'Practice writing starting with the small loop in each letter'],
          practice: 'Write the 44 Thai consonants on paper, and pronounce their names aloud.',
        },
      },
      {
        id: 'th-02', title: 'Greetings & Politeness', description: 'Essential Thai greetings and polite expressions', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Thai culture places great emphasis on politeness. Learn the full list of essential greetings.',
          keyPhrases: [
            { native: 'สวัสดี', romanized: 'Sawasdee', english: 'Hello / Goodbye' },
            { native: 'ขอบคุณ', romanized: 'Khob Khun', english: 'Thank you' },
            { native: 'ไม่เป็นไร', romanized: 'Mai pen rai', english: "It\'s okay / No problem" },
            { native: 'ขอโทษ', romanized: 'Kho thot', english: 'Excuse me / Sorry' },
            { native: 'ยินดีที่รู้จัก', romanized: 'Yin dee thi roo jak', english: 'Nice to meet you' },
            { native: 'สบายดีไหม', romanized: 'Sabai dee mai', english: 'How are you?' },
            { native: 'สบายดี', romanized: 'Sabai dee', english: 'I am fine' },
            { native: 'แล้วเจอกัน', romanized: 'Laeo joe kan', english: 'See you later' },
            { native: 'โชคดี', romanized: 'Chok dee', english: 'Good luck' },
            { native: 'ลาก่อน', romanized: 'La kon', english: 'Goodbye' }
          ],
          tips: ['Add "krap" (male) or "ka" (female) at the end to be polite', 'Lower your head slightly when performing the Wai gesture to show respect'],
          practice: 'Practice introducing yourself and asking "Sabai dee mai" with correct polite particles.',
        },
      },
      {
        id: 'th-03', title: 'Numbers 1–100', description: 'Count in Thai from one to one hundred', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Count in Thai completely. Learn the single units, the tens, and how to combine them.',
          keyPhrases: [
            { native: 'ศูนย์', romanized: 'Sun', english: 'Zero (0)' },
            { native: 'หนึ่ง', romanized: 'Nueng', english: 'One (1)' },
            { native: 'สอง', romanized: 'Song', english: 'Two (2)' },
            { native: 'สาม', romanized: 'Sam', english: 'Three (3)' },
            { native: 'สี่', romanized: 'See', english: 'Four (4)' },
            { native: 'ห้า', romanized: 'Ha', english: 'Five (5)' },
            { native: 'หก', romanized: 'Hok', english: 'Six (6)' },
            { native: 'เจ็ด', romanized: 'Chet', english: 'Seven (7)' },
            { native: 'แปด', romanized: 'Paet', english: 'Eight (8)' },
            { native: 'เก้า', romanized: 'Kao', english: 'Nine (9)' },
            { native: 'สิบ', romanized: 'Sip', english: 'Ten (10)' },
            { native: 'สิบเอ็ด', romanized: 'Sip et', english: 'Eleven (11)' },
            { native: 'ยี่สิบ', romanized: 'Yee sip', english: 'Twenty (20)' },
            { native: 'ยี่สิบเอ็ด', romanized: 'Yee sip et', english: 'Twenty-one (21)' },
            { native: 'สามสิบ', romanized: 'Sam sip', english: 'Thirty (30)' },
            { native: 'ร้อย', romanized: 'Roi', english: 'Hundred (100)' }
          ],
          tips: ['Any number ending in 1 in the unit position uses "et" instead of "nueng", e.g., 21 is "yee sip et"', '20 is "yee sip" instead of "song sip"'],
          practice: 'Count aloud from 1 to 30, then count the tens (10, 20, 30... 100).',
        },
      },
      {
        id: 'th-04', title: 'Food & Ordering at a Restaurant', description: 'Order food and drinks like a local', type: 'conversation', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Knowing how to order food and ask questions is essential in Thailand.',
          keyPhrases: [
            { native: 'ขอเมนูหน่อยได้ไหม', romanized: 'Kho menu noi dai mai', english: 'Can I have the menu please?' },
            { native: 'อร่อยมาก', romanized: 'Aroi mak', english: 'Very delicious!' },
            { native: 'เผ็ดน้อยๆ', romanized: 'Phet noi noi', english: 'A little bit spicy' },
            { native: 'เช็คบิลด้วย', romanized: 'Check bin duai', english: 'Bill please' },
            { native: 'ไม่ใส่ผักชี', romanized: 'Mai sai phak chi', english: 'No coriander please' },
            { native: 'ขอน้ำเปล่าหน่อย', romanized: 'Kho nam plao noi', english: 'Please bring plain water' },
            { native: 'อันนี้อะไร', romanized: 'An ni arai', english: 'What is this?' },
            { native: 'หิวข้าว', romanized: 'Hiu khao', english: 'I am hungry' },
            { native: 'เอาอันนี้', romanized: 'Ao an ni', english: 'I will take this one' },
            { native: 'อิ่มแล้ว', romanized: 'Im laeo', english: 'I am full' }
          ],
          tips: ['Say "aroi mak" to compliment street food vendors', 'If you cannot eat spicy food, say "mai phet" (not spicy)'],
          practice: 'Imagine you are ordering a dish, asking for water, and requesting the bill.',
        },
      },
      {
        id: 'th-05', title: 'Getting Around: Directions', description: 'Ask for and give directions in Thai', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Navigate Thailand\'s cities using standard direction vocabulary.',
          keyPhrases: [
            { native: 'ไปที่ไหน', romanized: 'Pai thi nai', english: 'Where are you going?' },
            { native: 'ตรงไป', romanized: 'Trong pai', english: 'Go straight' },
            { native: 'เลี้ยวซ้าย', romanized: 'Liao sai', english: 'Turn left' },
            { native: 'เลี้ยวขวา', romanized: 'Liao kwa', english: 'Turn right' },
            { native: 'อยู่ไกลไหม', romanized: 'Yu klai mai', english: 'Is it far?' },
            { native: 'อยู่ใกล้ๆ', romanized: 'Yu klai klai', english: 'It is nearby' },
            { native: 'หยุดตรงนี้', romanized: 'Yut trong ni', english: 'Stop here' },
            { native: 'เลี้ยวกลับ', romanized: 'Liao klap', english: 'U-turn / Turn back' },
            { native: 'สถานีรถไฟอยู่ที่ไหน', romanized: 'Sathani rot fai yu thi nai', english: 'Where is the train station?' },
            { native: 'สุขาอยู่ที่ไหน', romanized: 'Sukha yu thi nai', english: 'Where is the restroom?' }
          ],
          tips: ['Tuk-tuks are fun, but agree on the price before boarding', 'Keep a screenshot of your hotel address in Thai script'],
          practice: 'Describe a route turning left, straight, and right to find the station.',
        },
      },
      {
        id: 'th-06', title: 'Tones in Thai', description: 'Master the 5 Thai tones with practice exercises', type: 'pronunciation', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Thai has 5 spoken tones. Understanding how tones change the meaning of words is critical.',
          keyPhrases: [
            { native: 'มา', romanized: 'Maa (mid)', english: 'To come' },
            { native: 'ม้า', romanized: 'Máa (high)', english: 'Horse' },
            { native: 'หมา', romanized: 'Mǎa (rising)', english: 'Dog' },
            { native: 'ข่า', romanized: 'Khàa (low)', english: 'Galangal' },
            { native: 'ฆ่า', romanized: 'Khâa (falling)', english: 'To kill' },
            { native: 'ป้า', romanized: 'Pâa (falling)', english: 'Aunt' },
            { native: 'ปา', romanized: 'Paa (mid)', english: 'To throw' },
            { native: 'ป่า', romanized: 'Pàa (low)', english: 'Forest' },
            { native: 'ค่า', romanized: 'Khâa (falling)', english: 'Value / Cost' },
            { native: 'ขา', romanized: 'Khǎa (rising)', english: 'Leg' }
          ],
          tips: ['The 5 tones are: Mid, Low, Falling, High, Rising', 'Incorrect tones can completely alter your statement (e.g. dog vs. horse)'],
          practice: 'Read aloud: Maa (mid), Màa (low), Mâa (falling), Máa (high), Mǎa (rising).',
        },
      },
      {
        id: 'th-07', title: 'Thai Family & Relationships', description: 'Vocabulary for family members and social relationships', type: 'vocabulary', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Learn specific terms for relatives and social titles in Thai.',
          keyPhrases: [
            { native: 'พ่อ', romanized: 'Pho', english: 'Father' },
            { native: 'แม่', romanized: 'Mae', english: 'Mother' },
            { native: 'พี่ชาย', romanized: 'Phi chai', english: 'Older brother' },
            { native: 'พี่สาว', romanized: 'Phi sao', english: 'Older sister' },
            { native: 'น้องชาย', romanized: 'Nong chai', english: 'Younger brother' },
            { native: 'น้องสาว', romanized: 'Nong sao', english: 'Younger sister' },
            { native: 'ลูกชาย', romanized: 'Luk chai', english: 'Son' },
            { native: 'ลูกสาว', romanized: 'Luk sao', english: 'Daughter' },
            { native: 'ปู่ / ย่า', romanized: 'Pu / Ya', english: 'Paternal Grandfather / Grandmother' },
            { native: 'ตา / ยาย', romanized: 'Ta / Yai', english: 'Maternal Grandfather / Grandmother' }
          ],
          tips: ['Thai pronouns and titles reflect age differences', 'Using "Phi" or "Nong" in front of a name shows friendly respect'],
          practice: 'List your family members and write down their Thai kinship terms.',
        },
      },
      {
        id: 'th-08', title: 'Thai Festivals & Traditions', description: 'Explore Thai culture through its major festivals', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Explore primary celebrations that bring Thai history and community together.',
          keyPhrases: [
            { native: 'สงกรานต์', romanized: 'Songkran', english: 'Thai New Year Water Festival' },
            { native: 'ลอยกระทง', romanized: 'Loy Krathong', english: 'Festival of Lanterns / Floating Baskets' },
            { native: 'วันพระ', romanized: 'Wan Phra', english: 'Buddhist Holy Day' },
            { native: 'ทำบุญ', romanized: 'Tham bun', english: 'To make merit' },
            { native: 'ตักบาตร', romanized: 'Tak bat', english: 'Alms giving to monks' },
            { native: 'ไหว้พระ', romanized: 'Wai phra', english: 'Pay respects to Buddha images' },
            { native: 'เทศกาลกินเจ', romanized: 'Thetsakan Kin Che', english: 'Vegetarian Festival' },
            { native: 'รดน้ำดำหัว', romanized: 'Rot nam dam hua', english: 'Pouring water on elders\' hands for blessing' },
            { native: 'เวียนเทียน', romanized: 'Wian thian', english: 'Candlelit circumambulation at temples' },
            { native: 'กระทง', romanized: 'Krathong', english: 'Floating leaf vessel' }
          ],
          tips: ['Songkran occurs in April, the hottest month of the year', 'Loy Krathong falls on the full moon of the 12th lunar month'],
          practice: 'Describe Songkran and Loy Krathong in Thai to a friend.',
        },
      },
      {
        id: 'th-09', title: 'Present Tense Sentences', description: 'Build simple present tense Thai sentences', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Construct basic declarative sentences using standard word order.',
          keyPhrases: [
            { native: 'ฉันกินข้าว', romanized: 'Chan gin khao', english: 'I (female) eat rice' },
            { native: 'ผมทำงาน', romanized: 'Phom tham ngan', english: 'I (male) work' },
            { native: 'เราเรียนภาษาไทย', romanized: 'Rao rian phasa thai', english: 'We study Thai' },
            { native: 'เธอชอบเพลง', romanized: 'Thoe chop phleng', english: 'She likes music' },
            { native: 'พวกเขาวิ่ง', romanized: 'Phuak khao wing', english: 'They run' },
            { native: 'เขาดูทีวี', romanized: 'Khao du tee-vee', english: 'He watches TV' },
            { native: 'คุณพูดภาษาอังกฤษไหม', romanized: 'Khun phut phasa ang-krit mai', english: 'Do you speak English?' },
            { native: 'ฉันไม่เข้าใจ', romanized: 'Chan mai khao jai', english: 'I do not understand' },
            { native: 'ผมรักคุณ', romanized: 'Phom rak khun', english: 'I love you' },
            { native: 'นี่คืออะไร', romanized: 'Ni khue arai', english: 'What is this?' }
          ],
          tips: ['Thai word order is Subject + Verb + Object', 'Verbs are not conjugated for tense or person'],
          practice: 'Create 5 original sentences using different subjects, verbs, and objects.',
        },
      },
      {
        id: 'th-10', title: 'Shopping Vocabulary', description: 'Bargain and shop at Thai markets', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Learn how to inquire about pricing, colors, and ask for discounts at local markets.',
          keyPhrases: [
            { native: 'ราคาเท่าไร', romanized: 'Raka thao rai', english: 'How much does it cost?' },
            { native: 'แพงเกินไป', romanized: 'Phaeng koen pai', english: 'Too expensive' },
            { native: 'ลดได้ไหม', romanized: 'Lot dai mai', english: 'Can you reduce the price?' },
            { native: 'เอาอันนี้', romanized: 'Ao an ni', english: 'I will take this one' },
            { native: 'มีสีอื่นไหม', romanized: 'Mi si uen mai', english: 'Do you have other colors?' },
            { native: 'มีไซส์ใหญ่กว่านี้ไหม', romanized: 'Mi size yai kwa ni mai', english: 'Do you have a larger size?' },
            { native: 'ราคาถูก', romanized: 'Raka thuk', english: 'Cheap price' },
            { native: 'ขอดูหน่อย', romanized: 'Kho du noi', english: 'Can I see it?' },
            { native: 'จ่ายเงินสด', romanized: 'Chai ngoen sot', english: 'Pay cash' },
            { native: 'ใส่ถุงไหม', romanized: 'Sai thung mai', english: 'Put in a bag?' }
          ],
          tips: ['Keep bargaining friendly and always smile', 'Say "lot noi dai mai" for a quick discount request'],
          practice: 'Role-play bargaining with a shopkeeper, asking for a discount.',
        },
      },
      {
        id: 'th-11', title: 'Weather & Seasons', description: 'Talk about the weather and climate in Thailand', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Learn weather terms to converse about temperature and climate conditions.',
          keyPhrases: [
            { native: 'ร้อน', romanized: 'Ron', english: 'Hot' },
            { native: 'ฝนตก', romanized: 'Fon tok', english: 'Raining' },
            { native: 'หนาว', romanized: 'Nao', english: 'Cold / Cool' },
            { native: 'ฤดูฝน', romanized: 'Ruedoo fon', english: 'Rainy season' },
            { native: 'พายุ', romanized: 'Phayu', english: 'Storm' },
            { native: 'แดดจัด', romanized: 'Daet chat', english: 'Very sunny' },
            { native: 'ลมแรง', romanized: 'Lom raeng', english: 'Strong wind' },
            { native: 'ฤดูร้อน', romanized: 'Ruedoo ron', english: 'Hot season' },
            { native: 'ฤดูหนาว', romanized: 'Ruedoo nao', english: 'Cool season' },
            { native: 'ร้อนมาก', romanized: 'Ron mak', english: 'Very hot' }
          ],
          tips: ['Thailand has three seasons: Hot, Rainy, and Cool', '"mak" is appended for emphasis, e.g., "หนาวมาก" (very cold)'],
          practice: 'State the weather today using Thai temperature and season terms.',
        },
      },
      {
        id: 'th-12', title: 'Temple Etiquette', description: 'Learn key customs when visiting a Buddhist temple', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Visiting a temple (Wat) requires respectful behavior and attire. Study the key rules.',
          keyPhrases: [
            { native: 'วัด', romanized: 'Wat', english: 'Temple' },
            { native: 'พระ', romanized: 'Phra', english: 'Monk' },
            { native: 'ถอดรองเท้า', romanized: 'Thot rong thao', english: 'Take off shoes' },
            { native: 'ห้ามถ่ายรูป', romanized: 'Ham thai roop', english: 'Do not take photos' },
            { native: 'พระพุทธรูป', romanized: 'Phra phuttha roop', english: 'Buddha image' },
            { native: 'สำรวม', romanized: 'Samruam', english: 'Be quiet / respectful' },
            { native: 'แต่งตัวสุภาพ', romanized: 'Taeng tua suphap', english: 'Dress politely' },
            { native: 'บริจาค', romanized: 'Borichak', english: 'To donate' },
            { native: 'ทำบุญ', romanized: 'Tham bun', english: 'Make merit' },
            { native: 'เข้าวัด', romanized: 'Khao wat', english: 'Enter the temple' }
          ],
          tips: ['Cover shoulders and knees inside temples', 'Do not point your feet toward Buddha statues or monks'],
          practice: 'Write down 3 clothing choices suitable for visiting a Thai temple.',
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
      }
    ]
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
          intro: 'Hangul has 14 basic consonants and 10 basic vowels. Let\'s study all basic letters.',
          keyPhrases: [
            { native: 'ㄱ', romanized: 'Giyeok (g/k)', english: 'Consonant: g/k' },
            { native: 'ㄴ', romanized: 'Nieun (n)', english: 'Consonant: n' },
            { native: 'ㄷ', romanized: 'Digeut (d/t)', english: 'Consonant: d/t' },
            { native: 'ㄹ', romanized: 'Rieul (r/l)', english: 'Consonant: r/l' },
            { native: 'ㅁ', romanized: 'Mieum (m)', english: 'Consonant: m' },
            { native: 'ㅂ', romanized: 'Bieup (b/p)', english: 'Consonant: b/p' },
            { native: 'ㅅ', romanized: 'Siot (s)', english: 'Consonant: s' },
            { native: 'ㅇ', romanized: 'Ieung (ng/silent)', english: 'Consonant: silent/ng' },
            { native: 'ㅈ', romanized: 'Jieut (j)', english: 'Consonant: j' },
            { native: 'ㅊ', romanized: 'Chieut (ch)', english: 'Consonant: ch' },
            { native: 'ㅋ', romanized: 'Kieuk (k)', english: 'Consonant: k' },
            { native: 'ㅌ', romanized: 'Tieut (t)', english: 'Consonant: t' },
            { native: 'ㅍ', romanized: 'Pieup (p)', english: 'Consonant: p' },
            { native: 'ㅎ', romanized: 'Hieut (h)', english: 'Consonant: h' },
            { native: 'ㅏ', romanized: 'A', english: 'Vowel: a' },
            { native: 'ㅓ', romanized: 'Eo', english: 'Vowel: eo' },
            { native: 'ㅗ', romanized: 'O', english: 'Vowel: o' },
            { native: 'ㅜ', romanized: 'U', english: 'Vowel: u' },
            { native: 'ㅡ', romanized: 'Eu', english: 'Vowel: eu' },
            { native: 'ㅣ', romanized: 'I', english: 'Vowel: i' }
          ],
          tips: ['Letters are combined into syllable blocks', 'The letter ㅇ is silent when placed at the beginning of a syllable block'],
          practice: 'Write the 14 basic consonants and 10 vowels and combine them to write "한글" (Hangeul).',
        },
      },
      {
        id: 'ko-02', title: 'Basic Greetings', description: 'Say hello, goodbye and polite expressions in Korean', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Polite greetings are crucial. Study the essential formal and informal expressions.',
          keyPhrases: [
            { native: '안녕하세요', romanized: 'Annyeonghaseyo', english: 'Hello (polite)' },
            { native: '감사합니다', romanized: 'Gamsahamnida', english: 'Thank you (formal)' },
            { native: '죄송합니다', romanized: 'Joesonghamnida', english: 'I am sorry' },
            { native: '안녕히 가세요', romanized: 'Annyeonghi gaseyo', english: 'Goodbye (to someone leaving)' },
            { native: '안녕히 계세요', romanized: 'Annyeonghi gyeseyo', english: 'Goodbye (to someone staying)' },
            { native: '만나서 반갑습니다', romanized: 'Mannaseo bangapseumnida', english: 'Nice to meet you' },
            { native: '실례합니다', romanized: 'Sillyehamnida', english: 'Excuse me' },
            { native: '천만에요', romanized: 'Cheonmaneyo', english: 'You\'re welcome' },
            { native: '괜찮아요', romanized: 'Gwenchanayo', english: 'It is okay' },
            { native: '네 / 아니요', romanized: 'Ne / Aniyo', english: 'Yes / No' }
          ],
          tips: ['Bow slightly when greeting people', 'Use "yo" (요) endings for standard polite speech'],
          practice: 'Bow and practice saying "Annyeonghaseyo" and "Gamsahamnida" aloud.',
        },
      },
      {
        id: 'ko-03', title: 'Numbers: Native & Sino-Korean', description: 'Learn both Korean counting systems', type: 'vocabulary', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'Korean has Native (counting things/age) and Sino-Korean (dates/money) numbers. Study both.',
          keyPhrases: [
            { native: '하나 / 일', romanized: 'Hana / Il', english: 'One (Native / Sino)' },
            { native: '둘 / 이', romanized: 'Dul / I', english: 'Two' },
            { native: '셋 / 삼', romanized: 'Set / Sam', english: 'Three' },
            { native: '넷 / 사', romanized: 'Net / Sa', english: 'Four' },
            { native: '다섯 / 오', romanized: 'Daseot / O', english: 'Five' },
            { native: '여섯 / 육', romanized: 'Yeoseot / Yuk', english: 'Six' },
            { native: '일곱 / 칠', romanized: 'Ilgop / Chil', english: 'Seven' },
            { native: '여덟 / 팔', romanized: 'Yeodeol / Pal', english: 'Eight' },
            { native: '아홉 / 구', romanized: 'Ahop / Gu', english: 'Nine' },
            { native: '열 / 십', romanized: 'Yeol / Sip', english: 'Ten' },
            { native: '백', romanized: 'Baek', english: 'Hundred (Sino)' },
            { native: '천', romanized: 'Cheon', english: 'Thousand (Sino)' },
            { native: '만', romanized: 'Man', english: 'Ten Thousand (Sino)' }
          ],
          tips: ['Use Native numbers for telling hours (시) and age', 'Use Sino numbers for phone numbers, prices, and minutes (분)'],
          practice: 'Say your phone number in Sino-Korean, and your age in Native Korean.',
        },
      },
      {
        id: 'ko-04', title: 'K-Culture: K-Drama & K-Pop Expressions', description: 'Common phrases heard in Korean entertainment', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Learn standard casual phrases frequently heard in Dramas and Pop music.',
          keyPhrases: [
            { native: '대박', romanized: 'Daebak', english: 'Awesome / Amazing' },
            { native: '화이팅', romanized: 'Hwaiting', english: 'Fighting! (You can do it!)' },
            { native: '오빠', romanized: 'Oppa', english: 'Older brother (girl to older male)' },
            { native: '아이고', romanized: 'Aigo', english: 'Oh my! / Oops' },
            { native: '진짜요?', romanized: 'Jinjjayo?', english: 'Really?' },
            { native: '가지마', romanized: 'Gajima', english: 'Don\'t go' },
            { native: '사랑해', romanized: 'Saranghae', english: 'I love you (informal)' },
            { native: '약속해', romanized: 'Yaksokhae', english: 'Promise me' },
            { native: '행복해', romanized: 'Haengbokhae', english: 'I am happy' },
            { native: '헐', romanized: 'Heol', english: 'OMG / What (slang)' }
          ],
          tips: ['Slang like "daebak" is common in chats but avoid it in professional settings'],
          practice: 'Watch a drama clip and list 3 terms you recognized.',
        },
      },
      {
        id: 'ko-05', title: 'Sentence Structure: SOV Order', description: 'Understanding Korean grammar basics', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Korean verbs go at the end. Study the Subject-Object-Verb order.',
          keyPhrases: [
            { native: '나는 밥을 먹어요', romanized: 'Naneun babeul meogeoyo', english: 'I eat rice (I-rice-eat)' },
            { native: '그는 음악을 좋아해요', romanized: 'Geuneun eumageul joahaeyo', english: 'He likes music' },
            { native: '우리는 한국어를 배워요', romanized: 'Urineun hangugeo-reul baewoyo', english: 'We learn Korean' },
            { native: '그녀는 책을 읽어요', romanized: 'Geunyeoneun chaeg-eul ilgeoyo', english: 'She reads a book' },
            { native: '저는 학생이에요', romanized: 'Jeoneun haksaengieyo', english: 'I am a student' },
            { native: '이것은 책이에요', romanized: 'Igeoseun chaegieyo', english: 'This is a book' },
            { native: '날씨가 좋아요', romanized: 'Nalssiga joayo', english: 'The weather is good' },
            { native: '김치가 매워요', romanized: 'Kimchiga maewoyo', english: 'Kimchi is spicy' },
            { native: '물이 필요해요', romanized: 'Muri piryohaeyo', english: 'I need water' },
            { native: '가방이 무거워요', romanized: 'Gabangi mugeowoyo', english: 'The bag is heavy' }
          ],
          tips: ['Subject markers: 이/가 | Object markers: 을/를 | Topic markers: 은/는'],
          practice: 'Write 3 simple sentences using the structure: [Subject] [Object] [Verb].',
        },
      },
      {
        id: 'ko-06', title: 'At the Restaurant', description: 'Order Korean food and interact with servers', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Dine confidently in Korea. Practice ordering and requesting side dishes.',
          keyPhrases: [
            { native: '여기요!', romanized: 'Yeogiyo!', english: 'Excuse me! (calling server)' },
            { native: '이거 주세요', romanized: 'Igeo juseyo', english: 'Give me this, please' },
            { native: '맛있어요', romanized: 'Massisseoyo', english: 'It is delicious' },
            { native: '물 한 잔 주세요', romanized: 'Mul han jan juseyo', english: 'Please bring a glass of water' },
            { native: '계산서 주세요', romanized: 'Gyesanseo juseyo', english: 'Bill please' },
            { native: '얼마예요?', romanized: 'Eolmayeyo?', english: 'How much is it?' },
            { native: '반찬 더 주세요', romanized: 'Banchan deo juseyo', english: 'More side dishes, please' },
            { native: '덜 맵게 해주세요', romanized: 'Deol maepge haejuseyo', english: 'Make it less spicy, please' },
            { native: '포장해 주세요', romanized: 'Pojanghae juseyo', english: 'Pack it to go, please' },
            { native: '잘 먹겠습니다', romanized: 'Jal meokgesseumnida', english: 'I will eat well (bon appétit)' }
          ],
          tips: ['Side dishes (banchan) are refillable for free in most Korean restaurants'],
          practice: 'Simulate ordering bibimbap, asking for more kimchi, and requesting the bill.',
        },
      },
      {
        id: 'ko-07', title: 'Weather & Seasons', description: 'Talk about weather and the four seasons in Korean', type: 'vocabulary', difficulty: 'intermediate', duration: '11 min',
        content: {
          intro: 'Talk about heat, cold, rain, snow, and Korea\'s four seasons.',
          keyPhrases: [
            { native: '오늘 날씨가 어때요?', romanized: 'Oneul nalssiga eottaeyo?', english: 'How is the weather today?' },
            { native: '더워요', romanized: 'Deowoyo', english: 'It is hot' },
            { native: '추워요', romanized: 'Chuwoyo', english: 'It is cold' },
            { native: '비가 와요', romanized: 'Biga wayo', english: 'It is raining' },
            { native: '눈이 와요', romanized: 'Nuni wayo', english: 'It is snowing' },
            { native: '바람이 불어요', romanized: 'Barami bureoyo', english: 'The wind is blowing' },
            { native: '봄', romanized: 'Bom', english: 'Spring' },
            { native: '여름', romanized: 'Yeoreum', english: 'Summer' },
            { native: '가을', romanized: 'Gaeul', english: 'Autumn' },
            { native: '겨울', romanized: 'Gyeoul', english: 'Winter' }
          ],
          tips: ['Spring and Autumn are dry and comfortable, while Summer is hot and humid'],
          practice: 'State what season you like best and describe today\'s weather in Korean.',
        },
      },
      {
        id: 'ko-08', title: 'Honorifics & Speech Levels', description: 'Navigate Korean formal and informal speech', type: 'grammar', difficulty: 'advanced', duration: '20 min',
        content: {
          intro: 'Understand the difference between formal polite, informal polite, and casual levels.',
          keyPhrases: [
            { native: '하십시오체', romanized: 'Hapsiosi-che', english: 'Formal polite (business/public)' },
            { native: '해요체', romanized: 'Haeyo-che', english: 'Informal polite (everyday polite)' },
            { native: '해체 (반말)', romanized: 'Hae-che (Banmal)', english: 'Casual speech (friends/kids)' },
            { native: '드시다', romanized: 'Deushida', english: 'Eat (honorific form of 먹다)' },
            { native: '계시다', romanized: 'Gyeshida', english: 'Stay / Be (honorific of 있다)' },
            { native: '주무시다', romanized: 'Jumushida', english: 'Sleep (honorific of 자다)' },
            { native: '말씀', romanized: 'Malsseum', english: 'Speech / Word (honorific of 말)' },
            { native: '성함', romanized: 'Seongham', english: 'Name (honorific of 이름)' },
            { native: '연세', romanized: 'Yeonse', english: 'Age (honorific of 나이)' },
            { native: '진지', romanized: 'Jinji', english: 'Meal (honorific of 밥)' }
          ],
          tips: ['Always use 해요체 (ending in -요) with strangers or those older than you'],
          practice: 'Change "밥을 먹어요" to its honorific equivalent using "진지" and "드시다".',
        },
      },
      {
        id: 'ko-09', title: 'Travel & Transportation', description: 'Navigate buses, subways, and taxis in Korea', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Use buses, trains, and subways using key navigational questions.',
          keyPhrases: [
            { native: '지하철역이 어디예요?', romanized: 'Jihacheol-yeogi eodiyeyo?', english: 'Where is the subway station?' },
            { native: '...에 가주세요', romanized: '...e gajuseyo', english: 'Please take me to...' },
            { native: '얼마예요?', romanized: 'Eolmayeyo?', english: 'How much is it?' },
            { native: '다음 정류장', romanized: 'Daeum jeongnyujang', english: 'Next stop' },
            { native: '표 한 장 주세요', romanized: 'Pyo han jang juseyo', english: 'One ticket, please' },
            { native: '여기서 내릴게요', romanized: 'Yeogiseo naerilgeyo', english: 'I will get off here' },
            { native: '버스 카드 충전해 주세요', romanized: 'Beoseu kadeu chungjeonhae juseyo', english: 'Top up transit card, please' },
            { native: '얼마나 걸려요?', romanized: 'Eolmana geollyeyo?', english: 'How long does it take?' },
            { native: '왼쪽으로 가세요', romanized: 'Oenjjogeuro gaseyo', english: 'Go left' },
            { native: '오른쪽으로 가세요', romanized: 'Orenjjogeuro gaseyo', english: 'Go right' }
          ],
          tips: ['T-Money cards are used for all subways, buses, and taxis in major cities'],
          practice: 'Simulate asking for directions to the subway station and getting off at the next stop.',
        },
      },
      {
        id: 'ko-10', title: 'Korean Food Culture', description: 'Explore iconic Korean dishes and food etiquette', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Learn about popular Korean dishes and dining etiquette rules.',
          keyPhrases: [
            { native: '김치', romanized: 'Kimchi', english: 'Spicy fermented cabbage' },
            { native: '불고기', romanized: 'Bulgogi', english: 'Marinated sliced beef' },
            { native: '비빔밥', romanized: 'Bibimbap', english: 'Mixed rice with vegetables and meat' },
            { native: '삼겹살', romanized: 'Samgyeopsal', english: 'Pork belly slices' },
            { native: '떡볶이', romanized: 'Tteokbokki', english: 'Spicy rice cakes' },
            { native: '찌개', romanized: 'Jjigae', english: 'Stew' },
            { native: '국물', romanized: 'Gungmul', english: 'Soup / broth' },
            { native: '숟가락 / 젓가락', romanized: 'Sutgarak / Jeotgarak', english: 'Spoon / Chopsticks' },
            { native: '건배', romanized: 'Geonbae', english: 'Cheers' },
            { native: '물수건', romanized: 'Mulsugeon', english: 'Wet hand towel' }
          ],
          tips: ['Never hold your rice bowl in your hand while eating; leave it on the table'],
          practice: 'Practice setting a traditional table layout with spoon and chopsticks.',
        },
      },
      {
        id: 'ko-11', title: 'Korean Hobbies & Activities', description: 'Talk about popular pastimes in South Korea', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Share sports, games, and entertainment activities with friends.',
          keyPhrases: [
            { native: '등산', romanized: 'Deungsan', english: 'Hiking' },
            { native: '노래방', romanized: 'Noraebang', english: 'Singing room / Karaoke' },
            { native: 'PC방', romanized: 'PC bang', english: 'Internet cafe / gaming room' },
            { native: '영화 보기', romanized: 'Yeonghwa bogi', english: 'Watching movies' },
            { native: '쇼핑', romanized: 'Syoping', english: 'Shopping' },
            { native: '운동하기', romanized: 'Undonghagi', english: 'Exercising' },
            { native: '게임하기', romanized: 'Geimhagi', english: 'Playing games' },
            { native: '독서', romanized: 'Dokseo', english: 'Reading books' },
            { native: '음악 듣기', romanized: 'Eumak deutgi', english: 'Listening to music' },
            { native: '여행', romanized: 'Yeohaeng', english: 'Traveling' }
          ],
          tips: ['"Deungsan" (hiking) is incredibly popular in Korea on weekends'],
          practice: 'State your favorite hobby in Korean: "제 취미는 [Hobby]예요".',
        },
      },
      {
        id: 'ko-12', title: 'K-Food: Street Food', description: 'Discover the delicious street food of Korea', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Identify standard skewers and spicy bites sold in street markets.',
          keyPhrases: [
            { native: '오뎅', romanized: 'Odeng', english: 'Fish cakes' },
            { native: '김밥', romanized: 'Gimbap', english: 'Seaweed rice rolls' },
            { native: '순대', romanized: 'Sundae', english: 'Blood sausage' },
            { native: '튀김', romanized: 'Twigim', english: 'Deep-fried snacks' },
            { native: '포장마차', romanized: 'Pojangmacha', english: 'Street food tent' },
            { native: '붕어빵', romanized: 'Bungeoppang', english: 'Fish-shaped sweet red bean pastry' },
            { native: '호떡', romanized: 'Hotteok', english: 'Sweet filled pancake' },
            { native: '핫도그', romanized: 'Hatdogeu', english: 'Korean corn dog' },
            { native: '닭꼬치', romanized: 'Dakkkoci', english: 'Chicken skewers' },
            { native: '순대볶음', romanized: 'Sundaebokkeum', english: 'Stir-fried blood sausage' }
          ],
          tips: ['In Pojangmacha, fish cake soup (odeng guk) is often served free in a paper cup'],
          practice: 'Imagine buying street food and asking "Igeo eolmayeyo?" (How much is this?).',
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
      }
    ]
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
          intro: 'Hiragana is the fundamental writing system. Learn all 46 basic characters.',
          keyPhrases: [
            { native: 'あ い う え お', romanized: 'a i u e o', english: 'Vowel sounds: a, i, u, e, o' },
            { native: 'か き く け こ', romanized: 'ka ki ku ke ko', english: 'K-row: ka, ki, ku, ke, ko' },
            { native: 'さ し す せ そ', romanized: 'sa shi su se so', english: 'S-row: sa, shi, su, se, so' },
            { native: 'た ち つ て と', romanized: 'ta chi tsu te to', english: 'T-row: ta, chi, tsu, te, to' },
            { native: 'な に ぬ ね の', romanized: 'na ni nu ne no', english: 'N-row: na, ni, nu, ne, no' },
            { native: 'は ひ ふ へ ほ', romanized: 'ha hi fu he ho', english: 'H-row: ha, hi, fu, he, ho' },
            { native: 'ま み む め も', romanized: 'ma mi mu me mo', english: 'M-row: ma, mi, mu, me, mo' },
            { native: 'や ゆ よ', romanized: 'ya yu yo', english: 'Y-row: ya, yu, yo' },
            { native: 'ら り る れ ろ', romanized: 'ra ri ru re ro', english: 'R-row: ra, ri, ru, re, ro' },
            { native: 'わ を ん', romanized: 'wa wo n', english: 'W-row & singular N sound' }
          ],
          tips: ['Hiragana is phonetic. Follow stroke orders strictly for clean handwriting'],
          practice: 'Write the complete 46 Hiragana characters grid from あ to ん.',
        },
      },
      {
        id: 'ja-02', title: 'Katakana: For Foreign Words', description: 'Learn Katakana used for loanwords and emphasis', type: 'pronunciation', difficulty: 'beginner', duration: '18 min',
        content: {
          intro: 'Katakana is used for foreign words and names. Study the 46 Katakana characters.',
          keyPhrases: [
            { native: 'ア イ ウ エ オ', romanized: 'a i u e o', english: 'Vowels: A, I, U, E, O' },
            { native: 'カ キ ク ケ コ', romanized: 'ka ki ku ke ko', english: 'K-row: ka, ki, ku, ke, ko' },
            { native: 'サ シ ス セ ソ', romanized: 'sa shi su se so', english: 'S-row: sa, shi, su, se, so' },
            { native: 'タ チ ツ テ ト', romanized: 'ta chi tsu te to', english: 'T-row: ta, chi, tsu, te, to' },
            { native: 'ナ ニ ヌ ネ ノ', romanized: 'na ni nu ne no', english: 'N-row: na, ni, nu, ne, no' },
            { native: 'ハ ヒ フ ヘ ホ', romanized: 'ha hi fu he ho', english: 'H-row: ha, hi, fu, he, ho' },
            { native: 'マ ミ ム メ モ', romanized: 'ma mi mu me mo', english: 'M-row: ma, mi, mu, me, mo' },
            { native: 'ヤ ユ ヨ', romanized: 'ya yu yo', english: 'Y-row: ya, yu, yo' },
            { native: 'ラ リ ル レ ロ', romanized: 'ra ri ru re ro', english: 'R-row: ra, ri, ru, re, ro' },
            { native: 'ワ ヲ ン', romanized: 'wa wo n', english: 'W-row: wa, wo, n' }
          ],
          tips: ['Katakana characters have sharp, straight lines, unlike rounded Hiragana'],
          practice: 'Translate your name into Katakana and practice writing it.',
        },
      },
      {
        id: 'ja-03', title: 'Greetings & Politeness', description: 'Essential Japanese greetings for all occasions', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Politeness is essential. Study key greetings for morning, day, night, and thank-yous.',
          keyPhrases: [
            { native: 'おはようございます', romanized: 'Ohayou gozaimasu', english: 'Good morning (formal)' },
            { native: 'こんにちは', romanized: 'Konnichiwa', english: 'Hello / Good afternoon' },
            { native: 'こんばんは', romanized: 'Konbanwa', english: 'Good evening' },
            { native: 'ありがとうございます', romanized: 'Arigatou gozaimasu', english: 'Thank you very much' },
            { native: 'すみません', romanized: 'Sumimasen', english: 'Excuse me / I am sorry' },
            { native: 'はじめまして', romanized: 'Hajimemashite', english: 'Nice to meet you (first time)' },
            { native: 'お元気ですか', romanized: 'Ogenki desu ka', english: 'How are you?' },
            { native: '元気です', romanized: 'Genki desu', english: 'I am fine' },
            { native: 'さようなら', romanized: 'Sayounara', english: 'Goodbye' },
            { native: 'おねがいします', romanized: 'Onegaishimasu', english: 'Please (requesting)' }
          ],
          tips: ['Sumimasen is highly versatile; use it to call waiters or express mild apologies'],
          practice: 'Bow slightly and practice greeting someone using "Hajimemashite".',
        },
      },
      {
        id: 'ja-04', title: 'Japanese Particles', description: 'Understand wa, ga, wo, ni, de and more', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Learn grammatical particles that mark nouns and verbs.',
          keyPhrases: [
            { native: 'は (wa)', romanized: 'wa', english: 'Topic marker (as for...)' },
            { native: 'が (ga)', romanized: 'ga', english: 'Subject marker' },
            { native: 'を (wo)', romanized: 'o', english: 'Direct object marker' },
            { native: 'に (ni)', romanized: 'ni', english: 'Target / Time / Location marker' },
            { native: 'で (de)', romanized: 'de', english: 'Location of action / Means of action' },
            { native: 'と (to)', romanized: 'to', english: 'And / With marker' },
            { native: 'も (mo)', romanized: 'mo', english: 'Also / Too marker' },
            { native: 'の (no)', romanized: 'no', english: 'Possessive marker (e.g. my)' },
            { native: 'から / まで', romanized: 'kara / made', english: 'From / Until' },
            { native: 'へ (e)', romanized: 'e', english: 'Directional marker (toward)' }
          ],
          tips: ['The topic particle is written as は (ha) but pronounced wa'],
          practice: 'Identify particles in the sentence: "わたしはとしょかんでほんをよみます".',
        },
      },
      {
        id: 'ja-05', title: 'Japanese Numbers & Counters', description: 'Count things correctly using Japanese counters', type: 'vocabulary', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Learn Japanese counting bases and common objects classifiers.',
          keyPhrases: [
            { native: '一 / 二 / 三', romanized: 'ichi / ni / san', english: 'One / Two / Three (1 / 2 / 3)' },
            { native: '四 / 五 / 六', romanized: 'yon (shi) / go / roku', english: 'Four / Five / Six (4 / 5 / 6)' },
            { native: '七 / 八 / 九', romanized: 'nana (shichi) / hachi / kyuu', english: 'Seven / Eight / Nine (7 / 8 / 9)' },
            { native: '十 / 百 / 千', romanized: 'juu / hyaku / sen', english: 'Ten / Hundred / Thousand (10 / 100 / 1000)' },
            { native: '一つ', romanized: 'hitotsu', english: 'One (general object)' },
            { native: '二つ', romanized: 'futatsu', english: 'Two (general objects)' },
            { native: '一人', romanized: 'hitori', english: 'One person' },
            { native: '二人', romanized: 'futari', english: 'Two people' },
            { native: '一枚', romanized: 'ichimai', english: 'One flat item (paper/ticket)' },
            { native: '一本', romanized: 'ippon', english: 'One long cylindrical item (bottle/pen)' }
          ],
          tips: ['Generic counters (tsu) are safe to use for general small items'],
          practice: 'Count 3 pieces of paper using "mai" and 3 books using general counters.',
        },
      },
      {
        id: 'ja-06', title: 'Japanese Restaurant Phrases', description: 'Dine in Japan with confidence', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Order food, ask for recommendation, and pay the bill.',
          keyPhrases: [
            { native: 'いただきます', romanized: 'Itadakimasu', english: 'I humbly receive (before meals)' },
            { native: 'ごちそうさまでした', romanized: 'Gochisousamadeshita', english: 'Thank you for the meal (after)' },
            { native: 'おすすめは何ですか', romanized: 'Osusume wa nan desu ka', english: 'What do you recommend?' },
            { native: 'お会計をお願いします', romanized: 'Okaikei wo onegaishimasu', english: 'Check, please' },
            { native: 'これをお願いします', romanized: 'Kore wo onegaishimasu', english: 'This one, please' },
            { native: 'お水をお願いします', romanized: 'Omizu wo onegaishimasu', english: 'Water, please' },
            { native: 'メニューをください', romanized: 'Menyuu wo kudasai', english: 'Please give me a menu' },
            { native: '辛いですか', romanized: 'Karai desu ka', english: 'Is it spicy?' },
            { native: 'おいしいです', romanized: 'Oishii desu', english: 'It is delicious' },
            { native: 'クレジットカードは使えますか', romanized: 'Kurejitto kaado wa tsukaemasu ka', english: 'Can I use a credit card?' }
          ],
          tips: ['Water or hot green tea is always served free in Japanese diners'],
          practice: 'Roleplay ordering ramen, asking for water, and requesting the bill.',
        },
      },
      {
        id: 'ja-07', title: 'Kanji Basics: Top 50', description: 'Learn the most fundamental kanji characters', type: 'vocabulary', difficulty: 'intermediate', duration: '25 min',
        content: {
          intro: 'Kanji characters represent meanings. Learn the basic natural elements.',
          keyPhrases: [
            { native: '日', romanized: 'Nichi / Hi', english: 'Sun / Day' },
            { native: '月', romanized: 'Getsu / Tsuki', english: 'Moon / Month' },
            { native: '火', romanized: 'Ka / Hi', english: 'Fire' },
            { native: '水', romanized: 'Sui / Mizu', english: 'Water' },
            { native: '木', romanized: 'Moku / Ki', english: 'Tree / Wood' },
            { native: '金', romanized: 'Kin / Kane', english: 'Gold / Money' },
            { native: '土', romanized: 'Do / Tsuchi', english: 'Soil / Earth' },
            { native: '山', romanized: 'San / Yama', english: 'Mountain' },
            { native: '川', romanized: 'Sen / Kawa', english: 'River' },
            { native: '人', romanized: 'Jin / Hito', english: 'Person' }
          ],
          tips: ['Kanji have Kun\'yomi (Japanese reading) and On\'yomi (Chinese reading)'],
          practice: 'Write the days of the week in Kanji: 月曜日 through 日曜日.',
        },
      },
      {
        id: 'ja-08', title: 'Japanese Work Culture', description: 'Understand Japanese business etiquette', type: 'culture', difficulty: 'advanced', duration: '15 min',
        content: {
          intro: 'Study essential greetings and protocol in Japanese companies.',
          keyPhrases: [
            { native: 'お疲れ様です', romanized: 'Otsukaresama desu', english: 'Thank you for your hard work' },
            { native: '名刺', romanized: 'Meishi', english: 'Business card' },
            { native: '上司', romanized: 'Jooshi', english: 'Boss / Superior' },
            { native: '会議', romanized: 'Kaigi', english: 'Meeting' },
            { native: '残業', romanized: 'Zangyou', english: 'Overtime work' },
            { native: '失礼します', romanized: 'Shitsurei shimasu', english: 'Excuse me (entering/leaving office)' },
            { native: 'お先に失礼します', romanized: 'Osaki ni shitsurei shimasu', english: 'Excuse me for leaving ahead' },
            { native: '名刺交換', romanized: 'Meishi koukan', english: 'Business card exchange' },
            { native: '報告', romanized: 'Houkoku', english: 'Report' },
            { native: '取引先', romanized: 'Torihikisaki', english: 'Client / partner' }
          ],
          tips: ['Exchange business cards (Meishi) using both hands and bow slightly'],
          practice: 'Simulate business card exchange with a partner using both hands.',
        },
      },
      {
        id: 'ja-09', title: 'Te-form: Connecting Verbs', description: 'Use the te-form to build complex sentences', type: 'grammar', difficulty: 'advanced', duration: '22 min',
        content: {
          intro: 'Use Te-form to list activities or make requests.',
          keyPhrases: [
            { native: '食べてください', romanized: 'Tabete kudasai', english: 'Please eat' },
            { native: '走っています', romanized: 'Hashitte imasu', english: 'I am running' },
            { native: '起きて、朝ご飯を食べます', romanized: 'Okite, asagohan wo tabemasu', english: 'I wake up and eat breakfast' },
            { native: '見てもいいですか', romanized: 'Mite mo ii desu ka', english: 'May I look?' },
            { native: '入ってはいけません', romanized: 'Haitte wa ikemasen', english: 'You must not enter' },
            { native: '待ってください', romanized: 'Matte kudasai', english: 'Please wait' },
            { native: '書いてください', romanized: 'Kaite kudasai', english: 'Please write' },
            { native: '話してください', romanized: 'Hanashite kudasai', english: 'Please speak' },
            { native: '来てください', romanized: 'Kite kudasai', english: 'Please come' },
            { native: 'してください', romanized: 'Shite kudasai', english: 'Please do' }
          ],
          tips: ['Group 1 verbs end in -u, Group 2 end in -iru/-eru, Group 3 are irregular (suru/kuru)'],
          practice: 'Convert the verb "yomu" (to read) into "yonde kudasai".',
        },
      },
      {
        id: 'ja-10', title: 'Japanese Pop Culture', description: 'Anime, manga, and otaku culture vocabulary', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Learn words commonly heard in Japanese pop media and conventions.',
          keyPhrases: [
            { native: 'アニメ / マンガ', romanized: 'Anime / Manga', english: 'Japanese animation / Comics' },
            { native: 'かわいい', romanized: 'Kawaii', english: 'Cute / Adorable' },
            { native: 'すごい', romanized: 'Sugoi', english: 'Amazing / Great' },
            { native: 'なるほど', romanized: 'Naruhodo', english: 'I see / Makes sense' },
            { native: 'オタク', romanized: 'Otaku', english: 'Enthusiast / Geek' },
            { native: 'やばい', romanized: 'Yabai', english: 'Crazy / Unreal (slang)' },
            { native: 'ほんとうに?', romanized: 'Hontou ni?', english: 'Really?' },
            { native: 'よし！', romanized: 'Yoshi!', english: 'Alright! / Okay!' },
            { native: 'かっこいい', romanized: 'Kakkoii', english: 'Cool / Good-looking' },
            { native: 'おもしろい', romanized: 'Omoishiroi', english: 'Interesting' }
          ],
          tips: ['Anime slang is often highly informal; use standard forms with elders'],
          practice: 'Draft a short paragraph about your favorite anime using "sugoi" and "kakkoii".',
        },
      },
      {
        id: 'ja-11', title: 'Weather & Seasons', description: 'Discuss Japan\'s weather and four seasons', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Talk about rain, clear skies, heat, cold, and seasonal features.',
          keyPhrases: [
            { native: '晴れ', romanized: 'Hare', english: 'Sunny' },
            { native: '雨', romanized: 'Ame', english: 'Rain' },
            { native: '曇り', romanized: 'Kumori', english: 'Cloudy' },
            { native: '雪', romanized: 'Yuki', english: 'Snow' },
            { native: '暑い', romanized: 'Atsui', english: 'Hot (temperature)' },
            { native: '寒い', romanized: 'Samui', english: 'Cold (temperature)' },
            { native: '暖かい', romanized: 'Atatakai', english: 'Warm' },
            { native: '涼しい', romanized: 'Suzushii', english: 'Cool' },
            { native: '春 / 夏 / 秋 / 冬', romanized: 'Haru / Natsu / Aki / Fuyu', english: 'Spring / Summer / Autumn / Winter' },
            { native: '桜', romanized: 'Sakura', english: 'Cherry blossoms' }
          ],
          tips: ['Japanese seasons are highly celebrated with specific viewing events (Hanami/Koyo)'],
          practice: 'State the weather today: "[Weather] desu".',
        },
      },
      {
        id: 'ja-12', title: 'Japanese Onsen Culture', description: 'Learn the rules of visiting a hot spring', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Visiting public hot springs requires strictly following bathing rules.',
          keyPhrases: [
            { native: '温泉', romanized: 'Onsen', english: 'Hot spring' },
            { native: '湯', romanized: 'Yu', english: 'Hot water' },
            { native: '浴衣', romanized: 'Yukata', english: 'Light cotton kimono' },
            { native: '脱衣所', romanized: 'Datsuijo', english: 'Changing room' },
            { native: '洗う', romanized: 'Arau', english: 'To wash' },
            { native: '露天風呂', romanized: 'Rotenburo', english: 'Outdoor hot spring bath' },
            { native: '水風呂', romanized: 'Mizuburo', english: 'Cold water bath' },
            { native: 'タオル', romanized: 'Taoru', english: 'Towel' },
            { native: 'のれん', romanized: 'Noren', english: 'Entrance split curtains' },
            { native: '足湯', romanized: 'Ashiyu', english: 'Foot bath' }
          ],
          tips: ['Wash and rinse thoroughly before entering the hot spring water'],
          practice: 'List 3 rules you must keep when entering an Onsen bath area.',
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
      }
    ]
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
          intro: 'French pronunciation is famous for silent letters and nasal sounds. Let\'s study key phonetics.',
          keyPhrases: [
            { native: 'eau', romanized: '/o/', english: 'Water sound (like oh)' },
            { native: 'eu', romanized: '/ø/', english: 'rounded uh sound' },
            { native: 'en / an', romanized: '/ɑ̃/', english: 'Nasal vowel sound' },
            { native: 'in / ain', romanized: '/ɛ̃/', english: 'Nasal "an" sound' },
            { native: 'on / om', romanized: '/ɔ̃/', english: 'Nasal "on" sound' },
            { native: 'ou', romanized: '/u/', english: 'oo sound (like tool)' },
            { native: 'oi', romanized: '/wa/', english: 'wa sound (like watch)' },
            { native: 'ch', romanized: '/ʃ/', english: 'sh sound (like shoe)' },
            { native: 'ç (cédille)', romanized: '/s/', english: 's sound (instead of hard k)' },
            { native: 'r (guttural)', romanized: '/ʁ/', english: 'Guttural back-throat R sound' }
          ],
          tips: ['Final letters like s, t, d, x are usually silent', 'Liaison links silent final consonants to starting vowels'],
          practice: 'Practice pronouncing nasal sounds "en", "in", and "on" slowly.',
        },
      },
      {
        id: 'fr-02', title: 'Les Salutations', description: 'Greetings and introductions in French', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Greet people correctly based on the time of day and social relationships.',
          keyPhrases: [
            { native: 'Bonjour', romanized: 'bohn-zhoor', english: 'Hello / Good morning' },
            { native: 'Bonsoir', romanized: 'bohn-swahr', english: 'Good evening' },
            { native: 'Enchanté(e)', romanized: 'ahn-shahn-tay', english: 'Pleased to meet you' },
            { native: 'Comment allez-vous?', romanized: 'ko-mahn-tah-lay-voo', english: 'How are you? (formal)' },
            { native: 'Ça va?', romanized: 'sah vah', english: 'How\'s it going? (informal)' },
            { native: 'Au revoir', romanized: 'oh ruh-vwahr', english: 'Goodbye' },
            { native: 'S\'il vous plaît', romanized: 'seel voo ple', english: 'Please (formal)' },
            { native: 'Merci beaucoup', romanized: 'mair-see boh-koo', english: 'Thank you very much' },
            { native: 'De rien', romanized: 'duh ryɛ̃', english: 'You\'re welcome' },
            { native: 'Salut', romanized: 'sah-loo', english: 'Hi / Bye (casual)' }
          ],
          tips: ['Use "tu" with friends and family, and "vous" with strangers and elders'],
          practice: 'Practice introducing yourself: "Bonjour, je m\'appelle... Comment allez-vous?".',
        },
      },
      {
        id: 'fr-03', title: 'Gender of Nouns', description: 'Understand masculine and feminine nouns', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Every French noun has a gender that determines matching articles and adjectives.',
          keyPhrases: [
            { native: 'le livre', romanized: 'luh leevr', english: 'The book (masculine)' },
            { native: 'la table', romanized: 'la tabl', english: 'The table (feminine)' },
            { native: 'un chat', romanized: 'uhn shah', english: 'A cat (masculine)' },
            { native: 'une voiture', romanized: 'oon vwah-ture', english: 'A car (feminine)' },
            { native: 'les livres / les tables', romanized: 'lay...', english: 'The books / tables (plural)' },
            { native: 'des chats', romanized: 'day...', english: 'Some cats (plural)' },
            { native: 'le garçon', romanized: 'luh gar-sohn', english: 'The boy (masculine)' },
            { native: 'la fille', romanized: 'la fee-yuh', english: 'The girl (feminine)' },
            { native: 'l\'homme / l\'école', romanized: 'lohm / lay-kohl', english: 'The man / school (elision with starting vowel)' },
            { native: 'un ami / une amie', romanized: 'uhn ami / oon ami', english: 'A friend (masculine / feminine)' }
          ],
          tips: ['Most nouns ending in -e are feminine, but exceptions exist', 'Memorize nouns with their articles: "un" or "une"'],
          practice: 'List 10 objects and mark if they are masculine or feminine.',
        },
      },
      {
        id: 'fr-04', title: 'French Numbers 1–100', description: 'Count fluently in French', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Count from 1 to 100. Pay attention to unique counting bases from 70 onwards.',
          keyPhrases: [
            { native: 'un, deux, trois', romanized: 'uh, duh, trwah', english: 'One, two, three' },
            { native: 'quatre, cinq, six', romanized: 'katr, sank, sees', english: 'Four, five, six' },
            { native: 'sept, huit, neuf, dix', romanized: 'set, weet, nuf, dees', english: 'Seven, eight, nine, ten' },
            { native: 'vingt', romanized: 'vɛ̃', english: 'Twenty (20)' },
            { native: 'trente / quarante', romanized: 'trahnt / kah-rahnt', english: 'Thirty / Forty' },
            { native: 'cinquante / soixante', romanized: 'sank-ahnt / swah-sahnt', english: 'Fifty / Sixty' },
            { native: 'soixante-dix', romanized: 'swah-sahnt-dees', english: 'Seventy (60+10 = 70)' },
            { native: 'quatre-vingts', romanized: 'katr-vɛ̃', english: 'Eighty (4x20 = 80)' },
            { native: 'quatre-vingt-dix', romanized: 'katr-vɛ̃-dees', english: 'Ninety (4x20+10 = 90)' },
            { native: 'cent', romanized: 'sahn', english: 'Hundred (100)' }
          ],
          tips: ['French numbers 70-99 use addition base math: e.g. 75 is "soixante-quinze" (60+15)'],
          practice: 'Practice counting the tens: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.',
        },
      },
      {
        id: 'fr-05', title: 'Essential Verbs: Être & Avoir', description: 'Master "to be" and "to have"', type: 'grammar', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'Être and Avoir are irregular verbs essential for present and compound tenses.',
          keyPhrases: [
            { native: 'je suis / tu es', romanized: '—', english: 'I am / you are (Être)' },
            { native: 'il est / nous sommes', romanized: '—', english: 'he is / we are' },
            { native: 'vous êtes / ils sont', romanized: '—', english: 'you are / they are' },
            { native: 'j\'ai / tu as', romanized: '—', english: 'I have / you have (Avoir)' },
            { native: 'il a / nous avons', romanized: '—', english: 'he has / we have' },
            { native: 'vous avez / ils ont', romanized: '—', english: 'you have / they have' },
            { native: 'je suis fatigué(e)', romanized: '—', english: 'I am tired' },
            { native: 'j\'ai faim', romanized: '—', english: 'I have hunger (I am hungry)' },
            { native: 'j\'ai chaud', romanized: '—', english: 'I am hot' },
            { native: 'quel âge avez-vous?', romanized: '—', english: 'How old are you? (What age have you?)' }
          ],
          tips: ['Avoir is used for expressions of hunger, thirst, age, and temperature'],
          practice: 'Conjugate Être and Avoir on paper from memory.',
        },
      },
      {
        id: 'fr-06', title: 'At the Bistro', description: 'Order food and request coffee like a local', type: 'conversation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Learn bistro dialogues to order espresso, bread, and water, and ask for the bill.',
          keyPhrases: [
            { native: 'L\'addition, s\'il vous plaît', romanized: 'ladis-yohn...', english: 'The bill, please' },
            { native: 'Je voudrais un café', romanized: 'zhuh voo-dray...', english: 'I would like an espresso' },
            { native: 'Une carafe d\'eau', romanized: 'oon kah-rahf doh', english: 'A jug of tap water' },
            { native: 'S\'il vous plaît !', romanized: 'seel voo ple', english: 'Excuse me! (calling server)' },
            { native: 'Un croissant, s\'il vous plaît', romanized: '—', english: 'A croissant, please' },
            { native: 'Je suis végétarien(ne)', romanized: '—', english: 'I am vegetarian' },
            { native: 'C\'est délicieux', romanized: '—', english: 'It is delicious' },
            { native: 'Qu\'est-ce que vous recommandez?', romanized: '—', english: 'What do you recommend?' },
            { native: 'Je voudrais commander', romanized: '—', english: 'I would like to order' },
            { native: 'Le menu, s\'il vous plaît', romanized: '—', english: 'The menu, please' }
          ],
          tips: ['"Un café" gets you a small, strong black espresso; ask for "café au lait" for milk'],
          practice: 'Roleplay ordering water, a croissant, and requesting the bill.',
        },
      },
      {
        id: 'fr-07', title: 'Adjective Agreement', description: 'Make adjectives agree in gender and number', type: 'grammar', difficulty: 'intermediate', duration: '14 min',
        content: {
          intro: 'Adjectives match the noun they modify. Learn masculine, feminine, and plural patterns.',
          keyPhrases: [
            { native: 'petit / petite', romanized: 'puh-tee / puh-teet', english: 'small (masculine / feminine)' },
            { native: 'grand / grande', romanized: 'grahn / grahnd', english: 'tall / large' },
            { native: 'petits / petites', romanized: '—', english: 'small (plural: masculine / feminine)' },
            { native: 'beau / belle', romanized: 'boh / bel', english: 'beautiful (irregular)' },
            { native: 'bon / bonne', romanized: 'bohn / bun', english: 'good' },
            { native: 'nouveau / nouvelle', romanized: '—', english: 'new' },
            { native: 'facile', romanized: 'fah-seel', english: 'easy (same endings for both genders)' },
            { native: 'intéressant / intéressante', romanized: '—', english: 'interesting' },
            { native: 'le chat blanc', romanized: '—', english: 'The white cat' },
            { native: 'la table blanche', romanized: '—', english: 'The white table' }
          ],
          tips: ['Most French adjectives go AFTER the noun, except for common ones like bag, grand, beau'],
          practice: 'Translate "the small car (voiture)" and "the tall man (homme)" into French.',
        },
      },
      {
        id: 'fr-08', title: 'Ask Questions', description: 'Form questions using Est-ce que and inversion', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Ask questions using three standard structures: intonation, Est-ce que, and inversion.',
          keyPhrases: [
            { native: 'Est-ce que vous parlez anglais?', romanized: '—', english: 'Do you speak English?' },
            { native: 'Parlez-vous français?', romanized: '—', english: 'Do you speak French? (inversion)' },
            { native: 'Où est la gare?', romanized: '—', english: 'Where is the station?' },
            { native: 'Comment ça s\'appelle?', romanized: '—', english: 'What is it called?' },
            { native: 'Pourquoi?', romanized: 'poor-kwah', english: 'Why?' },
            { native: 'Quand?', romanized: 'kahn', english: 'When?' },
            { native: 'Combien ça coûte?', romanized: '—', english: 'How much does it cost?' },
            { native: 'Qui est-ce?', romanized: 'kee es', english: 'Who is it?' },
            { native: 'Qu\'est-ce que c\'est?', romanized: 'kes-kuh-say', english: 'What is it?' },
            { native: 'Tu viens?', romanized: '—', english: 'Are you coming? (intonation)' }
          ],
          tips: ['"Est-ce que" is highly popular and matches conversational settings'],
          practice: 'Rewrite "Vous mangez" (You eat) into 3 question styles.',
        },
      },
      {
        id: 'fr-09', title: 'French Art & History', description: 'Explore French culture and art institutions', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Explore museums, art movements, and national historical symbols.',
          keyPhrases: [
            { native: 'Le Louvre', romanized: 'luh loovr', english: 'The world\'s largest art museum' },
            { native: 'Liberté, Égalité, Fraternité', romanized: '—', english: 'Liberty, Equality, Fraternity (national motto)' },
            { native: 'La Révolution française', romanized: '—', english: 'The French Revolution (1789)' },
            { native: 'Impressionnisme', romanized: '—', english: 'Art movement (Monet, Renoir)' },
            { native: 'La fête nationale', romanized: '—', english: 'Bastille Day (July 14th)' },
            { native: 'L\'arc de triomphe', romanized: '—', english: 'Triumphal Arch' },
            { native: 'Notre-Dame', romanized: '—', english: 'Gothic cathedral in Paris' },
            { native: 'La gastronomie', romanized: '—', english: 'French culinary art heritage' },
            { native: 'La tour Eiffel', romanized: '—', english: 'Eiffel Tower' },
            { native: 'Château de Versailles', romanized: '—', english: 'Versailles Palace' }
          ],
          tips: ['Many museums are free on the first Sunday of each month in France'],
          practice: 'List 3 details about Bastille Day or Louvre museum collections.',
        },
      },
      {
        id: 'fr-10', title: 'Shopping Vocabulary', description: 'Purchase clothing and goods', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Inquire about sizes, payments, and receipt documentation.',
          keyPhrases: [
            { native: 'Je cherche...', romanized: 'zhuh shair-sh...', english: 'I am looking for...' },
            { native: 'Combien ça coûte?', romanized: '—', english: 'How much does it cost?' },
            { native: 'Je voudrais payer par carte', romanized: '—', english: 'I would like to pay by card' },
            { native: 'Le ticket de caisse', romanized: '—', english: 'The receipt' },
            { native: 'Avez-vous une autre taille?', romanized: '—', english: 'Do you have another size?' },
            { native: 'Je peux l\'essayer?', romanized: '—', english: 'Can I try it on?' },
            { native: 'C\'est trop cher', romanized: '—', english: 'It is too expensive' },
            { native: 'Les cabines d\'essayage', romanized: '—', english: 'Fitting rooms' },
            { native: 'Un sac, s\'il vous plaît', romanized: '—', english: 'A bag, please' },
            { native: 'C\'est en solde?', romanized: '—', english: 'Is it on sale?' }
          ],
          tips: ['Bargaining is not done in French stores; prices are fixed'],
          practice: 'Simulate asking to try on a shirt, paying by card, and requesting the receipt.',
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
            { native: 'Il neige', romanized: 'il nezh', english: 'It is snowing' },
            { native: 'Il fait du vent', romanized: '—', english: 'It is windy' },
            { native: 'Le printemps', romanized: '—', english: 'Spring' },
            { native: 'L\'été', romanized: '—', english: 'Summer' },
            { native: 'L\'hiver', romanized: '—', english: 'Winter' }
          ],
          tips: ['French uses "il fait" (literally: it makes) to describe weather, e.g. "Il fait froid"'],
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
            { native: 'Café crème', romanized: '—', english: 'Coffee with milk' },
            { native: 'Un thé', romanized: '—', english: 'A tea' },
            { native: 'Le serveur', romanized: '—', english: 'The waiter' },
            { native: 'Une carafe d\'eau', romanized: '—', english: 'A jug of tap water' },
            { native: 'Un pain au chocolat', romanized: '—', english: 'Chocolate pastry' }
          ],
          tips: ['Ordering "un café" in France gets you a small, strong black espresso', 'Always start your order with "Bonjour" to be polite'],
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
            { native: 'Bientôt', py: '—', english: 'Soon' },
            { native: 'Je vais étudier le français', romanized: '—', english: 'I am going to study French' }
          ],
          tips: ['Futur Proche is highly common in spoken French for plan actions'],
          practice: 'Translate "I am going to order a croissant tonight" into French.',
        },
      }
    ]
  },
  {
    id: 'spanish',
    language: 'Spanish',
    flag: '🇪🇸',
    color: '#ca8a04',
    gradient: 'from-yellow-500 to-red-500',
    lessons: [
      {
        id: 'es-01', title: 'Spanish Alphabet & Sounds', description: 'Master Spanish letters, accents, and pronunciation', type: 'pronunciation', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'Spanish spelling is phonetic. Study vowel sounds and special letters.',
          keyPhrases: [
            { native: 'a, e, i, o, u', romanized: '—', english: 'Vowels: consistent pure sounds' },
            { native: 'ñ', romanized: 'enye', english: 'ñ sound (like "ny" in canyon)' },
            { native: 'rr (doble ere)', romanized: '—', english: 'Trilled R sound' },
            { native: 'h (hache)', romanized: '—', english: 'Always silent letter' },
            { native: 'ch', romanized: '—', english: 'ch sound (like church)' },
            { native: 'll', romanized: '—', english: 'y or j sound (depending on region)' },
            { native: 'g (before e/i)', romanized: '—', english: 'guttural h sound' },
            { native: 'j (jota)', romanized: '—', english: 'guttural h sound' },
            { native: 'z (zeta)', romanized: '—', english: 'th (Spain) or s (Latin America)' },
            { native: 'c (before e/i)', romanized: '—', english: 'th (Spain) or s (Latin America)' }
          ],
          tips: ['Spanish vowels always have one consistent pronunciation', 'Practice trilling "rr" by placing the tip of your tongue on the roof of your mouth'],
          practice: 'Read aloud: a, e, i, o, u. Practice saying "niño" and "guitarra".',
        },
      },
      {
        id: 'es-02', title: 'Hola y Más: Greetings', description: 'Greet people in Spanish at any time of day', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Spanish greetings are warm and friendly. Study standard conversational greetings.',
          keyPhrases: [
            { native: '¡Buenos días!', romanized: 'bwenos dias', english: 'Good morning!' },
            { native: '¿Cómo estás?', romanized: 'komo estas', english: 'How are you? (informal)' },
            { native: 'Mucho gusto', romanized: 'mutʃo gusto', english: 'Nice to meet you' },
            { native: 'Hasta luego', romanized: 'asta lweɡo', english: 'See you later' },
            { native: '¿Qué tal?', romanized: 'ke tal', english: "What\'s up? / How\'s it going?" },
            { native: 'Hola', romanized: 'ola', english: 'Hello' },
            { native: 'Buenas tardes', romanized: '—', english: 'Good afternoon' },
            { native: 'Buenas noches', romanized: '—', english: 'Good night' },
            { native: 'Gracias', romanized: '—', english: 'Thank you' },
            { native: 'De nada', romanized: '—', english: 'You\'re welcome' }
          ],
          tips: ['Spanish uses opening punctuation marks ¡ and ¿ at the start of exclamations and questions'],
          practice: 'Practice introducing yourself: "Hola, me llamo... ¿y tú?".',
        },
      },
      {
        id: 'es-03', title: 'Ser vs Estar', description: 'Master the two Spanish verbs "to be"', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Spanish has two verbs meaning "to be". Ser represents permanent traits, Estar represents states.',
          keyPhrases: [
            { native: 'Soy estudiante', romanized: '—', english: 'I am a student (SER — identity)' },
            { native: 'Estoy cansado', romanized: '—', english: 'I am tired (ESTAR — state)' },
            { native: 'La casa es grande', romanized: '—', english: 'The house is large (SER — trait)' },
            { native: 'El café está caliente', romanized: '—', english: 'The coffee is hot (ESTAR — condition)' },
            { native: 'Estamos en Madrid', romanized: '—', english: 'We are in Madrid (ESTAR — location)' },
            { native: 'Eres inteligente', romanized: '—', english: 'You are smart (SER)' },
            { native: '¿Dónde está el baño?', romanized: '—', english: 'Where is the restroom? (ESTAR)' },
            { native: 'Hoy es lunes', romanized: '—', english: 'Today is Monday (SER — time)' },
            { native: 'El libro está aquí', romanized: '—', english: 'The book is here (ESTAR)' },
            { native: 'Él es médico', romanized: '—', english: 'He is a doctor (SER)' }
          ],
          tips: ['Use SER for origin, occupation, time, characteristics', 'Use ESTAR for location, feelings, progressive tenses'],
          practice: 'Identify ser/estar usage in: "Él ___ triste" and "La mesa ___ de madera (wood)".',
        },
      },
      {
        id: 'es-04', title: 'Numbers & Money', description: 'Count and handle money in Spanish', type: 'vocabulary', difficulty: 'beginner', duration: '11 min',
        content: {
          intro: 'Count and ask prices. Learn bases 1-10, tens, and shopping queries.',
          keyPhrases: [
            { native: 'uno, dos, tres', romanized: '—', english: 'One, two, three' },
            { native: 'cuatro, cinco, seis', romanized: '—', english: 'Four, five, six' },
            { native: 'siete, ocho, nueve, diez', romanized: '—', english: 'Seven, eight, nine, ten' },
            { native: 'veinte', romanized: 'beynte', english: 'Twenty (20)' },
            { native: 'treinta / cuarenta', romanized: '—', english: 'Thirty / Forty' },
            { native: 'cincuenta / cien', romanized: '—', english: 'Fifty / Hundred (100)' },
            { native: '¿Cuánto cuesta?', romanized: 'kwanto kwesta', english: 'How much does it cost?' },
            { native: 'Es muy caro', romanized: 'es muy karo', english: 'It is very expensive' },
            { native: 'Quiero pagar', romanized: 'kyero paɡar', english: 'I want to pay' },
            { native: 'Efectivo / Tarjeta', romanized: '—', english: 'Cash / Card' }
          ],
          tips: ['"uno" turns into "un" in front of masculine singular nouns (e.g., un euro)'],
          practice: 'Practice counting aloud from 1 to 30 in Spanish.',
        },
      },
      {
        id: 'es-05', title: 'Present Tense Conjugation', description: 'Conjugate Spanish regular and irregular verbs', type: 'grammar', difficulty: 'intermediate', duration: '20 min',
        content: {
          intro: 'Regular Spanish verbs fall into -ar, -er, or -ir classes. Learn the suffixes.',
          keyPhrases: [
            { native: 'hablar → hablo', romanized: '—', english: 'to speak → I speak (-ar verb)' },
            { native: 'comer → como', romanized: '—', english: 'to eat → I eat (-er verb)' },
            { native: 'vivir → vivo', romanized: '—', english: 'to live → I live (-ir verb)' },
            { native: 'hablas / habla', romanized: '—', english: 'you speak / he speaks' },
            { native: 'hablamos / hablan', romanized: '—', english: 'we speak / they speak' },
            { native: 'ir → voy', romanized: '—', english: 'to go → I go (irregular)' },
            { native: 'tener → tengo', romanized: '—', english: 'to have → I have (irregular yo)' },
            { native: 'hacer → hago', romanized: '—', english: 'to do/make → I do' },
            { native: 'querer → quiero', romanized: '—', english: 'to want → I want (stem change)' },
            { native: 'poder → puedo', romanized: '—', english: 'to be able → I can' }
          ],
          tips: ['Stem-changing verbs change vowels (e.g., o→ue, e→ie) in all forms except nosotros'],
          practice: 'Conjugate "hablar" and "comer" in all persons.',
        },
      },
      {
        id: 'es-06', title: 'Spanish-Speaking World', description: 'Explore the diversity of Spanish-speaking countries', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Explore regions and cuisines of countries where Spanish is the national language.',
          keyPhrases: [
            { native: 'México', romanized: '—', english: 'Most populous Spanish-speaking nation' },
            { native: 'La paella', romanized: '—', english: "Spain\'s famous rice dish" },
            { native: 'El tango', romanized: '—', english: 'Dance from Argentina' },
            { native: 'El fútbol', romanized: '—', english: 'Football (soccer) — national passion' },
            { native: 'La siesta', romanized: '—', english: 'Traditional afternoon rest' },
            { native: 'Los Andes', romanized: '—', english: 'Andes mountain range' },
            { native: 'El flamenco', romanized: '—', english: 'Traditional dance from Andalucia' },
            { native: 'Tacos', romanized: '—', english: 'Iconic Mexican street food' },
            { native: 'El ceviche', romanized: '—', english: 'Citrus seafood dish popular in Peru' },
            { native: 'Día de los Muertos', romanized: '—', english: 'Day of the Dead celebration' }
          ],
          tips: ['Spanish accents differ by country; Latin American Spanish differs from Spain\'s Castilian'],
          practice: 'Choose one Spanish-speaking country and list two traditional dishes.',
        },
      },
      {
        id: 'es-07', title: 'Preterite Tense', description: 'Talk about completed past actions in Spanish', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Learn the Preterite tense (pretérito indefinido) for actions that finished in the past.',
          keyPhrases: [
            { native: 'Comí pizza ayer', romanized: '—', english: 'I ate pizza yesterday' },
            { native: 'Fui al mercado', romanized: '—', english: 'I went to the market' },
            { native: 'Ella llegó tarde', romanized: '—', english: 'She arrived late' },
            { native: 'Nosotros hablamos', romanized: '—', english: 'We spoke' },
            { native: '¿Qué hiciste?', romanized: '—', english: 'What did you do?' },
            { native: 'Ayer', romanized: '—', english: 'Yesterday' },
            { native: 'Anoche', romanized: '—', english: 'Last night' },
            { native: 'La semana pasada', romanized: '—', english: 'Last week' },
            { native: 'Compré un libro', romanized: '—', english: 'I bought a book' },
            { native: 'Ellos comieron', romanized: '—', english: 'They ate' }
          ],
          tips: ['Use preterite for single completed actions; imperfect is for descriptions/habits'],
          practice: 'Translate "I spoke (hablar) with my mother yesterday" into Spanish.',
        },
      },
      {
        id: 'es-08', title: 'At the Doctor', description: 'Describe symptoms and understand medical advice', type: 'conversation', difficulty: 'advanced', duration: '15 min',
        content: {
          intro: 'Interact with medical staff and detail health issues.',
          keyPhrases: [
            { native: 'Me duele la cabeza', romanized: '—', english: 'My head hurts' },
            { native: 'Tengo fiebre', romanized: '—', english: 'I have a fever' },
            { native: 'Soy alérgico/a a...', romanized: '—', english: 'I am allergic to...' },
            { native: 'Necesito una receta', romanized: '—', english: 'I need a prescription' },
            { native: '¿Dónde está la farmacia?', romanized: '—', english: 'Where is the pharmacy?' },
            { native: 'Me siento mal', romanized: '—', english: 'I feel sick' },
            { native: 'Tengo tos', romanized: '—', english: 'I have a cough' },
            { native: 'Me duele el estómago', romanized: '—', english: 'My stomach hurts' },
            { native: '¿Tiene pastillas?', romanized: '—', english: 'Do you have pills?' },
            { native: 'Llame a una ambulancia', romanized: '—', english: 'Call an ambulance' }
          ],
          tips: ['"Doler" (to hurt) conjugates like "gustar" (e.g. me duele / me duelen)'],
          practice: 'Simulate calling a clinic, explaining a stomach ache and asking for the pharmacy.',
        },
      },
      {
        id: 'es-09', title: 'Spanish Subjunctive', description: 'Express desires, doubts, and hypotheticals', type: 'grammar', difficulty: 'advanced', duration: '20 min',
        content: {
          intro: 'The Subjunctive mood is for doubt, desires, and emotions. Learn basic constructions.',
          keyPhrases: [
            { native: 'Quiero que vengas', romanized: '—', english: 'I want you to come' },
            { native: 'Espero que llueva', romanized: '—', english: 'I hope it rains' },
            { native: 'Dudo que sea verdad', romanized: '—', english: 'I doubt that it is true' },
            { native: 'Es importante que estudies', romanized: '—', english: 'It is important that you study' },
            { native: 'Cuando llegues, llámame', romanized: '—', english: 'When you arrive, call me' },
            { native: 'Espero que pases el examen', romanized: '—', english: 'I hope you pass the exam' },
            { native: 'Ojalá', romanized: 'o-hala', english: 'Hopefully / God willing' },
            { native: 'No creo que venga', romanized: '—', english: 'I don\'t think he is coming' },
            { native: 'Es posible que...', romanized: '—', english: 'It is possible that...' },
            { native: 'Quiero que seas feliz', romanized: '—', english: 'I want you to be happy' }
          ],
          tips: ['The trigger words "quiero que" or "espero que" force the use of subjunctive in the next clause'],
          practice: 'Rewrite "Vienes" (You come) under "Quiero que...".',
        },
      },
      {
        id: 'es-10', title: 'Spanish Idioms & Slang', description: 'Sound like a native with common expressions', type: 'vocabulary', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Use expressions to make your Spanish sound more natural.',
          keyPhrases: [
            { native: 'No hay mal que por bien no venga', romanized: '—', english: 'Every cloud has a silver lining' },
            { native: 'Me costó un ojo de la cara', romanized: '—', english: 'It cost me an arm and a leg' },
            { native: 'Estar en las nubes', romanized: '—', english: 'To have your head in the clouds' },
            { native: 'A quien madruga, Dios le ayuda', romanized: '—', english: 'The early bird catches the worm' },
            { native: '¡Qué guay!', romanized: '—', english: 'How cool! (Spain)' },
            { native: 'Tomar el pelo', romanized: '—', english: 'To pull someone\'s leg' },
            { native: 'Ser pan comido', romanized: '—', english: 'To be a piece of cake' },
            { native: 'Echar agua al mar', romanized: '—', english: 'To do something useless' },
            { native: 'Meter la pata', romanized: '—', english: 'To put one\'s foot in it' },
            { native: '¡Chulo!', romanized: '—', english: 'Cool / Neat' }
          ],
          tips: ['Idiomatic phrases cannot be translated literally; learn them as single ideas'],
          practice: 'Write a sentence telling someone a task was "pan comido".',
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
            { native: 'Nieva', romanized: '—', english: 'It is snowing' },
            { native: 'Hace viento', romanized: '—', english: 'It is windy' },
            { native: 'La primavera', romanized: '—', english: 'Spring' },
            { native: 'El verano', romanized: '—', english: 'Summer' },
            { native: 'El invierno', romanized: '—', english: 'Winter' }
          ],
          tips: ['Spanish uses the verb "hacer" (to do/make) for most weather statements, e.g. "Hace viento"'],
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
            { native: 'Croquetas', romanized: '—', english: 'Fried croquettes' },
            { native: 'Tortilla de patatas', romanized: '—', english: 'Spanish potato omelet' },
            { native: 'Calamares', romanized: '—', english: 'Fried squid' },
            { native: 'Una caña', romanized: '—', english: 'A small draft beer' },
            { native: 'La cuenta', romanized: '—', english: 'The bill' }
          ],
          tips: ['"Ir de tapas" means hopping from bar to bar to sample different dishes'],
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
      }
    ]
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
          intro: 'Mandarin has 4 main tones. Tones dictate meaning; study them complete.',
          keyPhrases: [
            { native: 'mā (妈)', romanized: '1st tone (high level)', english: 'Mother' },
            { native: 'má (麻)', romanized: '2nd tone (rising)', english: 'Hemp' },
            { native: 'mǎ (马)', romanized: '3rd tone (dipping)', english: 'Horse' },
            { native: 'mà (骂)', romanized: '4th tone (falling)', english: 'To scold' },
            { native: 'ma (吗)', romanized: 'neutral tone', english: 'Question particle' },
            { native: 'bā (八)', romanized: '1st tone', english: 'Eight' },
            { native: 'bá (拔)', romanized: '2nd tone', english: 'To pull' },
            { native: 'bǎ (把)', romanized: '3rd tone', english: 'To hold' },
            { native: 'bà (爸)', romanized: '4th tone', english: 'Father' },
            { native: 'ba (吧)', romanized: 'neutral tone', english: 'Suggestion particle' }
          ],
          tips: ['Use your hands to draw tone shapes while pronouncing', 'Note tone sandhi rules (two 3rd tones: the first becomes 2nd)'],
          practice: 'Pronounce the syllable blocks for "ma" and "ba" using all 4 tones.',
        },
      },
      {
        id: 'zh-02', title: 'Pinyin System', description: 'Use Romanized pinyin to read Chinese', type: 'pronunciation', difficulty: 'beginner', duration: '15 min',
        content: {
          intro: 'Pinyin is the phonetic notation. Let\'s study key initials and finals.',
          keyPhrases: [
            { native: 'zh', romanized: 'like "j" in judge', english: 'Initial zh' },
            { native: 'ch', romanized: 'like "ch" in church', english: 'Initial ch' },
            { native: 'sh', romanized: 'like "sh" in shoe', english: 'Initial sh' },
            { native: 'r', romanized: 'like "z" in azure', english: 'Initial r' },
            { native: 'j', romanized: 'like "jeep"', english: 'Initial j' },
            { native: 'q', romanized: 'like "cheap"', english: 'Initial q' },
            { native: 'x', romanized: 'like "she"', english: 'Initial x' },
            { native: 'z', romanized: 'like "ds" in cats', english: 'Initial z' },
            { native: 'c', romanized: 'like "ts" in cats', english: 'Initial c' },
            { native: 's', romanized: 'like "s" in sun', english: 'Initial s' }
          ],
          tips: ['Mandarin keyboards use Pinyin mapping to type Chinese characters'],
          practice: 'Spell "nǐ hǎo" and "zhōng wén" using correct pinyin initials.',
        },
      },
      {
        id: 'zh-03', title: 'Greetings in Mandarin', description: 'Say hello and basic expressions in Chinese', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Interact politely. Study greetings, thank-yous, and apologies.',
          keyPhrases: [
            { native: '你好', romanized: 'Nǐ hǎo', english: 'Hello' },
            { native: '谢谢', romanized: 'Xièxiè', english: 'Thank you' },
            { native: '对不起', romanized: 'Duìbuqǐ', english: 'Sorry / Excuse me' },
            { native: '再见', romanized: 'Zàijiàn', english: 'Goodbye' },
            { native: '吃饭了吗?', romanized: 'Chī fàn le ma?', english: 'Have you eaten? (greeting)' },
            { native: '没关系', romanized: 'Méi guānxi', english: 'It\'s okay / No problem' },
            { native: '不用谢', romanized: 'Bù yòng xiè', english: 'You\'re welcome' },
            { native: '早上好', romanized: 'Zǎoshang hǎo', english: 'Good morning' },
            { native: '晚安', romanized: 'Wǎn\'ān', english: 'Good night' },
            { native: '您好', romanized: 'Nín hǎo', english: 'Hello (polite / formal)' }
          ],
          tips: ['Use "Nín hǎo" when meeting bosses, clients, or elderly citizens'],
          practice: 'Greet an elder politely and say thank you in Mandarin.',
        },
      },
      {
        id: 'zh-04', title: 'Chinese Characters: Radicals', description: 'Understand the building blocks of Chinese writing', type: 'vocabulary', difficulty: 'intermediate', duration: '20 min',
        content: {
          intro: 'Characters are built from radicals that hold semantic meanings. Study the top radicals.',
          keyPhrases: [
            { native: '人 (亻)', romanized: 'rén', english: 'Person radical' },
            { native: '水 (氵)', romanized: 'shuǐ', english: 'Water radical' },
            { native: '木', romanized: 'mù', english: 'Tree/Wood radical' },
            { native: '口', romanized: 'kǒu', english: 'Mouth radical' },
            { native: '心 (忄)', romanized: 'xīn', english: 'Heart radical' },
            { native: '火 (灬)', romanized: 'huǒ', english: 'Fire radical' },
            { native: '手 (扌)', romanized: 'shǒu', english: 'Hand radical' },
            { native: '言 (讠)', romanized: 'yán', english: 'Speech radical' },
            { native: '女', romanized: 'nǚ', english: 'Woman radical' },
            { native: '土', romanized: 'tǔ', english: 'Earth / soil radical' }
          ],
          tips: ['Characters with "氵" usually describe fluids, e.g. 河 (river), 海 (ocean)'],
          practice: 'Find 3 characters containing the wood radical "木" and note their meanings.',
        },
      },
      {
        id: 'zh-05', title: 'Numbers & Dates', description: 'Count and express dates in Mandarin', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Count to 100 and write calendars using logical Chinese patterns.',
          keyPhrases: [
            { native: '一 二 三', romanized: 'yī èr sān', english: 'One, two, three' },
            { native: '四 五 六', romanized: 'sì wǔ liù', english: 'Four, five, six' },
            { native: '七 八 九 十', romanized: 'qī bā jiǔ shí', english: 'Seven, eight, nine, ten' },
            { native: '十一', romanized: 'shí yī', english: 'Eleven (10+1 = 11)' },
            { native: '二十', romanized: 'èr shí', english: 'Twenty (2x10 = 20)' },
            { native: '百 / 千', romanized: 'bǎi / qiān', english: 'Hundred / Thousand' },
            { native: '今天几月几号?', romanized: 'Jīntiān jǐ yuè jǐ hào?', english: 'What is today\'s date?' },
            { native: '星期一', romanized: 'Xīngqīyī', english: 'Monday (Day one)' },
            { native: '年 / 月 / 日', romanized: 'nián / yuè / rì', english: 'Year / Month / Day' },
            { native: '两', romanized: 'liǎng', english: 'Two (used for counting items)' }
          ],
          tips: ['Dates use descending order: Year + Month + Day (e.g. 2026年6月21日)'],
          practice: 'State your birthday date and count aloud from 1 to 20 in Mandarin.',
        },
      },
      {
        id: 'zh-06', title: 'Basic Sentence Patterns', description: 'Build simple Mandarin sentences', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Learn simple Subject-Verb-Object clauses. Grammatical forms do not conjugate.',
          keyPhrases: [
            { native: '我是学生', romanized: 'Wǒ shì xuéshēng', english: 'I am a student' },
            { native: '他有一本书', romanized: 'Tā yǒu yī běn shū', english: 'He has one book' },
            { native: '我喜欢中文', romanized: 'Wǒ xǐhuān zhōngwén', english: 'I like Chinese' },
            { native: '今天天气很好', romanized: 'Jīntiān tiānqì hěn hǎo', english: 'Today\'s weather is very good' },
            { native: '你去哪里?', romanized: 'Nǐ qù nǎlǐ?', english: 'Where are you going?' },
            { native: '我不喝咖啡', romanized: 'Wǒ bù hē kāfēi', english: 'I do not drink coffee' },
            { native: '你会说中文吗?', romanized: 'Nǐ huì shuō zhōngwén ma?', english: 'Can you speak Chinese?' },
            { native: '这是什么?', romanized: 'Zhè shì shénme?', english: 'What is this?' },
            { native: '我很累', romanized: 'Wǒ hěn lèi', english: 'I am very tired' },
            { native: '我们去吃饭', romanized: 'Wǒmen qù chīfàn', english: 'We go to eat' }
          ],
          tips: ['Add "ma" (吗) at the end of a statement to make it a yes/no question'],
          practice: 'Form sentences meaning "I like tea" and "He does not like coffee".',
        },
      },
      {
        id: 'zh-07', title: 'Chinese Food Culture', description: 'Explore Chinese cuisine and dining customs', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Study regional cuisines and standard dining etiquette rules.',
          keyPhrases: [
            { native: '北京烤鸭', romanized: 'Běijīng kǎoyā', english: 'Peking Duck' },
            { native: '饺子', romanized: 'Jiǎozi', english: 'Dumplings' },
            { native: '火锅', romanized: 'Huǒguō', english: 'Hot Pot' },
            { native: '请客', romanized: 'Qǐngkè', english: 'Treating guests (paying bill)' },
            { native: '干杯 !', romanized: 'Gānbēi!', english: 'Cheers! (dry cup)' },
            { native: '筷子', romanized: 'kuàizi', english: 'Chopsticks' },
            { native: '米饭', romanized: 'mǐfàn', english: 'Rice' },
            { native: '点菜', romanized: 'diǎncài', english: 'Order dishes' },
            { native: '服务员', romanized: 'fúwùyuán', english: 'Server / waiter' },
            { native: '买单', romanized: 'mǎidān', english: 'Bill please' }
          ],
          tips: ['Splitting the bill (AA制) is less common in traditional hospitality setups'],
          practice: 'Practice holding chopsticks properly and requesting the bill.',
        },
      },
      {
        id: 'zh-08', title: 'Measure Words', description: 'Use classifiers/measure words correctly in Chinese', type: 'grammar', difficulty: 'intermediate', duration: '18 min',
        content: {
          intro: 'Chinese nouns require measure words when counting. Study key classifiers.',
          keyPhrases: [
            { native: '一个人', romanized: 'yī gè rén', english: 'One person (gè = general)' },
            { native: '一本书', romanized: 'yī běn shū', english: 'One book (běn = bound volumes)' },
            { native: '一张纸', romanized: 'yī zhāng zhǐ', english: 'One sheet of paper (zhāng = flat sheets)' },
            { native: '一条鱼', romanized: 'yī tiáo yú', english: 'One fish (tiáo = long flexible items)' },
            { native: '一只猫', romanized: 'yī zhī māo', english: 'One cat (zhī = small animals)' },
            { native: '一杯水', romanized: 'yī bēi shuǐ', english: 'A glass of water' },
            { native: '一双筷子', romanized: 'yī shuāng kuàizi', english: 'A pair of chopsticks' },
            { native: '两件衣服', romanized: 'liǎng jiàn yīfú', english: 'Two pieces of clothes' },
            { native: '这台电脑', romanized: 'zhè tái diànnǎo', english: 'This computer' },
            { native: '那支笔', romanized: 'nà zhī bǐ', english: 'That pen' }
          ],
          tips: ['"gè" (个) is the general measure word; use it if you cannot recall specific ones'],
          practice: 'Combine: [Number 3] + [Measure word for books] + [shū (book)].',
        },
      },
      {
        id: 'zh-09', title: 'Chinese New Year Traditions', description: 'Celebrate Chinese festivals and customs', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Spring festival (春节) is the primary holiday. Study customs and greetings.',
          keyPhrases: [
            { native: '新年快乐', romanized: 'Xīnnián kuàilè', english: 'Happy New Year' },
            { native: '恭喜发财', romanized: 'Gôngxǐ fācái', english: 'Wish you prosperity' },
            { native: '红包', romanized: 'Hóngbāo', english: 'Red envelope (money gift)' },
            { native: '春联', romanized: 'Chūnlián', english: 'Spring door couplets' },
            { native: '鞭炮', romanized: 'Biānpào', english: 'Firecrackers' },
            { native: '拜年', romanized: 'bàinián', english: 'Pay New Year visits' },
            { native: '年夜饭', romanized: 'niányèfàn', english: 'New Year\'s Eve family reunion dinner' },
            { native: '饺子', romanized: 'jiǎozi', english: 'Dumplings (eaten for wealth)' },
            { native: '舞龙舞狮', romanized: 'wǔlóng wǔshī', english: 'Dragon and lion dances' },
            { native: '吃年糕', romanized: 'chī niángāo', english: 'Eat sticky rice cake (heightened success)' }
          ],
          tips: ['Wear red colors during the festival to invite fortune and chase bad luck'],
          practice: 'Write down a New Year greeting card using "Xīnnián kuàilè".',
        },
      },
      {
        id: 'zh-10', title: 'Shopping & Bargaining', description: 'Navigate Chinese markets and negotiate prices', type: 'conversation', difficulty: 'intermediate', duration: '14 min',
        content: {
          intro: 'Bargain at street markets using conversational queries.',
          keyPhrases: [
            { native: '多少钱?', romanized: 'Duōshǎo qián?', english: 'How much money?' },
            { native: '太贵了', romanized: 'Tài guì le', english: 'Too expensive' },
            { native: '便宜一点', romanized: 'Piányí yīdiǎn', english: 'Make it cheaper' },
            { native: '我要这个', romanized: 'Wǒ yào zhège', english: 'I want this one' },
            { native: '刷卡可以吗?', romanized: 'Shuā kǎ kěyǐ ma?', english: 'Can I swipe card?' },
            { native: '微信支付', romanized: 'Wēixìn zhīfù', english: 'WeChat Pay' },
            { native: '支付宝', romanized: 'Zhīfùbǎo', english: 'Alipay' },
            { native: '打折', romanized: 'dǎzhé', english: 'Give discount' },
            { native: '不要了', romanized: 'bù yào le', english: 'I don\'t want it (useful for backing off)' },
            { native: '最低价', romanized: 'zuìdījià', english: 'Lowest price' }
          ],
          tips: ['Mobile pay (WeChat/Alipay) is dominant in China; carry digital apps'],
          practice: 'Simulate bargaining: ask "多少钱", say "太贵了" and suggest a lower pricing.',
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
            { native: '下雪', romanized: 'Xià xuě', english: 'To snow' },
            { native: '刮风', romanized: 'Guā fēng', english: 'To blow wind' },
            { native: '春天', romanized: 'chūntiān', english: 'Spring' },
            { native: '夏天', romanized: 'xiàtiān', english: 'Summer' },
            { native: '冬天', romanized: 'dōngtiān', english: 'Winter' }
          ],
          tips: ['The particle 了 (le) is often used to show a change in weather, e.g. 下雨了 (It started to rain)'],
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
            { native: '红茶', romanized: 'Hóngchá', english: 'Black tea (red tea)' },
            { native: '乌龙茶', romanized: 'Wūlóngchá', english: 'Oolong tea' },
            { native: '茶道', romanized: 'Chádào', english: 'Tea ceremony art' },
            { native: '茶杯', romanized: 'Chábēi', english: 'Teacup' },
            { native: '倒茶', romanized: 'dào chá', english: 'Pour tea' },
            { native: '茶艺', romanized: 'cháyì', english: 'Tea art' }
          ],
          tips: ['Tap two fingers on the table to show gratitude when someone pours tea for you (finger kowtow)'],
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
      }
    ]
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
          intro: 'Vietnamese has 6 spoken tones. Tone marks are written on vowels. Let\'s study all of them.',
          keyPhrases: [
            { native: 'ma (không dấu)', romanized: 'level tone', english: 'Ghost (mid-level)' },
            { native: 'má (sắc)', romanized: 'rising tone', english: 'Mother / Cheek (high-rising)' },
            { native: 'mà (huyền)', romanized: 'falling tone', english: 'But (low-falling)' },
            { native: 'mả (hỏi)', romanized: 'dipping tone', english: 'Grave / tomb (dipping-rising)' },
            { native: 'mã (ngã)', romanized: 'broken rising', english: 'Code / horse (creaky-rising)' },
            { native: 'mạ (nặng)', romanized: 'glottal low', english: 'Rice seedling (constricted low)' },
            { native: 'ta (không dấu)', romanized: 'level tone', english: 'We / us' },
            { native: 'tá (sắc)', romanized: 'rising tone', english: 'Dozen' },
            { native: 'tả (hỏi)', romanized: 'dipping tone', english: 'Describe' },
            { native: 'tạ (nặng)', romanized: 'glottal low', english: 'Weights / unit' }
          ],
          tips: ['Northern speakers distinguish "ngã" and "hỏi" clearly; Southern speakers combine them'],
          practice: 'Read aloud: ma, má, mà, mả, mã, mạ. Emphasize the sound changes.',
        },
      },
      {
        id: 'vi-02', title: 'Vietnamese Alphabet (Chữ Quốc Ngữ)', description: 'Learn the Latin-based Vietnamese script', type: 'pronunciation', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Vietnamese uses a modified Latin alphabet with unique vowel diacritics. Study the special letters.',
          keyPhrases: [
            { native: 'ă', romanized: 'short a', english: 'Vowel ă (short)' },
            { native: 'â', romanized: 'deep a', english: 'Vowel â (short open)' },
            { native: 'ơ', romanized: 'unrounded o', english: 'Vowel ơ (uh sound)' },
            { native: 'ư', romanized: 'high back u', english: 'Vowel ư (pursed ee)' },
            { native: 'đ', romanized: 'implosive d', english: 'Consonant đ (sounds like English d)' },
            { native: 'd', romanized: 'y or z sound', english: 'Consonant d (y in South, z in North)' },
            { native: 'gi', romanized: 'y or z sound', english: 'Consonant gi' },
            { native: 'tr', romanized: 'ch or tr sound', english: 'Consonant tr' },
            { native: 'ch', romanized: 'ch sound', english: 'Consonant ch' },
            { native: 'nh', romanized: 'ny sound', english: 'Consonant nh' }
          ],
          tips: ['Vietnamese has 29 letters; f, j, w, z are not included in the official alphabet'],
          practice: 'Spell your name using the spelling rules and sounds of Chữ Quốc Ngữ.',
        },
      },
      {
        id: 'vi-03', title: 'Xin Chào: Greetings', description: 'Essential Vietnamese greetings and etiquette', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Greetings are tied to age relationships. Study standard respectful titles.',
          keyPhrases: [
            { native: 'Xin chào', romanized: 'sin chow', english: 'Hello (formal)' },
            { native: 'Cảm ơn', romanized: 'kahm uhn', english: 'Thank you' },
            { native: 'Xin lỗi', romanized: 'sin loy', english: 'Sorry / Excuse me' },
            { native: 'Tạm biệt', romanized: 'tahm byet', english: 'Goodbye' },
            { native: 'Bạn có khỏe không?', romanized: '—', english: 'How are you?' },
            { native: 'Khỏe', romanized: 'kwe', english: 'I am well' },
            { native: 'Em (pronoun)', romanized: 'em', english: 'Pronoun for younger person' },
            { native: 'Anh (pronoun)', romanized: 'anh', english: 'Pronoun for older male' },
            { native: 'Chị (pronoun)', romanized: 'chee', english: 'Pronoun for older female' },
            { native: 'Không sao', romanized: 'khong sao', english: 'No problem / It\'s okay' }
          ],
          tips: ['A slight bow showing respect is appreciated when greeting elders'],
          practice: 'Practice greeting an older brother: "Em chào anh".',
        },
      },
      {
        id: 'vi-04', title: 'Vietnamese Food Culture', description: 'Explore the rich world of Vietnamese cuisine', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Vietnam has iconic dishes balanced with herbs. Learn key menu items.',
          keyPhrases: [
            { native: 'Phở', romanized: 'Fuh', english: 'Noodle soup (national dish)' },
            { native: 'Bánh mì', romanized: 'Bahn mee', english: 'Baguette sandwich' },
            { native: 'Gỏi cuốn', romanized: 'goy kwon', english: 'Fresh spring rolls' },
            { native: 'Bún bò Huế', romanized: 'bun baw hway', english: 'Spicy beef noodle soup' },
            { native: 'Cà phê trứng', romanized: 'ka feh chung', english: 'Egg coffee' },
            { native: 'Nước mắm', romanized: 'nuoc mam', english: 'Fish sauce' },
            { native: 'Bánh xèo', romanized: 'banh xeo', english: 'Sizzling pancake' },
            { native: 'Chả giò', romanized: 'cha gio', english: 'Fried egg rolls' },
            { native: 'Bún chả', romanized: 'bun cha', english: 'Grilled pork with noodles' },
            { native: 'Rau thơm', romanized: 'rau thom', english: 'Fresh herbs' }
          ],
          tips: ['Fresh herbs are served plate-side with almost all soups and pancakes'],
          practice: 'List the differences between Phở and Bún chả ingredients.',
        },
      },
      {
        id: 'vi-05', title: 'Numbers & Counting', description: 'Count in Vietnamese for everyday use', type: 'vocabulary', difficulty: 'beginner', duration: '11 min',
        content: {
          intro: 'Learn units 1-10, large scales, and asking for money.',
          keyPhrases: [
            { native: 'một, hai, ba', romanized: 'moht, hai, ba', english: 'One, two, three' },
            { native: 'bốn, năm, sáu', romanized: 'bohn, nam, sau', english: 'Four, five, six' },
            { native: 'bảy, tám, chín, mười', romanized: 'bay, tam, chin, muoi', english: 'Seven, eight, nine, ten' },
            { native: 'mười một', romanized: 'muoi moht', english: 'Eleven (10+1 = 11)' },
            { native: 'hai mươi', romanized: 'hai muoi', english: 'Twenty (2x10 = 20)' },
            { native: 'hai mươi mốt', romanized: '—', english: 'Twenty-one (mốt instead of một)' },
            { native: 'năm mươi', romanized: '—', english: 'Fifty' },
            { native: 'một trăm', romanized: 'moht tram', english: 'One hundred' },
            { native: 'Bao nhiêu tiền?', romanized: 'bow nyew tyen', english: 'How much is it?' },
            { native: 'Đồng (VND)', romanized: 'dong', english: 'Vietnamese Currency' }
          ],
          tips: ['The number 5 changes to "lăm" for compound values, e.g. 15 is "mười lăm"'],
          practice: 'Count aloud from 1 to 25 in Vietnamese.',
        },
      },
      {
        id: 'vi-06', title: 'Basic Sentence Structure', description: 'Build simple Vietnamese sentences', type: 'grammar', difficulty: 'beginner', duration: '14 min',
        content: {
          intro: 'Construct simple declarative clauses using Subject-Verb-Object word order.',
          keyPhrases: [
            { native: 'Tôi ăn cơm', romanized: 'toy an kum', english: 'I eat rice' },
            { native: 'Anh ấy học tiếng Anh', romanized: 'anh ay hok tyeng anh', english: 'He studies English' },
            { native: 'Chúng tôi thích Việt Nam', romanized: 'chung toy thik vyet nam', english: 'We like Vietnam' },
            { native: 'Cô ấy đẹp lắm', romanized: 'koh ay dep lam', english: 'She is very beautiful' },
            { native: 'Tôi không hiểu', romanized: 'toy khong hyew', english: 'I do not understand' },
            { native: 'Tôi muốn mua cái này', romanized: '—', english: 'I want to buy this one' },
            { native: 'Cái này là gì?', romanized: '—', english: 'What is this?' },
            { native: 'Bạn tên gì?', romanized: 'ban ten gee', english: 'What is your name?' },
            { native: 'Tôi tên là...', romanized: 'toy ten la', english: 'My name is...' },
            { native: 'Tôi đói bụng', romanized: 'toy doy bung', english: 'I am hungry' }
          ],
          tips: ['Negation simply inserts "không" right before the main verb'],
          practice: 'Write 3 simple SVO sentences about foods you like.',
        },
      },
      {
        id: 'vi-07', title: 'Vietnamese Festivals', description: 'Celebrate Tết and major Vietnamese traditions', type: 'culture', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Tết (Lunar New Year) is the primary celebration. Study key terms.',
          keyPhrases: [
            { native: 'Chúc Mừng Năm Mới', romanized: 'chuk mung nam moy', english: 'Happy New Year' },
            { native: 'Bánh chưng', romanized: 'banh chung', english: 'Square sticky rice cake' },
            { native: 'Lì xì', romanized: 'lee see', english: 'Lucky money envelope' },
            { native: 'Hội An', romanized: 'Hoy An', english: 'Lantern festival town' },
            { native: 'Trung Thu', romanized: 'Chung Too', english: 'Mid-Autumn Festival' },
            { native: 'Bánh trung thu', romanized: '—', english: 'Mooncake' },
            { native: 'Đào / Mai', romanized: '—', english: 'Peach / Apricot blossoms' },
            { native: 'Mâm ngũ quả', romanized: '—', english: 'Five-fruit tray' },
            { native: 'Xông đất', romanized: '—', english: 'First foot (New Year guest)' },
            { native: 'Giao thừa', romanized: '—', english: 'New Year\'s Eve' }
          ],
          tips: ['Avoid sweeping your home on the first day of Tết to keep luck inside'],
          practice: 'Write down a Tết greeting: "Chúc Mừng Năm Mới".',
        },
      },
      {
        id: 'vi-08', title: 'At the Market (Chợ)', description: 'Navigate Vietnamese markets with confidence', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Negotiate pricing and request discounts at local wet markets.',
          keyPhrases: [
            { native: 'Cái này giá bao nhiêu?', romanized: 'kai nay jah bao nyew', english: 'How much is this?' },
            { native: 'Đắt quá!', romanized: 'daht kwa', english: 'Too expensive!' },
            { native: 'Bớt đi một chút', romanized: 'bert dee moht chut', english: 'Reduce price a little' },
            { native: 'Cho tôi xem', romanized: 'cho toy sem', english: 'Let me see it' },
            { native: 'Tôi mua cái này', romanized: 'toy mua kai nay', english: 'I will buy this one' },
            { native: 'Có size nhỏ hơn không?', romanized: '—', english: 'Do you have a smaller size?' },
            { native: 'Có màu khác không?', romanized: '—', english: 'Do you have other colors?' },
            { native: 'Gửi tiền', romanized: 'gui tyen', english: 'Hand over money' },
            { native: 'Không mua đâu', romanized: '—', english: 'I\'m not buying (friendly walkaway)' },
            { native: 'Cái này rẻ', romanized: '—', english: 'This one is cheap' }
          ],
          tips: ['Smile and remain polite while bargaining; it keeps negotiations friendly'],
          practice: 'Simulate asking a fruit vendor: "Cái này bao nhiêu một ký?" (How much per kg?).',
        },
      },
      {
        id: 'vi-09', title: 'Vietnamese Classifiers', description: 'Use noun classifiers correctly in Vietnamese', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'Nouns require classifier words when counting. Study key markers.',
          keyPhrases: [
            { native: 'con chó', romanized: 'kon cho', english: 'Dog (con = living things)' },
            { native: 'cái bàn', romanized: 'kai ban', english: 'Table (cái = inanimate objects)' },
            { native: 'quyển sách', romanized: 'kwen sak', english: 'Book (quyển = bound volumes)' },
            { native: 'tờ báo', romanized: 'tuh bao', english: 'Newspaper (tờ = thin sheets)' },
            { native: 'cốc nước', romanized: 'kohk nuok', english: 'Glass of water' },
            { native: 'chiếc giày', romanized: '—', english: 'Shoe (chiếc = items of pairs)' },
            { native: 'quả táo', romanized: '—', english: 'Apple (quả / trái = fruits)' },
            { native: 'ngôi nhà', romanized: '—', english: 'House (ngôi = structures)' },
            { native: 'bức tranh', romanized: '—', english: 'Painting (bức = flat displays)' },
            { native: 'người thầy', romanized: '—', english: 'Teacher (người = human professions)' }
          ],
          tips: ['"Cái" is the general inanimate classifier; use it if unsure of category'],
          practice: 'List 5 objects and combine them with "con" or "cái".',
        },
      },
      {
        id: 'vi-10', title: 'Travel Phrases in Vietnam', description: 'Navigate Vietnam by bus, taxi, and motorbike', type: 'conversation', difficulty: 'intermediate', duration: '13 min',
        content: {
          intro: 'Get taxi or motorbike rides to landmarks safely using standard transit phrases.',
          keyPhrases: [
            { native: 'Bến xe buýt ở đâu?', romanized: 'ben se bweet uh dau', english: 'Where is the bus station?' },
            { native: 'Cho tôi đến...', romanized: 'cho toy den', english: 'Take me to...' },
            { native: 'Bao nhiêu tiền?', romanized: 'bao nyew tyen', english: 'How much?' },
            { native: 'Dừng ở đây', romanized: 'dung uh day', english: 'Stop here' },
            { native: 'Cách đây bao xa?', romanized: 'kak day bao sa', english: 'How far is it?' },
            { native: 'Đi thẳng', romanized: 'dee thang', english: 'Go straight' },
            { native: 'Rẽ trái / Rẽ phải', romanized: 're trai / re phai', english: 'Turn left / Turn right' },
            { native: 'Chạy chậm thôi', romanized: 'chai cham thoy', english: 'Drive slowly, please' },
            { native: 'Xe ôm', romanized: 'se ohm', english: 'Motorbike taxi' },
            { native: 'Không cần thối', romanized: 'khong kan thoy', english: 'Keep the change' }
          ],
          tips: ['Rideshare apps like Grab allow you to confirm prices before booking'],
          practice: 'Simulate booking a motorbike taxi and telling the driver "Chạy chậm thôi".',
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
            { native: 'Nắng', romanized: 'Nang', english: 'Sunny' },
            { native: 'Thời tiết', romanized: 'Thoi tiet', english: 'Weather' },
            { native: 'Có gió', romanized: '—', english: 'Windy' },
            { native: 'Bão', romanized: 'bao', english: 'Storm / Typhoon' },
            { native: 'Mùa xuân', romanized: '—', english: 'Spring season' },
            { native: 'Mùa hè', romanized: '—', english: 'Summer season' },
            { native: 'Mùa đông', romanized: '—', english: 'Winter season' }
          ],
          tips: ['Northern Vietnam has 4 seasons, while Southern Vietnam has only wet and dry seasons'],
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
            { native: 'Cà phê đen đá', romanized: '—', english: 'Iced black coffee' },
            { native: 'Sữa đặc', romanized: 'sua dac', english: 'Condensed milk' },
            { native: 'Cho tôi một ly...', romanized: '—', english: 'Give me a glass of...' },
            { native: 'Hạt Robusta', romanized: '—', english: 'Robusta beans' },
            { native: 'Đá', romanized: 'da', english: 'Ice' }
          ],
          tips: ['Traditional Vietnamese coffee is brewed slow-drop through a metal Phin filter'],
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
      }
    ]
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
          intro: 'German spelling is regular. Study vowels, umlauts (ä, ö, ü), and ligature ß.',
          keyPhrases: [
            { native: 'Ä / ä', romanized: 'umlaut a', english: 'Sounds like "e" in bet' },
            { native: 'Ö / ö', romanized: 'umlaut o', english: 'Sounds like "i" in bird' },
            { native: 'Ü / ü', romanized: 'umlaut u', english: 'rounded "ee" sound' },
            { native: 'ß', romanized: 'eszett', english: 'double s sharp sound' },
            { native: 'w', romanized: 'pronounced like v', english: 'Letter W' },
            { native: 'v', romanized: 'pronounced like f', english: 'Letter V' },
            { native: 'j', romanized: 'pronounced like y', english: 'Letter J' },
            { native: 'ei', romanized: 'pronounced like eye', english: 'diphthong ei' },
            { native: 'ie', romanized: 'pronounced like ee', english: 'diphthong ie' },
            { native: 'sch', romanized: 'pronounced like sh', english: 'sound sch' }
          ],
          tips: ['Umlauts modify vowels; if not available, write ae, oe, ue instead', 'German nouns are always capitalized'],
          practice: 'Practice pronouncing ä, ö, ü, and ß aloud.',
        },
      },
      {
        id: 'de-02', title: 'Greetings & Polite Phrases', description: 'Essential German greetings and polite expressions', type: 'vocabulary', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Politeness is essential. Study standard greetings, thank-yous, and address levels.',
          keyPhrases: [
            { native: 'Guten Tag', romanized: 'gooten tahg', english: 'Good day / Hello' },
            { native: 'Bitte', romanized: 'bit-te', english: 'Please / You\'re welcome' },
            { native: 'Danke', romanized: 'dahn-ke', english: 'Thank you' },
            { native: 'Es tut mir leid', romanized: '—', english: 'I am sorry' },
            { native: 'Auf Wiedersehen', romanized: '—', english: 'Goodbye (formal)' },
            { native: 'Hallo', romanized: '—', english: 'Hello (informal)' },
            { native: 'Guten Morgen', romanized: '—', english: 'Good morning' },
            { native: 'Guten Abend', romanized: '—', english: 'Good evening' },
            { native: 'Tschüss', romanized: 'tshues', english: 'Bye (informal)' },
            { native: 'Wie geht es Ihnen?', romanized: '—', english: 'How are you? (formal)' }
          ],
          tips: ['Use formal address "Sie" with adults you do not know, and "du" with friends'],
          practice: 'Practice introducing yourself formally: "Guten Tag, ich heiße... Wie geht es Ihnen?".',
        },
      },
      {
        id: 'de-03', title: 'Numbers 1–100', description: 'Count in German from one to one hundred', type: 'vocabulary', difficulty: 'beginner', duration: '12 min',
        content: {
          intro: 'Count to 100. Learn unit digits, tens, and the reverse counting pattern.',
          keyPhrases: [
            { native: 'eins, zwei, drei', romanized: '—', english: 'One, two, three' },
            { native: 'vier, fünf, sechs', romanized: '—', english: 'Four, five, six' },
            { native: 'sieben, acht, neun, zehn', romanized: '—', english: 'Seven, eight, nine, ten' },
            { native: 'elf / zwölf', romanized: '—', english: 'Eleven / Twelve' },
            { native: 'zwanzig', romanized: 'tsvan-tsig', english: 'Twenty (20)' },
            { native: 'einundzwanzig', romanized: '—', english: 'Twenty-one (1 and 20)' },
            { native: 'dreißig', romanized: '—', english: 'Thirty (30)' },
            { native: 'vierzig / fünfzig', romanized: '—', english: 'Forty / Fifty' },
            { native: 'hundert', romanized: '—', english: 'Hundred (100)' },
            { native: 'Wie viel kostet das?', romanized: '—', english: 'How much does it cost?' }
          ],
          tips: ['German counts units before tens linked with "und" (e.g. 21 is "ein-und-zwanzig")'],
          practice: 'Count aloud from 20 to 35 in German, applying the unit-first rule.',
        },
      },
      {
        id: 'de-04', title: 'Food & Ordering', description: 'Order food and drinks at German restaurants', type: 'conversation', difficulty: 'beginner', duration: '13 min',
        content: {
          intro: 'Dine out comfortably. Order items, request water, and ask for the bill.',
          keyPhrases: [
            { native: 'Ich möchte bestellen, bitte', romanized: '—', english: 'I would like to order, please' },
            { native: 'Ein Wasser, bitte', romanized: '—', english: 'A water, please' },
            { native: 'Guten Appetit', romanized: '—', english: 'Enjoy your meal' },
            { native: 'Die Rechnung, bitte', romanized: '—', english: 'The bill, please' },
            { native: 'Zahlen, bitte', romanized: 'tsahlen...', english: 'Pay, please' },
            { native: 'Die Speisekarte', romanized: '—', english: 'The menu' },
            { native: 'Ein Bier, bitte', romanized: '—', english: 'A beer, please' },
            { native: 'Stilles Wasser / Sprudelwasser', romanized: '—', english: 'Still / Sparkling water' },
            { native: 'Hat es geschmeckt?', romanized: '—', english: 'Did it taste good? (from waiter)' },
            { native: 'Es war sehr lecker', romanized: '—', english: 'It was very delicious' }
          ],
          tips: ['Tap water is not served free; order bottled "stilles Wasser" or "Sprudelwasser"'],
          practice: 'Simulate ordering beer, bread, and asking the waiter "Zahlen, bitte".',
        },
      },
      {
        id: 'de-05', title: 'Directions & Transport', description: 'Ask for directions and use German transit', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Navigate city streets, platforms, and check tickets.',
          keyPhrases: [
            { native: 'Wo ist der Bahnhof?', romanized: '—', english: 'Where is the train station?' },
            { native: 'Geradeaus', romanized: '—', english: 'Straight ahead' },
            { native: 'Links / Rechts', romanized: '—', english: 'Left / Right' },
            { native: 'Gleis', romanized: '—', english: 'Platform' },
            { native: 'Fahrkarte', romanized: '—', english: 'Ticket' },
            { native: 'Die Haltestelle', romanized: '—', english: 'The bus/tram stop' },
            { native: 'U-Bahn / S-Bahn', romanized: '—', english: 'Subway / Suburban train' },
            { native: 'Entwerten', romanized: '—', english: 'To validate ticket' },
            { native: 'Einfache Fahrt', romanized: '—', english: 'One-way ticket' },
            { native: 'Umsteigen', romanized: '—', english: 'To transfer / change trains' }
          ],
          tips: ['Validate (entwerten) paper tickets before boarding to avoid heavy fines'],
          practice: 'Ask if you need to transfer: "Muss ich umsteigen?".',
        },
      },
      {
        id: 'de-06', title: 'Noun Genders (Der, Die, Das)', description: 'Master masculine, feminine, and neuter nouns', type: 'grammar', difficulty: 'intermediate', duration: '15 min',
        content: {
          intro: 'German nouns have 3 genders: der (masc), die (fem), das (neut). Plural uses die.',
          keyPhrases: [
            { native: 'der Tisch', romanized: '—', english: 'The table (masculine)' },
            { native: 'die Tür', romanized: '—', english: 'The door (feminine)' },
            { native: 'das Buch', romanized: '—', english: 'The book (neuter)' },
            { native: 'die Bücher', romanized: '—', english: 'The books (all plurals)' },
            { native: 'ein / eine', romanized: '—', english: 'A / an (masculine-neuter / feminine)' },
            { native: 'kein / keine', romanized: '—', english: 'No / none' },
            { native: 'der Mann', romanized: '—', english: 'The man' },
            { native: 'die Frau', romanized: '—', english: 'The woman' },
            { native: 'das Kind', romanized: '—', english: 'The child' },
            { native: 'die Kinder', romanized: '—', english: 'The children' }
          ],
          tips: ['Always memorize nouns with their articles: der, die, or das'],
          practice: 'List 10 German nouns and assign their correct genders.',
        },
      },
      {
        id: 'de-07', title: 'Family & Social Relations', description: 'Talk about family members in German', type: 'vocabulary', difficulty: 'beginner', duration: '11 min',
        content: {
          intro: 'Identify relatives and use possessives (mein / meine) correctly.',
          keyPhrases: [
            { native: 'Vater / Mutter', romanized: '—', english: 'Father / Mother' },
            { native: 'Sohn / Tochter', romanized: '—', english: 'Son / Daughter' },
            { native: 'Bruder / Schwester', romanized: '—', english: 'Brother / Sister' },
            { native: 'Großeltern', romanized: '—', english: 'Grandparents' },
            { native: 'Geschwister', romanized: '—', english: 'Siblings' },
            { native: 'mein Vater', romanized: '—', english: 'My father (masculine)' },
            { native: 'meine Mutter', romanized: '—', english: 'My mother (feminine)' },
            { native: 'Onkel / Tante', romanized: '—', english: 'Uncle / Aunt' },
            { native: 'Cousine', romanized: '—', english: 'Cousin (female)' },
            { native: 'Freund / Freundin', romanized: '—', english: 'Friend (male / female)' }
          ],
          tips: ['"Geschwister" is a single collective noun representing siblings'],
          practice: 'Describe your family: "Ich habe einen Bruder und eine Schwester".',
        },
      },
      {
        id: 'de-08', title: 'Festivals & Traditions', description: 'Explore German culture through Oktoberfest and holidays', type: 'culture', difficulty: 'beginner', duration: '10 min',
        content: {
          intro: 'Explore festivals like Oktoberfest, Christmas markets, and Carnival.',
          keyPhrases: [
            { native: 'Oktoberfest', romanized: '—', english: 'Munich beer festival' },
            { native: 'Weihnachtsmarkt', romanized: '—', english: 'Christmas market' },
            { native: 'Karneval / Fasching', romanized: '—', english: 'Carnival' },
            { native: 'Prost!', romanized: '—', english: 'Cheers!' },
            { native: 'Frohe Weihnachten', romanized: '—', english: 'Merry Christmas' },
            { native: 'Guten Rutsch !', romanized: '—', english: 'Happy New Year (slide well)' },
            { native: 'Glühwein', romanized: '—', english: 'Hot mulled wine' },
            { native: 'Lebkuchen', romanized: '—', english: 'Gingerbread' },
            { native: 'Lederhosen / Dirndl', romanized: '—', english: 'Traditional Bavarian clothing' },
            { native: 'Feiertag', romanized: '—', english: 'Public holiday' }
          ],
          tips: ['Clink glasses making eye contact; looking away is considered impolite'],
          practice: 'Write an invitation to a Christmas market: "Lass uns zum Weihnachtsmarkt gehen!".',
        },
      },
      {
        id: 'de-09', title: 'Simple Present Tense', description: 'Conjugate standard German verbs in the present', type: 'grammar', difficulty: 'intermediate', duration: '14 min',
        content: {
          intro: 'Conjugate verbs based on pronouns. Study regular endings.',
          keyPhrases: [
            { native: 'ich lerne / du lernst', romanized: '—', english: 'I learn / you learn' },
            { native: 'er lernt / sie lernt', romanized: '—', english: 'He learns / she learns' },
            { native: 'wir lernen', romanized: '—', english: 'We learn' },
            { native: 'ihr lernt', romanized: '—', english: 'You all learn' },
            { native: 'sie lernen', romanized: '—', english: 'They learn / You (formal) learn' },
            { native: 'ich spiele', romanized: '—', english: 'I play' },
            { native: 'ich mache', romanized: '—', english: 'I do/make' },
            { native: 'wir machen', romanized: '—', english: 'We do/make' },
            { native: 'er macht', romanized: '—', english: 'He does/makes' },
            { native: 'du spielst', romanized: '—', english: 'You play' }
          ],
          tips: ['Regular verb ending suffixes: -e, -st, -t, -en, -t, -en'],
          practice: 'Conjugate "spielen" (to play) for all pronouns.',
        },
      },
      {
        id: 'de-10', title: 'Shopping Vocabulary', description: 'Shop and purchase items in German cities', type: 'conversation', difficulty: 'intermediate', duration: '12 min',
        content: {
          intro: 'Navigate stores, supermarkets, cashier queues, and payment modes.',
          keyPhrases: [
            { native: 'Ich schaue nur, danke', romanized: '—', english: 'I am just looking, thank you' },
            { native: 'Haben Sie das in Größe...?', romanized: '—', english: 'Do you have this in size...?' },
            { native: 'Mit Karte, bitte', romanized: 'mit karte...', english: 'By card, please' },
            { native: 'Kassenzettel', romanized: '—', english: 'Receipt' },
            { native: 'Tüte', romanized: '—', english: 'Shopping bag' },
            { native: 'Zahlen, bitte', romanized: '—', english: 'Pay, please' },
            { native: 'Das ist zu teuer', romanized: '—', english: 'That is too expensive' },
            { native: 'Im Sonderangebot', romanized: '—', english: 'On special offer' },
            { native: 'Die Umkleidekabine', romanized: '—', english: 'Fitting room' },
            { native: 'Bar zahlen', romanized: '—', english: 'Pay cash' }
          ],
          tips: ['German supermarkets scan items very fast; pack your bags quickly at the register'],
          practice: 'Simulate buying clothing: ask for a size, request card payment, and get the receipt.',
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
            { native: 'Musik hören', romanized: '—', english: 'Listen to music' },
            { native: 'Bücher lesen', romanized: '—', english: 'Read books' },
            { native: 'Schwimmen', romanized: '—', english: 'Swimming' },
            { native: 'Reisen', romanized: '—', english: 'Traveling' },
            { native: 'Kochen', romanized: '—', english: 'Cooking' }
          ],
          tips: ['Many German hobbies revolve around a "Verein" (sports club, music club, etc.)'],
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
            { native: 'Die Bäckerei', romanized: '—', english: 'The bakery' },
            { native: 'Ein Croissant, bitte', romanized: '—', english: 'A croissant, please' },
            { native: 'Mit Milch und Zucker', romanized: '—', english: 'With milk and sugar' },
            { native: 'Der Kuchen', romanized: '—', english: 'The cake' },
            { native: 'Einen Tisch reservieren', romanized: '—', english: 'Reserve a table' }
          ],
          tips: ['"Kaffee und Kuchen" is a traditional Sunday afternoon social ritual'],
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
      }
    ]
  }
];

import { languageModules } from '../src/lib/language-modules.ts';
import fs from 'fs';

const newLessons: any[] = [];

languageModules.forEach(langMod => {
  langMod.lessons.forEach((l, idx) => {
    let category = l.type;
    if (category === 'culture') category = 'conversation';
    
    const newLesson = {
      id: l.id,
      category: category,
      level: l.difficulty,
      title: l.title,
      description: l.description,
      xpReward: 150,
      estimatedMinutes: parseInt(l.duration) || 10,
      targetLang: langMod.id,
      content: {
        introduction: l.content.intro,
        words: l.content.keyPhrases.map(kp => ({
          word: kp.native,
          partOfSpeech: 'phrase',
          definition: kp.english,
          englishExample: kp.romanized ? '[' + kp.romanized + ']' : ''
        })),
        quiz: [
          {
            id: l.id + '-q1',
            question: 'What is the meaning of "' + l.content.keyPhrases[0].native + '"?',
            options: [
              l.content.keyPhrases[0].english,
              'Something else',
              'Another incorrect option',
              'None of the above'
            ],
            answerIndex: 0,
            explanation: 'It means ' + l.content.keyPhrases[0].english
          }
        ]
      }
    };
    newLessons.push(newLesson);
  });
});

fs.writeFileSync('src/languageModulesData.ts', 'import { Lesson } from "./types";\n\nexport const LANGUAGE_LESSONS: Lesson[] = ' + JSON.stringify(newLessons, null, 2) + ';');
console.log('Successfully generated study-room/src/languageModulesData.ts');

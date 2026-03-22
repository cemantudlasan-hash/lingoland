
'use server';

import { ai } from '@/ai/genkit';
import {
  GenerateCrosswordInputSchema,
  CrosswordDataSchemaForAI,
  type GenerateCrosswordInput,
  type CrosswordData,
  type Clue,
} from '@/ai/flows/schemas/crossword-schema';
import { z } from 'zod';

const generateCrosswordPuzzleFlow = ai.defineFlow(
  {
    name: 'generateCrosswordPuzzleFlow',
    inputSchema: GenerateCrosswordInputSchema,
    outputSchema: z.object({
        theme: z.string(),
        clues: z.array(z.object({
            clue: z.string(),
            answer: z.string(),
            direction: z.enum(['across', 'down']),
            row: z.number(),
            col: z.number(),
            number: z.number(),
        }))
    }),
  },
  async (input) => {
    for (let i = 0; i < 3; i++) { // Retry up to 3 times
      try {
        const prompt = `You are an expert puzzle maker for ESL students. Generate a complete, interconnected crossword puzzle based on the following criteria.

                Difficulty: ${input.difficulty}
                ${input.theme ? `Theme: ${input.theme}` : ''}

                Rules:
                1. All words MUST intersect with at least one other word. Do not return words that stand alone.
                2. The clues and answers must be appropriate for the specified difficulty level.
                3. Answers must be single words without spaces or hyphens.
                4. Provide between 5 and 10 clues in total, balanced between 'across' and 'down'.

                ${input.usedAnswers && input.usedAnswers.length > 0 ? `IMPORTANT: Do not use any of the following words as answers:\n- ${input.usedAnswers.join('\n- ')}` : ''}
            `;

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt,

            output: {
                schema: CrosswordDataSchemaForAI
            }
        });

        if (!output || !output.clues || output.clues.length < 5) {
          console.error("AI returned too few clues.");
          continue; // Retry
        }

        const wordsToPlace = output.clues.map(c => ({ answer: c.answer.toUpperCase(), direction: c.direction, clue: c.clue }));
        
        const { grid, placedClues, allWordsPlaced } = buildGrid(wordsToPlace);

        if (!placedClues || !allWordsPlaced || grid.length === 0) {
            console.error("Failed to construct a valid interconnected grid from the AI's words.");
            continue; // Retry
        }

        return {
          theme: output.theme,
          clues: placedClues,
          grid: grid, // This is not in the schema but useful for client
        } as any; // Cast as any because grid is not in the output schema

      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === 2) { // Last attempt failed
          throw new Error('The AI failed to generate a valid crossword puzzle after multiple attempts. Please try again.');
        }
      }
    }
    throw new Error('The AI failed to generate a crossword puzzle.');
  }
);


function buildGrid(words: { answer: string; direction: 'across' | 'down'; clue: string }[]): {
  grid: (string | null)[][];
  placedClues: Clue[] | null;
  allWordsPlaced: boolean;
} {
  const gridSize = 25; // Increased grid size for more placement options
  let bestGrid: (string | null)[][] | null = null;
  let bestPlacedClues: Clue[] | null = null;
  let maxPlacedWords = 0;

  for (let attempt = 0; attempt < 50; attempt++) {
    const grid: (string | null)[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const currentPlacedClues: { clue: string; answer: string; direction: 'across' | 'down'; row: number; col: number; number: number }[] = [];
    const availableWords = shuffleArray(words);
    
    // Place the first word (longest is often a good anchor)
    const firstWord = availableWords.pop();
    if (!firstWord) continue;
    
    const startRow = Math.floor(gridSize / 2);
    const startCol = Math.floor(gridSize / 2) - Math.floor(firstWord.answer.length / 2);
    placeWord(grid, firstWord.answer, startRow, startCol, 'across');
    currentPlacedClues.push({ ...firstWord, row: startRow, col: startCol, direction: 'across', number: 0 });

    let placedCount = 1;
    let wordPlacedInIteration;
    do {
      wordPlacedInIteration = false;
      for (let i = availableWords.length - 1; i >= 0; i--) {
        const wordData = availableWords[i];
        let placed = false;
        
        // Try to place this word by intersecting with already placed words
        for (const placedWord of currentPlacedClues) {
          for (let j = 0; j < wordData.answer.length; j++) {
            const charToMatch = wordData.answer[j];
            const intersectIndex = placedWord.answer.indexOf(charToMatch);
            
            if (intersectIndex !== -1) {
              let newRow, newCol, newDirection: 'across' | 'down';
              if (placedWord.direction === 'across') {
                newDirection = 'down';
                newRow = placedWord.row - j;
                newCol = placedWord.col + intersectIndex;
              } else {
                newDirection = 'across';
                newRow = placedWord.row + intersectIndex;
                newCol = placedWord.col - j;
              }
              
              if (canPlace(grid, wordData.answer, newRow, newCol, newDirection)) {
                placeWord(grid, wordData.answer, newRow, newCol, newDirection);
                currentPlacedClues.push({ ...wordData, row: newRow, col: newCol, direction: newDirection, number: 0 });
                availableWords.splice(i, 1);
                placedCount++;
                wordPlacedInIteration = true;
                placed = true;
                break; // Word placed, move to next word
              }
            }
          }
          if (placed) break; // Word placed, move to next word
        }
      }
    } while (wordPlacedInIteration);

    if (placedCount > maxPlacedWords) {
      maxPlacedWords = placedCount;
      bestGrid = grid;
      bestPlacedClues = currentPlacedClues;
    }
    
    if (maxPlacedWords === words.length) {
      break; // All words placed successfully
    }
  }

  if (!bestGrid || !bestPlacedClues) {
    return { grid: [], placedClues: null, allWordsPlaced: false };
  }

  // Trim grid and re-calculate positions and numbers
  let minR = gridSize, maxR = -1, minC = gridSize, maxC = -1;
  for(let r = 0; r < gridSize; r++) {
    for(let c = 0; c < gridSize; c++) {
      if(bestGrid[r][c] !== null) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  if(minR > maxR) return { grid: [], placedClues: null, allWordsPlaced: false };

  const trimmedGrid = bestGrid.slice(minR, maxR + 1).map(row => row.slice(minC, maxC + 1));
  
  const finalClues = bestPlacedClues
    .filter(clue => {
      // Ensure the clue is part of the successfully placed words
      const wordOnGrid = getWordFromGrid(trimmedGrid, clue.row - minR, clue.col - minC, clue.direction, clue.answer.length);
      return wordOnGrid === clue.answer;
    })
    .map(clue => ({...clue, row: clue.row - minR, col: clue.col - minC }));
  
  // Assign clue numbers
  const clueMap: { [key: string]: number } = {};
  let clueCounter = 1;
  finalClues.sort((a,b) => a.row - b.row || a.col - b.col).forEach(clue => {
      const key = `${clue.row}-${clue.col}`;
      if (!clueMap[key]) {
          clueMap[key] = clueCounter++;
      }
      clue.number = clueMap[key];
  });


  return { grid: trimmedGrid, placedClues: finalClues, allWordsPlaced: maxPlacedWords === words.length };
}


function getWordFromGrid(grid: (string | null)[][], row: number, col: number, dir: 'across' | 'down', len: number): string {
    let word = '';
    if (dir === 'across') {
        for (let i = 0; i < len; i++) word += grid[row]?.[col + i] || ' ';
    } else {
        for (let i = 0; i < len; i++) word += grid[row + i]?.[col] || ' ';
    }
    return word;
}


function placeWord(grid: (string | null)[][], word: string, row: number, col: number, dir: 'across' | 'down') {
  if (dir === 'across') {
    for (let i = 0; i < word.length; i++) grid[row][col + i] = word[i];
  } else {
    for (let i = 0; i < word.length; i++) grid[row + i][col] = word[i];
  }
}

function canPlace(grid: (string | null)[][], word: string, row: number, col: number, dir: 'across' | 'down'): boolean {
  if (row < 0 || col < 0) return false;

  if (dir === 'across') {
    if (col + word.length > grid[0].length) return false;
    // Check for word boundary before and after
    if ( (col > 0 && grid[row][col - 1] !== null) || (col + word.length < grid[0].length && grid[row][col + word.length] !== null) ) return false;
    
    for (let i = 0; i < word.length; i++) {
      if (grid[row][col + i] !== null && grid[row][col + i] !== word[i]) return false; // Overlap conflict
      if (grid[row][col + i] === null) {
          // Check for parallel words
          if ( (row > 0 && grid[row - 1][col + i] !== null) || (row < grid.length - 1 && grid[row + 1][col + i] !== null) ) return false;
      }
    }
  } else { // down
    if (row + word.length > grid.length) return false;
    if ( (row > 0 && grid[row - 1][col] !== null) || (row + word.length < grid.length && grid[row + word.length][col] !== null) ) return false;

    for (let i = 0; i < word.length; i++) {
      if (grid[row + i][col] !== null && grid[row + i][col] !== word[i]) return false;
       if (grid[row + i][col] === null) {
          if ( (col > 0 && grid[row + i][col - 1] !== null) || (col < grid[0].length - 1 && grid[row + i][col + 1] !== null) ) return false;
      }
    }
  }
  
  // At least one intersection is required
  let intersects = false;
  for (let i = 0; i < word.length; i++) {
      if (dir === 'across' && grid[row][col+i] === word[i]) { intersects = true; break; }
      if (dir === 'down' && grid[row+i][col] === word[i]) { intersects = true; break; }
  }

  return intersects;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


export async function generateCrosswordPuzzle(
  input: GenerateCrosswordInput
): Promise<CrosswordData> {
  const result = await generateCrosswordPuzzleFlow(input);
  // Ensure the final output matches the CrosswordData schema expected by the client
  return {
      theme: result.theme,
      clues: result.clues,
  };
}

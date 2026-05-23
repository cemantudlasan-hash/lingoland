import os

games_dir = './src/components/games'
files = [
    "anatomy-academy.tsx", "article-architect.tsx", "atmospheric-ace.tsx", 
    "daily-verse.tsx", "grammar-guru.tsx", "idiom-illumination.tsx", 
    "pictionary-party.tsx", "probability-pilot.tsx", "pronunciation-pro.tsx", 
    "reading-comprehension.tsx", "riddle-realm.tsx", "sentence-scramble.tsx", 
    "synonym-sleuth.tsx", "time-traveler.tsx", "top-5-quiz.tsx", 
    "wheel-of-fortune.tsx", "world-tour-wheel.tsx"
]

for file in files:
    file_path = os.path.join(games_dir, file)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Look for GameState definition
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'type GameState' in line or 'interface GameState' in line or 'enum GameState' in line:
                print(f'{file}:{i+1}: {line.strip()}')
                # Print next few lines
                for j in range(1, 4):
                    if i + j < len(lines):
                        print(f'   {lines[i+j].strip()}')

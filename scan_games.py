import os
import json

games_dir = './src/components/games'
output_file = './game_states.json'

files = os.listdir(games_dir)
results = []

for file in files:
    if file.endswith('.tsx') or file.endswith('.ts'):
        file_path = os.path.join(games_dir, file)
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        has_finished_state = "'finished'" in content or '"finished"' in content
        set_finished_calls = []
        
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'finished' in line and ('setGameState' in line or 'setGameState(' in line):
                set_finished_calls.append({
                    'line': i + 1,
                    'text': line.strip()
                })
        
        results.append({
            'file': file,
            'hasFinishedState': has_finished_state,
            'setFinishedCalls': set_finished_calls
        })

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print('Done scanning game states. Output written to:', output_file)

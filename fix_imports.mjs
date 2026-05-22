import fs from 'fs';
import path from 'path';

const gamesDir = path.join(process.cwd(), 'src/components/games');
const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(gamesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  if (content.startsWith('import { shuffleArray } from "@/lib/shuffle";\n')) {
    content = content.replace('import { shuffleArray } from "@/lib/shuffle";\n', '');
    
    // Find "use client"; and insert after it
    if (content.includes('"use client";')) {
      content = content.replace('"use client";', '"use client";\n\nimport { shuffleArray } from "@/lib/shuffle";');
    } else if (content.includes("'use client';")) {
      content = content.replace("'use client';", "'use client';\n\nimport { shuffleArray } from \"@/lib/shuffle\";");
    } else {
      content = 'import { shuffleArray } from "@/lib/shuffle";\n' + content;
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed ${file}`);
  }
}

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, Users, Shuffle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type Student = {
    id: string;
    fullName: string;
};

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function GroupMaker() {
  const [nameList, setNameList] = React.useState<string[]>([]);
  const [manualNames, setManualNames] = React.useState('');
  const [numberOfGroups, setNumberOfGroups] = React.useState(2);
  const [generatedGroups, setGeneratedGroups] = React.useState<string[][]>([]);

  React.useEffect(() => {
      const manualNamesList = manualNames.split('\n').filter(name => name.trim() !== '');
      setNameList([...new Set(manualNamesList)]);
  }, [manualNames]);

  const handleGenerateGroups = () => {
    if (nameList.length === 0 || numberOfGroups <= 0) return;

    const shuffledNames = shuffleArray(nameList);
    const groups: string[][] = Array.from({ length: numberOfGroups }, () => []);
    
    shuffledNames.forEach((name, index) => {
      groups[index % numberOfGroups].push(name);
    });

    setGeneratedGroups(groups);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 rounded-lg">
      <div className="w-full max-w-lg flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-grow w-full space-y-2">
            <Label htmlFor="num-groups">Number of Groups</Label>
            <Input 
                id="num-groups"
                type="number"
                value={numberOfGroups}
                onChange={(e) => setNumberOfGroups(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full"
            />
        </div>
        <Button onClick={handleGenerateGroups} size="lg" className="w-full md:w-auto mt-auto">
          <Shuffle className="mr-2" />
          Generate Groups
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="space-y-4">
          <h3 className="font-bold">Student List ({nameList.length})</h3>
          <Textarea 
              value={manualNames}
              onChange={(e) => setManualNames(e.target.value)}
              placeholder="Or add names manually, one per line..."
              rows={10}
              className="bg-muted"
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="font-bold">Generated Groups</h3>
          {generatedGroups.length > 0 ? (
            <div 
              className="space-y-4 max-h-[24rem] overflow-y-auto pr-2 block"
              style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "thin" }}
            >
                {generatedGroups.map((group, index) => (
                    <Card key={index} className="bg-muted">
                        <CardContent className="p-4">
                            <h4 className="font-bold mb-2 text-primary">Group {index + 1}</h4>
                            <ul className="space-y-1 list-disc pl-5">
                                {group.map((name, i) => (
                                    <li key={i}>{name}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-muted rounded-lg p-8 text-muted-foreground">
                <p>Groups will appear here after generation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

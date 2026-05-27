'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, User, Shuffle, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

type Student = {
    id: string;
    fullName: string;
};

export function RandomNamePicker() {
  const [manualNames, setManualNames] = React.useState('');
  const [allNames, setAllNames] = React.useState<string[]>([]);
  const [availableNames, setAvailableNames] = React.useState<string[]>([]);
  const [selectedName, setSelectedName] = React.useState<string | null>(null);
  const [isSpinning, setIsSpinning] = React.useState(false);

  React.useEffect(() => {
      const manualNamesList = manualNames.split('\n').filter(name => name.trim() !== '');
      const combined = [...new Set(manualNamesList)].sort();
      setAllNames(combined);
      setAvailableNames(combined);
  }, [manualNames]);


  const handlePickName = () => {
    if (availableNames.length === 0) return;
    
    setIsSpinning(true);
    setSelectedName(null);

    const spinDuration = 2000;
    const spinInterval = 75;
    let spinCount = 0;
    
    const spinIntervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        setSelectedName(availableNames[randomIndex]);
        spinCount += spinInterval;
        if (spinCount >= spinDuration) {
            clearInterval(spinIntervalId);
            setIsSpinning(false);
        }
    }, spinInterval);
  };

  const handleRemoveName = () => {
      if (!selectedName) return;
      const lines = manualNames.split('\n');
      const updatedLines = lines.filter(line => line.trim() !== selectedName.trim());
      setManualNames(updatedLines.join('\n'));
      setAvailableNames(prev => prev.filter(name => name !== selectedName));
      setSelectedName(null);
  }

  const handleResetList = () => {
      setAvailableNames(allNames);
      setSelectedName(null);
  }
  
  const renderResult = () => {
      if (isSpinning) {
          return <Loader2 className="h-10 w-10 animate-spin" />;
      }
      if (selectedName) {
          return <p className="text-4xl font-bold text-primary animate-in fade-in zoom-in-95">{selectedName}</p>
      }
      if (availableNames.length === 0 && allNames.length > 0) {
          return <p className="text-muted-foreground">All names have been picked!</p>
      }
      return <User className="h-12 w-12 text-muted-foreground" />;
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 rounded-lg">
      <div className="h-32 w-full max-w-md flex items-center justify-center bg-muted rounded-lg text-center">
        {renderResult()}
      </div>
      
       <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={handlePickName} size="lg" disabled={isSpinning || availableNames.length === 0}>
              <Shuffle className="mr-2" />
              Pick a Random Name
            </Button>
            <Button onClick={handleRemoveName} size="lg" variant="outline" disabled={isSpinning || !selectedName}>
                <Trash2 className="mr-2" />
                Remove Selected
            </Button>
            <Button onClick={handleResetList} size="lg" variant="secondary" disabled={isSpinning}>
                <RotateCcw className="mr-2" />
                Reset List
            </Button>
       </div>
      
      <div className="w-full max-w-md space-y-4">
        <div>
            <h3 className="font-bold">Student List ({availableNames.length} available / {allNames.length} total)</h3>
            <p className="text-xs text-muted-foreground">Add student names to get started.</p>
        </div>
        <Textarea 
            value={manualNames}
            onChange={(e) => setManualNames(e.target.value)}
            placeholder="Enter student names, one per line..."
            rows={5}
        />
      </div>
    </div>
  );
}

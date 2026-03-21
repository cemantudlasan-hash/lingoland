'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, UserPlus, RotateCcw, Trash2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

type Team = {
    name: string;
    score: number;
};

const teamColors = [
    'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500'
];

export function Scoreboard() {
    const [teams, setTeams] = React.useState<Team[]>([
        { name: 'Team 1', score: 0 },
        { name: 'Team 2', score: 0 },
    ]);
    const [pointsToAdd, setPointsToAdd] = React.useState(10);
    
    const handleAddTeam = () => {
        if(teams.length < 4) {
            setTeams([...teams, { name: `Team ${teams.length + 1}`, score: 0 }]);
        }
    };
    
    const handleRemoveTeam = (index: number) => {
        if (teams.length > 2) {
            setTeams(teams.filter((_, i) => i !== index));
        }
    }

    const handleTeamNameChange = (index: number, newName: string) => {
        const newTeams = [...teams];
        newTeams[index].name = newName;
        setTeams(newTeams);
    };

    const handleScoreChange = (index: number, amount: number) => {
        const newTeams = [...teams];
        newTeams[index].score += amount;
        setTeams(newTeams);
    };

    const handleResetScores = () => {
        setTeams(teams.map(team => ({...team, score: 0})));
    };
    
    const sortedTeams = React.useMemo(() => {
        return [...teams].sort((a,b) => b.score - a.score);
    }, [teams]);

    return (
        <div className="flex flex-col items-center gap-6 p-4 rounded-lg">
            <div className="w-full max-w-lg flex flex-col md:flex-row gap-4 items-center justify-center">
                <div className="flex items-center gap-2">
                    <Label htmlFor="points-to-add">Points:</Label>
                    <Input 
                        id="points-to-add"
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                        className="w-24"
                        step="10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleAddTeam} disabled={teams.length >= 4} variant="outline">
                        <UserPlus className="mr-2" /> Add Team
                    </Button>
                    <Button onClick={handleResetScores} variant="destructive">
                        <RotateCcw className="mr-2" /> Reset Scores
                    </Button>
                </div>
            </div>
            
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl",
                teams.length >= 3 && 'lg:grid-cols-3',
                teams.length >= 4 && 'lg:grid-cols-4',
            )}>
                {teams.map((team, index) => (
                    <Card key={index} className={cn("text-white relative overflow-hidden", teamColors[index])}>
                        <CardHeader>
                            {teams.length > 2 && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-1 right-1 h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
                                    onClick={() => handleRemoveTeam(index)}
                                >
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            )}
                            <Input 
                                value={team.name}
                                onChange={(e) => handleTeamNameChange(index, e.target.value)}
                                className="text-2xl font-bold text-center bg-transparent border-0 border-b-2 border-white/50 rounded-none focus-visible:ring-0 focus:border-white h-auto p-1"
                            />
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <p className="text-6xl font-bold tracking-tighter">{team.score}</p>
                            <div className="flex gap-2">
                                <Button onClick={() => handleScoreChange(index, pointsToAdd)} size="lg" className="bg-white/90 hover:bg-white text-black">
                                    <Plus />
                                </Button>
                                <Button onClick={() => handleScoreChange(index, -pointsToAdd)} size="lg" className="bg-black/50 hover:bg-black/70 border-white/50 border">
                                    <Minus />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="w-full max-w-lg mt-8">
                <h3 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2"><Trophy className="text-yellow-400"/> Leaderboard</h3>
                <div className="space-y-2">
                    {sortedTeams.map((team, index) => (
                        <div key={index} className={cn("flex justify-between p-3 rounded-lg font-bold", index === 0 ? "bg-yellow-400 text-yellow-900" : "bg-muted")}>
                            <span>{index + 1}. {team.name}</span>
                            <span>{team.score} pts</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

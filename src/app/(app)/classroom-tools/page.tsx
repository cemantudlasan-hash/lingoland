
'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimerTool } from './timer-tool';
import { RandomNamePicker } from './random-name-picker';
import { GroupMaker } from './group-maker';
import { Scoreboard } from './scoreboard';
import { MorningDashboard } from './morning-dashboard';
import { CommentGenerator } from './comment-generator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Timer, Users, User, Trophy, Maximize, Minimize, Monitor, MessageSquareQuote, StickyNote, Volume2, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemorandumTool } from './memorandum-tool';
import { NoiseMeter } from './noise-meter';
import { DailyVerse } from '@/components/games/daily-verse';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ClassroomToolsPage() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('morning-dashboard');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['morning-dashboard', 'timer', 'noise-meter', 'random-name-picker', 'group-maker', 'scoreboard', 'comment-generator', 'memorandum', 'daily-verse'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleFullScreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const tabs = [
    { value: 'morning-dashboard', label: 'Dashboard', icon: Monitor },
    { value: 'timer', label: 'Timer', icon: Timer },
    { value: 'noise-meter', label: 'Noise Meter', icon: Volume2 },
    { value: 'random-name-picker', label: 'Name Picker', icon: User },
    { value: 'group-maker', label: 'Group Maker', icon: Users },
    { value: 'scoreboard', label: 'Scoreboard', icon: Trophy },
    { value: 'comment-generator', label: 'Comments', icon: MessageSquareQuote },
    { value: 'memorandum', label: 'Memorandum', icon: StickyNote },
    { value: 'daily-verse', label: 'Daily Verse', icon: Newspaper },
  ];

  return (
    <div 
        ref={containerRef}
        className={cn(
          "relative w-full transition-all duration-500 flex flex-col h-auto md:h-[calc(100vh-130px)] min-h-[550px]", 
          isFullscreen && "bg-background p-6 w-screen h-screen flex flex-col items-center justify-start overflow-y-auto"
        )}
        data-fullscreen-container={isFullscreen}
    >
        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full flex flex-col", isFullscreen ? "max-w-7xl" : "h-full flex-grow min-h-0")}>
            <div className="flex items-center justify-between gap-2 mb-4 flex-shrink-0">
                <TabsList className="flex flex-wrap w-full justify-start items-center gap-1 md:gap-2 flex-grow relative overflow-visible h-auto p-1">
                    {tabs.map((tab) => (
                        <div key={tab.value} className="relative">
                            <TabsTrigger value={tab.value} className="w-full relative z-10 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                                <tab.icon className="mr-2 h-4 w-4" />
                                <span className="hidden lg:inline">{tab.label}</span>
                            </TabsTrigger>
                            {activeTab === tab.value && (
                                <motion.div
                                    layoutId="active-tab-pill"
                                    className="absolute inset-0 bg-background rounded-sm shadow-sm"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </div>
                    ))}
                </TabsList>
                <Button 
                    onClick={handleFullScreen}
                    variant="ghost"
                    className="shrink-0 h-auto p-2 gap-1.5"
                >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    <span className="text-xs">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </Button>
            </div>

            <TabsContent value="morning-dashboard" className="flex-grow mt-0 h-full min-h-0">
                <Card className="h-full flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>Classroom Dashboard</CardTitle>
                        <CardDescription>A landing page for your students as they enter the room.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow min-h-0 overflow-hidden p-3 md:p-6">
                        <MorningDashboard />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="timer" className="flex-grow mt-0 h-full min-h-0">
                <Card className="h-full flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>Classroom Timer</CardTitle>
                        <CardDescription>A simple timer for classroom activities.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center min-h-0 overflow-y-auto">
                        <TimerTool />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="random-name-picker" className="flex-grow mt-0 h-full min-h-0">
                 <Card className="h-full flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>Random Name Picker</CardTitle>
                        <CardDescription>Quickly and fairly select a student for a task.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center min-h-0 overflow-y-auto">
                        <RandomNamePicker />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="group-maker" className="flex-grow mt-0 h-full min-h-0">
                 <Card className="h-full flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>Group Maker</CardTitle>
                        <CardDescription>Randomly assign students into groups.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto min-h-0">
                        <div className="min-h-full flex items-center justify-center w-full">
                            <GroupMaker />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="scoreboard" className="flex-grow mt-0 h-full min-h-0">
                 <Card className="h-full flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>Scoreboard</CardTitle>
                        <CardDescription>Keep track of team scores during classroom games.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center min-h-0 overflow-y-auto">
                        <Scoreboard />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="comment-generator" className="flex-grow mt-0 h-full min-h-0">
                 <Card className={cn("flex flex-col min-h-0", isFullscreen ? "h-auto" : "h-full")}>
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>AI Student Comment Generator</CardTitle>
                        <CardDescription>Generate balanced performance feedback for reports and meetings.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto min-h-0">
                        <CommentGenerator />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="memorandum" className="flex-grow mt-0 h-full min-h-0">
                <Card className="h-full flex flex-col overflow-y-auto min-h-0">
                    <MemorandumTool />
                </Card>
            </TabsContent>

            <TabsContent value="noise-meter" className="flex-grow mt-0 h-full min-h-0">
                <Card className="h-full flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>Classroom Noise Meter</CardTitle>
                        <CardDescription>Monitor and manage classroom sound levels using your microphone.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto min-h-0">
                        <NoiseMeter />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="daily-verse" className="flex-grow mt-0 h-full min-h-0">
                <Card className="h-full flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle>The Daily Verse</CardTitle>
                        <CardDescription>AI News Aggregator & Quiz Game for students.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto min-h-0">
                        <DailyVerse slug="daily-verse" />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

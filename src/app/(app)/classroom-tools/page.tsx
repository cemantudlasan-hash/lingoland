
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
import { Timer, Users, User, Trophy, Maximize, Minimize, Monitor, MessageSquareQuote, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemorandumTool } from './memorandum-tool';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ClassroomToolsPage() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('morning-dashboard');

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
    { value: 'random-name-picker', label: 'Name Picker', icon: User },
    { value: 'group-maker', label: 'Group Maker', icon: Users },
    { value: 'scoreboard', label: 'Scoreboard', icon: Trophy },
    { value: 'comment-generator', label: 'Comments', icon: MessageSquareQuote },
    { value: 'memorandum', label: 'Memorandum', icon: StickyNote },
  ];

  return (
    <div 
        ref={containerRef}
        className={cn(
          "relative max-w-6xl mx-auto transition-all duration-500", 
          isFullscreen && "bg-background p-6 w-screen h-screen flex flex-col items-center justify-start overflow-y-auto"
        )}
        data-fullscreen-container={isFullscreen}
    >
        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full flex flex-col", isFullscreen ? "max-w-7xl" : "h-full")}>
            <div className="flex items-center justify-between gap-2 mb-4">
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

            <TabsContent value="morning-dashboard" className="flex-grow mt-0 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Classroom Dashboard</CardTitle>
                        <CardDescription>A landing page for your students as they enter the room.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <MorningDashboard />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="timer" className="flex-grow mt-0 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Classroom Timer</CardTitle>
                        <CardDescription>A simple timer for classroom activities.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        <TimerTool />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="random-name-picker" className="flex-grow mt-0 h-full">
                 <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Random Name Picker</CardTitle>
                        <CardDescription>Quickly and fairly select a student for a task.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        <RandomNamePicker />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="group-maker" className="flex-grow mt-0 h-full">
                 <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Group Maker</CardTitle>
                        <CardDescription>Randomly assign students into groups.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        <GroupMaker />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="scoreboard" className="flex-grow mt-0 h-full">
                 <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Scoreboard</CardTitle>
                        <CardDescription>Keep track of team scores during classroom games.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        <Scoreboard />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="comment-generator" className="flex-grow mt-0 h-full">
                 <Card className={cn("flex flex-col", isFullscreen ? "min-h-0 h-auto" : "h-full")}>
                    <CardHeader className="pb-2">
                        <CardTitle>AI Student Comment Generator</CardTitle>
                        <CardDescription>Generate balanced performance feedback for reports and meetings.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto">
                        <CommentGenerator />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="memorandum" className="flex-grow mt-0 h-full">
                <Card className="h-full flex flex-col overflow-y-auto">
                    <MemorandumTool />
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}

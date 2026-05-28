'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit3, Save, LayoutDashboard, Palette, Sparkles, StickyNote, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export function MorningDashboard() {
  const { user, isGuest } = useAuth();
  
  const [time, setTime] = React.useState(new Date());
  const [isEditing, setIsEditing] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [prevKey, setPrevKey] = React.useState<string | null>(null);
  
  const [data, setData] = React.useState({
    title: 'Welcome to Class!',
    bellRinger: 'What is the most interesting thing you learned this week?',
    materials: '- Notebook\n- Blue or Black Pen\n- Textbook page 12',
    reminders: '- Homework due Friday\n- Parent signatures needed\n- Library books back tomorrow',
    theme: 'bg-blueprint text-white',
  });

  // Determine dynamic storage key scoped to the logged-in user or guest
  const storageKey = React.useMemo(() => {
    const uid = isGuest ? 'guest' : user?.uid || 'default';
    return `lingoland_morning_dashboard_data_${uid}`;
  }, [user?.uid, isGuest]);

  // Load from localStorage whenever the storage key changes
  React.useEffect(() => {
    if (storageKey !== prevKey) {
      setPrevKey(storageKey);
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          setData(JSON.parse(savedData));
        } catch (e) {
          console.error("Failed to parse saved dashboard data", e);
        }
      } else {
        // Fallback to default state if no saved data exists for this user/guest
        setData({
          title: 'Welcome to Class!',
          bellRinger: 'What is the most interesting thing you learned this week?',
          materials: '- Notebook\n- Blue or Black Pen\n- Textbook page 12',
          reminders: '- Homework due Friday\n- Parent signatures needed\n- Library books back tomorrow',
          theme: 'bg-blueprint text-white',
        });
      }
    }
  }, [storageKey, prevKey]);

  // Save to localStorage whenever data changes
  React.useEffect(() => {
    if (isMounted && prevKey) {
      localStorage.setItem(prevKey, JSON.stringify(data));
    }
  }, [data, isMounted, prevKey]);

  // Initialize timer and mount status
  React.useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const themes = [
    { name: 'Blueprint', value: 'bg-blueprint text-white' },
    { name: 'Mint', value: 'bg-mint-stripes text-slate-800' },
    { name: 'Sunset', value: 'bg-twilight text-white' },
    { name: 'Pastel', value: 'bg-pastel-floral text-orange-900' },
    { name: 'Sky', value: 'bg-sky text-blue-900' },
    { name: 'Dotted', value: 'bg-dotted-grid text-sky-900' },
    { name: 'Rose Gold', value: 'bg-rose-gold text-rose-950' },
    { name: 'Forest', value: 'bg-forest text-emerald-950' },
    { name: 'Chalkboard', value: 'bg-chalkboard text-slate-100' },
  ];

  if (!isMounted) return null;

  return (
    <div className="w-full h-full flex flex-col gap-4 min-h-0">
      <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg border flex-shrink-0">
        <div className="flex gap-2">
            <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)} size="sm">
                {isEditing ? <><Save className="mr-2 h-4 w-4"/> View Board</> : <><Edit3 className="mr-2 h-4 w-4"/> Edit Board</>}
            </Button>
        </div>
        <div className="flex items-center gap-4">
            {isEditing && (
                <div className="flex items-center gap-2">
                    <Label className="text-xs font-bold hidden sm:inline">Theme Picker:</Label>
                    <div className="flex flex-wrap gap-1">
                        {themes.map(t => (
                            <button 
                                key={t.name} 
                                onClick={() => setData({...data, theme: t.value})}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", 
                                    t.value.split(' ')[0],
                                    data.theme === t.value ? "border-primary ring-2 ring-primary/20" : "border-background"
                                )}
                                title={t.name}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className={cn(
        "flex-grow rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col gap-6 transition-all duration-500 overflow-hidden",
        data.theme
      )}>
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-current/20 pb-6 flex-shrink-0">
            <div className="space-y-1">
                {isEditing ? (
                    <div className="space-y-1">
                        <Label className="text-xs opacity-70">Board Title</Label>
                        <Input 
                            value={data.title} 
                            onChange={(e) => setData({...data, title: e.target.value})} 
                            className="text-2xl md:text-3xl font-bold bg-white/10 border-white/20 h-auto p-2"
                        />
                    </div>
                ) : (
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none truncate max-w-[60vw]">{data.title}</h2>
                )}
                <div className="flex items-center gap-2 opacity-80 font-bold">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                    <p className="text-base md:text-xl">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-3xl border border-white/20 shadow-xl min-w-[180px] justify-center flex-shrink-0">
                <Clock className="h-6 w-6 md:h-8 md:w-8" />
                <span className="text-3xl md:text-5xl font-mono font-black">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
            {/* Bell Ringer Main Panel */}
            <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border-white/20 text-inherit flex flex-col overflow-hidden rounded-3xl border-2">
                <div className="p-6 md:p-8 flex flex-col h-full min-h-0">
                    <h3 className="text-xl md:text-2xl font-black flex items-center gap-2 mb-4 border-b border-current/10 pb-2 uppercase tracking-widest flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-yellow-400" /> Bell Ringer
                    </h3>
                    <div className="flex-grow overflow-y-auto min-h-0">
                        {isEditing ? (
                            <Textarea 
                                value={data.bellRinger} 
                                onChange={(e) => setData({...data, bellRinger: e.target.value})}
                                className="w-full h-full bg-white/5 border-white/10 text-lg md:text-xl font-medium p-4 resize-none"
                                placeholder="Type today's bell ringer question..."
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-center px-4">
                                <p className="text-2xl md:text-4xl lg:text-5xl font-medium leading-tight italic">
                                    "{data.bellRinger}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Sidebar with Materials and Sticky Note */}
            <div className="flex flex-col gap-6 min-h-0">
                {/* Materials List */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-inherit rounded-3xl border-2 flex flex-col min-h-0 flex-1">
                    <div className="p-5 md:p-6 flex flex-col h-full">
                        <h3 className="text-lg md:text-xl font-black flex items-center gap-2 mb-3 border-b border-current/10 pb-2 uppercase flex-shrink-0">
                            <ImageIcon className="h-4 w-4 md:h-5 md:w-5" /> Materials
                        </h3>
                        <div className="flex-grow overflow-y-auto min-h-0">
                            {isEditing ? (
                                <Textarea 
                                    value={data.materials} 
                                    onChange={(e) => setData({...data, materials: e.target.value})}
                                    className="w-full h-full bg-white/5 border-white/10 resize-none"
                                    placeholder="List required materials..."
                                />
                            ) : (
                                <div className="space-y-2 text-lg md:text-xl font-bold">
                                    {data.materials.split('\n').filter(line => line.trim()).map((m, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-primary-foreground/50">•</span>
                                            <span>{m.replace(/^[•\-\*]\s*/, '')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Reminders Sticky Note */}
                <Card className="bg-yellow-300 text-black border-none -rotate-1 shadow-2xl rounded-sm relative before:absolute before:top-0 before:right-0 before:w-8 before:h-8 before:bg-yellow-400 before:shadow-[-2px_2px_5px_rgba(0,0,0,0.1)] before:rounded-bl-lg flex flex-col min-h-0 flex-1">
                    <div className="p-5 md:p-6 flex flex-col h-full">
                        <h3 className="text-lg md:text-xl font-black flex items-center gap-2 mb-3 border-b border-black/10 pb-2 uppercase flex-shrink-0">
                            <StickyNote className="h-4 w-4 md:h-5 md:w-5" /> Reminders
                        </h3>
                        <div className="flex-grow overflow-y-auto min-h-0">
                            {isEditing ? (
                                <Textarea 
                                    value={data.reminders} 
                                    onChange={(e) => setData({...data, reminders: e.target.value})}
                                    className="w-full h-full bg-black/5 border-black/10 text-black placeholder:text-black/40 border-none focus-visible:ring-0 resize-none"
                                    placeholder="Type reminders here..."
                                />
                            ) : (
                                <div className="space-y-2 text-base md:text-lg font-bold font-sans">
                                    {data.reminders.split('\n').filter(line => line.trim()).map((r, i) => (
                                        <div key={i} className="flex items-start gap-2 border-b border-black/5 pb-1">
                                            <span>{r}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

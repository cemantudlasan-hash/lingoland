
"use client";

import React, { useRef } from "react";
import { allGames } from "@/lib/games";
import dynamic from 'next/dynamic';
import { LoadingPlaceholder } from "@/components/layout/loading-placeholder";
import { useParams } from "next/navigation";
import { gameComponentMap } from "../page";
import { cn } from "@/lib/utils";


export default function GamePage() {
  const params = useParams();
  const slug = params.slug as string;
  const game = allGames.find((g) => g.slug === slug);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleFullScreen = () => {
    const elem = gameContainerRef.current;
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

  if (!game) {
    return <div>Game not found</div>;
  }
  
  const GameComponent = gameComponentMap[game.slug as keyof typeof gameComponentMap] || dynamic(() => import('@/components/game-placeholder').then(mod => mod.GamePlaceholder), { ssr: false });

  return (
    <div
      ref={gameContainerRef}
      className={cn(
        "relative transition-colors duration-500",
        isFullscreen && "bg-background w-screen h-screen overflow-hidden"
      )}
      data-fullscreen-container={isFullscreen}
    >
      <div className={cn("w-full transition-all duration-500", isFullscreen ? "h-full overflow-y-auto" : "p-0")}>
        <React.Suspense fallback={<LoadingPlaceholder />}>
          <GameComponent slug={game.slug} onToggleFullscreen={handleFullScreen} />
        </React.Suspense>
      </div>
    </div>
  );
}

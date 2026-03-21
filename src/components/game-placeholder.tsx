"use client";

import { getGameBySlug } from "@/lib/games";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export function GamePlaceholder({ slug }: { slug: string }) {
  const game = getGameBySlug(slug);

  if (!game) {
    return <div>Game not found</div>;
  }
  
  const Icon = game.icon;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <Icon className="w-16 h-16 text-primary" />
        </div>
        <CardTitle className="text-3xl">{game.title}</CardTitle>
        <CardDescription>{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-lg text-muted-foreground mb-6">
          This game is coming soon! Check back later to play.
        </p>
        <Button variant="outline" asChild>
          <a href="/games">Back to Games</a>
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  exercises: {
    label: "Exercises",
    color: "hsl(var(--primary))",
  },
  games: {
    label: "Games",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function DashboardChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <BarChart accessibilityLayer data={data} margin={{ top: 16, right: 16, left: 16, bottom: 24 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="exercises" fill="var(--color-exercises)" radius={4} />
        <Bar dataKey="games" fill="var(--color-games)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

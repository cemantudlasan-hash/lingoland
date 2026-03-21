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
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="exercises" fill="var(--color-exercises)" radius={4} />
        <Bar dataKey="games" fill="var(--color-games)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

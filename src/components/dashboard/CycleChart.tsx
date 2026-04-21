import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

interface CyclePoint {
  cycle: string;
  length: number;
}

interface Props {
  data: CyclePoint[];
  averageLength: number;
}

export const CycleChart = ({ data, averageLength }: Props) => {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Cycle History
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            Avg <span className="font-semibold text-foreground">{averageLength}d</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        {data.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground">
            <p className="text-sm">No cycle data yet</p>
            <p className="text-xs mt-1">Log periods to see your trends</p>
          </div>
        ) : (
          <div className="h-48 sm:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cycleFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="cycle" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area type="monotone" dataKey="length" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#cycleFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

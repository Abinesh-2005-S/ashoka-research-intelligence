import { InstitutionSummary } from "@/services/openalex/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BookOpen, Quote, Target } from "lucide-react";

export function Scorecard({ summary }: { summary: InstitutionSummary }) {
  const metrics = [
    {
      title: "Total Outputs",
      value: summary.works_count.toLocaleString(),
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
      description: "Lifetime research outputs",
    },
    {
      title: "Total Citations",
      value: summary.cited_by_count.toLocaleString(),
      icon: <Quote className="h-4 w-4 text-muted-foreground" />,
      description: "Across all outputs",
    },
    {
      title: "h-index",
      value: summary.summary_stats.h_index,
      icon: <Target className="h-4 w-4 text-muted-foreground" />,
      description: "Overall productivity & impact",
    },
    {
      title: "2-Yr Mean Citedness",
      value: summary.summary_stats["2yr_mean_citedness"].toFixed(2),
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      description: "Recent citation velocity",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

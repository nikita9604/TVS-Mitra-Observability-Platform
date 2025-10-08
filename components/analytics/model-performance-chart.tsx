"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"

interface ModelPerformanceProps {
  data: Array<{
    version: string
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    rocAuc: number
    giniCoeff: number
    trainingDate: string
    featureCount: number
    dataSize: number
  }>
}

export function ModelPerformanceChart({ data }: ModelPerformanceProps) {
  // Prepare radar chart data for latest model
  const latestModel = data[0]
  const radarData = latestModel
    ? [
        { metric: "Accuracy", value: latestModel.accuracy * 100 },
        { metric: "Precision", value: latestModel.precision * 100 },
        { metric: "Recall", value: latestModel.recall * 100 },
        { metric: "F1 Score", value: latestModel.f1Score * 100 },
        { metric: "ROC AUC", value: latestModel.rocAuc * 100 },
        { metric: "Gini Coeff", value: latestModel.giniCoeff * 100 },
      ]
    : []

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-primary">Latest Model Metrics</CardTitle>
        <CardDescription>
          {latestModel ? `Model ${latestModel.version} performance breakdown` : "No model data available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Performance %",
              color: "#0D4A85",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#0D4A85" strokeOpacity={0.3} />
              <PolarAngleAxis dataKey="metric" className="text-sm" />
              <PolarRadiusAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#0D4A85"
                fill="#0D4A85"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

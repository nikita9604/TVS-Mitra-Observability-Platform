"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"

interface LoanTrendsProps {
  data: Array<{
    date: string
    applications: number
    approvals: number
    approvalRate: number
    avgAmount: number
    avgProbability: number
  }>
}

export function LoanTrendsChart({ data }: LoanTrendsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-l-4 border-l-[#0D4A85]">
        <CardHeader>
          <CardTitle className="text-[#0D4A85]">Application Trends</CardTitle>
          <CardDescription>Daily loan applications and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              applications: {
                label: "Applications",
                color: "#0D4A85",
              },
              approvals: {
                label: "Approvals",
                color: "#108A43",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    color: "#0D4A85",
                  }}
                />
                <Bar dataKey="applications" fill="#0D4A85" name="Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approvals" fill="#108A43" name="Approvals" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#108A43]">
        <CardHeader>
          <CardTitle className="text-[#0D4A85]">Approval Rate Trend</CardTitle>
          <CardDescription>Daily approval rate percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              approvalRate: {
                label: "Approval Rate %",
                color: "#108A43",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    color: "#0D4A85",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="approvalRate"
                  stroke="#108A43"
                  strokeWidth={3}
                  name="Approval Rate %"
                  dot={{ fill: "#108A43", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

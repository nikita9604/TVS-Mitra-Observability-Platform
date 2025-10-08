"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Star, TrendingUp, TrendingDown } from "lucide-react"

interface CustomerSatisfactionProps {
  data: {
    totalFeedback: number
    avgSatisfaction: number
    satisfactionDistribution: Array<{
      rating: string
      count: number
      percentage: string
    }>
    improvementAreas: Array<{
      area: string
      count: number
      percentage: string
    }>
    highSatisfaction: number
    lowSatisfaction: number
  }
}

const COLORS = [
  "#0D4A85", // Primary blue
  "#108A43", // Primary green
  "#1e5a96", // Darker blue variation
  "#0f7a3c", // Darker green variation
  "#2d6bb0", // Lighter blue variation
  "#12a04a", // Lighter green variation
]

export function CustomerSatisfaction({ data }: CustomerSatisfactionProps) {
  const safeData = {
    totalFeedback: data?.totalFeedback || 0,
    avgSatisfaction: data?.avgSatisfaction || 0,
    satisfactionDistribution: data?.satisfactionDistribution || [],
    improvementAreas: data?.improvementAreas || [],
    highSatisfaction: data?.highSatisfaction || 0,
    lowSatisfaction: data?.lowSatisfaction || 0,
  }

  const satisfactionRate =
    safeData.totalFeedback > 0 ? ((safeData.highSatisfaction / safeData.totalFeedback) * 100).toFixed(1) : "0.0"
  const dissatisfactionRate =
    safeData.totalFeedback > 0 ? ((safeData.lowSatisfaction / safeData.totalFeedback) * 100).toFixed(1) : "0.0"

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Summary Cards */}
      <Card className="border-l-4 border-l-[#108A43]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-[#108A43]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0D4A85]">{safeData.avgSatisfaction}/5</div>
          <p className="text-xs text-muted-foreground">Based on {safeData.totalFeedback} reviews</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#108A43]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Satisfaction</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#108A43]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#108A43]">{satisfactionRate}%</div>
          <p className="text-xs text-muted-foreground">4+ star ratings</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[#0D4A85]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
          <TrendingDown className="h-4 w-4 text-[#0D4A85]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0D4A85]">{dissatisfactionRate}%</div>
          <p className="text-xs text-muted-foreground">2 or fewer stars</p>
        </CardContent>
      </Card>

      {/* Satisfaction Distribution Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-[#0D4A85]">Rating Distribution</CardTitle>
          <CardDescription>Customer satisfaction breakdown by star rating</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safeData.satisfactionDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="rating" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: "#0D4A85",
                }}
              />
              <Bar dataKey="count" fill="#0D4A85" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Improvement Areas Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0D4A85]">Improvement Areas</CardTitle>
          <CardDescription>Most requested improvements</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={safeData.improvementAreas}
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
                label={({ area, percentage }) => `${percentage}%`}
                labelLine={false}
                fontSize={12}
              >
                {safeData.improvementAreas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: "#0D4A85",
                }}
                formatter={(value, name, props) => [
                  `${value} responses (${props.payload.percentage}%)`,
                  props.payload.area,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {safeData.improvementAreas.map((item, index) => (
              <div key={item.area} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[#0D4A85] truncate">{item.area}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

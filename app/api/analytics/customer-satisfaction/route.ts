import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Get customer feedback data
    const { data: feedback, error } = await supabase
      .from("customer_feedback")
      .select("overall_satisfaction_rating, improvement_areas")

    if (error) {
      console.error("Error fetching customer feedback:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    const totalFeedback = feedback.length
    const avgSatisfaction = feedback.reduce((sum, item) => sum + item.overall_satisfaction_rating, 0) / totalFeedback

    // Count satisfaction ratings distribution with percentages
    const satisfactionDistribution = feedback.reduce(
      (acc, item) => {
        const rating = item.overall_satisfaction_rating
        acc[rating] = (acc[rating] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    // Parse and count improvement areas with percentages
    const improvementCounts = {
      "Clearer decision": 0,
      "More choices": 0,
      "Talk to agent": 0,
      "Faster flow": 0,
      "Personalized offers": 0,
      "Location-specific deals": 0,
    }

    feedback.forEach((item) => {
      if (item.improvement_areas && Array.isArray(item.improvement_areas)) {
        item.improvement_areas.forEach((area: string) => {
          if (improvementCounts.hasOwnProperty(area)) {
            improvementCounts[area as keyof typeof improvementCounts]++
          }
        })
      }
    })

    // Convert to chart data with enhanced percentage calculations
    const satisfactionChartData = Object.entries(satisfactionDistribution).map(([rating, count]) => ({
      rating: `${rating} Star${rating !== "1" ? "s" : ""}`,
      count,
      percentage: Number(((count / totalFeedback) * 100).toFixed(1)),
    }))

    const improvementChartData = Object.entries(improvementCounts).map(([area, count]) => ({
      area,
      count,
      percentage: Number(((count / totalFeedback) * 100).toFixed(1)),
    }))

    // Calculate satisfaction categories with percentages
    const highSatisfactionCount = feedback.filter((f) => f.overall_satisfaction_rating >= 4).length
    const mediumSatisfactionCount = feedback.filter((f) => f.overall_satisfaction_rating === 3).length
    const lowSatisfactionCount = feedback.filter((f) => f.overall_satisfaction_rating <= 2).length

    const highSatisfactionPercentage = Number(((highSatisfactionCount / totalFeedback) * 100).toFixed(1))
    const mediumSatisfactionPercentage = Number(((mediumSatisfactionCount / totalFeedback) * 100).toFixed(1))
    const lowSatisfactionPercentage = Number(((lowSatisfactionCount / totalFeedback) * 100).toFixed(1))

    return NextResponse.json({
      // Counts
      totalFeedback,
      highSatisfactionCount,
      mediumSatisfactionCount,
      lowSatisfactionCount,

      // Averages
      avgSatisfaction: Number(avgSatisfaction.toFixed(2)),

      // Percentages
      highSatisfactionPercentage,
      mediumSatisfactionPercentage,
      lowSatisfactionPercentage,

      // Chart data with percentages
      satisfactionDistribution: satisfactionChartData,
      improvementAreas: improvementChartData,

      // Summary metrics
      satisfactionTrend:
        highSatisfactionPercentage > 60
          ? "Positive"
          : highSatisfactionPercentage > 40
            ? "Neutral"
            : "Needs Improvement",
      topImprovementArea: improvementChartData.sort((a, b) => b.count - a.count)[0]?.area || "None",
    })
  } catch (error) {
    console.error("Error in customer satisfaction API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

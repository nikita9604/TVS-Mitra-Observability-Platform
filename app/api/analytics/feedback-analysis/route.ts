import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: feedbackData } = await supabase
      .from("customer_feedback")
      .select("*")
      .order("created_at", { ascending: false })

    if (!feedbackData) {
      return NextResponse.json({ error: "No feedback data found" }, { status: 404 })
    }

    // Process improvement areas array
    const processedFeedback = feedbackData.map((feedback) => ({
      id: feedback.id,
      sessionId: feedback.session_id,
      rating: feedback.overall_satisfaction_rating,
      improvementAreas: feedback.improvement_areas || [],
      createdAt: feedback.created_at,
    }))

    // Calculate analytics
    const analytics = {
      totalFeedback: processedFeedback.length,
      averageRating:
        Math.round((processedFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / processedFeedback.length) * 100) /
        100,

      // Rating distribution
      ratingDistribution: processedFeedback.reduce((acc, feedback) => {
        const rating = feedback.rating || 0
        acc[rating] = (acc[rating] || 0) + 1
        return acc
      }, {}),

      // Most common improvement areas
      improvementFrequency: processedFeedback
        .flatMap((f) => f.improvementAreas)
        .reduce((acc, area) => {
          acc[area] = (acc[area] || 0) + 1
          return acc
        }, {}),

      // Satisfaction trends over time
      satisfactionTrends: processedFeedback.reduce((acc, feedback) => {
        const date = new Date(feedback.createdAt).toISOString().split("T")[0]
        if (!acc[date]) {
          acc[date] = { count: 0, totalRating: 0, avgRating: 0 }
        }
        acc[date].count++
        acc[date].totalRating += feedback.rating || 0
        acc[date].avgRating = Math.round((acc[date].totalRating / acc[date].count) * 100) / 100
        return acc
      }, {}),
    }

    return NextResponse.json({
      analytics,
      recentFeedback: processedFeedback.slice(0, 20),
    })
  } catch (error) {
    console.error("Feedback analysis error:", error)
    return NextResponse.json({ error: "Failed to fetch feedback analysis" }, { status: 500 })
  }
}

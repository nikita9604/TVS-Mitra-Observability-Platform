import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    console.log("[v0] Overview API - Fetching counts...")

    const [
      { count: totalApplications, error: appError }, 
      { count: totalSessions, error: sessError }, 
      { count: totalFeedback, error: feedError }, 
      { count: totalModels, error: modelError }
    ] = await Promise.all([
        supabase.from("loan_applications").select("*", { count: "exact", head: true }),
        supabase.from("user_sessions").select("*", { count: "exact", head: true }),
        supabase.from("customer_feedback").select("*", { count: "exact", head: true }),
        supabase.from("model_evaluation_metrics").select("*", { count: "exact", head: true }),
      ])
    
    console.log("[v0] Counts:", { totalApplications, totalSessions, totalFeedback, totalModels })
    console.log("[v0] Errors:", { appError, sessError, feedError, modelError })

    // Get comprehensive loan application metrics
    const { data: loanData } = await supabase
      .from("loan_applications")
      .select("is_approved, age, annual_salary, loan_amount")

    const approvalRate = loanData?.length
      ? (loanData.filter((app) => app.is_approved).length / loanData.length) * 100
      : 0

    const avgAge = loanData?.length ? loanData.reduce((sum, item) => sum + (item.age || 0), 0) / loanData.length : 0

    const avgLoanAmount = loanData?.length
      ? loanData.reduce((sum, item) => sum + (item.loan_amount || 0), 0) / loanData.length
      : 0

    const avgSalary = loanData?.length
      ? loanData.reduce((sum, item) => sum + (item.annual_salary || 0), 0) / loanData.length
      : 0

    // Get satisfaction metrics
    const { data: satisfactionData } = await supabase.from("customer_feedback").select("overall_satisfaction_rating")
    const avgSatisfaction = satisfactionData?.length
      ? satisfactionData.reduce((sum, item) => sum + (item.overall_satisfaction_rating || 0), 0) /
        satisfactionData.length
      : 0

    return NextResponse.json({
      // Counts
      totalApplications: totalApplications || 0,
      totalSessions: totalSessions || 0,
      totalFeedback: totalFeedback || 0,
      totalModels: totalModels || 0,

      // Percentages
      approvalRate: Math.round(approvalRate * 100) / 100,

      // Averages
      avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
      avgAge: Math.round(avgAge * 100) / 100,
      avgLoanAmount: Math.round(avgLoanAmount),
      avgSalary: Math.round(avgSalary),
    })
  } catch (error) {
    console.error("Analytics overview error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

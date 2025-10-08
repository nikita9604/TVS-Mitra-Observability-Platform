import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: loanData } = await supabase
      .from("loan_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000)

    if (!loanData) {
      return NextResponse.json({ error: "No loan data found" }, { status: 404 })
    }

    // Parse recommended models and extract insights
    const processedLoans = loanData.map((loan) => {
      let recommendedModels = []
      if (loan.recommended_models) {
        try {
          const models =
            typeof loan.recommended_models === "string" ? JSON.parse(loan.recommended_models) : loan.recommended_models

          if (Array.isArray(models)) {
            recommendedModels = models.map((model) => ({
              name: model.model_name || model.name,
              score: model.score || model.confidence,
              recommendation: model.recommendation || model.status,
            }))
          }
        } catch (e) {
          console.log("[v0] Error parsing recommended models:", e)
        }
      }

      return {
        id: loan.id,
        amount: loan.loan_amount,
        approvalProbability: Math.round((loan.approval_probability || 0) * 100),
        isApproved: loan.is_approved,
        state: loan.state,
        ageGroup: loan.age_bin,
        salaryTier: loan.salary_bin,
        ltvRatio: Math.round((loan.ltv_ratio || 0) * 100) / 100,
        finalTier: loan.final_tier,
        recommendedModels,
        createdAt: loan.created_at,
      }
    })

    // Calculate key insights
    const insights = {
      totalApplications: processedLoans.length,
      approvalRate: Math.round((processedLoans.filter((l) => l.isApproved).length / processedLoans.length) * 100),
      avgLoanAmount: Math.round(processedLoans.reduce((sum, l) => sum + (l.amount || 0), 0) / processedLoans.length),
      avgApprovalProbability: Math.round(
        processedLoans.reduce((sum, l) => sum + l.approvalProbability, 0) / processedLoans.length,
      ),

      // State-wise distribution
      stateDistribution: processedLoans.reduce((acc, loan) => {
        acc[loan.state] = (acc[loan.state] || 0) + 1
        return acc
      }, {}),

      // Tier analysis
      tierAnalysis: processedLoans.reduce((acc, loan) => {
        if (!acc[loan.finalTier]) {
          acc[loan.finalTier] = { count: 0, approvals: 0, avgAmount: 0, totalAmount: 0 }
        }
        acc[loan.finalTier].count++
        if (loan.isApproved) acc[loan.finalTier].approvals++
        acc[loan.finalTier].totalAmount += loan.amount || 0
        acc[loan.finalTier].avgAmount = Math.round(acc[loan.finalTier].totalAmount / acc[loan.finalTier].count)
        return acc
      }, {}),

      // Recent trends (last 30 days)
      recentTrends: processedLoans
        .filter((loan) => new Date(loan.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((acc, loan) => {
          const date = new Date(loan.createdAt).toISOString().split("T")[0]
          if (!acc[date]) {
            acc[date] = { applications: 0, approvals: 0, totalAmount: 0 }
          }
          acc[date].applications++
          if (loan.isApproved) acc[date].approvals++
          acc[date].totalAmount += loan.amount || 0
          return acc
        }, {}),
    }

    return NextResponse.json({
      insights,
      recentApplications: processedLoans.slice(0, 50), // Latest 50 for detailed view
    })
  } catch (error) {
    console.error("Loan insights error:", error)
    return NextResponse.json({ error: "Failed to fetch loan insights" }, { status: 500 })
  }
}

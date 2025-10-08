import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get loan applications by date
    const { data: loanTrends } = await supabase
      .from("loan_applications")
      .select("created_at, is_approved, loan_amount, approval_probability")
      .order("created_at", { ascending: true })

    // Group by date and calculate metrics
    const trendData =
      loanTrends?.reduce((acc: any[], app) => {
        const date = new Date(app.created_at).toISOString().split("T")[0]
        const existing = acc.find((item) => item.date === date)

        if (existing) {
          existing.applications += 1
          existing.approvals += app.is_approved ? 1 : 0
          existing.totalAmount += app.loan_amount || 0
          existing.avgProbability = (existing.avgProbability + (app.approval_probability || 0)) / 2
        } else {
          acc.push({
            date,
            applications: 1,
            approvals: app.is_approved ? 1 : 0,
            totalAmount: app.loan_amount || 0,
            avgProbability: app.approval_probability || 0,
          })
        }
        return acc
      }, []) || []

    // Calculate approval rates
    const processedData = trendData.map((item) => ({
      ...item,
      approvalRate: (item.approvals / item.applications) * 100,
      avgAmount: item.totalAmount / item.applications,
    }))

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Loan trends error:", error)
    return NextResponse.json({ error: "Failed to fetch loan trends" }, { status: 500 })
  }
}

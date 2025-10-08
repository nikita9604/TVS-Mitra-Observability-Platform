import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: applications } = await supabase.from("loan_applications").select(`
        age, state, qualification, employment_type, 
        is_approved, make_code, past_loans
      `)

    const totalApplications = applications?.length || 0

    const demographics = {
      ageDistribution: {},
      qualificationDistribution: {},
      employmentDistribution: {},
      pastLoansDistribution: {},
      approvalRatesByAge: {},
      approvalRatesByQualification: {},
    }

    let totalApproved = 0
    let totalAge = 0
    let ageCount = 0

    applications?.forEach((app) => {
      const isApproved = app.is_approved

      if (app.age) {
        totalAge += app.age
        ageCount++

        let ageBin = "Unknown"
        if (app.age >= 18 && app.age <= 25) ageBin = "18-25"
        else if (app.age >= 26 && app.age <= 35) ageBin = "26-35"
        else if (app.age >= 36 && app.age <= 45) ageBin = "36-45"
        else if (app.age >= 46 && app.age <= 55) ageBin = "46-55"
        else if (app.age >= 56 && app.age <= 60) ageBin = "56-60"

        demographics.ageDistribution[ageBin] = (demographics.ageDistribution[ageBin] || 0) + 1
        if (!demographics.approvalRatesByAge[ageBin]) {
          demographics.approvalRatesByAge[ageBin] = { total: 0, approved: 0 }
        }
        demographics.approvalRatesByAge[ageBin].total++
        if (isApproved) demographics.approvalRatesByAge[ageBin].approved++
      }

      if (app.qualification) {
        const qualMap = {
          HSC: "HSC",
          SSC: "SSC",
          UG: "UG",
          GRAD: "GRAD",
          PG: "PG",
          OTHERS: "OTHERS",
        }
        const mappedQual = qualMap[app.qualification] || app.qualification
        demographics.qualificationDistribution[mappedQual] =
          (demographics.qualificationDistribution[mappedQual] || 0) + 1

        if (!demographics.approvalRatesByQualification[mappedQual]) {
          demographics.approvalRatesByQualification[mappedQual] = { total: 0, approved: 0 }
        }
        demographics.approvalRatesByQualification[mappedQual].total++
        if (isApproved) demographics.approvalRatesByQualification[mappedQual].approved++
      }

      if (app.employment_type) {
        const empMap = {
          AGR: "Agriculture",
          SAL: "Salaried",
          SEP: "Self-Employed",
          STU: "Student",
          NPP: "Non-Profit",
          NREGI: "Not Registered",
          PEN: "Pensioner",
          NONEARNMEM: "Non-Earning",
          NA: "Not Available",
        }
        const mappedEmp = empMap[app.employment_type] || app.employment_type
        demographics.employmentDistribution[mappedEmp] = (demographics.employmentDistribution[mappedEmp] || 0) + 1
      }

      if (app.past_loans) {
        const loanMap = {
          PAST_LOANS_ACTIVE: "Has Past Loans",
          NO_PAST_LOANS: "No Past Loans",
        }
        const mappedLoan = loanMap[app.past_loans] || app.past_loans
        demographics.pastLoansDistribution[mappedLoan] = (demographics.pastLoansDistribution[mappedLoan] || 0) + 1
      }

      if (isApproved) totalApproved++
    })

    // Convert all distributions to percentage format
    const ageChartData = Object.entries(demographics.ageDistribution).map(([age, count]) => ({
      age,
      count: count as number,
      percentage: Number((((count as number) / totalApplications) * 100).toFixed(1)),
      approvalRate: demographics.approvalRatesByAge[age]
        ? Number(
            (
              (demographics.approvalRatesByAge[age].approved / demographics.approvalRatesByAge[age].total) *
              100
            ).toFixed(1),
          )
        : 0,
    }))

    const qualificationChartData = Object.entries(demographics.qualificationDistribution).map(([qual, count]) => ({
      qualification: qual,
      count: count as number,
      percentage: Number((((count as number) / totalApplications) * 100).toFixed(1)),
      approvalRate: demographics.approvalRatesByQualification[qual]
        ? Number(
            (
              (demographics.approvalRatesByQualification[qual].approved /
                demographics.approvalRatesByQualification[qual].total) *
              100
            ).toFixed(1),
          )
        : 0,
    }))

    const employmentChartData = Object.entries(demographics.employmentDistribution).map(([emp, count]) => ({
      employment: emp,
      count: count as number,
      percentage: Number((((count as number) / totalApplications) * 100).toFixed(1)),
    }))

    const pastLoansChartData = Object.entries(demographics.pastLoansDistribution).map(([loan, count]) => ({
      loanHistory: loan,
      count: count as number,
      percentage: Number((((count as number) / totalApplications) * 100).toFixed(1)),
    }))

    const avgAge = ageCount > 0 ? Number((totalAge / ageCount).toFixed(1)) : 0
    const overallApprovalRate = Number(((totalApproved / totalApplications) * 100).toFixed(1))

    return NextResponse.json({
      // Summary metrics
      summary: {
        totalApplications,
        totalApproved,
        overallApprovalRate,
        avgAge,
        topAgeGroup: ageChartData.sort((a, b) => b.count - a.count)[0]?.age || "N/A",
        topQualification: qualificationChartData.sort((a, b) => b.count - a.count)[0]?.qualification || "N/A",
        topEmployment: employmentChartData.sort((a, b) => b.count - a.count)[0]?.employment || "N/A",
      },

      // Chart data with percentages
      ageDistribution: ageChartData,
      qualificationDistribution: qualificationChartData,
      employmentDistribution: employmentChartData,
      pastLoansDistribution: pastLoansChartData,

      // Performance insights
      bestPerformingAge: ageChartData.sort((a, b) => b.approvalRate - a.approvalRate)[0]?.age || "N/A",
      bestPerformingQualification:
        qualificationChartData.sort((a, b) => b.approvalRate - a.approvalRate)[0]?.qualification || "N/A",
    })
  } catch (error) {
    console.error("Demographics error:", error)
    return NextResponse.json({ error: "Failed to fetch demographics" }, { status: 500 })
  }
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Pie, PieChart, Cell } from "recharts"

interface DemographicsProps {
  data: {
    ageDistribution: Array<{ age: string; count: number; percentage: number; approvalRate: number }>
    qualificationDistribution: Array<{ qualification: string; count: number; percentage: number; approvalRate: number }>
    employmentDistribution: Array<{ employment: string; count: number; percentage: number }>
    pastLoansDistribution: Array<{ loanHistory: string; count: number; percentage: number }>
    summary: {
      totalApplications: number
      totalApproved: number
      overallApprovalRate: number
      avgAge: number
      topAgeGroup: string
      topQualification: string
      topEmployment: string
      bestPerformingAge: string
      bestPerformingQualification: string
    }
  }
}

const COLORS = ["#0d4a85", "#108a43", "#2563eb", "#059669", "#1e40af", "#047857"]

export function DemographicsChart({ data }: DemographicsProps) {
  const safeData = {
    ageDistribution: data?.ageDistribution || [],
    qualificationDistribution: data?.qualificationDistribution || [],
    employmentDistribution: data?.employmentDistribution || [],
    pastLoansDistribution: data?.pastLoansDistribution || [],
    summary: {
      totalApplications: data?.summary?.totalApplications || 0,
      totalApproved: data?.summary?.totalApproved || 0,
      overallApprovalRate: data?.summary?.overallApprovalRate || 0,
      avgAge: data?.summary?.avgAge || 0,
      topAgeGroup: data?.summary?.topAgeGroup || "N/A",
      topQualification: data?.summary?.topQualification || "N/A",
      topEmployment: data?.summary?.topEmployment || "N/A",
      bestPerformingAge: data?.summary?.bestPerformingAge || "N/A",
      bestPerformingQualification: data?.summary?.bestPerformingQualification || "N/A",
    },
  }

  const ageData = safeData.ageDistribution.map((item) => ({
    name: item.age,
    value: item.count,
    percentage: item.percentage,
    approvalRate: item.approvalRate,
  }))

  const qualificationData = safeData.qualificationDistribution.map((item) => ({
    name: item.qualification,
    value: item.count,
    percentage: item.percentage,
    approvalRate: item.approvalRate,
  }))

  const employmentData = safeData.employmentDistribution.map((item) => ({
    name: item.employment,
    value: item.count,
    percentage: item.percentage,
  }))

  const pastLoansData = safeData.pastLoansDistribution.map((item) => ({
    name: item.loanHistory,
    value: item.count,
    percentage: item.percentage,
  }))

  const approvalByAgeData = safeData.ageDistribution.map((item) => ({
    name: item.age,
    rate: item.approvalRate,
    total: item.count,
    approved: Math.round((item.count * item.approvalRate) / 100),
  }))

  const approvalByQualificationData = safeData.qualificationDistribution.map((item) => ({
    name: item.qualification,
    rate: item.approvalRate,
    total: item.count,
    approved: Math.round((item.count * item.approvalRate) / 100),
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-[#0d4a85]">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#0d4a85]">
              {safeData.summary.totalApplications.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#108a43]">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#108a43]">{safeData.summary.overallApprovalRate}%</div>
            <p className="text-sm text-muted-foreground">Overall Approval Rate</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#0d4a85]">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#0d4a85]">{safeData.summary.avgAge}</div>
            <p className="text-sm text-muted-foreground">Average Age</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#108a43]">
          <CardContent className="p-4">
            <div className="text-lg font-bold text-[#108a43]">{safeData.summary.topEmployment}</div>
            <p className="text-sm text-muted-foreground">Top Employment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-l-4 border-l-[#0d4a85]">
          <CardHeader>
            <CardTitle className="text-[#0d4a85]">Age Distribution & Approval Rates</CardTitle>
            <CardDescription>Loan applicants by age group (18-60) with success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Count", color: "#0d4a85" },
                rate: { label: "Approval Rate", color: "#108a43" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={approvalByAgeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{label}</p>
                            <p className="text-[#0d4a85]">Applications: {data.total}</p>
                            <p className="text-[#108a43]">Approved: {data.approved}</p>
                            <p className="text-[#108a43]">Rate: {data.rate}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="rate" fill="#108a43" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#108a43]">
          <CardHeader>
            <CardTitle className="text-[#0d4a85]">Education Qualifications</CardTitle>
            <CardDescription>HSC, SSC, UG, GRAD, PG, OTHERS</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Count", color: "#0d4a85" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualificationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {qualificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-[#0d4a85]">Count: {data.value}</p>
                            <p className="text-[#108a43]">Percentage: {data.percentage}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0d4a85]">
          <CardHeader>
            <CardTitle className="text-[#0d4a85]">Approval by Qualification</CardTitle>
            <CardDescription>Success rates by education level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                rate: { label: "Approval Rate", color: "#108a43" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={approvalByQualificationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{label}</p>
                            <p className="text-[#0d4a85]">Applications: {data.total}</p>
                            <p className="text-[#108a43]">Approved: {data.approved}</p>
                            <p className="text-[#108a43]">Rate: {data.rate}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="rate" fill="#108a43" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0d4a85]">
          <CardHeader>
            <CardTitle className="text-[#0d4a85]">Past Loans Status</CardTitle>
            <CardDescription>Loan history distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Count", color: "#108a43" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pastLoansData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {pastLoansData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-[#0d4a85]">Count: {data.value}</p>
                            <p className="text-[#108a43]">Percentage: {data.percentage}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

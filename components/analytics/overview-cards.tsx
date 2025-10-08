"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Star, DollarSign } from "lucide-react"

interface OverviewData {
  totalApplications: number
  totalSessions: number
  totalFeedback: number
  totalModels: number
  approvalRate: number
  avgSatisfaction: number
  avgAge: number
  avgLoanAmount: number
  avgSalary: number
}

interface OverviewCardsProps {
  data: OverviewData
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const safeData = {
    totalApplications: data?.totalApplications || 0,
    totalSessions: data?.totalSessions || 0,
    totalFeedback: data?.totalFeedback || 0,
    totalModels: data?.totalModels || 0,
    approvalRate: data?.approvalRate || 0,
    avgSatisfaction: data?.avgSatisfaction || 0,
    avgAge: data?.avgAge || 0,
    avgLoanAmount: data?.avgLoanAmount || 0,
    avgSalary: data?.avgSalary || 0,
  }

  const cards = [
    {
      title: "Approval Rate",
      value: `${safeData.approvalRate}%`,
      icon: CheckCircle,
      description: "Applications approved",
      color: "#108A43",
    },
    {
      title: "Customer Satisfaction",
      value: `${safeData.avgSatisfaction}/5`,
      icon: Star,
      description: "Average satisfaction rating",
      color: "#108A43",
    },
    {
      title: "Total Applications",
      value: safeData.totalApplications.toLocaleString(),
      icon: Users,
      description: "Loan applications processed",
      color: "#0D4A85",
    },
    {
      title: "Average Age",
      value: `${Math.round(safeData.avgAge)} years`,
      icon: Users,
      description: "Average applicant age",
      color: "#0D4A85",
    },
    {
      title: "Average Loan Amount",
      value: `₹${(safeData.avgLoanAmount / 100000).toFixed(1)}L`,
      icon: DollarSign,
      description: "Average loan requested",
      color: "#108A43",
    },
    {
      title: "Average Salary",
      value: `₹${(safeData.avgSalary / 100000).toFixed(1)}L`,
      icon: DollarSign,
      description: "Average applicant salary",
      color: "#0D4A85",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: card.color }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4" style={{ color: card.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

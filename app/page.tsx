"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCards } from "@/components/analytics/overview-cards"
import { LoanTrendsChart } from "@/components/analytics/loan-trends-chart"
import { ModelPerformanceChart } from "@/components/analytics/model-performance-chart"
import { DemographicsChart } from "@/components/analytics/demographics-chart"
import { CustomerSatisfaction } from "@/components/analytics/customer-satisfaction"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Activity, BarChart3, Brain, Users, Heart } from "lucide-react"

export default function ObservabilityDashboard() {
  const [overviewData, setOverviewData] = useState(null)
  const [loanTrends, setLoanTrends] = useState([])
  const [modelPerformance, setModelPerformance] = useState([])
  const [demographics, setDemographics] = useState(null)
  const [customerSatisfaction, setCustomerSatisfaction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, trendsRes, modelRes, demoRes, satisfactionRes] = await Promise.all([
          fetch("/api/analytics/overview"),
          fetch("/api/analytics/loan-trends"),
          fetch("/api/analytics/model-performance"),
          fetch("/api/analytics/demographics"),
          fetch("/api/analytics/customer-satisfaction"),
        ])

        const [overview, trends, models, demo, satisfaction] = await Promise.all([
          overviewRes.json(),
          trendsRes.json(),
          modelRes.json(),
          demoRes.json(),
          satisfactionRes.json(),
        ])

        setOverviewData(overview)
        setLoanTrends(trends)
        setModelPerformance(models)
        setDemographics(demo)
        setCustomerSatisfaction(satisfaction)
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">TVS Mitra Observability</h1>
            <p className="text-muted-foreground">Real-time analytics and monitoring dashboard</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 border-secondary text-secondary">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            Live Data
          </Badge>
        </div>

        {/* Overview Cards */}
        {overviewData && <OverviewCards data={overviewData} />}

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="satisfaction" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="satisfaction" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Satisfaction
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Loan Trends
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              ML Models
            </TabsTrigger>
            <TabsTrigger value="demographics" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Demographics
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="satisfaction" className="space-y-4">
            {customerSatisfaction && <CustomerSatisfaction data={customerSatisfaction} />}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {loanTrends.length > 0 && <LoanTrendsChart data={loanTrends} />}
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            {modelPerformance.length > 0 && <ModelPerformanceChart data={modelPerformance} />}
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4">
            {demographics && <DemographicsChart data={demographics} />}
          </TabsContent>

          <TabsContent value="realtime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Real-time Monitoring</CardTitle>
                <CardDescription>Live system metrics and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Status</p>
                      <p className="text-2xl font-bold text-secondary">Healthy</p>
                    </div>
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                      <p className="text-2xl font-bold text-primary">{overviewData?.totalSessions || 0}</p>
                    </div>
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                      <p className="text-2xl font-bold text-secondary">142ms</p>
                    </div>
                    <div className="w-3 h-3 bg-secondary rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

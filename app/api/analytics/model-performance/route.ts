import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: modelMetrics } = await supabase
      .from("model_evaluation_metrics")
      .select("*")
      .order("training_date", { ascending: false })

    // Process model performance data
    const performanceData =
      modelMetrics?.map((model) => {
        // Parse feature importance JSON to get top features
        let topFeatures = []
        if (model.feature_importance) {
          try {
            const featureImportance =
              typeof model.feature_importance === "string"
                ? JSON.parse(model.feature_importance)
                : model.feature_importance

            // Extract top 5 most important features
            if (Array.isArray(featureImportance)) {
              topFeatures = featureImportance
                .sort((a, b) => (b.importance || 0) - (a.importance || 0))
                .slice(0, 5)
                .map((f) => ({ name: f.feature || f.name, importance: f.importance || f.value }))
            } else if (typeof featureImportance === "object") {
              topFeatures = Object.entries(featureImportance)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, importance]) => ({ name, importance }))
            }
          } catch (e) {
            console.log("[v0] Error parsing feature importance:", e)
          }
        }

        // Parse model parameters for key settings
        let keyParameters = {}
        if (model.model_parameters) {
          try {
            const params =
              typeof model.model_parameters === "string" ? JSON.parse(model.model_parameters) : model.model_parameters

            // Extract only relevant parameters
            keyParameters = {
              algorithm: params.algorithm || params.model_type || "Unknown",
              learningRate: params.learning_rate || params.lr,
              maxDepth: params.max_depth,
              nEstimators: params.n_estimators || params.num_trees,
              regularization: params.regularization || params.alpha,
            }
          } catch (e) {
            console.log("[v0] Error parsing model parameters:", e)
          }
        }

        return {
          version: model.model_version,
          accuracy: Math.round((model.accuracy || 0) * 10000) / 100, // Convert to percentage
          precision: Math.round((model.precision_score || 0) * 10000) / 100,
          recall: Math.round((model.recall || 0) * 10000) / 100,
          f1Score: Math.round((model.f1_score || 0) * 10000) / 100,
          rocAuc: Math.round((model.roc_auc || 0) * 10000) / 100,
          giniCoeff: Math.round((model.gini_coefficient || 0) * 10000) / 100,
          trainingDate: model.training_date,
          featureCount: model.feature_count,
          dataSize: model.training_data_size,
          topFeatures,
          keyParameters,
        }
      }) || []

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error("Model performance error:", error)
    return NextResponse.json({ error: "Failed to fetch model performance" }, { status: 500 })
  }
}

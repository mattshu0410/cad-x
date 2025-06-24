"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useFormStore } from "@/lib/stores/formStore";
import { PercentileThresholds } from "@/types/settings";

export function ThresholdSelector() {
  const { settings, setPercentileThresholds } = useSettingsStore();
  const { nextStep, completeStep, previousStep } = useFormStore();

  const [thresholds, setThresholds] = useState<PercentileThresholds>(
    settings.percentileThresholds
  );

  const [errors, setErrors] = useState<Partial<PercentileThresholds>>({});

  const validateThresholds = useCallback(() => {
    const newErrors: Partial<PercentileThresholds> = {};

    // Check ranges (0-100)
    if (thresholds.resilient < 0 || thresholds.resilient > 100) {
      newErrors.resilient = 0;
    }
    if (thresholds.reference_low < 0 || thresholds.reference_low > 100) {
      newErrors.reference_low = 0;
    }
    if (thresholds.reference_high < 0 || thresholds.reference_high > 100) {
      newErrors.reference_high = 0;
    }
    if (thresholds.susceptible < 0 || thresholds.susceptible > 100) {
      newErrors.susceptible = 0;
    }

    // Check required ordering: resilient < reference_low < reference_high < susceptible
    if (thresholds.reference_low < thresholds.resilient) {
      newErrors.reference_low = thresholds.resilient + 1;
    }
    if (thresholds.reference_high <= thresholds.reference_low) {
      newErrors.reference_high = thresholds.reference_low + 1;
    }
    if (thresholds.susceptible < thresholds.reference_high) {
      newErrors.susceptible = thresholds.reference_high + 1;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [thresholds]);

  useEffect(() => {
    validateThresholds();
  }, [thresholds, validateThresholds]);

  const handleThresholdChange = (
    key: keyof PercentileThresholds,
    value: number
  ) => {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (validateThresholds()) {
      setPercentileThresholds(thresholds);
      completeStep(5);
      nextStep();
    }
  };

  const isValid = Object.keys(errors).length === 0;

  const getVisualizationData = () => {
    const segments = [
      {
        label: "Resilient",
        value: thresholds.resilient,
        color: "bg-green-500",
      },
      {
        label: "Other",
        value: thresholds.reference_low - thresholds.resilient,
        color: "bg-gray-400",
      },
      {
        label: "Reference",
        value: thresholds.reference_high - thresholds.reference_low,
        color: "bg-blue-500",
      },
      {
        label: "Other",
        value: thresholds.susceptible - thresholds.reference_high,
        color: "bg-gray-400",
      },
      {
        label: "Susceptible",
        value: 100 - thresholds.susceptible,
        color: "bg-red-500",
      },
    ];
    return segments;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Set Classification Thresholds</CardTitle>
          <CardDescription>
            Define percentile cutoffs for classifying subjects as resilient,
            reference, or susceptible
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Threshold Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Percentile Thresholds</CardTitle>
          <CardDescription>
            Set the percentile boundaries for each classification group
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Resilient Threshold */}
          <div className="space-y-4">
            <Label className="text-lg font-medium text-green-700">
              Resilient (Bottom Percentile)
            </Label>
            <p className="text-sm text-muted-foreground">
              Subjects with the lowest CACS relative to their predicted risk
            </p>
            <div className="flex items-center space-x-4">
              <Label className="text-sm w-8">0%</Label>
              <Slider
                value={[thresholds.resilient]}
                onValueChange={(value) =>
                  handleThresholdChange("resilient", value[0])
                }
                max={100}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={thresholds.resilient}
                onChange={(e) =>
                  handleThresholdChange(
                    "resilient",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-20"
                min={0}
                max={100}
              />
              <Label className="text-sm">%</Label>
            </div>
            {errors.resilient && (
              <p className="text-sm text-red-600">Must be between 0-100</p>
            )}
          </div>

          {/* Reference Range */}
          <div className="space-y-4">
            <Label className="text-lg font-medium text-blue-700">
              Reference Range
            </Label>
            <p className="text-sm text-muted-foreground">
              Subjects with typical CACS relative to their predicted risk
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm">Reference Low</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={thresholds.reference_low}
                    onChange={(e) =>
                      handleThresholdChange(
                        "reference_low",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-20"
                    min={0}
                    max={100}
                  />
                  <Label className="text-sm">%</Label>
                </div>
                {errors.reference_low && (
                  <p className="text-sm text-red-600">
                    Must be greater than resilient threshold
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Reference High</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={thresholds.reference_high}
                    onChange={(e) =>
                      handleThresholdChange(
                        "reference_high",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-20"
                    min={0}
                    max={100}
                  />
                  <Label className="text-sm">%</Label>
                </div>
                {errors.reference_high && (
                  <p className="text-sm text-red-600">
                    Must be greater than reference low and less than susceptible
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Susceptible Threshold */}
          <div className="space-y-4">
            <Label className="text-lg font-medium text-red-700">
              Susceptible (Top Percentile)
            </Label>
            <p className="text-sm text-muted-foreground">
              Subjects with the highest CACS relative to their predicted risk
            </p>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={thresholds.susceptible}
                onChange={(e) =>
                  handleThresholdChange(
                    "susceptible",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-20"
                min={0}
                max={100}
              />
              <Label className="text-sm">%</Label>
              <Slider
                value={[thresholds.susceptible]}
                onValueChange={(value) =>
                  handleThresholdChange("susceptible", value[0])
                }
                max={100}
                step={1}
                className="flex-1"
              />
              <Label className="text-sm w-12">100%</Label>
            </div>
            {errors.susceptible && (
              <p className="text-sm text-red-600">
                Must be greater than reference high threshold
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Classification Preview</CardTitle>
          <CardDescription>
            Visual representation of how subjects will be classified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative h-12 rounded-lg overflow-hidden border">
              {getVisualizationData().map((segment, index) => {
                let leftPosition = 0;
                if (index === 0) leftPosition = 0; // Resilient starts at 0
                else if (index === 1) leftPosition = thresholds.resilient;
                // First Other starts after Resilient
                else if (index === 2) leftPosition = thresholds.reference_low;
                // Reference starts at reference_low
                else if (index === 3) leftPosition = thresholds.reference_high;
                // Second Other starts after Reference
                else leftPosition = thresholds.susceptible; // Susceptible starts at susceptible threshold

                return (
                  <div
                    key={index}
                    className={`absolute top-0 h-full ${segment.color} opacity-80`}
                    style={{
                      left: `${leftPosition}%`,
                      width: `${segment.value}%`,
                    }}
                  >
                    <div className="flex items-center justify-center h-full text-white text-sm font-medium">
                      {segment.value > 10 ? segment.label : ""}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>{thresholds.resilient}%</span>
              <span>{thresholds.reference_low}%</span>
              <span>{thresholds.reference_high}%</span>
              <span>{thresholds.susceptible}%</span>
              <span>100%</span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="w-4 h-4 bg-green-500 mx-auto rounded mb-1"></div>
                <div>Resilient</div>
                <div className="text-muted-foreground">
                  {thresholds.resilient}%
                </div>
              </div>
              <div>
                <div className="w-4 h-4 bg-blue-500 mx-auto rounded mb-1"></div>
                <div>Reference</div>
                <div className="text-muted-foreground">
                  {thresholds.reference_high - thresholds.reference_low}%
                </div>
              </div>
              <div>
                <div className="w-4 h-4 bg-gray-400 mx-auto rounded mb-1"></div>
                <div>Other</div>
                <div className="text-muted-foreground">
                  {thresholds.reference_low -
                    thresholds.resilient +
                    (thresholds.susceptible - thresholds.reference_high)}
                  %
                </div>
              </div>
              <div>
                <div className="w-4 h-4 bg-red-500 mx-auto rounded mb-1"></div>
                <div>Susceptible</div>
                <div className="text-muted-foreground">
                  {100 - thresholds.susceptible}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Threshold Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Lower resilient percentiles identify more extreme phenotypes
            </li>
            <li>• Ensure adequate sample sizes in each classification group</li>
            <li>• Consider your research question when setting thresholds</li>
            <li>• Default values (20%, 40%, 60%, 80%) are commonly used</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep}>
          ← Previous
        </Button>
        <Button type="button" onClick={handleNext} disabled={!isValid}>
          Calculate Results →
        </Button>
      </div>
    </div>
  );
}

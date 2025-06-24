'use client';

import type { AnalysisSettings, RiskRegion, RiskScore } from '@/types/settings';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useDataStore } from '@/lib/stores/dataStore';
import { useFormStore } from '@/lib/stores/formStore';
import { useSettingsStore } from '@/lib/stores/settingsStore';

const settingsSchema = z.object({
  riskScores: z
    .array(z.enum(['frs', 'ascvd', 'mesa', 'score2']))
    .min(1, 'Select at least one risk score'),
  riskRegion: z.enum(['Low', 'Moderate', 'High', 'Very High']),
  minScores: z.number().min(1).max(4),
  cholesterolUnit: z.enum(['mmol/L', 'mg/dL']),
  percentileThresholds: z.object({
    resilient: z.number(),
    reference_low: z.number(),
    reference_high: z.number(),
    susceptible: z.number(),
  }),
});

const riskScoreOptions = [
  {
    id: 'frs' as RiskScore,
    label: 'Framingham Risk Score (FRS)',
    description: 'Age range: 30-74 years',
  },
  {
    id: 'ascvd' as RiskScore,
    label: 'ACC/AHA ASCVD',
    description: 'Age range: 20-79 years, requires ethnicity',
  },
  {
    id: 'mesa' as RiskScore,
    label: 'MESA',
    description: 'Age range: 45-85 years, requires ethnicity',
  },
  {
    id: 'score2' as RiskScore,
    label: 'SCORE2',
    description: 'Age range: 40-75 years, region-specific',
  },
];

const riskRegionOptions = [
  {
    value: 'Low' as RiskRegion,
    label: 'Low Risk',
    description: 'Low cardiovascular risk region',
  },
  {
    value: 'Moderate' as RiskRegion,
    label: 'Moderate Risk',
    description: 'Moderate cardiovascular risk region',
  },
  {
    value: 'High' as RiskRegion,
    label: 'High Risk',
    description: 'High cardiovascular risk region',
  },
  {
    value: 'Very High' as RiskRegion,
    label: 'Very High Risk',
    description: 'Very high cardiovascular risk region',
  },
];

export function SettingsForm() {
  const { settings, updateSettings } = useSettingsStore();
  const { nextStep, completeStep, previousStep, setCurrentStep }
    = useFormStore();
  const { hasEthnicityColumn } = useDataStore();

  const form = useForm<AnalysisSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const watchedRiskScores = form.watch('riskScores');
  const watchedMinScores = form.watch('minScores');

  const onSubmit = (data: AnalysisSettings) => {
    updateSettings(data);
    completeStep(4);
    nextStep();
  };

  const handleRiskScoreChange = (riskScore: RiskScore, checked: boolean) => {
    const currentScores = form.getValues('riskScores');
    if (checked) {
      form.setValue('riskScores', [...currentScores, riskScore]);
    } else {
      form.setValue(
        'riskScores',
        currentScores.filter(score => score !== riskScore),
      );
    }
  };

  const handlePreviousStep = () => {
    if (hasEthnicityColumn) {
      // If ethnicity column exists, go back to step 3 (EthnicityGrid)
      previousStep();
    } else {
      // If no ethnicity column, skip step 3 and go back to step 2 (ColumnMapper)
      setCurrentStep(2);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Analysis Settings</CardTitle>
          <CardDescription>
            Select which risk scores to calculate and configure analysis
            parameters
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Risk Scores Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Scores to Calculate</CardTitle>
              <CardDescription>
                Select one or more cardiovascular risk scores for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="riskScores"
                render={() => (
                  <FormItem>
                    <div className="space-y-4">
                      {riskScoreOptions.map((option) => {
                        const requiresEthnicity
                          = option.id === 'ascvd' || option.id === 'mesa';
                        const isDisabled
                          = requiresEthnicity && !hasEthnicityColumn;

                        return (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="riskScores"
                            render={({ field }) => (
                              <FormItem
                                className={`flex flex-row items-start space-x-3 space-y-0 ${isDisabled ? 'opacity-50' : ''}`}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    disabled={isDisabled}
                                    onCheckedChange={checked =>
                                      handleRiskScoreChange(
                                        option.id,
                                        checked as boolean,
                                      )}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel
                                    className={`text-sm font-medium ${isDisabled ? 'text-muted-foreground' : ''}`}
                                  >
                                    {option.label}
                                    {isDisabled && ' (requires ethnicity)'}
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    {option.description}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SCORE2 Risk Region */}
          {watchedRiskScores?.includes('score2') && (
            <Card>
              <CardHeader>
                <CardTitle>SCORE2 Risk Region</CardTitle>
                <CardDescription>
                  Select the cardiovascular risk region for SCORE2 calculation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="riskRegion"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          {riskRegionOptions.map(option => (
                            <div
                              key={option.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                              />
                              <Label htmlFor={option.value} className="text-sm">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Cholesterol Unit */}
          <Card>
            <CardHeader>
              <CardTitle>Cholesterol Unit in Your Data</CardTitle>
              <CardDescription>
                Specify the unit used for cholesterol measurements in your
                dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="cholesterolUnit"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mmol/L" id="mmol" />
                          <Label htmlFor="mmol">mmol/L</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mg/dL" id="mgdl" />
                          <Label htmlFor="mgdl">mg/dL</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Minimum Valid Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Minimum Valid Scores Required</CardTitle>
              <CardDescription>
                Minimum number of risk scores required per subject for inclusion
                in analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="minScores"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Label className="text-sm font-medium w-4">1</Label>
                        <FormControl>
                          <Slider
                            min={1}
                            max={4}
                            step={1}
                            value={[field.value]}
                            onValueChange={value => field.onChange(value[0])}
                            className="flex-1"
                          />
                        </FormControl>
                        <Label className="text-sm font-medium w-4">4</Label>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-medium">
                          {watchedMinScores}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          score
                          {watchedMinScores !== 1 ? 's' : ''}
                          {' '}
                          required
                        </span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
            >
              ← Previous
            </Button>
            <Button type="submit">Next →</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

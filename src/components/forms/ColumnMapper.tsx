'use client';

import type { ColumnMapping } from '@/types/data';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDataStore } from '@/lib/stores/dataStore';
import { useFormStore } from '@/lib/stores/formStore';
import {
  columnMappingSchema,
  optionalFields,
  requiredFields,
} from '@/lib/validation/schemas';

export function ColumnMapper() {
  const {
    uploadedFile,
    columnMappings,
    setColumnMappings,
    autoSuggestionsApplied,
    setAutoSuggestionsApplied,
    hasHeaders,
  } = useDataStore();
  const { nextStep, completeStep } = useFormStore();

  const form = useForm<ColumnMapping>({
    resolver: zodResolver(columnMappingSchema),
    defaultValues: columnMappings || {},
    shouldUnregister: false,
  });

  const getAutoSuggestedColumn = useCallback(
    (fieldKey: string) => {
      const suggestions = {
        cacs: ['cacs', 'cac', 'calcium', 'score'],
        age: ['age', 'years'],
        gender: ['gender', 'sex', 'male', 'female'],
        total_cholesterol: [
          'total_chol',
          'tc',
          'cholesterol',
          'total_cholesterol',
        ],
        hdl_cholesterol: ['hdl', 'hdl_chol', 'hdl_cholesterol'],
        systolic_bp: ['sbp', 'systolic', 'sys_bp', 'systolic_bp'],
        smoking_status: ['smoking', 'smoker', 'smoke'],
        diabetes_status: ['diabetes', 'dm', 'diabetic'],
        bp_medication: ['bp_med', 'bp_medication', 'antihypertensive'],
      };

      const keywords = suggestions[fieldKey as keyof typeof suggestions] || [];
      return uploadedFile?.columns.find(col =>
        keywords.some(keyword =>
          col.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );
    },
    [uploadedFile],
  );

  // Auto-populate form with suggested values when component mounts (only if data has headers)
  useEffect(() => {
    if (uploadedFile && !autoSuggestionsApplied && hasHeaders) {
      const allFields = [...requiredFields, ...optionalFields];
      const suggestedMappings: Partial<ColumnMapping> = {};
      allFields.forEach((field) => {
        const suggested = getAutoSuggestedColumn(field.key);
        if (suggested) {
          suggestedMappings[field.key as keyof ColumnMapping] = suggested;
        } else {
          suggestedMappings[field.key as keyof ColumnMapping] = '';
        }
      });

      // Only proceed if we have suggestions
      if (Object.keys(suggestedMappings).length > 0) {
        // Set the suggested values in the form
        setTimeout(() => {
          Object.entries(suggestedMappings).forEach(([key, value]) => {
            form.setValue(key as keyof ColumnMapping, String(value), {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: false,
            });
          });
        }, 0);

        // Merge with existing empty mappings to ensure all fields are present
        const completeMapping = { ...columnMappings, ...suggestedMappings };
        setColumnMappings(completeMapping);
        setAutoSuggestionsApplied(true);
      }
    }

    // If no headers, just mark auto-suggestions as applied to avoid re-running
    if (uploadedFile && !autoSuggestionsApplied && !hasHeaders) {
      setAutoSuggestionsApplied(true);
    }
  }, [
    uploadedFile,
    autoSuggestionsApplied,
    getAutoSuggestedColumn,
    setColumnMappings,
    setAutoSuggestionsApplied,
    hasHeaders,
  ]);

  // Watch form changes and auto-save to store
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Only save if we have some mappings
      if (
        value
        && Object.keys(value).some(key => value[key as keyof ColumnMapping])
      ) {
        setColumnMappings(value as ColumnMapping);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setColumnMappings]);

  if (!uploadedFile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No file uploaded. Please go back and upload a file first.
        </p>
      </div>
    );
  }

  const onSubmit = (data: ColumnMapping) => {
    console.warn('onSubmit called with data:', data);
    setColumnMappings(data);
    console.warn('About to call completeStep(2)');
    completeStep(2);
    console.warn('About to call nextStep()');
    nextStep();
    console.warn('onSubmit finished');
  };

  const getFieldStatus = (fieldKey: string) => {
    const value = form.watch(fieldKey as keyof ColumnMapping);
    if (!value || value === '') {
      return 'unmapped';
    }
    return 'mapped';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* File Info */}
      <Card>
        <CardHeader>
          <CardTitle>Map Your Data Columns</CardTitle>
          <CardDescription>
            Map columns from
            {' '}
            {uploadedFile.name}
            {' '}
            to required risk factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>
              File:
              {uploadedFile.name}
            </span>
            <span>•</span>
            <span>
              {uploadedFile.columns.length}
              {' '}
              columns
            </span>
            <span>•</span>
            <span>
              {(uploadedFile.size / 1024 / 1024).toFixed(1)}
              {' '}
              MB
            </span>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Required Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Required Fields</span>
                <Badge variant="destructive">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredFields.map((field) => {
                const status = getFieldStatus(field.key);
                const suggested = hasHeaders ? getAutoSuggestedColumn(field.key) : null;

                return (
                  <FormField
                    key={field.key}
                    control={form.control}
                    name={field.key as keyof ColumnMapping}
                    render={({ field: formField }) => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="space-y-1">
                            <FormLabel className="flex items-center space-x-2">
                              <span>{field.label}</span>
                              {status === 'mapped' && (
                                <Badge variant="default" className="text-xs">
                                  ✓
                                </Badge>
                              )}
                              {status === 'unmapped' && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  ⚠️
                                </Badge>
                              )}
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              {field.description}
                            </p>
                          </div>

                          <FormControl>
                            <Select
                              onValueChange={formField.onChange}
                              value={formField.value || ''}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select column" />
                              </SelectTrigger>
                              <SelectContent>
                                {uploadedFile.columns.map(column => (
                                  <SelectItem key={column} value={column}>
                                    {column}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>

                          <div className="text-xs space-y-1">
                            {suggested && (
                              <div className="text-muted-foreground">
                                {formField.value === suggested
                                  ? (
                                      <span className="text-green-600 font-medium">
                                        ✓ Auto-selected:
                                        {' '}
                                        {suggested}
                                      </span>
                                    )
                                  : (
                                      <span>
                                        Suggested:
                                        {suggested}
                                      </span>
                                    )}
                              </div>
                            )}
                            {formField.value && uploadedFile?.preview?.[0] && (
                              <div className="text-muted-foreground">
                                <span className="font-medium">Example: </span>
                                <span className="bg-muted px-1 py-0.5 rounded text-xs">
                                  {uploadedFile.preview[0][formField.value] != null ? String(uploadedFile.preview[0][formField.value]) : 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </CardContent>
          </Card>

          {/* Optional Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Optional Fields</span>
                <Badge variant="secondary">Optional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionalFields.map((field) => {
                const status = getFieldStatus(field.key);
                const suggested = hasHeaders ? getAutoSuggestedColumn(field.key) : null;

                return (
                  <FormField
                    key={field.key}
                    control={form.control}
                    name={field.key as keyof ColumnMapping}
                    render={({ field: formField }) => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="space-y-1">
                            <FormLabel className="flex items-center space-x-2">
                              <span>{field.label}</span>
                              {status === 'mapped' && (
                                <Badge variant="default" className="text-xs">
                                  ✓
                                </Badge>
                              )}
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              {field.description}
                            </p>
                          </div>

                          <FormControl>
                            <Select
                              onValueChange={formField.onChange}
                              value={formField.value || ''}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select column (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                {uploadedFile.columns.map(column => (
                                  <SelectItem key={column} value={column}>
                                    {column}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>

                          <div className="text-xs space-y-1">
                            {suggested && (
                              <div className="text-muted-foreground">
                                {formField.value === suggested
                                  ? (
                                      <span className="text-green-600 font-medium">
                                        ✓ Auto-selected:
                                        {' '}
                                        {suggested}
                                      </span>
                                    )
                                  : (
                                      <span>
                                        Suggested:
                                        {suggested}
                                      </span>
                                    )}
                              </div>
                            )}
                            {formField.value && uploadedFile?.preview?.[0] && (
                              <div className="text-muted-foreground">
                                <span className="font-medium">Example: </span>
                                <span className="bg-muted px-1 py-0.5 rounded text-xs">
                                  {uploadedFile.preview[0][formField.value] != null ? String(uploadedFile.preview[0][formField.value]) : 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
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

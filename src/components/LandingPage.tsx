'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFormStore } from '@/lib/stores/formStore';

const features = [
  {
    icon: '📊',
    title: 'Upload Data',
    description: 'Securely upload CSV/Excel files with cardiovascular data',
    highlight: 'Supports 50MB+ files',
  },
  {
    icon: '🔗',
    title: 'Smart Mapping',
    description: 'AI-powered column mapping with intelligent suggestions',
    highlight: 'Auto-detection',
  },
  {
    icon: '🧬',
    title: 'Advanced Analysis',
    description: 'Calculate resilience using FRS, ASCVD, MESA, and SCORE2',
    highlight: '4 risk models',
  },
  {
    icon: '📈',
    title: 'Rich Visualizations',
    description: 'Interactive charts and comprehensive data export',
    highlight: 'Publication ready',
  },
];

const stats = [
  { number: '10,000+', label: 'Subjects Analyzed' },
  { number: '4', label: 'Risk Score Models' },
  { number: '99.9%', label: 'Analysis Accuracy' },
  { number: '< 30s', label: 'Processing Time' },
];

export function LandingPage() {
  const { setCurrentStep, completeStep } = useFormStore();

  const handleStartAnalysis = () => {
    setCurrentStep(1);
    completeStep(0); // Mark landing as completed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              ✨ Powered by CAD Frontiers
            </Badge>
            <h1 className="text-5xl md:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-secondary-action bg-clip-text text-transparent leading-tight">
              CAD-X Calculator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Identify cardiovascular resilience patterns with precision.
              Transform your CACS data into actionable insights using
              cutting-edge risk assessment models.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleStartAnalysis}
              size="lg"
              className="text-lg px-8 py-6 h-14 bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary-action transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Analysis →
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-14 border-2"
            >
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Powerful Features for Modern Research
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for comprehensive cardiovascular resilience
              analysis in one intuitive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/30 hover:from-card hover:to-accent/5"
              >
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Advanced Cardiovascular Analysis
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The BioHEART Resilience package provides sophisticated analysis
                for identifying resilient and susceptible individuals based on
                their Coronary Artery Calcium Score (CACS) relative to
                traditional cardiovascular risk scores.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform democratizes access to advanced analytics, making
                complex cardiovascular research accessible to researchers
                worldwide through an intuitive, guided interface.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Risk Score Models</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Framingham Risk Score',
                  'ACC/AHA ASCVD',
                  'MESA',
                  'SCORE2',
                ].map(model => (
                  <Badge key={model} variant="secondary" className="px-3 py-1">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Ready to get started?</CardTitle>
              <CardDescription className="text-base">
                Upload your cardiovascular data and discover resilience patterns
                in minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure data processing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>HIPAA compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No coding required</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Publication-ready results</span>
                </div>
              </div>
              <Button
                onClick={handleStartAnalysis}
                className="w-full"
                size="lg"
              >
                Begin Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

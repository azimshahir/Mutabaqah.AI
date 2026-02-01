import Link from 'next/link';
import { ArrowRight, Shield, Activity, FileCheck, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Mutabaqah.ai</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-green-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition">How it Works</a>
            <a href="#compliance" className="text-gray-600 hover:text-green-600 transition">Compliance</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Shariah Compliant Trading Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Shariah
            <span className="text-green-600"> Compliance</span> for
            <span className="text-green-600"> Tawarruq</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Automate your commodity trading compliance with real-time audit trails,
            certificate verification, and AI-powered Shariah analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete Compliance Solution
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to ensure your Tawarruq transactions meet Shariah standards
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Activity className="h-8 w-8 text-green-600" />}
            title="Real-time Monitoring"
            description="Track every transaction through T0, T1, T2 stages with live status updates"
          />
          <FeatureCard
            icon={<FileCheck className="h-8 w-8 text-green-600" />}
            title="Certificate Verification"
            description="Automated certificate generation from Bursa Malaysia for each stage"
          />
          <FeatureCard
            icon={<Bot className="h-8 w-8 text-green-600" />}
            title="AI Shariah Audit"
            description="Intelligent compliance scoring and recommendations powered by AI"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-green-600" />}
            title="Violation Detection"
            description="Automatic flagging of non-compliant transactions with detailed reports"
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tawarruq Process Flow
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our system monitors each stage of the commodity trading process
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <StageCard
                stage="T0"
                title="Wakalah Agreement"
                description="Principal appoints agent to purchase commodity on their behalf"
                status="Certificate Issued"
              />
              <StageCard
                stage="T1"
                title="Qabd (Purchase)"
                description="Agent purchases commodity from Bursa Malaysia"
                status="Asset Verified"
              />
              <StageCard
                stage="T2"
                title="Liquidate"
                description="Commodity sold via Murabahah to complete Tawarruq"
                status="Transaction Complete"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-green-600 rounded-2xl p-8 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ensure Shariah Compliance?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join financial institutions using Mutabaqah.ai for automated Shariah compliance monitoring
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="font-bold text-gray-900">Mutabaqah.ai</span>
            </div>
            <p className="text-gray-600 text-sm">
              2025 Mutabaqah.ai. Shariah Compliant Commodity Trading Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StageCard({ stage, title, description, status }: { stage: string; title: string; description: string; status: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 font-bold text-lg mb-4">
        {stage}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        {status}
      </div>
    </div>
  );
}

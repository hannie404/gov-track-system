import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, FileText, DollarSign, Zap, CheckCircle, Users, ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header Navigation */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                BuildTrack-LGU
              </h1>
              <p className="text-xs text-muted-foreground">Project Governance Platform</p>
            </div>
          </div>
          <nav className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="hover:bg-purple-50 dark:hover:bg-purple-950/30">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/20">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 border border-purple-200/50 dark:border-purple-800/50 mb-6">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Trusted by Local Government Units
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-foreground">Your LGU Projects</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              End-to-end digital platform for managing local government projects with complete 
              <span className="text-purple-600 dark:text-purple-400 font-semibold"> transparency</span>, 
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> accountability</span>, and 
              <span className="text-pink-600 dark:text-pink-400 font-semibold"> efficiency</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/projects">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-purple-500/30 text-lg px-8 group">
                  Explore Public Projects
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-lg px-8 border-2 hover:bg-purple-50 dark:hover:bg-purple-950/20">
                  Access Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">9</div>
                <div className="text-sm text-muted-foreground mt-1">User Roles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">100%</div>
                <div className="text-sm text-muted-foreground mt-1">Transparent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-muted-foreground mt-1">Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - More Visual */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed specifically for Philippine local government project management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Feature Card 1 */}
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-2 hover:border-blue-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Project Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Submit proposals, feasibility studies, and documents for review and prioritization in the Annual Investment Program (AIP).
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 border-2 hover:border-purple-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Budget Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Track approved budgets, disbursements, and fund sources with complete visibility across all projects.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 3 */}
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 border-2 hover:border-pink-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Procurement Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Publish bids, manage submissions, and award contracts with full audit trails and public transparency.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 4 */}
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 border-2 hover:border-green-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Real-Time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Track project progress with milestone management, contractor reports, and approval workflows.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 5 */}
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 border-2 hover:border-orange-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Public Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Citizens can view all projects on an interactive map, track status, budget, and contractor information.
              </p>
            </CardContent>
          </Card>

          {/* Feature Card 6 */}
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 border-2 hover:border-cyan-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full"></div>
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl">Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                9 distinct roles with tailored permissions for administrators, planners, councils, contractors, and the public.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Simple 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Workflow</span>
            </h3>
            <p className="text-xl text-muted-foreground">From proposal to completion in 6 transparent steps</p>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="space-y-12">
              {[
                {
                  number: 1,
                  title: "Proposal Submission",
                  description: "Planners submit project proposals with feasibility studies and initial documentation.",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  number: 2,
                  title: "LDC Review & Prioritization",
                  description: "Development Council reviews and prioritizes projects for inclusion in the Annual Investment Program (AIP).",
                  color: "from-purple-500 to-purple-600"
                },
                {
                  number: 3,
                  title: "Budget Allocation",
                  description: "Budget Officer allocates approved budgets and assigns fund source codes to funded projects.",
                  color: "from-pink-500 to-pink-600"
                },
                {
                  number: 4,
                  title: "Public Bidding",
                  description: "BAC posts public invitations to bid. Contractors submit bids and BAC selects the winning contractor.",
                  color: "from-orange-500 to-orange-600"
                },
                {
                  number: 5,
                  title: "Project Implementation",
                  description: "Contractor implements the project while the Technical Inspector monitors progress, approves milestones, and updates.",
                  color: "from-green-500 to-green-600"
                },
                {
                  number: 6,
                  title: "Public Portal & Transparency",
                  description: "Citizens view all projects on the public portal with real-time status, budget, progress photos, and contractor information.",
                  color: "from-cyan-500 to-cyan-600"
                }
              ].map((step) => (
                <div key={step.number} className="relative flex gap-8 group">
                  {/* Number Circle */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center font-bold text-white shadow-lg z-10 group-hover:scale-125 transition-transform`}>
                    {step.number}
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 pb-8">
                    <div className="bg-card border-2 rounded-xl p-6 shadow-lg group-hover:shadow-2xl group-hover:border-purple-500/50 transition-all duration-300">
                      <h4 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                        {step.title}
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-12 text-center shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your LGU?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join the digital revolution in local government project management. Start today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 shadow-xl">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" className="border-2 bg-white border-white text-purple-600 hover:bg-white/10 hover:text-white text-lg px-8">
                  View Demo Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BuildTrack-LGU
              </span>
            </div>
            <p className="text-muted-foreground">
              &copy; 2025 BuildTrack-LGU. Promoting transparency and good governance in local government projects.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


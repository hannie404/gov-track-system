import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProjectsList } from '@/components/budget/projects-list';

export default async function BudgetDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userProfile?.role !== 'Budget_Officer') {
    redirect('/dashboard');
  }

  // Get budget statistics
  const { data: prioritizedProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'Prioritized');

  const { data: fundedProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'Funded');

  const totalPrioritized = prioritizedProjects?.reduce((sum, p) => sum + p.estimated_cost, 0) || 0;
  const totalFunded = fundedProjects?.reduce((sum, p) => sum + p.approved_budget_amount, 0) || 0;
  const totalDisbursed = fundedProjects?.reduce((sum, p) => sum + p.amount_disbursed, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">BuildTrack-LGU</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userProfile?.first_name} {userProfile?.last_name}</span>
            <Link href="/auth/logout">
              <Button variant="ghost" size="sm">Logout</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground">Budget Management Dashboard</h2>
          <p className="text-muted-foreground mt-2">Allocate budgets and track disbursements for prioritized projects</p>
        </div>

        {/* Budget Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prioritized Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                PHP {(totalPrioritized / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funded Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                PHP {(totalFunded / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disbursed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                PHP {(totalDisbursed / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                PHP {((totalFunded - totalDisbursed) / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prioritized Projects for Budget Allocation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prioritized Projects Awaiting Budget</CardTitle>
            <CardDescription>Allocate budgets to these projects</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetProjectsList status="Prioritized" />
          </CardContent>
        </Card>

        {/* Already Funded Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Funded Projects</CardTitle>
            <CardDescription>Projects with allocated budgets</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetProjectsList status="Funded" showBudgetInfo />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

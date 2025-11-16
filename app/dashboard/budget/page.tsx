import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProjectsList } from '@/components/budget/projects-list';
import { DollarSign, TrendingUp, Wallet, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, ProgressChart } from '@/components/ui/charts';

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

  // Allow Budget Officers and System Administrators
  if (userProfile?.role !== 'Budget_Officer' && userProfile?.role !== 'System_Administrator') {
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
    .in('status', ['Funded', 'Open_For_Bidding', 'In_Progress', 'Completed']);

  const { data: allProjects } = await supabase
    .from('projects')
    .select('estimated_cost, approved_budget_amount, amount_disbursed, status, barangay');

  const totalPrioritized = prioritizedProjects?.reduce((sum, p) => sum + (p.estimated_cost || 0), 0) || 0;
  const totalFunded = fundedProjects?.reduce((sum, p) => sum + (p.approved_budget_amount || 0), 0) || 0;
  const totalDisbursed = fundedProjects?.reduce((sum, p) => sum + (p.amount_disbursed || 0), 0) || 0;
  const remaining = totalFunded - totalDisbursed;

  // Budget by Barangay
  const barangayBudgets = allProjects?.reduce((acc: Record<string, number>, project) => {
    if (project.approved_budget_amount) {
      const barangay = project.barangay || 'Unknown';
      acc[barangay] = (acc[barangay] || 0) + project.approved_budget_amount;
    }
    return acc;
  }, {}) || {};

  const barangayChartData = Object.entries(barangayBudgets)
    .map(([label, value]) => ({
      label,
      value: value as number,
      color: 'bg-blue-500',
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 barangays

  // Budget utilization rate
  const utilizationRate = totalFunded > 0 ? (totalDisbursed / totalFunded) * 100 : 0;

  return (
    <DashboardLayout userRole={userProfile?.role} userEmail={user.email}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budget Management Dashboard</h2>
          <p className="text-muted-foreground mt-2">Allocate budgets and track disbursements for prioritized projects</p>
        </div>

        {/* Budget Stats - Gradient Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioritized Total</CardTitle>
              <DollarSign className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱{(totalPrioritized / 1000000).toFixed(2)}M</div>
              <p className="text-xs opacity-80 mt-1">{prioritizedProjects?.length || 0} projects awaiting budget</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <DollarSign className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funded Total</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱{(totalFunded / 1000000).toFixed(2)}M</div>
              <p className="text-xs opacity-80 mt-1">{fundedProjects?.length || 0} projects funded</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <TrendingUp className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
              <Activity className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱{(totalDisbursed / 1000000).toFixed(2)}M</div>
              <p className="text-xs opacity-80 mt-1">{utilizationRate.toFixed(1)}% utilization</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <Activity className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Wallet className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱{(remaining / 1000000).toFixed(2)}M</div>
              <p className="text-xs opacity-80 mt-1">Available for disbursement</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <Wallet className="h-24 w-24" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {barangayChartData.length > 0 && (
            <BarChart
              title="Budget Allocation by Barangay (Top 5)"
              description="Total approved budgets per barangay"
              data={barangayChartData.map(item => ({
                ...item,
                value: item.value / 1000000, // Convert to millions
              }))}
            />
          )}

          {totalFunded > 0 && (
            <ProgressChart
              title="Budget Utilization"
              description="Disbursed vs Total Allocated"
              current={totalDisbursed}
              total={totalFunded}
              color="bg-purple-500"
              formatAsCurrency={true}
            />
          )}
        </div>

        {/* Prioritized Projects for Budget Allocation */}
        <Card>
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
      </div>
    </DashboardLayout>
  );
}

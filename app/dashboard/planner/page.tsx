import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Clock, CheckCircle2, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { PlannerProposalsList } from '@/components/planner/proposals-list';
import { BarChart, PieChart } from '@/components/ui/charts';

export default async function PlannerDashboard() {
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

  // Allow Planners and System Administrators
  if (userProfile?.role !== 'Planner' && userProfile?.role !== 'System_Administrator') {
    redirect('/dashboard');
  }

  // Get user's proposals with statistics
  const { data: myProposals } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', user.id);

  const totalProposals = myProposals?.length || 0;
  const pendingReview = myProposals?.filter(p => p.status === 'Pending_Review').length || 0;
  const prioritized = myProposals?.filter(p => p.status === 'Prioritized').length || 0;
  const funded = myProposals?.filter(p => ['Funded', 'Open_For_Bidding', 'In_Progress', 'Completed'].includes(p.status)).length || 0;
  const rejected = myProposals?.filter(p => p.status === 'Rejected').length || 0;

  // Category breakdown
  const categoryData = myProposals?.reduce((acc: Record<string, number>, project) => {
    const category = project.project_category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {}) || {};

  const categoryChartData = Object.entries(categoryData).map(([label, value]) => ({
    label: label.replace(/_/g, ' '),
    value: value as number,
  }));

  // Status breakdown
  const statusData = [
    { label: 'Pending Review', value: pendingReview, color: 'bg-yellow-500' },
    { label: 'Prioritized', value: prioritized, color: 'bg-blue-500' },
    { label: 'Funded', value: funded, color: 'bg-green-500' },
    { label: 'Rejected', value: rejected, color: 'bg-red-500' },
  ].filter(item => item.value > 0);

  // Budget totals
  const totalBudgetRequested = myProposals?.reduce((sum, p) => sum + (p.estimated_cost || 0), 0) || 0;
  const totalFunded = myProposals
    ?.filter(p => p.approved_budget_amount)
    .reduce((sum, p) => sum + (p.approved_budget_amount || 0), 0) || 0;

  return (
    <DashboardLayout userRole={userProfile?.role} userEmail={user.email}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Planner Dashboard</h2>
            <p className="text-muted-foreground mt-2">Welcome back, {userProfile?.first_name}! Manage your project proposals.</p>
          </div>
          <Link href="/dashboard/planner/new-proposal">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              <FileText className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProposals}</div>
              <p className="text-xs opacity-80 mt-1">All submissions</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <FileText className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingReview}</div>
              <p className="text-xs opacity-80 mt-1">Awaiting LDC review</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <Clock className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioritized</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{prioritized}</div>
              <p className="text-xs opacity-80 mt-1">Approved by LDC</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <TrendingUp className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funded</CardTitle>
              <CheckCircle2 className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{funded}</div>
              <p className="text-xs opacity-80 mt-1">Received funding</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <CheckCircle2 className="h-24 w-24" />
            </div>
          </Card>
        </div>

        {/* Budget Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget Requested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{(totalBudgetRequested / 1000000).toFixed(2)}M</div>
              <p className="text-xs text-muted-foreground mt-1">Across all proposals</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Funding Received</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{(totalFunded / 1000000).toFixed(2)}M</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalBudgetRequested > 0 
                  ? `${((totalFunded / totalBudgetRequested) * 100).toFixed(1)}% of requested`
                  : 'No requests yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {statusData.length > 0 && (
            <BarChart
              title="Proposal Status Distribution"
              description="Breakdown of your proposals by status"
              data={statusData}
            />
          )}

          {categoryChartData.length > 0 && (
            <PieChart
              title="Projects by Category"
              description="Distribution of proposals by project type"
              data={categoryChartData}
            />
          )}
        </div>

        {/* Proposals Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Proposals</CardTitle>
            <CardDescription>All project proposals you have submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <PlannerProposalsList userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

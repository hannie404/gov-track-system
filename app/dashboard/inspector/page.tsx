import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InProgressProjectsList } from '@/components/inspector/projects-list';
import { BarChart, PieChart, ProgressChart } from '@/components/ui/charts';
import { ClipboardCheck, AlertCircle, CheckCircle2, Wallet, TrendingUp, FileCheck } from 'lucide-react';

export default async function InspectorDashboard() {
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

  // Allow Technical Inspectors and System Administrators
  if (userProfile?.role !== 'Technical_Inspector' && userProfile?.role !== 'System_Administrator') {
    redirect('/dashboard');
  }

  // Fetch real statistics
  const { data: inProgressProjects } = await supabase
    .from('projects')
    .select('id, estimated_cost, amount_disbursed')
    .eq('status', 'In_Progress');

  const { data: completedProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('status', 'Completed');

  const { data: pendingUpdates } = await supabase
    .from('project_updates')
    .select('id')
    .eq('is_pending_approval', true);

  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, status, project_id');

  const { data: allProjects } = await supabase
    .from('projects')
    .select('id, project_category')
    .eq('status', 'In_Progress');

  // Calculate statistics
  const inProgressCount = inProgressProjects?.length || 0;
  const completedCount = completedProjects?.length || 0;
  const pendingCount = pendingUpdates?.length || 0;
  
  const totalEstimated = inProgressProjects?.reduce((sum, p) => sum + (Number(p.estimated_cost) || 0), 0) || 0;
  const totalDisbursed = inProgressProjects?.reduce((sum, p) => sum + (Number(p.amount_disbursed) || 0), 0) || 0;

  // Milestone status distribution
  const milestoneStatusCounts = milestones?.reduce((acc: any, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const milestoneStatusData = [
    { label: 'Not Started', value: milestoneStatusCounts['Not_Started'] || 0 },
    { label: 'In Progress', value: milestoneStatusCounts['In_Progress'] || 0 },
    { label: 'Completed', value: milestoneStatusCounts['Completed'] || 0 },
    { label: 'Delayed', value: milestoneStatusCounts['Delayed'] || 0 },
  ];

  // Project category distribution
  const categoryCounts = allProjects?.reduce((acc: any, p) => {
    acc[p.project_category] = (acc[p.project_category] || 0) + 1;
    return acc;
  }, {}) || {};

  const categoryData = Object.entries(categoryCounts).map(([label, value]) => ({
    label,
    value: value as number,
    color: getCategoryColor(label),
  }));

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Infrastructure: '#3b82f6',
      Education: '#10b981',
      Health: '#ef4444',
      Agriculture: '#f59e0b',
      Social_Welfare: '#8b5cf6',
      Environment: '#06b6d4',
    };
    return colors[category] || '#6b7280';
  }

  return (
    <DashboardLayout userRole={userProfile?.role} userEmail={user.email}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Technical Inspector Dashboard</h2>
          <p className="text-muted-foreground mt-2">Monitor project progress, approve updates, and manage milestones</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
            <div className="absolute top-4 right-4 opacity-10">
              <TrendingUp className="h-16 w-16" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {inProgressCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active projects</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
            <div className="absolute top-4 right-4 opacity-10">
              <AlertCircle className="h-16 w-16" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                {pendingCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Updates to review</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-green-500">
            <div className="absolute top-4 right-4 opacity-10">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-800 bg-clip-text text-transparent">
                {completedCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Finished projects</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
            <div className="absolute top-4 right-4 opacity-10">
              <Wallet className="h-16 w-16" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Disbursed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                ₱{(totalDisbursed / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">From ₱{(totalEstimated / 1000000).toFixed(1)}M total</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Milestone Status */}
          <BarChart 
            title="Milestone Status Distribution"
            description="Progress tracking across all milestones"
            data={milestoneStatusData}
          />

          {/* Project Categories */}
          <PieChart 
            title="Projects by Category"
            description="Active projects distribution"
            data={categoryData}
          />
        </div>

        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Disbursement Progress</CardTitle>
            <CardDescription>Total amount disbursed vs estimated budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="text-4xl font-bold">₱{(totalDisbursed / 1000000).toFixed(1)}M</div>
                <div className="text-2xl text-muted-foreground pb-1">/ ₱{(totalEstimated / 1000000).toFixed(1)}M</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">
                    {totalEstimated > 0 ? ((totalDisbursed / totalEstimated) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-gradient-to-r from-purple-500 to-purple-600"
                    style={{ width: `${totalEstimated > 0 ? (totalDisbursed / totalEstimated) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{milestones?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-none">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(milestones?.length || 0) > 0 
                  ? ((milestoneStatusCounts['Completed'] || 0) / (milestones?.length || 1) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Milestones completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-none">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Delayed Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {milestoneStatusCounts['Delayed'] || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Under Implementation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Projects Under Implementation
            </CardTitle>
            <CardDescription>Monitor progress and manage milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <InProgressProjectsList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

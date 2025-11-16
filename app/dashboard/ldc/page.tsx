import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LDCProposalsList } from '@/components/ldc/proposals-list';
import { FileText, Clock, CheckCircle2, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, PieChart } from '@/components/ui/charts';

export default async function LDCDashboard() {
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

  // Allow Development Council and System Administrators
  if (userProfile?.role !== 'Development_Council' && userProfile?.role !== 'System_Administrator') {
    redirect('/dashboard');
  }

  // Get statistics
  const { data: pendingProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'Pending_Review');

  const { data: prioritizedProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'Prioritized');

  const { data: rejectedProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'Rejected');

  const { data: allProjects } = await supabase
    .from('projects')
    .select('estimated_cost, project_category, status, barangay')
    .in('status', ['Pending_Review', 'Prioritized', 'Rejected']);

  const pendingCount = pendingProjects?.length || 0;
  const prioritizedCount = prioritizedProjects?.length || 0;
  const rejectedCount = rejectedProjects?.length || 0;
  const totalBudget = prioritizedProjects?.reduce((sum, p) => sum + (p.estimated_cost || 0), 0) || 0;

  // Category distribution
  const categoryData = allProjects?.reduce((acc: Record<string, number>, project) => {
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
    { label: 'Pending Review', value: pendingCount, color: 'bg-yellow-500' },
    { label: 'Prioritized', value: prioritizedCount, color: 'bg-green-500' },
    { label: 'Rejected', value: rejectedCount, color: 'bg-red-500' },
  ].filter(item => item.value > 0);

  // Approval rate
  const totalReviewed = prioritizedCount + rejectedCount;
  const approvalRate = totalReviewed > 0 ? (prioritizedCount / totalReviewed) * 100 : 0;

  return (
    <DashboardLayout userRole={userProfile?.role} userEmail={user.email}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Development Council Dashboard</h2>
          <p className="text-muted-foreground mt-2">Review and prioritize project proposals for the Annual Investment Program (AIP)</p>
        </div>

        {/* Stats - Gradient Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
              <p className="text-xs opacity-80 mt-1">Awaiting your decision</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <Clock className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioritized</CardTitle>
              <CheckCircle2 className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{prioritizedCount}</div>
              <p className="text-xs opacity-80 mt-1">Approved for AIP</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <CheckCircle2 className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rejectedCount}</div>
              <p className="text-xs opacity-80 mt-1">Not approved</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <XCircle className="h-24 w-24" />
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱{(totalBudget / 1000000).toFixed(2)}M</div>
              <p className="text-xs opacity-80 mt-1">Prioritized projects</p>
            </CardContent>
            <div className="absolute bottom-0 right-0 opacity-10">
              <DollarSign className="h-24 w-24" />
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {prioritizedCount} approved of {totalReviewed} reviewed
              </p>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Proposals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allProjects?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                For LDC consideration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {statusData.length > 0 && (
            <BarChart
              title="Proposal Status Distribution"
              description="Breakdown of proposals by review status"
              data={statusData}
            />
          )}

          {categoryChartData.length > 0 && (
            <PieChart
              title="Proposals by Category"
              description="Distribution by project category"
              data={categoryChartData}
            />
          )}
        </div>

        {/* Proposals for Review */}
        <Card>
          <CardHeader>
            <CardTitle>Proposals for Review</CardTitle>
            <CardDescription>Pending proposals awaiting your decision</CardDescription>
          </CardHeader>
          <CardContent>
            <LDCProposalsList status="Pending_Review" />
          </CardContent>
        </Card>

        {/* Generate AIP Button */}
        <Card>
          <CardHeader>
            <CardTitle>Annual Investment Program (AIP)</CardTitle>
            <CardDescription>Generate AIP document with all prioritized projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ldc/generate-aip">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Generate AIP Document
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

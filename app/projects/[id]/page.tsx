'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/dashboard-layout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, DollarSign, User, Calendar, FileText, Users, Building2, TrendingUp, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  barangay: string;
  project_category: string;
  problem_description: string;
  proposed_solution: string;
  estimated_cost: number;
  approved_budget_amount?: number;
  amount_disbursed?: number;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  contractors?: {
    company_name: string;
    contact_person: string;
    phone: string;
  };
}

interface Update {
  id: string;
  percentage_complete: number;
  report_text: string;
  submitted_at: string;
  is_approved: boolean;
  users: {
    first_name: string;
    last_name: string;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>();
  const supabase = createClient();

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        // Fetch project
        const { data: projectData } = await supabase
          .from('projects')
          .select(`
            *,
            contractors (
              company_name,
              contact_person,
              phone
            )
          `)
          .eq('id', projectId)
          .single();

        setProject(projectData);

        // Fetch approved updates only
        const { data: updatesData } = await supabase
          .from('project_updates')
          .select(`
            id,
            percentage_complete,
            report_text,
            submitted_at,
            is_approved,
            users!inner (
              first_name,
              last_name
            )
          `)
          .eq('project_id', projectId)
          .eq('is_approved', true)
          .order('submitted_at', { ascending: false });

        // Transform the data to match the expected type
        const transformedUpdates = updatesData?.map((update: any) => ({
          ...update,
          users: Array.isArray(update.users) ? update.users[0] : update.users
        })) || [];

        setUpdates(transformedUpdates);

        // Fetch milestones
        const { data: milestonesData } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('order_sequence', { ascending: true });

        setMilestones(milestonesData || []);
      } catch (err) {
        console.error('Error fetching project details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetails();
  }, [projectId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/projects">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In_Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Open_For_Bidding':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const disbursementPercentage = project.approved_budget_amount
    ? (project.amount_disbursed || 0) / project.approved_budget_amount * 100
    : 0;

  const latestUpdate = updates[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <Link href="/projects">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{project.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{project.barangay}</span>
              </div>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards - Gradient Style */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Budget Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-100">
                <DollarSign className="w-4 h-4" />
                Approved Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₱{((project.approved_budget_amount || project.estimated_cost) / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-blue-100 mt-1">
                Total Allocated Funds
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          </Card>

          {/* Disbursement Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-100">
                <TrendingUp className="w-4 h-4" />
                Disbursed Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₱{((project.amount_disbursed || 0) / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-green-100 mt-1">
                {disbursementPercentage.toFixed(1)}% of Budget
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          </Card>

          {/* Progress Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-100">
                <CheckCircle2 className="w-4 h-4" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {latestUpdate?.percentage_complete || 0}%
              </div>
              <p className="text-xs text-purple-100 mt-1">
                {latestUpdate ? 'Latest Update' : 'No Updates Yet'}
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          </Card>
        </div>

        {/* Contractor & Timeline Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Contractor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.contractors ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-semibold text-foreground">{project.contractors.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-semibold text-foreground">{project.contractors.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{project.contractors.phone}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No contractor assigned yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-semibold text-foreground">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'To Be Announced'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Completion</p>
                <p className="font-semibold text-foreground">
                  {project.end_date ? new Date(project.end_date).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'To Be Determined'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Description */}
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Problem</h3>
              <p className="text-muted-foreground">{project.problem_description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Proposed Solution</h3>
              <p className="text-muted-foreground">{project.proposed_solution}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Details</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Budget Disbursement Details */}
        {project.approved_budget_amount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Disbursement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Disbursement Progress</span>
                  <span className="text-sm font-semibold text-foreground">
                    {disbursementPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(disbursementPercentage, 100)} className="h-3" />
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-xl font-bold text-foreground">
                    ₱{(project.approved_budget_amount / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Amount Disbursed</p>
                  <p className="text-xl font-bold text-green-600">
                    ₱{((project.amount_disbursed || 0) / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Project Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </span>
                          <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-2 ml-8">{milestone.description}</p>
                        )}
                      </div>
                      <Badge className={milestone.percentage_complete === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {milestone.percentage_complete}%
                      </Badge>
                    </div>
                    <div className="ml-8">
                      <Progress value={milestone.percentage_complete} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Update */}
        {latestUpdate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Latest Project Update
              </CardTitle>
              <CardDescription>
                Submitted by {latestUpdate.users.first_name} {latestUpdate.users.last_name} on{' '}
                {new Date(latestUpdate.submitted_at).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Progress</span>
                  <span className="text-sm font-bold text-primary">{latestUpdate.percentage_complete}%</span>
                </div>
                <Progress value={latestUpdate.percentage_complete} className="h-3" />
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Progress Report</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{latestUpdate.report_text}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

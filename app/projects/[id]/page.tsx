'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, DollarSign, User, Calendar, FileText, Users } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

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
            users (
              first_name,
              last_name
            )
          `)
          .eq('project_id', projectId)
          .eq('is_approved', true)
          .order('submitted_at', { ascending: false });

        setUpdates(updatesData || []);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/projects">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
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

          {/* Key Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Approved Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  PHP {(project.approved_budget_amount || project.estimated_cost).toLocaleString('en-PH')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contractor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-semibold text-foreground">
                  {project.contractors?.company_name || 'Not Yet Assigned'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-foreground">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBA'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Description */}
          <Card className="mb-8">
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

          {/* Budget Disbursement */}
          {project.approved_budget_amount && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget Disbursement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Disbursed</span>
                    <span className="text-sm font-semibold text-foreground">
                      {disbursementPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(disbursementPercentage, 100)} className="h-2" />
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Allocated</p>
                    <p className="font-semibold text-foreground">
                      PHP {project.approved_budget_amount.toLocaleString('en-PH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Disbursed Amount</p>
                    <p className="font-semibold text-foreground">
                      PHP {(project.amount_disbursed || 0).toLocaleString('en-PH')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          )}
                        </div>
                        <Badge className="bg-gray-100 text-gray-800">{milestone.percentage_complete}%</Badge>
                      </div>
                      <Progress value={milestone.percentage_complete} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Latest Update */}
          {latestUpdate && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Latest Project Update
                </CardTitle>
                <CardDescription>
                  From {latestUpdate.users.first_name} {latestUpdate.users.last_name} on{' '}
                  {new Date(latestUpdate.submitted_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current Progress</span>
                    <span className="text-sm font-semibold text-foreground">{latestUpdate.percentage_complete}%</span>
                  </div>
                  <Progress value={latestUpdate.percentage_complete} className="h-2" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Report</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{latestUpdate.report_text}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contractor Info */}
          {project.contractors && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contractor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 BuildTrack-LGU. Promoting transparency and good governance in local government projects.</p>
        </div>
      </footer>
    </div>
  );
}

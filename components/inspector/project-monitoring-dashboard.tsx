'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MilestoneManager } from './milestone-manager';
import { ProjectUpdatesPanel } from './project-updates-panel';

interface Project {
  id: string;
  title: string;
  barangay: string;
  description: string;
  estimated_cost: number;
  approved_budget_amount: number;
  amount_disbursed: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  percentage_complete: number;
  status: string;
  scheduled_start_date?: string;
  scheduled_end_date?: string;
  order_sequence: number;
}

interface Update {
  id: string;
  percentage_complete: number;
  report_text: string;
  is_approved: boolean;
  is_pending_approval: boolean;
  submitted_at: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function ProjectMonitoringDashboard({
  project,
  milestones,
  updates,
  userId,
}: {
  project: Project;
  milestones: Milestone[];
  updates: Update[];
  userId: string;
}) {
  const disbursementPercentage = (project.amount_disbursed / project.approved_budget_amount) * 100;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div>
        <h2 className="text-4xl font-bold text-foreground">{project.title}</h2>
        <p className="text-muted-foreground mt-2">{project.barangay}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              PHP {project.approved_budget_amount.toLocaleString('en-PH')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              PHP {project.amount_disbursed.toLocaleString('en-PH')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{disbursementPercentage.toFixed(1)}% of budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              PHP {(project.approved_budget_amount - project.amount_disbursed).toLocaleString('en-PH')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-foreground">
              {project.start_date && new Date(project.start_date).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">to {project.end_date && new Date(project.end_date).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Disbursement Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Disbursement</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(disbursementPercentage, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {disbursementPercentage.toFixed(1)}% of approved budget has been disbursed
          </p>
        </CardContent>
      </Card>

      {/* Tabs for Milestones and Updates */}
      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="milestones">Milestones & Progress</TabsTrigger>
          <TabsTrigger value="updates">Progress Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          <MilestoneManager projectId={project.id} milestones={milestones} userId={userId} />
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <ProjectUpdatesPanel projectId={project.id} updates={updates} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

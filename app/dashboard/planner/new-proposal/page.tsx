import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProposalForm } from '@/components/planner/proposal-form';

export default async function NewProposalPage() {
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

  return (
    <DashboardLayout userRole={userProfile?.role} userEmail={user.email}>
      <div className="space-y-6">
        <Link href="/dashboard/planner">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Proposals
          </Button>
        </Link>

        <div>
          <h2 className="text-3xl font-bold">Create New Proposal</h2>
          <p className="text-muted-foreground mt-2">Submit a new project proposal for review by the Development Council</p>
        </div>

        <ProposalForm userId={user.id} />
      </div>
    </DashboardLayout>
  );
}

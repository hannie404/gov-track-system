import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  // Route to appropriate dashboard based on role
  const role = userProfile?.role || 'Public_User';

  switch (role) {
    case 'Planner':
      redirect('/dashboard/planner');
    case 'Development_Council':
      redirect('/dashboard/ldc');
    case 'Budget_Officer':
      redirect('/dashboard/budget');
    case 'BAC_Secretariat':
      redirect('/dashboard/bac');
    case 'Technical_Inspector':
      redirect('/dashboard/inspector');
    case 'System_Administrator':
      redirect('/dashboard/admin');
    default:
      redirect('/projects');
  }
}

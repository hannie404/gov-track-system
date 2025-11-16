'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, DollarSign } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  barangay: string;
  estimated_cost: number;
  approved_budget_amount?: number;
  amount_disbursed?: number;
  fund_source_code?: string;
  status: string;
  created_at: string;
}

export function BudgetProjectsList({ status, showBudgetInfo }: { status: string; showBudgetInfo?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, barangay, estimated_cost, approved_budget_amount, amount_disbursed, fund_source_code, status, created_at')
          .eq('status', status)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [status, supabase]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No projects found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Title</th>
            <th className="text-left p-4 font-semibold text-foreground">Barangay</th>
            <th className="text-left p-4 font-semibold text-foreground">Estimated Cost</th>
            {showBudgetInfo && (
              <>
                <th className="text-left p-4 font-semibold text-foreground">Approved Budget</th>
                <th className="text-left p-4 font-semibold text-foreground">Disbursed</th>
              </>
            )}
            <th className="text-left p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-border hover:bg-muted/50">
              <td className="p-4 text-foreground font-medium">{project.title}</td>
              <td className="p-4 text-muted-foreground">{project.barangay}</td>
              <td className="p-4 text-muted-foreground">
                PHP {project.estimated_cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </td>
              {showBudgetInfo && (
                <>
                  <td className="p-4 text-muted-foreground">
                    PHP {(project.approved_budget_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    PHP {(project.amount_disbursed || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </>
              )}
              <td className="p-4">
                <Link href={`/dashboard/budget/allocate/${project.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <DollarSign className="w-4 h-4" />
                    {showBudgetInfo ? 'Update' : 'Allocate'}
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

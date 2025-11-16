'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit2 } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  barangay: string;
  estimated_cost: number;
  status: string;
  created_at: string;
}

export function PlannerProposalsList({ userId }: { userId: string }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProposals() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, barangay, estimated_cost, status, created_at')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProposals(data || []);
      } catch (err) {
        console.error('Error fetching proposals:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, [userId, supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending_Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Prioritized':
        return 'bg-blue-100 text-blue-800';
      case 'Funded':
        return 'bg-green-100 text-green-800';
      case 'In_Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading proposals...</div>;
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No proposals yet. Create your first proposal!</p>
        <Link href="/dashboard/planner/new-proposal">
          <Button>Create Proposal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Title</th>
            <th className="text-left p-4 font-semibold text-foreground">Barangay</th>
            <th className="text-left p-4 font-semibold text-foreground">Estimated Cost</th>
            <th className="text-left p-4 font-semibold text-foreground">Status</th>
            <th className="text-left p-4 font-semibold text-foreground">Created</th>
            <th className="text-left p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal) => (
            <tr key={proposal.id} className="border-b border-border hover:bg-muted/50">
              <td className="p-4 text-foreground font-medium">{proposal.title}</td>
              <td className="p-4 text-muted-foreground">{proposal.barangay}</td>
              <td className="p-4 text-muted-foreground">
                PHP {proposal.estimated_cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-4">
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status.replace(/_/g, ' ')}
                </Badge>
              </td>
              <td className="p-4 text-muted-foreground text-xs">
                {new Date(proposal.created_at).toLocaleDateString()}
              </td>
              <td className="p-4">
                <Link href={`/projects/${proposal.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View
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

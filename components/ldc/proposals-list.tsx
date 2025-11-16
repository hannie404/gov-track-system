'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowUpDown } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface Proposal {
  id: string;
  title: string;
  barangay: string;
  estimated_cost: number;
  status: string;
  created_at: string;
}

const columns: ColumnDef<Proposal>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("title")}</div>
    },
  },
  {
    accessorKey: "barangay",
    header: "Barangay",
    cell: ({ row }) => {
      return <div className="text-muted-foreground">{row.getValue("barangay")}</div>
    },
  },
  {
    accessorKey: "estimated_cost",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estimated Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimated_cost"))
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <div className="text-muted-foreground text-sm">{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const proposal = row.original
      return (
        <Link href={`/dashboard/ldc/review-proposal/${proposal.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Review
          </Button>
        </Link>
      )
    },
  },
]

export function LDCProposalsList({ status }: { status: string }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProposals() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, barangay, estimated_cost, status, created_at')
          .eq('status', status)
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
  }, [status, supabase]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading proposals...</div>;
  }

  if (proposals.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No proposals to review</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={proposals}
      searchKey="title"
      searchPlaceholder="Search proposals..."
    />
  );
}

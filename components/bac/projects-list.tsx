'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Gavel, ArrowUpDown } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface Project {
  id: string;
  title: string;
  barangay: string;
  approved_budget_amount: number;
  status: string;
  created_at: string;
}

export function BACProjectsList({ status, stage }: { status: string; stage: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "barangay",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Barangay
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "approved_budget_amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("approved_budget_amount"))
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount)
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {status.replace(/_/g, ' ')}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const project = row.original
        return stage === 'ready_for_bidding' ? (
          <Link href={`/dashboard/bac/create-invitation/${project.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              Create Invitation
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/bac/manage-bids/${project.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <Gavel className="w-4 h-4" />
              Manage Bids
            </Button>
          </Link>
        )
      },
    },
  ];

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, barangay, approved_budget_amount, status, created_at')
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
    <DataTable
      columns={columns}
      data={projects}
      searchKey="title"
      searchPlaceholder="Search projects..."
    />
  );
}

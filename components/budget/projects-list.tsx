'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, DollarSign, ArrowUpDown } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

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

  // Define columns based on showBudgetInfo prop
  const baseColumns: ColumnDef<Project>[] = [
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
      accessorKey: "estimated_cost",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estimated Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("estimated_cost"))
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount)
      },
    },
  ];

  const budgetColumns: ColumnDef<Project>[] = showBudgetInfo ? [
    {
      accessorKey: "approved_budget_amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Approved Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("approved_budget_amount") || "0")
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount)
      },
    },
    {
      accessorKey: "amount_disbursed",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Disbursed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount_disbursed") || "0")
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount)
      },
    },
  ] : [];

  const actionColumn: ColumnDef<Project> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const project = row.original
      return (
        <Link href={`/dashboard/budget/allocate/${project.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <DollarSign className="w-4 h-4" />
            {showBudgetInfo ? 'Update' : 'Allocate'}
          </Button>
        </Link>
      )
    },
  };

  const columns = [...baseColumns, ...budgetColumns, actionColumn];

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
    <DataTable
      columns={columns}
      data={projects}
      searchKey="title"
      searchPlaceholder="Search projects..."
    />
  );
}

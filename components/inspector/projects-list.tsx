'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowUpDown } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface Project {
  id: string;
  title: string;
  barangay: string;
  contractor_id: string;
  status: string;
  created_at: string;
}

const columns: ColumnDef<Project>[] = [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
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
          Created
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
      const project = row.original
      return (
        <Link href={`/dashboard/inspector/project/${project.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Monitor
          </Button>
        </Link>
      )
    },
  },
]

export function InProgressProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, barangay, contractor_id, status, created_at')
          .eq('status', 'In_Progress')
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
  }, [supabase]);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No projects under implementation</div>;
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

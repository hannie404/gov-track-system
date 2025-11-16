'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  barangay: string;
  contractor_id: string;
  status: string;
  created_at: string;
}

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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Title</th>
            <th className="text-left p-4 font-semibold text-foreground">Barangay</th>
            <th className="text-left p-4 font-semibold text-foreground">Status</th>
            <th className="text-left p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-border hover:bg-muted/50">
              <td className="p-4 text-foreground font-medium">{project.title}</td>
              <td className="p-4 text-muted-foreground">{project.barangay}</td>
              <td className="p-4">
                <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
              </td>
              <td className="p-4">
                <Link href={`/dashboard/inspector/project/${project.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Monitor
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

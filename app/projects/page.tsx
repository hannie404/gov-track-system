'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, User, Search } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  barangay: string;
  project_category: string;
  estimated_cost: number;
  approved_budget_amount?: number;
  status: string;
  contractors?: {
    company_name: string;
  };
}

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            description,
            barangay,
            project_category,
            estimated_cost,
            approved_budget_amount,
            status,
            contractors (
              company_name
            )
          `)
          .in('status', ['In_Progress', 'Completed', 'Open_For_Bidding'])
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [supabase]);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((p) => p.project_category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, categoryFilter, statusFilter, projects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In_Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Open_For_Bidding':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [
    'Flood_Control',
    'Road_Infrastructure',
    'Water_Supply',
    'Health_Facility',
    'Education_Facility',
    'Community_Center',
    'Market',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">BuildTrack-LGU</h1>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary/5 border-b border-border py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-foreground mb-4">Public Projects</h2>
            <p className="text-lg text-muted-foreground">
              View all local government projects in implementation. Monitor progress, budgets, and contractors with complete transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects, barangay..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="In_Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Open_For_Bidding">Open for Bidding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No projects found matching your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2">
                      <MapPin className="w-4 h-4" />
                      {project.barangay}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-semibold">
                          PHP {(project.approved_budget_amount || project.estimated_cost).toLocaleString('en-PH')}
                        </span>
                      </div>

                      {project.contractors && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{project.contractors.company_name}</span>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 BuildTrack-LGU. Promoting transparency and good governance in local government projects.</p>
        </div>
      </footer>
    </div>
  );
}

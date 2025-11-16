'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  barangay: string;
  estimated_cost: number;
  problem_description: string;
  proposed_solution: string;
}

export function AIPDocument({ projects }: { projects: Project[] }) {
  const totalBudget = projects.reduce((sum, p) => sum + p.estimated_cost, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = generateAIPText(projects, totalBudget);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `AIP-${new Date().getFullYear()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Card className="print:border-0">
        <CardHeader className="print:pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Annual Investment Program (AIP)</CardTitle>
              <CardDescription className="mt-2">Year {new Date().getFullYear()}</CardDescription>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 print:grid-cols-3">
            <Card className="print:border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{projects.length}</div>
              </CardContent>
            </Card>
            <Card className="print:border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">PHP {(totalBudget / 1000000).toFixed(1)}M</div>
              </CardContent>
            </Card>
            <Card className="print:border-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  PHP {(totalBudget / projects.length / 1000000).toFixed(1)}M
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Table */}
          <div className="border border-border rounded-lg overflow-hidden print:border-gray-300">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border print:bg-gray-100 print:border-gray-300">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground print:text-black">No.</th>
                  <th className="text-left p-4 font-semibold text-foreground print:text-black">Project Title</th>
                  <th className="text-left p-4 font-semibold text-foreground print:text-black">Barangay</th>
                  <th className="text-left p-4 font-semibold text-foreground print:text-black">Estimated Cost</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.id} className="border-b border-border hover:bg-muted/50 print:border-gray-300 print:hover:bg-transparent">
                    <td className="p-4 text-foreground print:text-black">{index + 1}</td>
                    <td className="p-4 text-foreground font-medium print:text-black">{project.title}</td>
                    <td className="p-4 text-muted-foreground print:text-black">{project.barangay}</td>
                    <td className="p-4 text-muted-foreground print:text-black">
                      PHP {project.estimated_cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Projects */}
          <div className="space-y-6 print:page-break-inside-avoid">
            <h3 className="text-lg font-semibold text-foreground">Project Details</h3>
            {projects.map((project, index) => (
              <div key={project.id} className="border border-border rounded-lg p-6 print:border-gray-300 print:break-inside-avoid">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground print:text-black">{index + 1}. {project.title}</h4>
                    <p className="text-sm text-muted-foreground print:text-gray-600">{project.barangay}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground print:text-gray-600">Estimated Budget</p>
                    <p className="text-lg font-bold text-primary print:text-black">
                      PHP {project.estimated_cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground print:text-black">Problem</p>
                    <p className="text-sm text-muted-foreground print:text-gray-700">{project.problem_description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground print:text-black">Solution</p>
                    <p className="text-sm text-muted-foreground print:text-gray-700">{project.proposed_solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

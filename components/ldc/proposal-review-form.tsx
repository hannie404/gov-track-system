'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Project {
  id: string;
  title: string;
  description: string;
  barangay: string;
  problem_description: string;
  proposed_solution: string;
  estimated_cost: number;
  status: string;
}

export function ProposalReviewForm({ project, userId }: { project: Project; userId: string }) {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDecision(approve: boolean) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const newStatus = approve ? 'Prioritized' : 'Cancelled';

      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (error) {
        setError(error.message);
      } else {
        // Log action to history
        await supabase.from('project_history').insert({
          project_id: project.id,
          changed_by: userId,
          action_type: approve ? 'Prioritized' : 'Rejected',
          old_status: project.status,
          new_status: newStatus,
          change_details: { comments },
        });

        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/ldc');
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>{project.barangay}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-foreground">Estimated Cost</Label>
              <p className="text-lg font-semibold text-primary mt-2">
                PHP {project.estimated_cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <Label className="text-foreground">Status</Label>
              <div className="mt-2">
                <Badge className="bg-yellow-100 text-yellow-800">{project.status.replace(/_/g, ' ')}</Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-foreground">Problem Description</Label>
            <p className="text-muted-foreground mt-2 p-3 bg-muted rounded border border-border">
              {project.problem_description}
            </p>
          </div>

          <div>
            <Label className="text-foreground">Proposed Solution</Label>
            <p className="text-muted-foreground mt-2 p-3 bg-muted rounded border border-border">
              {project.proposed_solution}
            </p>
          </div>

          <div>
            <Label className="text-foreground">Project Description</Label>
            <p className="text-muted-foreground mt-2 p-3 bg-muted rounded border border-border">
              {project.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Decision</CardTitle>
          <CardDescription>Approve to add to AIP, or reject if not suitable</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Decision saved successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="comments" className="text-foreground">Comments (Optional)</Label>
            <Textarea
              id="comments"
              placeholder="Add any comments or notes about your decision..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              onClick={() => handleDecision(true)}
              disabled={loading || success}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : 'Approve for AIP'}
            </Button>
            <Button
              onClick={() => handleDecision(false)}
              variant="destructive"
              disabled={loading || success}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Reject'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

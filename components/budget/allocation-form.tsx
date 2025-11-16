'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  title: string;
  barangay: string;
  estimated_cost: number;
  approved_budget_amount?: number;
  fund_source_code?: string;
  status: string;
}

export function BudgetAllocationForm({ project, userId }: { project: Project; userId: string }) {
  const [approvedBudget, setApprovedBudget] = useState(project.approved_budget_amount?.toString() || project.estimated_cost.toString());
  const [fundSourceCode, setFundSourceCode] = useState(project.fund_source_code || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!fundSourceCode.trim()) {
        setError('Fund source code is required');
        setLoading(false);
        return;
      }

      const budgetAmount = parseFloat(approvedBudget);
      if (budgetAmount <= 0) {
        setError('Budget amount must be greater than 0');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('projects')
        .update({
          approved_budget_amount: budgetAmount,
          fund_source_code: fundSourceCode,
          status: 'Funded',
        })
        .eq('id', project.id);

      if (error) {
        setError(error.message);
      } else {
        // Log action to history
        await supabase.from('project_history').insert({
          project_id: project.id,
          changed_by: userId,
          action_type: 'Budget_Allocated',
          old_status: project.status,
          new_status: 'Funded',
          change_details: {
            approved_budget_amount: budgetAmount,
            fund_source_code: fundSourceCode,
          },
        });

        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/budget');
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
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
            <Label className="text-foreground">Current Status</Label>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800">{project.status.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                Budget allocated successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="budget" className="text-foreground">Approved Budget Amount (PHP)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="0.00"
              value={approvedBudget}
              onChange={(e) => setApprovedBudget(e.target.value)}
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Recommended: PHP {project.estimated_cost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <Label htmlFor="fundSource" className="text-foreground">Fund Source Code</Label>
            <Input
              id="fundSource"
              type="text"
              placeholder="e.g., 2024-01-FLOOD-CONTROL"
              value={fundSourceCode}
              onChange={(e) => setFundSourceCode(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Unique identifier for the budget source allocation
            </p>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1"
            >
              {loading ? 'Allocating...' : 'Allocate Budget & Fund Project'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

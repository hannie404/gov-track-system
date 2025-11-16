'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function ProposalForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [barangay, setBarangay] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
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
      const { error } = await supabase.from('projects').insert({
        title,
        description,
        barangay,
        project_category: category,
        estimated_cost: parseFloat(estimatedCost),
        problem_description: problemDescription,
        proposed_solution: proposedSolution,
        created_by: userId,
        status: 'Pending_Review',
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/planner');
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
        <CardTitle>Project Proposal Details</CardTitle>
        <CardDescription>Fill out all required fields to submit your proposal</CardDescription>
      </CardHeader>
      <CardContent>
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
                Proposal submitted successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-foreground">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Flood Control System for Barangay A"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="barangay" className="text-foreground">Barangay</Label>
                  <Input
                    id="barangay"
                    placeholder="Barangay name"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-foreground">Project Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flood_Control">Flood Control</SelectItem>
                      <SelectItem value="Road_Infrastructure">Road Infrastructure</SelectItem>
                      <SelectItem value="Water_Supply">Water Supply</SelectItem>
                      <SelectItem value="Health_Facility">Health Facility</SelectItem>
                      <SelectItem value="Education_Facility">Education Facility</SelectItem>
                      <SelectItem value="Community_Center">Community Center</SelectItem>
                      <SelectItem value="Market">Market</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedCost" className="text-foreground">Estimated Cost (PHP)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  placeholder="0.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Project Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="problemDescription" className="text-foreground">Problem Description</Label>
                <Textarea
                  id="problemDescription"
                  placeholder="Describe the problem or need that this project addresses..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="proposedSolution" className="text-foreground">Proposed Solution</Label>
                <Textarea
                  id="proposedSolution"
                  placeholder="Describe the proposed solution and expected benefits..."
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">General Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a comprehensive description of the project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Proposal'}
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

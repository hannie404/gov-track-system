'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Project {
  id: string;
  title: string;
  barangay: string;
  approved_budget_amount: number;
  status: string;
}

export function BidInvitationForm({ project, userId }: { project: Project; userId: string }) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [bidOpeningDate, setBidOpeningDate] = useState('');
  const [bidClosingDate, setBidClosingDate] = useState('');
  const [preBidDate, setPreBidDate] = useState('');
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
      if (!bidOpeningDate || !bidClosingDate) {
        setError('Bid dates are required');
        setLoading(false);
        return;
      }

      // Create bid invitation
      const { error: invitationError } = await supabase
        .from('bid_invitations')
        .insert({
          project_id: project.id,
          title,
          description,
          requirements,
          bid_opening_date: bidOpeningDate,
          bid_closing_date: bidClosingDate,
          pre_bid_conference_date: preBidDate || null,
          created_by: userId,
        });

      if (invitationError) {
        setError(invitationError.message);
        setLoading(false);
        return;
      }

      // Update project status
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: 'Open_For_Bidding' })
        .eq('id', project.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Log action
      await supabase.from('project_history').insert({
        project_id: project.id,
        changed_by: userId,
        action_type: 'Bid_Invitation_Created',
        old_status: project.status,
        new_status: 'Open_For_Bidding',
        change_details: { bid_opening_date: bidOpeningDate, bid_closing_date: bidClosingDate },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/bac');
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Public Bid Invitation</CardTitle>
        <CardDescription>{project.title}</CardDescription>
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
                Bid invitation created successfully! Project is now open for bidding...
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="title" className="text-foreground">Invitation Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project and bidding requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements" className="text-foreground">Bid Requirements</Label>
            <Textarea
              id="requirements"
              placeholder="List all technical and documentary requirements for bidders..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preBidDate" className="text-foreground">Pre-Bid Conference Date (Optional)</Label>
              <Input
                id="preBidDate"
                type="date"
                value={preBidDate}
                onChange={(e) => setPreBidDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bidOpeningDate" className="text-foreground">Bid Opening Date</Label>
              <Input
                id="bidOpeningDate"
                type="date"
                value={bidOpeningDate}
                onChange={(e) => setBidOpeningDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bidClosingDate" className="text-foreground">Bid Closing Date</Label>
            <Input
              id="bidClosingDate"
              type="date"
              value={bidClosingDate}
              onChange={(e) => setBidClosingDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create & Publish Invitation'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

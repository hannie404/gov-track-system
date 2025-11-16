'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Bid {
  id: string;
  bid_amount: number;
  bid_date: string;
  is_winning_bid: boolean;
  contractor_id: string;
  contractors: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
  };
}

interface Project {
  id: string;
  title: string;
  approved_budget_amount: number;
  contract_amount?: number;
}

export function ManageBidsForm({
  project,
  bids,
  userId,
}: {
  project: Project;
  bids: Bid[];
  userId: string;
}) {
  const [selectedWinnerBidId, setSelectedWinnerBidId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleAwardContract() {
    if (!selectedWinnerBidId) {
      setError('Please select a winning bid');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const winningBid = bids.find((b) => b.id === selectedWinnerBidId);
      if (!winningBid) {
        setError('Winning bid not found');
        setLoading(false);
        return;
      }

      // Update bid as winning
      await supabase.from('bids').update({ is_winning_bid: true }).eq('id', selectedWinnerBidId);

      // Update project with contractor and contract amount
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          contractor_id: winningBid.contractor_id,
          contract_amount: winningBid.bid_amount,
          status: 'In_Progress',
        })
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
        action_type: 'Contract_Awarded',
        old_status: 'Open_For_Bidding',
        new_status: 'In_Progress',
        change_details: {
          contractor_id: winningBid.contractor_id,
          contract_amount: winningBid.bid_amount,
        },
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
    <div className="space-y-6">
      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>Budget: PHP {project.approved_budget_amount.toLocaleString('en-PH')}</CardDescription>
        </CardHeader>
      </Card>

      {/* Bids Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Bids</CardTitle>
          <CardDescription>{bids.length} bid(s) received</CardDescription>
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
                Contract awarded successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {bids.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No bids received yet</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">Select</th>
                      <th className="text-left p-4 font-semibold text-foreground">Contractor</th>
                      <th className="text-left p-4 font-semibold text-foreground">Contact</th>
                      <th className="text-left p-4 font-semibold text-foreground">Bid Amount</th>
                      <th className="text-left p-4 font-semibold text-foreground">vs Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => {
                      const difference = project.approved_budget_amount - bid.bid_amount;
                      const percentDiff = ((difference / project.approved_budget_amount) * 100).toFixed(1);

                      return (
                        <tr key={bid.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            <input
                              type="radio"
                              name="winner"
                              value={bid.id}
                              checked={selectedWinnerBidId === bid.id}
                              onChange={() => setSelectedWinnerBidId(bid.id)}
                              disabled={loading}
                            />
                          </td>
                          <td className="p-4 text-foreground font-medium">
                            {bid.contractors.company_name}
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            <div>{bid.contractors.contact_person}</div>
                            <div>{bid.contractors.email}</div>
                          </td>
                          <td className="p-4 text-foreground font-semibold">
                            PHP {bid.bid_amount.toLocaleString('en-PH')}
                          </td>
                          <td className="p-4">
                            {difference >= 0 ? (
                              <Badge className="bg-green-100 text-green-800">
                                -{percentDiff}%
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                +{Math.abs(percentDiff)}%
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <Button
                  onClick={handleAwardContract}
                  disabled={loading || success || !selectedWinnerBidId}
                  className="flex-1"
                >
                  {loading ? 'Awarding...' : 'Award Contract'}
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

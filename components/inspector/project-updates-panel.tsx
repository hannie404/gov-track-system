'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Update {
  id: string;
  percentage_complete: number;
  report_text: string;
  is_approved: boolean;
  is_pending_approval: boolean;
  submitted_at: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function ProjectUpdatesPanel({
  projectId,
  updates: initialUpdates,
  userId,
}: {
  projectId: string;
  updates: Update[];
  userId: string;
}) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const supabase = createClient();

  async function handleApproveUpdate(updateId: string) {
    setApprovingId(updateId);

    try {
      const { error } = await supabase
        .from('project_updates')
        .update({
          is_approved: true,
          is_pending_approval: false,
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', updateId);

      if (!error) {
        window.location.reload();
      }
    } finally {
      setApprovingId(null);
    }
  }

  const pendingUpdates = initialUpdates.filter((u) => u.is_pending_approval);
  const approvedUpdates = initialUpdates.filter((u) => u.is_approved);

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingUpdates.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Approval ({pendingUpdates.length})
          </h3>
          {pendingUpdates.map((update) => (
            <Card key={update.id} className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Update from {update.users.first_name} {update.users.last_name}</CardTitle>
                    <CardDescription>
                      {new Date(update.submitted_at).toLocaleDateString()} at{' '}
                      {new Date(update.submitted_at).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Progress: {update.percentage_complete}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Report:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{update.report_text}</p>
                </div>
                <Button
                  onClick={() => handleApproveUpdate(update.id)}
                  disabled={approvingId === update.id}
                  className="mt-4"
                >
                  {approvingId === update.id ? 'Approving...' : 'Approve Update'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approved Updates */}
      {approvedUpdates.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Approved Updates ({approvedUpdates.length})
          </h3>
          {approvedUpdates.slice(0, 5).map((update) => (
            <Card key={update.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Update from {update.users.first_name} {update.users.last_name}</CardTitle>
                    <CardDescription>
                      {new Date(update.submitted_at).toLocaleDateString()} at{' '}
                      {new Date(update.submitted_at).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Approved</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Progress: {update.percentage_complete}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Report:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{update.report_text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {initialUpdates.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No project updates yet</p>
        </div>
      )}
    </div>
  );
}

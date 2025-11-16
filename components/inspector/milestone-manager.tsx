'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  percentage_complete: number;
  status: string;
  scheduled_start_date?: string;
  scheduled_end_date?: string;
  order_sequence: number;
}

export function MilestoneManager({
  projectId,
  milestones: initialMilestones,
  userId,
}: {
  projectId: string;
  milestones: Milestone[];
  userId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [percentage, setPercentage] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const nextSequence = (initialMilestones?.length || 0) + 1;
      
      const { error: insertError } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          title,
          description: description || null,
          percentage_complete: parseInt(percentage),
          status: 'Not_Started',
          scheduled_start_date: startDate || null,
          scheduled_end_date: endDate || null,
          order_sequence: nextSequence,
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setPercentage('0');
        setShowForm(false);
        // Trigger re-fetch in parent
        window.location.reload();
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not_Started':
        return 'bg-gray-100 text-gray-800';
      case 'In_Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Project Milestones</h3>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Milestone
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddMilestone} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="title" className="text-foreground">Milestone Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Foundation Complete"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this milestone..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-foreground">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-foreground">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="percentage" className="text-foreground">Target Completion %</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Milestone'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {initialMilestones && initialMilestones.length > 0 ? (
        <div className="space-y-3">
          {initialMilestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{milestone.title}</CardTitle>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(milestone.status)}>
                    {milestone.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-semibold text-foreground">{milestone.percentage_complete}%</span>
                  </div>
                  <Progress value={milestone.percentage_complete} className="h-2" />
                </div>
                {milestone.scheduled_start_date && milestone.scheduled_end_date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(milestone.scheduled_start_date).toLocaleDateString()} to{' '}
                    {new Date(milestone.scheduled_end_date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-muted-foreground">No milestones created yet</p>
      )}
    </div>
  );
}

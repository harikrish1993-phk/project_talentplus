'use client';

import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Submission, STATUS_LABELS, STATUS_COLORS, SubmissionStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface SubmissionKanbanProps {
  submissions: Submission[];
  onStatusChange: (submissionId: string, newStatus: SubmissionStatus) => Promise<void>;
}

export default function SubmissionKanban({ 
  submissions, 
  onStatusChange 
}: SubmissionKanbanProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Group submissions by status
  const groupedSubmissions = React.useMemo(() => {
    const groups: Record<SubmissionStatus, Submission[]> = {
      new: [],
      initial_review: [],
      internal_review: [],
      ready_for_client: [],
      submitted_to_client: [],
      client_review: [],
      interview_scheduled: [],
      interview_complete: [],
      offer_made: [],
      offer_accepted: [],
      placed: [],
      not_selected: [],
    };

    submissions.forEach((submission) => {
      if (groups[submission.status]) {
        groups[submission.status].push(submission);
      }
    });

    return groups;
  }, [submissions]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.droppableId === result.destination.droppableId) return;

    setIsUpdating(true);

    try {
      const submissionId = result.draggableId;
      const newStatus = result.destination.droppableId as SubmissionStatus;
      
      await onStatusChange(submissionId, newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Submission moved to ${STATUS_LABELS[newStatus]}`,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'We couldn\'t update the submission status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Column configuration with business-friendly labels
  const columns: Array<{
    id: SubmissionStatus;
    title: string;
    description: string;
    color: string;
  }> = [
    {
      id: 'new',
      title: 'New Submissions',
      description: 'Just submitted',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'initial_review',
      title: 'Initial Review',
      description: 'Being evaluated',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      id: 'internal_review',
      title: 'Internal Review',
      description: 'Team review',
      color: 'bg-indigo-50 border-indigo-200',
    },
    {
      id: 'ready_for_client',
      title: 'Ready for Client',
      description: 'Approved to send',
      color: 'bg-cyan-50 border-cyan-200',
    },
    {
      id: 'submitted_to_client',
      title: 'Submitted to Client',
      description: 'Sent to client',
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      id: 'client_review',
      title: 'Client Review',
      description: 'Under review',
      color: 'bg-orange-50 border-orange-200',
    },
    {
      id: 'interview_scheduled',
      title: 'Interview Scheduled',
      description: 'Upcoming interview',
      color: 'bg-pink-50 border-pink-200',
    },
    {
      id: 'interview_complete',
      title: 'Interview Complete',
      description: 'Interview done',
      color: 'bg-violet-50 border-violet-200',
    },
    {
      id: 'offer_made',
      title: 'Offer Made',
      description: 'Offer extended',
      color: 'bg-lime-50 border-lime-200',
    },
    {
      id: 'offer_accepted',
      title: 'Offer Accepted',
      description: 'Accepted offer',
      color: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'placed',
      title: 'Placed',
      description: 'Successfully placed',
      color: 'bg-green-50 border-green-200',
    },
    {
      id: 'not_selected',
      title: 'Not Selected',
      description: 'Not moving forward',
      color: 'bg-gray-50 border-gray-200',
    },
  ];

  return (
    <div className="w-full h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided: any, snapshot: any) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-shrink-0 w-80"
                >
                  <Card className={`${column.color} ${snapshot.isDraggingOver ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-semibold">
                            {column.title}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {column.description}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {groupedSubmissions[column.id].length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 min-h-[200px]">
                      {groupedSubmissions[column.id].map((submission, index) => (
                        <Draggable
                          key={submission.id}
                          draggableId={submission.id}
                          index={index}
                          isDragDisabled={isUpdating}
                        >
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging
                                  ? 'opacity-50 rotate-3'
                                  : ''
                              }`}
                            >
                              <SubmissionCard submission={submission} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {groupedSubmissions[column.id].length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No submissions
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

// Submission Card Component
function SubmissionCard({ submission }: { submission: Submission }) {
  return (
    <Card className="cursor-move hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Candidate Name */}
          <h4 className="font-semibold text-sm">
            {submission.candidate?.first_name} {submission.candidate?.last_name}
          </h4>
          
          {/* Job Title */}
          <p className="text-xs text-muted-foreground line-clamp-1">
            {submission.job?.title}
          </p>
          
          {/* Client */}
          {submission.client && (
            <p className="text-xs text-muted-foreground">
              Client: {submission.client.name}
            </p>
          )}
          
          {/* Rates */}
          {submission.bill_rate && submission.pay_rate && (
            <div className="flex justify-between text-xs pt-2 border-t">
              <span>Bill: {formatCurrency(submission.bill_rate)}</span>
              <span>Pay: {formatCurrency(submission.pay_rate)}</span>
            </div>
          )}
          
          {/* Margin */}
          {submission.margin && (
            <div className="text-xs text-green-600 font-medium">
              Margin: {submission.margin.toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
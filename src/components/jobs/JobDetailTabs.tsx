'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function JobDetailTabs({ job }: any) {
  return (
    <Tabs defaultValue="description">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="requirements">Requirements</TabsTrigger>
      </TabsList>
      <TabsContent value="description"><p>{job.description}</p></TabsContent>
      <TabsContent value="requirements"><p>Requirements...</p></TabsContent>
    </Tabs>
  );
}
"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getSoldProduce, getPendingProduce, Produce, updateProduceStatus, approveAndSellProduce } from "@/lib/data";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Loader2, Truck, Package, Check, SendToBack, ShieldCheck } from "lucide-react";
import Image from 'next/image';
import { generateQrCode } from '@/ai/flows/middleman-qr-code-generation';
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateQrCodeOutput } from "@/ai/schemas/middleman-qr-code-schemas";

export default function MiddlemanPage() {
  const [pendingList, setPendingList] = useState<Produce[]>([]);
  const [soldList, setSoldList] = useState<Produce[]>([]);
  const [processedList, setProcessedList] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchProduce = async () => {
    setIsLoading(true);
    const pendingData = await getPendingProduce();
    const soldData = await getSoldProduce();
    
    // In a real app, you'd probably fetch all statuses you care about
    const allProduce = [...pendingData, ...soldData]; // Simplified for now
    const processed = allProduce.filter(p => p.status === 'Processed');

    setPendingList(pendingData);
    setSoldList(soldData);
    setProcessedList(processed);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProduce();
  }, []);
  
  const handleApprove = async (produce: Produce) => {
    setIsUpdating(produce.id);
    try {
      // We assume the middleman is 'middleman_01'
      const updatedProduce = await approveAndSellProduce(produce.id, 'middleman_01');
      if (updatedProduce) {
        toast({
          title: "Approved & Recorded on Blockchain",
          description: `Batch ${produce.produceName} has been marked as sold.`,
        });
        setPendingList(prev => prev.filter(p => p.id !== produce.id));
        setSoldList(prev => [updatedProduce, ...prev]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve batch. See console for details.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };
  
  const handleProcess = async (produce: Produce) => {
    setIsUpdating(produce.id);
    try {
      const updatedProduce = await updateProduceStatus(produce.id, 'Processed');
      if (updatedProduce) {
        toast({
          title: "Success",
          description: `Batch ${produce.produceName} has been processed.`,
        });
        setSoldList(prev => prev.filter(p => p.id !== produce.id));
        setProcessedList(prev => [updatedProduce, ...prev]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process batch.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleGenerateQr = async (productId: string) => {
    setIsGeneratingQr(productId);
    setQrCodeData(null);
    try {
      const result: GenerateQrCodeOutput = await generateQrCode({ productId });
      setQrCodeData(result.qrCodeDataUri);
    } catch(e) {
      console.error(e);
      toast({
        title: "Error Generating QR Code",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQr(null);
    }
  };
  
  const ListSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
    </div>
  );

  return (
    <AppLayout expectedRole="Middleman">
      <div className="grid gap-8 xl:grid-cols-3 lg:items-start">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>Approve batches to sell and record on the blockchain.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <ListSkeleton /> : pendingList.length > 0 ? (
              <ul className="space-y-4">
                {pendingList.map((produce) => (
                  <li key={produce.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                    <div>
                      <p className="font-semibold">{produce.produceName}</p>
                      <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | Quality: {produce.quality}</p>
                    </div>
                    <Button onClick={() => handleApprove(produce)} disabled={isUpdating === produce.id} variant="secondary">
                      {isUpdating === produce.id ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />} Approve
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <SendToBack className="mx-auto h-12 w-12" />
                    <p className="mt-4">No pending approvals.</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Sold & Ready to Process</CardTitle>
            <CardDescription>These approved batches are ready to be processed for shipping.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <ListSkeleton /> : soldList.length > 0 ? (
              <ul className="space-y-4">
                {soldList.map((produce) => (
                  <li key={produce.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                    <div>
                      <p className="font-semibold">{produce.produceName}</p>
                      <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | ID: {produce.id}</p>
                    </div>
                    <Button onClick={() => handleProcess(produce)} disabled={isUpdating === produce.id} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      {isUpdating === produce.id ? <Loader2 className="animate-spin mr-2" /> : <Truck className="mr-2" />} Process
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">No sold produce available to process.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Processed & Ready for QR</CardTitle>
              <CardDescription>Generate QR codes for these processed batches.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <ListSkeleton /> : processedList.length > 0 ? (
                <ul className="space-y-4">
                  {processedList.map((produce) => (
                    <li key={produce.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                      <div>
                        <p className="font-semibold">{produce.produceName}</p>
                        <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | ID: {produce.id}</p>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => handleGenerateQr(produce.id)} disabled={isGeneratingQr === produce.id}>
                            {isGeneratingQr === produce.id ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />} Generate QR
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>QR Code for {produce.produceName}</DialogTitle>
                            <DialogDescription>Product ID: {produce.id}</DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center p-4">
                            {qrCodeData ? (
                                <Image src={qrCodeData} alt={`QR Code for ${produce.id}`} width={256} height={256} className="rounded-lg shadow-lg"/>
                            ) : (
                              <div className="flex items-center gap-2 h-[256px]">
                                <Loader2 className="animate-spin" />
                                <p>Generating QR Code...</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12" />
                    <p className="mt-4">Processed batches will appear here.</p>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

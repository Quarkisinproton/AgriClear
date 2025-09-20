"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAvailableProduce, getSoldProduceForMiddleman, Produce, assignMiddlemanToBatch } from "@/lib/data";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Loader2, Truck, Package, Check, SendToBack, ShieldCheck, ShoppingCart } from "lucide-react";
import Image from 'next/image';
import { generateQrCode } from '@/ai/flows/middleman-qr-code-generation';
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateQrCodeOutput } from "@/ai/schemas/middleman-qr-code-schemas";
import { useAuth } from "@/lib/auth";

export default function MiddlemanPage() {
  const { userId } = useAuth();
  const [availableList, setAvailableList] = useState<Produce[]>([]);
  const [mySoldList, setMySoldList] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState<number | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchProduce = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
        const availableData = await getAvailableProduce();
        const soldData = await getSoldProduceForMiddleman(userId);
        
        setAvailableList(availableData);
        setMySoldList(soldData);
    } catch (error: any) {
        console.error(error);
        toast({ title: "Error", description: error.message || "Failed to fetch produce data from the blockchain.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
        fetchProduce();
    }
  }, [userId]);
  
  const handlePurchase = async (produce: Produce) => {
    if (!userId) {
        toast({ title: "Error", description: "Your wallet is not connected.", variant: "destructive" });
        return;
    }
    setIsUpdating(produce.id);
    try {
      const updatedProduce = await assignMiddlemanToBatch(produce.id, userId);
      if (updatedProduce) {
        toast({
          title: "Batch Purchased",
          description: `You are now the middleman for batch ${produce.produceName}.`,
        });
        await fetchProduce();
      }
    } catch (error: any) {
      toast({
        title: "Error Purchasing Batch",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleGenerateQr = async (productId: number) => {
    setIsGeneratingQr(productId);
    setQrCodeData(null);
    try {
      const result: GenerateQrCodeOutput = await generateQrCode({ productId: productId.toString() });
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
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Available for Purchase</CardTitle>
            <CardDescription>These batches are available on the network to be purchased and distributed.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <ListSkeleton /> : availableList.length > 0 ? (
              <ul className="space-y-4">
                {availableList.map((produce) => (
                  <li key={produce.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                    <div>
                      <p className="font-semibold">{produce.produceName}</p>
                      <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | Quality: {produce.quality}</p>
                    </div>
                    <Button onClick={() => handlePurchase(produce)} disabled={isUpdating === produce.id} variant="secondary">
                      {isUpdating === produce.id ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2" />} Purchase
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <SendToBack className="mx-auto h-12 w-12" />
                    <p className="mt-4">No batches available for purchase.</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Purchased Batches</CardTitle>
              <CardDescription>Generate QR codes for batches you have purchased.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <ListSkeleton /> : mySoldList.length > 0 ? (
                <ul className="space-y-4">
                  {mySoldList.map((produce) => (
                    <li key={produce.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                      <div>
                        <p className="font-semibold">{produce.produceName}</p>
                        <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | ID: {produce.id.toString()}</p>
                      </div>

                      <Dialog onOpenChange={(open) => !open && setQrCodeData(null)}>
                        <DialogTrigger asChild>
                          <Button onClick={() => handleGenerateQr(produce.id)} disabled={isGeneratingQr === produce.id}>
                            {isGeneratingQr === produce.id ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />} Generate QR
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>QR Code for {produce.produceName}</DialogTitle>
                            <DialogDescription>Product ID: {produce.id.toString()}</DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center p-4">
                            {qrCodeData ? (
                                <>
                                    <Image src={qrCodeData} alt={`QR Code for ${produce.id}`} width={256} height={256} className="rounded-lg shadow-lg"/>
                                    <p className="mt-4 text-sm text-muted-foreground">Scan this to see product details.</p>
                                </>
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
                    <p className="mt-4">Batches you purchase will appear here.</p>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

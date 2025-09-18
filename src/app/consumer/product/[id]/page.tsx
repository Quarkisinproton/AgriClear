"use client";

import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProduceById, Produce } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Package, Tractor, Loader2, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [produce, setProduce] = useState<Produce | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
      setProduce(undefined);
      getProduceById(id).then(data => {
        setTimeout(() => setProduce(data || null), 500); // Simulate network latency
      });
    }
  }, [id]);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Harvested') return <Tractor className="h-5 w-5" />;
    if (status === 'Processed') return <Package className="h-5 w-5" />;
    if (status === 'Sold') return <DollarSign className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };
  
  const SkeletonLoader = () => (
     <CardContent>
      <div className="space-y-6">
          <div>
              <Skeleton className="h-6 w-3/5 mb-4"/>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Skeleton className="h-4 w-1/3"/>
                <Skeleton className="h-4 w-1/4"/>
                <Skeleton className="h-4 w-1/3"/>
                <Skeleton className="h-4 w-1/4"/>
              </div>
          </div>
          <div>
              <Skeleton className="h-6 w-2/5 mb-4"/>
              <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full"/>
                  <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4"/>
                      <Skeleton className="h-4 w-1/3"/>
                  </div>
              </div>
          </div>
      </div>
     </CardContent>
  );

  return (
    <AppLayout expectedRole="Consumer">
      <Link href="/consumer/scan" className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Scan another product
      </Link>
      
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          {produce === undefined && <CardTitle> <Loader2 className="inline-block mr-2 animate-spin"/> Loading product details...</CardTitle>}
          {produce === null && <CardTitle>Product Not Found</CardTitle>}
          {produce && (
            <>
              <CardTitle className="text-3xl font-headline">{produce.produceName}</CardTitle>
              <CardDescription>Product ID: {produce.id}</CardDescription>
            </>
          )}
        </CardHeader>
        {produce === undefined ? <SkeletonLoader /> : produce ? (
          <CardContent>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2 border-b pb-2">Product Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                  <p className="text-muted-foreground">Number of Units:</p>
                  <p>{produce.numberOfUnits}</p>
                  <p className="text-muted-foreground">Current Status:</p>
                  <p className="font-medium text-primary">{produce.status}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Journey History</h3>
                <ul className="space-y-2">
                  {produce.statusHistory.map((historyItem, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center mt-1">
                        <div className={cn("rounded-full p-2", index === produce.statusHistory.length -1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                          <StatusIcon status={historyItem.status} />
                        </div>
                        {index < produce.statusHistory.length - 1 && <div className="w-px h-10 bg-border my-1"></div>}
                      </div>
                      <div className="pt-1">
                        <p className="font-semibold">{historyItem.status}</p>
                        <p className="text-sm text-muted-foreground">{historyItem.timestamp}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">We couldn't find any details for this product ID. Please check the ID and try again.</p>
          </CardContent>
        )}
      </Card>
    </AppLayout>
  );
}

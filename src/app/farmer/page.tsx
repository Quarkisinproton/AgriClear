"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addProduce, getProduceForFarmer, Produce } from "@/lib/data";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Carrot, PlusCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Inputs = {
  produceName: string;
  numberOfUnits: string;
};

export default function FarmerPage() {
  const [produceList, setProduceList] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<Inputs>();

  const fetchProduce = async () => {
    setIsLoading(true);
    const data = await getProduceForFarmer("farmer_01");
    setProduceList(data);
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchProduce();
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await addProduce(data.produceName, Number(data.numberOfUnits), "farmer_01");
      toast({
        title: "Success",
        description: "New produce batch has been added.",
      });
      reset();
      fetchProduce();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add produce.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout expectedRole="Farmer">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Produce Batch</CardTitle>
            <CardDescription>Enter details for a new batch of produce you've harvested.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-2">
                <Label htmlFor="produceName">Produce Name</Label>
                <Input id="produceName" {...register("produceName", { required: "Produce name is required" })} placeholder="e.g., Organic Tomatoes" />
                {errors.produceName && <p className="text-sm text-destructive">{errors.produceName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfUnits">Number of Units</Label>
                <Input id="numberOfUnits" type="number" {...register("numberOfUnits", { required: "Number of units is required", min: { value: 1, message: "Must be at least 1" } })} placeholder="e.g., 150" />
                {errors.numberOfUnits && <p className="text-sm text-destructive">{errors.numberOfUnits.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground mt-auto">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />} Submit Batch
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Produce Batches</CardTitle>
            <CardDescription>A list of all the produce you have registered.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : produceList.length > 0 ? (
              <ul className="space-y-4">
                {produceList.map((produce) => (
                  <li key={produce.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                    <div className="flex items-center gap-4">
                      <Carrot className="w-8 h-8 text-accent" />
                      <div>
                        <p className="font-semibold">{produce.produceName}</p>
                        <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | ID: {produce.id}</p>
                      </div>
                    </div>
                    <Badge variant={produce.status === 'Harvested' ? 'secondary' : 'default'} className={produce.status === 'Processed' ? 'bg-primary text-primary-foreground' : ''}>
                      {produce.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">You haven't added any produce yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

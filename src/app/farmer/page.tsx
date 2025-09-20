"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addProduce, getProduceForFarmer, Produce } from "@/lib/data";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Carrot, PlusCircle, Loader2, Hourglass, CheckCircle, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";

type Inputs = {
  produceName: string;
  numberOfUnits: string;
  quality: Produce['quality'];
};

export default function FarmerPage() {
  const { user, role, userId } = useAuth();
  const [produceList, setProduceList] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, reset, control, formState: { isSubmitting, errors } } = useForm<Inputs>({
      defaultValues: {
          quality: 'Grade A',
      }
  });

  const fetchProduce = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
        const data = await getProduceForFarmer(userId);
        setProduceList(data);
    } catch(e: any) {
        console.error(e);
        toast({ title: "Error", description: e.message || "Could not fetch data from the blockchain.", variant: "destructive" });
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (userId) {
      fetchProduce();
    }
  }, [userId]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!userId) {
        toast({ title: "Error", description: "Farmer not identified.", variant: "destructive" });
        return;
    }
    try {
      await addProduce(data.produceName, Number(data.numberOfUnits), data.quality, userId);
      toast({
        title: "Success",
        description: "New produce batch has been recorded on the blockchain.",
      });
      reset();
      fetchProduce(); // Refetch to show the new batch
    } catch (error: any) {
      toast({
        title: "Error Recording Batch",
        description: error.message || "Failed to add produce.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Produce['status']) => {
    switch (status) {
        case 'Sold':
            return <Badge variant="secondary" className="bg-green-600 text-white">Sold</Badge>;
        case 'Created':
            return <Badge variant="outline">Ready for Sale</Badge>;
        default:
            return <Badge variant="default">{status}</Badge>;
    }
  }
  
    const getStatusIcon = (status: Produce['status']) => {
        switch (status) {
            case 'Sold':
                return <CheckCircle className="w-8 h-8 text-green-600" />;
            case 'Created':
                return <Box className="w-8 h-8 text-primary" />;
            default:
                return <Carrot className="w-8 h-8 text-accent" />;
        }
    }

  return (
    <AppLayout expectedRole="Farmer">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Record New Produce Batch</CardTitle>
            <CardDescription>Enter details for a new batch of produce to record it on the blockchain.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="space-y-2">
                <Label htmlFor="produceName">Produce Name</Label>
                <Input id="produceName" {...register("produceName", { required: "Produce name is required" })} placeholder="e.g., Organic Tomatoes" />
                {errors.produceName && <p className="text-sm text-destructive">{errors.produceName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfUnits">Number of Units (e.g. kgs)</Label>
                <Input id="numberOfUnits" type="number" {...register("numberOfUnits", { required: "Number of units is required", min: { value: 1, message: "Must be at least 1" } })} placeholder="e.g., 150" />
                {errors.numberOfUnits && <p className="text-sm text-destructive">{errors.numberOfUnits.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="quality">Quality Grade</Label>
                 <Controller
                    name="quality"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="quality">
                                <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Grade A">Grade A</SelectItem>
                                <SelectItem value="Grade B">Grade B</SelectItem>
                                <SelectItem value="Grade C">Grade C</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.quality && <p className="text-sm text-destructive">{errors.quality.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground self-end">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />} Record on Blockchain
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Recorded Batches</CardTitle>
            <CardDescription>A list of all the produce you have recorded on the blockchain.</CardDescription>
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
                      {getStatusIcon(produce.status)}
                      <div>
                        <p className="font-semibold">{produce.produceName}</p>
                        <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | Quality: {produce.quality} | Batch ID: {produce.id.toString()}</p>
                      </div>
                    </div>
                    {getStatusBadge(produce.status)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">You haven't recorded any produce on the blockchain yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

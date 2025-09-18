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
import { Carrot, PlusCircle, Loader2, Hourglass, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Inputs = {
  produceName: string;
  numberOfUnits: string;
  quality: Produce['quality'];
};

export default function FarmerPage() {
  const [produceList, setProduceList] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, reset, control, formState: { isSubmitting, errors } } = useForm<Inputs>({
      defaultValues: {
          quality: 'Grade A',
      }
  });

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
      await addProduce(data.produceName, Number(data.numberOfUnits), data.quality, "farmer_01");
      toast({
        title: "Success",
        description: "New produce batch has been submitted for approval.",
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

  const getStatusBadge = (status: Produce['status']) => {
    switch (status) {
      case 'Sold':
        return <Badge variant="secondary" className="bg-green-600 text-white">Sold</Badge>;
      case 'Processed':
        return <Badge className="bg-primary text-primary-foreground">Processed</Badge>;
      case 'Request Pending':
        return <Badge variant="outline">Request Pending</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  }
  
    const getStatusIcon = (status: Produce['status']) => {
        switch (status) {
            case 'Sold':
                return <CheckCircle className="w-8 h-8 text-green-600" />;
            case 'Processed':
                return <Carrot className="w-8 h-8 text-primary" />;
            case 'Request Pending':
                return <Hourglass className="w-8 h-8 text-amber-500" />;
            default:
                return <Carrot className="w-8 h-8 text-accent" />;
        }
    }

  return (
    <AppLayout expectedRole="Farmer">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Register Produce Batch for Sale</CardTitle>
            <CardDescription>Enter details for a new batch of produce you want to sell.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
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
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />} Submit for Approval
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
                      {getStatusIcon(produce.status)}
                      <div>
                        <p className="font-semibold">{produce.produceName}</p>
                        <p className="text-sm text-muted-foreground">Units: {produce.numberOfUnits} | Quality: {produce.quality} | ID: {produce.id}</p>
                      </div>
                    </div>
                    {getStatusBadge(produce.status)}
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

"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Inputs = {
  productId: string;
};

export default function ScanPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Inputs>();
  const { toast } = useToast();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!data.productId.trim()) {
        toast({
            title: "Invalid ID",
            description: "Please enter a product ID.",
            variant: "destructive",
        });
        return;
    }
    router.push(`/consumer/product/${data.productId.trim()}`);
  };

  return (
    <AppLayout expectedRole="Consumer">
      <Link href="/consumer" className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to consumer home
      </Link>
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter Product ID</CardTitle>
            <CardDescription>Manually enter the ID found on the product to see its details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input {...register("productId", { required: "Product ID is required" })} placeholder="e.g., prod_1a2b3c" />
                 {errors.productId && <p className="text-sm text-destructive">{errors.productId.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Search className="mr-2" /> Find Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

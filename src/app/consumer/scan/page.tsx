"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { ArrowLeft, Search, Camera, CameraOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

type Inputs = {
  productId: string;
};

export default function ScanPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Inputs>();
  const { toast } = useToast();

  const [scanMode, setScanMode] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const getCameraPermission = async () => {
      if (!scanMode) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        tick();
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings.",
        });
        setScanMode(false);
      }
    };

    const tick = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    // The QR code data is the product ID itself.
                    const productId = code.data;
                    if (productId) {
                        // Stop scanning and navigate
                        setScanMode(false); 
                        router.push(`product/${productId}`);
                        return; 
                    }
                }
            }
        }
        animationFrameId = requestAnimationFrame(tick);
    };

    if (scanMode) {
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
       if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [scanMode, router, toast]);

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
            <CardTitle>{scanMode ? "Scan QR Code" : "Enter Product ID"}</CardTitle>
            <CardDescription>
              {scanMode
                ? "Point your camera at the QR code on the product."
                : "Manually enter the ID found on the product to see its details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scanMode ? (
              <div className="space-y-4">
                <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                  {hasCameraPermission === false && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-4 text-center">
                        <CameraOff className="w-12 h-12 mb-2" />
                        <p className="font-semibold">Camera Access Denied</p>
                        <p className="text-sm">Please allow camera access in your browser settings.</p>
                     </div>
                  )}
                </div>
                 <Button onClick={() => setScanMode(false)} className="w-full" variant="outline">
                    Cancel and Enter ID Manually
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
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

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                <Button onClick={() => setScanMode(true)} className="w-full" variant="secondary">
                  <Camera className="mr-2" /> Scan QR Code
                </Button>
              </div>
            )}
             {hasCameraPermission === null && scanMode && (
                <div className="flex items-center justify-center p-4 text-muted-foreground">
                    Requesting camera access...
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

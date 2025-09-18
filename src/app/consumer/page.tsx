"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanLine } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ConsumerPage() {
  return (
    <AppLayout expectedRole="Consumer">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
             <div className="flex justify-center mb-4">
              <Image 
                data-ai-hint="farm produce"
                src="https://picsum.photos/seed/agritrack/400/200"
                alt="Fresh produce"
                width={400}
                height={200}
                className="rounded-t-lg object-cover"
              />
            </div>
            <CardTitle className="text-2xl font-headline">Welcome to AgriTrack</CardTitle>
            <CardDescription>Scan a product's QR code to learn its story.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/consumer/scan" passHref>
              <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <ScanLine className="mr-2" /> Scan Product QR Code
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">For this prototype, you will enter the product ID manually.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

"use client";

import { useState, useTransition } from "react";

import { Truck, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrderTracking } from "@/app/seller/orders/actions";
import { SHIPPING_COMPANIES } from "@/app/seller/orders/constants";
import { useToast } from "@/hooks/use-toast";

type TrackingInfoFormProps = {
  orderId: string;
  initialData: {
    tracking_number: string | null;
    shipping_company: string | null;
    estimated_delivery: string | null;
  };
};

export function TrackingInfoForm({ orderId, initialData }: TrackingInfoFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [trackingNumber, setTrackingNumber] = useState(initialData.tracking_number ?? "");
  const [shippingCompany, setShippingCompany] = useState(initialData.shipping_company ?? "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    initialData.estimated_delivery ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateOrderTracking(orderId, {
        tracking_number: trackingNumber.trim() || null,
        shipping_company: shippingCompany || null,
        estimated_delivery: estimatedDelivery || null,
      });

      if (result.ok) {
        toast({
          title: "Tracking updated",
          description: "Shipping information has been saved successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error ?? "Failed to update tracking information.",
          variant: "destructive",
        });
      }
    });
  };

  const hasChanges =
    trackingNumber !== (initialData.tracking_number ?? "") ||
    shippingCompany !== (initialData.shipping_company ?? "") ||
    estimatedDelivery !== (initialData.estimated_delivery ?? "");

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="bg-masa-light/50">
        <CardTitle className="font-luxury text-primary flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping & Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shipping_company" className="text-sm font-sans">
              Shipping Company
            </Label>
            <Select value={shippingCompany} onValueChange={setShippingCompany}>
              <SelectTrigger id="shipping_company" className="bg-white">
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_COMPANIES.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking_number" className="text-sm font-sans">
              Tracking Number
            </Label>
            <Input
              id="tracking_number"
              type="text"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="bg-white font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_delivery" className="text-sm font-sans">
              Estimated Delivery Date
            </Label>
            <Input
              id="estimated_delivery"
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="bg-white"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !hasChanges}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Tracking Info
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

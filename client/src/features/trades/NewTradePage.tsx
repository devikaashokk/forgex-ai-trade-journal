// client/src/features/trades/NewTradePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TradeForm } from "./TradeForm";
import { createTradeApi } from "./trades.api";
import { TradeSchemaType } from "./trades.schema";
import { toast } from "@/hooks/use-toast";
import { getApiError } from "@/lib/utils";

export function NewTradePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TradeSchemaType) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await createTradeApi({
        ...data,
        openedAt: new Date(data.openedAt).toISOString(),
        closedAt: new Date(data.closedAt).toISOString(),
      });

      toast({ title: "Trade logged successfully", variant: "success" });
      navigate("/trades");
    } catch (err) {
      toast({
        title: "Failed to log trade",
        description: getApiError(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isSubmitting}
          onClick={() => navigate("/trades")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-display font-bold">Log Trade</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record a completed trade in your journal
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
          <CardDescription>
            Fill in all fields accurately. P&L and R:R are calculated
            automatically.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <TradeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={isSubmitting ? "Logging trade..." : "Log Trade"}
            onCancel={() => {
              if (!isSubmitting) navigate("/trades");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
// client/src/features/trades/EditTradePage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Trade } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TradeForm } from "./TradeForm";
import { getTradeByIdApi, updateTradeApi } from "./trades.api";
import { TradeSchemaType } from "./trades.schema";
import { toast } from "@/hooks/use-toast";
import { getApiError } from "@/lib/utils";

export function EditTradePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTradeByIdApi(id)
      .then(setTrade)
      .catch(() => {
        toast({ title: "Trade not found", variant: "destructive" });
        navigate("/trades");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (data: TradeSchemaType) => {
    if (!id) return;
    try {
      await updateTradeApi(id, {
        ...data,
        openedAt: new Date(data.openedAt).toISOString(),
        closedAt: new Date(data.closedAt).toISOString(),
      });
      toast({ title: "Trade updated", variant: "success" });
      navigate("/trades");
    } catch (err) {
      toast({
        title: "Failed to update trade",
        description: getApiError(err),
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/trades")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Edit Trade</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update this trade record in your journal
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
          <CardDescription>Edit trade information. P&L recalculates automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : trade ? (
            <TradeForm
              defaultValues={trade}
              onSubmit={handleSubmit}
              isSubmitting={false}
              submitLabel="Save Changes"
              onCancel={() => navigate("/trades")}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

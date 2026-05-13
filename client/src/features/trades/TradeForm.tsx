// client/src/features/trades/TradeForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Trade } from "@/types";
import { tradeSchema, TradeSchemaType, FOREX_PAIRS, EMOTION_OPTIONS } from "./trades.schema";
import { toLocalDateTimeString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TradeFormProps {
  defaultValues?: Partial<Trade>;
  onSubmit: (data: TradeSchemaType) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function TradeForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  onCancel,
}: TradeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TradeSchemaType>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      pair: defaultValues?.pair ?? "",
      direction: defaultValues?.direction ?? "LONG",
      entryPrice: defaultValues?.entryPrice,
      exitPrice: defaultValues?.exitPrice,
      stopLoss: defaultValues?.stopLoss,
      takeProfit: defaultValues?.takeProfit,
      lotSize: defaultValues?.lotSize ?? 0.01,
      emotion: defaultValues?.emotion ?? "NEUTRAL",
      notes: defaultValues?.notes ?? "",
      openedAt: defaultValues?.openedAt
        ? toLocalDateTimeString(new Date(defaultValues.openedAt))
        : toLocalDateTimeString(new Date()),
      closedAt: defaultValues?.closedAt
        ? toLocalDateTimeString(new Date(defaultValues.closedAt))
        : toLocalDateTimeString(new Date()),
    },
  });

  const direction = watch("direction");
  const selectedEmotion = watch("emotion");

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Section: Trade Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Trade Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pair */}
          <div className="space-y-1.5">
            <Label>Currency Pair</Label>
            <Select
              defaultValue={defaultValues?.pair ?? ""}
              onValueChange={(v) => setValue("pair", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pair..." />
              </SelectTrigger>
              <SelectContent>
                {FOREX_PAIRS.map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className="font-mono">{p}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Allow manual override */}
            <Input
              placeholder="Or type custom pair (e.g. USD/MXN)"
              {...register("pair")}
              className="text-sm"
            />
            <FieldError message={errors.pair?.message} />
          </div>

          {/* Direction */}
          <div className="space-y-1.5">
            <Label>Direction</Label>
            <div className="flex gap-2">
              {(["LONG", "SHORT"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("direction", d)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-md border text-sm font-semibold transition-all",
                    direction === d
                      ? d === "LONG"
                        ? "bg-forge-500/10 border-forge-500 text-forge-500"
                        : "bg-red-500/10 border-red-500 text-red-500"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {d === "LONG" ? "▲ Long" : "▼ Short"}
                </button>
              ))}
            </div>
            <FieldError message={errors.direction?.message} />
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              { name: "entryPrice", label: "Entry Price" },
              { name: "exitPrice", label: "Exit Price" },
              { name: "stopLoss", label: "Stop Loss" },
              { name: "takeProfit", label: "Take Profit" },
            ] as const
          ).map(({ name, label }) => (
            <div key={name} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                type="number"
                step="0.00001"
                placeholder="0.00000"
                className="font-mono"
                {...register(name)}
              />
              <FieldError message={errors[name]?.message} />
            </div>
          ))}
        </div>

        {/* Lot size */}
        <div className="max-w-[160px] space-y-1.5">
          <Label>Lot Size</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.01"
            className="font-mono"
            {...register("lotSize")}
          />
          <FieldError message={errors.lotSize?.message} />
        </div>
      </div>

      {/* Section: Time */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Timing
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Opened At</Label>
            <Input type="datetime-local" {...register("openedAt")} />
            <FieldError message={errors.openedAt?.message} />
          </div>
          <div className="space-y-1.5">
            <Label>Closed At</Label>
            <Input type="datetime-local" {...register("closedAt")} />
            <FieldError message={errors.closedAt?.message} />
          </div>
        </div>
      </div>

      {/* Section: Psychology */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Psychology
        </h3>

        <div className="space-y-1.5">
          <Label>Emotional State</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {EMOTION_OPTIONS.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue("emotion", value)}
                className={cn(
                  "text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                  selectedEmotion === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className="font-medium">{label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {description}
                </div>
              </button>
            ))}
          </div>
          <FieldError message={errors.emotion?.message} />
        </div>

        <div className="space-y-1.5">
          <Label>Trade Notes</Label>
          <Textarea
            placeholder="What was your setup? What did you observe? How did you feel during the trade? What would you do differently?"
            className="min-h-[120px] text-sm"
            {...register("notes")}
          />
          <p className="text-xs text-muted-foreground">
            Detailed notes help the AI coach give better feedback
          </p>
          <FieldError message={errors.notes?.message} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="flex-1 sm:flex-none sm:min-w-[140px]">
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}

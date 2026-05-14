// client/src/features/auth/RegisterPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, User, Mail, Lock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { registerApi } from "./auth.api";
import { toast } from "@/hooks/use-toast";
import { getApiError } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  initialBalance: z.coerce.number().min(0, "Balance cannot be negative"),
  currency: z.string().default("INR"),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      initialBalance: 50000,
      currency: "INR",
    },
  });
  const onSubmit = async (data: FormData) => {
    try {
      const res = await registerApi(data);
      login(res.user, res.accessToken, res.refreshToken);
      toast({ title: `Account created! Welcome, ${res.user.name.split(" ")[0]}!`, variant: "success" });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Registration failed", description: getApiError(err), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">ForgeX</span>
        </div>

        <h1 className="text-2xl font-display font-bold mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Alex Trader"
                className="pl-9"
                {...register("name")}
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="initialBalance">Starting Trading Balance</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="initialBalance"
                type="number"
                placeholder="50000"
                className="pl-9"
                {...register("initialBalance")}
              />
            </div>
            {errors.initialBalance && (
              <p className="text-xs text-destructive">{errors.initialBalance.message}</p>
            )}
          </div>

          <input type="hidden" value="INR" {...register("currency")} />
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                className="pl-9"
                {...register("password")}
              />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create Account
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By creating an account, you agree to our Terms of Service.
          </p>
        </form>
      </motion.div>
    </div>
  );
}

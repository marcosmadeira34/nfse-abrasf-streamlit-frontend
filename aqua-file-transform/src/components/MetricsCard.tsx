// MetricsCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  className?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
  delay?: number;
}

const MetricsCard = ({ 
  className,
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon, 
  delay = 0 
}: MetricsCardProps) => {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden gradient-card shadow-card hover-lift",
        "animate-fade-in border-border/50",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-card-foreground text-sm font-medium">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-card-foreground">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                {trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-secondary" />
                ) : trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : null}
                <span className={cn(
                  "text-xs font-medium",
                  trend === "up" ? "text-secondary" : 
                  trend === "down" ? "text-destructive" : 
                  "text-muted-foreground"
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <div className="text-primary">
              {icon}
            </div>
          </div>
        </div>
        
        {/* Gradient overlay effect */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-xl" />
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
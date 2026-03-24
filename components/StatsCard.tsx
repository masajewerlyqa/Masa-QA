import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  changePositive?: boolean;
}

export function StatsCard({ label, value, change, icon: Icon, changePositive = true }: StatsCardProps) {
  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" aria-hidden />
          {change != null && (
            <Badge
              variant="outline"
              className={`text-[10px] md:text-xs ${changePositive ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}`}
            >
              {change}
            </Badge>
          )}
        </div>
        <p className="text-xl md:text-3xl mb-0.5 md:mb-1 font-luxury text-primary">{value}</p>
        <p className="text-xs md:text-sm text-masa-gray font-sans">{label}</p>
      </CardContent>
    </Card>
  );
}

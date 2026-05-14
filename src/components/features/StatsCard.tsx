import { Card, CardContent } from '@/components/ui/Card';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
}

export function StatsCard({ icon, label, value, trend }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2 text-lg">
        {icon}
      </div>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="text-4xl font-bold text-foreground mt-2">{value}</p>
        {trend && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className="inline-block bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {trend}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

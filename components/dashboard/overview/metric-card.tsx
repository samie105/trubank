import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MetricCardProps {
  title: string
  value: string
  showEye?: boolean
  showMore?: boolean
}

export function MetricCard({ title, value, showEye = false, showMore = false }: MetricCardProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          {showEye && <Eye className="h-4 w-4 text-muted-foreground" />}
          {showMore && (
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Show more
            </Button>
          )}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

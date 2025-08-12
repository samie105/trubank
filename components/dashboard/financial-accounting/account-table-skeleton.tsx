import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

interface AccountTableSkeletonProps {
  rows?: number
}

export function AccountTableSkeleton({ rows = 5 }: AccountTableSkeletonProps) {
  return (
    <>
      {Array(rows)
        .fill(null)
        .map((_, rowIndex) => (
          <TableRow key={`skeleton-row-${rowIndex}`}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-8 w-8 rounded-md ml-auto" />
            </TableCell>
          </TableRow>
        ))}
    </>
  )
}

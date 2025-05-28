import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  columns: number
  rows?: number
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array(rows)
        .fill(null)
        .map((_, rowIndex) => (
          <TableRow key={`skeleton-row-${rowIndex}`} className="">
            {Array(columns)
              .fill(null)
              .map((_, colIndex) => (
                <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : colIndex === columns - 1 ? (
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  ) : (
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  )}
                </TableCell>
              ))}
          </TableRow>
        ))}
    </>
  )
}


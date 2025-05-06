import { Skeleton } from "@/components/ui/skeleton"
import { FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface DropdownSkeletonProps {
  label: string
}

export function DropdownSkeleton({ label }: DropdownSkeletonProps) {
  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Button variant="outline" role="combobox" className="w-full justify-between" disabled>
          <Skeleton className="h-4 w-24" />
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </FormControl>
    </FormItem>
  )
}


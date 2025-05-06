import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function BusinessFormSkeleton() {
  return (
    <Card className="w-full border-none max-w-4xl">
      <CardHeader>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Details Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 mb-4" />

          <div className="grid grid-cols-1 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  )
}


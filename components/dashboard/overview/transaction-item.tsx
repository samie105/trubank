import { ArrowDown, ArrowUp } from "lucide-react"

interface TransactionItemProps {
  type: "sent" | "received"
  name: string
  amount: string
}

export function TransactionItem({ type, name, amount }: TransactionItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${type === "received" ? "bg-green-100" : "bg-red-100"}`}
      >
        {type === "received" ? (
          <ArrowDown className="h-5 w-5 text-green-600" />
        ) : (
          <ArrowUp className="h-5 w-5 text-red-600" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{name}</p>
      </div>
      <span className={`font-medium ${type === "received" ? "text-green-600" : "text-red-600"}`}>{amount}</span>
    </div>
  )
}

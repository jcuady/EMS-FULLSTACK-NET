import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface CardKPIProps {
  title: string
  value: string | number
  description: string
  icon?: LucideIcon
}

export function CardKPI({ title, value, description, icon: Icon }: CardKPIProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className="text-xs text-zinc-500 mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Card 1 */}
      <Card className="bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 shadow-md hover:shadow-lg hover:border-zinc-500/50 transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardDescription className="text-zinc-400">Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <TrendingUpIcon className="size-4 mr-1" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-green-400">
            Trending up this month <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-zinc-400">Visitors for the last 6 months</div>
        </CardFooter>
      </Card>

      {/* Card 2 */}
      <Card className="bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 shadow-md hover:shadow-lg hover:border-zinc-500/50 transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardDescription className="text-zinc-400">New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <TrendingDownIcon className="size-4 mr-1" />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-red-400">
            Down 20% this period <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-zinc-400">Acquisition needs attention</div>
        </CardFooter>
      </Card>

      {/* Card 3 */}
      <Card className="bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 shadow-md hover:shadow-lg hover:border-zinc-500/50 transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardDescription className="text-zinc-400">Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <TrendingUpIcon className="size-4 mr-1" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-green-400">
            Strong user retention <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-zinc-400">Engagement exceed targets</div>
        </CardFooter>
      </Card>

      {/* Card 4 */}
      <Card className="bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 shadow-md hover:shadow-lg hover:border-zinc-500/50 transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <CardDescription className="text-zinc-400">Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <TrendingUpIcon className="size-4 mr-1" />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-green-400">
            Steady performance increase <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-zinc-400">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

type ChartConfig = Record<string, any>

const ChartContext = React.createContext<ChartConfig | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={config}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-axis_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-default-tooltip]:!bg-background [&_.recharts-default-tooltip]:!border-border [&_.recharts-default-tooltip]:!rounded-[8px] [&_.recharts-default-tooltip]:!shadow-md",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  return null
}
ChartStyle.displayName = "ChartStyle"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: any[]
    label?: string
    indicator?: "line" | "dot" | "dashed"
    hideLabel?: boolean
    hideIndicator?: boolean
  }
>(({ active, payload, label, className, indicator = "dot", hideLabel = false, hideIndicator = false, ...props }, ref) => {
  const { config } = useChart()

  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!hideLabel && label && (
        <div className="text-muted-foreground">{label}</div>
      )}
      {payload.map((item: any, index: number) => {
        const key = `${item.dataKey}`
        const itemConfig: any = config[key as keyof typeof config]
        const value = `${item.value}`

        return (
          <div
            key={`${key}-${index}`}
            className="flex w-full flex-wrap items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5"
          >
            {!hideIndicator && (
              <div
                className="shrink-0 rounded-[2px] bg-[--color-bg]"
                style={{
                  "--color-bg": item.color,
                } as React.CSSProperties}
              />
            )}
            <span className="flex-1 text-muted-foreground">
              {itemConfig?.label || key}
            </span>
            <span className="font-mono font-medium text-foreground">
              {value}
            </span>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    payload?: any[]
    verticalAlign?: "top" | "middle" | "bottom"
  }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-wrap justify-center gap-4", className)}
    {...props}
  />
))
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
}

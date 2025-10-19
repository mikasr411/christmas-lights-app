import * as React from "react"
import { Slot as SlotPrimitive } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const Slot = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive>,
  React.ComponentPropsWithoutRef<typeof SlotPrimitive>
>(({ className, ...props }, ref) => (
  <SlotPrimitive
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
Slot.displayName = SlotPrimitive.displayName

export { Slot }





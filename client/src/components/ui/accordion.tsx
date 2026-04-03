"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCollapsibleContext } from "@/components/CollapseAllToggle";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName ?? "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName ?? "AccordionContent";

/**
 * Accordion (controlled by Collapsible context)
 *
 * Usage notes:
 * - Each AccordionItem SHOULD have a stable `value` prop (string).
 *   Example:
 *   <Accordion value={...}>
 *     <AccordionItem value="item-1">...</AccordionItem>
 *     <AccordionItem value="item-2">...</AccordionItem>
 *   </Accordion>
 *
 * - The CollapsibleProvider exposes globalState: undefined | true | false
 *     undefined -> uncontrolled accordion (keeps current behavior)
 *     false -> collapse all (value = [])
 *     true -> expand all (value = all item values)
 */
export const Accordion: React.FC<React.PropsWithChildren<Record<string, any>>> = ({
  children,
  ...props
}) => {
  const { globalState } = useCollapsibleContext();

  // Recursively collect `value` props from AccordionItem elements under `children`.
  const collectValues = (nodes: React.ReactNode): string[] => {
    const values: string[] = [];
    const helper = (n: React.ReactNode) => {
      React.Children.forEach(n, (child) => {
        if (!React.isValidElement(child)) return;
        const c: any = child;
        // If this element is an AccordionItem (or any element with a `value` prop), capture it.
        if (c.props && typeof c.props.value === "string") {
          values.push(c.props.value);
        }
        // Recurse into children of this element
        if (c.props && c.props.children) {
          helper(c.props.children);
        }
      });
    };
    helper(nodes);
    return values;
  };

  const itemValues = React.useMemo(() => collectValues(children), [children]);

  // Controlled value:
  // - undefined => don't pass `value` prop (uncontrolled)
  // - false => collapse all => pass []
  // - true => expand all => pass all values found
  const controlledValue: string[] | undefined =
    globalState === undefined ? undefined : globalState ? itemValues : [];

  // Use type="multiple" so multiple items can be open at once.
  // Only attach `value` prop when controlledValue is not undefined.
  const rootProps =
    controlledValue === undefined
      ? { type: "multiple" as const }
      : ({ type: "multiple" as const, value: controlledValue } as const);

  return (
    // spreading rootProps will either include value or not depending on controlledValue
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - radix types are picky about value type based on type prop
    <AccordionPrimitive.Root {...rootProps} {...props}>
      {children}
    </AccordionPrimitive.Root>
  );
};
Accordion.displayName = "Accordion";

export { AccordionItem, AccordionTrigger, AccordionContent };

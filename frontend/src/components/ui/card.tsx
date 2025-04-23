import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// New BookCard component using your existing card structure
interface BookCardProps extends React.ComponentProps<"div"> {
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  onSale?: boolean;
}

function BookCard({
  title,
  author,
  price,
  originalPrice,
  imageUrl,
  className,
  ...props
}: BookCardProps) {
  return (
    <Card
      className={cn(
        "w-full lg:w-64 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow border-0",
        className
      )}
      {...props}
    >
      {/* Image Container */}
      <CardContent className="relative p-0 aspect-[3/4] h-64 lg:h-64">
        <img
          src={imageUrl}
          alt={title}
          className="object-cover w-full h-full"
        />
      </CardContent>

      {/* Text Content */}
      <CardContent className="p-2 lg:p-3">
        <CardTitle className="font-semibold text-lg truncate">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 truncate">
          {author}
        </CardDescription>
      </CardContent>

      {/* Add to Cart Footer */}
      <CardFooter className="p-2 lg:p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mt-2">
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-black font-bold">
            ${price.toFixed(2)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

// Add BookCard to your exports
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  BookCard
};

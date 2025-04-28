import * as React from "react"
import { cn } from "@/lib/utils"
import { Link } from 'react-router-dom';

// Convert the factory pattern to individually named components for Fast Refresh compatibility
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
);
CardAction.displayName = "CardAction";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

// BookCard component
// BookCard component
interface BookCardProps extends Omit<React.ComponentProps<"div">, "id"> {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  onSale?: boolean;
}


// Update the BookCard component to wrap it in a Link
const BookCard = React.forwardRef<HTMLDivElement, BookCardProps>(
  ({ title, author, price, originalPrice, imageUrl, id, className, ...props }, ref) => {
    return (
      <Link to={`/book/${id}`} className="block w-full lg:w-64 no-underline text-inherit">
        <Card ref={ref} className={cn("overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow border-0", className)} {...props}>
          <CardContent className="relative p-0 aspect-[3/4] h-64 lg:h-64">
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full"
              onError={(e) => {e.currentTarget.src = "/book.png"}}
            />
          </CardContent>
          <CardContent className="p-2 lg:p-3 border-t border-gray-200">
            <CardTitle className="font-semibold text-lg truncate">{title}</CardTitle>
            <CardDescription className="text-sm text-gray-600 truncate">{author}</CardDescription>
          </CardContent>
          <CardFooter className="pl-2 pb-4 border-t border-gray-100 bg-gray-200">
            <div className="flex items-center gap-2">
              {originalPrice && <span className="text-sm line-through">${originalPrice}</span>}
              <span className="text-black font-bold">${price}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  }
);
BookCard.displayName = "BookCard";

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, BookCard };

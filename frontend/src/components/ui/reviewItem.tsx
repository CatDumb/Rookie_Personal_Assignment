import { Star } from "lucide-react";

interface ReviewItemProps {
  title: string;
  author: string;
  date: string;
  rating: number;
  content: string;
}

export function ReviewItem({ title, author, date, rating, content }: ReviewItemProps) {
  // Format the date to a more readable format
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex items-center">
          {Array(5).fill(0).map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>By {author}</span>
        <span>{formattedDate}</span>
      </div>

      <p className="text-gray-700">{content}</p>
    </div>
  );
}

interface ReviewItemProps {
  title: string;
  date: string;
  rating: number;
  content: string;
}

export function ReviewItem({ title, date, rating, content }: ReviewItemProps) {
  // Format the date to a more readable format
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-xl break-words overflow-hidden">{title} | <span className="text-gray-500 text-sm">{rating} Star</span></h3>
      </div>

      <p className="text-gray-700 break-words overflow-hidden">{content}</p>

      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}

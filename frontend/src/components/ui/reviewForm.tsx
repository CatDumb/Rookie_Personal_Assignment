import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { postReview } from "../../api/review"

const FormSchema = z.object({
  review_title: z.string().min(1, {
    message: "Title must be at least 1 characters.",
  }).max(120, {
    message: "Title cannot exceed 120 characters.",
  }),
  review_details: z.string().max(1000, {
    message: "Review cannot exceed 1000 characters.",
  }).optional(),
  rating_star: z.number().min(1, {
    message: "Please select a rating.",
  }).max(5)
})

interface ReviewFormProps {
  book_id: number;
}

export function ReviewForm({ book_id }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      review_title: "",
      review_details: "",
      rating_star: 0
    },
  })

  // Helper function to handle rating changes
  const handleRatingChange = (value: number) => {
    // Keep rating between 1 and 5
    const newRating = Math.min(Math.max(value, 1), 5);
    form.setValue("rating_star", newRating);
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      // Ensure we only send the expected fields in the correct format
      const reviewData = {
        book_id: book_id,
        review_title: data.review_title,
        review_details: data.review_details || "", // Use empty string as fallback
        rating_star: Math.round(data.rating_star),
        // Include current date in ISO format
        review_date: new Date().toISOString()
      };

      console.log("Review data:", reviewData);
      await postReview(reviewData);
      form.reset();
      alert("Review submitted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="border-2 border-gray-400 rounded-lg p-4">
      <div className="font-bold text-xl mb-4 ">Write a Review</div>
      <div className="h-px bg-gray-300 -mx-4 mb-4"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="review_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add a Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="review_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details please! Your review helps other shoppers</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px]"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating_star"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select a rating star</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="relative w-full">
                      <select
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        value={field.value}
                        onChange={(e) => handleRatingChange(parseInt(e.target.value, 10))}
                      >
                        <option value="0" disabled>Select Rating</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="h-px bg-gray-300 -mx-4 mb-4"></div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

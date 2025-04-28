import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChevronUp, ChevronDown } from "lucide-react"

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

const FormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(100, {
    message: "Title cannot exceed 100 characters.",
  }),
  content: z.string().min(10, {
    message: "Review must be at least 10 characters.",
  }).max(1000, {
    message: "Review cannot exceed 1000 characters.",
  }),
  rating: z.number().min(1, {
    message: "Please select a rating.",
  }).max(5)
})

interface ReviewFormProps {
  bookId: number;
}

export function ReviewForm({ bookId }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      content: "",
      rating: 0
    },
  })

  // Helper function to handle rating changes
  const handleRatingChange = (value: number) => {
    // Keep rating between 1 and 5
    const newRating = Math.min(Math.max(value, 1), 5);
    form.setValue("rating", newRating);
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      // Ensure rating is an integer
      const reviewData = {
        ...data,
        rating: Math.round(data.rating),
        bookId
      };

      console.log("Review data:", reviewData);
      // Here you would call your API to submit the review
      // Example: await submitReview(reviewData);

      // Reset form after successful submission
      form.reset();
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <div className="font-bold text-xl mb-4 ">Write a Review</div>
      <div className="h-px bg-gray-300 -mx-4 mb-4"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="title"
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
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details please! Your review helps other shoppers</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select a rating star</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="relative w-full">
                      <Input
                        type="text"
                        className="w-full pr-16"
                        value={field.value ? `${field.value} stars` : ""}
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                        <ChevronUp
                          className="h-4 w-4 cursor-pointer hover:text-primary"
                          onClick={() => handleRatingChange(field.value + 1)}
                        />
                        <ChevronDown
                          className="h-4 w-4 cursor-pointer hover:text-primary"
                          onClick={() => handleRatingChange(field.value - 1)}
                        />
                      </div>
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

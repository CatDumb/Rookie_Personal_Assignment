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
import { useTranslation } from "react-i18next"

const getFormSchema = (t: any) => z.object({
  review_title: z.string().min(1, {
    message: t('form_validation_title_min'),
  }).max(120, {
    message: t('form_validation_title_max'),
  }),
  review_details: z.string().max(1000, {
    message: t('form_validation_review_max'),
  }).optional(),
  rating_star: z.number().min(1, {
    message: t('form_validation_rating'),
  }).max(5)
})

interface ReviewFormProps {
  book_id: number;
}

export function ReviewForm({ book_id }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const FormSchema = getFormSchema(t);

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
      alert(t('review_form_success'));
      window.location.reload();
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(t('review_form_error'));
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="border-2 border-gray-400 rounded-lg p-4">
      <div className="font-bold text-xl mb-4 ">{t('review_form_title')}</div>
      <div className="h-px bg-gray-300 -mx-4 mb-4"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="review_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('review_form_add_title')}</FormLabel>
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
                <FormLabel>{t('review_form_details')}</FormLabel>
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
                <FormLabel>{t('review_form_select_rating')}</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="relative w-full">
                      <select
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        value={field.value}
                        onChange={(e) => handleRatingChange(parseInt(e.target.value, 10))}
                      >
                        <option value="0" disabled>{t('review_form_rating_select')}</option>
                        <option value="1">{t('review_form_1_star')}</option>
                        <option value="2">{t('review_form_2_stars')}</option>
                        <option value="3">{t('review_form_3_stars')}</option>
                        <option value="4">{t('review_form_4_stars')}</option>
                        <option value="5">{t('review_form_5_stars')}</option>
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
            {isSubmitting ? t('review_form_submitting') : t('review_form_submit')}
          </Button>
        </form>
      </Form>
    </div>
  )
}

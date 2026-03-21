
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import type { Quote } from "@/lib/types";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AddEditQuoteDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (quote: Omit<Quote, 'id' | 'isUserQuote' | 'createdAt' | 'userId'> & { id?: string }) => void;
  quote: Quote | null;
};

type FormData = {
    text: string;
    author: string;
    category: "love" | "friendship" | "goal" | "family" | "other";
};

export function AddEditQuoteDialog({ isOpen, onOpenChange, onSave, quote }: AddEditQuoteDialogProps) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
      defaultValues: {
          text: "",
          author: "",
          category: "other",
      }
  });

  useEffect(() => {
      if(quote) {
          reset({ text: quote.text, author: quote.author, category: quote.category });
      } else {
          reset({ text: "", author: "", category: "other" });
      }
  }, [quote, isOpen, reset]);

  const onSubmit = (data: FormData) => {
    onSave({ ...data, id: quote?.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{quote ? "Edit Quote" : "Add Quote"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Quote</Label>
            <Textarea
              id="text"
              {...register("text", { required: "Quote text is required." })}
              placeholder="The journey of a thousand miles begins with a single step."
              rows={4}
            />
             {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              {...register("author", { required: "Author is required." })}
              placeholder="Lao Tzu"
            />
             {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
             <Controller
                name="category"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="love">Love</SelectItem>
                            <SelectItem value="friendship">Friendship</SelectItem>
                            <SelectItem value="goal">Goal</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Star } from "lucide-react";

export default function ReviewCard({ review }) {
  return (
    <div className="bg-muted rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">{review.guestName}</span>
        <div className="flex items-center">
          <Star className="w-4 h-4 fill-accent text-accent mr-1" />
          <span className="font-medium">{review.rating}</span>
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
    </div>
  );
}

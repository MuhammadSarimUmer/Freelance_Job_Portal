import { useEffect, useState } from "react";
import { reviewService } from "../../api/services/reviewService";
import { useToast } from "../../context/ToastContext";

function ReviewModal({ contract, revieweeOptions = [], defaultRevieweeId, onClose, onSubmitted }) {
  const { addToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [revieweeId, setRevieweeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultRevieweeId) {
      setRevieweeId(defaultRevieweeId);
      return;
    }
    if (revieweeOptions.length > 0) {
      setRevieweeId(revieweeOptions[0].value);
    }
  }, [defaultRevieweeId, revieweeOptions]);

  const handleSubmit = async () => {
    if (!contract?.contractID) return;
    if (!revieweeId) {
      addToast("Select who you are reviewing.", "error");
      return;
    }
    if (rating < 1 || rating > 5) {
      addToast("Select a rating between 1 and 5.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewService.createReview({
        contractID: contract.contractID,
        revieweeID: revieweeId,
        rating,
        comment,
      });
      addToast("Review submitted.", "success");
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to submit review.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface-container-high)",
          padding: "2.5rem",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "520px",
          border: "1px solid var(--color-outline-variant)",
          position: "relative",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 style={{ fontFamily: "var(--font-headline)", marginBottom: "0.5rem" }}>
          Leave a review
        </h2>
        <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "2rem" }}>
          Rate the collaboration on {contract?.title || "this contract"}.
        </p>

        {revieweeOptions.length > 1 ? (
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--color-secondary)",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              Reviewee
            </label>
            <select
              value={revieweeId}
              onChange={(event) => setRevieweeId(event.target.value)}
              style={{
                width: "100%",
                background: "var(--color-surface)",
                color: "var(--color-on-surface)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "6px",
                padding: "0.6rem",
                fontFamily: "var(--font-body)",
              }}
            >
              {revieweeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "2rem",
                  color: value <= rating ? "var(--color-primary)" : "var(--color-outline)",
                }}
              >
                star
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share a quick note..."
          rows={4}
          style={{
            width: "100%",
            background: "var(--color-surface)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "6px",
            padding: "0.75rem",
            fontFamily: "var(--font-body)",
            marginBottom: "2rem",
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "var(--color-primary)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-headline)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
              color: "var(--color-on-primary)",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontFamily: "var(--font-headline)",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;

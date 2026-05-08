import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../core/services/review.service';
import { ReviewResponse } from '../../models/review.models';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent implements OnInit {
  reviews: ReviewResponse[] = [];
  loading = false;
  error = '';
  actionMessage = '';
  actionError = '';
  processingId: number | null = null;
  reviewPendingDelete: ReviewResponse | null = null;

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.loadPendingReviews();
  }

  loadPendingReviews(): void {
    this.loading = true;
    this.actionMessage = '';
    this.actionError = '';
    this.reviewService.getPendingReviews().subscribe({
      next: (res) => {
        this.reviews = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load pending reviews.';
        this.loading = false;
      }
    });
  }

  approveReview(id: number): void {
    this.processingId = id;
    this.actionMessage = '';
    this.actionError = '';
    this.reviewService.approveReview(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== id);
        this.actionMessage = 'Review approved.';
        this.processingId = null;
      },
      error: () => {
        this.actionError = 'Failed to approve review.';
        this.processingId = null;
      }
    });
  }

  requestDeleteReview(review: ReviewResponse): void {
    this.actionMessage = '';
    this.actionError = '';
    this.reviewPendingDelete = review;
  }

  cancelDeleteReview(): void {
    if (this.processingId === null) {
      this.reviewPendingDelete = null;
    }
  }

  confirmDeleteReview(): void {
    if (!this.reviewPendingDelete) {
      return;
    }

    const id = this.reviewPendingDelete.id;
    this.processingId = id;
    this.actionMessage = '';
    this.actionError = '';

    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== id);
        this.actionMessage = 'Review deleted.';
        this.processingId = null;
        this.reviewPendingDelete = null;
      },
      error: () => {
        this.actionError = 'Failed to delete review.';
        this.processingId = null;
        this.reviewPendingDelete = null;
      }
    });
  }
}

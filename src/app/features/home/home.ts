import { Component, AfterViewInit, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

declare const google: any;

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  typedText = '';
  fullText = 'Old City Nights. Live Jazz. Timeless Moments.';

  reviews: any[] = [];
  current = 0;
  rating = 0;
  placeName = '';
  loading = false;

  // NgZone asinxron əməliyyatların Angular daxilində düzgün işləməsini təmin edir
  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit() {
    // Qlobal callback funksiyasını bu komponentə bağlayırıq
    window.initGoogleMaps = () => {
      this.zone.run(() => {
        this.loadGoogleReviews();
      });
    };

    // Əgər skript bu komponent açılmamışdan əvvəl artıq yüklənibsə:
    if (window.google?.maps?.places) {
      this.loadGoogleReviews();
    }
  }

  ngAfterViewInit(): void {
    this.startTyping();
  }

  async loadGoogleReviews() {
    if (this.loading) return;
    
    this.loading = true;
    this.cdr.detectChanges();

    try {
      const { Place } = google.maps.places;

      const place = new Place({
        id: 'ChIJ2bJaD1J9MEARMW4qTWMLEFw'
      });

      await place.fetchFields({
        fields: ['displayName', 'rating', 'reviews']
      });

      this.placeName = place.displayName || 'JazzBaku';
      this.rating = place.rating || 0;

      this.reviews = (place.reviews || []).map((r: any) => ({
        text: r?.text || '',
        author: r?.authorAttribution?.displayName || 'Anonim',
        rating: r?.rating || 0
      }));

      this.current = 0;
      console.log('Rəylər ekrana ötürülür:', this.reviews);

    } catch (e) {
      console.error('Google Places xətası:', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Ekranı mütləq yeniləyirik
    }
  }

  startTyping() {
    let i = 0;
    const interval = setInterval(() => {
      if (i < this.fullText.length) {
        this.typedText += this.fullText[i++];
        this.cdr.detectChanges();
      } else {
        clearInterval(interval);
      }
    }, 70);
  }

  get hasReviews(): boolean {
    return this.reviews && this.reviews.length > 0;
  }

  get currentReview() {
    return this.reviews[this.current];
  }

  next() {
    if (!this.hasReviews) return;
    this.current = (this.current + 1) % this.reviews.length;
    this.cdr.detectChanges();
  }

  prev() {
    if (!this.hasReviews) return;
    this.current = (this.current - 1 + this.reviews.length) % this.reviews.length;
    this.cdr.detectChanges();
  }

  selectReview(index: number) {
    this.current = index;
    this.cdr.detectChanges();
  }
}
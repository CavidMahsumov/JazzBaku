import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  private apiKey = 'AIzaSyDkBxx9vLA6O6ut1jPeCDjKYc1xRG8K2Os';
  private placeId = 'ChIJ2bJaD1J9MEARMW4qTWMLEFw';

  constructor(private http: HttpClient) {}

  getReviews() {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${this.placeId}` +
      `&fields=name,rating,reviews,user_ratings_total` +
      `&key=${this.apiKey}`;

    return this.http.get(url);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

type Language = 'az' | 'en' | 'ru';

@Component({
  standalone: true,
  selector: 'app-menu',
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class Menu implements OnInit {

  // =========================================================
  // LANGUAGE
  // =========================================================

  currentLanguage: Language = 'az';


  // =========================================================
  // CATEGORY
  // =========================================================

  selectedCategory = 'all';

  categories: any[] = [];


  // =========================================================
  // MENU DATA
  // =========================================================

  foods: any[] = [];


  // =========================================================
  // MODAL
  // =========================================================

  selectedFood: any = null;

  isModalOpen = false;


  // =========================================================
  // HTTP
  // =========================================================

  private http = inject(HttpClient);


  // =========================================================
  // API KEYS
  // =========================================================

  private unsplashKey =
    'zxifHM2ZZ_XQ9_ShF-TRocL2NT_gSjUqvY4_IxLfz_s';

  private spoonKey =
    '3f25948b09444bd28191cf4bc75b4e26';


  // =========================================================
  // STATIC UI TRANSLATIONS
  // =========================================================

  ui = {

    az: {
      ourMenu: 'MENYUMUZ',
      signatureCollection: 'Xüsusi Seçimlər',
      menuDescription:
        'Aşpazlarımız tərəfindən sevgi və diqqətlə hazırlanmış premium yeməklər.',
      viewDetails: 'Ətraflı bax',
      chefChoice: 'Aşpazın seçimi',
      ingredients: 'İnqrediyentlər',
      close: 'Bağla'
    },

    en: {
      ourMenu: 'OUR MENU',
      signatureCollection: 'Signature Collection',
      menuDescription:
        'Premium dishes prepared by our chefs with love and detail.',
      viewDetails: 'View Details',
      chefChoice: 'Chef Choice',
      ingredients: 'Ingredients',
      close: 'Close'
    },

    ru: {
      ourMenu: 'НАШЕ МЕНЮ',
      signatureCollection: 'Фирменная коллекция',
      menuDescription:
        'Премиальные блюда, приготовленные нашими шеф-поварами с любовью и вниманием к деталям.',
      viewDetails: 'Подробнее',
      chefChoice: 'Выбор шеф-повара',
      ingredients: 'Ингредиенты',
      close: 'Закрыть'
    }

  };


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadMenu();
  }


  // =========================================================
  // CHANGE LANGUAGE
  // =========================================================

  changeLanguage(language: Language): void {
    this.currentLanguage = language;
  }


  // =========================================================
  // LOAD MENU.JSON
  // =========================================================

  loadMenu(): void {

    this.http
      .get<any>('assets/data/menu.json')
      .subscribe({

        next: (data) => {

          // Foods
          this.foods = data?.foods || [];


          // Categories JSON-dan oxunur
          if (data?.categories) {

            this.categories = data.categories;

          } else {

            // Əgər JSON-da categories yoxdursa,
            // fallback olaraq bunlar işləyəcək.

            this.categories = [
              {
                key: 'all',
                az: 'Hamısı',
                en: 'All',
                ru: 'Все'
              },
              {
                key: 'Breakfast',
                az: 'Səhər yeməyi',
                en: 'Breakfast',
                ru: 'Завтраки'
              },
              {
                key: 'Soup',
                az: 'Şorbalar',
                en: 'Soup',
                ru: 'Супы'
              },
              {
                key: 'Salad',
                az: 'Salatlar',
                en: 'Salad',
                ru: 'Салаты'
              },
              {
                key: 'Appetizer',
                az: 'Qəlyanaltılar',
                en: 'Appetizer',
                ru: 'Закуски'
              },
              {
                key: 'Burger',
                az: 'Burgerlər',
                en: 'Burger',
                ru: 'Бургеры'
              },
              {
                key: 'Dessert',
                az: 'Desertlər',
                en: 'Dessert',
                ru: 'Десерты'
              },
              {
                key: 'Drinks',
                az: 'İçkilər',
                en: 'Drinks',
                ru: 'Напитки'
              }
            ];

          }


          // Load image for every food
          this.foods.forEach((food) => {

            /*
             * menu.json artıq 3 dilli olduğu üçün
             * image search üçün English adı istifadə edilir.
             */

            const foodName =
              food?.name?.en ||
              food?.name?.az ||
              food?.name?.ru ||
              'food';


            // Əgər JSON-da image yoxdursa,
            // Unsplash-dan götür.

            if (!food.image) {

              this.getImage(foodName)
                .subscribe({

                  next: (image) => {
                    food.image = image;
                  },

                  error: () => {

                    food.image =
                      'https://via.placeholder.com/500x400?text=Food';

                  }

                });

            }

          });

        },

        error: (error) => {

          console.error(
            'menu.json yüklənmədi:',
            error
          );

        }

      });

  }


  // =========================================================
  // UNSPLASH IMAGE
  // =========================================================

  getImage(query: string) {

    const cacheKey =
      'img_' + query;


    const cached =
      localStorage.getItem(cacheKey);


    // Cache-də varsa API-yə getmə

    if (cached) {
      return of(cached);
    }


    return this.http.get<any>(

      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query + ' food'
      )}&client_id=${this.unsplashKey}`

    ).pipe(

      map((res) => {

        const image =
          res?.results?.[0]?.urls?.small ||
          'https://via.placeholder.com/500x400?text=Food';


        // Cache

        localStorage.setItem(
          cacheKey,
          image
        );


        return image;

      })

    );

  }


  // =========================================================
  // SPOONACULAR IMAGE
  // =========================================================

  getImageSpoon(foodName: string) {

    return this.http.get<any>(

      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
        foodName
      )}&number=1&apiKey=${this.spoonKey}`

    ).pipe(

      map((res) => {

        if (
          res?.results &&
          res.results.length > 0
        ) {

          return res.results[0].image;

        }


        return 'https://via.placeholder.com/500x400?text=Food';

      })

    );

  }


  // =========================================================
  // THE MEAL DB IMAGE
  // =========================================================

  getMealImage(name: string) {

    const cacheKey =
      'meal_' + name;


    const cached =
      localStorage.getItem(cacheKey);


    if (cached) {
      return of(cached);
    }


    return this.http.get<any>(

      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        name
      )}`

    ).pipe(

      map((res) => {

        const image =
          res?.meals?.[0]?.strMealThumb ||
          'https://via.placeholder.com/500x400?text=Food';


        localStorage.setItem(
          cacheKey,
          image
        );


        return image;

      })

    );

  }


  // =========================================================
  // CATEGORY SELECT
  // =========================================================

  selectCategory(category: string): void {

    this.selectedCategory =
      category;

  }


  // =========================================================
  // FILTER FOODS
  // =========================================================

  get filteredFoods(): any[] {

    if (!this.foods) {
      return [];
    }


    // ALL

    if (
      this.selectedCategory === 'all'
    ) {

      return this.foods;

    }


    // CATEGORY

    return this.foods.filter(

      (food) =>
        food.category?.toLowerCase() ===
        this.selectedCategory.toLowerCase()

    );

  }


  // =========================================================
  // OPEN MODAL
  // =========================================================

  openModal(food: any): void {

    this.selectedFood =
      food;

    this.isModalOpen =
      true;

  }


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  closeModal(): void {

    this.isModalOpen =
      false;

    this.selectedFood =
      null;

  }

}

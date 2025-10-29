import { TestBed } from '@angular/core/testing';

import { FoodApiService } from './food-api.service';

describe('FoodApiService', () => {
  let service: FoodApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

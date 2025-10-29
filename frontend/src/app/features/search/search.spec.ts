import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodSearchComponent } from './search.component';

describe('Search', () => {
  let component: FoodSearchComponent;
  let fixture: ComponentFixture<FoodSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

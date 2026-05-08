import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AdminSellerService } from '../../core/services/admin-seller.service';
import { AdminSellersComponent } from './admin-sellers.component';

describe('AdminSellersComponent', () => {
  let component: AdminSellersComponent;
  let fixture: ComponentFixture<AdminSellersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AdminSellersComponent],
      providers: [AdminSellerService]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
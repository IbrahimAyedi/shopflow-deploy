import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SellerRequestService } from '../../core/services/seller-request.service';
import { AdminSellerRequestsComponent } from './admin-seller-requests.component';

describe('AdminSellerRequestsComponent', () => {
  let component: AdminSellerRequestsComponent;
  let fixture: ComponentFixture<AdminSellerRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AdminSellerRequestsComponent],
      providers: [SellerRequestService]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSellerRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

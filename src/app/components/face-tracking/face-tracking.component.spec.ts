import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceTrackingComponent } from './face-tracking.component';

describe('FaceTrackingComponent', () => {
  let component: FaceTrackingComponent;
  let fixture: ComponentFixture<FaceTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

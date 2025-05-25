import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyExportComponent } from './key-export.component';

describe('KeyExportComponent', () => {
  let component: KeyExportComponent;
  let fixture: ComponentFixture<KeyExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

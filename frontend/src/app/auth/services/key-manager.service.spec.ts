import { TestBed } from '@angular/core/testing';

import { KeyManagerService } from './key-manager.service';

describe('KeyManagerService', () => {
  let service: KeyManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

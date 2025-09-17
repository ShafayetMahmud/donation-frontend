import { TestBed } from '@angular/core/testing';

import { Donate } from './donate';

describe('Donate', () => {
  let service: Donate;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Donate);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

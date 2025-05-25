import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
    localStorage.clear();
  });

  it('should set and get session label', () => {
    service.setSession('test-label');
    expect(service.getSession()).toBe('test-label');
  });

  it('should clear session', () => {
    service.setSession('test-label');
    service.clearSession();
    expect(service.getSession()).toBeNull();
  });
});

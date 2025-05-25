import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { KeyManagerService } from '../services/key-manager.service';
import { SessionService } from '../services/session.service';

class MockKeyManagerService {
  validatePassphrase = jasmine.createSpy('validatePassphrase');
  getAllLabels = jasmine.createSpy('getAllLabels');
  generateAndStoreKeypair = jasmine.createSpy('generateAndStoreKeypair');
}
class MockSessionService {
  setSession = jasmine.createSpy('setSession');
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let keyManager: MockKeyManagerService;
  let session: MockSessionService;
  let router: MockRouter;

  beforeEach(async () => {
    keyManager = new MockKeyManagerService();
    session = new MockSessionService();
    router = new MockRouter();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: KeyManagerService, useValue: keyManager },
        { provide: SessionService, useValue: session },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login and set session on valid passphrase', fakeAsync(async () => {
    component.selectedChat = 'chat1';
    component.passphrase = 'valid passphrase';
    keyManager.validatePassphrase.and.returnValue(Promise.resolve(true));
    await component.login();
    expect(session.setSession).toHaveBeenCalledWith('chat1');
    expect(router.navigate).toHaveBeenCalledWith(['/chat']);
  }));

  it('should show error on invalid passphrase', fakeAsync(async () => {
    component.selectedChat = 'chat1';
    component.passphrase = 'wrong passphrase';
    keyManager.validatePassphrase.and.returnValue(Promise.resolve(false));
    await component.login();
    expect(component.passphraseError).toContain('Incorrect passphrase');
    expect(session.setSession).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalledWith(['/chat']);
  }));

  it('should create a new chat and set session', fakeAsync(async () => {
    component.createMode = true;
    component.newChatName = 'New Chat';
    component.newPassphrase = 'this is a long enough passphrase!';
    component.verifyNewPassphrase = 'this is a long enough passphrase!';
    keyManager.generateAndStoreKeypair.and.returnValue(Promise.resolve());
    keyManager.getAllLabels.and.returnValue(Promise.resolve(['New Chat']));
    await component.createNewChat();
    expect(keyManager.generateAndStoreKeypair).toHaveBeenCalledWith('New Chat', 'this is a long enough passphrase!');
    expect(session.setSession).toHaveBeenCalledWith('New Chat');
    expect(router.navigate).toHaveBeenCalledWith(['/chat']);
  }));

  it('should show error if new passphrases do not match', fakeAsync(() => {
    component.createMode = true;
    component.newChatName = 'New Chat';
    component.newPassphrase = 'this is a long enough passphrase!';
    component.verifyNewPassphrase = 'not matching!';
    component.createNewChat();
    expect(component.passphraseError).toContain('do not match');
  }));
});

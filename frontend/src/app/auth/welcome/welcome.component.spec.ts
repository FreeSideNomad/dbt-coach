import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { KeyManagerService } from '../services/key-manager.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let keyManagerSpy: jasmine.SpyObj<KeyManagerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    keyManagerSpy = jasmine.createSpyObj('KeyManagerService', ['getAllLabels', 'generateAndStoreKeypair']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent, FormsModule],
      providers: [
        { provide: KeyManagerService, useValue: keyManagerSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if labels exist', fakeAsync(async () => {
    keyManagerSpy.getAllLabels.and.returnValue(Promise.resolve(['label1']));
    await component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show onboarding form if no labels exist', fakeAsync(async () => {
    keyManagerSpy.getAllLabels.and.returnValue(Promise.resolve([]));
    await component.ngOnInit();
    expect(component.showNewUserForm).toBeTrue();
    expect(component.showInfoDialog).toBeTrue();
  }));

  it('should show error if passphrase is too short', fakeAsync(() => {
    component.label = 'Test Chat';
    component.passphrase = 'short';
    component.verifyPassphrase = 'short';
    component.createKeypair();
    expect(component.passphraseError).toContain('20 characters');
  }));

  it('should show error if chat name is empty', fakeAsync(() => {
    component.label = '';
    component.passphrase = 'This is a long enough passphrase!';
    component.verifyPassphrase = 'This is a long enough passphrase!';
    component.createKeypair();
    expect(component.passphraseError).toContain('label');
  }));

  it('should show error if passphrases do not match', fakeAsync(() => {
    component.label = 'Test Chat';
    component.passphrase = 'This is a long enough passphrase!';
    component.verifyPassphrase = 'This is a different passphrase!';
    component.createKeypair();
    expect(component.passphraseError).toContain('do not match');
  }));

  it('should call keyManager and redirect on valid input', fakeAsync(async () => {
    keyManagerSpy.generateAndStoreKeypair.and.returnValue(Promise.resolve());
    component.label = 'Test Chat';
    component.passphrase = 'This is a long enough passphrase!';
    component.verifyPassphrase = 'This is a long enough passphrase!';
    await component.createKeypair();
    expect(keyManagerSpy.generateAndStoreKeypair).toHaveBeenCalledWith('Test Chat', 'This is a long enough passphrase!');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error if key creation fails', fakeAsync(async () => {
    keyManagerSpy.generateAndStoreKeypair.and.returnValue(Promise.reject('fail'));
    component.label = 'Test Chat';
    component.passphrase = 'This is a long enough passphrase!';
    component.verifyPassphrase = 'This is a long enough passphrase!';
    await component.createKeypair();
    expect(component.passphraseError).toContain('Failed');
  }));

  it('should close info dialog', () => {
    component.showInfoDialog = true;
    component.closeInfoDialog();
    expect(component.showInfoDialog).toBeFalse();
  });
});

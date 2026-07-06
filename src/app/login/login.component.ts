import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  password = '';
  errorMessage = '';
  isLoading = false;
  showPassword = false;
  currentYear = new Date().getFullYear();

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    const trimmedPassword = this.password.trim();

    if (!trimmedPassword) {
      this.errorMessage = 'Password is required';
      return;
    }

    this.isLoading = true;
    this.authService.login(trimmedPassword).subscribe({
      next: (isValid) => {
        this.isLoading = false;
        if (isValid) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Incorrect password';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load authentication config. Please try again.';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}

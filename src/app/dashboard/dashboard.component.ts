import { Component, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  barcodeName = '';
  barcodeNumber = '';
  
  // Validation errors
  nameError = '';
  numberError = '';
  generalError = '';

  hasGenerated = false;

  @ViewChild('barcodeCanvas') barcodeCanvas!: ElementRef<HTMLCanvasElement>;

  validateInputs(): boolean {
    this.nameError = '';
    this.numberError = '';
    this.generalError = '';
    let isValid = true;

    // Validate Barcode Name
    const nameTrimmed = this.barcodeName.trim();
    if (nameTrimmed) {
      if (nameTrimmed.length > 50) {
        this.nameError = 'Barcode name must be 50 characters or less';
        isValid = false;
      }
      const nameRegex = /^[a-zA-Z0-9\s\-]+$/;
      if (!nameRegex.test(nameTrimmed)) {
        this.nameError = 'Barcode name can only contain letters, numbers, spaces, and hyphens';
        isValid = false;
      }
    }

    // Validate Barcode Number
    const numberTrimmed = this.barcodeNumber.trim();
    if (!numberTrimmed) {
      this.numberError = 'Barcode number is required';
      isValid = false;
    } else {
      if (numberTrimmed.includes(' ')) {
        this.numberError = 'No spaces allowed in barcode number';
        isValid = false;
      }
      const digitsRegex = /^\d+$/;
      if (!digitsRegex.test(numberTrimmed)) {
        this.numberError = 'Please enter numbers only';
        isValid = false;
      } else if (numberTrimmed.length < 4 || numberTrimmed.length > 30) {
        this.numberError = 'Barcode number must be between 4 and 30 digits';
        isValid = false;
      }
    }

    return isValid;
  }

  generateBarcode(): void {
    if (!this.validateInputs()) {
      this.hasGenerated = false;
      return;
    }

    this.hasGenerated = true;
    
    // Trigger detection so canvas is rendered in DOM before calling JsBarcode
    this.cdr.detectChanges();

    try {
      if (this.barcodeCanvas && this.barcodeCanvas.nativeElement) {
        JsBarcode(this.barcodeCanvas.nativeElement, this.barcodeNumber.trim(), {
          format: 'CODE128',
          lineColor: '#000000',
          width: 2.5, // slightly wider lines for high resolution
          height: 90,
          displayValue: false,
          font: 'Inter',
          fontSize: 16,
          textMargin: 6,
          background: '#ffffff'
        });
      } else {
        this.generalError = 'Failed to access barcode preview canvas.';
        this.hasGenerated = false;
      }
    } catch (err) {
      this.generalError = 'An error occurred while generating the barcode.';
      this.hasGenerated = false;
      console.error(err);
    }
  }

  downloadBarcode(): void {
    if (!this.hasGenerated || !this.barcodeCanvas) return;

    let filename = 'barcode';
    const nameTrimmed = this.barcodeName.trim();
    if (nameTrimmed) {
      // Filename sanitization:
      // Replace spaces with hyphens (-)
      filename = nameTrimmed.replace(/\s+/g, '-');
      // Remove special characters: / \ : * ? " < > |
      filename = filename.replace(/[\/\\:\*\?"<>\|]/g, '');
      // Convert multiple hyphens to a single hyphen
      filename = filename.replace(/-+/g, '-');
      // Trim leading/trailing hyphens
      filename = filename.replace(/^-+|-+$/g, '');

      if (!filename) {
        filename = 'barcode';
      }
    }

    const canvas = this.barcodeCanvas.nativeElement;
    const url = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

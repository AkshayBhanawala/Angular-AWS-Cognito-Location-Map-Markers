import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonWithSpinnerComponent } from './components/common/button-with-spinner/button-with-spinner.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/signup/signup.component';
import { MapComponent } from './components/map/map.component';
import { Model_OtpVerificationComponent } from './components/common/_models/otp-verification/otp-verification.model';
import { Model_MessageComponent } from './components/common/_models/message/message.model';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		ButtonWithSpinnerComponent,
		SignUpComponent,
		MapComponent,
		Model_OtpVerificationComponent,
		Model_MessageComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatCardModule,
		MatDialogModule,
		MatIconModule,
		MatInputModule,
		MatToolbarModule,
		MatTooltipModule,
		MatProgressSpinnerModule,
		FormsModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule { }

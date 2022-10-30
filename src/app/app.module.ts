import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { ClustersComponent } from './components/clusters/clusters.component';
import { MatTableModule } from '@angular/material/table';
import { ClusterFormComponent } from './components/cluster-form/cluster-form.component';

@NgModule({
	declarations: [
		AppComponent,
		DashboardComponent,
		LandingComponent,
		ClustersComponent,
		ClusterFormComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		MatInputModule,
		MatCardModule,
		MatToolbarModule,
		MatSidenavModule,
		MatButtonModule,
		MatIconModule,
		MatDividerModule,
		MatTableModule,
		MatDialogModule,
		MatFormFieldModule,
		MatSelectModule,
		FormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

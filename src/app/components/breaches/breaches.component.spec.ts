import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BreachesComponent } from "./breaches.component";

describe("BreachesComponent", () => {
  let component: BreachesComponent;
  let fixture: ComponentFixture<BreachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BreachesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

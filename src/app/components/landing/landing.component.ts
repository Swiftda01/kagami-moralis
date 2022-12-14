import { Component, OnInit } from "@angular/core";
import { MoralisV1Service } from "../../services/moralis/moralisV1.service";
import { Router } from "@angular/router";

@Component({
  selector: "landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
})
export class LandingComponent implements OnInit {
  constructor(
    private moralisService: MoralisV1Service,
    private router: Router
  ) {}

  ngOnInit() {
    this.moralisService.getCurrentUser().then((user) => {
      if (user !== null) {
        this._goToDashboard();
      }
    });
  }

  async logIn() {
    this.moralisService
      .authenticateCurrentUser()
      .then(() => this._goToDashboard());
  }

  private _goToDashboard() {
    this.router.navigate(["/dashboard"]);
  }
}

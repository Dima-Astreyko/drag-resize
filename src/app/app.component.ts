import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResizableComponent } from "./resisable/resizable.component";
import { CdkDrag } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ResizableComponent, CdkDrag],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  startRect = { x: 150, y: 400, width: 100, height: 100 };

}

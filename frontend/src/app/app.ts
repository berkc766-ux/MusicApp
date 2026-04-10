import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReadOperationsComponent } from './components/read-operations/read-operations.component';
import { MutateOperationsComponent } from './components/mutate-operations/mutate-operations.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReadOperationsComponent, MutateOperationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'music-library';
}

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-import-csv',
  standalone: true,
  templateUrl: './import-csv.html',
  styleUrls: ['./import-csv.scss'],
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MatIconModule,
    DatePipe
  ]
})
export class ImportCsvComponent {

  selectedFile: File | null = null;
  fileName = '';
  message = '';
  loading = false;

  imports: {
    id: number;
    filename: string;
    records: number;
    createdAt: string;
    selected?: boolean;
  }[] = [];

  constructor(private http: HttpClient) {
    this.loadImports();
  }

  selectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.fileName = this.selectedFile ? this.selectedFile.name : '';
  }

  upload() {
    if (!this.selectedFile) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:3000/sales/upload-csv', formData)
      .subscribe({
        next: () => {
          this.selectedFile = null;
          this.fileName = '';
          this.message = 'CSV úspěšně nahrán!';
          this.loading = false;
          this.loadImports();
        },
        error: () => {
          this.message = 'Chyba při nahrávání CSV!';
          this.loading = false;
        }
      });
  }

  loadImports() {
    this.http.get<any[]>('http://localhost:3000/sales/imports')
      .subscribe(data => {
        this.imports = data.map(i => ({ ...i, selected: false }));
      });
  }

  selectAll() {
    this.imports.forEach(i => i.selected = true);
  }

  deleteSelected() {
    const ids = this.imports.filter(i => i.selected).map(i => i.id);
    if (!ids.length) return;

    this.loading = true;

    const requests = ids.map(id =>
      this.http.delete(`http://localhost:3000/sales/imports/${id}`)
    );

    Promise.all(requests.map(r => r.toPromise()))
      .then(() => {
        this.message = 'Vybrané záznamy smazány';
        this.loadImports();
      })
      .catch(() => {
        this.message = 'Chyba při mazání!';
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

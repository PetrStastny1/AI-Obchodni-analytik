import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EventEmitter } from '@angular/core';

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

  /** 📡 Event pro dashboard — po importu se má refreshnout */
  static refreshDashboard = new EventEmitter<void>();

  selectedFile: File | null = null;
  fileName = '';
  message = '';
  loading = false;
  allSelected = false;

  imports: {
    id: number;
    filename: string;
    records: number;
    importedAt: string;
    selected?: boolean;
  }[] = [];

  constructor(private http: HttpClient) {
    this.loadImports();
  }

  /** 📌 Vybere soubor */
  selectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.fileName = this.selectedFile ? this.selectedFile.name : '';
  }

  /** 📤 Nahrání CSV na backend */
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

          // 🔄 Refresh importů + dashboardu
          this.loadImports();
          ImportCsvComponent.refreshDashboard.emit();

          this.loading = false;
        },
        error: () => {
          this.message = '❌ Chyba při nahrávání CSV!';
          this.loading = false;
        }
      });
  }

  /** 🔄 Načte historii importů */
  loadImports() {
    this.http.get<any[]>('http://localhost:3000/sales/imports')
      .subscribe(data => {
        this.imports = (data ?? []).map(i => ({
          id: i.id,
          filename: i.filename,
          records: i.records ?? 0,
          importedAt: i.imported_at || i.importedAt,
          selected: false
        }));
        this.allSelected = false;
      });
  }

  /** ✔️ Přepne checkbox v headeru */
  toggleSelectAll() {
    this.allSelected = !this.allSelected;
    this.imports.forEach(i => (i.selected = this.allSelected));
  }

  /** 🔍 Zda má něco označené */
  hasSelection() {
    return this.imports.some(i => i.selected);
  }

  /** 🗑️ Smazání vybraných importů */
  deleteSelected() {
    const ids = this.imports.filter(i => i.selected).map(i => i.id);
    if (!ids.length) return;

    this.loading = true;

    // 🔥 Promise.all bez toPromise()
    Promise.all(ids.map(id =>
      this.http.delete(`http://localhost:3000/sales/imports/${id}`).toPromise()
    ))
      .then(() => {
        this.message = '🗑️ Vybrané záznamy smazány';

        // ♻ Refresh importů + dashboard
        this.loadImports();
        ImportCsvComponent.refreshDashboard.emit();
      })
      .catch(() => {
        this.message = '❌ Chyba při mazání!';
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

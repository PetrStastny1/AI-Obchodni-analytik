import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexTheme
} from 'ng-apexcharts';
import { AiChatService } from './services/ai-chat.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.scss']
})
export class AiChatComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  /* === CHAT STATE === */
  question = '';
  messages: any[] = [];
  typingText = '';
  loading = false;

  /* === SPEECH === */
  isRecording = false;
  countdownActive = false;
  countdownTimeoutId: any;
  recognition: any;

  /* === MINI CHART === */
  activeChart:
    | {
        series: ApexAxisChartSeries;
        chart: ApexChart;
        xaxis: ApexXAxis;
        theme: ApexTheme;
        colors: string[];
        stroke: ApexStroke;
      }
    | null = null;

  constructor(private aiChat: AiChatService) {}

  /* ========================= 🎙️ INIT VOICE ========================= */
  ngOnInit() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'cs-CZ';
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(' ');

      this.typingText = transcript;
      this.question = transcript;
      this.smoothScroll();
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      if (this.typingText.trim()) this.startCountdown();
    };
  }

  /* ========================= 🎙️ RECORD ========================= */
  toggleRecording() {
    if (!this.recognition) return;
    this.clearCountdown();
    this.typingText = '';

    if (!this.isRecording) {
      this.isRecording = true;
      this.recognition.start();
    } else {
      this.isRecording = false;
      this.recognition.stop();
    }
  }

  startCountdown() {
    this.clearCountdown();
    this.countdownActive = true;
    this.countdownTimeoutId = setTimeout(() => {
      this.countdownActive = false;
      if (this.question.trim()) {
        this.typingText = '';
        this.send();
      }
    }, 5000);
  }

  clearCountdown() {
    if (this.countdownTimeoutId) clearTimeout(this.countdownTimeoutId);
    this.countdownTimeoutId = null;
    this.countdownActive = false;
  }

  /* ========================= 🔄 UI HELPERS ========================= */
  smoothScroll() {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  typeWriter(text: string, cb: () => void) {
    this.typingText = '';
    let i = 0;
    const speed = 12;
    const tick = () => {
      if (i < text.length) {
        this.typingText += text.charAt(i);
        this.smoothScroll();
        i++;
        setTimeout(tick, speed);
      } else cb();
    };
    tick();
  }

  /* ========================= 📨 SEND ========================= */
  send() {
    if (!this.question.trim()) return;

    const q = this.question.trim();
    this.clearCountdown();

    this.messages.push({ sender: 'user', text: q });
    this.question = '';
    this.typingText = '';
    this.loading = true;
    this.activeChart = null;
    this.smoothScroll();

    this.aiChat.ask(q).subscribe(ai => {
      /* === TABLE PARSE === */
      let table = null;
      try {
        const rows = JSON.parse(ai.rawResultJson ?? '[]');
        if (Array.isArray(rows) && rows.length > 0)
          table = { columns: Object.keys(rows[0]), rows };
      } catch {}

      const last = { sender: 'ai', text: '', table };
      this.messages.push(last);
      this.smoothScroll();

      /* === CHART (DARK/LIGHT AUTO) === */
      if (ai.chart && ai.chart.categories?.length > 0) {
        const isDark = document.documentElement.classList.contains('dark-mode');
        this.activeChart = {
          series: [{ data: ai.chart.values }],
          chart: { type: 'bar', height: 240, toolbar: { show: false } },
          xaxis: { categories: ai.chart.categories },
          theme: { mode: isDark ? 'dark' : 'light' },
          colors: ['#6A89FF'],
          stroke: { width: 3, curve: 'smooth' }
        };
      }

      /* === SUMMARY (TYPEWRITER) === */
      this.typeWriter(ai.summary, () => {
        last.text = ai.summary;
        this.typingText = '';
        this.loading = false;
        this.smoothScroll();

        /* === EXTRA: show raw SQL if user asked === */
        if (q.toLowerCase().includes('sql')) {
          this.messages.push({ sender: 'ai', text: ai.sql });
          this.smoothScroll();
        }
      });
    });
  }
}

import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexTheme
} from 'ng-apexcharts';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.scss']
})
export class AiChatComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  /* ============ CHAT STATE ============ */
  question = '';
  messages: any[] = [];
  typingText = '';
  loading = false;

  /* ============ VOICE RECOGNITION ============ */
  isRecording = false;
  countdownActive = false;
  countdownTimeoutId: any;
  recognition: any;

  /* ============ MINI CHART ============ */
  activeChart: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    theme: ApexTheme;
    colors: string[];
    stroke: ApexStroke;
  } | null = null;

  /* ============ AI HINTS ============ */
  tips = [
    { label: 'Top produkty podle tržeb', q: 'Jaké jsou top produkty podle tržeb?' },
    { label: 'Nejlepší den v prodejích', q: 'Který den měl největší tržby?' },
    { label: 'Celkové tržby za měsíc', q: 'Jaké jsou celkové tržby za poslední měsíc?' },
    { label: 'Počet prodaných kusů', q: 'Kolik kusů se prodalo celkem?' }
  ];

  constructor(private apollo: Apollo) {}

  /* =======================================
     ▶️ QUICK ASK FROM TIPS
     ======================================= */
  quickAsk(q: string) {
    this.question = q;
    this.send();
  }

  /* =======================================
     🎙️ SPEECH RECOGNITION INIT
     ======================================= */
  ngOnInit() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'cs-CZ';
    this.recognition.interimResults = true;
    this.recognition.continuous = false;

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

  /* =======================================
     🎙️ RECORDING + COUNTDOWN
     ======================================= */
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

  /* =======================================
     📜 SMOOTH SCROLL
     ======================================= */
  smoothScroll() {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }

  /* =======================================
     ⌨️ TYPEWRITER EFFECT
     ======================================= */
  typeWriter(text: string, callback: () => void) {
    let i = 0;
    const speed = 12;

    const tick = () => {
      if (i < text.length) {
        this.typingText += text.charAt(i);
        this.smoothScroll();
        i++;
        setTimeout(tick, speed);
      } else callback();
    };

    tick();
  }

  /* =======================================
     📩 SEND MESSAGE + PROCESS AI RESULT
     ======================================= */
  send() {
    if (!this.question.trim()) return;

    this.clearCountdown();
    const q = this.question.trim();

    this.messages.push({ sender: 'user', text: q });
    this.question = '';
    this.typingText = '';
    this.loading = true;
    this.activeChart = null;
    this.smoothScroll();

    this.apollo
      .query({
        query: gql`
          query AskAI($q: String!) {
            askAI(question: $q) {
              sql
              rawResultJson
              summary
              chart {
                categories
                values
              }
            }
          }
        `,
        variables: { q }
      })
      .subscribe(res => {
        const ai = (res as any).data.askAI;

        /* =================== TABLE PARSE =================== */
        let table = null;
        try {
          const rows = JSON.parse(ai.rawResultJson);
          if (Array.isArray(rows) && rows.length > 0)
            table = { columns: Object.keys(rows[0]), rows };
        } catch {}

        this.typingText = '';
        this.messages.push({ sender: 'ai', text: '', table });
        this.smoothScroll();

        /* =================== CHART GENERATION =================== */
        if (ai.chart && ai.chart.categories.length > 0) {
          this.activeChart = {
            series: [{ data: ai.chart.values }],
            chart: { type: 'bar', height: 260, toolbar: { show: false } },
            xaxis: { categories: ai.chart.categories },
            theme: { mode: 'light' },
            colors: ['#6A89FF'],
            stroke: { width: 3, curve: 'smooth' }
          };
        }

        const last = this.messages[this.messages.length - 1];

        /* =================== TYPEWRITER SUMMARY =================== */
        this.typeWriter(ai.summary, () => {
          last.text = this.typingText;
          this.typingText = '';

          if (q.toLowerCase().includes('sql')) {
            this.messages.push({ sender: 'ai', text: ai.sql });
            this.smoothScroll();
          }

          this.loading = false;
          this.smoothScroll();
        });
      });
  }
}

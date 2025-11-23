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
  ApexTheme,
  ApexDataLabels
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

  question = '';
  messages: any[] = [];
  typingText = '';
  loading = false;

  isRecording = false;
  countdownActive = false;
  countdownTimeoutId: any;
  recognition: any;

  activeChart: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    theme: ApexTheme;
    colors: string[];
    stroke: ApexStroke;
  } | null = null;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

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

  smoothScroll() {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return;
    const start = container.scrollTop;
    const end = container.scrollHeight;
    const duration = 400;
    let startTime: number | null = null;

    const animate = (t: number) => {
      if (!startTime) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      container.scrollTop = start + (end - start) * progress;
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

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

        let table = null;
        try {
          const rows = JSON.parse(ai.rawResultJson);
          if (Array.isArray(rows) && rows.length > 0)
            table = { columns: Object.keys(rows[0]), rows };
        } catch {}

        this.typingText = '';
        this.messages.push({ sender: 'ai', text: '', table });

        if (ai.chart && ai.chart.categories.length > 0) {
          this.activeChart = {
            series: [{ data: ai.chart.values }],
            chart: { type: 'bar', height: 260, toolbar: { show: false } },
            xaxis: { categories: ai.chart.categories },
            theme: { mode: 'light' },
            colors: ['#9b42ff'],
            stroke: { width: 3, curve: 'smooth' }
          };
        }

        const last = this.messages[this.messages.length - 1];

        this.typeWriter(ai.summary, () => {
          last.text = this.typingText;
          this.typingText = '';

          if (q.toLowerCase().includes('sql')) {
            this.messages.push({ sender: 'ai', text: ai.sql });
          }

          this.loading = false;
          this.smoothScroll();
        });
      });
  }
}

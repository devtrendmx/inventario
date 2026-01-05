
import { createChart } from 'https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.1/+esm';

export class ChartFactory {
    static createAreaChart(containerId, data, color = '#2563eb') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const chart = createChart(container, {
            layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#333' },
            grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
            width: container.clientWidth,
            height: 300,
        });

        const series = chart.addAreaSeries({
            lineColor: color,
            topColor: color,
            bottomColor: 'rgba(37, 99, 235, 0.05)',
        });

        series.setData(data);

        window.addEventListener('resize', () => {
            chart.resize(container.clientWidth, 300);
        });

        return chart;
    }

    static createHistogram(containerId, data, color = '#10b981') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const chart = createChart(container, {
            layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#333' },
            grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
            width: container.clientWidth,
            height: 300,
        });

        const series = chart.addHistogramSeries({ color: color });
        series.setData(data);

        window.addEventListener('resize', () => {
            chart.resize(container.clientWidth, 300);
        });

        return chart;
    }
}

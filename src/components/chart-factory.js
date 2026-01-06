
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

    static createMultiLineChart(containerId, seriesConfig) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Ensure container is relative for absolute positioning of legend
        container.style.position = 'relative';

        const chart = createChart(container, {
            layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#333' },
            grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
            width: container.clientWidth,
            height: 300,
        });

        // Create Legend
        const legend = document.createElement('div');
        legend.className = 'absolute top-2 left-2 z-10 bg-white/80 p-2 rounded shadow-sm text-xs pointer-events-none';

        let legendContent = '';

        seriesConfig.forEach(config => {
            const series = chart.addLineSeries({
                color: config.color,
                title: config.title,
                lineWidth: 2,
            });
            series.setData(config.data);

            legendContent += `
                <div class="flex items-center mb-1">
                    <span class="w-2.5 h-2.5 rounded-full mr-2" style="background-color: ${config.color}"></span>
                    <span class="text-gray-700">${config.title}</span>
                </div>
            `;
        });

        legend.innerHTML = legendContent;
        container.appendChild(legend);

        window.addEventListener('resize', () => {
            chart.resize(container.clientWidth, 300);
        });

        return chart;
    }
}

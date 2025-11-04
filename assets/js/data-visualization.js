/**
 * Data Visualization System
 * Real-time IoT data charts with cyber-themed styling
 * Dependencies: Chart.js (CDN loaded in HTML)
 */

class DataVisualization {
  constructor() {
    this.charts = {};
    this.updateIntervals = {};
    this.cyberColors = {
      cyan: '#5ff4ff',
      magenta: '#ff00ff',
      electricBlue: '#0080ff',
      purple: '#8000ff',
      neonGreen: '#00ff88',
      darkBg: '#0a0e27',
      darkSurface: '#131829'
    };
  }

  /**
   * Initialize data visualization system
   */
  init() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded. Please include Chart.js library.');
      return false;
    }

    // Configure Chart.js defaults for cyber theme
    this.configureChartDefaults();

    console.log('✓ Data Visualization system initialized');
    return true;
  }

  /**
   * Configure Chart.js defaults with cyber theme
   */
  configureChartDefaults() {
    Chart.defaults.color = '#e0e6ed';
    Chart.defaults.borderColor = 'rgba(95, 244, 255, 0.1)';
    Chart.defaults.font.family = 'Manrope, sans-serif';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 15;
  }

  /**
   * Create energy monitoring chart
   * @param {string} canvasId - Canvas element ID
   * @returns {Chart} Chart instance
   */
  createEnergyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas #${canvasId} not found`);
      return null;
    }

    const ctx = canvas.getContext('2d');

    // Generate predicted data first, then generate current data based on it
    const predictedData = this.generatePredictedData(24);
    const currentData = this.generateEnergyData(24, predictedData);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.generateTimeLabels(24),
        datasets: [
          {
            label: '전력 소비 (kW)',
            data: currentData,
            borderColor: this.cyberColors.cyan,
            backgroundColor: this.createGradient(ctx, this.cyberColors.cyan),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: this.cyberColors.cyan,
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: '예측 소비 (kW)',
            data: predictedData,
            borderColor: this.cyberColors.magenta,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              color: '#e0e6ed'
            }
          },
          tooltip: {
            backgroundColor: this.cyberColors.darkSurface,
            titleColor: this.cyberColors.cyan,
            bodyColor: '#e0e6ed',
            borderColor: this.cyberColors.cyan,
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kW`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(95, 244, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#9499a3'
            }
          },
          y: {
            grid: {
              color: 'rgba(95, 244, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#9499a3',
              callback: function(value) {
                return value + ' kW';
              }
            },
            beginAtZero: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    this.charts[canvasId] = chart;

    // Initialize energy statistics with latest data
    if (canvasId === 'energy-chart') {
      const latestCurrent = currentData[currentData.length - 1];
      const latestPredicted = predictedData[predictedData.length - 1];
      this.updateEnergyStats(latestCurrent, latestPredicted);
    }

    return chart;
  }

  /**
   * Create temperature/humidity monitoring chart
   * @param {string} canvasId - Canvas element ID
   * @returns {Chart} Chart instance
   */
  createEnvironmentChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.generateTimeLabels(12, 'hour'),
        datasets: [
          {
            label: '온도 (°C)',
            data: this.generateTemperatureData(12),
            borderColor: this.cyberColors.electricBlue,
            backgroundColor: this.createGradient(ctx, this.cyberColors.electricBlue, 0.2),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: 4,
            pointHoverRadius: 7
          },
          {
            label: '습도 (%)',
            data: this.generateHumidityData(12),
            borderColor: this.cyberColors.neonGreen,
            backgroundColor: this.createGradient(ctx, this.cyberColors.neonGreen, 0.2),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
            pointRadius: 4,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            backgroundColor: this.cyberColors.darkSurface,
            titleColor: this.cyberColors.cyan,
            bodyColor: '#e0e6ed',
            borderColor: this.cyberColors.cyan,
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(95, 244, 255, 0.1)'
            },
            ticks: {
              color: '#9499a3'
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            grid: {
              color: 'rgba(95, 244, 255, 0.1)'
            },
            ticks: {
              color: '#9499a3',
              callback: function(value) {
                return value + '°C';
              }
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            ticks: {
              color: '#9499a3',
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });

    this.charts[canvasId] = chart;
    return chart;
  }

  /**
   * Create device status chart (pie/doughnut)
   * @param {string} canvasId - Canvas element ID
   * @returns {Chart} Chart instance
   */
  createDeviceStatusChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    // Generate initial device status data
    const deviceData = this.generateDeviceStatusData();

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['정상 작동', '경고', '오프라인'],
        datasets: [{
          data: [deviceData.online, deviceData.warning, deviceData.offline],
          backgroundColor: [
            this.cyberColors.neonGreen,
            this.cyberColors.electricBlue,
            this.cyberColors.magenta
          ],
          borderColor: this.cyberColors.darkBg,
          borderWidth: 3,
          hoverOffset: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 13
              }
            }
          },
          tooltip: {
            backgroundColor: this.cyberColors.darkSurface,
            titleColor: this.cyberColors.cyan,
            bodyColor: '#e0e6ed',
            borderColor: this.cyberColors.cyan,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed}개 (${percentage}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });

    this.charts[canvasId] = chart;

    // Initialize device statistics
    if (canvasId === 'device-status-chart') {
      this.updateDeviceStats(deviceData.online, deviceData.warning, deviceData.offline);
    }

    return chart;
  }

  /**
   * Create bar chart for project statistics
   * @param {string} canvasId - Canvas element ID
   * @returns {Chart} Chart instance
   */
  createProjectStatsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['2022', '2023', '2024', '2025'],
        datasets: [
          {
            label: '무인매장',
            data: [18, 12, 4, 2],
            backgroundColor: this.cyberColors.cyan,
            borderColor: this.cyberColors.cyan,
            borderWidth: 2
          },
          {
            label: '상업시설',
            data: [9, 1, 0, 1],
            backgroundColor: this.cyberColors.magenta,
            borderColor: this.cyberColors.magenta,
            borderWidth: 2
          },
          {
            label: '복합매장',
            data: [1, 0, 0, 0],
            backgroundColor: this.cyberColors.electricBlue,
            borderColor: this.cyberColors.electricBlue,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            backgroundColor: this.cyberColors.darkSurface,
            titleColor: this.cyberColors.cyan,
            bodyColor: '#e0e6ed',
            borderColor: this.cyberColors.cyan,
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9499a3'
            }
          },
          y: {
            grid: {
              color: 'rgba(95, 244, 255, 0.1)'
            },
            ticks: {
              color: '#9499a3',
              stepSize: 5
            },
            beginAtZero: true
          }
        }
      }
    });

    this.charts[canvasId] = chart;
    return chart;
  }

  /**
   * Update chart data (simulated real-time)
   * @param {string} chartId - Chart identifier
   */
  updateChartData(chartId) {
    const chart = this.charts[chartId];
    if (!chart) return;

    // Remove first data point
    chart.data.labels.shift();
    chart.data.datasets.forEach(dataset => {
      dataset.data.shift();
    });

    // Add new data point
    const now = new Date();
    chart.data.labels.push(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));

    let currentUsage = null;
    let predictedUsage = null;

    // First pass: generate predicted usage
    chart.data.datasets.forEach((dataset, index) => {
      if (dataset.label.includes('예측')) {
        predictedUsage = 12 + Math.random() * 18;
        dataset.data.push(predictedUsage);
      }
    });

    // Second pass: generate other data with probability-based logic
    chart.data.datasets.forEach((dataset, index) => {
      if (dataset.label.includes('전력')) {
        if (predictedUsage !== null) {
          // Apply probability distribution for savings rate
          const rand = Math.random();

          if (rand < 0.8) {
            // 80% chance: savings (negative rate) - current < predicted
            // Savings rate between -1% to -15%
            const savingsRate = 0.01 + Math.random() * 0.14; // 1% to 15%
            currentUsage = predictedUsage * (1 - savingsRate);
          } else if (rand < 0.9) {
            // 10% chance: exactly 0% (current = predicted)
            currentUsage = predictedUsage;
          } else {
            // 10% chance: over-usage (positive rate) - current > predicted
            // Over-usage rate between +0.1% to +2.9%
            const overRate = 0.001 + Math.random() * 0.028; // 0.1% to 2.9%
            currentUsage = predictedUsage * (1 + overRate);
          }
        } else {
          // Fallback if predicted wasn't set yet
          currentUsage = 10 + Math.random() * 20;
        }
        dataset.data.push(currentUsage);
      } else if (dataset.label.includes('온도')) {
        dataset.data.push(18 + Math.random() * 8);
      } else if (dataset.label.includes('습도')) {
        dataset.data.push(40 + Math.random() * 30);
      }
    });

    chart.update('none'); // Update without animation for performance

    // Update energy statistics if this is the energy chart
    if (chartId === 'energy-chart' && currentUsage !== null && predictedUsage !== null) {
      this.updateEnergyStats(currentUsage, predictedUsage);
    }

    // Update device status if this is the device status chart
    if (chartId === 'device-status-chart') {
      const deviceData = this.generateDeviceStatusData();
      chart.data.datasets[0].data = [deviceData.online, deviceData.warning, deviceData.offline];
      chart.update('none');
      this.updateDeviceStats(deviceData.online, deviceData.warning, deviceData.offline);
    }
  }

  /**
   * Update energy statistics display
   * @param {number} current - Current usage value
   * @param {number} predicted - Predicted usage value
   */
  updateEnergyStats(current, predicted) {
    const currentElement = document.getElementById('current-usage');
    const predictedElement = document.getElementById('predicted-usage');
    const savingsElement = document.getElementById('savings-rate');

    if (currentElement) {
      currentElement.textContent = `${current.toFixed(1)} kW`;
    }

    if (predictedElement) {
      predictedElement.textContent = `${predicted.toFixed(1)} kW`;
    }

    if (savingsElement && predicted > 0) {
      const savingsRate = ((predicted - current) / predicted * 100);
      const sign = savingsRate > 0 ? '+' : '';
      savingsElement.textContent = `${sign}${savingsRate.toFixed(1)}%`;

      // Change color based on savings (negative is good, positive is bad)
      if (savingsRate < 0) {
        savingsElement.style.color = '#00ff88'; // Green for savings
      } else {
        savingsElement.style.color = '#ff00ff'; // Magenta for over-usage
      }
    }
  }

  /**
   * Generate device status data with probability distribution
   * Total devices: 243
   * Online: 90-95%
   * Warning: 3-4%
   * Offline: remainder
   * @returns {Object} Device status data
   */
  generateDeviceStatusData() {
    const total = 243;

    // Generate online devices: 90-95% of total
    const onlinePercent = 0.90 + Math.random() * 0.05; // 90% to 95%
    const online = Math.round(total * onlinePercent);

    // Generate warning devices: 3-4% of total
    const warningPercent = 0.03 + Math.random() * 0.01; // 3% to 4%
    const warning = Math.round(total * warningPercent);

    // Offline is the remainder
    const offline = total - online - warning;

    return {
      total: total,
      online: online,
      warning: warning,
      offline: offline
    };
  }

  /**
   * Update device statistics display
   * @param {number} online - Online devices count
   * @param {number} warning - Warning devices count
   * @param {number} offline - Offline devices count
   */
  updateDeviceStats(online, warning, offline) {
    const totalElement = document.getElementById('total-devices');
    const onlineElement = document.getElementById('devices-online');
    const warningElement = document.getElementById('devices-warning');
    const offlineElement = document.getElementById('devices-offline');

    if (totalElement) {
      totalElement.textContent = '243';
    }

    if (onlineElement) {
      onlineElement.textContent = online;
    }

    if (warningElement) {
      warningElement.textContent = warning;
    }

    if (offlineElement) {
      offlineElement.textContent = offline;
    }
  }

  /**
   * Start auto-update for a chart
   * @param {string} chartId - Chart identifier
   * @param {number} interval - Update interval in milliseconds
   */
  startAutoUpdate(chartId, interval = 5000) {
    if (this.updateIntervals[chartId]) {
      clearInterval(this.updateIntervals[chartId]);
    }

    this.updateIntervals[chartId] = setInterval(() => {
      this.updateChartData(chartId);
    }, interval);

    console.log(`✓ Auto-update started for ${chartId} (${interval}ms)`);
  }

  /**
   * Stop auto-update for a chart
   * @param {string} chartId - Chart identifier
   */
  stopAutoUpdate(chartId) {
    if (this.updateIntervals[chartId]) {
      clearInterval(this.updateIntervals[chartId]);
      delete this.updateIntervals[chartId];
      console.log(`✓ Auto-update stopped for ${chartId}`);
    }
  }

  /**
   * Create gradient for chart background
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} color - Base color
   * @param {number} alpha - Opacity
   * @returns {CanvasGradient} Gradient object
   */
  createGradient(ctx, color, alpha = 0.3) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'rgba(10, 14, 39, 0)');
    return gradient;
  }

  /**
   * Generate time labels
   * @param {number} count - Number of labels
   * @param {string} unit - Time unit (minute, hour)
   * @returns {Array} Time labels
   */
  generateTimeLabels(count, unit = 'minute') {
    const labels = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now);
      if (unit === 'hour') {
        time.setHours(time.getHours() - i);
        labels.push(time.toLocaleTimeString('ko-KR', { hour: '2-digit' }));
      } else {
        time.setMinutes(time.getMinutes() - i * 5);
        labels.push(time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
      }
    }

    return labels;
  }

  /**
   * Generate simulated energy data
   * @param {number} count - Number of data points
   * @param {Array} predictedData - Optional predicted data to base current usage on
   * @returns {Array} Energy data
   */
  generateEnergyData(count, predictedData = null) {
    const data = [];

    if (predictedData && predictedData.length === count) {
      // Generate based on predicted data with probability distribution
      for (let i = 0; i < count; i++) {
        const predicted = predictedData[i];
        const rand = Math.random();

        if (rand < 0.8) {
          // 80% chance: savings (negative rate) - current < predicted
          // Savings rate between -1% to -15%
          const savingsRate = 0.01 + Math.random() * 0.14;
          data.push(Number((predicted * (1 - savingsRate)).toFixed(2)));
        } else if (rand < 0.9) {
          // 10% chance: exactly 0% (current = predicted)
          data.push(Number(predicted.toFixed(2)));
        } else {
          // 10% chance: over-usage (positive rate) - current > predicted
          // Over-usage rate between +0.1% to +2.9%
          const overRate = 0.001 + Math.random() * 0.028;
          data.push(Number((predicted * (1 + overRate)).toFixed(2)));
        }
      }
    } else {
      // Fallback: generate independently
      let base = 15;
      for (let i = 0; i < count; i++) {
        base += (Math.random() - 0.5) * 3;
        base = Math.max(10, Math.min(30, base));
        data.push(Number(base.toFixed(2)));
      }
    }

    return data;
  }

  /**
   * Generate predicted energy data
   * @param {number} count - Number of data points
   * @returns {Array} Predicted data
   */
  generatePredictedData(count) {
    const data = [];
    let base = 17;

    for (let i = 0; i < count; i++) {
      base += (Math.random() - 0.5) * 2;
      base = Math.max(12, Math.min(28, base));
      data.push(Number(base.toFixed(2)));
    }

    return data;
  }

  /**
   * Generate temperature data
   * @param {number} count - Number of data points
   * @returns {Array} Temperature data
   */
  generateTemperatureData(count) {
    const data = [];
    let base = 22;

    for (let i = 0; i < count; i++) {
      base += (Math.random() - 0.5) * 2;
      base = Math.max(18, Math.min(26, base));
      data.push(Number(base.toFixed(1)));
    }

    return data;
  }

  /**
   * Generate humidity data
   * @param {number} count - Number of data points
   * @returns {Array} Humidity data
   */
  generateHumidityData(count) {
    const data = [];
    let base = 55;

    for (let i = 0; i < count; i++) {
      base += (Math.random() - 0.5) * 5;
      base = Math.max(40, Math.min(70, base));
      data.push(Number(base.toFixed(1)));
    }

    return data;
  }

  /**
   * Destroy a chart
   * @param {string} chartId - Chart identifier
   */
  destroyChart(chartId) {
    if (this.charts[chartId]) {
      this.stopAutoUpdate(chartId);
      this.charts[chartId].destroy();
      delete this.charts[chartId];
      console.log(`✓ Chart ${chartId} destroyed`);
    }
  }

  /**
   * Destroy all charts
   */
  destroyAll() {
    Object.keys(this.charts).forEach(chartId => {
      this.destroyChart(chartId);
    });
    console.log('✓ All charts destroyed');
  }
}

// Export for use
window.DataVisualization = DataVisualization;

console.log('✓ Data Visualization module loaded');

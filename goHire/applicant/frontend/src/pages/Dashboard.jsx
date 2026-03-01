import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { applicantApi } from '../services/applicantApi';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-1">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className={`text-3xl font-bold ${color || 'text-gray-800'}`}>{value}</span>
    {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await applicantApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  // ── Doughnut – Outcome breakdown ────────────────────────────
  const doughnutData = {
    labels: ['Selected', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [stats.selected, stats.rejected, stats.pending],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
        borderColor: ['#16a34a', '#dc2626', '#d97706'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  // ── Bar – Jobs vs Internships ────────────────────────────────
  const barData = {
    labels: ['Jobs Applied', 'Internships Applied'],
    datasets: [
      {
        label: 'Applications',
        data: [stats.totalJobs, stats.totalInternships],
        backgroundColor: ['#6366f1', '#06b6d4'],
        borderColor: ['#4f46e5', '#0891b2'],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} applications` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: '#f3f4f6' },
      },
      x: { grid: { display: false } },
    },
  };

  // ── Line / Area – Activity over time ────────────────────────
  const monthLabels = Object.keys(stats.monthly).map((key) => {
    const [year, month] = key.split('-');
    return new Date(year, parseInt(month) - 1, 1).toLocaleString('default', {
      month: 'short',
      year: '2-digit',
    });
  });

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Applications',
        data: Object.values(stats.monthly),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} application(s)` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: '#f3f4f6' },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Dashboard</h1>
      <p className="text-sm text-gray-400 mb-8">A summary of your application activity</p>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Applications"
          value={stats.totalApplications}
          sub="Jobs + Internships"
          color="text-indigo-600"
        />
        <StatCard
          label="Selected"
          value={stats.selected}
          sub="Offers received"
          color="text-green-600"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          sub="Not shortlisted"
          color="text-red-500"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          sub="(Selected + Rejected) / Total"
          color="text-amber-500"
        />
      </div>

      {/* ── Charts Row 1 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Doughnut */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Application Outcomes</h2>
          {stats.totalApplications === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No applications yet.</p>
          ) : (
            <div className="flex justify-center">
              <div style={{ maxWidth: 300, width: '100%' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Jobs vs Internships</h2>
          {stats.totalApplications === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No applications yet.</p>
          ) : (
            <Bar data={barData} options={barOptions} />
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Application Activity — Last 12 Months
        </h2>
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
};

export default Dashboard;

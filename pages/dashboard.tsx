import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import SuzukiLogo from '@/components/SuzukiLogo';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  Lock, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Calendar, 
  MapPin, 
  Download, 
  LogOut, 
  AlertCircle,
  HelpCircle,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

interface StatItem {
  _id: string;
  count: number;
}

interface SuggestionItem {
  _id: string;
  visitSatisfaction: 'buena' | 'regular' | 'mala';
  clarityOfService: 'muy_claros' | 'regular' | 'nada_claros';
  joinPromotions: 'si' | 'no';
  suggestion: string;
  branch: string;
  createdAt: string;
}

interface StatsData {
  total: number;
  visitStats: StatItem[];
  clarityStats: StatItem[];
  joinPromotionsStats: StatItem[];
  recent: SuggestionItem[];
  branches: string[];
}

const SATISFACTION_COLORS: Record<string, string> = {
  buena: '#003087',      // Suzuki Blue
  regular: '#64748B',    // Slate Gray
  mala: '#E31837',       // Suzuki Red
};

const CLARITY_COLORS: Record<string, string> = {
  muy_claros: '#003087', // Suzuki Blue
  regular: '#64748B',    // Slate Gray
  nada_claros: '#E31837', // Suzuki Red
};

const PROMOTIONS_COLORS: Record<string, string> = {
  si: '#10B981',   // Emerald green
  no: '#E31837',   // Suzuki Red
};

const LABEL_MAP: Record<string, string> = {
  buena: 'Buena',
  regular: 'Regular',
  mala: 'Mala',
  muy_claros: 'Muy claros',
  nada_claros: 'Nada claros',
  si: 'Sí',
  no: 'No',
};

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StatsData | null>(null);
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // Load password from session storage on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('suzuki_dashboard_pass');
    if (savedPassword) {
      setPassword(savedPassword);
      fetchStats(savedPassword, selectedBranch, selectedDateRange);
    }
  }, []);

  const fetchStats = async (pass: string, branchFilter: string, dateFilter: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass, branch: branchFilter, dateRange: dateFilter }),
      });

      const json = await res.json();

      if (res.ok) {
        setData(json.data);
        setIsLocked(false);
        sessionStorage.setItem('suzuki_dashboard_pass', pass);
      } else {
        setError(json.message || 'Contraseña incorrecta');
        setIsLocked(true);
        sessionStorage.removeItem('suzuki_dashboard_pass');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(password, selectedBranch, selectedDateRange);
  };

  const handleFilterChange = (branch: string, dateRange: string) => {
    setSelectedBranch(branch);
    setSelectedDateRange(dateRange);
    if (!isLocked && password) {
      fetchStats(password, branch, dateRange);
    }
  };

  const handleLogout = () => {
    setIsLocked(true);
    setData(null);
    setPassword('');
    sessionStorage.removeItem('suzuki_dashboard_pass');
  };

  const getExportUrl = () => {
    return `/api/export-csv?password=${encodeURIComponent(password)}&branch=${encodeURIComponent(selectedBranch)}&dateRange=${encodeURIComponent(selectedDateRange)}`;
  };

  // Calculations for KPIs
  const total = data?.total || 0;

  const getVisitCount = (key: string) => {
    return data?.visitStats.find(item => item._id === key)?.count || 0;
  };

  const getClarityCount = (key: string) => {
    return data?.clarityStats.find(item => item._id === key)?.count || 0;
  };

  // NSI: Net Satisfaction Index (% Buena - % Mala)
  const calculateNSI = () => {
    if (total === 0) return 0;
    const buenaPct = (getVisitCount('buena') / total) * 100;
    const malaPct = (getVisitCount('mala') / total) * 100;
    return Math.round(buenaPct - malaPct);
  };

  // Clarity percentage (% Muy Claros)
  const calculateClarityPct = () => {
    if (total === 0) return 0;
    return Math.round((getClarityCount('muy_claros') / total) * 100);
  };

  // Promotions interest percentage
  const calculatePromotionsPct = () => {
    if (total === 0) return 0;
    const count = data?.joinPromotionsStats.find(item => item._id === 'si')?.count || 0;
    return Math.round((count / total) * 100);
  };

  // Format Charts
  const visitChartData = data?.visitStats.map(item => ({
    name: LABEL_MAP[item._id] || item._id,
    id: item._id,
    count: item.count,
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0',
  })) || [];

  const clarityChartData = data?.clarityStats.map(item => ({
    name: LABEL_MAP[item._id] || item._id,
    id: item._id,
    count: item.count,
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0',
  })) || [];

  const promotionsChartData = data?.joinPromotionsStats.map(item => ({
    name: LABEL_MAP[item._id] || item._id,
    id: item._id,
    count: item.count,
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0',
  })) || [];

  const getMoodIcon = (mood: string) => {
    if (mood === 'buena' || mood === 'muy_claros' || mood === 'si') return <Smile className="w-4 h-4 text-emerald-600" />;
    if (mood === 'regular') return <Meh className="w-4 h-4 text-amber-500" />;
    if (mood === 'no') return <Frown className="w-4 h-4 text-rose-500" />;
    return <Frown className="w-4 h-4 text-rose-500" />;
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4 font-sans text-gray-800">
        <Head>
          <title>Panel Suzuki - Acceso Requerido</title>
        </Head>
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border-t-4 border-[#E31837] border-x border-b border-gray-100 transition-all duration-300">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <SuzukiLogo size="md" />
            </div>
            
            <h1 className="text-xl font-bold text-center text-[#003087] mb-1">
              Portal de Estadísticas
            </h1>
            <p className="text-gray-500 text-center mb-8 text-sm">
              Ingrese la credencial administrativa para visualizar los datos
            </p>
            
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña del sistema"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-[#003087] focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              
              {error && (
                <div className="flex items-center text-red-700 text-xs space-x-2 bg-red-50 border border-red-100 p-3.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#003087] to-[#0057B8] hover:from-[#002060] hover:to-[#00479b] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-75 flex justify-center items-center text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Desbloquear Panel'
                )}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 py-4 px-8 border-t border-gray-100 text-center text-[10px] text-gray-400">
            Suzuki Motor de México &copy; {new Date().getFullYear()} - Privado e Intransferible
          </div>
        </div>
      </div>
    );
  }

  const nsi = calculateNSI();
  const clarityPct = calculateClarityPct();
  const promotionsPct = calculatePromotionsPct();

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans text-gray-800 pb-12">
      <Head>
        <title>Panel de Estadísticas | Suzuki</title>
      </Head>

      {/* Corporate Header */}
      <header className="bg-white border-b-2 border-[#E31837] shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SuzukiLogo size="sm" />
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <span className="text-gray-500 font-medium text-sm hidden sm:inline-block">
              Panel Administrativo de Encuestas
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-500 hover:text-[#E31837] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Filters and Actions Bar */}
        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#003087]" /> Sucursal
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => handleFilterChange(e.target.value, selectedDateRange)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003087] transition-all font-medium cursor-pointer"
              >
                <option value="all">Todas las Sucursales</option>
                {data?.branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#003087]" /> Rango de Fecha
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => handleFilterChange(selectedBranch, e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003087] transition-all font-medium cursor-pointer"
              >
                <option value="all">Histórico Completo</option>
                <option value="7d">Últimos 7 Días</option>
                <option value="30d">Últimos 30 Días</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <a
              href={getExportUrl()}
              download
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#003087] to-[#0057B8] hover:from-[#002060] hover:to-[#00479b] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm w-full md:w-auto active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Reporte (CSV)</span>
            </a>
          </div>
        </section>

        {/* Key Performance Indicators (KPIs) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Muestras */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Muestra Recopilada</p>
              <h3 className="text-3xl font-black text-[#003087]">{total}</h3>
              <p className="text-xs text-gray-500 mt-2">Encuestas respondidas en el período</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl">
              <Activity className="w-6 h-6 text-[#003087]" />
            </div>
          </div>

          {/* Card 2: Net Satisfaction Index */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Satisfacción Neta (NSI)</p>
              <h3 className={`text-3xl font-black ${nsi >= 50 ? 'text-emerald-600' : nsi >= 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                {nsi >= 0 ? `+${nsi}` : nsi}%
              </h3>
              <p className="text-xs text-gray-500 mt-2">% Buena - % Mala</p>
            </div>
            <div className={`p-4 rounded-2xl ${nsi >= 50 ? 'bg-emerald-50 text-emerald-600' : nsi >= 0 ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'}`}>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Clarity Index */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">Información Clara</p>
              <h3 className="text-3xl font-black text-[#003087]">{clarityPct}%</h3>
              <p className="text-xs text-gray-500 mt-2">% Muy Claros en trámite/servicio</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl">
              <Smile className="w-6 h-6 text-[#003087]" />
            </div>
          </div>

          {/* Card 4: Promotions Interest */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 font-sans">Interés en Promociones</p>
              <h3 className="text-3xl font-black text-emerald-600">{promotionsPct}%</h3>
              <p className="text-xs text-gray-500 mt-2">% interesados en nuevos lanzamientos</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card: Satisfacción de Visita */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#003087]">Satisfacción General</h2>
                  <p className="text-xs text-gray-500">¿Qué tan satisfactoria fue tu visita?</p>
                </div>
              </div>

              {total === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <HelpCircle className="w-12 h-12 mb-2 text-gray-300" />
                  <p className="text-sm">Sin datos para mostrar en este rango</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visitChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '13px'
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                        {visitChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[entry.id] || '#003087'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-50 pt-4 space-y-2">
              {visitChartData.map((stat) => (
                <div key={stat.name} className="flex justify-between items-center py-2.5 px-3 hover:bg-gray-50 rounded-xl transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SATISFACTION_COLORS[stat.id] }} />
                    <span className="font-semibold text-gray-700 text-sm">{stat.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-xs">{stat.count} {stat.count === 1 ? 'unidad' : 'unidades'}</span>
                    <span className="font-bold text-gray-900 text-sm w-12 text-right">{stat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Claridad del Servicio */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#003087]">Claridad del Servicio</h2>
                  <p className="text-xs text-gray-500">¿Fuimos claros al explicarte tu trámite?</p>
                </div>
              </div>

              {total === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <HelpCircle className="w-12 h-12 mb-2 text-gray-300" />
                  <p className="text-sm">Sin datos para mostrar en este rango</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clarityChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '13px'
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                        {clarityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CLARITY_COLORS[entry.id] || '#003087'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-50 pt-4 space-y-2">
              {clarityChartData.map((stat) => (
                <div key={stat.name} className="flex justify-between items-center py-2.5 px-3 hover:bg-gray-50 rounded-xl transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLARITY_COLORS[stat.id] }} />
                    <span className="font-semibold text-gray-700 text-sm">{stat.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-xs">{stat.count} {stat.count === 1 ? 'unidad' : 'unidades'}</span>
                    <span className="font-bold text-gray-900 text-sm w-12 text-right">{stat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Interés en Promociones */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#003087]">Interés en Promociones</h2>
                  <p className="text-xs text-gray-500">¿Le gustaría ser parte de nuevos lanzamientos y promociones?</p>
                </div>
              </div>

              {total === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <HelpCircle className="w-12 h-12 mb-2 text-gray-300" />
                  <p className="text-sm">Sin datos para mostrar en este rango</p>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={promotionsChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '13px'
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                        {promotionsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PROMOTIONS_COLORS[entry.id] || '#003087'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-50 pt-4 space-y-2">
              {promotionsChartData.map((stat) => (
                <div key={stat.name} className="flex justify-between items-center py-2.5 px-3 hover:bg-gray-50 rounded-xl transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROMOTIONS_COLORS[stat.id] }} />
                    <span className="font-semibold text-gray-700 text-sm">{stat.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-xs">{stat.count} {stat.count === 1 ? 'unidad' : 'unidades'}</span>
                    <span className="font-bold text-gray-900 text-sm w-12 text-right">{stat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comments/Suggestions Section */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <MessageSquare className="w-5 h-5 text-[#003087]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#003087]">Retroalimentación Directa</h2>
              <p className="text-xs text-gray-500">Sugerencias y comentarios compartidos por los usuarios</p>
            </div>
          </div>

          {!data?.recent || data.recent.length === 0 ? (
            <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay comentarios registrados para los filtros seleccionados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {data.recent.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between hover:border-gray-200 transition-all hover:bg-white hover:shadow-sm">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="flex items-center space-x-1.5 bg-white border border-gray-100 px-2 py-1 rounded-lg text-xs font-semibold text-gray-600">
                        {getMoodIcon(item.visitSatisfaction)}
                        <span>Satisfacción: {LABEL_MAP[item.visitSatisfaction]}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-white border border-gray-100 px-2 py-1 rounded-lg text-xs font-semibold text-gray-600">
                        {getMoodIcon(item.clarityOfService)}
                        <span>Claridad: {LABEL_MAP[item.clarityOfService]}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-white border border-gray-100 px-2 py-1 rounded-lg text-xs font-semibold text-gray-600">
                        {getMoodIcon(item.joinPromotions)}
                        <span>Promos: {LABEL_MAP[item.joinPromotions]}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      &ldquo;{item.suggestion}&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200/50 flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1 font-medium text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {item.branch || 'Principal'}
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

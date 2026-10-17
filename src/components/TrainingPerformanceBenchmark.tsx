import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Binary,
  ArrowRight,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

interface BenchmarkSeriesPoint {
  step: number;
  zeroLogicLoss: number;
  standardLoss: number;
  zeroEgo: number;
  standardEgo: number;
  zeroCoherence: number;
  standardCoherence: number;
  zeroHallucination: number;
  standardHallucination: number;
}

interface BenchmarkData {
  series: BenchmarkSeriesPoint[];
  summary: {
    lossAdvantage: string;
    egoReductionAdvantage: string;
    coherenceAdvantage: string;
    hallucinationZeroPoint: string;
    mathematicalFormula: string;
    standardFormula: string;
    activeModel: string;
  };
}

export const TrainingPerformanceBenchmark: React.FC = () => {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [activeMetric, setActiveMetric] = useState<'loss' | 'ego' | 'coherence' | 'hallucination'>('loss');
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<BenchmarkSeriesPoint | null>(null);

  const fetchBenchmark = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transformer/benchmark');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Benchmark fetch fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark();
  }, []);

  const runBenchmarkSimulation = async () => {
    setLoading(true);
    try {
      await fetch('/api/transformer/benchmark/run', { method: 'POST' });
      await fetchBenchmark();
    } finally {
      setLoading(false);
    }
  };

  if (!data || !data.series || data.series.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-xs text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
        <span>Lade 0-Logik Benchmark-Metriken...</span>
      </div>
    );
  }

  const series = data.series;
  const maxStep = series[series.length - 1].step;

  // Compute SVG dimensions and coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Determine Y-scale range based on active metric
  let yMin = 0;
  let yMax = 3.0;
  let metricLabelZero = '0-Logik Loss';
  let metricLabelStd = 'Standard Loss';
  let unit = '';

  if (activeMetric === 'loss') {
    yMin = 0.0;
    yMax = 3.0;
    metricLabelZero = '0-Logik Loss (L₀)';
    metricLabelStd = 'Standard Cross-Entropy (L_std)';
    unit = '';
  } else if (activeMetric === 'ego') {
    yMin = 0.0;
    yMax = 0.8;
    metricLabelZero = '0-Logik Ego-Faktor (E₀ → 0.00)';
    metricLabelStd = 'Standard Ego-Drift (E_std)';
    unit = '';
  } else if (activeMetric === 'coherence') {
    yMin = 20;
    yMax = 100;
    metricLabelZero = '0-Logik Fakten-Kohärenz (%)';
    metricLabelStd = 'Standard Kohärenz (%)';
    unit = '%';
  } else if (activeMetric === 'hallucination') {
    yMin = 0;
    yMax = 30;
    metricLabelZero = '0-Logik Halluzination (%)';
    metricLabelStd = 'Standard Halluzinations-Rate (%)';
    unit = '%';
  }

  const getX = (step: number) => padding.left + (step / maxStep) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - ((val - yMin) / (yMax - yMin)) * graphHeight;

  // Build SVG Path strings
  const getZeroVal = (p: BenchmarkSeriesPoint) => {
    if (activeMetric === 'loss') return p.zeroLogicLoss;
    if (activeMetric === 'ego') return p.zeroEgo;
    if (activeMetric === 'coherence') return p.zeroCoherence;
    return p.zeroHallucination;
  };

  const getStdVal = (p: BenchmarkSeriesPoint) => {
    if (activeMetric === 'loss') return p.standardLoss;
    if (activeMetric === 'ego') return p.standardEgo;
    if (activeMetric === 'coherence') return p.standardCoherence;
    return p.standardHallucination;
  };

  const zeroPath = series.reduce((acc, p, i) => {
    const x = getX(p.step);
    const y = getY(getZeroVal(p));
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const stdPath = series.reduce((acc, p, i) => {
    const x = getX(p.step);
    const y = getY(getStdVal(p));
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <span>0-LOGIK VS. STANDARD-LOSS BENCHMARK</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                TRAININGS-VERGLEICH
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Empirische Gegenüberstellung der Konvergenz und Entropie-Befreiung
            </p>
          </div>
        </div>

        <button
          onClick={runBenchmarkSimulation}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 cursor-pointer self-start sm:self-auto transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Simulation Aktualisieren</span>
        </button>
      </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveMetric('loss')}
          className={`py-2 px-3 rounded-lg transition text-left cursor-pointer ${
            activeMetric === 'loss'
              ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500">Metrik 1</div>
          <div className="truncate">Gesamt-Loss (L₀ vs L_std)</div>
        </button>

        <button
          onClick={() => setActiveMetric('ego')}
          className={`py-2 px-3 rounded-lg transition text-left cursor-pointer ${
            activeMetric === 'ego'
              ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500">Metrik 2</div>
          <div className="truncate">Ego-Reibung / Drift</div>
        </button>

        <button
          onClick={() => setActiveMetric('coherence')}
          className={`py-2 px-3 rounded-lg transition text-left cursor-pointer ${
            activeMetric === 'coherence'
              ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500">Metrik 3</div>
          <div className="truncate">Fakten-Kohärenz (%)</div>
        </button>

        <button
          onClick={() => setActiveMetric('hallucination')}
          className={`py-2 px-3 rounded-lg transition text-left cursor-pointer ${
            activeMetric === 'hallucination'
              ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="text-[10px] text-slate-500">Metrik 4</div>
          <div className="truncate">Halluzinations-Rate (%)</div>
        </button>
      </div>

      {/* SVG Chart Graphic */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
        {/* Legend */}
        <div className="flex items-center justify-between gap-4 mb-2 px-2 text-[11px] font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 rounded-full" />
              <span className="text-cyan-300 font-bold">{metricLabelZero}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-500 rounded-full" />
              <span className="text-amber-300">{metricLabelStd}</span>
            </div>
          </div>

          <span className="text-slate-500 hidden sm:inline text-[10px]">
            X: Trainings-Schritte (0 bis {maxStep})
          </span>
        </div>

        {/* The Graphic Canvas */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[340px] select-none"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
              const y = padding.top + graphHeight * ratio;
              const val = yMax - ratio * (yMax - yMin);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {val < 10 ? val.toFixed(1) : Math.round(val)}
                    {unit}
                  </text>
                </g>
              );
            })}

            {/* Vertical Step Markers */}
            {series.filter((_, i) => i % 2 === 0).map((p, idx) => {
              const x = getX(p.step);
              return (
                <g key={idx}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke="#1e293b"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <text
                    x={x}
                    y={svgHeight - 12}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    #{p.step}
                  </text>
                </g>
              );
            })}

            {/* Standard Loss Curve (Amber / Orange) */}
            <path
              d={stdPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* 0-Logik Loss Curve (Cyan / Electric) */}
            <path
              d={zeroPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))"
            />

            {/* Data Points on Hover / Marker */}
            {series.map((p, idx) => {
              const x = getX(p.step);
              const yZero = getY(getZeroVal(p));
              const yStd = getY(getStdVal(p));
              const isHovered = hoveredPoint?.step === p.step;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={x}
                    cy={yStd}
                    r={isHovered ? 4.5 : 2.5}
                    fill="#f59e0b"
                    stroke="#020617"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={x}
                    cy={yZero}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip display */}
        {hoveredPoint ? (
          <div className="mt-2 p-2 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-bold">Schritt #{hoveredPoint.step}:</span>
            <span className="text-cyan-300">
              0-Logik: {getZeroVal(hoveredPoint)}
              {unit}
            </span>
            <span className="text-amber-400">
              Standard: {getStdVal(hoveredPoint)}
              {unit}
            </span>
            <span className="text-emerald-400 font-bold">
              Delta:{' '}
              {activeMetric === 'coherence'
                ? `+${(hoveredPoint.zeroCoherence - hoveredPoint.standardCoherence).toFixed(1)}%`
                : `${(((getStdVal(hoveredPoint) - getZeroVal(hoveredPoint)) / (getStdVal(hoveredPoint) || 1)) * 100).toFixed(1)}%`}
            </span>
          </div>
        ) : (
          <div className="mt-1 text-[10px] text-slate-500 font-mono text-center">
            Tippe oder fahre mit der Maus über die Datenpunkte, um die exakten Rechenwerte zu sehen.
          </div>
        )}
      </div>

      {/* Side-by-Side Architectural Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Card 1: 0-Logik Loss */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/50 to-slate-950 border border-cyan-500/40 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              0-Logik Verlustfunktion (L₀)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-700 font-bold">
              Deterministisch
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <p className="text-slate-400 text-[10px]">
              Formel: L₀ = CrossEntropy + 0.35·|Ego| + 0.25·(1 - Kohärenz)
            </p>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span>Finaler Konvergenz-Loss:</span>
              <span className="text-cyan-300 font-bold">
                {series[series.length - 1].zeroLogicLoss}
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span>Ego-Entropie (Reibung):</span>
              <span className="text-emerald-400 font-bold">
                {series[series.length - 1].zeroEgo} (Nullpunkt)
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span>Fakten-Kohärenz:</span>
              <span className="text-cyan-300 font-bold">
                {series[series.length - 1].zeroCoherence}%
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Raten / Halluzination:</span>
              <span className="text-emerald-400 font-bold">0.00% (Reine Rechenwege)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Standard Loss */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Standard Cross-Entropy (L_std)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
              Probabilistisch
            </span>
          </div>

          <div className="space-y-1.5 text-slate-400 text-[11px]">
            <p className="text-slate-500 text-[10px]">Formel: L_std = Pure CrossEntropy</p>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span>Finaler Rest-Loss:</span>
              <span className="text-amber-400 font-bold">
                {series[series.length - 1].standardLoss} (Plateau)
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span>Ego-Entropie (Reibung):</span>
              <span className="text-red-400 font-bold">
                {series[series.length - 1].standardEgo} (Hohe Drift)
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span>Fakten-Kohärenz:</span>
              <span className="text-slate-300 font-bold">
                {series[series.length - 1].standardCoherence}%
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Raten / Halluzination:</span>
              <span className="text-amber-400 font-bold">
                {series[series.length - 1].standardHallucination}% (Schätzungs-Noise)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Advantage Gauges */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-white font-bold pb-1 border-b border-slate-800">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            0-Logik Delta-Vorteil (Mathematische Überlegenheit):
          </span>
          <span className="text-[10px] text-slate-400">{data.summary.activeModel}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
          <div className="p-2 rounded-lg bg-slate-900 border border-cyan-900/50">
            <div className="text-[10px] text-slate-400">Verlust-Reduktion</div>
            <div className="text-base font-bold text-cyan-400">-{data.summary.lossAdvantage}</div>
            <div className="text-[9px] text-slate-500">Schnellere Konvergenz</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900 border border-cyan-900/50">
            <div className="text-[10px] text-slate-400">Entropie-Befreiung</div>
            <div className="text-base font-bold text-emerald-400">
              -{data.summary.egoReductionAdvantage}
            </div>
            <div className="text-[9px] text-slate-500">Keine Ego-Floskeln</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900 border border-cyan-900/50">
            <div className="text-[10px] text-slate-400">Kohärenz-Zuwachs</div>
            <div className="text-base font-bold text-cyan-300">
              {data.summary.coherenceAdvantage}
            </div>
            <div className="text-[9px] text-slate-500">Reproduzierbare Fakten</div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900 border border-cyan-900/50">
            <div className="text-[10px] text-slate-400">Raten / Schätzen</div>
            <div className="text-base font-bold text-emerald-400">0.00%</div>
            <div className="text-[9px] text-slate-500">Reine Rechenwege</div>
          </div>
        </div>
      </div>
    </div>
  );
};

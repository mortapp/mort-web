// A tiny dependency-free SVG sparkline (area + line) that draws itself on with
// pure CSS (see .mort-spark in globals.css). Server component — no client JS.
interface Props {
  data: number[]
  height?: number
  ariaLabel?: string
}

export function Sparkline({ data, height = 110, ariaLabel = 'Trend over time' }: Props) {
  const width = 600
  const pad = 8
  const n = data.length
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const rng = max - min || 1
  const x = (i: number) => (n <= 1 ? width / 2 : (i / (n - 1)) * width)
  const y = (v: number) => height - pad - ((v - min) / rng) * (height - pad * 2)

  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L ${width} ${height} L 0 ${height} Z`
  const len = 1400

  return (
    <svg className="mort-spark" viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="mort-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(156,192,238,0.30)" />
          <stop offset="1" stopColor="rgba(156,192,238,0)" />
        </linearGradient>
      </defs>
      <path className="fill" d={area} fill="url(#mort-spark-fill)" />
      <path className="line" d={line} fill="none" stroke="#bcd3f2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

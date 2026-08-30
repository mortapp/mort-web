// The "crossing" — a job's lifecycle drawn as a short voyage, with a ship that
// slowly sails the states. Pure presentational component (no client JS needed).
const STOPS = ['Discover', 'Apply', 'Accepted', 'Scheduled', 'In progress', 'Completed']

export function MortVoyage() {
  return (
    <div className="mort-crossing" aria-hidden="true">
      <div className="track" />
      <div className="ship">⛵</div>
      <div className="stops">
        {STOPS.map((s, i) => (
          <div className={`stop ${i < 4 ? 'done' : ''}`} key={s}>
            <div className="node" />
            <div className="lbl">{s}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

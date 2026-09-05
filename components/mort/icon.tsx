const paths: Record<string, string> = {
  '↗': 'M6 18 18 6M6 6h12v12',
  '↔': 'M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm4 5-2.5 5.5L8 16l2.5-5.5L16 8Z',
  shield: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6',
  work: 'M8 7V4h8v3M3 8h18v12H3V8Zm0 5h18M10 12v3h4v-3',
  person: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3c0-5 16-5 16 0v3',
  message: 'M3 4h18v13H9l-6 4V4Zm4 5h10M7 12h7',
  search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6',
  book: 'M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2V4Z',
  leaf: 'M20 3C7 2 2 8 5 15c5 8 16 2 15-12ZM3 21 16 8',
  alert: 'M12 3 2 21h20L12 3Zm0 6v5m0 3v1',
  money: 'M3 5h18v14H3V5Zm13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 8h1m12 8h1',
  bookmark: 'M6 3h12v18l-6-4-6 4V3Z',
  check: 'm5 12 4 4L19 6',
  plus: 'M12 4v16M4 12h16',
  star: 'm12 2 2.8 6.5L22 9l-5.5 5 1.8 7-6.3-4-6.3 4 1.8-7L2 9l7.2-.5L12 2Z',
  box: 'm12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5m-9 5v9M8 5l9 5',
  lock: 'M6 10V7a6 6 0 0 1 12 0v3M4 10h16v11H4V10Zm8 4v3',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm5 5 14 14M19 5 5 19',
  snow: 'M12 2v20M3 7l18 10M3 17 21 7M8 4l4 3 4-3M8 20l4-3 4 3',
  car: 'm3 10 3-6h12l3 6v9h-3v-3H6v3H3v-9Zm0 0h18M6 13h2m8 0h2',
  pet: 'M8 12c-6 8 14 8 8 0-3-4-5-4-8 0ZM7 7a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm7-3a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm7 3a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z',
}
const aliases: Record<string, string> = { '⚡': 'compass', '🔥': 'compass', '🧭': 'compass', '🛡️': 'shield', '🚨': 'alert', '⚠️': 'alert', '💬': 'message', '💼': 'work', '📁': 'work', '📋': 'work', '⚙️': 'work', '➕': 'plus', '👤': 'person', '👥': 'person', '🤝': 'person', '🔍': 'search', '🔖': 'bookmark', '💰': 'money', '💳': 'money', '🏆': 'star', '🎧': 'message', '🔐': 'lock', '📭': 'box', '📦': 'box', '📚': 'book', '🌿': 'leaf', '🍂': 'leaf', '🧹': 'compass', '🛒': 'work', '🗑️': 'box', '🚗': 'car', '❄️': 'snow', '👶': 'person', '🐕': 'pet', '🎉': 'star', '✓': 'check', '✅': 'check' }
export function Icon({ name = 'compass', size = 20 }: { name?: string; size?: number }) {
  return <svg className="mort-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[aliases[name] || name] || paths.compass} /></svg>
}

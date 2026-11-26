'use client'

const socialProfiles = [
  {
    platform: 'TikTok',
    url: 'https://www.tiktok.com/@getmort?is_from_webapp=1&sender_device=pc',
  },
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/getmort/',
  },
]

export function MortSocialLinks({ className = '' }: { className?: string }) {
  return (
    <section
      className={`card mort-social-card ${className}`.trim()}
      aria-labelledby="mort-social-heading"
    >
      <div>
        <p className="eyebrow">FOLLOW MORT</p>
        <h3 id="mort-social-heading">Find us on social</h3>
        <p className="mort-social-description">Follow <strong>@getmort</strong> for MORT updates.</p>
      </div>
      <div className="mort-social-links">
        {socialProfiles.map(({ platform, url }) => (
          <a
            key={platform}
            className="mort-social-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`MORT on ${platform}, @getmort (opens in a new tab)`}
          >
            <span>{platform}</span>
            <span className="mort-social-link-handle">@getmort</span>
            <span className="mort-social-link-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  )
}

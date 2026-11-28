'use client'

import { useSyncExternalStore } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const subscribeToLocation = () => () => {}
const getClientTargetUrl = () => new URL('/app/verify', window.location.origin).toString()
const getServerTargetUrl = () => ''

export function PhoneVerificationQr() {
  const targetUrl = useSyncExternalStore(subscribeToLocation, getClientTargetUrl, getServerTargetUrl)

  return (
    <section className="verification-phone-handoff" aria-labelledby="verification-phone-title">
      <div className="verification-phone-copy">
        <p className="eyebrow">CONTINUE ON YOUR PHONE</p>
        <h3 id="verification-phone-title">Switch devices</h3>
        <p>Scan this code with your phone camera to open MORT verification in its browser.</p>
        <p className="verification-phone-privacy">
          This is a navigation QR, not an encrypted file handoff. It contains only the verification page address—no ID or sign-in information. Sign in to the same MORT account on your phone before uploading.
        </p>
      </div>
      <div className="verification-qr-frame" aria-live="polite">
        {targetUrl ? (
          <QRCodeSVG
            value={targetUrl}
            size={152}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#06070a"
            title="QR code to open MORT identity verification on your phone"
          />
        ) : (
          <span className="field-hint">Preparing QR…</span>
        )}
      </div>
    </section>
  )
}

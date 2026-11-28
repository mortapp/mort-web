'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Icon } from '@/components/icons'
import { SubmitButton } from '@/components/submit-button'
import { PhoneVerificationQr } from '@/components/phone-verification-qr'

type UploadAction = (formData: FormData) => void | Promise<void>
type CaptureSide = 'front' | 'back'
type DecodedImage = {
  source: CanvasImageSource
  width: number
  height: number
  dispose: () => void
}

type Props = {
  action: UploadAction
  verificationType: 'school_id' | 'identity'
  isAdult: boolean
  canSubmitEvidence: boolean
  hasPendingCase: boolean
}

const MAX_BYTES = 10 * 1024 * 1024
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  pdf: 'application/pdf',
}
const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION))
const COMPOSABLE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function normalizeEvidenceFile(file: File): File {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const suppliedType = file.type.toLowerCase()
  const mimeType = ALLOWED_MIME_TYPES.has(suppliedType)
    ? suppliedType
    : MIME_BY_EXTENSION[extension]

  if (!mimeType) {
    throw new Error('Choose a JPG, PNG, WebP, HEIC image, or PDF file.')
  }

  return file.type === mimeType
    ? file
    : new File([file], file.name, { type: mimeType, lastModified: file.lastModified })
}

function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).then((bitmap) => ({
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close(),
    }))
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        dispose: () => URL.revokeObjectURL(url),
      })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('These images could not be opened in this browser.'))
    }
    image.src = url
  })
}

async function combineImages(files: File[]): Promise<File> {
  const decoded = await Promise.all(files.map(decodeImage))

  try {
    if (decoded.some((image) => image.width < 1 || image.height < 1)) {
      throw new Error('An ID image could not be read. Choose another image or a PDF.')
    }

    const maxWidth = Math.min(2000, Math.max(...decoded.map((image) => image.width)))
    const sizes = decoded.map((image) => {
      const scale = Math.min(1, maxWidth / image.width)
      return {
        width: Math.max(1, Math.round(image.width * scale)),
        height: Math.max(1, Math.round(image.height * scale)),
      }
    })
    const gap = 36
    const canvas = document.createElement('canvas')
    canvas.width = maxWidth
    canvas.height = sizes.reduce((total, size) => total + size.height, 0) + gap * (sizes.length - 1)

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser could not prepare the ID images. Choose a PDF instead.')

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    let top = 0
    decoded.forEach((image, index) => {
      const size = sizes[index]
      const left = Math.round((canvas.width - size.width) / 2)
      context.drawImage(image.source, left, top, size.width, size.height)
      top += size.height + gap
    })

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error('The ID images could not be combined. Choose a PDF instead.')),
        'image/jpeg',
        0.86,
      )
    })

    if (blob.size > MAX_BYTES) {
      throw new Error('The combined photo is over 10 MB. Retake it closer to the ID or use a smaller image.')
    }

    return new File([blob], 'mort-id-evidence.jpg', { type: 'image/jpeg', lastModified: Date.now() })
  } finally {
    decoded.forEach((image) => image.dispose())
  }
}

export function VerificationUploader({ action, verificationType, isAdult, canSubmitEvidence, hasPendingCase }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraOpening, setCameraOpening] = useState(false)
  const [cameraMessage, setCameraMessage] = useState('')
  const [captureSide, setCaptureSide] = useState<CaptureSide>('front')
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [manualReselect, setManualReselect] = useState(false)

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return
    videoRef.current.srcObject = streamRef.current
    void videoRef.current.play().catch(() => {
      setCameraMessage('The camera preview could not start. Close it and choose a file instead.')
    })
  }, [cameraOpen])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function clearFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOpen(false)
  }

  function attachOneFile(file: File): boolean {
    if (!fileInputRef.current || typeof DataTransfer === 'undefined') return false
    try {
      const transfer = new DataTransfer()
      transfer.items.add(file)
      fileInputRef.current.files = transfer.files
      return true
    } catch {
      return false
    }
  }

  function clearCurrentEvidence() {
    clearFileInput()
    setCapturedPhotos([])
    setSelectedLabel('')
    setPreviewUrl('')
    setManualReselect(false)
  }

  function acceptPreparedFile(file: File, label: string) {
    setSelectedLabel(label)
    setPreviewUrl(URL.createObjectURL(file))
    if (attachOneFile(file)) {
      setManualReselect(false)
      setProcessingMessage('')
      return
    }

    clearFileInput()
    setManualReselect(true)
    setProcessingMessage('This browser cannot attach the prepared photo automatically. Save the image below, then choose it as a single file.')
  }

  async function openCamera(side: CaptureSide) {
    if (cameraOpening || processing) return
    setCameraMessage('')
    setProcessingMessage('')
    if (side === 'front') clearCurrentEvidence()
    setCaptureSide(side)

    if (!window.isSecureContext) {
      setCameraMessage('Camera access requires a secure HTTPS page. You can still choose a file below.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage('This browser does not offer camera capture here. You can still choose a file below.')
      return
    }

    stopCamera()
    setCameraOpening(true)
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      setCameraOpen(true)
    } catch (error) {
      stopCamera()
      const name = error instanceof DOMException ? error.name : ''
      setCameraMessage(name === 'NotAllowedError'
        ? 'Camera permission was not granted. You can still choose a file below.'
        : name === 'NotFoundError'
          ? 'No camera was found. You can still choose a file below.'
          : 'Camera capture is unavailable right now. You can still choose a file below.')
    } finally {
      setCameraOpening(false)
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraMessage('The camera is not ready yet. Wait a moment and try again, or choose a file.')
      return
    }

    const scale = Math.min(1, 2000 / video.videoWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    const context = canvas.getContext('2d')
    if (!context) {
      setCameraMessage('This browser could not capture the photo. Choose a file instead.')
      stopCamera()
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const side = captureSide
    stopCamera()
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setCameraMessage('The photo could not be prepared. Choose a file instead.')
        return
      }

      const photo = new File([blob], `mort-id-${side}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
      const photos = side === 'back' && capturedPhotos[0] ? [capturedPhotos[0], photo] : [photo]
      try {
        const readyFile = photos.length === 2 ? await combineImages(photos) : photo
        setCapturedPhotos(photos)
        acceptPreparedFile(readyFile, photos.length === 2 ? 'Front and back combined on this device.' : `${side === 'front' ? 'Front' : 'Back'} photo ready to submit.`)
        setCameraMessage('')
      } catch (error) {
        setCapturedPhotos(photos)
        setCameraMessage(error instanceof Error ? error.message : 'The photo could not be prepared. Choose a file instead.')
      }
    }, 'image/jpeg', 0.86)
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    stopCamera()
    setCameraMessage('')
    setProcessingMessage('')
    setSelectedLabel('')
    setCapturedPhotos([])
    setPreviewUrl('')
    setManualReselect(false)

    const selectedFiles = Array.from(event.currentTarget.files || [])
    if (!selectedFiles.length) return
    if (selectedFiles.length > (isAdult ? 2 : 1)) {
      clearFileInput()
      setProcessingMessage(isAdult
        ? 'Choose one file or two image files (front first, then back).'
        : 'Choose one file.')
      return
    }

    let files: File[]
    try {
      files = selectedFiles.map(normalizeEvidenceFile)
    } catch (error) {
      clearFileInput()
      setProcessingMessage(error instanceof Error ? error.message : 'Choose a supported ID file.')
      return
    }

    if (files.some((file) => file.size === 0 || file.size > MAX_BYTES)) {
      clearFileInput()
      setProcessingMessage('Each file must contain data and be 10 MB or smaller.')
      return
    }

    if (files.length === 1) {
      if (files[0] !== selectedFiles[0] && !attachOneFile(files[0])) {
        setProcessingMessage('This browser could not prepare the selected file. Choose a PDF or an image with a recognized file type.')
        return
      }
      setSelectedLabel(selectedFiles[0].name)
      return
    }

    if (files.some((file) => !COMPOSABLE_MIME_TYPES.has(file.type))) {
      clearFileInput()
      setProcessingMessage('To submit both sides together, select two JPG, PNG, or WebP images, or choose one PDF that already contains both sides. A single HEIC file is supported.')
      return
    }

    setProcessing(true)
    try {
      const combined = await combineImages(files)
      acceptPreparedFile(combined, 'Front and back combined on this device.')
    } catch (error) {
      clearFileInput()
      setProcessingMessage(error instanceof Error ? error.message : 'These images could not be combined. Choose one image or a single PDF instead.')
    } finally {
      setProcessing(false)
    }
  }

  function retakeFront() {
    clearCurrentEvidence()
    setCameraMessage('')
    void openCamera('front')
  }

  const accept = '.jpg,.jpeg,.png,.webp,.heic,.pdf,image/jpeg,image/png,image/webp,image/heic,application/pdf'

  return (
    <form action={action} className="card form verification-uploader">
      <div className="card-icon-tile"><Icon name="shield" /></div>
      <h3>{isAdult ? 'Adult identity evidence' : 'Teen identity evidence'}</h3>
      <p className="verification-uploader-description">
        {isAdult
          ? 'Upload a valid, unexpired government-issued photo ID (driver license, state ID, or passport). MORT staff review every submission.'
          : 'Upload a current school-issued photo ID, or official enrollment confirmation if your school has no photo ID. MORT staff review every submission.'}
      </p>
      <input type="hidden" name="verification_type" value={verificationType} />

      {isAdult && (
        <div className="verification-capture-tools">
          <p className="eyebrow">CHOOSE HOW TO ADD YOUR ID</p>
          <p className="field-hint">Your camera stays off until you choose Use computer camera. Captures stay on this device until you submit.</p>
          <div className="verification-camera-actions">
            {!cameraOpen ? (
              <button
                type="button"
                className="btn ghost"
                disabled={cameraOpening || processing}
                onClick={() => void openCamera('front')}
              >
                {cameraOpening ? 'Waiting for camera…' : 'Use computer camera'}
              </button>
            ) : (
              <div className="verification-camera-panel">
                <video ref={videoRef} className="verification-live-preview" autoPlay muted playsInline aria-label="Live camera preview of your ID" />
                <div className="verification-camera-actions">
                  <button type="button" className="btn primary" onClick={capturePhoto}>
                    Capture {captureSide} side
                  </button>
                  <button type="button" className="btn ghost" onClick={stopCamera}>Close camera</button>
                </div>
              </div>
            )}
            {capturedPhotos.length === 1 && !cameraOpen && (
              <button type="button" className="btn ghost" disabled={processing} onClick={() => void openCamera('back')}>
                Capture the back too
              </button>
            )}
            {capturedPhotos.length > 0 && !cameraOpen && (
              <button type="button" className="btn ghost" disabled={processing} onClick={retakeFront}>
                Retake photo
              </button>
            )}
          </div>
          {cameraMessage && <p className="verification-inline-error" role="alert">{cameraMessage}</p>}
          {previewUrl && capturedPhotos.length > 0 && (
            <div className="verification-capture-preview">
              <img src={previewUrl} alt="Local preview of the ID photo prepared for upload" />
            </div>
          )}
        </div>
      )}

      <label className="verification-file-label" htmlFor="verification-evidence-file">
        {isAdult ? 'Choose from your computer' : 'Choose a file'}
        <input
          ref={fileInputRef}
          id="verification-evidence-file"
          name="evidence"
          type="file"
          accept={accept}
          multiple={isAdult}
          required
          disabled={processing || cameraOpening}
          onChange={(event) => void handleFileChange(event)}
          aria-describedby="verification-file-hint verification-file-status"
        />
      </label>
      <p id="verification-file-hint" className="field-hint">
        JPG, PNG, WebP, HEIC, or PDF · up to 10 MB. For a two-sided ID, choose front first and back second; images are combined on this device. A multi-page PDF can be selected as one file.
      </p>
      <p id="verification-file-status" className="verification-file-status" aria-live="polite">
        {processing ? 'Combining images on this device…' : selectedLabel}
      </p>
      {processingMessage && <p className="verification-inline-error" role="alert">{processingMessage}</p>}
      {manualReselect && previewUrl && (
        <a className="btn ghost verification-save-photo" href={previewUrl} download="mort-id-evidence.jpg">
          Save prepared photo, then select it above
        </a>
      )}

      {hasPendingCase ? (
        <p className="muted">You already have a submission under review. You can submit again after it is decided.</p>
      ) : canSubmitEvidence ? (
        <SubmitButton disabled={processing} pendingLabel="Uploading…">Submit for review</SubmitButton>
      ) : null}
      <p className="muted verification-private-note">Do not email identity documents to MORT support. Uploads go to a private bucket only you and MORT reviewers can access.</p>

      {isAdult && <PhoneVerificationQr />}
    </form>
  )
}

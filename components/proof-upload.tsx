'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { PROOF_BUCKET, validateProofFile } from '@/lib/mort'
import { recordProofUpload } from '@/app/app/teen/actions'

interface Props {
  applicationId: string
}

export function ProofUpload({ applicationId }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error' | 'done'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (!file) {
      setStatus('error')
      setMessage('Choose a JPEG proof photo first.')
      return
    }
    const validationError = validateProofFile(file)
    if (validationError) {
      setStatus('error')
      setMessage(validationError)
      return
    }

    setStatus('uploading')
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setStatus('error')
        setMessage('You need to be signed in to upload proof.')
        return
      }
      const proofId = crypto.randomUUID()
      // The live submit_application_proof RPC requires this exact path format:
      // <auth.uid>/<proof_id>.jpg in the proof-uploads bucket.
      const path = `${user.id}/${proofId}.jpg`

      const { error: uploadError } = await supabase.storage.from(PROOF_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      })

      if (uploadError) {
        setStatus('error')
        const msg = uploadError.message || ''
        if (/bucket not found/i.test(msg)) {
          setMessage(`Proof storage bucket "${PROOF_BUCKET}" does not exist yet. Ask your MORT admin to finish Supabase Storage setup (see README).`)
        } else if (/row-level security|policy/i.test(msg)) {
          setMessage('Upload blocked by storage security policy. Your account may not have permission to upload proof yet — see README storage setup.')
        } else {
          setMessage(`Upload failed: ${msg}`)
        }
        return
      }

      const fd = new FormData()
      fd.set('application_id', applicationId)
      fd.set('proof_id', proofId)
      fd.set('storage_path', path)
      fd.set('note', note)

      const result = await recordProofUpload(fd)
      if (result && result.error) {
        setStatus('error')
        setMessage(`File uploaded, but saving the record failed: ${result.error}`)
        return
      }

      setStatus('done')
      setMessage('Proof uploaded successfully.')
      setFile(null)
      setNote('')
      if (inputRef.current) inputRef.current.value = ''
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || 'Something went wrong uploading proof.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form" style={{ marginTop: 12 }}>
      <label>
        Proof JPEG photo
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
      <label>
        Note (optional)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what you completed..."
        />
      </label>
          <button className="btn primary" type="submit" disabled={status === 'uploading'}>
            {status === 'uploading' && <span className="spinner" aria-hidden="true" />}
            {status === 'uploading' ? 'Uploading…' : 'Upload proof'}
          </button>
      {message && (
        <div className={status === 'error' ? 'error' : 'success-box'} style={{ marginBottom: 0 }}>
          {message}
        </div>
      )}
    </form>
  )
}

import React from 'react'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title = 'Confirm', message = '', confirmLabel = 'Yes', cancelLabel = 'Cancel', onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel} />
      <div className="relative bg-white rounded-md shadow-lg max-w-md w-full p-4 m-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-3 py-1 rounded bg-gray-100" onClick={onCancel}>{cancelLabel}</button>
          <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

import React from 'react'

type TileProps = {
  id: string
  title?: string
  image?: string
  caption?: string
  onRemove?: (id: string) => void
}

export default function Tile({ id, title, image, caption, onRemove }: TileProps) {
  return (
    <article className="tile rounded-md border bg-white shadow-sm overflow-hidden">
      {image ? (
        <img src={image} alt={title || 'tile image'} className="w-full h-36 object-cover" />
      ) : (
        <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
      )}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-gray-800">{title || 'Untitled'}</h3>
          {onRemove && (
            <button
              onClick={() => onRemove(id)}
              className="text-xs text-red-500 hover:underline ml-2"
            >
              Remove
            </button>
          )}
        </div>
        {caption && <p className="mt-2 text-xs text-gray-600">{caption}</p>}
      </div>
    </article>
  )
}

export default function StarRating({ rating, onChange, readOnly = false, size = 'text-5xl' }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={readOnly ? 'button' : 'button'}
          disabled={readOnly}
          onClick={() => !readOnly && onChange && onChange(star)}
          className={`${size} transition-colors ${
            star <= rating ? 'text-primary' : 'text-gray-300'
          } ${!readOnly ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

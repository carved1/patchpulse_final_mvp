export default function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

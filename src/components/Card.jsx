export default function Card({ title, actions, as: Tag = 'section', className = '', children }) {
  return (
    <Tag className={`card ${className}`.trim()}>
      {(title || actions) && (
        <div className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </Tag>
  );
}

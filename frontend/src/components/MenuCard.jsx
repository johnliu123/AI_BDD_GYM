export default function MenuCard({ item }) {
  const soldOut = item.is_active === false;
  const hasImage = Boolean(item.image_url) && !item.image_failed;

  const handleImageError = (event) => {
    event.currentTarget.style.display = 'none';
    if (item) {
      item.image_failed = true;
    }
  };

  return (
    <article className={`menu-card${soldOut ? ' menu-card--sold-out' : ''}`}>
      <div className="menu-card__image-wrap">
        {hasImage ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="menu-card__image"
            onError={handleImageError}
          />
        ) : (
          <div className="menu-card__placeholder">暫無圖片</div>
        )}
      </div>

      <div className="menu-card__content">
        <div className="menu-card__header">
          <h3>{item.name}</h3>
          <span className="menu-card__tag">{item.category_name || '暫無分類'}</span>
          {soldOut && <span className="menu-card__sold-out">售完</span>}
        </div>
        <p className="menu-card__price">
          {typeof item.price === 'number' ? `NT$ ${item.price}` : item.price || '暫無價格'}
        </p>
      </div>
    </article>
  );
}

import './styles/FeaturesCard.css'

const FeaturesCard = ({ icon, title, description }) => {
  return (
    <article className="features-card">
      <div className="features-card__icon" aria-hidden="true">
        {icon}
      </div>

      <h3 className="features-card__title">{title}</h3>

      <p className="features-card__description">{description}</p>
    </article>
  )
}

export default FeaturesCard

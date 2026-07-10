import './App.css'
import FeaturesCard from './components/FeaturesCard'
import { Link } from 'react-router-dom'

const featureCards = [
  {
    icon: <img src="/person.svg" alt="" aria-hidden="true" />,
    title: 'Connect with Fur Parents',
    description:
      'Join a thriving community of pet lovers, share experiences, and make friends who understand your passion.',
  },
  {
    icon: <img src="/pin.svg" alt="" aria-hidden="true" />,
    title: 'Find Pet-Friendly Places',
    description:
      'Discover restaurants with outdoor seating for your pup, trusted veterinarians, and pet supply stores nearby.',
  },
  {
    icon: <img src="/book.svg" alt="" aria-hidden="true" />,
    title: 'Read & Share Blogs',
    description:
      'Discover pet care tips, travel stories, and advice from experienced pet parents just like you.',
  },
  {
    icon: <img src="/star.svg" alt="" aria-hidden="true" />,
    title: 'Rate & Review',
    description:
      'Help other pet parents make informed decisions by sharing your honest reviews and ratings.',
  },
]

const HomePage = () => {
  return (
    <main className="page">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-header__brand" to="/">
            Furiend
          </Link>

          <nav className="site-header__nav" aria-label="Primary">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="site-header__actions">
            <Link className="btn btn--ghost" to="/signin">
              Sign In
            </Link>
            <Link className="btn btn--solid" to="/signup">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero__inner">
          <div className="hero__copy">
            <h1>Discover the Perfect Spots for Your Furry Friend</h1>
            <p>
              Find pet-friendly restaurants, vets, and pet stores near you.
              Connect with other pet parents and share your favorite discoveries
              through our vibrant community.
            </p>

            <dl className="hero__stats" aria-label="Community stats">
              <div className="hero__stat">
                <dt>40k+</dt>
                <dd>Community Post</dd>
              </div>
              <div className="hero__stat">
                <dt>20k+</dt>
                <dd>Fur Parents</dd>
              </div>
              <div className="hero__stat">
                <dt>2k+</dt>
                <dd>Pet-Friendly Places</dd>
              </div>
            </dl>
          </div>

          <div className="hero__visual">
            <img src="/image%201.png" alt="Two women sitting with a dog and a cat" />
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features__inner">
          <h2>Everything You Need for Your Pet Journey</h2>
          <p>
            We&apos;ve designed Furiend to make it easy for pet parents to find
            great places and connect with their community.
          </p>

          <div className="features__grid">
            {featureCards.map((card) => (
              <FeaturesCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="site-footer__inner">
          <p className="site-footer__copyright">© 2026 Furiend. All rights reserved.</p>

          <nav className="site-footer__nav" aria-label="Footer">
            <a href="#faqs">FAQs</a>
            <a href="#contact">CONTACT US</a>
            <a href="#ticket">SUBMIT A TICKET</a>
          </nav>
        </div>
      </footer>
    </main>
  )
}

const App = HomePage

export default App

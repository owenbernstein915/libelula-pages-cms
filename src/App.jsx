import { useEffect, useMemo, useState } from "react";
import site from "./content/site.json";
import menus from "./content/menu.json";

const external = { target: "_blank", rel: "noreferrer" };

function Brand({ home = "/" }) {
  return (
    <a className="wordmark" href={home} aria-label={`${site.brand.name} home`}>
      <span>{site.brand.name}</span>
      <small>{site.brand.subtitle}</small>
    </a>
  );
}

function Header({ menuPage = false }) {
  return (
    <>
      <header className={`site-header${menuPage ? " menu-site-header" : ""}`}>
        <Brand home={menuPage ? "/" : "#top"} />
        <nav aria-label={menuPage ? "Menu page navigation" : "Main navigation"}>
          {menuPage ? (
            <>
              <a href="/">Home</a>
              <a href="/#story">Our story</a>
              <a href="/#visit">Visit</a>
            </>
          ) : (
            <>
              <a href="/menu">Menus</a>
              <a href="#bakery">Bakery</a>
              <a href="#story">Our story</a>
              <a href="#visit">Visit</a>
            </>
          )}
        </nav>
        <a className="button button-dark header-cta" href={menuPage ? "/#reserve" : "#reserve"}>
          Reserve
        </a>
      </header>
      {site.announcement.enabled && (
        <div className="announcement-banner" role="status">
          {site.announcement.text}
        </div>
      )}
    </>
  );
}

function Footer({ menuPage = false }) {
  return (
    <footer>
      <Brand home={menuPage ? "/" : "#top"} />
      <div className="footer-links">
        <a href={site.links.reservations} {...external}>Reservations</a>
        <a href={site.links.orderOnline} {...external}>Order online</a>
        <a href={menuPage ? "/#contact" : "#contact"}>Custom cakes + catering</a>
        <a href={site.links.instagram} {...external}>Instagram</a>
        {!menuPage && <a href={site.links.facebook} {...external}>Facebook</a>}
      </div>
      <p>{site.brand.location} · © {new Date().getFullYear()} {site.brand.name} {site.brand.subtitle}</p>
    </footer>
  );
}

function CmsImage({ src, alt, className, imageClassName, reveal = false, eager = false }) {
  return (
    <picture className={className} data-reveal={reveal ? "image" : undefined}>
      <img
        className={imageClassName}
        src={src}
        alt={alt || ""}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
      />
    </picture>
  );
}

function getNewYorkParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function todayInNewYork() {
  const { year, month, day } = getNewYorkParts();
  return `${year}-${month}-${day}`;
}

function displayHour(hour) {
  if (hour === 12) return "12:00 PM";
  return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
}

function availableTimes(date) {
  if (!date) return [];
  const day = new Date(`${date}T12:00:00`).getDay();
  if (day === 1) return [];
  const close = day === 5 || day === 6 ? 21 : 16;
  const today = todayInNewYork();
  const { hour, minute } = getNewYorkParts();
  const nowMinutes = Number(hour) * 60 + Number(minute);
  return Array.from({ length: close - 8 }, (_, index) => index + 8)
    .filter((itemHour) => date !== today || itemHour * 60 > nowMinutes)
    .map((itemHour) => ({
      value: `${String(itemHour).padStart(2, "0")}:00`,
      label: displayHour(itemHour),
    }));
}

function HomePage() {
  const today = todayInNewYork();
  const [partySize, setPartySize] = useState("2");
  const [date, setDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState("");
  const [formStatus, setFormStatus] = useState("idle");
  const times = useMemo(() => availableTimes(date), [date]);
  const time = times.some((option) => option.value === selectedTime)
    ? selectedTime
    : (times[0]?.value ?? "");

  useEffect(() => {
    document.title = `${site.brand.name} ${site.brand.subtitle} | Montclair, NJ`;
    document.documentElement.classList.add("reveal-ready");
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  async function submitInquiry(event) {
    event.preventDefault();
    setFormStatus("submitting");
    const form = event.currentTarget;
    const body = new URLSearchParams(Object.fromEntries(new FormData(form).entries())).toString();
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!response.ok) throw new Error("Unable to send inquiry");
      form.reset();
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  const dayName = date
    ? new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))
    : "that day";
  const visibleReviews = site.reviews.items.filter((review) => review.visible !== false);
  const visibleSocial = site.social.images.filter((image) => image.visible !== false);

  return (
    <main className="landing-page">
      <Header />

      <section className="hero" id="top">
        <CmsImage className="hero-picture" imageClassName="hero-image" src={site.hero.image} alt={site.hero.imageAlt} eager />
        <div className="hero-overlay">
          <p className="eyebrow">{site.hero.eyebrow}</p>
          <h1 aria-label={site.hero.title}>{site.hero.title}</h1>
          <div className="hero-bottom">
            <p className="hero-deck">{site.hero.description}</p>
            <div className="hero-actions">
              <a className="button button-coral" href={site.hero.buttonUrl}>{site.hero.buttonText}</a>
              <a className="text-link light-link" href={site.links.orderOnline} {...external}>
                Order online <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-collage" aria-label="Food and baking from Libélula">
        <CmsImage className="collage-wide" src="/images/food-detail-4.jpg" alt="Tres leches pancakes with berries from Libélula" reveal />
        <img data-reveal="image" src="/images/instagram-tuna-tostada.jpg" alt="Tuna tostada shared by Libélula on Instagram" loading="lazy" decoding="async" />
        <CmsImage className="collage-tall" src="/images/food-detail-1.jpg" alt="A colorful dish from the Libélula kitchen" reveal />
        <CmsImage className="collage-last" src="/images/food-detail-3.jpg" alt="A roasted chicken plate from the Libélula kitchen" reveal />
        <a className="collage-caption" href={site.links.instagram} {...external}>
          More from @libelulamontclair <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="bakery-section" id="bakery">
        <div className="bakery-copy" data-reveal="text">
          <p className="eyebrow">{site.bakery.eyebrow}</p>
          <h2>{site.bakery.heading}</h2>
          <p>{site.bakery.description}</p>
          <div className="bakery-actions">
            <a className="button button-dark" href={site.bakery.primaryButtonUrl}>{site.bakery.primaryButtonText}</a>
            <a className="text-link" href={site.bakery.secondaryButtonUrl}>
              {site.bakery.secondaryButtonText} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="bakery-gallery" aria-label="A custom cake by Libélula">
          <CmsImage className="bakery-cake-photo" src={site.bakery.image} alt={site.bakery.imageAlt} reveal />
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-photo-card" data-reveal="image">
          <CmsImage src={site.story.image} alt={site.story.imageAlt} />
          <p>{site.story.imageCaption}</p>
        </div>
        <div className="story-copy" data-reveal="text">
          <p className="eyebrow">{site.story.eyebrow}</p>
          <h2>{site.story.heading}</h2>
          <p className="story-lead">{site.story.description}</p>
          <div className="bio-grid">
            {site.story.owners.map((owner) => (
              <article key={owner.name}>
                <h3>{owner.name}</h3>
                <p>{owner.bio}</p>
                {owner.linkText && owner.linkUrl && (
                  <a className="text-link" href={owner.linkUrl} {...external}>
                    {owner.linkText} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="rating-block" data-reveal="text">
          <p className="eyebrow">{site.reviews.eyebrow}</p>
          <div className="rating-line">
            <strong>{site.reviews.rating}</strong>
            <span aria-label="five stars">★★★★★</span>
          </div>
          <p>{site.reviews.ratingText}</p>
          <a className="text-link" href={site.reviews.reviewsUrl} {...external}>
            Read Google reviews <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="review-grid">
          {visibleReviews.map((review, index) => (
            <blockquote data-reveal="text" key={`${review.source}-${index}`}>
              <span aria-hidden="true">“</span>
              <p>{review.quote}</p>
              <cite>{review.source}</cite>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="social-section">
        <div className="social-heading" data-reveal="text">
          <div>
            <p className="eyebrow">{site.social.eyebrow}</p>
            <h2>{site.social.heading}</h2>
          </div>
          <a className="button button-outline" href={site.links.instagram} {...external}>
            {site.social.buttonText} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="social-grid">
          {visibleSocial.map((item, index) => (
            <CmsImage key={`${item.image}-${index}`} src={item.image} alt={item.alt} reveal />
          ))}
        </div>
      </section>

      <section className="reservation-section" id="reserve">
        <div className="reservation-copy" data-reveal="text">
          <p className="eyebrow">{site.reservation.eyebrow}</p>
          <h2>{site.reservation.heading}</h2>
          <p>{site.reservation.description}</p>
          <a className="text-link reservation-live-link" href={site.links.reservations} {...external}>
            {site.reservation.liveLinkText} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <form className="reservation-card reservation-card-standalone" action={site.links.reservations} method="get" target="_blank" data-reveal="text">
          <label>
            Party size
            <select name="partySize" value={partySize} onChange={(event) => setPartySize(event.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => <option value={size} key={size}>{size} {size === 1 ? "guest" : "guests"}</option>)}
            </select>
          </label>
          <label>
            Date
            <input name="date" type="date" min={today} value={date} onChange={(event) => { setDate(event.target.value); setSelectedTime(""); }} required />
          </label>
          <label>
            Time
            <select name="time" value={time} onChange={(event) => setSelectedTime(event.target.value)} disabled={!times.length} required aria-describedby="reservation-time-note">
              {!times.length && <option value="">No times available</option>}
              {times.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </label>
          <p className="reservation-time-note" id="reservation-time-note">
            {times.length
              ? `${dayName} hours: ${times[0].label} through ${times[times.length - 1].label}.`
              : dayName === "Monday"
                ? "Libélula is closed on Mondays. Choose another date."
                : "No remaining reservation times for this date. Choose another day or check Toast directly."}
          </p>
          <button className="button button-light" type="submit" disabled={!times.length}>
            Check availability <span aria-hidden="true">↗</span>
          </button>
        </form>
      </section>

      <section className="visit-section" id="visit">
        <div className="visit-heading" data-reveal="text">
          <p className="eyebrow">{site.visit.eyebrow}</p>
          <h2>{site.visit.addressLine1}<br />{site.visit.addressLine2}</h2>
          <div className="visit-actions">
            <a className="button button-coral" href={site.visit.mapUrl} {...external}>
              Get directions <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link light-link" href={site.visit.phoneUrl}>{site.visit.phoneDisplay}</a>
          </div>
        </div>
        <div className="hours-card" data-reveal="text">
          <p className="eyebrow">Hours</p>
          <dl>
            {site.visit.hours.map((item) => (
              <div key={item.day}>
                <dt>{item.day}</dt>
                <dd>{item.time}</dd>
              </div>
            ))}
          </dl>
          <p className="hours-note">{site.visit.hoursNote}</p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="eyebrow">{site.contact.eyebrow}</p>
          <h2>{site.contact.heading}</h2>
          <p>
            {site.contact.description} You can also call <a href={site.visit.phoneUrl}>{site.visit.phoneDisplay}</a> or write to <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
          </p>
        </div>
        <form className="contact-form" name="libelula-inquiry" method="POST" data-netlify="true" data-netlify-honeypot="website" onSubmit={submitInquiry}>
          <input type="hidden" name="form-name" value="libelula-inquiry" />
          <label>Name<input name="name" type="text" autoComplete="name" maxLength="100" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" maxLength="160" required /></label>
          <label>
            Inquiry type
            <select name="inquiryType" defaultValue="custom-cake" required>
              <option value="custom-cake">Custom cake</option>
              <option value="catering">Catering</option>
              <option value="private-event">Private event</option>
              <option value="careers">Careers</option>
              <option value="general">General question</option>
            </select>
          </label>
          <label>Event date (optional)<input name="eventDate" type="date" min={today} /></label>
          <label className="full-field">Message<textarea name="message" rows="5" minLength="10" maxLength="3000" required /></label>
          <label className="honey-field" aria-hidden="true">Website<input name="website" type="text" tabIndex="-1" autoComplete="off" /></label>
          <button className="button button-dark full-field" type="submit" disabled={formStatus === "submitting"}>
            {formStatus === "submitting" ? "Sending…" : "Send inquiry"}
          </button>
          <div className={`form-status full-field ${formStatus}`} aria-live="polite">
            {formStatus === "success" && <p><strong>Thank you.</strong> Your inquiry is in, and the Libélula team can follow up by email.</p>}
            {formStatus === "error" && <p>Something went wrong. Please try again or email <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.</p>}
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}

function MenuPage() {
  const initialMenu = window.location.hash === "#bakery-cakes" ? "bakery" : menus[0].id;
  const [activeMenuId, setActiveMenuId] = useState(initialMenu);
  const [activeSection, setActiveSection] = useState(0);
  const activeMenu = menus.find((menu) => menu.id === activeMenuId) || menus[0];
  const section = activeMenu.sections[activeSection] || activeMenu.sections[0];
  const menuItems = section.items.filter((item) => item.available !== false);

  useEffect(() => {
    document.title = `Menus | ${site.brand.name} ${site.brand.subtitle}`;
  }, []);

  function chooseMenu(id) {
    setActiveMenuId(id);
    setActiveSection(0);
  }

  function handleMenuKeys(event, index) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? menus.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + menus.length) % menus.length;
    chooseMenu(menus[nextIndex].id);
    requestAnimationFrame(() => document.getElementById(`menu-tab-${menus[nextIndex].id}`)?.focus());
  }

  function handleCategoryKeys(event, index) {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const count = activeMenu.sections.length;
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : (index + (forward ? 1 : -1) + count) % count;
    setActiveSection(nextIndex);
    requestAnimationFrame(() => document.getElementById(`category-tab-${activeMenuId}-${nextIndex}`)?.focus());
  }

  return (
    <main className="menu-page">
      <Header menuPage />
      <section className="menu-page-hero">
        <div>
          <p className="eyebrow">{site.brand.name} {site.brand.subtitle}</p>
          <h1>Full menu</h1>
          <p>Choose a service, then a category. Only one section opens at a time, so the menu stays easy to scan.</p>
        </div>
      </section>

      <section className="menu-browser" aria-label="Libélula menus">
        <div className="menu-browser-top">
          <div className="menu-switcher" role="tablist" aria-label="Choose a menu">
            {menus.map((menu, index) => (
              <button
                className={activeMenuId === menu.id ? "active" : ""}
                id={`menu-tab-${menu.id}`}
                onClick={() => chooseMenu(menu.id)}
                onKeyDown={(event) => handleMenuKeys(event, index)}
                role="tab"
                aria-selected={activeMenuId === menu.id}
                aria-controls="menu-category-panel"
                tabIndex={activeMenuId === menu.id ? 0 : -1}
                type="button"
                key={menu.id}
              >
                {menu.label}
              </button>
            ))}
          </div>
          <a className="text-link" href={site.links.orderOnline} {...external}>Order online <span aria-hidden="true">↗</span></a>
        </div>

        <div className="menu-browser-layout">
          <aside className="menu-category-nav" aria-label={`${activeMenu.label} categories`}>
            <div>
              <p className="eyebrow">{activeMenu.kicker}</p>
              <h2>{activeMenu.note}</h2>
            </div>
            <div className="category-buttons" role="tablist" aria-label={`${activeMenu.label} sections`} aria-orientation="vertical">
              {activeMenu.sections.map((item, index) => {
                const count = item.items.filter((menuItem) => menuItem.available !== false).length;
                return (
                  <button
                    className={activeSection === index ? "active" : ""}
                    id={`category-tab-${activeMenuId}-${index}`}
                    onClick={() => setActiveSection(index)}
                    onKeyDown={(event) => handleCategoryKeys(event, index)}
                    type="button"
                    role="tab"
                    aria-selected={activeSection === index}
                    aria-controls="menu-category-panel"
                    tabIndex={activeSection === index ? 0 : -1}
                    key={`${item.title}-${index}`}
                  >
                    <span>{item.title}</span><small>{count}</small>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="menu-category-panel" id="menu-category-panel" role="tabpanel" aria-labelledby={`category-tab-${activeMenuId}-${activeSection}`} key={`${activeMenuId}-${section.title}`}>
            <div className="category-panel-heading">
              <p className="eyebrow">{activeMenu.label}</p>
              <h2>{section.title}</h2>
              <span>{menuItems.length} {menuItems.length === 1 ? "item" : "items"}</span>
            </div>
            <div className="compact-menu-grid">
              {menuItems.map((item, index) => (
                <article className="compact-menu-item" key={`${item.name}-${index}`}>
                  <div><h3>{item.name}</h3>{item.detail && <p>{item.detail}</p>}</div>
                  {item.price && <strong>{item.price}</strong>}
                </article>
              ))}
            </div>
            <div className="menu-panel-footer">
              <p>Offerings and prices may change with availability.</p>
              {activeSection < activeMenu.sections.length - 1 && (
                <button type="button" onClick={() => setActiveSection(activeSection + 1)}>
                  Next: {activeMenu.sections[activeSection + 1].title} <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="menu-disclaimer">Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness.</p>
      </section>

      <section className="menu-page-actions">
        <div><p className="eyebrow">Ready to visit?</p><h2>Come by for the bakery, breakfast, lunch, or weekend dinner.</h2></div>
        <div>
          <a className="button button-coral" href={site.links.reservations} {...external}>Reserve a table <span aria-hidden="true">↗</span></a>
          <a className="text-link light-link" href="/#contact">Custom cake or catering <span aria-hidden="true">→</span></a>
          <a className="text-link light-link" href="/">Back to the homepage <span aria-hidden="true">→</span></a>
        </div>
      </section>
      <Footer menuPage />
    </main>
  );
}

export default function App() {
  const route = window.location.pathname.replace(/\/+$/, "") || "/";
  return route === "/menu" ? <MenuPage /> : <HomePage />;
}

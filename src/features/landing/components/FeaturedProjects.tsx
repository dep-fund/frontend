import "./FeaturedProjects.css";

const projects = [
  {
    image: "src/features/assets/img/complejogym.jpg",
    imageAlt: "imagen 2",
    roi: "14.2% ROI",
    title: "Gimnasio Deportivo",
    location: "Buenos Aires, ARG",
    progress: 84,
    raised: "$420K",
    investors: 234,
  },
  {
    image: "src/features/assets/img/complejomardelplata.png",
    imageAlt: "imagen 3",
    roi: "11.8% ROI",
    title: "Complejo de Tenis Costa",
    location: "Mar del Plata, ARG",
    progress: 72,
    raised: "$180K",
    investors: 156,
  },
  {
    image: "src/features/assets/img/complejobariloche.png",
    imageAlt: "imagen 4",
    roi: "16.5% ROI",
    title: "Resort de Esquí Montaña",
    location: "Bariloche, ARG",
    progress: 87,
    raised: "$650K",
    investors: 412,
  },
];

export default function FeaturedProjects() {
  return (
    <section className="projects-section">
      <div className="projects-inner">
        <div className="projects-header">
          <h2 className="projects-title">Proyectos Destacados</h2>
          <a href="#" className="projects-see-all">
            Ver todos los proyectos →
          </a>
        </div>

        <div className="projects-grid">
          {projects.map((p) => (
            <div className="project-card" key={p.title}>
              <div className="project-img-wrapper">
                <img src={p.image} alt={p.imageAlt} className="project-img" />
                <span className="project-roi-badge">{p.roi}</span>
              </div>
              <div className="project-body">
                <h3 className="project-name">{p.title}</h3>
                <p className="project-location">{p.location}</p>
                <div className="project-progress-row">
                  <span className="project-progress-label">Progreso de Financiamiento</span>
                  <span className="project-progress-pct">{p.progress}%</span>
                </div>
                <div className="project-progress-bar">
                  <div
                    className="project-progress-fill"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <div className="project-footer">
                  <div className="project-meta">
                    <div>
                      <div className="project-meta-label">Recaudado</div>
                      <div className="project-meta-value">{p.raised}</div>
                    </div>
                    <div>
                      <div className="project-meta-label">Inversores</div>
                      <div className="project-meta-value">{p.investors}</div>
                    </div>
                  </div>
                  <button className="btn-primary project-btn">Invertir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

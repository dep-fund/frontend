import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Invertí",
    desc: "Explorá proyectos e invertí en la infraestructura deportiva en la que creés.",
  },
  {
    number: "02",
    title: "Recibí Tokens",
    desc: "Obtené tokens blockchain que representan tu participación en el proyecto.",
  },
  {
    number: "03",
    title: "Generá Dividendos",
    desc: "Recibí ingresos automáticos desde los ingresos reales generados por el complejo deportivo.",
  },
  {
    number: "04",
    title: "Operá o Votá",
    desc: "Vendé tus tokens en el marketplace o votá en las decisiones del proyecto.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="how-inner">
        <h2 className="how-title">Cómo Funciona</h2>
        <div className="how-steps">
          {steps.map((step, i) => (
            <div className="how-step" key={step.number}>
              <div className="how-step-header">
                <span className="how-step-number">{step.number}</span>
                {i < steps.length - 1 && <span className="how-step-dash">—</span>}
              </div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

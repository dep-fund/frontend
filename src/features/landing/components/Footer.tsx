import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-name">
            <span className="brand-dep">Dep</span><span className="brand-fund">Fund</span>
          </span>
          <p className="footer-brand-desc">
            Inversiones tokenizadas en infraestructura deportiva para todos.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Plataforma</h4>
          <ul>
            <li><a href="#">Explorar Proyectos</a></li>
            <li><a href="#">Cómo Funciona</a></li>
            <li><a href="#">Gobernanza</a></li>
            <li><a href="#">Marketplace</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Recursos</h4>
          <ul>
            <li><a href="#">Documentación</a></li>
            <li><a href="#">Preguntas Frecuentes</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Soporte</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Legal</h4>
          <ul>
            <li><a href="#">Política de Privacidad</a></li>
            <li><a href="#">Términos de Servicio</a></li>
            <li><a href="#">Divulgación de Riesgos</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 DepFund. Todos los derechos reservados.
      </div>
    </footer>
  );
}

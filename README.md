# Probabilidad Acumulada de Excedencia

Herramienta interactiva para calcular y visualizar la probabilidad acumulada de que ocurra al menos un evento de diseño durante un horizonte temporal definido. Orientada al análisis de riesgos en ingeniería geotécnica y diseño de infraestructura de larga vida útil (relaves, presas, instalaciones mineras).

## ¿Qué hace?

Aplica la fórmula de probabilidad acumulada de excedencia:

```
P(≥1 evento en n años) = 1 − (1 − AEP)ⁿ
```

Donde:
- **AEP** (Annual Exceedance Probability): probabilidad de que el evento ocurra en cualquier año dado
- **n**: horizonte temporal en años

Esto permite responder preguntas como: *"Si diseño una estructura para resistir un sismo con AEP 1:2,475, ¿cuál es la probabilidad de que ese sismo ocurra al menos una vez durante 1,000 años de post-cierre?"*

---

## Parámetros disponibles

### Eventos de diseño (AEP)

| Retorno | AEP | Uso típico |
|---------|-----|------------|
| 1:100 | 1% anual | Diseño operacional básico |
| 1:1,000 | 0.1% anual | Estructuras críticas en operación |
| 1:2,475 | ~0.04% anual | Sismo de diseño sísmico (IBC/ASCE) |
| 1:5,000 | 0.02% anual | Infraestructura de alto riesgo |
| 1:10,000 | 0.01% anual | Estándar GISTM para post-cierre |
| 1:100,000 | 0.001% anual | Aproximación al PMF/MCE |

### Horizontes de diseño

| Horizonte | Años | Contexto |
|-----------|------|----------|
| Operación | 20 | Vida útil operativa típica de una mina |
| Cierre activo | 100 | Período de monitoreo post-cierre |
| Post-cierre | 1,000 | Estándar GISTM / ANCOLD para perpetuidad práctica |
| Geológico | 10,000 | Escenario conservador extremo |

---

## Funcionalidades

**Gráfico interactivo**
- Curvas de probabilidad acumulada vs. años para cada AEP seleccionado
- Líneas de referencia en 20 y 1,000 años (horizontes normativos clave)
- Líneas horizontales en 10% y 50% de probabilidad (umbrales de riesgo)
- Zoom ajustable al horizonte máximo: 100 / 500 / 1,000 / 5,000 / 10,000 años
- Activar/desactivar cada curva AEP con los botones superiores

**Tabla de probabilidades**
- Probabilidad acumulada (%) para cada combinación AEP × horizonte
- Código de colores por nivel de riesgo:
  - Rojo (>50%): riesgo inaceptable
  - Naranja (10–50%): riesgo significativo
  - Amarillo (1–10%): riesgo moderado

**Panel de contexto normativo**
- Explicación de por qué el **GISTM** adopta 1:10,000 AEP para instalaciones de post-cierre
- Explicación de por qué **ANCOLD** exige PMF (Probable Maximum Flood) en diseño de cierre

---

## Contexto normativo

| Estándar | Evento de diseño requerido | Horizonte |
|----------|---------------------------|-----------|
| GISTM (2020) | 1:10,000 AEP | Post-cierre (≥1,000 años) |
| ANCOLD (2012/2019) | PMF / MCE | Cierre y post-cierre |
| ICMM Good Practice Guide (2021) | Basado en consecuencias | Toda la vida útil |

---

## Stack tecnológico

- **React 18** — UI interactiva
- **Recharts** — visualización de datos
- **Tailwind CSS** — estilos
- **Vite** — bundler y servidor de desarrollo

---

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/psantoscornejo/Design-Life-and-Design-Events.git
cd Design-Life-and-Design-Events

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir en el navegador: `http://localhost:5173`

---

## Deploy

El proyecto está desplegado en Vercel. Cualquier push a `main` actualiza automáticamente la app.

```bash
npm run build   # Genera la carpeta dist/ lista para producción
```

---

## Fuentes

- ANCOLD (2012/2019) — *Guidelines on Tailings Dams*
- GISTM (2020) — *Global Industry Standard on Tailings Management*
- ICMM (2021) — *Good Practice Guide: Tailings Storage Facilities*

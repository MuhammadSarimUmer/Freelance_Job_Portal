/* eslint-disable react-refresh/only-export-components */
export const techStackLogos = [
  { name: "React", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Node.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "TypeScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "C++", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-plain.svg" },
  { name: "PostgreSQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
  { name: "GraphQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
  { name: "Docker", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Next.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "Python", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "Tailwind", url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" }
];

function TechStackMarquee() {
  // We duplicate the array to create a seamless infinite loop
  const logos = [...techStackLogos, ...techStackLogos];

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        position: "relative",
        background: "transparent",
        marginTop: "4rem",
        marginBottom: "2rem",
      }}
      className="anim-fade-in-up anim-delay-5"
    >
      {/* Gradient fades on left and right for seamless entrance/exit */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "100px",
          background: "linear-gradient(to right, var(--color-background), transparent)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "100px",
          background: "linear-gradient(to left, var(--color-background), transparent)",
          zIndex: 2,
        }}
      />

      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "marquee 40s linear infinite",
          gap: "4rem",
          padding: "1rem 0",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
      >
        {logos.map((logo, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              opacity: "var(--marquee-opacity)",
              filter: "grayscale(100%)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.filter = "grayscale(0%)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "var(--marquee-opacity)";
              e.currentTarget.style.filter = "grayscale(100%)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <img src={logo.url} alt={logo.name} style={{ width: "40px", height: "40px" }} />
            <span
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--color-on-surface)",
              }}
            >
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TechStackMarquee;

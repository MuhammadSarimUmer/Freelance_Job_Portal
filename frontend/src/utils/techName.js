const normalizeTechName = (value) => {
  if (!value) return "";

  const raw = String(value).trim();
  const lower = raw.toLowerCase();

  const map = {
    "nextjs": "NextJS",
    "next.js": "NextJS",
    "next js": "NextJS",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "reactjs": "React",
    "react.js": "React",
    "vuejs": "Vue.js",
    "nuxtjs": "NuxtJS",
    "nestjs": "NestJS",
    "sveltekit": "SvelteKit",
    "tailwindcss": "Tailwind CSS",
    "graphql": "GraphQL",
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "mongodb": "MongoDB",
    "postgresql": "PostgreSQL",
    "flutter": "Flutter",
  };

  if (map[lower]) return map[lower];

  return raw
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export { normalizeTechName };

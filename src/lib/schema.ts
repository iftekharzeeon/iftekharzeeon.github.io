export const SITE = "https://iftekharzeeon.github.io";

export const person = {
  "@type": "Person",
  "@id": `${SITE}/#person`,
  name: "Iftekhar E Mahbub Zeeon",
  alternateName: ["Zeeon", "Iftekhar Zeeon", "Iftekhar E. Mahbub Zeeon", "Mahbub Zeeon"],
  url: `${SITE}/`,
  image: `${SITE}/zeeon-portrait.jpg`,
  email: "mailto:mahbubzeeon@gmail.com",
  jobTitle: "Full-Stack Software Engineer",
  description:
    "Full-stack software engineer in Dhaka, Bangladesh, at Retune AI and Pridesys IT Ltd. Architect of Farmers Card, Bangladesh's national farmer registry. B.Sc. in CSE from BUET.",
  worksFor: [
    { "@type": "Organization", name: "Retune AI Inc", url: "https://retune.so" },
    { "@type": "Organization", name: "Pridesys IT Ltd" },
  ],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Bangladesh University of Engineering and Technology", alternateName: "BUET", url: "https://www.buet.ac.bd" },
    { "@type": "EducationalOrganization", name: "Notre Dame College, Dhaka", url: "https://www.ndc.edu.bd" },
    { "@type": "EducationalOrganization", name: "Government Laboratory High School, Dhaka" },
  ],
  address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
  nationality: { "@type": "Country", name: "Bangladesh" },
  knowsAbout: [
    "Full-stack web development", "React", "Next.js", "TypeScript", "Java", "Spring Boot", "Node.js",
    "PostgreSQL", "Kafka", "Kubernetes", "Database performance", "Fund accounting systems", "ERP systems",
    "AI products", "Sign language translation",
  ],
  award: [
    "BASIS National ICT Award 2020, winner, tertiary student project category",
    "BUET CSE Fest Hackathon 2022, first runner-up, API and Cloud category",
    "Therap Java Fest 2022, finalist, top 10 of 500+ teams",
    "Dean's List Award, BUET",
  ],
  sameAs: [
    "https://github.com/iftekharzeeon",
    "https://www.linkedin.com/in/iftekhar-zeeon",
    "https://www.semanticscholar.org/paper/6105c8371868e79251b832e3ff2ca8c5e62d4de2",
  ],
};

export const author = { "@id": `${SITE}/#person` };

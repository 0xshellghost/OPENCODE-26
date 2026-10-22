export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  quote: string;
  tag: "Winner" | "Internship" | "Mentor" | "Partner";
  prsOrPoints?: string;
  blogUrl?: string;
}

export const testimonialsData: TestimonialItem[] = [
  {
    id: 1,
    name: "Ishan Raj Singh",
    role: "Top Contributor (Rank #1)",
    company: "SWE Intern",
    avatar: "/images/GarvitChittora.png",
    quote: "Merged 195 PRs and secured #1 on the leaderboard. OpenCode pushed my limits and taught me production-grade Git workflows that directly helped me crack off-campus interviews.",
    tag: "Winner",
    prsOrPoints: "195 PRs • 5,110 Pts",
  },
  {
    id: 2,
    name: "Ananya Agrawal",
    role: "Top Contributor & Lead",
    company: "Software Intern at Gojek",
    avatar: "/images/AnanyaAgrawal.png",
    quote: "OpenCode introduced me to loaders, cool libraries like particle.js, and making interactive fullstack apps. The mentor code reviews gave me the confidence to build and ship at scale.",
    tag: "Internship",
    prsOrPoints: "Gojek Placement",
  },
  {
    id: 3,
    name: "Manthan Surkar",
    role: "Overall Winner & Mentor",
    company: "GSoC '20 Apache • Software Engineer at Razorpay",
    avatar: "/images/ManthanSurkar.png",
    quote: "OpenCode played a huge role in my engineering journey. It helped me connect with seniors, had my code reviewed by maintainers, and prepared me for Google Summer of Code and my role at Razorpay.",
    tag: "Mentor",
    prsOrPoints: "Razorpay SWE",
  },
  {
    id: 4,
    name: "Vishal Pani",
    role: "Top Scorer",
    company: "Research Intern at Inria",
    avatar: "/images/VishalPani.jpg",
    quote: "The sheer variety of tasks OpenCode provides is phenomenal. From competitive algorithm optimizations to deep learning pipelines, everyone finds problems that accelerate their craft.",
    tag: "Internship",
    prsOrPoints: "Inria Research",
  },
  {
    id: 5,
    name: "Apoorv Mittal",
    role: "Top Contributor (Rank #2)",
    company: "Open Source Contributor",
    avatar: "/images/AnupamDagar.png",
    quote: "177 PRs merged across multiple repositories. Reviewing code and collaborating with project maintainers in real-time accelerated my engineering judgment faster than any semester course.",
    tag: "Winner",
    prsOrPoints: "177 PRs • 4,585 Pts",
  },
  {
    id: 6,
    name: "Shreyas Gupta",
    role: "Overall Winner",
    company: "Former Product Engineering Intern at Sprinklr",
    avatar: "/images/ShreyasGupta.png",
    quote: "OpenCode is equally challenging for newcomers and seasoned builders. It forced me outside my comfort zone to touch technologies I had never explored, leading directly to my Sprinklr internship.",
    tag: "Internship",
    prsOrPoints: "Sprinklr Placement",
  },
  {
    id: 7,
    name: "Prashant Dwivedi",
    role: "Top Contributor (Rank #3)",
    company: "Systems Engineer",
    avatar: "/images/PrashantDwivedi.png",
    quote: "Contributed 171 merged PRs! From resolving backend concurrency bugs to shipping snappy frontend features, OpenCode made collaborative engineering an exhilarating sport.",
    tag: "Winner",
    prsOrPoints: "171 PRs • 4,485 Pts",
  },
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    id: "eligibility",
    question: "Who is eligible to participate in OpenCode?",
    answer: "OpenCode is open to all students, developers, and tech enthusiasts worldwide regardless of university or background. Whether you are an undergraduate, postgraduate, or self-taught developer, you are welcome to register and contribute.",
  },
  {
    id: "beginner-friendly",
    question: "I have never made a Git Pull Request before. Can I participate?",
    answer: "Absolutely! OpenCode is intentionally engineered for beginners. Repositories include issues tagged 'good-first-issue' and mentors host beginner-friendly Git workshops and office hours on Discord to guide you step-by-step.",
  },
  {
    id: "how-to-contribute",
    question: "How does the issue claiming and PR submission workflow work?",
    answer: "Browse our project repositories, find an unassigned issue, and comment to claim it. Once assigned by a project mentor, write your solution locally, push to your fork, and open a Pull Request. After mentor review and approval, your PR is merged and points are awarded to the live leaderboard.",
  },
  {
    id: "prizes-and-certificates",
    question: "What prizes, rewards, and recognitions do contributors receive?",
    answer: "Top leaderboard finishers receive cash bounties, developer swag boxes, cloud credits and developer tools (such as JetBrains and DigitalOcean perks), and verified certificates of achievement. All contributors with at least one merged PR receive an official OpenCode participation certificate.",
  },
  {
    id: "community-support",
    question: "Where do discussions, mentoring, and technical doubts take place?",
    answer: "All communication happens in our active Discord community. Every project has dedicated channels where mentors, maintainers, and peers collaborate in real time.",
  },
];

export const profile = {
  name: 'Andrés Díaz Ruano',
  degree: 'Engineer in Data Science and Telecommunication Technologies',
  schools: 'Universidad Carlos III de Madrid (UC3M)',
  abroad: 'Abroad studies: Politecnico di Milano',
  highlights: [
    'Academic Excellence Scholarship (2 editions)',
    'English C1',
    'AWS Certified Cloud Practitioner',
  ],
  location: 'Madrid, Spain',
  email: 'diazruanoandres@gmail.com',
  github: 'https://github.com/andresdzr',
  linkedin:
    'https://www.linkedin.com/in/andr%C3%A9s-d%C3%ADaz-ruano-9a96b73b9/?isSelfProfile=true',
};

export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile & Education' },
  { id: 'telecom', label: 'Telecommunications' },
  { id: 'data', label: 'Data Science & AI' },
  { id: 'cloud', label: 'Cloud Computing' },
  { id: 'experience', label: 'Experience & Projects' },
  { id: 'skills', label: 'Technical Skills' },
  { id: 'contact', label: 'Contact' },
];

export const telecom = {
  intro:
    'Hands-on experience across the full telecommunications stack — from signal theory to embedded hardware.',
  items: [
    'Signal processing & spectrum simulation',
    'Quantum communications fundamentals',
    'MATLAB & Python for systems modeling',
    'Lab instrumentation: oscilloscopes, signal generators',
    'Embedded systems: STM32, C, VHDL, Arduino',
  ],
};

export const dataScience = {
  intro:
    'Applying statistical modeling and deep learning to extract signal from real-world data.',
  skills: [
    'Machine Learning',
    'Deep Learning',
    'Neural Networks',
    'Predictive Modeling',
    'Data Pipelines',
    'AI Agents',
    'PyTorch',
    'Scikit-learn',
    'Pandas',
    'NumPy',
  ],
  projects: [
    {
      name: 'Hiili (UC3M)',
      description:
        'Optimization algorithms for advertising budget allocation, balancing profitability against CO₂ emissions.',
    },
    {
      name: 'Machine Learning & Data Pipelines',
      description:
        'End-to-end pipelines for ingesting, cleaning and modeling data, with predictive models for forecasting and decision support.',
    },
    {
      name: 'Neural Networks',
      description:
        'Deep learning projects applied to image and audio processing.',
    },
  ],
};

export const cloud = {
  intro:
    'Deploying and automating infrastructure across static, serverless and dynamic-data architectures.',
  items: [
    'AWS S3 — static hosting and storage',
    'CloudFront — global CDN delivery',
    'Origin Access Control (OAC) — secure bucket access',
    'Lambda & API Gateway — serverless architectures',
    'EC2, IAM, Route 53 & CloudWatch — compute, access, DNS and monitoring',
    'GitHub CI/CD integration',
    'Dynamic databases with Firebase & MySQL',
  ],
};

export const experience = [
  {
    company: 'Repsol',
    role: 'Data Engineer',
    period: 'Sep 2026 — Present',
    points: [
      'Building and maintaining data pipelines in Python',
      'Power BI dashboards for business analytics',
      'Cost control and data-load optimization',
    ],
  },
  {
    company: 'TK Elevator',
    role: 'Process Automation Engineer',
    period: 'Apr 2026 — Aug 2026',
    points: [
      'Developed custom AI agents for internal workflows',
      'Programming and validation of mechanical & electrical schematics',
    ],
  },
  {
    company: 'Amazon',
    role: 'Logistics Operations',
    period: 'Jun 2025 — Jul 2025',
    points: [
      'High-demand logistics operations',
      'Merchandise control systems',
    ],
  },
];

export const featuredProjects = [
  {
    name: 'Flexible Flight Finder',
    year: '2025',
    description:
      'Web analytics platform with predictive modeling of flight ticket prices, API/scraping ingestion and interactive maps.',
  },
  {
    name: 'NewScroll',
    year: '2026',
    description:
      'Android app for real-time news with hybrid data ingestion (APIs + web scraping) and Firebase backend.',
  },
];

export const skillCategories = [
  {
    category: 'Languages',
    color: 'cyan',
    skills: ['Python', 'C#', 'Java', 'Kotlin', 'JavaScript', 'SQL', 'R', 'VHDL', 'C'],
  },
  {
    category: 'Data & AI',
    color: 'purple',
    skills: [
      'PyTorch',
      'TensorFlow',
      'Scikit-learn',
      'Pandas',
      'NumPy',
      'Jupyter',
      'Deep Learning',
      'CNNs',
    ],
  },
  {
    category: 'Cloud & Web',
    color: 'emerald',
    skills: [
      'AWS (S3, CloudFront)',
      'Firebase',
      'HTML/CSS',
      'React',
      'MySQL',
      'REST APIs',
      'Web Scraping',
    ],
  },
  {
    category: 'Telecom & Signals',
    color: 'cyan',
    skills: ['5G', 'Signal Processing', 'Satellite Communications', 'Integrated Circuits', 'QKD'],
  },
  {
    category: 'Software & Tools',
    color: 'purple',
    skills: ['MATLAB', 'Git/GitHub', 'STM32CubeIDE', 'LTspice', 'Linux (Ubuntu)'],
  },
];

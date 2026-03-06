export const cv = {
  name: 'Dimitris Chatzis',
  title: 'Product-minded Software Engineer',
  /** Role as shown in the terminal "const engineer" block (keep it fun) */
  roleDisplay: 'Professional Googler of Error Messages',
  tagline: 'Full-stack experience · Tech Lead · AI at scale · From idea to delivery',
  location: 'Athens, Greece',
  email: 'mail@dimchatzis.com',
  phone: '+30 6979566048',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dimchatzis', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://github.com/dimchatzis', icon: 'github' },
    { label: 'StackOverflow', href: 'https://stackoverflow.com/users/dimchatzis', icon: 'stackoverflow' },
    { label: 'ResearchGate', href: 'https://www.researchgate.net/profile/Dimitris-Chatzis', icon: 'researchgate' },
  ],
  summary: `Product-minded Software Engineer with broad full-stack experience and a strong sense of ownership. I focus on understanding real user problems, shaping the technical approach, and driving projects from idea to delivery. I've led cross-team initiatives, shipped AI-powered features at scale, and consistently delivered improvements that matter for both users and the business. Experienced as both a senior IC and a Tech Lead.`,
  experience: [
    {
      company: 'Skroutz',
      role: 'Senior Software Engineer',
      period: 'Feb 2024 – Present',
      current: true,
      highlights: [
        'Reducing contact rate through self-service, automation and better post-order experiences',
        'Implemented key order actions (Change Address, Reschedule), reducing support volume',
        'Built live order-tracking for delivery transparency',
        'Developed AI-powered support chatbot with ~95% containment rate',
        'Created custom Zendesk AI tools for agent efficiency',
      ],
      tech: ['Ruby on Rails', 'Python', 'MariaDB', 'MongoDB', 'ElasticSearch', 'Redis', 'React', 'Hotwire', 'OpenAI API', 'LangChain', 'LangGraph', 'LangFuse', 'Metabase', 'Grafana', 'Zendesk'],
    },
    {
      company: 'DoctorAnytime',
      roles: [
        {
          role: 'Tech Lead',
          period: 'Jul 2023 – Feb 2024',
          highlights: [
            'Led and managed the B2B team, facilitating growth and achieving objectives',
          ],
        },
        {
          role: 'Senior Software Engineer',
          period: 'Aug 2021 – Jul 2023',
          highlights: [
            'Provided mentorship to several members of the frontend team',
            'Led the implementation of the Design System (SCSS → TailwindCSS), collaborating with the design lead',
            'Upgraded the project: TypeScript integration, eliminated jQuery',
            'Redesigned the CRM as an SPA with Vue 3 and Pinia; new features and improvements',
            'Rewrote backend APIs with a RESTful approach using reusable modules',
            'Introduced unit testing with Vitest',
          ],
        },
      ],
      tech: ['TypeScript', 'TailwindCSS', '.NET (C#)', 'SQL', 'Docker', 'Vue 3', 'Pinia', 'Vitest', 'Webpack', 'Rollup', 'PostCSS'],
    },
    {
      company: 'PSDGator',
      role: 'Frontend & WordPress Developer',
      period: 'Oct 2018 – Aug 2021',
      highlights: [
        'Converting PSD/XD/Figma mockups to WordPress/WooCommerce sites',
        'Custom WordPress themes and plugins',
        'Page speed optimizations',
      ],
      tech: ['SCSS', 'Bootstrap 4', 'jQuery', 'WordPress', 'WooCommerce', 'PHP', 'SQL', 'Gulp/Grunt'],
    },
    {
      company: 'General Hospital of Trikala',
      role: 'Internship · Biomedical Technology',
      period: 'Jul – Aug 2015',
      highlights: [
        'Quality and operation of medical equipment',
        'Management, maintenance and repair',
        'Training hospital staff',
      ],
      tech: [],
    },
  ],
  education: {
    degree: 'Bachelor of Science',
    school: 'University of Thessaly',
    department: 'Computer Science and Biomedical Informatics',
    year: '2011',
  },
  skills: [
    'HTML5, CSS3, SCSS, TailwindCSS, JavaScript/TypeScript',
    'React, Vue 3 (Composition API), Pinia, Vitest',
    'SSR, Nuxt 3',
    'Webpack, Rollup, Vite, Gulp, PostCSS',
    'PHP, .NET, Ruby on Rails, Python',
    'MySQL, MariaDB, MongoDB, Redis, ElasticSearch',
    'OpenAI API, LangChain, LangGraph, LangFuse',
  ],
  currently: {
    reading: 'whether my prompt needs a system message or just more yelling',
    building: 'agents that stop before they loop into oblivion',
    debugging: 'why it said "as an AI I cannot" to a perfectly reasonable request',
  },
  research: {
    intro: 'Former junior researcher at is-innovation research group.',
    publications: [
      'D. K. Iakovidis, D. Chatzis, P. Chrysanthopoulos, A. Koulaouzidis — "Blood Detection in Wireless Capsule Endoscope Images based on Salient Superpixels" — EMBC, Milano, 2015',
      'D. Chatzis, P. Chrysanthopoulos, D. K. Iakovidis, A. Koulaouzidis — "Color Based Segmentation Of Capsule Endoscopy Images For Automated Lesion Size Measurements" — UEG Journal, Gut, 2015',
      'S. V. Georgakopoulos et al. — "Towards a Color Space for Automated Lesion Segmentation Robotic Capsule Endoscopy" — IROS, Hamburg, 2015',
    ],
  },
}

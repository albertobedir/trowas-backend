# Next-Trowas

Next-Trowas is a modern web application built with Next.js that provides a comprehensive suite of business tools and team management features.

## Features

- **Team Management**
  - Add and manage team members
  - Create and organize subteams
  - Manage team templates
  - Control team permissions

- **Business Tools**
  - Lead management system
  - Email template builder
  - Virtual background creator
  - Analytics dashboard
  - Business card scanner with AI

- **Customization**
  - Theme customization
  - Email signature generator
  - Custom notifications settings

- **Integrations**
  - Various third-party integrations
  - API connections
  - Data synchronization

## Tech Stack

- **Framework:** Next.js 14+
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with modern design
- **State Management:** Built-in store system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd next-trowas
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── account/           # Account management
│   ├── analytics/         # Analytics dashboard
│   ├── integrations/      # Third-party integrations
│   ├── leads/            # Lead management
│   ├── settings/         # Application settings
│   ├── team/             # Team management
│   └── toolkit/          # Business tools
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                # Utility functions
└── store/              # State management
```

## Configuration

The project uses various configuration files:

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - UI components configuration
- `tsconfig.json` - TypeScript configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE)

## Support

For support, please check out our:
- [Documentation](/support/docs)
- [Contact Form](/support/contact)
- [Suggestions](/support/suggestions)

## Acknowledgments

- Next.js team for the amazing framework
- All contributors who have helped shape this project

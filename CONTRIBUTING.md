# Contributing to Wkly

First off, thank you for considering contributing to Wkly! 

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn and grow

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported
2. Make sure you're using the latest version
3. Check if it's actually a bug and not a feature

When reporting a bug, include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: Browser, OS, etc.

### Suggesting Features

Feature requests are welcome! When suggesting:
- Explain why this feature would be useful
- Describe how it should work
- Consider if it fits the minimalist philosophy
- Check if it's already been suggested

### Pull Requests

1. Fork the repo
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

#### PR Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation if needed
- Test in both light and dark modes
- Ensure no TypeScript errors
- Keep the monochrome design

#### Commit Message Format
```
type: brief description

Detailed explanation if needed

Fixes #issue_number
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Set up Supabase (see SETUP.md)
4. Copy `.env.example` to `.env`
5. Start dev server: `npm run dev`

## Code Style

### TypeScript
- Use TypeScript strict mode
- Define proper types, no `any`
- Use interfaces for object shapes
- Export types from `types/index.ts`

### React
- Functional components only
- Use hooks for state and effects
- Keep components focused and small
- Use meaningful component names

### Styling
- Use Tailwind utility classes
- Follow the grayscale palette
- No inline styles
- Use custom classes for repeated patterns

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Pages: `PascalCase.tsx`

## Design Guidelines

### The Monochrome Rule
**ABSOLUTELY NO COLORS**
- Only black, white, and grays
- No gradients
- No colored icons
- No exceptions

### Typography
- Use font weights to create hierarchy
- Light (300) for headings
- Normal (400) for body text
- Medium (500) for emphasis

### Spacing
- Follow Tailwind spacing scale
- Use generous whitespace
- Keep interfaces calm and uncluttered

### Animations
- Subtle and purposeful
- 150-300ms duration
- Use Framer Motion for complex animations
- CSS transitions for simple states

## Testing

Currently manual testing. Before submitting:

- [ ] Test in Chrome, Firefox, Safari
- [ ] Test in light and dark modes
- [ ] Test on mobile viewport
- [ ] Test keyboard navigation
- [ ] Check for console errors
- [ ] Verify TypeScript compiles

## Documentation

If your change affects usage:
- Update README.md
- Update SETUP.md if setup changes
- Update DEVELOPMENT.md if architecture changes
- Add code comments for complex logic

## Feature Request Process

1. Open an issue with the `feature` label
2. Discuss the feature with maintainers
3. Wait for approval before starting work
4. Submit PR when ready

## Bug Fix Process

1. Open an issue with the `bug` label
2. Discuss the fix approach
3. Submit PR with fix
4. Reference the issue number

## Areas Looking for Help

- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Mobile responsiveness
- [ ] Documentation improvements
- [ ] Subtasks UI implementation
- [ ] Recurring tasks feature

## Questions?

Feel free to:
- Open an issue with the `question` label
- Start a discussion
- Reach out to maintainers

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Given a shoutout on social media

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Wkly better! 🙏

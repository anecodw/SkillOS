# Contributing to SkillOS

Thank you for your interest in contributing to SkillOS! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- Node.js 18+ 
- Git
- TypeScript knowledge (preferred but not required)

### Setup

1. Fork the repository
2. Clone your fork
```bash
git clone https://github.com/your-username/skillos.git
cd skillos
```

3. Install dependencies
```bash
npm install
```

4. Build the project
```bash
npm run build
```

5. Run tests
```bash
npm test
```

## Development Workflow

### Branch Strategy

- `main` - Stable releases
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Feature

1. Create a branch from `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. Make your changes
3. Run tests and linting
```bash
npm test
npm run lint
npm run typecheck
```

4. Commit your changes
```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push and create a pull request
```bash
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat: add skill dependency resolution
```

## Coding Standards

### TypeScript

- Use strict mode
- Provide type annotations
- Avoid `any` type
- Use interfaces for object shapes
- Keep functions small and focused

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays/objects
- Max line length: 100 characters

### Documentation

- Document public APIs with JSDoc
- Add comments for complex logic
- Update README for user-facing changes
- Update CHANGELOG for significant changes

## Testing

### Writing Tests

- Add tests for new features
- Test edge cases
- Mock external dependencies
- Keep tests independent

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something', () => {
      // Arrange
      const input = {};

      // Act
      const result = feature.methodName(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Submitting Skills

### Creating a New Skill Template

1. Copy an existing template from `examples/templates/`
2. Customize for your use case
3. Test the skill format:
```bash
npm run build
node dist/cli/index.js validate path/to/skill.md
```
4. Submit a pull request with your template

### Skill Guidelines

- Follow the skill format specification
- Provide clear instructions
- Include eval scenarios if applicable
- Add appropriate capabilities and permissions
- Use descriptive metadata tags

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update CHANGELOG
4. Create a descriptive PR title and description
5. Link related issues
6. Request review from maintainers

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] CHANGELOG updated (for significant changes)
- [ ] All tests pass

## Reporting Issues

When reporting issues, please include:

- SkillOS version
- Node.js version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/stack traces

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Join our community chat (link coming soon)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

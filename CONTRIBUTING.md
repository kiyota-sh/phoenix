# Contributing

Thank you for contributing to Phoenix!

To keep the project organized and maintainable, please follow these guidelines.

---

# Branch Strategy

Never work directly on the `main` branch.

Create a new branch for every task or feature.

Branch naming convention:

| Type          | Example                     |
| ------------- | --------------------------- |
| Feature       | feature/user-authentication |
| Bug Fix       | fix/login-validation        |
| Hotfix        | hotfix/api-crash            |
| Refactor      | refactor/project-service    |
| Documentation | docs/readme-update          |
| Chore         | chore/update-dependencies   |

Examples:

feature/dashboard

feature/project-history

fix/project-delete

docs/api-documentation

---

# Commit Convention

This project follows the Conventional Commits specification.

## Commit Types

| Prefix   | Description              | Example                                   |
| -------- | ------------------------ | ----------------------------------------- |
| feat     | New feature              | feat: add project archive endpoint        |
| fix      | Bug fix                  | fix: resolve login validation issue       |
| docs     | Documentation changes    | docs: update README                       |
| style    | Formatting changes       | style: format project controller          |
| refactor | Code refactoring         | refactor: simplify authentication service |
| perf     | Performance improvements | perf: optimize dashboard queries          |
| test     | Add or update tests      | test: add project service tests           |
| build    | Build system changes     | build: configure Docker                   |
| ci       | CI/CD changes            | ci: add GitHub Actions workflow           |
| chore    | Maintenance tasks        | chore: update dependencies                |
| revert   | Revert previous commit   | revert: revert project archive feature    |

---

# Pull Requests

Before opening a Pull Request:

- Ensure the project builds successfully.
- Make sure your code follows the project's coding standards.
- Update documentation if necessary.
- Keep Pull Requests focused on a single feature or fix.
- Write a clear description of your changes.

---

# Best Practices

- Write clean and readable code.
- Follow SOLID, DRY principles.
- Keep methods small and focused.
- Avoid duplicated code.
- Use meaningful variable and method names.
- Validate all user input.
- Handle exceptions properly.
- Keep business logic inside the backend.
- Never commit secrets, passwords, or API keys.
- Review your code before pushing.

---

# Workflow

1. Pull the latest changes from `main`.
2. Create a new branch.
3. Implement your changes.
4. Commit using Conventional Commits.
5. Push your branch.
6. Open a Pull Request.
7. Wait for review before merging.

---

# Code Style

- Follow correct naming conventions.
- Use PascalCase for classes and methods.
- Use camelCase for local variables.
- Keep controllers lightweight.
- Place business logic inside Services.
- Follow RESTful API principles.

---

# Git Workflow Example

```bash
git checkout main

git pull origin main

git checkout -b feature/dashboard

git add .

git commit -m "feat: implement dashboard summary"

git push origin feature/dashboard
```

---

Thank you for contributing to Phoenix!

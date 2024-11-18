# Contributing Guidelines

Thank you for considering contributing to this project! Contributions are welcome, whether you're raising an issue or creating a pull request.

## Rasing issues

Please use the "Issues" section to report bugs or suggest improvements. Providing detailed information will help in understanding the problem and making improvements.

## Creating pull requests

1. **Fork the Repository**  
   Start by forking this repository and cloning it locally.
2. **Make Changes**  
   After making changes, follow the steps below to ensure code quality.
3. **Push and Create a PR**  
   Push your changes to your forked repository and open a pull request.

### Setting Up the Development Environment

Install dependencies

- `npm install`

Start the development server

- `npm run dev`

Open storybook in browser. Once started, you can view Storybook at:

- `http://localhost:3000/public/`

### Coding Guidelines

There's no strict coding standard, but please follow these guidelines:

- **Separate Responsibilities by Class**  
  Ensure that each class has a clearly defined responsibility and adheres to the single responsibility principle.

- **Functions Should Have a Single Role**  
  Write functions that focus on performing one specific task. Avoid combining multiple responsibilities in a single function.

- **Simplify Conditional Statements and Reduce Depth**  
  Refactor complex conditional statements to make them easier to read and maintain. Minimize nested structures for better readability.

### Committing Changes

Follow Conventional Commits. Use the [conventional-config](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.

- Allowed types:  
  `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`

* Commit message format

  ```bash
  <type>[optional scope]: <description>

  [optional body]

  [optional footer(s)]
  ```

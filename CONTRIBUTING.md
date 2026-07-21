# Contributing to AI Test CLI

First off, thank you for considering contributing to AI Test CLI! It's people like you that make open-source such an incredible community.

## Development Setup

If you want to add a feature, fix a bug, or test the CLI locally, here is how you can set up your development environment:

### 1. Clone the repository
```bash
git clone https://github.com/aitesthq/cli.git
cd cli
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the project
```bash
npm run build
```
During development, you can also run `npm run dev` to watch for file changes and rebuild automatically.

### 4. Link the CLI locally
To test your local code as if it were installed globally, use `npm link`.
```bash
npm link
```
Now, whenever you run `aitest` in your terminal, it will execute your local source code!

## Pull Request Process

1. Ensure your code compiles correctly (`npm run build`).
2. Run tests to ensure nothing is broken (`npm test`).
3. Open a Pull Request detailing your changes.

Thanks for helping us build the future of AI testing!

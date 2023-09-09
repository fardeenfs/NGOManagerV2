# Windmill React UI

The component library for fast and accessible development of gorgeous interfaces.

Projects using it: [Windmill Dashboard React](https://github.com/estevanmaito/windmill-dashboard-react)
Projects using it: [Windmill Dashboard NextJS](https://github.com/roketid/windmill-dashboard-nextjs-typescript)

## Mission

Be the most accessible it can be out of the box and the fastest way to production.

[Go to storybook library, powered by chromatic](https://www.chromatic.com/library?appId=620b9e3a0f4b10003adaf0c3)
[Go to docs to see complete, live examples](https://windmillui.com/react-ui)

## 🚀 Usage

Install

```sh
npm i @roketid/windmill-react-ui
```

Inside `tailwind.config.js`

```js
const windmill = require('@roketid/windmill-react-ui/config')
module.exports = windmill({
  content: [],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
})
```

Then place `Windmill` at the root of your project (the order doesn't matter, as long as your application is inside).

```js
// index.js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Windmill } from '@roketid/windmill-react-ui'

ReactDOM.render(
  <Windmill>
    <App />
  </Windmill>,
  document.getElementById('root')
)
```

Use components inside your project

```js
import { Button } from '@roketid/windmill-react-ui'

function App() {
  return <Button>Hi there!</Button>
}

export default App
```

## 🔌 Contributing

- Fork
- Clone
- `npm install`
- `npm run storybook`

It will start a local server at `localhost:6006` with all components rendered.

⚠ Use `npm run cz` instead of `git commit`! It will guide you through some short questions and guarantee that you commit message is standardized.

Commit will also trigger linting and test coverage.

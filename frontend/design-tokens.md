# Smartie Pants Design Tokens

Shared colors & fonts configured in Tailwind:

## Colors

- `brand-blue` → HEX: #1E40AF

## Fonts

- `font-heading` → "Press Start 2P", cursive
- `font-body` → Inter, sans-serif

## Usage in JSX

````jsx
<h1 className="text-3xl font-heading text-brand-blue">Smartie Pants</h1>
<p className="font-body text-slate-600">Welcome to the trivia game!</p>


---

### ✅ step 3: how to call it in components

instead of writing raw hex codes, just use your token class:

```jsx
export default function Example() {
  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center">
      <h1 className="text-4xl font-heading text-white">SMARTIE PANTS</h1>
    </div>
  )
}
````

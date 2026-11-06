import type { Config } from 'tailwindcss'
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#12211f', cream: '#f8f7f2', sage: '#dfe9dc', mint: '#e9f3e7', coral: '#f5b6a4', teal: '#2d736a' }, fontFamily: { sans: ['var(--font-geist)'] } } }, plugins: [] } satisfies Config

import type { ElementType, HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  // Lets a card render as a <div>, <li>, etc. so the markup
  // around it (e.g. a <ul>) stays valid HTML.
  as?: ElementType
}

export default function Card({ as: Tag = 'div', className = '', ...props }: CardProps) {
  return <Tag className={`rounded-lg border border-zinc-800 ${className}`.trim()} {...props} />
}

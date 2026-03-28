// Effects have moved to /components — this route is intentionally empty.
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [];
}

export default async function EffectPage() {
  notFound();
}

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'className', type: 'string',     default: '—', description: 'Additional classes for the card container' },
  { name: 'children',  type: 'ReactNode',  default: '—', description: 'Card content' },
];

const USAGE = `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here.</CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>`;

export async function CardPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Card</h1>
        <p className="mt-2 text-sm text-zinc-500">Surface container for grouped content. Composed of CardHeader, CardTitle, CardDescription, CardContent, CardFooter.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="Card with all sub-components">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Supporting description text for context.</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Card body content area.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Cancel</Button>
              </CardFooter>
            </Card>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}

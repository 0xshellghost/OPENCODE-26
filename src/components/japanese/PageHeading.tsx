import { ReactNode } from 'react';

export default function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <header className="oc-page-heading">
      <div>
        <p className="oc-eyebrow"><span />{eyebrow}</p>
        <h1>{title}</h1>
        <p className="oc-description">{description}</p>
      </div>
      {children && <div className="oc-heading-aside">{children}</div>}
    </header>
  );
}

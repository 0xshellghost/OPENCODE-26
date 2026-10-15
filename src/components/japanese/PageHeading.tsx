'use client';

import { ReactNode } from 'react';
import BlurText from '../reactbits/BlurText';
import ShinyText from '../reactbits/ShinyText';

export default function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="oc-page-heading">
      <div>
        <p className="oc-eyebrow">
          <span />
          <ShinyText text={eyebrow} speed={5} shineColor="#ffded2" />
        </p>
        <h1>
          <BlurText text={title} delay={45} animateBy="words" direction="top" />
        </h1>
        <p className="oc-description">{description}</p>
      </div>
      {children && <div className="oc-heading-aside">{children}</div>}
    </header>
  );
}

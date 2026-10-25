'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="section"><div className="container reading"><h1>This page could not be displayed</h1><p>Please try again or return to the homepage.</p><div className="actions"><button onClick={reset}>Try again</button><a href="/">Return home</a></div></div></section>;
}

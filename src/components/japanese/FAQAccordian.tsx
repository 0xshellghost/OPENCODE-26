'use client';

import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';

export default function FAQAccordion({ items }: { items: { question: string; answer: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pages = 2;
  const perPage = Math.ceil(items.length / pages);
  const changePage = (next: number) => { setPage(next); setOpen(null); };

  return (
    <div className="oc-faq-content">
      <div className="glass-panel oc-faq-list">
        {items.slice(page * perPage, (page + 1) * perPage).map((faq, index) => {
          const id = page * perPage + index;
          const expanded = open === id;
          return (
            <section className="oc-faq-item" key={id}>
              <h2>
                <button
                  id={`question-${id}`}
                  type="button"
                  className="oc-faq-question"
                  aria-expanded={expanded}
                  aria-controls={`answer-${id}`}
                  onClick={() => setOpen(expanded ? null : id)}
                >
                  {faq.question}
                  {expanded ? <Minus size={17} /> : <Plus size={17} />}
                </button>
              </h2>
              <div
                id={`answer-${id}`}
                role="region"
                aria-labelledby={`question-${id}`}
                hidden={!expanded}
                className="oc-faq-answer"
              >
                {faq.answer}
              </div>
            </section>
          );
        })}
      </div>
      <div className="oc-pagination">
        <span aria-live="polite">Page {page + 1} of {pages}</span>
        <div className="oc-pagination-actions">
          <button
            type="button"
            className="oc-pagination-btn"
            aria-label="Previous questions"
            disabled={page === 0}
            onClick={() => changePage(page - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="oc-pagination-btn"
            aria-label="Next questions"
            disabled={page === pages - 1}
            onClick={() => changePage(page + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

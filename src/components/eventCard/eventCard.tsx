'use client';

import { Box } from '@chakra-ui/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

interface EventCardProps {
  btnStatus: string;
  name: string;
  des: string;
  image: string;
  onLeaderboardClick: (name: string) => void;
}

const EventCard = ({
  btnStatus,
  name,
  des,
  image,
  onLeaderboardClick,
}: EventCardProps) => {
  return (
    <Box w="100%">
      <div
        className="
          relative
          w-full
          h-[420px]
          overflow-hidden
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--surface)]
        "
      >
        {/* Background Image */}
        <div className="absolute inset-0 m-0 h-full w-full">
          <LazyLoadImage
            alt={name}
            effect="opacity"
            src={image}
            className="h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-6 text-left">
          <h3 className="text-2xl font-bold text-[var(--fg)] mb-2 tracking-tight">{name}</h3>

          <p className="text-sm text-[var(--fg-muted)] line-clamp-3 mb-4">{des}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              className="
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                px-4
                py-2
                text-sm
                font-medium
                text-[var(--fg)]
                backdrop-blur
                transition
                hover:border-[var(--accent)]
                hover:text-[var(--accent)]
              "
            >
              {btnStatus}
            </button>

            <button
              type="button"
              onClick={() => onLeaderboardClick(name)}
              className="
                rounded-full
                bg-[var(--accent)]
                px-4
                py-2
                text-sm
                font-semibold
                text-[var(--accent-ink)]
                transition
                hover:opacity-90
                hover:shadow-[0_0_15px_var(--accent-glow)]
              "
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default EventCard;

'use client';

import { Box } from '@chakra-ui/react';
import { Card, CardBody, CardHeader } from '@material-tailwind/react';
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
      <Card
        shadow={false}
        className="
          relative
          w-full
          h-[420px]
          overflow-hidden
          rounded-2xl
          bg-black
        "
      >
        {/* Background Image */}
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="absolute inset-0 m-0 h-full w-full"
        >
          <LazyLoadImage
            alt={name}
            effect="opacity"
            src={image}
            className="h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
        </CardHeader>

        {/* Content */}
        <CardBody className="relative z-10 flex h-full flex-col justify-end px-6 pb-6 text-left">
          <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>

          <p className="text-sm text-gray-300 line-clamp-3 mb-4">{des}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              className="
                rounded-full
                bg-white/10
                px-4
                py-2
                text-sm
                font-medium
                text-white
                backdrop-blur
                transition
                hover:bg-white/20
              "
            >
              {btnStatus}
            </button>

            <button
              type="button"
              onClick={() => onLeaderboardClick(name)}
              className="
                rounded-full
                bg-[#9D767E]
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-[#785255]
              "
            >
              Leaderboard
            </button>
          </div>
        </CardBody>
      </Card>
    </Box>
  );
};

export default EventCard;

'use client';
import { Icon } from '@chakra-ui/react';
import { MdBarChart, MdPerson, MdHome , MdLock, MdWorkspacePremium, MdEvent, MdViewList, MdSettings, MdRule } from 'react-icons/md';

import { IRoute } from 'types/navigation';

const routes: IRoute[] = [
  {
    name: 'All Events',
    layout: '/user',
    path: '/events',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Add Event',
    layout: '/admin',
    path: '/addevent',
    icon: <Icon as={MdEvent} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'View Events',
    layout: '/admin',
    path: '/viewevents',
    icon: <Icon as={MdViewList} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Change Points',
    layout: '/admin',
    path: '/home',
    icon: <Icon as={MdRule} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Management',
    layout: '/admin',
    path: '/managements',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
  },

  {
    name: 'Leaderboard',
    layout: '/user',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/leaderboard/Opencode',
  },
  {
    name: 'Repositories',
    layout: '/user',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    path: '/repos',
  },
  {
    name: 'Winners',
    layout: '/user',
    icon: <Icon as={MdWorkspacePremium} width="20px" height="20px" color="inherit" />,
    path: '/winners',
  },
  // {
  //   name: 'Geek Market',
  //   layout: '/admin',
  //   path: '/nft-marketplace',
  //   icon: (
  //     <Icon
  //       as={MdOutlineShoppingCart}
  //       width="20px"
  //       height="20px"
  //       color="inherit"
  //     />
  //   ),
  //   secondary: true,
  // },

  {
    name: 'Profile',
    layout: '/user',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
  },
];

export default routes;

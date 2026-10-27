'use client';
import { Icon } from '@chakra-ui/react';
import {
  BarChart2,
  CalendarDays,
  CalendarPlus,
  FolderGit2,
  Home,
  Lock,
  Settings,
  Sliders,
  Trophy,
  User,
} from 'lucide-react';

import { IRoute } from 'types/navigation';

const routes: IRoute[] = [
  {
    name: 'All Events',
    layout: '/user',
    path: '/events',
    icon: <Icon as={Home} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Add Event',
    layout: '/admin',
    path: '/addevent',
    icon: <Icon as={CalendarPlus} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'View Events',
    layout: '/admin',
    path: '/viewevents',
    icon: <Icon as={CalendarDays} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Change Points',
    layout: '/admin',
    path: '/home',
    icon: <Icon as={Sliders} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Management',
    layout: '/admin',
    path: '/managements',
    icon: <Icon as={Settings} width="20px" height="20px" color="inherit" />,
  },

  {
    name: 'Leaderboard',
    layout: '/user',
    icon: <Icon as={BarChart2} width="20px" height="20px" color="inherit" />,
    path: '/leaderboard/Opencode',
  },
  {
    name: 'Repositories',
    layout: '/user',
    icon: <Icon as={FolderGit2} width="20px" height="20px" color="inherit" />,
    path: '/repos',
  },
  {
    name: 'Winners',
    layout: '/user',
    icon: <Icon as={Trophy} width="20px" height="20px" color="inherit" />,
    path: '/winners',
  },
  {
    name: 'Profile',
    layout: '/user',
    path: '/profile',
    icon: <Icon as={User} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={Lock} width="20px" height="20px" color="inherit" />,
  },
];

export default routes;

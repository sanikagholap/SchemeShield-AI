import { Notification } from '../types/dashboard';

export const MOCK_NOTIFICATIONS_LIST: Notification[] = [
  {
    id: 'notif-1',
    title: 'Your recent verification is ready',
    message: 'Verification Report #VER-2026-TRUSTED for National Post-Matric Scholarship has completed analysis.',
    timestamp: '10 mins ago',
    type: 'success',
    read: false,
    link: '/verification-result'
  },
  {
    id: 'notif-2',
    title: 'A suspicious scheme was detected in your history',
    message: 'High risk flags were raised for "PM Free Tractor Scheme 2026". Do not pay any registration fee.',
    timestamp: '2 hours ago',
    type: 'alert',
    read: false,
    link: '/history'
  },
  {
    id: 'notif-3',
    title: 'Remember to verify important scheme information through official sources',
    message: 'Always check official gazettes at myScheme (myscheme.gov.in) and National Portal (india.gov.in) before applying.',
    timestamp: '1 day ago',
    type: 'info',
    read: true,
    link: '/schemes'
  },
  {
    id: 'notif-4',
    title: 'Gazette Registry Updated',
    message: 'Central welfare revisions for Q1 2026 indexed into local verification repository.',
    timestamp: '2 days ago',
    type: 'info',
    read: true,
    link: '/schemes'
  }
];

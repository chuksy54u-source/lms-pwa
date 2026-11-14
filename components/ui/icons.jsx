// Inline icons (1.8px stroke, 24px grid). No icon library, so nothing extra to download on slow phones.
const paths = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-6h4v6h5V9.5" /></>,
  learn: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /><path d="M8 7h8M8 11h6" /></>,
  tasks: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  bear: <><circle cx="6" cy="6" r="2.6" /><circle cx="18" cy="6" r="2.6" /><circle cx="12" cy="13" r="8" /><circle cx="9.3" cy="11.5" r="1" fill="currentColor" stroke="none" /><circle cx="14.7" cy="11.5" r="1" fill="currentColor" stroke="none" /><path d="M10.5 15.5c.8.7 2.2.7 3 0" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  bell: <><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 21h4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  back: <path d="M15 5 8 12l7 7" />,
  next: <path d="m9 5 7 7-7 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  eye: <><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3.1 4M6.6 6.6C3.9 8.3 2.5 12 2.5 12s3.5 7 9.5 7a9.4 9.4 0 0 0 5-1.4" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  send: <path d="M4 12 20 4l-6 16-3-7z" />,
  sound: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
  sparkle: <path d="M12 3.5 13.8 10l6.2 2-6.2 2L12 20.5 10.2 14 4 12l6.2-2z" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.8.7 3 2.4 3.5 5.2" /></>,
  teacher: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  book: <><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" /><path d="M12 6.5v13" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1-1.6-1-2.8 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" /><circle cx="7.5" cy="11" r="1" fill="currentColor" /><circle cx="10" cy="7" r="1" fill="currentColor" /><circle cx="15" cy="7" r="1" fill="currentColor" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></>,
  wand: <><path d="m4 20 11-11" /><path d="m14 5 1-2 1 2 2 1-2 1-1 2-1-2-2-1zM19 12l.7-1.3L21 10l-1.3-.7L19 8l-.7 1.3L17 10l1.3.7z" /></>,
  logout: <><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></>,
  award: <><circle cx="12" cy="9" r="5.5" /><path d="m8.5 13.5-1.5 7.5 5-2.5 5 2.5-1.5-7.5" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  wifiOff: <><path d="M3 3l18 18" /><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.8M14.5 10.4A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 4.3-2.8M11 5.1a15 15 0 0 1 11 4.4" /><circle cx="12" cy="20" r=".8" fill="currentColor" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  download: <><path d="M12 4v12M7 11l5 5 5-5" /><path d="M4 20h16" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
  print: <><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>,
  file: <><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" /><path d="M14 3v5h5" /></>,
  building: <><path d="M4 21V5l8-3 8 3v16" /><path d="M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" /></>,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" />,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  edit: <><path d="M4 20h4l11-11-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,

  // ---- Round 17: the icons that replace every emoji. Same grid, same stroke, so they sit well beside the ones above.
  note: <><rect x="5" y="4.5" width="14" height="16.5" rx="2.5" /><path d="M9 3.2h6v3.4H9z" /><path d="M8.6 11h6.8M8.6 14.4h6.8M8.6 17.8h4" /></>,
  trophy: <><path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z" /><path d="M7.5 6.5H5.2c-.4 0-.7.3-.7.7 0 2.3 1.6 3.9 3.6 4.3M16.5 6.5h2.3c.4 0 .7.3.7.7 0 2.3-1.6 3.9-3.6 4.3" /><path d="M12 14v3.5M8.5 20.5h7M9.7 17.5h4.6" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" /></>,
  bulb: <><path d="M12 3.2a6 6 0 0 0-3.7 10.7c.8.6 1.2 1.4 1.2 2.3v.3h5v-.3c0-.9.4-1.7 1.2-2.3A6 6 0 0 0 12 3.2z" /><path d="M9.8 19.2h4.4M10.6 21.5h2.8" /></>,
  chart: <><path d="M4 20h16" /><rect x="5.5" y="11" width="3.2" height="9" rx=".8" /><rect x="10.4" y="5" width="3.2" height="15" rx=".8" /><rect x="15.3" y="14" width="3.2" height="6" rx=".8" /></>,
  trend: <><path d="M3.5 17 9 11.5l3.5 3.5 8-8" /><path d="M15 7h5.5v5.5" /></>,
  help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.7a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.9" /><circle cx="12" cy="16.6" r="1" fill="currentColor" stroke="none" /></>,
  think: <><path d="M6 16.7A6.9 6.9 0 0 1 4 12c0-3.9 3.6-7 8-7s8 3.1 8 7-3.6 7-8 7c-1 0-2-.2-2.9-.5L6 20z" /><circle cx="9.3" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r=".85" fill="currentColor" stroke="none" /><circle cx="14.7" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  star: <path d="m12 3.4 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z" />,
  party: <><path d="M4.5 20 8.2 9.2l6.6 6.6z" /><path d="M13.2 5.4V3.8M17.6 8l1.2-1.1M19.2 12.8h1.6" /><circle cx="10.6" cy="4.6" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="17.2" r="1" fill="currentColor" stroke="none" /></>,
  thumbsUp: <><path d="M7 11v9H4.6a.6.6 0 0 1-.6-.6v-7.8a.6.6 0 0 1 .6-.6z" /><path d="m7 11 3.2-6.2a1.7 1.7 0 0 1 3.2 1L12.6 10H18a2 2 0 0 1 2 2.4l-1.2 6A2 2 0 0 1 16.8 20H7" /></>,
  wave: <><path d="M8.5 12.5V6.8a1.4 1.4 0 0 1 2.8 0V11M11.3 11V4.9a1.4 1.4 0 0 1 2.8 0V11M14.1 11V6a1.4 1.4 0 0 1 2.8 0v6.5M16.9 12.5V9.8a1.4 1.4 0 0 1 2.8 0v5.2a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L4.5 14.6a1.4 1.4 0 0 1 2.1-1.8l1.9 2" /></>,
  smile: <><circle cx="12" cy="12" r="8.5" /><path d="M8.4 14.2c.9 1.4 2 2.1 3.6 2.1s2.7-.7 3.6-2.1" /><circle cx="9.2" cy="9.9" r="1" fill="currentColor" stroke="none" /><circle cx="14.8" cy="9.9" r="1" fill="currentColor" stroke="none" /></>,
  worried: <><circle cx="12" cy="12" r="8.5" /><path d="M8.8 16.2c.8-1 1.8-1.5 3.2-1.5s2.4.5 3.2 1.5" /><circle cx="9.2" cy="10.4" r="1" fill="currentColor" stroke="none" /><circle cx="14.8" cy="10.4" r="1" fill="currentColor" stroke="none" /><path d="M7.6 8.7l2.6-.9M16.4 8.7l-2.6-.9" /></>,
  intense: <><circle cx="12" cy="12" r="8.5" /><path d="M8.8 15.6h6.4" /><circle cx="9.2" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="14.8" cy="11" r="1" fill="currentColor" stroke="none" /><path d="m7.6 8.4 3 1.2M16.4 8.4l-3 1.2" /></>,
  surprise: <><circle cx="12" cy="12" r="8.5" /><ellipse cx="12" cy="15.7" rx="1.7" ry="2" /><circle cx="9.2" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="14.8" cy="10" r="1" fill="currentColor" stroke="none" /></>,
  wince: <><circle cx="12" cy="12" r="8.5" /><rect x="8.6" y="14.1" width="6.8" height="2.9" rx="1.1" /><path d="M12 14.1V17" /><circle cx="9.2" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="14.8" cy="10" r="1" fill="currentColor" stroke="none" /></>,
  heart: <path d="M12 20s-7.5-4.4-7.5-10.1A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.7C19.5 15.6 12 20 12 20z" />,
  flame: <><path d="M12 21c-3.6 0-6-2.5-6-5.8 0-2.3 1.3-4 2.6-5.4.3 1.1.9 1.8 1.7 2.2C10 8.6 10.7 5.6 13 3c.3 3.3 4.5 5.6 4.5 11.1 0 3.8-2.4 6.9-5.5 6.9z" /><path d="M12 21c-1.5 0-2.5-1-2.5-2.4 0-1.2.8-2 1.5-2.8.3.7.7 1 1.2 1.2.3-.6.5-1.2.5-1.8.9.8 1.8 1.7 1.8 3.4 0 1.4-1 2.4-2.5 2.4z" /></>,
  sprout: <><path d="M12 21v-8.5" /><path d="M12 13c0-4 2.4-6.5 7-6.5 0 4.2-2.6 6.5-7 6.5z" /><path d="M12 15.8c0-3-1.8-5-5.5-5 0 3.2 2 5 5.5 5z" /></>,
  timer: <><circle cx="12" cy="13.5" r="7" /><path d="M12 10v3.8l2.2 1.4M9.5 3h5M12 3v3.5M18.3 6.6l1.3-1.3" /></>,
  hourglass: <><path d="M7 3.5h10M7 20.5h10" /><path d="M8 3.5c0 4 2 5.5 4 8.5-2 3-4 4.5-4 8.5M16 3.5c0 4-2 5.5-4 8.5 2 3 4 4.5 4 8.5" /></>,
  bolt: <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12z" />,
  robot: <><rect x="5" y="8.5" width="14" height="10.5" rx="3" /><path d="M12 8.5V5" /><circle cx="12" cy="4.2" r="1" /><circle cx="9.3" cy="13" r="1" fill="currentColor" stroke="none" /><circle cx="14.7" cy="13" r="1" fill="currentColor" stroke="none" /><path d="M9.5 16.2h5M3 12.5v3M21 12.5v3" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.2 7.8 7.8 5.7 7.8-5.7" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2.2" />,
  checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m8 12.3 2.8 2.8 5.4-5.6" /></>,
  phone: <><rect x="7" y="3" width="10" height="18" rx="2.6" /><path d="M10.8 18h2.4" /></>,
  tablet: <><rect x="4.5" y="3.5" width="15" height="17" rx="2.6" /><path d="M10.8 17.5h2.4" /></>,
  desktop: <><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M8.5 20.5h7M12 16.5v4" /></>,
  paperclip: <path d="m19 11.5-7 7a4.5 4.5 0 0 1-6.4-6.4l7.6-7.6a3 3 0 0 1 4.2 4.2l-7.6 7.6a1.5 1.5 0 0 1-2.1-2.1l6.5-6.5" />,
  warning: <><path d="M12 4 21 19.5H3z" /><path d="M12 10v4.2" /><circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none" /></>,
  calculator: <><rect x="5" y="3" width="14" height="18" rx="2.6" /><path d="M8.5 7.5h7" /><circle cx="8.8" cy="12" r=".85" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r=".85" fill="currentColor" stroke="none" /><circle cx="15.2" cy="12" r=".85" fill="currentColor" stroke="none" /><circle cx="8.8" cy="15.5" r=".85" fill="currentColor" stroke="none" /><circle cx="12" cy="15.5" r=".85" fill="currentColor" stroke="none" /><circle cx="15.2" cy="15.5" r=".85" fill="currentColor" stroke="none" /></>,
  flask: <><path d="M9.5 3.5h5M10.5 3.5v5.6L5.2 18.3A2 2 0 0 0 7 21h10a2 2 0 0 0 1.8-2.7L13.5 9.1V3.5" /><path d="M7.8 15h8.4" /></>,
  film: <><rect x="3.5" y="9" width="17" height="11" rx="2" /><path d="M3.5 9 4.8 4.6l15.7 2-.5 2.4M8 5.2l1.8 3.4M13.2 5.9 15 9.3" /></>,
  megaphone: <><path d="M4 10v4a1 1 0 0 0 1 1h2.2l8.3 4V5l-8.3 4H5a1 1 0 0 0-1 1z" /><path d="M18.6 9.4a4 4 0 0 1 0 5.2M7.2 15l1.2 4.5" /></>,
  briefcase: <><rect x="3.5" y="7.5" width="17" height="12" rx="2.5" /><path d="M9 7.5V5.8c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6v1.7M3.5 13h17" /></>,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.6 5.5l-3.2 13" />,
  landmark: <><path d="M3.5 9.2 12 4l8.5 5.2z" /><path d="M5.5 20.5h13M6.5 12v5.5M10.2 12v5.5M13.8 12v5.5M17.5 12v5.5" /></>,
  gamepad: <><rect x="3" y="7.5" width="18" height="10" rx="5" /><path d="M8 10.5v4M6 12.5h4" /><circle cx="15.4" cy="11.6" r="1" fill="currentColor" stroke="none" /><circle cx="17.4" cy="13.6" r="1" fill="currentColor" stroke="none" /></>,
  dice: <><rect x="4" y="4" width="16" height="16" rx="3.6" /><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" /></>,
  cap: <><path d="M2.5 9.5 12 5l9.5 4.5L12 14z" /><path d="M6.6 11.8V16c0 1.2 2.5 2.7 5.4 2.7s5.4-1.5 5.4-2.7v-4.2M21.5 9.5V15" /></>,
  soundOff: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></>,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chevronUp: <path d="m6 14.5 6-6 6 6" />,
  alignJustify: <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
  coin: <><circle cx="12" cy="12" r="8.5" /><path d="M14.6 9.4c-.5-.7-1.4-1.1-2.6-1.1-1.5 0-2.5.7-2.5 1.8 0 2.5 5.1 1.1 5.1 3.7 0 1.2-1.1 1.9-2.7 1.9-1.2 0-2.1-.4-2.7-1.1M12 6.4v1.9M12 15.7v1.9" /></>,
  arrowRight: <path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />,
  gChess: <><path d="M6 20.5h12" /><path d="M7.2 20.5c0-4.4 1.2-7.4 4.1-9.7-1.3-.3-2.4 0-3.4.8l-.6-2.1 2.6-3.8.5-2.4 2.1 1.6c3.6.2 5.9 3 6.3 7.1.2 2.7.2 5.6.2 8.5" /><circle cx="13" cy="8.1" r="1" fill="currentColor" stroke="none" /></>,
  gScrabble: <><rect x="4" y="4" width="16" height="16" rx="3.2" /><path d="m8.7 16.2 3.3-8.2 3.3 8.2M9.9 13.5h4.2" /></>,
  gCheckers: <><rect x="4" y="4" width="16" height="16" rx="2.8" /><path d="M4.9 7A2.1 2.1 0 0 1 7 4.9h5v7.1H4.9zM12 12h7.1v5a2.1 2.1 0 0 1-2.1 2.1h-5z" fill="currentColor" stroke="none" /></>,
  gProperty: <><path d="M3.8 11.6 12 4.4l8.2 7.2" /><path d="M6.5 10v10.2h11V10" /><path d="M10 20.2v-5.4h4v5.4M16.6 7V4.6h-2.2" /></>,
  gLudo: <><circle cx="12" cy="7.2" r="3" /><path d="M12 10.2c-3.1 1.5-4.2 4.1-4.7 7.3h9.4c-.5-3.2-1.6-5.8-4.7-7.3z" /><path d="M5.5 20.5h13" /></>,
  gAyo: <><rect x="3" y="6.5" width="18" height="11" rx="3.6" /><circle cx="7.8" cy="10.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="10.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="16.2" cy="10.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="7.8" cy="13.9" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="13.9" r="1.3" fill="currentColor" stroke="none" /><circle cx="16.2" cy="13.9" r="1.3" fill="currentColor" stroke="none" /></>,
  listBullets: <><path d="M9.5 6h10.5M9.5 12h10.5M9.5 18h10.5" /><circle cx="5" cy="6" r="1.3" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="5" cy="18" r="1.3" fill="currentColor" stroke="none" /></>,
  alignLeft: <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />,
  alignCenter: <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />,
  alignRight: <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />,
  indent: <><path d="M4 6h16M11 10h9M11 14h9M4 18h16" /><path d="m4 9.5 3 2.5-3 2.5z" /></>,
  outdent: <><path d="M4 6h16M11 10h9M11 14h9M4 18h16" /><path d="m7 9.5-3 2.5 3 2.5z" /></>,
  minus: <path d="M5 12h14" />,
  id: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="9" cy="11" r="2" /><path d="M5.8 16c.5-1.5 1.8-2.2 3.2-2.2s2.7.7 3.2 2.2M14.5 10h4M14.5 13.5h3" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  undo: <><path d="M4 11a8 8 0 1 1 2.3 5.7" /><path d="M4 4v7h7" /></>,
};

// Which icon stands for each word the server (or an older version of it) used to send as an emoji. Anything not listed shows nothing.
export const EMOTE_ICON = {
  greet: 'wave', wave: 'wave', think: 'think', idea: 'bulb', cheer: 'party', star: 'star', clap: 'sparkle', nice: 'thumbsUp', steady: 'smile',
  careful: 'wince', oops: 'bolt', surprise: 'surprise', win: 'trophy', lose: 'users', love: 'heart', streak: 'flame', hide: 'eyeOff',
};
export const ICON_NAMES = Object.keys(paths);

export default function Icon({ name, size = 22, stroke = 1.8, className, title, ...rest }) {
  const p = paths[name];
  if (!p) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title && <title>{title}</title>}
      {p}
    </svg>
  );
}

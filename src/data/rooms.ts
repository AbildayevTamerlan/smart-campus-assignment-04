// Fictional room catalog. Read-only: nothing in the app modifies these objects.
import type { Booking } from "@/domain/availability";

export const EQUIPMENT = ["Projector", "Whiteboard", "Video conferencing", "Computers"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export type Room = {
  id: string;
  name: string;
  capacity: number;
  equipment: readonly Equipment[];
  blocked: boolean;
  bookings: readonly Booking[];
};

export const ROOMS: readonly Room[] = [
  {
    id: "lib-201",
    name: "Library Study Room 201",
    capacity: 6,
    equipment: ["Whiteboard"],
    blocked: false,
    bookings: [
      { id: "lib-201-1", title: "Calc Study Group", start: 540, end: 600 }, // 09:00–10:00
      { id: "lib-201-2", title: "Project Standup", start: 720, end: 780 }, // 12:00–13:00
      { id: "lib-201-3", title: "Exam Review", start: 1020, end: 1080 }, // 17:00–18:00
    ],
  },
  {
    id: "eng-110",
    name: "Engineering Lab 110",
    capacity: 24,
    equipment: ["Projector", "Whiteboard", "Computers"],
    blocked: false,
    bookings: [
      { id: "eng-110-1", title: "Robotics Workshop", start: 480, end: 600 }, // 08:00–10:00
      { id: "eng-110-2", title: "Office Hours", start: 900, end: 960 }, // 15:00–16:00
    ],
  },
  {
    id: "bus-305",
    name: "Business Seminar Room 305",
    capacity: 40,
    equipment: ["Projector", "Video conferencing"],
    blocked: false,
    bookings: [
      { id: "bus-305-1", title: "Case Discussion", start: 630, end: 690 }, // 10:30–11:30
      { id: "bus-305-2", title: "Guest Lecture", start: 840, end: 960 }, // 14:00–16:00
      { id: "bus-305-3", title: "Networking Night", start: 1140, end: 1260 }, // 19:00–21:00
    ],
  },
  {
    id: "med-014",
    name: "Media Studio 014",
    capacity: 10,
    equipment: ["Projector", "Whiteboard", "Video conferencing"],
    blocked: true, // closed for maintenance — always Unavailable (F3)
    bookings: [
      { id: "med-014-1", title: "Podcast Recording", start: 600, end: 660 }, // 10:00–11:00
    ],
  },
  {
    id: "hum-102",
    name: "Humanities Quiet Room 102",
    capacity: 2,
    equipment: [],
    blocked: false,
    bookings: [],
  },
];

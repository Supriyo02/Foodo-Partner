import { TimeSlot } from "@/types";
import { uuidv4 } from "../services/utility";

export const initialStaticSlots: TimeSlot[] = [
  {
    id: uuidv4(),
    mealType: "Lunch",
    start: "12:00",
    end: "14:00",
    cutoff: "11:00",
    isActive: true,
  },
  {
    id: uuidv4(),
    mealType: "Dinner",
    start: "19:00",
    end: "21:30",
    cutoff: "18:00",
    isActive: false,
  },
  {
    id: uuidv4(),
    mealType: "Breakfast",
    start: "08:00",
    end: "11:30",
    cutoff: "06:00",
    isActive: true,
  },
];
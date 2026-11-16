import { services } from "./data";

// Shared select options for registration and the My account panel.
export const INDUSTRIES = [
  "Construction",
  "Manufacturing",
  "Energy & Power",
  "Oil & Gas",
  "Civil Infrastructure",
  "Facilities & Maintenance",
  "Other",
];

export const TRADES = [
  ...services.map((s) => s.title),
  "Welder",
  "Pipe Fitter",
  "Plumber",
  "Carpenter",
  "Mason / Bricklayer",
  "Painter",
  "Heavy Equipment Operator",
  "Mechanic",
  "HVAC Technician",
  "Safety Officer",
  "Driver",
  "Other",
];

export const AVAILABILITY = [
  "Available now",
  "Within 2 weeks",
  "Within a month",
  "Not currently looking",
];

export const COMPANY_SIZES = [
  "1\u201310",
  "11\u201350",
  "51\u2013200",
  "201\u20131000",
  "1000+",
];

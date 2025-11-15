export const doctorScheduleFilterableFields = [
  'searchTerm',
  'doctorId',
  'isBooked',
  'startDate',
  'endDate',
  'type', // upcoming, past
];

export const myScheduleFilterableFields = [
  'isBooked',
  'startDate',
  'endDate',
  'type', // upcoming, past
];

export const doctorScheduleSearchableFields = [
  'doctor.name',
  'doctor.email',
];

export const scheduleSortableFields = [
  'startDateTime',
  'endDateTime',
  'createdAt',
  'updatedAt',
];
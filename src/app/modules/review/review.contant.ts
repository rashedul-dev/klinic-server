export const reviewFilterableFields = [
  "searchTerm",
  "doctorId",
  "patientId",
  "rating",
  "minRating",
  "maxRating",
  "startDate",
  "endDate",
];

export const reviewSearchableFields = ["patient.name", "doctor.name", "comment"];

export const reviewSortableFields = ["rating", "createdAt", "updatedAt"];

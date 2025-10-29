export interface IPatientFilterRequest {
  searchTerm?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  address?: string | undefined;
}

export interface IPatientUpdate {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}

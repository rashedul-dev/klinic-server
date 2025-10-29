export interface IAdmin {
  id: string;
  email: string;
  name: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminFilters {
  searchTerm?: string;
  id?: string;
  email?: string;
  name?: string;
  contactNumber?: string;
}

export interface IAdminCreate {
  email: string;
  name: string;
  profilePhoto?: string;
  contactNumber?: string;
}

export interface IAdminUpdate {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
}

export type IAdminFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
};

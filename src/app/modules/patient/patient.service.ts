import { Patient, Prisma, UserStatus } from "@prisma/client";
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface";
import { patientSearchableFields } from "./patient.constant";
import httpStatus from "http-status";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";

const getAllFromDB = async (filters: IPatientFilterRequest, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.PatientWhereInput[] = [];

  // Search condition
  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Exact match filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  // Exclude soft-deleted records
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    // {
    //   [sortBy]: sortOrder,
    // },
    // include: {
    //   user: {
    //     select: {
    //       email: true,
    //       role: true,
    //       status: true,
    //     },
    //   },
    // },
  });

  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    // include: {
    //   user: {
    //     select: {
    //       email: true,
    //       role: true,
    //       status: true,
    //     },
    //   },
    // },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  return result;
};

const updateIntoDB = async (id: string, payload: IPatientUpdate): Promise<Patient> => {
  const patientInfo = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!patientInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  const result = await prisma.patient.update({
    where: {
      id,
    },
    data: payload,
    include: {
      user: {
        select: {
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return result;
};

const deleteFromDB = async (id: string): Promise<Patient | null> => {
  const patientInfo = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!patientInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  // Soft delete - update isDeleted to true
  const result = await prisma.$transaction(async (transactionClient) => {
    // Delete patient record
    const deletedPatient = await transactionClient.patient.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Also update the associated user with DELETE
    await transactionClient.user.update({
      where: { email: deletedPatient.email },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });

  return result;
};

export const PatientService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};

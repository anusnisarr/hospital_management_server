export const visitSearchQuery = (search) => {
  if (!search) return {};

  return {
    $or: [
      { registrationDate: { $regex: search, $options: "i" } },
      { tokenNo: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { appointmentType: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
    ]
  };
}

export const patientSearchQuery = (search) => {
  if (!search) return {};

  return {
    $or: [
      { createdAt: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { fullName: { $regex: search, $options: "i" } },
      { age: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
      { emergencyContact: { $regex: search, $options: "i" } },
      { emergencyPhone: { $regex: search, $options: "i" } },
      { totalVisits: { $regex: search, $options: "i" } },
      { lastVisitDate: { $regex: search, $options: "i" } },
      { lastVisitStatus: { $regex: search, $options: "i" } }
    ]
  };
}


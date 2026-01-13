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

  const regex = { $regex: search, $options: "i" };
  const conditions = [
    { phone: regex },
    { fullName: regex },
    { address: regex },
    { emergencyContact: regex },
    { emergencyPhone: regex },
    { lastVisitStatus: regex }
  ];

  const num = Number(search);
  if (!isNaN(num)) {
    conditions.push({ age: num }, { totalVisits: num });
  }

  const date = new Date(search);
  if (!isNaN(date.getTime())) {
    conditions.push({ createdAt: date }, { lastVisitDate: date });
  }

  return { $or: conditions };
};


export const buildSearchQuery = (search) => {
  if (!search) return {};

  return {
    $or: [
      { fullName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
      { emergencyContact: { $regex: search, $options: "i" } },
      { emergencyPhone: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
    ]
  };
}

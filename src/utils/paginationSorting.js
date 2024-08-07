const { NotFoundError } = require("../errors");

const paginateAndSort = async (User, query, page, limit, sortBy, sortOrder) => {
  // Set default values for pagination and sorting
  page = Number(page) || 1;
  limit = Number(limit) || 5;
  const skip = (page - 1) * limit;

  sortBy = sortBy || "firstName";
  sortOrder = sortOrder === "desc" ? -1 : 1;

  // Execute the query with pagination and sorting
  const results = await User.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  if (!results.length) {
    throw new NotFoundError("No results found");
  }

  // Count the total number of documents that match the query
  const total = await User.countDocuments(query);

  return {
    results,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

module.exports = paginateAndSort;
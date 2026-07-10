const mongoose = require("mongoose");

/**
 * Helper for cursor-based pagination.
 * @param {mongoose.Model} model 
 * @param {Object} filter 
 * @param {String} cursor - ObjectId string for the last seen document
 * @param {Number} limit - Maximum number of items to return
 * @param {Object} populateOpts - Mongoose populate options
 */
const paginateQuery = async (model, filter = {}, cursor, limit = 20, populateOpts) => {
  if (limit > 100) {
    throw new Error("Limit cannot exceed 100");
  }

  // Use $lt for descending sort (newest first) as discussed in plan
  if (cursor) {
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  // Fetch limit + 1 to determine if there's a next page
  let query = model.find(filter)
    .sort({ _id: -1 }) // Descending
    .limit(limit + 1);

  if (populateOpts) {
    query = query.populate(populateOpts);
  }

  const results = await query.exec();
  
  const hasMore = results.length > limit;
  
  if (hasMore) {
    // Remove the extra item
    results.pop();
  }

  const nextCursor = results.length > 0 ? results[results.length - 1]._id.toString() : null;

  return {
    data: results,
    nextCursor,
    hasMore,
  };
};

module.exports = { paginateQuery };

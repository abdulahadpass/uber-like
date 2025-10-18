import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from 'axios'

const getCoordinates = asyncHandler(async (req, res) => {
  const { address } = req.query;

  if (!address) {
    throw new ApiError(400, "Address is required");
  }

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    address
  )}&apiKey=${process.env.MAP_API}`;

  const response = await axios.get(url);
  const data = response.data;

  if (!data || !data.features || data.features.length === 0) {
    throw new ApiError(404, "Location not found");
  }

  const firstFeature = data.features[0];
  const coordinates = firstFeature.geometry?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    throw new ApiError(500, "Invalid coordinate data received");
  }

  const formatted = {
    lat: coordinates[1],
    lon: coordinates[0],
  };

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Coordinates fetched successfully"));
});
const getTimeandDistance = asyncHandler(async (req, res) => {
  const { start, end } = req.query
  if ([start, end].some((fields) => fields.trim() === '')) {
    throw new ApiError(400, 'fields are required')
  }
  const url = `https://api.geoapify.com/v1/routing?waypoints=${start}|${end}&mode=drive&apiKey=${process.env.MAP_API}`;

  const response = await axios.get(url)
  if (!response.data || !response.data.features || !response.data.features.length === 0) {
    throw new ApiError(400, 'Location not Found')
  }
  const timeInfo = response.data.features[0].properties

  const routeInfo = {
    durationIn_min: (timeInfo.distance / 1000).toFixed(2),
    distanceIn_km: (timeInfo.time / 60).toFixed(2)
  }
  return res.status(200).json(
    new ApiResponse(400, 'Time and Distance are fetched successfully', routeInfo)
  )
})
const getSuggestion = asyncHandler(async(req,res)=>{
  
})

export {
  getCoordinates,
  getTimeandDistance,
  getSuggestion,
}
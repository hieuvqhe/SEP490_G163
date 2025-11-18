import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const uploadFileToCloudinary = async (file: File) => {
  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "TicketXpress");
    data.append("cloud_name", "doruvtp0b");

    const resourceType =
      file.type === "application/pdf" ? "raw" : file.type.startsWith("image/") ? "image" : "auto";

    const endpoint = `https://api.cloudinary.com/v1_1/doruvtp0b/${resourceType}/upload`;

    const response = await axios.post(endpoint, data);

    return response.data;
  } catch (error) {
    throw new Error("Failed to upload file to Cloudinary:" + error);
  }
};

export const useUploadToCloudinary = () => {
  return useMutation({
    mutationFn: (file: File) => uploadFileToCloudinary(file),
  });
};

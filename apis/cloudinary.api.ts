import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { use } from "react";

export const uploadFileToCloudinary = async (file: File) => {
  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "TicketXpress");
    data.append("cloud_name", "doruvtp0b");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/doruvtp0b/image/upload",
      data
    );

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

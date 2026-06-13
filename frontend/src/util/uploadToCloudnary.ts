const CLOUD_NAME    = "dxoqwusir";
const UPLOAD_PRESET = "ml_default";

export interface UploadResult {
  url:       string;
  type:      "image" | "video";
  thumbnail: string;
  name:      string;
  size:      number;
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const result = await uploadFileToCloudinary(file);
  return result.url;
};

export const uploadFileToCloudinary = async (file: File): Promise<UploadResult> => {
  const isVideo = file.type.startsWith("video/");

  const data = new FormData();
  data.append("file",          file);
  data.append("upload_preset", UPLOAD_PRESET);
  data.append("cloud_name",    CLOUD_NAME);

  const endpoint = isVideo
    ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
    : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const res = await fetch(endpoint, { method: "POST", body: data });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Upload failed (${res.status})`);
  }

  const d = await res.json();
  const url = d.secure_url ?? d.url ?? "";

  // for video → generate thumbnail from cloudinary
  const thumbnail = isVideo
    ? url.replace("/upload/", "/upload/so_0,w_200,h_200,c_fill/").replace(/\.[^.]+$/, ".jpg")
    : url;

  return {
    url,
    type:      isVideo ? "video" : "image",
    thumbnail,
    name:      file.name,
    size:      file.size,
  };
};
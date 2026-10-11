import { supabase, supabaseUrl, supabaseAnonKey } from "../supabase";
import { slugify } from "./content";
import type { MediaAsset } from "./types";
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export async function validateImage(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    throw new Error("Use JPEG, PNG, WebP or AVIF images.");
  if (file.size > MAX_IMAGE_SIZE)
    throw new Error("Images must be under 10 MB.");
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const signature = String.fromCharCode(...bytes);
  const valid =
    (file.type === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216) ||
    (file.type === "image/png" &&
      bytes[0] === 137 &&
      signature.slice(1, 4) === "PNG") ||
    (file.type === "image/webp" &&
      signature.slice(0, 4) === "RIFF" &&
      signature.slice(8, 12) === "WEBP") ||
    (file.type === "image/avif" &&
      signature.slice(4, 8) === "ftyp" &&
      /avif|avis/.test(signature.slice(8)));
  if (!valid)
    throw new Error("Image contents do not match the declared file type.");
}
async function uploadBlob(
  path: string,
  blob: Blob,
  token: string,
  progress: (loaded: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/blog-media/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("Content-Type", "image/webp");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "31536000");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) progress(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        progress(blob.size);
        resolve();
      } else {
        let message = "Upload denied or failed";
        try {
          message = JSON.parse(xhr.responseText).message || message;
        } catch {
          /* Keep a readable upload error for non-JSON responses. */
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));
    xhr.timeout = 120000;
    xhr.send(blob);
  });
}
export async function uploadImage(
  file: File,
  alt: string,
  onProgress: (percent: number) => void,
): Promise<MediaAsset> {
  if (alt.trim().length < 8)
    throw new Error(
      "Write a meaningful image description (at least 8 characters).",
    );
  await validateImage(file);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sign in before uploading.");
  const bitmap = await createImageBitmap(file);
  if (bitmap.width * bitmap.height > 40000000) {
    bitmap.close();
    throw new Error("Image exceeds the 40 megapixel limit.");
  }
  const widths = [
    ...new Set([
      Math.min(480, bitmap.width),
      Math.min(960, bitmap.width),
      Math.min(1920, bitmap.width),
    ]),
  ];
  const variants: {
    width: number;
    height: number;
    blob: Blob;
    path: string;
    url: string;
  }[] = [];
  const assetId = crypto.randomUUID(),
    base = `${session.user.id}/${slugify(file.name.replace(/\.[^.]+$/, "")) || "image"}-${assetId}`;
  for (const width of widths) {
    const height = Math.round((bitmap.height * width) / bitmap.width),
      canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Image conversion failed."))),
        "image/webp",
        0.84,
      ),
    );
    if (blob.type !== "image/webp") {
      bitmap.close();
      throw new Error(
        "This browser cannot encode WebP. Use a current browser.",
      );
    }
    const path = `${base}-${width}.webp`,
      url = supabase.storage.from("blog-media").getPublicUrl(path)
        .data.publicUrl;
    variants.push({ width, height, blob, path, url });
  }
  bitmap.close();
  let completed = 0;
  const total = variants.reduce((n, v) => n + v.blob.size, 0),
    uploaded: string[] = [];
  try {
    for (const v of variants) {
      await uploadBlob(v.path, v.blob, session.access_token, (loaded) =>
        onProgress(
          Math.min(99, Math.round(((completed + loaded) / total) * 100)),
        ),
      );
      uploaded.push(v.path);
      completed += v.blob.size;
    }
    const main = variants[variants.length - 1];
    const { data, error } = await supabase
      .from("blog_media")
      .insert({
        id: assetId,
        owner_id: session.user.id,
        name: file.name,
        alt: alt.trim(),
        caption: "",
        url: main.url,
        storage_paths: uploaded,
        srcset: variants.map((v) => `${v.url} ${v.width}w`).join(", "),
        width: main.width,
        height: main.height,
        size: total,
        mime_type: "image/webp",
      })
      .select("*")
      .single();
    if (error) throw error;
    onProgress(100);
    return data as MediaAsset;
  } catch (error) {
    if (uploaded.length)
      await supabase.storage.from("blog-media").remove(uploaded);
    throw error;
  }
}

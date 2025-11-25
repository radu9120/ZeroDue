"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "../supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadFileAndGetUrl(file: File): Promise<string> {
  const { userId: author } = await auth();
  if (!author) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseAdminClient();

  const fileExtension = file.name.split(".").pop();
  const uniqueFileName = `${Date.now()}-${uuidv4()}-${Date.now()}.${fileExtension}`;
  // Store files within a per-user folder to align with common RLS policies
  const objectKey = `${author}/${uniqueFileName}`;

  console.log(`Attempting to upload file: ${objectKey}`);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("logos")
    .upload(objectKey, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Supabase file upload error:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("logos")
    .getPublicUrl(objectKey);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Failed to retrieve public URL for the uploaded file.");
  }

  console.log(`File uploaded successfully: ${publicUrlData.publicUrl}`);
  return publicUrlData.publicUrl;
}

export async function updateFileInBucket(
  publicUrl: string,
  newFile: File
): Promise<string> {
  console.log("Server: updateFileInBucket called with:");
  console.log("- publicUrl:", publicUrl);
  console.log("- newFile name:", newFile.name);
  console.log("- newFile type:", newFile.type);
  console.log("- newFile size:", newFile.size);

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseAdminClient();

  // Parse URL to extract filename - handle both possible URL formats
  let fileName: string;

  if (publicUrl.includes("/storage/v1/object/public/logos/")) {
    // Standard Supabase public URL format
    const urlParts = publicUrl.split("/storage/v1/object/public/logos/");
    if (urlParts.length !== 2) {
      console.error("Server: Invalid URL format:", publicUrl);
      throw new Error("Invalid public URL format.");
    }
    fileName = urlParts[1];
  } else {
    // Fallback - try to extract filename from end of URL
    const urlParts = publicUrl.split("/");
    fileName = urlParts[urlParts.length - 1];
  }

  // Remove any query parameters (like cache-busting timestamps)
  fileName = fileName.split("?")[0];

  console.log("Server: Extracted fileName:", fileName);

  // Validate that we have a valid filename
  if (!fileName || fileName.trim() === "") {
    console.error(
      "Server: Could not extract valid filename from URL:",
      publicUrl
    );
    throw new Error("Could not extract filename from URL");
  }

  console.log(`Server: Attempting to update file: ${fileName}`);

  const { data, error } = await supabase.storage
    .from("logos")
    .update(fileName, newFile, {
      cacheControl: "0", // Disable caching for immediate updates
      upsert: true,
      contentType: newFile.type,
    });

  console.log("Server: Supabase update response:");
  console.log("- data:", data);
  console.log("- error:", error);

  if (error) {
    console.error("Server: Supabase file update error:", error);
    throw new Error(`Failed to update file: ${error.message}`);
  }

  // Return cache-busted URL to force browser refresh
  const baseUrl = publicUrl.split("?")[0]; // Remove any existing query params
  const cachebustedUrl = `${baseUrl}?t=${Date.now()}`;

  console.log(`Server: File updated successfully: ${cachebustedUrl}`);
  return cachebustedUrl;
}

export async function deleteFileFromBucket(publicUrl: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createSupabaseAdminClient();

  // Parse URL to extract filename - handle both possible URL formats
  let fileName: string;

  if (publicUrl.includes("/storage/v1/object/public/logos/")) {
    // Standard Supabase public URL format
    const urlParts = publicUrl.split("/storage/v1/object/public/logos/");
    if (urlParts.length !== 2) {
      throw new Error("Invalid public URL format.");
    }
    fileName = urlParts[1];
  } else {
    // Fallback - try to extract filename from end of URL
    const urlParts = publicUrl.split("/");
    fileName = urlParts[urlParts.length - 1];
  }

  // Remove any query parameters (like cache-busting timestamps)
  fileName = fileName.split("?")[0];

  console.log("Server: Attempting to delete file:", fileName);

  // Validate that we have a valid filename
  if (!fileName || fileName.trim() === "") {
    console.error(
      "Server: Could not extract valid filename from URL:",
      publicUrl
    );
    throw new Error("Could not extract filename from URL");
  }

  const { error } = await supabase.storage.from("logos").remove([fileName]);

  if (error) {
    console.error("Server: Delete error:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  console.log(`Server: File deleted successfully: ${fileName}`);
}

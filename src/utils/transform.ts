import type { Part } from "@google/genai"

export const extractFilePart = (filePart: Part): Part => {
  if (filePart.text) return filePart
  return {
    fileData: filePart.fileData
  }
}
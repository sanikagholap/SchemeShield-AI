from pathlib import Path
from typing import Any, Dict, List, Optional
import io

from PIL import Image
import pypdf
import pytesseract

from app.utils.exceptions import AppException
from app.utils.logger import logger


class OCRProcessingService:
    """
    Local document text extraction and OCR processing service.
    Extracts text from PDF documents, image flyers, and plain text uploads
    using open-source tooling (pypdf, Pillow, pytesseract) at zero operational cost.
    """

    IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
    PDF_EXTENSIONS = {".pdf"}
    TEXT_EXTENSIONS = {".txt"}

    def __init__(self):
        logger.info("Initialized local OCRProcessingService.")

    def extract_text_from_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Extracts textual content from a local document or image file.

        Returns structured result:
        {
            "extracted_text": str,
            "extraction_method": "plain_text" | "pdf_text" | "ocr",
            "page_count": Optional[int],
            "file_type": str,
            "warnings": List[str],
        }
        """
        if not file_path or not file_path.exists():
            raise AppException("Specified document does not exist for text extraction.", status_code=400)

        ext = file_path.suffix.lower()
        warnings: List[str] = []

        if ext in self.TEXT_EXTENSIONS:
            return self._extract_from_text_file(file_path)

        if ext in self.PDF_EXTENSIONS:
            return self._extract_from_pdf(file_path)

        if ext in self.IMAGE_EXTENSIONS:
            return self._extract_from_image(file_path)

        raise AppException(
            message=f"Unsupported file format '{ext}' for text extraction. Supported: PDF, PNG, JPG/JPEG, WEBP, TXT.",
            status_code=400,
        )

    def _extract_from_text_file(self, file_path: Path) -> Dict[str, Any]:
        """Reads plain text file with UTF-8 / latin-1 decoding."""
        try:
            content_bytes = file_path.read_bytes()
            try:
                text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                text = content_bytes.decode("latin-1", errors="replace")

            return {
                "extracted_text": text.strip(),
                "extraction_method": "plain_text",
                "page_count": 1,
                "file_type": file_path.suffix.lower(),
                "warnings": [],
            }
        except Exception as exc:
            logger.error(f"Error reading plain text file {file_path}: {exc}")
            raise AppException(f"Failed to read text file: {str(exc)}", status_code=400)

    def _extract_from_pdf(self, file_path: Path) -> Dict[str, Any]:
        """
        Extracts embedded text from PDF pages using pypdf.
        Falls back to image OCR if pages contain scanned images without embedded text.
        """
        warnings: List[str] = []
        try:
            reader = pypdf.PdfReader(str(file_path))
            page_count = len(reader.pages)
            text_parts: List[str] = []

            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                cleaned = page_text.strip()
                if cleaned:
                    text_parts.append(cleaned)

            combined_text = "\n\n".join(text_parts).strip()

            if combined_text:
                return {
                    "extracted_text": combined_text,
                    "extraction_method": "pdf_text",
                    "page_count": page_count,
                    "file_type": ".pdf",
                    "warnings": warnings,
                }

            # Scanned PDF with no embedded digital text layer
            warnings.append(
                "PDF contains no selectable text layer. Scanned PDF content requires local OCR."
            )

            # Attempt OCR on embedded images in PDF pages if available
            ocr_text = self._attempt_pdf_ocr(reader)
            if ocr_text:
                return {
                    "extracted_text": ocr_text,
                    "extraction_method": "ocr",
                    "page_count": page_count,
                    "file_type": ".pdf",
                    "warnings": warnings,
                }

            return {
                "extracted_text": "",
                "extraction_method": "pdf_text",
                "page_count": page_count,
                "file_type": ".pdf",
                "warnings": warnings,
            }

        except Exception as exc:
            logger.error(f"Error extracting text from PDF {file_path}: {exc}")
            if isinstance(exc, AppException):
                raise
            raise AppException("Failed to parse PDF document. The file may be corrupt or encrypted.", status_code=400)

    def _attempt_pdf_ocr(self, reader: pypdf.PdfReader) -> str:
        """Attempts OCR on images embedded inside scanned PDF pages."""
        extracted_chunks: List[str] = []
        for page in reader.pages:
            try:
                for img_obj in page.images:
                    img = Image.open(io.BytesIO(img_obj.data))
                    chunk = pytesseract.image_to_string(img)
                    if chunk.strip():
                        extracted_chunks.append(chunk.strip())
            except pytesseract.TesseractNotFoundError:
                logger.warning("Tesseract binary not installed on host machine during scanned PDF extraction.")
                return ""
            except Exception as exc:
                logger.debug(f"Error during page image OCR: {exc}")

        return "\n\n".join(extracted_chunks).strip()

    def _extract_from_image(self, file_path: Path) -> Dict[str, Any]:
        """Runs local Tesseract OCR on image files using Pillow."""
        warnings: List[str] = []
        try:
            image = Image.open(file_path)
            # Run Tesseract OCR locally
            raw_text = pytesseract.image_to_string(image)
            extracted_text = raw_text.strip()

            return {
                "extracted_text": extracted_text,
                "extraction_method": "ocr",
                "page_count": 1,
                "file_type": file_path.suffix.lower(),
                "warnings": warnings,
            }
        except pytesseract.TesseractNotFoundError:
            logger.warning(
                "Tesseract OCR executable not detected on host environment PATH."
            )
            raise AppException(
                message=(
                    "Local Tesseract OCR engine is not installed or configured on this server. "
                    "Please install Tesseract OCR (e.g., 'winget install UB-Mannheim.TesseractOCR' or 'apt-get install tesseract-ocr') "
                    "or upload text-based documents (PDF or TXT)."
                ),
                status_code=500,
            )
        except Exception as exc:
            logger.error(f"Error during image OCR processing {file_path}: {exc}")
            raise AppException(f"Failed to process image file: {str(exc)}", status_code=400)


ocr_processing_service = OCRProcessingService()

import pdfplumber
import io

class FileService:

    # @staticmethod
    # def extract_text_from_pdf(file_bytes: bytes) -> str:
    #     text = ""
    #     with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
    #         for page in pdf.pages:
    #             text += page.extract_text() or ""

    #     # optional cleaning
    #     text = " ".join(text.split())

    #     return text

    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        text = ""

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""

        # Clean text (important for Canva PDFs)
        text = text.replace("\n", " ")
        text = " ".join(text.split())

        return text
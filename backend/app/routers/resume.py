from fastapi import APIRouter, UploadFile, File, Depends
from app.schemas.resume_schema import ResumeRequest, SkillsResponse, SummaryResponse
from app.services.response_service import success_response 
from app.services.application_service import ApplicationService
from app.services.file_service import FileService

router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.post("/extract-skills", response_model=dict) # You can even use your response schemas here
async def extract_skills(payload: ResumeRequest):
    fake_skills = ["Python", "React", "SQL"]
    return success_response(data={"skills": fake_skills})

@router.post("/summarize", response_model=dict)
async def summarize_resume(payload: ResumeRequest):
    fake_summary = "Full-stack developer with experience in modern technologies."
    return success_response(data={"summary": fake_summary})

# @router.post("/upload")
# async def upload_resume(
#     file: UploadFile = File(...),
#     db=Depends(get_db),
#     current_user=Depends(get_current_user)
# ):

#     file_bytes = await file.read()

#     resume = await ApplicationService.upload_resume(
#         file_bytes=file_bytes,
#         user_id=current_user.id,
#         db=db
#     )

#     return {
#         "status": "success",
#         "data": {
#             "resume_id": resume.id
#         }
#     }

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    file_bytes = await file.read()

    text = FileService.extract_text_from_pdf(file_bytes)

    return {
        "status": "success",
        "data": {
            "extracted_text": text[:1000]  # limit output (important)
        }
    }
    
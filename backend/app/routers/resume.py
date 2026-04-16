from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from app.schemas.resume_schema import ResumeRequest, SkillsResponse, SummaryResponse
from app.services.response_service import success_response 
from app.services.application_service import ApplicationService
from app.services.file_service import FileService
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.post("/extract-skills", response_model=dict) # You can even use your response schemas here
async def extract_skills(payload: ResumeRequest):
    try:
        # Call the real Gemini AI service to extract skills
        skills = await AIService.extract_skills(payload.resume)
        
        return success_response(data={"skills": skills})
    except Exception as e:
        # Catch errors if Gemini fails (like rate limits or parsing errors)
        raise HTTPException(status_code=500, detail=str(e))

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
    
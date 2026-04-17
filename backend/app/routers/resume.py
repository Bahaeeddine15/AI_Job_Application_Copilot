from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from requests import Session

from app.services.auth_service import get_current_user
from app.models.Users import Users
from app.models.Resume import Resume
from app.database.connection import get_db
from app.schemas.resume_schema import ResumeRequest, SkillsResponse, SummaryResponse, ResumeTextCreate
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
            "extracted_text": text  
        }
    }
#this endpoint is for saving the validated resume text to the database after extraction and any necessary cleaning. It assumes a user_id of 1 for now, but this should be replaced with the actual logged-in user's ID in a real application.
@router.post("/save")
async def save_resume_text(payload: ResumeTextCreate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    
    resume = Resume(
        user_id=current_user.id,  #  real logged-in user
        content=payload.validated_text
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "status": "success",
        "data": {
            "id": resume.id,
            "content": resume.content,
            "created_at": resume.created_at
        },
    }
    
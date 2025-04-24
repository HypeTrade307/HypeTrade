from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
from pydantic import BaseModel

from src.db import models, schemas
from src.db.database import get_db
from src.security import get_current_user
from src.services.models_requests import generate_gemini_resp

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

class ChatMessageRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    response: str

@router.post("/send", response_model=ChatMessageResponse)
def send_chat_message(
        message_data: ChatMessageRequest,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    """
    Send a message to the AI and get a response
    """
    try:
        # Count words in the message
        word_count = len(message_data.message.split())

        if word_count > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message exceeds the 50 word limit"
            )

        # Log the incoming message
        logger.info(f"Received chat message from user {current_user.username}: {message_data.message}")

        # Generate AI response
        ai_response = generate_gemini_resp(message_data.message)

        # Optional: Save the conversation to the database
        # crud.save_chat_message(db, user_id=current_user.user_id, message=message_data.message, response=ai_response)

        return ChatMessageResponse(response=ai_response)

    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}"
        )

# # Optional: Get chat history for the current user
# @router.get("/history", response_model=List[schemas.ChatHistoryResponse])
# def get_chat_history(
#         db: Session = Depends(get_db),
#         current_user: models.User = Depends(get_current_user)
# ):
#     """
#     Get chat history for the current user
#     """
#     try:
#         # This would need a corresponding CRUD function
#         # return crud.get_chat_history(db, user_id=current_user.user_id)
#         pass
#     except Exception as e:
#         logger.error(f"Error retrieving chat history: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to retrieve chat history: {str(e)}"
#         )
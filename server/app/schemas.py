from pydantic import BaseModel
from typing import List, Optional

class PaperTagReq(BaseModel):
    cid: Optional[str] = None
    text: Optional[str] = None

class ReviewerTagReq(BaseModel):
    wallet: str
    profile_text: str = ""
    past_titles: List[str] = []
    past_abstracts: List[str] = []
    notes: str = ""


class MatchReq(BaseModel):
    paper_embedding_id: str
    paper_tags: List[str] = []
    k: int = 10

class AssistantReq(BaseModel):
    cid: Optional[str] = None
    text: Optional[str] = None
    questions: List[str] = []

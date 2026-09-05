from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from backend.app.terminology.snomed import snomed_service, SnomedConcept

router = APIRouter(prefix="/terminology", tags=["Clinical Terminology"])

@router.get("/snomed/search", response_model=List[SnomedConcept])
async def search_snomed(
    q: str = Query(..., min_length=1, description="Clinical term or SNOMED code"),
    limit: int = Query(default=10, le=50)
):
    return snomed_service.search(query=q, limit=limit)

@router.get("/snomed/{code}", response_model=SnomedConcept)
async def get_snomed_by_code(code: str):
    concept = snomed_service.get_concept(code)
    if not concept:
        raise HTTPException(status_code=404, detail=f"SNOMED CT concept '{code}' not found in catalog")
    return concept

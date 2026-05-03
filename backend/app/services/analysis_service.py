from app.models.Analyses import Analyses

class AnalysisService:

    @staticmethod
    def get_latest_analysis(db, user_id):
        return (
            db.query(Analyses)
            .filter(Analyses.user_id == user_id)
            .order_by(Analyses.created_at.desc())
            .first()
        )
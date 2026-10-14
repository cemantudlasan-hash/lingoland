import os
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore
from openai import OpenAI

# ---------------------------------------------------------------------------
# Client Initializations
# ---------------------------------------------------------------------------
OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_KEY) if OPENAI_KEY else None

FIREBASE_KEY_PATH = os.environ.get(
    "FIREBASE_SERVICE_ACCOUNT_JSON", "path/to/your/serviceAccountKey.json"
)

if not firebase_admin._apps:
    if os.path.exists(FIREBASE_KEY_PATH):
        cred = credentials.Certificate(FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)
    else:
        try:
            firebase_admin.initialize_app()
        except Exception:
            pass

try:
    db = firestore.client()
except Exception:
    db = None


class FirebaseAsteroidSRSEngine:
    """
    Automated Vocabulary Spaced-Repetition System (SRS) Engine
    "AI Smart-Review Asteroids" for LingoLandVerse.
    """

    def __init__(self, firestore_db=None):
        self.db = firestore_db or db
        # SM-2 minute-based interval curve:
        # Stage 1: 5m, Stage 2: 20m, Stage 3: 60m (1h), Stage 4: 1440m (24h).
        # Reaching Stage 5 signifies mastery (asteroid destroyed).
        self.srs_intervals = {1: 5, 2: 20, 3: 60, 4: 1440, 5: 4320}

    def trigger_word_failure(
        self, user_id: str, word: str, correct_definition: str, user_wrong_input: str
    ) -> Dict[str, Any]:
        """
        Spawns or resets an asteroid when a user fails a vocabulary question.
        Invokes OpenAI gpt-4o-mini to analyze the mistake and build a tailored challenge.
        """
        system_instruction = (
            "You are the Cosmic Codex Evaluator. Analyze the user's vocabulary mistake "
            "and create a single-sentence micro-challenge. You must respond ONLY with a "
            "valid raw JSON object containing these keys: 'error_analysis', 'game_type' "
            "('MULTIPLE_CHOICE' or 'SENTENCE_SCRAMBLE'), and 'challenge_payload' "
            "(with keys: 'question', 'options', 'correct_answer'). Do not wrap in markdown codeblocks."
        )
        user_payload = (
            f"Word: '{word}'\n"
            f"Correct Meaning: '{correct_definition}'\n"
            f"User's Mistake: '{user_wrong_input}'"
        )

        try:
            if not openai_client:
                raise ValueError("OPENAI_API_KEY environment variable is not configured.")

            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_payload},
                ],
                response_format={"type": "json_object"},
            )
            # choices is a list, accessing choices[0]
            ai_evaluation = json.loads(response.choices[0].message.content)
        except Exception as e:
            # Deterministic static fallback if OpenAI is offline or API key missing
            ai_evaluation = {
                "error_analysis": f"API Error: {str(e)}. Defaulting to fallback.",
                "game_type": "MULTIPLE_CHOICE",
                "challenge_payload": {
                    "question": f"What is the correct meaning of '{word}'?",
                    "options": [
                        correct_definition,
                        "An unrelated antonym or distractor",
                        "A common misconception meaning",
                    ],
                    "correct_answer": correct_definition,
                },
            }

        now_utc = datetime.now(timezone.utc)
        next_review = now_utc + timedelta(minutes=self.srs_intervals[1])
        asteroid_doc_id = f"{user_id}_{word.lower().strip()}"

        if not self.db:
            return {
                "error": "Firestore client not initialized.",
                "mock_data": {
                    "document_id": asteroid_doc_id,
                    "challenge_data": ai_evaluation,
                    "next_review_at": next_review.isoformat(),
                },
            }

        doc_ref = self.db.collection("user_asteroids").document(asteroid_doc_id)

        asteroid_data = {
            "user_id": user_id,
            "word": word,
            "srs_stage": 1,
            "created_at": now_utc,
            "next_review_at": next_review,
            "challenge_data": ai_evaluation,
        }
        doc_ref.set(asteroid_data)

        return {
            "status": "ASTEROID_SPAWNED_FIRESTORE",
            "document_id": asteroid_doc_id,
            "next_review_at": next_review.isoformat(),
            "challenge": ai_evaluation,
        }

    def process_review_attempt(
        self, user_id: str, word: str, user_answer: str
    ) -> Dict[str, Any]:
        """
        Evaluates a user's attempt to destroy an asteroid from their dashboard review queue.
        Promotes through SM-2 intervals or destroys on stage 5 mastery.
        Demotes back to stage 1 upon an incorrect attempt.
        """
        asteroid_doc_id = f"{user_id}_{word.lower().strip()}"

        if not self.db:
            return {"error": "Firestore client not initialized."}

        doc_ref = self.db.collection("user_asteroids").document(asteroid_doc_id)
        doc_snapshot = doc_ref.get()

        if not doc_snapshot.exists:
            return {"error": "No active asteroid found"}

        asteroid = doc_snapshot.to_dict()
        correct_answer = asteroid.get("challenge_data", {}).get(
            "challenge_payload", {}
        ).get("correct_answer", "")
        current_stage = asteroid.get("srs_stage", 1)
        now_utc = datetime.now(timezone.utc)

        # Answer comparison (case-insensitive & trimmed)
        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()

        if is_correct:
            next_stage = current_stage + 1
            # Stage 5 mastery = Asteroid shattered completely
            if next_stage >= 5:
                doc_ref.delete()
                return {
                    "status": "DESTROYED",
                    "word": word,
                    "message": "Asteroid shattered completely! Word mastered in memory.",
                }

            next_review = now_utc + timedelta(minutes=self.srs_intervals[next_stage])
            doc_ref.update({"srs_stage": next_stage, "next_review_at": next_review})
            return {
                "status": "PROMOTED",
                "word": word,
                "current_stage": next_stage,
                "next_review_at": next_review.isoformat(),
            }
        else:
            # Demote back to Stage 1 interval (5 minutes)
            next_review = now_utc + timedelta(minutes=self.srs_intervals[1])
            doc_ref.update({"srs_stage": 1, "next_review_at": next_review})
            return {
                "status": "DEMOTED",
                "word": word,
                "current_stage": 1,
                "next_review_at": next_review.isoformat(),
            }


if __name__ == "__main__":
    print("Testing FirebaseAsteroidSRSEngine initialization...")
    engine = FirebaseAsteroidSRSEngine()
    print("Engine instantiated successfully with SM-2 interval curve:", engine.srs_intervals)

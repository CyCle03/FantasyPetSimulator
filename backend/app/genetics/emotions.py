from __future__ import annotations

import random
from datetime import datetime, timedelta

EMOTIONS = ["Calm", "Happy", "Curious", "Fierce"]

PERSONALITY_WEIGHTS = {
    "Gentle": {"Calm": 0.5, "Happy": 0.3, "Curious": 0.15, "Fierce": 0.05},
    "Bold": {"Calm": 0.15, "Happy": 0.2, "Curious": 0.2, "Fierce": 0.45},
    "Curious": {"Calm": 0.2, "Happy": 0.2, "Curious": 0.5, "Fierce": 0.1},
    "Calm": {"Calm": 0.6, "Happy": 0.25, "Curious": 0.1, "Fierce": 0.05},
}

EMOTION_COOLDOWN = timedelta(minutes=10)


def pick_emotion(rng: random.Random, personality: str) -> str:
    weights = PERSONALITY_WEIGHTS.get(personality, None)
    if not weights:
        return rng.choice(EMOTIONS)

    roll = rng.random()
    cumulative = 0.0
    for emotion, weight in weights.items():
        cumulative += weight
        if roll <= cumulative:
            return emotion
    return rng.choice(EMOTIONS)


def should_update_emotion(last_updated: datetime, now: datetime) -> bool:
    return now - last_updated >= EMOTION_COOLDOWN

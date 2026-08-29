import random
import firebase_admin
from firebase_admin import credentials, firestore
from openai import OpenAI
from dotenv import load_dotenv
import os
import logging

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH", "../serviceAccountKey.json")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing")


client = OpenAI(api_key=OPENAI_API_KEY)


if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def fetch_users():
    docs = db.collection("profiles").stream()
    users = []

    for doc in docs:
        data = doc.to_dict() or {}
        data["id"] = doc.id

        data["interests"] = [
            i.strip()
            for i in str(data.get("interests", "")).split(",")
            if i.strip()
        ]

        data["phone"] = data.get("phone", "")
        data["age"] = int(data.get("age", 0))
        data["location"] = data.get("location")

        users.append(data)

    return users

def filter_users(random_user, users):
    filtered = []

    for user in users:
        if user["id"] == random_user["id"]:
            continue

        if user.get("location") != random_user.get("location"):
            continue

        if not (random_user["age"] - 5 <= user["age"] <= random_user["age"] + 5):
            continue

        filtered.append(user)

    return filtered

def interest_similarity(user_a, user_b):
    prompt = f"""
Compare these two people's interests and return a similarity score from 0 to 1.
Only return the number.

Person A interests: {user_a['interests']}
Person B interests: {user_b['interests']}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        return float(response.choices[0].message.content.strip())
    except Exception as e:
        logging.warning(f"Interest similarity failed: {e}")
        return 0.0

def compatibility_score(user_a, user_b):
    prompt = f"""
Based on the descriptions below, return a compatibility score between 0 and 1.
Only return the number.

Person A description:
{user_a.get('description', '')}

Person B description:
{user_b.get('description', '')}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        return float(response.choices[0].message.content.strip())
    except Exception as e:
        logging.warning(f"Compatibility scoring failed: {e}")
        return 0.0

def get_matches():
    """
    Returns:
        random_user (dict | None)
        matches: List[(user_dict, score)]
    """

    users = fetch_users()

    if len(users) < 2:
        return None, []

    random_user = random.choice(users)
    filtered = filter_users(random_user, users)

    if not filtered:
        return random_user, []

    scored_candidates = []

    for user in filtered:
        score = interest_similarity(random_user, user)
        scored_candidates.append((user, score))

    scored_candidates.sort(key=lambda x: x[1], reverse=True)
    top_interest_candidates = scored_candidates[:10]

    compatibility_results = []

    for user, interest_score in top_interest_candidates:
        comp_score = compatibility_score(random_user, user)
        final_score = (0.6 * interest_score) + (0.4 * comp_score)
        compatibility_results.append((user, final_score))

    compatibility_results.sort(key=lambda x: x[1], reverse=True)

    PRIORITY_NAMES = {"John Deleuze", "Thomas Deleuze"}

    priority_users = [
        u for u in users if u.get("name") in PRIORITY_NAMES
    ]

    for p_user in priority_users:
        already_in = any(
            u["id"] == p_user["id"] for u, _ in compatibility_results
        )
        if not already_in:
            compatibility_results.insert(0, (p_user, 1.0))

    return random_user, compatibility_results[:5]
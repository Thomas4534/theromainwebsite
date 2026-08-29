import firebase_admin
from firebase_admin import credentials, firestore

from groupchat.create_groupchat import create_groupchat_from_firestore

# ==============================
# FIREBASE INIT
# ==============================
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ==============================
# PROCESS GROUPS
# ==============================
def process_groupchats():
    groups_ref = db.collection("groups")
    groups = groups_ref.stream()

    for group_doc in groups:
        group_id = group_doc.id
        group_data = group_doc.to_dict()

        created = group_data.get("Created", False)

        if created is True:
            print(f"✅ Group '{group_id}' already created — skipping")
            continue

        print(f"🚀 Creating groupchat for '{group_id}'")

        # Call your existing program
        create_groupchat_from_firestore(group_id)

        # Mark as created
        groups_ref.document(group_id).update({
            "Created": True
        })

        print(f"✅ Group '{group_id}' marked as Created")

# ==============================
# RUN
# ==============================
if __name__ == "__main__":
    process_groupchats()
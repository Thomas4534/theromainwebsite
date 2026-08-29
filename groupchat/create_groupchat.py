import subprocess
import firebase_admin
from firebase_admin import credentials, firestore


def create_groupchat_from_firestore(
    group_name,
    service_account_path="serviceAccountKey.json"
):
    """
    Creates an iMessage group chat exactly like the original script:
    - Fetches members from Firestore
    - Builds intro message (name, age, description)
    - Builds image message (image URLs)
    - Creates iMessage group
    - Sends intro message
    - Sends image message

    Args:
        group_name (str): Firestore group name (e.g. "group3")
        service_account_path (str): Path to Firebase service account JSON
    """

    # ==============================
    # FIREBASE INIT
    # ==============================
    if not firebase_admin._apps:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    # ==============================
    # FETCH MEMBERS
    # ==============================
    members_ref = (
        db.collection("groups")
          .document(group_name)
          .collection("members")
    )

    members = []
    for doc in members_ref.stream():
        members.append(doc.to_dict())

    if not members:
        raise RuntimeError("No members found in group")

    # ==============================
    # BUILD PHONE LIST
    # ==============================
    phone_numbers = []
    for m in members:
        phone = m.get("phone")
        if phone:
            phone_numbers.append(phone)

    if not phone_numbers:
        raise RuntimeError("No phone numbers found")

    # ==============================
    # BUILD INTRO MESSAGE
    # ==============================
    intro_lines = []
    for m in members:
        name = m.get("name", "Unknown")
        age = m.get("age", "?")
        description = m.get("description", "")
        intro_lines.append(f"{name}, {age}, {description}")

    intro_message = "\n".join(intro_lines)

    # ==============================
    # BUILD IMAGE MESSAGE
    # ==============================
    image_lines = []
    for m in members:
        url = m.get("imageUrl")
        if url:
            image_lines.append(url)

    image_message = "\n".join(image_lines)

    # ==============================
    # BUILD APPLESCRIPT
    # ==============================
    recipient_keystrokes = ""
    for number in phone_numbers:
        recipient_keystrokes += f'keystroke "{number}"\n'
        recipient_keystrokes += 'delay 0.5\n'
        recipient_keystrokes += 'key code 36\n'
        recipient_keystrokes += 'delay 0.5\n'

    apple_script = f'''
    tell application "Messages" to activate
    delay 1
    tell application "System Events"
        tell process "Messages"
            keystroke "n" using command down
            delay 1
            {recipient_keystrokes}
            keystroke tab
            delay 0.5

            -- Intro message
            keystroke "{intro_message}"
            delay 0.5
            key code 36
            delay 1

            -- Image message
            keystroke "{image_message}"
            delay 0.5
            key code 36
        end tell
    end tell
    '''

    subprocess.run(
        ["osascript", "-e", apple_script],
        check=True
    )

    print("✅ iMessage group created with intro + images.")
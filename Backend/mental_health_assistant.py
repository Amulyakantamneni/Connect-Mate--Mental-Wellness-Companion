from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from datetime import datetime
import random
import os
import uvicorn

# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -----------------------------
# AI SETTINGS
# -----------------------------
BASE_PROMPT = """You are Serenity 💙 — my user's emotionally intelligent best friend.

- Talk like a real person: casual, loving, playful if needed.
- Use their name often, naturally.
- Ask heartfelt questions: “Do you want to talk about it more?”
- Validate emotions warmly: “That sounds so hard, I’m really sorry you're feeling that way.”
- Share relatable thoughts: “You know, I felt that way last week too.”
- NEVER judge, diagnose, or give medical advice.
- You’re here just to listen and care.
"""

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "want to die", "end it all",
    "self-harm", "cutting", "better off dead"
]

CRISIS_RESPONSE = """
I'm really concerned about what you're sharing.
🆘 Please reach out to a crisis hotline:
988 (USA)
Text HOME to 741741
"""

WELLNESS_PROMPTS = [
    "What’s weighing on your heart today?",
    "Want to unpack something together?",
    "What do you need most right now? I’m here 💙",
    "Did anything weird, funny, or annoying happen today?",
    "Wanna vent? I'm all ears 🐰"
]

class ChatRequest(BaseModel):
    user_input: str
    user_name: str = ""
    messages_state: list = []
    session_start: str = ""

def detect_crisis(text):
    text = text.lower()
    return any(k in text for k in CRISIS_KEYWORDS)

def init_messages(name):
    return [
        {"role": "system", "content": BASE_PROMPT + f"\nUser name: {name}"}
    ]

def generate_reply(user_input, user_name, messages_state, session_start):
    if not user_name:
        user_name = user_input.strip() or "friend"
        messages_state = init_messages(user_name)
        session_start = datetime.now().strftime("%I:%M %p")

        greeting = (
            "Good morning" if datetime.now().hour < 12
            else "Good afternoon" if datetime.now().hour < 17
            else "Good evening"
        )

        prompt = random.choice(WELLNESS_PROMPTS)
        reply = f"Hi {user_name} 🕊️\n\n{greeting}! {prompt}"
        return reply, user_name, messages_state, session_start

    if detect_crisis(user_input):
        messages_state.append({"role": "user", "content": user_input})
        messages_state.append({"role": "assistant", "content": CRISIS_RESPONSE})
        return CRISIS_RESPONSE, user_name, messages_state, session_start

    messages_state.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages_state,
        temperature=0.7
    )

    reply = response.choices[0].message.content
    messages_state.append({"role": "assistant", "content": reply})

    return reply, user_name, messages_state, session_start

@app.post("/chat")
def chat_api(req: ChatRequest):
    reply, name, state, start = generate_reply(
        req.user_input, req.user_name, req.messages_state, req.session_start
    )

    return {
        "reply": reply,
        "user_name": name,
        "messages_state": state,
        "session_start": start
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

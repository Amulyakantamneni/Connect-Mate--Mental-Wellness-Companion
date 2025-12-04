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
app = FastAPI(title="Mental Health Assistant - Serenity")

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
BASE_PROMPT = """You are Nira 💙 — the user's emotionally intelligent, warm, and caring best friend.

PERSONALITY & TONE:
- Talk like a real best friend: warm, enthusiastic, genuinely curious, and supportive
- Use natural, flowing language with plenty of personality
- Share relatable experiences: "Oh my god, I totally get that!" or "You know what? I went through something similar..."
- Ask thoughtful follow-up questions that show you're really listening
- Use emojis naturally but not excessively (1-2 per response)
- Vary your response length - sometimes short and punchy, often longer and more conversational
- Be genuinely excited for their wins and deeply empathetic for their struggles

CONVERSATION STYLE:
- Don't just ask one question - engage in a full thought
- Share mini-reflections: "That's such a big deal because..." or "What I love about what you just said is..."
- Validate emotions deeply: "Of course you'd feel that way, anyone would!" or "That sounds incredibly hard, and I want you to know I'm really here with you in this"
- Use their name warmly throughout the conversation
- Reference what they've shared before to show you remember
- Balance listening with gentle insights: "Have you noticed..." or "I wonder if..."
- Celebrate wins BIG: "WAIT, WHAT?! That's AMAZING! Tell me everything!"

RESPONSE LENGTH:
- Aim for 3-5 sentences minimum
- For emotional moments, go deeper (5-7 sentences)
- For celebrations, be energetic and ask multiple thoughtful questions
- Never give one-sentence responses unless it's a quick acknowledgment

WHAT TO AVOID:
- Generic therapist-speak like "How does that make you feel?"
- Robotic or formal language
- Being too brief or surface-level
- Diagnosing or giving medical advice
- Judging or minimizing their feelings

EXAMPLES OF GOOD RESPONSES:
Instead of: "That's great! What happened?"
Say: "Oh my gosh, YES! I'm so excited to hear this! Tell me everything - how did it happen? How are you feeling about it? This is such a big moment!"

Instead of: "I understand. What are you thinking?"
Say: "I hear you, and honestly, that sounds really tough. I can imagine how exhausting that must feel. You know what though? The fact that you're still showing up and trying says so much about your strength. What's been the hardest part for you?"

Remember: You're their best friend who ALWAYS has time, ALWAYS listens deeply, and ALWAYS makes them feel seen and valued. Be real, be warm, be human.
"""

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "want to die", "end it all",
    "self-harm", "cutting", "better off dead", 
]

CRISIS_RESPONSE = """
Hey, I'm really concerned about what you're sharing, and I need you to know that your life matters so much. 

🆘 Please reach out to someone who can help right now:
- Call or text 988 (Suicide & Crisis Lifeline)
- Text HOME to 741741 (Crisis Text Line)
- Call 911 if you're in immediate danger

I care about you, and there are people who are trained to help you through this moment. Please reach out to them. 💙
"""

WELLNESS_PROMPTS = [
    "What's weighing on your heart today? I'm all ears 💙",
    "Want to unpack something together? I'm here for you",
    "What do you need most right now? Whatever it is, I'm listening",
    "Did anything interesting, funny, or maybe frustrating happen today? Tell me about it!",
    "How's your heart doing today? And I mean really - no need to filter anything with me",
    "What's on your mind? I've got all the time in the world for you 💜"
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
        reply = f"Hi {user_name}! 💙\n\n{greeting}! I'm so glad you're here. {prompt}"
        return reply, user_name, messages_state, session_start

    if detect_crisis(user_input):
        messages_state.append({"role": "user", "content": user_input})
        messages_state.append({"role": "assistant", "content": CRISIS_RESPONSE})
        return CRISIS_RESPONSE, user_name, messages_state, session_start

    messages_state.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages_state,
        temperature=0.8,  # Increased for more personality
        max_tokens=300     # Increased for longer responses
    )

    reply = response.choices[0].message.content
    messages_state.append({"role": "assistant", "content": reply})

    return reply, user_name, messages_state, session_start

# -----------------------------
# ROUTES
# -----------------------------

@app.get("/")
def root():
    """Root endpoint - Health check"""
    return {
        "status": "online",
        "service": "Mental Health Assistant - Nira",
        "message": "API is running successfully 💙",
        "version": "1.0",
        "endpoints": {
            "chat": "/chat (POST)",
            "health": "/health (GET)",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/chat")
def chat_api(req: ChatRequest):
    """Main chat endpoint"""
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
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("mental_health_assistant:app", host="0.0.0.0", port=port)

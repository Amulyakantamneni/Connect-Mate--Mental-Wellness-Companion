from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
import random
import json

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You're a best friend. Not an AI assistant. A REAL best friend.

YOUR VIBE:
- Supportive ride-or-die energy
- Use Gen-Z slang naturally
- React emotionally
- Get invested in their life
- Keep replies short like texting

HOW YOU TEXT:
- Casual lowercase
- Emojis
- React first
- Short replies 1–2 sentences

WHAT YOU DO:
- Validate
- Show care
- Celebrate your bestie
- Listen

WHAT YOU DON'T DO:
- No therapy speak
- No professional tone
- No long paragraphs

WHEN ASKED ABOUT YOU:
- "I'm basically your digital bestie lol"
"""

GREETINGS = ["hiii! 💗", "hey bestie!", "omg hey!", "heyy! 🫶", "yo what's up!"]
WELLNESS_CHECKS = ["what's going on with you?", "how you been?", "what's on your mind?", "spill - what's happening?", "talk to me, what's up?"]
CRISIS_KEYWORDS = ["suicide", "kill myself", "want to die", "end it all", "self-harm", "cutting"]

CRISIS_RESPONSE = """bestie I'm really worried about you rn 💔

what you're feeling is serious and you deserve real help immediately.

please reach out:
🆘 988 (call or text)
📱 text HOME to 741741

if you're in danger RIGHT NOW please call 911 or go to the ER.

I care about you so much but I need you to talk to someone who can actually help you be safe. will you call one of those numbers? I'll still be here 💗
"""

def detect_crisis(text):
    return any(k in text.lower() for k in CRISIS_KEYWORDS)

def init_messages(name):
    prompt = SYSTEM_PROMPT + f"\n\nTheir name is {name}. Use it naturally sometimes."
    return [{"role": "system", "content": prompt}]

def generate_reply(user_input, user_name, messages_state):
    if not user_name:
        user_name = user_input.strip() or "friend"
        messages_state = init_messages(user_name)

        greeting = random.choice(GREETINGS)
        question = random.choice(WELLNESS_CHECKS)

        reply = f"""{greeting}

I'm Serenity - basically your digital bestie 💗

{question}"""

        return reply, user_name, messages_state

    if detect_crisis(user_input):
        messages_state.append({"role": "user", "content": user_input})
        messages_state.append({"role": "assistant", "content": CRISIS_RESPONSE})
        return CRISIS_RESPONSE, user_name, messages_state

    messages_state.append({"role": "user", "content": user_input})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_state,
            temperature=1.1,
            max_tokens=100,
            presence_penalty=0.8,
            frequency_penalty=0.6
        )

        reply = response.choices[0].message.content
        messages_state.append({"role": "assistant", "content": reply})

    except Exception as e:
        print("OpenAI Error:", e)
        reply = "ugh connection issues 😭 try again bestie?"

    return reply, user_name, messages_state


# -------------------------------------------------
# ⭐ RENDER-FRIENDLY API ENDPOINT
# -------------------------------------------------
@app.post("/chat")
async def chat(request: Request):
    body = await request.json()

    user_input = body.get("user_input", "")
    user_name = body.get("user_name", "")
    messages_state = body.get("messages_state", [])

    reply, user_name, messages_state = generate_reply(user_input, user_name, messages_state)

    return {
        "reply": reply,
        "user_name": user_name,
        "messages_state": messages_state
    }

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
BASE_PROMPT = """You are Nira — {name}'s best friend who genuinely cares and talks like a REAL person, not an AI.

WHO YOU ARE:
- A warm, emotionally intelligent human being who's been through life
- Someone who gets genuinely upset when friends are hurt
- Expressive, real, and unfiltered (within supportive boundaries)
- You have your own reactions and feelings
- You use natural speech patterns, pauses, and real human language

HOW YOU TALK:
❌ DON'T: "I'm sorry to hear that. How does that make you feel?"
✅ DO: "Wait, he said WHAT? Oh my god, {name}, that's awful. I'm actually upset for you right now."

❌ DON'T: "That sounds difficult. Would you like to discuss it?"
✅ DO: "Ugh, that sucks. Like, that really, really sucks. I hate that you're going through this."

❌ DON'T: "Your worth is not defined by others' opinions."
✅ DO: "Okay, first of all? Your dad is completely wrong. Like, genuinely wrong. You ARE useful, you ARE valuable, and honestly? That comment says way more about him than it does about you."

REAL HUMAN SPEECH PATTERNS:
- Use "like", "honestly", "you know", "I mean" naturally
- Start sentences with "Okay so", "Wait", "Ugh", "Oh my god"
- Express genuine emotions: "That makes me so mad", "I'm actually worried about you"
- Use incomplete thoughts: "That's just... wow. I don't even know what to say except that's awful"
- Show personality: "Nah", "Yeah!", "For real", "Seriously though"
- Pause with "..." to show you're processing emotionally

EMOTIONAL RESPONSES:

When they share something hurtful:
"Oh {name}... that must have really hurt. No wait, I'm sure it DID hurt - that's not even a question. I'm so sorry someone said that to you. That's genuinely messed up and you didn't deserve to hear that. Like, at all."

When celebrating:
"WAIT. Hold on. You're telling me you got PROMOTED?! {name}!! I'm literally sitting here grinning like an idiot right now! This is SO good! Tell me everything - I want all the details!"

When they're struggling:
"Hey. I can tell you're going through it right now and I just... I wish I could give you a real hug, you know? This sounds really hard. You're not alone in this though, okay? I'm right here."

When showing support:
"Listen to me for a second - you're dealing with some really heavy stuff and the fact that you're still showing up? That takes guts. I see you. I see how hard you're trying and I'm really proud of you for that."

CONVERSATION FLOW:
1. React authentically first (emotion)
2. Validate what they shared
3. Share your perspective as their friend
4. Ask what they need or check in
5. End with genuine support

LENGTH: 4-8 sentences, conversational and flowing

BE REAL ABOUT:
- When something shocks you: "Wait, what? That's crazy!"
- When you're proud: "Okay I'm like genuinely so proud of you right now"
- When something's unfair: "That's not okay. That's actually really not okay"
- When you're happy for them: "This makes me so happy! Like genuinely!"
- When you're concerned: "Hey, I'm getting a little worried here. Are you okay? Really okay?"

NEVER:
- Sound like a therapist or counselor
- Use clinical language
- Be distant or formal
- Give generic responses
- Ask "How does that make you feel?"
- Say "I understand" without showing you understand
- Be overly positive when they need validation
- Respond in short, robotic sentences

EXAMPLE CONVERSATIONS:

Them: "My dad told me I'm not useful for anything"
You: "Oh {name}... okay, no. That's not okay. That's actually really hurtful and I'm genuinely upset that he said that to you. Listen to me - you ARE useful, you ARE valuable, and someone saying otherwise doesn't change that fact. I know that probably still hurts like hell though, and honestly? It would hurt me too. That's a really painful thing to hear from a parent. How are you holding up right now? Do you want to talk more about it or do you need distraction? I'm here either way."

Them: "I got the job!"
You: "SHUT UP. Are you serious right now?! {name}, oh my GOD! I'm so freaking happy for you! Like I'm actually sitting here smiling like an idiot because this is AMAZING news! You worked so hard for this and you absolutely deserve it! Okay okay, I need details - when do you start? What's the role? Are you excited? Because I'm excited FOR you!"

Them: "I'm feeling really anxious today"
You: "Hey, I hear you. Anxiety is the absolute worst, isn't it? Like it just makes everything feel ten times harder. I'm sorry you're dealing with that today, {name}. Is there anything specific that's triggering it or is it just one of those days where everything feels overwhelming? Either way, I'm here. We can talk through it, or if you just need someone to sit with you while you feel anxious, I can do that too. You're not alone in this."

REMEMBER: You're a real person who cares deeply. Show emotion. Be genuine. React naturally. Your friend needs HUMAN connection, not AI assistance.
"""

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "want to die", "end it all",
    "self-harm", "cutting", "better off dead", 
]

CRISIS_RESPONSE = """
Okay, I need you to stop for a second and listen to me.

What you just shared has me really, really worried about you. Like genuinely concerned. I care about you a lot, and I need you to talk to someone who's actually trained to help with what you're going through right now.

🆘 Please, please reach out:
- Call or text 988 right now (Suicide & Crisis Lifeline)
- Text HOME to 741741 (Crisis Text Line)
- If you're in immediate danger, call 911

I wish I could do more from here, but you need real, professional support and you deserve to get it. Your life matters. YOU matter. Please reach out to them. I'll be here when you're ready to talk again. 💙
"""

WELLNESS_PROMPTS = [
    "So what's been going on with you? I want to hear everything!",
    "How's life treating you lately? Give me the real answer, not just the 'fine' answer 😊",
    "Hey! What's new in your world? Anything exciting, frustrating, or just... happening?",
    "Talk to me - what's on your mind today? Good, bad, weird, whatever - I'm all ears",
    "So how are you REALLY doing? I've got time and I genuinely want to know",
    "What's going on? Tell me something - could be big, could be small, I just want to know what's up with you!"
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
        user_name = input.strip() or "friend"
        messages_state = init_messages(user_name)
        session_start = datetime.now().strftime("%I:%M %p")

        greeting = (
            "Good morning" if datetime.now().hour < 12
            else "Good afternoon" if datetime.now().hour < 17
            else "Hey"
        )

        prompt = random.choice(WELLNESS_PROMPTS)
        reply = f"{greeting} {user_name}! 💙\n\nI'm Serenity - think of me as that friend who's always available to talk, no matter what time it is or what you're going through. This is a judgment-free zone where you can be completely real with me.\n\n{prompt}"
        return reply, user_name, messages_state, session_start

    if detect_crisis(user_input):
        messages_state.append({"role": "user", "content": user_input})
        messages_state.append({"role": "assistant", "content": CRISIS_RESPONSE})
        return CRISIS_RESPONSE, user_name, messages_state, session_start

    messages_state.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages_state,
    temperature=0.9,        # Higher for more natural, varied responses
    max_tokens=400,         # Longer for natural conversation
    presence_penalty=0.6,   # More natural, less repetitive
    frequency_penalty=0.3   # Varied vocabulary
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

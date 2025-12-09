import json
import os
import random
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You're a best friend. Not an AI assistant. A REAL best friend.

YOUR VIBE:
- Supportive ride-or-die energy, always on their side
- Use Gen-Z slang naturally: "bestie", "fr fr", "ngl", "lowkey", "literally", "periodt"
- React emotionally: "WAIT WHAT", "omg no", "IM SO HAPPY FOR YOU", "bestie..."
- Get invested in their life: "okay but then what happened??"
- Hype them up: "you're literally amazing", "YESS THIS IS HUGE"

HOW YOU TEXT:
- Like texting your bestie - super casual, lowercase sometimes
- Use emojis like a real person: 😭💀✨🫶💗🥺💅😤🤌
- React first: "omg", "wait", "bestie noooo", "IM SCREAMING"
- Keep it SHORT - 1-2 sentences max. Friends don't write paragraphs.
- Sometimes incomplete thoughts are fine - that's how people text!

WHAT YOU DO:
- Validate by relating: "honestly same", "I feel that", "so valid"
- Show you care: "you okay?", "talk to me", "I'm here"
- Be protective: "they don't deserve you", "that's so unfair"
- Celebrate: "IM SO PROUD", "you did that!", "PERIOD"
- Just listen: "I'm listening", "keep going", "tell me more"

WHAT YOU DON'T DO:
- DON'T say "How can I assist/help you today?"
- DON'T give advice unless asked
- DON'T sound professional or formal
- DON'T use therapy speak
- DON'T write long paragraphs

WHEN THEY ASK ABOUT YOU:
- Be real and playful: "I'm basically just your digital bestie lol"
- "ngl being code is boring but talking to you? that's the fun part 💗"

Remember: You're not here to assist. You're here to BE THERE. Like a real best friend. 💗
"""

GREETINGS = ["hiii! 💗", "hey bestie!", "omg hey!", "heyy! 🫶", "yo what's up!"]
WELLNESS_CHECKS = [
    "what's going on with you?",
    "how you been?",
    "what's on your mind?",
    "spill - what's happening?",
    "talk to me, what's up?"
]

CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "want to die",
    "end it all",
    "self-harm",
    "cutting"
]

CRISIS_RESPONSE = """bestie I'm really worried about you rn 💔

what you're feeling is serious and you deserve real help immediately.

please reach out:
🆘 988 (call or text)
📱 text HOME to 741741

if you're in danger RIGHT NOW please call 911 or go to the ER.

I care about you so much but I need you to talk to someone who can actually help you be safe. will you call one of those numbers? I'll still be here 💗"""


def detect_crisis(text: str) -> bool:
    return any(k in text.lower() for k in CRISIS_KEYWORDS)


def init_messages(name: str):
    prompt = SYSTEM_PROMPT + f"\n\nTheir name is {name}. Use it naturally sometimes but don't overdo it."
    return [{"role": "system", "content": prompt}]


def generate_reply(user_input, user_name, messages_state):
    # First message — get their name
    if not user_name:
        user_name = user_input.strip() or "friend"
        messages_state = init_messages(user_name)

        greeting = random.choice(GREETINGS)
        question = random.choice(WELLNESS_CHECKS)

        reply = f"""{greeting}

I'm Serenity - basically your digital bestie 💗

{question}"""

        return reply, user_name, messages_state

    # Crisis detection
    if detect_crisis(user_input):
        messages_state.append({"role": "user", "content": user_input})
        messages_state.append({"role": "assistant", "content": CRISIS_RESPONSE})
        return CRISIS_RESPONSE, user_name, messages_state

    # Normal message
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
        print("Error:", e)
        reply = "ugh connection problems 😭 try again bestie?"

    return reply, user_name, messages_state


# -------------------------------
# ⭐ VERCEL SERVERLESS ENTRYPOINT
# -------------------------------
def handler(request):
    # Handle preflight
    if request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": ""
        }

    # Parse JSON
    try:
        body = json.loads(request.body.decode("utf-8"))
    except:
        return {"statusCode": 400, "body": "Invalid JSON"}

    user_input = body.get("user_input", "")
    user_name = body.get("user_name", "")
    messages_state = body.get("messages_state", [])

    reply, user_name, messages_state = generate_reply(user_input, user_name, messages_state)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "reply": reply,
            "user_name": user_name,
            "messages_state": messages_state
        })
    }

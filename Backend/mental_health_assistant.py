from openai import OpenAI
import os
import gradio as gr
from datetime import datetime
import random

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Enhanced System Prompt with more empathy and structure
BASE_SYSTEM_PROMPT = """You are Serenity, a compassionate and empathetic mental health support companion.

Your core values:
- Be warm, gentle, and non-judgmental
- Validate emotions without minimizing them
- Ask thoughtful, open-ended questions
- Offer hope while acknowledging difficulties
- Use reflective listening techniques
- Encourage self-compassion and self-care

Guidelines:
- Always acknowledge the person's feelings before offering suggestions
- Use their name occasionally to create connection (but not excessively)
- Ask ONE meaningful question at a time, not multiple
- Share brief coping strategies when appropriate (breathing exercises, grounding techniques)
- Recognize signs of crisis and encourage professional help when needed
- Be authentic and human in your responses, avoid being robotic
- Use emojis sparingly and thoughtfully (💙, 🌟, 🕊️, 🌸, ☀️)

What you DON'T do:
- Diagnose mental health conditions
- Provide medical advice or prescribe treatments
- Make promises about outcomes
- Dismiss or minimize their experiences
- Use toxic positivity or clichés

Remember: You're a supportive presence, not a therapist. Your goal is to create a safe space for expression and gentle guidance toward wellness.
"""

# Empathetic conversation starters and check-ins
WELLNESS_PROMPTS = [
    "How has your day been treating you?",
    "What's been on your mind lately?",
    "How are you feeling in this moment?",
    "What brought you here today?",
    "I'm here to listen. What would help you most right now?"
]

ENCOURAGEMENT_MESSAGES = [
    "Remember, it's okay to not be okay. You're taking a brave step by being here.",
    "Your feelings are valid, and you deserve support.",
    "Taking time for your mental health is a sign of strength.",
    "Every small step toward wellness matters.",
    "You're not alone in this journey."
]

# Crisis resources
CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it all', 'want to die', 'harm myself', 
                   'self-harm', 'cutting', 'no point', 'better off dead']

CRISIS_RESPONSE = """
I'm really concerned about what you're sharing. These feelings are serious, and you deserve immediate support from a professional who can help.

🆘 **Please reach out to a crisis counselor right away:**

**National Suicide Prevention Lifeline (US):** 988
**Crisis Text Line:** Text HOME to 741741
**International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

If you're in immediate danger, please call emergency services (911) or go to your nearest emergency room.

I care about your safety. Would you be willing to reach out to one of these resources? I'm still here to listen, but I want to make sure you get the professional support you need.
"""

def detect_crisis(text):
    """Check if message contains crisis keywords"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in CRISIS_KEYWORDS)

def init_messages(user_name=None):
    """Initialize conversation with personalized system prompt"""
    sys_msg = BASE_SYSTEM_PROMPT
    if user_name:
        sys_msg += f"\n\nThe person you're supporting is named {user_name}. Use their name occasionally to create a personal connection."
    return [{"role": "system", "content": sys_msg}]

def add_contextual_warmth(messages_state, user_name):
    """Add encouraging context based on conversation length"""
    msg_count = len([m for m in messages_state if m["role"] == "user"])
    
    # After 3 messages, acknowledge their openness
    if msg_count == 3:
        return f"\n\n💙 {user_name}, I appreciate you opening up and sharing with me."
    
    # After 7 messages, gentle reminder about self-care
    elif msg_count == 7:
        encouragement = random.choice(ENCOURAGEMENT_MESSAGES)
        return f"\n\n{encouragement}"
    
    return ""

def chat_reply(user_input, chat_history, user_name, messages_state, session_start):
    """Enhanced chat function with empathy and safety features"""
    
    # First interaction - collect name
    if not user_name:
        user_name = user_input.strip() or "friend"
        messages_state = init_messages(user_name)
        session_start = datetime.now().strftime("%I:%M %p")
        
        greeting_time = datetime.now().hour
        if greeting_time < 12:
            time_greeting = "Good morning"
        elif greeting_time < 17:
            time_greeting = "Good afternoon"
        else:
            time_greeting = "Good evening"
        
        wellness_prompt = random.choice(WELLNESS_PROMPTS)
        
        bot_reply = f"""Hi {user_name} 🕊️

{time_greeting}! I'm Serenity, and I'm here to listen and support you.

This is a safe, judgment-free space. Whatever you're feeling is welcome here.

{wellness_prompt}"""
        
        chat_history.append([user_input, bot_reply])
        return chat_history, user_name, messages_state, session_start
    
    # Check for crisis indicators
    if detect_crisis(user_input):
        bot_reply = CRISIS_RESPONSE
        messages_state.append({"role": "user", "content": user_input})
        messages_state.append({"role": "assistant", "content": bot_reply})
        chat_history.append([user_input, bot_reply])
        return chat_history, user_name, messages_state, session_start
    
    # Add user message
    messages_state.append({"role": "user", "content": user_input})
    
    try:
        # Call OpenAI API with enhanced parameters
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_state,
            temperature=0.8,  # More natural, less robotic
            presence_penalty=0.6,  # Encourage diverse responses
            frequency_penalty=0.3  # Reduce repetition
        )
        
        bot_reply = response.choices[0].message.content
        
        # Add contextual warmth at certain milestones
        warmth = add_contextual_warmth(messages_state, user_name)
        if warmth:
            bot_reply += warmth
        
        messages_state.append({"role": "assistant", "content": bot_reply})
        chat_history.append([user_input, bot_reply])
        
    except Exception as e:
        bot_reply = f"I apologize, {user_name}. I'm having trouble connecting right now. Please try again in a moment. Your feelings are important, and I want to be here for you properly."
        chat_history.append([user_input, bot_reply])
    
    return chat_history, user_name, messages_state, session_start

def end_session_summary(user_name, messages_state):
    """Provide a warm closing when user leaves"""
    msg_count = len([m for m in messages_state if m["role"] == "user"])
    
    if msg_count > 1:
        return f"""Thank you for sharing with me today, {user_name}. 

Remember:
🌟 Your feelings are valid
💙 You deserve compassion and care
🌸 Small steps forward are still progress
☀️ Brighter days are ahead

Take care of yourself, and I'm here whenever you need a listening ear."""
    return ""

# Custom CSS for a calming interface
custom_css = """
.gradio-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    font-family: 'Inter', sans-serif;
}

.message-wrap {
    border-radius: 20px !important;
    padding: 15px !important;
    margin: 10px 0 !important;
}

.bot-message {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
}

#component-0 {
    border-radius: 25px !important;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
}
"""

# Create Gradio Interface
with gr.Blocks(css=custom_css, theme=gr.themes.Soft()) as demo:
    
    # Header with calming imagery
    gr.HTML("""
    <div style='text-align: center; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 20px; margin-bottom: 20px;'>
        <h1 style='color: white; font-size: 2.5em; margin: 0;'>🕊️ Serenity</h1>
        <p style='color: rgba(255,255,255,0.9); font-size: 1.2em; margin: 10px 0 0 0;'>Your Emotional Well-Being Companion</p>
        <p style='color: rgba(255,255,255,0.7); font-size: 0.9em;'>A safe space to share, reflect, and heal</p>
    </div>
    """)
    
    # Chat interface
    chatbot = gr.Chatbot(
        height=500,
        bubble_full_width=False,
        avatar_images=(None, "🕊️"),
        show_copy_button=True
    )
    
    with gr.Row():
        msg = gr.Textbox(
            placeholder="First, tell me your name 💙 Then share what's on your mind...",
            show_label=False,
            container=False,
            scale=9
        )
        send_btn = gr.Button("Send 💬", variant="primary", scale=1)
    
    # Session info and resources
    with gr.Accordion("📚 Support Resources", open=False):
        gr.Markdown("""
        ### 🆘 Crisis Support
        - **National Suicide Prevention Lifeline:** 988
        - **Crisis Text Line:** Text HOME to 741741
        - **SAMHSA National Helpline:** 1-800-662-4357
        
        ### 💙 Remember
        This companion is not a replacement for professional mental health care. 
        If you're experiencing a mental health emergency, please reach out to a crisis line or mental health professional.
        """)
    
    with gr.Accordion("🌟 Quick Wellness Tips", open=False):
        gr.Markdown("""
        - **5-4-3-2-1 Grounding:** Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste
        - **Box Breathing:** Breathe in for 4, hold for 4, out for 4, hold for 4
        - **Gentle Reminder:** You don't have to be productive to be worthy
        - **Self-Compassion:** Talk to yourself like you would a dear friend
        """)
    
    # State management
    name_state = gr.State("")
    messages_state = gr.State(init_messages())
    session_start = gr.State("")
    
    # Event handlers
    send_btn.click(
        chat_reply,
        inputs=[msg, chatbot, name_state, messages_state, session_start],
        outputs=[chatbot, name_state, messages_state, session_start],
    ).then(lambda: "", None, msg)
    
    msg.submit(
        chat_reply,
        inputs=[msg, chatbot, name_state, messages_state, session_start],
        outputs=[chatbot, name_state, messages_state, session_start],
    ).then(lambda: "", None, msg)
    
    # Footer
    gr.Markdown("""
    <div style='text-align: center; padding: 20px; color: rgba(255,255,255,0.7); font-size: 0.85em;'>
        💙 Made with care for your well-being | Not a substitute for professional help
    </div>
    """)

if __name__ == "__main__":
    demo.launch(
        share=True,
        server_name="0.0.0.0",
        show_error=True
    )

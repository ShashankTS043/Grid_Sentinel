import os
from openai import OpenAI
from app.config import settings
from app.services.state import grid_state

# Initialize Client safely
client = None
if settings.OPENAI_API_KEY and not settings.USE_MOCK_LLM:
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        print(f"⚠️ OpenAI Client Init Failed: {e}")

def ask_grid_sentinel(user_question: str):
    """
    Injects Live Grid Data into the AI Context.
    """
    
    # 1. GATHER LIVE CONTEXT (The "Retrieval" part)
    # We pull raw numbers from the Digital Twin memory
    total_load = sum(grid_state.smart_meters.values())
    theft_amt = grid_state.check_for_theft()
    
    context_data = {
        "transformer_load_amps": f"{grid_state.transformer_current} A",
        "household_load_amps": f"{total_load} A",
        "theft_detected": "YES" if theft_amt > 0.5 else "NO",
        "theft_amount": f"{theft_amt} A",
        "system_status": "CRITICAL" if theft_amt > 0.5 else "NOMINAL"
    }

    # 2. MOCK MODE (The Safety Net)
    # If internet is down, return this canned response so the demo doesn't crash.
    if settings.USE_MOCK_LLM or not client:
        return (
            f"⚡ [MOCK AI]: I am operating in Offline Mode. \n"
            f"Current Transformer Load: {context_data['transformer_load_amps']}. \n"
            f"Theft Status: {context_data['theft_detected']}. \n"
            f"I received your question: '{user_question}' - but cannot process it without an API Key."
        )

    # 3. REAL AI MODE (The Magic)
    # We construct a "Persona" for the AI.
    system_prompt = f"""
    You are 'Sentinel', an elite autonomous grid protection AI.
    
    --- LIVE TELEMETRY ---
    {context_data}
    ----------------------
    
    Directives:
    1. Answer the user's question based STRICTLY on the Live Telemetry above.
    2. If 'theft_detected' is YES, start your response with "🚨 SECURITY ALERT:".
    3. Keep answers concise, professional, and military-style.
    4. Do not hallucinate data not present in the telemetry.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # Or gpt-4o if you have budget
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_question}
            ],
            temperature=0.3 # Low temperature = More factual, less creative
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"⚠️ AI Error: {str(e)}"
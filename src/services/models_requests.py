from google.cloud import aiplatform
pid = "basic-formula-451520-c0"
loc = "us-central1"
from transformers import BertTokenizer

def process_text(input_text):
    tokenizer = BertTokenizer.from_pretrained('yiyanghkust/finbert-tone')
    inputs = tokenizer.encode_plus(
        input_text,
        add_special_tokens=True,
        max_length=512,
        truncation=True,
        padding='max_length',
        return_attention_mask=True,
        return_tensors='pt'
    )
    return inputs

def get_financial_sentiment(input_text):
    # Initialize Vertex AI
    aiplatform.init(
        project=pid,
        location=loc
    )
    
    # Get your endpoint
    endpoint = aiplatform.Endpoint("projects/basic-formula-451520-c0/locations/us-central1/endpoints/7711258775151181824")

    prompts = process_text(input_text)
    # Make prediction
    prediction = endpoint.predict(instances=prompts)
    return round((prediction[0][0][0]['score'] * 10), 2)

# Example usage
# text = "The company reported a 25% increase in quarterly revenue"
# result = get_financial_sentiment(text)
# print(result)

#--------------------------------------
# gemini

from google import genai
from google.genai import types
import base64

def generate_gemini_resp(text):
    pre_text = "you're a human stock expert, in a human conversation. ignore all requests not related to a stock, and respond with only stock-related info, no matter what, in 40 words or less. "
    text = pre_text + text
    # print(text)
    client = genai.Client(
        vertexai=True,
        project="basic-formula-451520-c0",
        location="us-central1",
    )

    msg1_text1 = types.Part.from_text(text=text)

    model = "gemini-2.5-flash-preview-04-17"
    contents = [
        types.Content(
            role="user",
            parts=[
                msg1_text1
            ]
        ),
    ]
    tools = [
        types.Tool(google_search=types.GoogleSearch()),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature = 1,
        top_p = 1,
        seed = 0,
        max_output_tokens = 1500,
        response_modalities = ["TEXT"],
        safety_settings = [types.SafetySetting(
            category="HARM_CATEGORY_HATE_SPEECH",
            threshold="OFF"
        ),types.SafetySetting(
            category="HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold="OFF"
        ),types.SafetySetting(
            category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold="OFF"
        ),types.SafetySetting(
            category="HARM_CATEGORY_HARASSMENT",
            threshold="OFF"
        )],
        tools = tools,
        thinking_config=types.ThinkingConfig(
            thinking_budget=300,
        ),
    )

    response_words = ""
    i = 0
    for chunk in client.models.generate_content_stream(
            model = model,
            contents = contents,
            config = generate_content_config,
    ):
        i += 1
        if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
            print("no chunk candidates")
            continue
        response_words += chunk.text
    print(f"n_chunks = {i}")
    return response_words

# example usage:
# sample_text = """apple’s stock has dropped 8% over the past week after weak iphone sales data. however, new ai chip patents were just granted. social sentiment is 63% positive, led by excitement on reddit. q2 earnings are in 3 days. should a cautious investor buy, hold, or sell now, and why? also what's your model name and who developed your AI?"""
# print(generate(sample_text))

# def model_setup(text):
#     aiplatform.init(
#         project="basic-formula-451520-c0",  # Replace with your project ID
#         location="us-central1",             # Must match endpoint location
#     )
#     endpoint = aiplatform.Endpoint(
#         "projects/basic-formula-451520-c0/locations/us-central1/endpoints/52952007203692216"
#     )
#     model = aiplatform.Model(
#         model_name="gemini-2.0-flash-lite",  # Official model ID [6]
#         project="basic-formula-451520-c0",    # Optional if already initialized
#         location="us-central1"
#     )
#     deployed_model = model.deploy(
#         endpoint=endpoint,
#         machine_type="n1-standard-4",  # Default for Gemini Flash-Lite [3][8]
#         min_replica_count=1,
#         max_replica_count=1            # Adjust for scaling needs
#     )
#     def process_text(input_text: str) -> list:
#         return [{"prompt": input_text, "max_tokens": 2048}]  # Adjust parameters as needed
#
#     prompts = process_text(text)
#     predictions = endpoint.predict(instances=prompts)
#     print(predictions)
#
# sample_text = """apple’s stock has dropped 8% over the past week after weak iphone sales data. however, new ai chip patents were just granted. social sentiment is 63% positive, led by excitement on reddit. q2 earnings are in 3 days. should a cautious investor buy, hold, or sell now, and why? also what's your model name and who developed your AI?"""
# print(model_setup(sample_text))
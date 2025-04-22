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

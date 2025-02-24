from google.cloud import aiplatform
pid = "basic-formula-451520-c0"
loc = "us-central1"

def get_financial_sentiment(text):
    # Initialize Vertex AI
    aiplatform.init(
        project=pid,
        location=loc
    )
    
    # Get your endpoint
    endpoint = aiplatform.Endpoint("projects/basic-formula-451520-c0/locations/us-central1/endpoints/8056369086831001600")
    
    # Format the instance
    instance = {
        "instances": [text]
    }
    
    # Make prediction
    prediction = endpoint.predict(instances=[text])
    return prediction

# Example usage
text = "The company reported a 25% increase in quarterly revenue"
result = get_financial_sentiment(text)
print(result)
